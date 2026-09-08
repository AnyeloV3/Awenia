import type { CashEntry, Category, Expense, Material, Order, Product, Sale, Supplier, SupplierOffer } from './types'
import { money } from './calculations'

type ExportBundle={products:Product[];sales:Sale[];materials:Material[];expenses:Expense[];orders:Order[];categories:Category[];suppliers:Supplier[];offers:SupplierOffer[];cashEntries?:CashEntry[]}
function u16(n:number){return new Uint8Array([n&255,(n>>>8)&255])}
function u32(n:number){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function concat(parts:Uint8Array[]){const len=parts.reduce((s,p)=>s+p.length,0);const out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out}
const enc=new TextEncoder()
const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})()
function crc32(data:Uint8Array){let c=0xffffffff;for(const b of data)c=crcTable[(c^b)&0xff]^(c>>>8);return (c^0xffffffff)>>>0}
function zip(entries:{name:string,data:string|Uint8Array}[]){const locals:Uint8Array[]=[];const centrals:Uint8Array[]=[];let offset=0;for(const e of entries){const name=enc.encode(e.name),data=typeof e.data==='string'?enc.encode(e.data):e.data,crc=crc32(data);const local=concat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);locals.push(local);const central=concat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);centrals.push(central);offset+=local.length}const cb=concat(centrals),lb=concat(locals),end=concat([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(cb.length),u32(lb.length),u16(0)]);return new Blob([lb,cb,end],{type:'application/zip'})}
async function download(blob:Blob,name:string){
  // En Tauri usa el diálogo nativo para que Word/PDF/Excel funcionen como app instalada.
  // En el navegador conserva el comportamiento de descarga original.
  if(typeof window!=='undefined' && (window as any).__TAURI_INTERNALS__){
    try{
      const [{save},{writeFile}]=await Promise.all([import('@tauri-apps/plugin-dialog'),import('@tauri-apps/plugin-fs')])
      const path=await save({defaultPath:name})
      if(!path)return
      const bytes=new Uint8Array(await blob.arrayBuffer())
      await writeFile(path,bytes)
      return
    }catch(error){
      console.warn('No se pudo usar el guardado nativo; se usará la descarga web.',error)
    }
  }
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
const esc=(s:any)=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m] as string))
const revenue=(d:ExportBundle)=>d.sales.reduce((a,s)=>a+s.total,0)
const profit=(d:ExportBundle)=>d.sales.reduce((a,s)=>a+s.totalBusinessProfit,0)
const pocket=(d:ExportBundle)=>d.sales.reduce((a,s)=>a+s.totalPocketMoney,0)
const cashBalance=(d:ExportBundle)=>(d.cashEntries||[]).reduce((a,x)=>a+(x.kind==='income'||x.kind==='reserve'?x.amount:-x.amount),0)

function wordCell(value:any,header=false){return `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:shd w:fill="${header?'EDE3F1':'FFFDFB'}"/><w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:r>${header?'<w:rPr><w:b/><w:color w:val="6F5275"/></w:rPr>':''}<w:t>${esc(value)}</w:t></w:r></w:p></w:tc>`}
function wordTable(rows:any[][]){return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="E4D7E6"/><w:left w:val="single" w:sz="4" w:color="E4D7E6"/><w:bottom w:val="single" w:sz="4" w:color="E4D7E6"/><w:right w:val="single" w:sz="4" w:color="E4D7E6"/><w:insideH w:val="single" w:sz="3" w:color="EEE5EF"/><w:insideV w:val="single" w:sz="3" w:color="EEE5EF"/></w:tblBorders></w:tblPr>${rows.map((r,i)=>`<w:tr>${r.map(c=>wordCell(c,i===0)).join('')}</w:tr>`).join('')}</w:tbl>`}
function wordHeading(text:string,level=1){const size=level===1?30:24;return `<w:p><w:pPr><w:spacing w:before="${level===1?280:180}" w:after="100"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="7E5B84"/><w:sz w:val="${size}"/></w:rPr><w:t>${esc(text)}</w:t></w:r></w:p>`}
function wordParagraph(text:string){return `<w:p><w:pPr><w:spacing w:after="90"/></w:pPr><w:r><w:rPr><w:color w:val="665B68"/></w:rPr><w:t>${esc(text)}</w:t></w:r></w:p>`}
export function exportWord(d:ExportBundle){
  const generated=new Date().toLocaleString('es-CR')
  const sections:string[]=[]
  sections.push(`<w:p><w:pPr><w:spacing w:after="80"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="7E5B84"/><w:sz w:val="42"/></w:rPr><w:t>AWENIA</w:t></w:r></w:p>`)
  sections.push(`<w:p><w:r><w:rPr><w:b/><w:sz w:val="30"/></w:rPr><w:t>Reporte administrativo del emprendimiento</w:t></w:r></w:p>`)
  sections.push(wordParagraph(`Generado: ${generated}. Moneda: CRC — colones costarricenses.`))
  sections.push(wordHeading('Resumen ejecutivo'))
  sections.push(wordTable([
    ['Indicador','Resultado'],['Productos registrados',d.products.length],['Ventas registradas',d.sales.length],['Ingresos por ventas',money(revenue(d))],['Ganancia del negocio',money(profit(d))],['Dinero al bolsillo',money(pocket(d))],['Caja de materiales',money(cashBalance(d))],['Gastos adicionales',money(d.expenses.reduce((a,e)=>a+e.amount,0))],['Materiales registrados',d.materials.length],['Pedidos',d.orders.length]
  ]))
  sections.push(wordHeading('Productos'))
  sections.push(wordTable([['Producto','Categoría','Código','Peso','Costo real','Precio','Ganancia/u.','Bolsillo/u.','Stock'],...d.products.map(p=>[p.name,p.categoryName,p.code,`${p.weight||0} g`,money(p.pricing.realCost),money(p.salePrice),money(p.pricing.businessNetProfit),money(p.pricing.pocketMoney),p.stock])]))
  sections.push(wordHeading('Ventas'))
  sections.push(wordTable([['Fecha','Producto','Cant.','Precio/u.','Total','Costo total','Ganancia','Bolsillo','Cliente'],...d.sales.map(x=>[x.date,x.productName,x.quantity,money(x.unitPrice),money(x.total),money(x.totalRealCost),money(x.totalBusinessProfit),money(x.totalPocketMoney),x.customer||'—'])]))
  sections.push(wordHeading('Materiales e inventario'))
  sections.push(wordTable([['Material','Tipo','Compra','Presentación','Costo unitario','Stock','Mínimo'],...d.materials.map(m=>[m.name,m.type,money(m.purchasePrice),`${m.purchaseQuantity} ${m.unit}`,`${money(m.purchaseQuantity?m.purchasePrice/m.purchaseQuantity:0)}/${m.unit}`,`${m.stock} ${m.unit}`,`${m.minStock} ${m.unit}`])]))
  if((d.cashEntries||[]).length){sections.push(wordHeading('Caja para materiales'));sections.push(wordTable([['Fecha','Movimiento','Concepto','Monto','Proveedor / producto'],...(d.cashEntries||[]).map(e=>[e.date,e.kind==='income'?'Entrada':e.kind==='withdrawal'?'Retiro':e.kind==='purchase'?'Compra':'Reserva',e.concept,money(e.amount),e.supplierName||e.productName||'—'])]));const purchases=(d.cashEntries||[]).filter(e=>e.kind==='purchase'&&e.items?.length);if(purchases.length){sections.push(wordHeading('Desglose de compras de materiales',2));purchases.forEach(p=>{sections.push(wordParagraph(`${p.date} · ${p.supplierName||'Proveedor no indicado'} · ${p.concept}`));sections.push(wordTable([['Material','Cantidad','Costo unitario','Total'],...(p.items||[]).map(i=>[i.name,`${i.quantity} ${i.unit}`,`${money(i.unitPrice)}/${i.unit}`,money(i.total)])]))})}}
  sections.push(wordHeading('Gastos'))
  sections.push(wordTable([['Fecha','Concepto','Producto','Monto','Notas'],...d.expenses.map(e=>[e.date,e.concept,e.productName||'General',money(e.amount),e.notes||'—'])]))
  sections.push(wordHeading('Pedidos'))
  sections.push(wordTable([['Cliente','Producto','Cantidad','Total','Adelanto','Saldo','Entrega','Estado'],...d.orders.map(o=>[o.customer,o.productName,o.quantity,money(o.total),money(o.deposit),money(o.total-o.deposit),o.dueDate||'—',o.status])]))
  if(d.offers.length){sections.push(wordHeading('Comparación de proveedores'));sections.push(wordTable([['Proveedor','Material','Presentación','Precio','Costo equivalente','Disponibilidad','Verificado'],...d.offers.map(o=>[o.supplierName,o.materialName,`${o.presentationQuantity} ${o.unit}`,money(o.price),`${money(o.presentationQuantity?o.price/o.presentationQuantity:0)}/${o.unit}`,o.availability,o.verifiedAt])]))}
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${sections.join('')}<w:sectPr><w:pgMar w:top="850" w:right="700" w:bottom="850" w:left="700"/></w:sectPr></w:body></w:document>`
  const blob=zip([{name:'[Content_Types].xml',data:`<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`},{name:'_rels/.rels',data:`<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`},{name:'word/document.xml',data:doc}]);download(new Blob([blob],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),`Awenia_reporte_${new Date().toISOString().slice(0,10)}.docx`)
}

function cell(v:any){if(typeof v==='number')return `<c><v>${Number.isFinite(v)?v:0}</v></c>`;return `<c t="inlineStr"><is><t>${esc(v)}</t></is></c>`}
function sheetXml(rows:any[][]){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((r,i)=>`<row r="${i+1}">${r.map(cell).join('')}</row>`).join('')}</sheetData></worksheet>`}
export function exportExcel(d:ExportBundle){
  const sheets=[
    ['Resumen',[['Awenia — Resumen'],['Productos',d.products.length],['Ventas',d.sales.length],['Ingresos',revenue(d)],['Ganancia negocio',profit(d)],['Dinero al bolsillo',pocket(d)],['Caja materiales',cashBalance(d)],['Gastos manuales',d.expenses.reduce((a,e)=>a+e.amount,0)]]],
    ['Productos',[['Producto','Categoría','Código','Peso g','Costo real','Precio','Ganancia negocio/u.','Dinero bolsillo/u.','Stock'],...d.products.map(p=>[p.name,p.categoryName,p.code,p.weight,p.pricing.realCost,p.salePrice,p.pricing.businessNetProfit,p.pricing.pocketMoney,p.stock])]],
    ['Ventas',[['Fecha','Producto','Cantidad','Precio unitario','Total','Costo real total','Ganancia negocio','Dinero al bolsillo','Cliente'],...d.sales.map(s=>[s.date,s.productName,s.quantity,s.unitPrice,s.total,s.totalRealCost,s.totalBusinessProfit,s.totalPocketMoney,s.customer||''])]],
    ['Caja',[['Fecha','Tipo','Concepto','Monto','Proveedor','Producto'],...(d.cashEntries||[]).map(c=>[c.date,c.kind,c.concept,c.amount,c.supplierName||'',c.productName||''])]],
    ['Compras detalle',[['Fecha','Proveedor','Material','Cantidad','Unidad','Costo unitario','Total'],...(d.cashEntries||[]).flatMap(c=>(c.items||[]).map(i=>[c.date,c.supplierName||'',i.name,i.quantity,i.unit,i.unitPrice,i.total]))]],
    ['Materiales',[['Material','Tipo','Precio compra','Cantidad compra','Unidad','Stock','Stock mínimo'],...d.materials.map(m=>[m.name,m.type,m.purchasePrice,m.purchaseQuantity,m.unit,m.stock,m.minStock])]],
    ['Gastos',[['Fecha','Concepto','Producto','Monto','Notas'],...d.expenses.map(e=>[e.date,e.concept,e.productName||'General',e.amount,e.notes||''])]],
    ['Pedidos',[['Cliente','Producto','Cantidad','Total','Adelanto','Saldo','Entrega','Estado'],...d.orders.map(o=>[o.customer,o.productName,o.quantity,o.total,o.deposit,o.total-o.deposit,o.dueDate||'',o.status])]],
    ['Proveedores',[['Proveedor','Material','Presentación','Unidad','Precio','Costo equivalente','Disponibilidad','Verificado'],...d.offers.map(o=>[o.supplierName,o.materialName,o.presentationQuantity,o.unit,o.price,o.presentationQuantity?o.price/o.presentationQuantity:0,o.availability,o.verifiedAt])]],
  ] as [string,any[][]][]
  const types=['<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',...sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`),'</Types>'].join('')
  const workbook=`<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s,i)=>`<sheet name="${esc(s[0])}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`
  const rels=`<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}</Relationships>`
  const entries:any[]=[{name:'[Content_Types].xml',data:types},{name:'_rels/.rels',data:`<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`},{name:'xl/workbook.xml',data:workbook},{name:'xl/_rels/workbook.xml.rels',data:rels}];sheets.forEach((s,i)=>entries.push({name:`xl/worksheets/sheet${i+1}.xml`,data:sheetXml(s[1])}));const blob=zip(entries);download(new Blob([blob],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'Awenia_datos.xlsx')
}
function pdfSafe(v:any){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/₡/g,'CRC ').replace(/[()\\]/g,m=>'\\'+m).replace(/[^\x20-\x7E]/g,'')}
function pdfReportSections(d:ExportBundle){return [
  {title:'RESUMEN EJECUTIVO',widths:[190,300],rows:[['Indicador','Resultado'],['Productos registrados',String(d.products.length)],['Ventas registradas',String(d.sales.length)],['Ingresos',money(revenue(d))],['Ganancia del negocio',money(profit(d))],['Dinero al bolsillo',money(pocket(d))],['Caja de materiales',money(cashBalance(d))],['Gastos adicionales',money(d.expenses.reduce((a,e)=>a+e.amount,0))]]},
  {title:'PRODUCTOS',widths:[140,80,75,75,65,55],rows:[['Producto','Categoria','Costo','Precio','Ganancia','Stock'],...d.products.map(p=>[p.name,p.categoryName,money(p.pricing.realCost),money(p.salePrice),money(p.pricing.businessNetProfit),String(p.stock)])]},
  {title:'VENTAS',widths:[68,120,38,72,78,75],rows:[['Fecha','Producto','Cant.','Total','Ganancia','Cliente'],...d.sales.map(x=>[x.date,x.productName,String(x.quantity),money(x.total),money(x.totalBusinessProfit),x.customer||'-'])]},
  {title:'CAJA',widths:[70,95,130,75,125],rows:[['Fecha','Movimiento','Concepto','Monto','Proveedor / producto'],...(d.cashEntries||[]).map(e=>[e.date,e.kind==='income'?'Entrada':e.kind==='withdrawal'?'Retiro':e.kind==='purchase'?'Compra':'Reserva',e.concept,money(e.amount),e.supplierName||e.productName||'-'])]},
  {title:'MATERIALES',widths:[135,78,85,70,65,55],rows:[['Material','Tipo','Compra','Costo/u.','Stock','Min.'],...d.materials.map(m=>[m.name,m.type,money(m.purchasePrice),money(m.purchaseQuantity?m.purchasePrice/m.purchaseQuantity:0),`${m.stock} ${m.unit}`,`${m.minStock} ${m.unit}`])]},
  {title:'GASTOS',widths:[70,140,105,75,95],rows:[['Fecha','Concepto','Producto','Monto','Notas'],...d.expenses.map(e=>[e.date,e.concept,e.productName||'General',money(e.amount),e.notes||'-'])]},
  {title:'PEDIDOS',widths:[95,120,45,75,75,70],rows:[['Cliente','Producto','Cant.','Total','Saldo','Estado'],...d.orders.map(o=>[o.customer,o.productName,String(o.quantity),money(o.total),money(o.total-o.deposit),o.status])]},
]}
export function exportPdf(d:ExportBundle){
  const pageW=612,pageH=792,left=42,right=42,top=55,bottom=45;let pages:string[]=[];let content='';let y=pageH-top;let pageNo=1
  const text=(x:number,yy:number,value:any,size=9,bold=false)=>{content+=`BT /${bold?'F2':'F1'} ${size} Tf ${x} ${yy} Td (${pdfSafe(value)}) Tj ET\n`}
  const line=(x1:number,y1:number,x2:number,y2:number)=>{content+=`0.86 0.82 0.87 RG 0.6 w ${x1} ${y1} m ${x2} ${y2} l S\n`}
  const fill=(x:number,yy:number,w:number,h:number,r=.95,g=.92,b=.96)=>{content+=`${r} ${g} ${b} rg ${x} ${yy} ${w} ${h} re f\n`}
  const footer=()=>{line(left,32,pageW-right,32);text(left,18,'Awenia - administracion local',8);text(pageW-right-55,18,`Pagina ${pageNo}`,8)}
  const newPage=()=>{if(content){footer();pages.push(content);pageNo++}content='';y=pageH-top;text(left,y,'AWENIA',16,true);text(left+75,y,'Reporte administrativo',12,true);text(pageW-right-155,y,`Generado ${new Date().toLocaleDateString('es-CR')}`,8);y-=28;line(left,y,pageW-right,y);y-=18}
  newPage()
  for(const sec of pdfReportSections(d)){
    if(y<120)newPage();text(left,y,sec.title,11,true);y-=16
    const widths=sec.widths;const rowH=22
    for(let ri=0;ri<sec.rows.length;ri++){
      if(y-rowH<bottom){newPage();text(left,y,sec.title+' (continuacion)',10,true);y-=16;ri--;continue}
      const row=sec.rows[ri];if(ri===0)fill(left,y-rowH+4,pageW-left-right,rowH,.94,.90,.95)
      let x=left;line(left,y-rowH+4,pageW-right,y-rowH+4)
      for(let ci=0;ci<row.length;ci++){const w=widths[ci]||70;const raw=pdfSafe(row[ci]);const max=Math.max(4,Math.floor((w-8)/5.2));const clipped=raw.length>max?raw.slice(0,max-1)+'.':raw;text(x+4,y-11,clipped,ri===0?7.5:7,ri===0);line(x,y+4,x,y-rowH+4);x+=w}line(pageW-right,y+4,pageW-right,y-rowH+4);y-=rowH
    }
    y-=18
  }
  footer();pages.push(content)
  const objects:string[]=[];objects.push('<< /Type /Catalog /Pages 2 0 R >>');const pageIds=pages.map((_,i)=>3+i*2);objects.push(`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count ${pages.length} >>`)
  pages.forEach((c,i)=>{const pageId=3+i*2,contentId=4+i*2;objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 ${3+pages.length*2} 0 R /F2 ${4+pages.length*2} 0 R >> >> /Contents ${contentId} 0 R >>`);objects.push(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`)})
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((obj,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let i=1;i<=objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';pdf+=`trailer<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;download(new Blob([pdf],{type:'application/pdf'}),`Awenia_reporte_${new Date().toISOString().slice(0,10)}.pdf`)
}
