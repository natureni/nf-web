import React from 'react'
import { Select, Space, Alert } from 'antd'
import { ExchangeRate } from '../../types/project'

const { Option } = Select

interface CurrencySelectorProps {
  selectedCurrency: string
  exchangeRates: ExchangeRate[]
  onCurrencyChange: (value: string) => void
  showAlert?: boolean
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  exchangeRates,
  onCurrencyChange,
  showAlert = true
}) => {
  // 对币种进行排序：美元第一，人民币第二，澳币第三，其他按字母顺序
  const sortedRates = [...exchangeRates].sort((a, b) => {
    const order = ['USD', 'CNY', 'AUD']
    const aIndex = order.indexOf(a.currencyCode)
    const bIndex = order.indexOf(b.currencyCode)
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.currencyCode.localeCompare(b.currencyCode)
  })

  return (
    <>
      <Select 
        value={selectedCurrency}
        onChange={onCurrencyChange}
        placeholder="选择币种"
        style={{ width: '100%' }}
      >
        {sortedRates.map(rate => (
          <Option key={rate.currencyCode} value={rate.currencyCode}>
            <Space>
              <span>{rate.flag}</span>
              <span>{rate.currencySymbol} {rate.currency}</span>
              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                (汇率: {rate.rate})
              </span>
            </Space>
          </Option>
        ))}
      </Select>
      
      {showAlert && selectedCurrency && selectedCurrency !== 'CNY' && (
        <Alert
          message={`当前使用 ${exchangeRates.find(r => r.currencyCode === selectedCurrency)?.currency} 计价，最终预算将按汇率转换为人民币`}
          type="info"
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </>
  )
}

export default CurrencySelector 