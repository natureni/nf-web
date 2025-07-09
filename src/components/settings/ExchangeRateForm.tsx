import React from 'react'
import { Form, InputNumber, Row, Col, Divider, Space, Alert } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { ExchangeRate } from '../../types/project'

interface ExchangeRateFormProps {
  form: any
  exchangeRates: ExchangeRate[]
}

const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({
  form,
  exchangeRates
}) => {
  // 按地区分组货币
  const mainCurrencies = exchangeRates.filter(rate => 
    ['USD', 'AUD', 'EUR', 'GBP', 'CAD', 'NZD'].includes(rate.currencyCode)
  )

  const middleEastCurrencies = exchangeRates.filter(rate => 
    ['AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'TRY'].includes(rate.currencyCode)
  )

  const asianCurrencies = exchangeRates.filter(rate => 
    ['JPY', 'KRW', 'SGD', 'HKD', 'TWD'].includes(rate.currencyCode)
  )

  const renderCurrencyInputs = (currencies: ExchangeRate[]) => (
    <Row gutter={16}>
      {currencies.map(rate => (
        <Col span={8} key={rate.currencyCode}>
          <Form.Item
            label={
              <Space>
                <span>{rate.flag}</span>
                <span>{rate.currency} ({rate.currencyCode})</span>
              </Space>
            }
            name={rate.currencyCode}
            rules={[
              { required: true, message: '请输入汇率' },
              { type: 'number', min: 0.0001, message: '汇率必须大于0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`1 ${rate.currencySymbol} = ? ¥`}
              precision={4}
              min={0.0001}
              max={999}
              step={0.01}
              addonBefore={rate.currencySymbol}
              addonAfter="¥"
            />
          </Form.Item>
        </Col>
      ))}
    </Row>
  )

  return (
    <>
      <Alert
        message="汇率说明"
        description="当前汇率均相对于人民币(CNY)。修改汇率后请点击保存。系统支持自动同步最新汇率。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        {/* 主要货币 */}
        <Divider orientation="left">
          <GlobalOutlined /> 主要货币
        </Divider>
        {renderCurrencyInputs(mainCurrencies)}

        {/* 中东地区货币 */}
        <Divider orientation="left" style={{ marginTop: 32 }}>
          🏜️ 中东地区货币
        </Divider>
        {renderCurrencyInputs(middleEastCurrencies)}

        {/* 亚洲货币 */}
        <Divider orientation="left" style={{ marginTop: 32 }}>
          🌏 亚洲货币
        </Divider>
        {renderCurrencyInputs(asianCurrencies)}
      </Form>
    </>
  )
}

export default ExchangeRateForm 