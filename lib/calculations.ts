import type { CommissionType, PricingSnapshot, ProductMaterialInput } from './types'

export const money = (n: number) => `₡${Math.round(n || 0).toLocaleString('es-CR')}`
export const decimalMoney = (n: number) => `₡${(n || 0).toLocaleString('es-CR', { maximumFractionDigits: 2 })}`
export const pct = (n: number) => `${((n || 0) * 100).toLocaleString('es-CR', { maximumFractionDigits: 1 })}%`

export function materialUsedCost(m: ProductMaterialInput) {
  if (!m.purchasePrice || !m.purchaseQuantity || !m.usedQuantity) return 0
  return (m.purchasePrice / m.purchaseQuantity) * m.usedQuantity
}

export function calculatePricing(args: {
  materials: ProductMaterialInput[]
  hours: number
  minutes?: number
  hourlyRate: number
  indirectRate: number
  targetProfitRate: number
  commissionType: CommissionType
  commissionValue: number
  rounding: number
  salePrice?: number
}): PricingSnapshot {
  const totalHours = Math.max(0, (args.hours || 0) + (args.minutes || 0) / 60)
  const materialsCost = args.materials.reduce((sum, m) => sum + materialUsedCost(m), 0)
  const laborCost = totalHours * Math.max(0, args.hourlyRate || 0)
  const directSubtotal = materialsCost + laborCost
  const indirectCost = directSubtotal * Math.max(0, args.indirectRate || 0)
  const realCost = directSubtotal + indirectCost
  const targetProfit = realCost * Math.max(0, args.targetProfitRate || 0)
  const beforeCommission = realCost + targetProfit
  let commissionCost = 0
  if (args.commissionType === 'percent' && args.commissionValue > 0 && args.commissionValue < 1) {
    // Exact same logic as the supplied Excel: B39/(1-rate)-B39
    commissionCost = beforeCommission / (1 - args.commissionValue) - beforeCommission
  } else if (args.commissionType === 'fixed' && args.commissionValue > 0) {
    commissionCost = args.commissionValue
  }
  const mathematicalPrice = beforeCommission + commissionCost
  const rounding = Math.max(1, args.rounding || 1)
  const suggestedPrice = Math.ceil(mathematicalPrice / rounding) * rounding
  const salePrice = Math.max(0, args.salePrice || suggestedPrice)

  // Metrics added by Awenia. They do not alter the original Excel price formula.
  const paymentCommissionAtSale = args.commissionType === 'percent'
    ? salePrice * Math.max(0, args.commissionValue || 0)
    : args.commissionType === 'fixed' ? Math.max(0, args.commissionValue || 0) : 0
  const grossProfit = salePrice - materialsCost - paymentCommissionAtSale
  const businessNetProfit = salePrice - realCost - paymentCommissionAtSale
  // Wendy's pocket = her labor pay + what remains as business profit.
  const pocketMoney = laborCost + businessNetProfit
  const effectiveMargin = salePrice > 0 ? businessNetProfit / salePrice : 0

  return {
    materialsCost, laborCost, directSubtotal, indirectCost, realCost, targetProfit,
    beforeCommission, commissionCost, mathematicalPrice, suggestedPrice, salePrice,
    grossProfit, businessNetProfit, pocketMoney, effectiveMargin,
  }
}
