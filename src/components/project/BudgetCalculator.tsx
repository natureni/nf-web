import React from 'react'
import { ExchangeRate } from '../../types/project'
import { isFixedRateMode, getRateModeDescription } from '../../utils/exchangeRates'

interface BudgetCalculatorProps {
  budgetConfig: {
    birdViewPrice: number
    humanViewPrice: number
    animationPrice: number
    birdViewDiscount: number
    humanViewDiscount: number
    animationDiscount: number
    currency: string
  }
  imageQuantity: {
    birdViewCount: number
    humanViewCount: number
    animationDuration: number
  }
  exchangeRates: ExchangeRate[]
}

const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  budgetConfig,
  imageQuantity,
  exchangeRates
}) => {
  const calculateBudgetDetails = () => {
    const currencySymbol = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'
    const exchangeRate = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.rate || 1
    
    const birdViewOriginal = imageQuantity.birdViewCount * budgetConfig.birdViewPrice * budgetConfig.birdViewDiscount / 100
    const humanViewOriginal = imageQuantity.humanViewCount * budgetConfig.humanViewPrice * budgetConfig.humanViewDiscount / 100
    const animationOriginal = imageQuantity.animationDuration * budgetConfig.animationPrice * budgetConfig.animationDiscount / 100
    const totalOriginal = birdViewOriginal + humanViewOriginal + animationOriginal
    const totalCNY = totalOriginal * exchangeRate
    
    return {
      currencySymbol,
      exchangeRate,
      birdViewOriginal,
      humanViewOriginal,
      animationOriginal,
      totalOriginal,
      totalCNY
    }
  }

  const budgetDetails = calculateBudgetDetails()
  const rateMode = getRateModeDescription()
  const isFixed = isFixedRateMode()

  // 如果没有图量设置，不显示计算结果
  if (imageQuantity.birdViewCount === 0 && imageQuantity.humanViewCount === 0 && imageQuantity.animationDuration === 0) {
    return null
  }

  return (
    <div style={{ 
      background: '#f6ffed',
      border: '1px solid #b7eb8f',
      borderRadius: '6px',
      padding: '12px',
      marginTop: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 8 
      }}>
        <div style={{ fontWeight: 500, color: '#52c41a' }}>预算计算明细：</div>
        <div style={{ 
          fontSize: '11px', 
          color: isFixed ? '#fa8c16' : '#1890ff',
          background: isFixed ? '#fff7e6' : '#e6f7ff',
          padding: '2px 6px',
          borderRadius: '3px',
          border: `1px solid ${isFixed ? '#ffd591' : '#91d5ff'}`
        }}>
          {rateMode}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, minWidth: '200px' }}>
          鸟瞰图: {imageQuantity.birdViewCount} × {budgetDetails.currencySymbol}{budgetConfig.birdViewPrice} × {budgetConfig.birdViewDiscount}% = 
          <span style={{ fontWeight: 500 }}> {budgetDetails.currencySymbol}{budgetDetails.birdViewOriginal.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 12, minWidth: '200px' }}>
          人视角: {imageQuantity.humanViewCount} × {budgetDetails.currencySymbol}{budgetConfig.humanViewPrice} × {budgetConfig.humanViewDiscount}% = 
          <span style={{ fontWeight: 500 }}> {budgetDetails.currencySymbol}{budgetDetails.humanViewOriginal.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 12, minWidth: '200px' }}>
          动画: {imageQuantity.animationDuration}秒 × {budgetDetails.currencySymbol}{budgetConfig.animationPrice} × {budgetConfig.animationDiscount}% = 
          <span style={{ fontWeight: 500 }}> {budgetDetails.currencySymbol}{budgetDetails.animationOriginal.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, padding: '8px', background: 'white', borderRadius: '4px' }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>
          小计 ({budgetConfig.currency}): <span style={{ color: '#1890ff' }}>{budgetDetails.currencySymbol}{budgetDetails.totalOriginal.toLocaleString()}</span>
        </div>
        {budgetConfig.currency !== 'CNY' && (
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
            按{rateMode}汇率 {budgetDetails.exchangeRate} 转换为人民币: <span style={{ fontWeight: 500, color: '#52c41a' }}>¥{budgetDetails.totalCNY.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetCalculator 