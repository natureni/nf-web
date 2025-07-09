import React from 'react'
import { Form, InputNumber, Row, Col, Divider, Space, Alert } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { ExchangeRate } from '../../types/project'

interface ExchangeRateFormProps {
  form: any
  exchangeRates: ExchangeRate[]
  disabled?: boolean
}

const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({
  form,
  exchangeRates,
  disabled = false
}) => {
  // 获取人民币汇率（基础货币）
  const baseCurrency = exchangeRates.find(rate => rate.currencyCode === 'CNY')
  
  // 按地区分组货币（排除CNY）
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
              disabled={disabled}
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
        description={
          disabled 
            ? "当前为固定汇率模式，实时汇率仅供参考。如需修改，请点击右侧'设置固定汇率'按钮。"
            : "当前汇率均相对于人民币(CNY)。修改汇率后请点击保存。系统支持自动同步最新汇率。"
        }
        type={disabled ? "warning" : "info"}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical">
        {/* 基础货币 - 人民币 */}
        {baseCurrency && (
          <>
            <Divider orientation="left">
              <GlobalOutlined /> 基础货币
            </Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <Space>
                      <span>{baseCurrency.flag}</span>
                      <span>{baseCurrency.currency} ({baseCurrency.currencyCode})</span>
                      <span style={{ color: '#52c41a', fontSize: '12px' }}>[基础货币]</span>
                    </Space>
                  }
                  name={baseCurrency.currencyCode}
                  initialValue={1.0}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    value={1.0}
                    precision={4}
                    addonBefore={baseCurrency.currencySymbol}
                    addonAfter="¥"
                    disabled={true}
                    placeholder="基础货币，固定为1.0"
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* 主要货币 */}
        <Divider orientation="left" style={{ marginTop: 32 }}>
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