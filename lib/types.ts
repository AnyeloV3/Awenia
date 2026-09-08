export type ID = string

export type CommissionType = 'percent' | 'fixed' | 'none'

export interface Settings {
  id: 'settings'
  ownerName: string
  businessName: string
  hourlyRate: number
  targetProfitRate: number
  indirectRate: number
  commissionType: CommissionType
  commissionValue: number
  rounding: number
}

export interface Category {
  id: ID
  name: string
  description?: string
  color?: string
  createdAt: string
}

export interface Material {
  id: ID
  name: string
  type: string
  purchasePrice: number
  purchaseQuantity: number
  unit: string
  stock: number
  minStock: number
  notes?: string
  createdAt: string
}

export interface ProductMaterialInput {
  id: ID
  materialId?: ID
  name: string
  purchasePrice: number
  purchaseQuantity: number
  usedQuantity: number
  unit: string
}

export interface PricingSnapshot {
  materialsCost: number
  laborCost: number
  directSubtotal: number
  indirectCost: number
  realCost: number
  targetProfit: number
  beforeCommission: number
  commissionCost: number
  mathematicalPrice: number
  suggestedPrice: number
  salePrice: number
  grossProfit: number
  businessNetProfit: number
  pocketMoney: number
  effectiveMargin: number
}

export interface Product {
  id: ID
  name: string
  categoryId: ID
  categoryName: string
  code: string
  weight: number
  hours: number
  minutes: number
  materials: ProductMaterialInput[]
  hourlyRate: number
  targetProfitRate: number
  indirectRate: number
  commissionType: CommissionType
  commissionValue: number
  rounding: number
  salePrice: number
  stock: number
  status: 'Disponible' | 'Sin stock' | 'Oculto' | 'Descontinuado'
  pricing: PricingSnapshot
  notes?: string
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Sale {
  id: ID
  productId: ID
  productName: string
  categoryName: string
  quantity: number
  unitPrice: number
  total: number
  customer?: string
  date: string
  notes?: string
  pricing: PricingSnapshot
  unitRealCost: number
  totalRealCost: number
  totalBusinessProfit: number
  totalPocketMoney: number
}

export interface CashLineItem {
  id: ID
  materialId?: ID
  name: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface CashEntry {
  id: ID
  kind: 'income' | 'withdrawal' | 'purchase' | 'reserve'
  amount: number
  date: string
  concept: string
  notes?: string
  supplierName?: string
  productId?: ID
  productName?: string
  sourceSaleId?: ID
  items?: CashLineItem[]
}

export interface Expense {
  id: ID
  productId?: ID
  productName?: string
  concept: string
  amount: number
  date: string
  notes?: string
}

export interface Supplier {
  id: ID
  name: string
  location?: string
  phone?: string
  social?: string
  notes?: string
  createdAt: string
}

export interface SupplierOffer {
  id: ID
  supplierId: ID
  supplierName: string
  materialName: string
  presentationQuantity: number
  unit: string
  price: number
  availability: 'Disponible' | 'Stock bajo' | 'Agotado' | 'No confirmado'
  verifiedAt: string
  notes?: string
}

export interface Task {
  id: ID
  title: string
  description?: string
  status: 'Pendiente' | 'En progreso' | 'Listo' | 'Cancelado'
  priority: 'Alta' | 'Media' | 'Baja'
  category: string
  date?: string
  createdAt: string
}

export interface Note {
  id: ID
  title: string
  content: string
  tags: string[]
  pinned: boolean
  createdAt: string
}

export interface Order {
  id: ID
  customer: string
  productName: string
  quantity: number
  total: number
  deposit: number
  dueDate?: string
  status: 'Pendiente' | 'Confirmado' | 'En producción' | 'Listo' | 'Entregado' | 'Cancelado'
  notes?: string
  createdAt: string
}
