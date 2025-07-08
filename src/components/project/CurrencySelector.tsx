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
  return (
    <>
      <Select 
        value={selectedCurrency}
        onChange={onCurrencyChange}
        placeholder="选择币种"
        style={{ width: '100%' }}
      >
        {exchangeRates.map(rate => (
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