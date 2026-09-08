import type { CashEntry, Category, Material, Note, Order, Product, Settings, Supplier, SupplierOffer, Task } from './types'
import { calculatePricing } from './calculations'

const now = '2026-09-07T20:00:00-06:00'
const settings: Settings = { id:'settings', ownerName:'Wendy', businessName:'Awenia', hourlyRate:1500, targetProfitRate:.25, indirectRate:.05, commissionType:'none', commissionValue:0, rounding:500 }
const categories: Category[] = [
  {id:'cat-peluches',name:'Peluches',description:'Amigurumis y muñecos tejidos',color:'rose',createdAt:now},
  {id:'cat-flores',name:'Flores',description:'Ramos y flores tejidas',color:'sage',createdAt:now},
  {id:'cat-accesorios',name:'Accesorios',description:'Llaveros, separadores y accesorios',color:'lav',createdAt:now},
  {id:'cat-bolsos',name:'Bolsos',description:'Bolsos y carteras',color:'gold',createdAt:now},
]
const materials: Material[] = [
  {id:'mat-lana',name:'Lana / hilo principal',type:'Lana',purchasePrice:2600,purchaseQuantity:100,unit:'g',stock:450,minStock:100,notes:'Referencia principal del Excel',createdAt:now},
  {id:'mat-relleno',name:'Relleno',type:'Relleno',purchasePrice:5400,purchaseQuantity:1000,unit:'g',stock:850,minStock:150,createdAt:now},
  {id:'mat-ojos',name:'Ojitos',type:'Accesorio',purchasePrice:250,purchaseQuantity:5,unit:'unidad',stock:24,minStock:6,createdAt:now},
  {id:'mat-broches',name:'Broches',type:'Accesorio',purchasePrice:625,purchaseQuantity:30,unit:'unidad',stock:30,minStock:8,createdAt:now},
  {id:'mat-llavin',name:'Llavín / herraje',type:'Accesorio',purchasePrice:50,purchaseQuantity:1,unit:'unidad',stock:18,minStock:5,createdAt:now},
]

const raw = [
  ['Ramo','cat-flores','Flores',2,0,5000,[['Lana / hilo principal',2600,100,25,'g']]],
  ['Mapache','cat-peluches','Peluches',1,30,4000,[['Lana / hilo principal',2600,100,17,'g'],['Relleno',5400,1000,6,'g']]],
  ['Muñequitos','cat-peluches','Peluches',1,30,4000,[['Lana / hilo principal',2600,100,25,'g'],['Ojitos',250,5,1,'unidad'],['Relleno',5400,1000,7,'g']]],
  ['Gatito Ale','cat-accesorios','Accesorios',1,0,2500,[['Lana / hilo principal',2600,100,9,'g'],['Llavín / herraje',50,1,1,'unidad'],['Ojitos',250,5,1,'unidad'],['Relleno',5400,1000,4,'g']]],
  ['Conejo','cat-peluches','Peluches',3,30,8000,[['Lana / hilo principal',2600,100,25,'g'],['Broches',625,30,2,'unidad'],['Ojitos',250,5,1,'unidad']]],
  ['Gallina separador','cat-accesorios','Accesorios',1,0,2500,[['Lana / hilo principal',2600,100,12,'g'],['Ojitos',250,5,1,'unidad']]],
  ['Separador lazo','cat-accesorios','Accesorios',1,0,2500,[['Lana / hilo principal',2600,100,6,'g']]],
  ['Gancito','cat-accesorios','Accesorios',2,0,5000,[['Lana / hilo principal',2600,100,16,'g'],['Broches',625,30,2,'unidad'],['Ojitos',250,5,1,'unidad']]],
] as const

const products: Product[] = raw.map((r,i) => {
  const mats = r[6].map((m,j)=>({id:`pm-${i}-${j}`,name:m[0] as string,purchasePrice:m[1] as number,purchaseQuantity:m[2] as number,usedQuantity:m[3] as number,unit:m[4] as string}))
  const pricing = calculatePricing({materials:mats,hours:r[3],minutes:r[4],hourlyRate:1500,indirectRate:.05,targetProfitRate:.25,commissionType:'none',commissionValue:0,rounding:500,salePrice:r[5]})
  return {id:`prod-${i+1}`,name:r[0],categoryId:r[1],categoryName:r[2],code:`AW-${String(i+1).padStart(4,'0')}`,weight:mats.filter(x=>x.unit==='g').reduce((s,x)=>s+x.usedQuantity,0),hours:r[3],minutes:r[4],materials:mats,hourlyRate:1500,targetProfitRate:.25,indirectRate:.05,commissionType:'none',commissionValue:0,rounding:500,salePrice:r[5],stock:i%3+1,status:'Disponible',pricing,notes:'Migrado como ejemplo desde la calculadora Excel.',createdAt:now,updatedAt:now}
})

const suppliers: Supplier[] = [
  {id:'sup-zafiro',name:'Pasamanería Zafiro',location:'Heredia',createdAt:now},
  {id:'sup-central',name:'Mercería Central',location:'Heredia',createdAt:now},
  {id:'sup-wen',name:'Lanas Wen',location:'Heredia',createdAt:now},
]
const offers: SupplierOffer[] = [
  {id:'off-1',supplierId:'sup-zafiro',supplierName:'Pasamanería Zafiro',materialName:'Lana gruesa',presentationQuantity:100,unit:'g',price:2500,availability:'Disponible',verifiedAt:'2026-09-01'},
  {id:'off-2',supplierId:'sup-central',supplierName:'Mercería Central',materialName:'Lana gruesa',presentationQuantity:150,unit:'g',price:3300,availability:'Disponible',verifiedAt:'2026-09-02'},
  {id:'off-3',supplierId:'sup-wen',supplierName:'Lanas Wen',materialName:'Lana gruesa',presentationQuantity:100,unit:'g',price:2900,availability:'Agotado',verifiedAt:'2026-08-28'},
]
const tasks: Task[] = [
  {id:'task-1',title:'Comprar lana blanca',status:'Pendiente',priority:'Alta',category:'Compra',date:'2026-09-09',createdAt:now},
  {id:'task-2',title:'Fotografiar nuevos productos',status:'En progreso',priority:'Media',category:'Contenido',date:'2026-09-10',createdAt:now},
]
const notes: Note[] = [
  {id:'note-1',title:'Nuevo diseño de conejo',content:'Probar una versión grande con orejas más largas.',tags:['idea','peluches'],pinned:true,createdAt:now},
]
const orders: Order[] = [
  {id:'ord-1',customer:'María',productName:'Conejo',quantity:1,total:8000,deposit:4000,dueDate:'2026-09-12',status:'En producción',createdAt:now},
]
const cashEntries: CashEntry[] = [
  {id:'cash-1',kind:'income',amount:25000,date:'2026-09-01',concept:'Aporte inicial para materiales',notes:'Fondo base para compras de lana y accesorios.'},
  {id:'cash-2',kind:'purchase',amount:8200,date:'2026-09-03',concept:'Compra de materiales',supplierName:'Pasamanería Zafiro',items:[
    {id:'cash-2-1',materialId:'mat-lana',name:'Lana / hilo principal',quantity:200,unit:'g',unitPrice:25,total:5000},
    {id:'cash-2-2',materialId:'mat-ojos',name:'Ojitos',quantity:10,unit:'unidad',unitPrice:50,total:500},
    {id:'cash-2-3',materialId:'mat-relleno',name:'Relleno',quantity:500,unit:'g',unitPrice:5.4,total:2700},
  ],notes:'Compra registrada como ejemplo.'},
  {id:'cash-3',kind:'reserve',amount:3650,date:'2026-09-05',concept:'Reserva automática para reposición',productName:'Ramo',notes:'Separado para volver a comprar materiales consumidos.'},
]

export const seedData = { settings, categories, materials, products, suppliers, offers, tasks, notes, orders, cashEntries }
