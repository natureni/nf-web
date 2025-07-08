import React from 'react'
import { Card, Row, Col, Form, Select, InputNumber, Alert, Space } from 'antd'
import { ExchangeRate } from '../../types/project'
import CurrencySelector from './CurrencySelector'
import BudgetCalculator from './BudgetCalculator'

const { Option } = Select

interface ProjectBudgetConfigProps {
  form: any
  budgetConfig: {
    birdViewPrice: number
    halfBirdViewPrice: number // 新增半鸟瞰图单价
    humanViewPrice: number
    animationPrice: number
    birdViewDiscount: number
    halfBirdViewDiscount: number // 新增半鸟瞰图折扣
    humanViewDiscount: number
    animationDiscount: number
    currency: string
  }
  imageQuantity: {
    birdViewCount: number
    halfBirdViewCount: number // 新增半鸟瞰图数量
    humanViewCount: number
    animationDuration: number
  }
  exchangeRates: ExchangeRate[]
  selectedCurrency: string
  projectBudget: number
  onImageQuantityChange: (field: string, value: number | null) => void
  onBudgetConfigChange: (field: string, value: number | null) => void
  onCurrencyChange: (value: string) => void
  onBudgetChange: (value: number | null) => void
}

const ProjectBudgetConfig: React.FC<ProjectBudgetConfigProps> = ({
  form,
  budgetConfig,
  imageQuantity,
  exchangeRates,
  selectedCurrency,
  projectBudget,
  onImageQuantityChange,
  onBudgetConfigChange,
  onCurrencyChange,
  onBudgetChange
}) => {
  // 计算预算明细
  const calculateBudgetDetails = () => {
    const currencySymbol = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'
    const exchangeRate = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.rate || 1
    
    const birdViewOriginal = imageQuantity.birdViewCount * budgetConfig.birdViewPrice * budgetConfig.birdViewDiscount / 100
    const halfBirdViewOriginal = imageQuantity.halfBirdViewCount * budgetConfig.halfBirdViewPrice * budgetConfig.halfBirdViewDiscount / 100
    const humanViewOriginal = imageQuantity.humanViewCount * budgetConfig.humanViewPrice * budgetConfig.humanViewDiscount / 100
    const animationOriginal = imageQuantity.animationDuration * budgetConfig.animationPrice * budgetConfig.animationDiscount / 100
    const totalOriginal = birdViewOriginal + halfBirdViewOriginal + humanViewOriginal + animationOriginal
    const totalCNY = totalOriginal * exchangeRate
    
    return {
      currencySymbol,
      exchangeRate,
      birdViewOriginal,
      halfBirdViewOriginal,
      humanViewOriginal,
      animationOriginal,
      totalOriginal,
      totalCNY
    }
  }

  const budgetDetails = calculateBudgetDetails()

  return (
    <>
      {/* 项目图量 */}
      <Card size="small" title="项目图量设置" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="鸟瞰图" name="birdViewCount">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="几张"
                suffix="张"
                onChange={(value) => {
                  onImageQuantityChange('birdViewCount', value)
                  // 同时更新表单字段
                  form.setFieldsValue({ birdViewCount: value })
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="半鸟瞰图" name="halfBirdViewCount">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="几张"
                suffix="张"
                onChange={(value) => {
                  onImageQuantityChange('halfBirdViewCount', value)
                  // 同时更新表单字段
                  form.setFieldsValue({ halfBirdViewCount: value })
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="人视角图" name="humanViewCount">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="几张"
                suffix="张"
                onChange={(value) => {
                  onImageQuantityChange('humanViewCount', value)
                  // 同时更新表单字段
                  form.setFieldsValue({ humanViewCount: value })
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="动画时长" name="animationDuration">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="几秒"
                suffix="秒"
                onChange={(value) => {
                  onImageQuantityChange('animationDuration', value)
                  // 同时更新表单字段
                  form.setFieldsValue({ animationDuration: value })
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 预算计算配置 */}
      <Card size="small" title="预算计算配置" style={{ marginBottom: 16 }}>
        {/* 币种选择 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Form.Item label="项目币种" name="projectCurrency">
              <CurrencySelector
                selectedCurrency={budgetConfig.currency}
                exchangeRates={exchangeRates}
                onCurrencyChange={onCurrencyChange}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <div style={{ 
              background: '#f0f8ff', 
              border: '1px solid #d1e9ff', 
              borderRadius: '6px', 
              padding: '8px 12px',
              marginTop: 24
            }}>
              <div style={{ fontSize: 12, color: '#1890ff' }}>
                💡 <strong>币种说明：</strong>支持美元、人民币、澳元等多种币种计价。选择人民币时汇率为1.0，无需转换。
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Form.Item label={`鸟瞰图单价(${budgetDetails.currencySymbol})`}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={budgetConfig.birdViewPrice}
                onChange={(value) => onBudgetConfigChange('birdViewPrice', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={`半鸟瞰图单价(${budgetDetails.currencySymbol})`}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={budgetConfig.halfBirdViewPrice}
                onChange={(value) => onBudgetConfigChange('halfBirdViewPrice', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={`人视角单价(${budgetDetails.currencySymbol})`}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={budgetConfig.humanViewPrice}
                onChange={(value) => onBudgetConfigChange('humanViewPrice', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={`动画单价(${budgetDetails.currencySymbol}/秒)`}>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={budgetConfig.animationPrice}
                onChange={(value) => onBudgetConfigChange('animationPrice', value)}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Form.Item label="鸟瞰图折扣(%)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                value={budgetConfig.birdViewDiscount}
                onChange={(value) => onBudgetConfigChange('birdViewDiscount', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="半鸟瞰图折扣(%)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                value={budgetConfig.halfBirdViewDiscount}
                onChange={(value) => onBudgetConfigChange('halfBirdViewDiscount', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="人视角折扣(%)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                value={budgetConfig.humanViewDiscount}
                onChange={(value) => onBudgetConfigChange('humanViewDiscount', value)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="动画折扣(%)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                value={budgetConfig.animationDiscount}
                onChange={(value) => onBudgetConfigChange('animationDiscount', value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 预算计算明细 - 使用新的BudgetCalculator组件 */}
        <BudgetCalculator
          budgetConfig={budgetConfig}
          imageQuantity={imageQuantity}
          exchangeRates={exchangeRates}
        />
      </Card>

      {/* 项目预算 */}
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="项目预算 (人民币)"
            name="projectBudget"
            rules={[{ required: true, message: '请输入项目预算' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="自动计算，也可手动调整"
              prefix="¥"
              value={projectBudget}
              onChange={onBudgetChange}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => parseInt(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          {projectBudget > 0 && (
            <div style={{ 
              padding: '16px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              marginTop: 24
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#52c41a' }}>
                预算设置成功
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <strong>项目总预算（人民币）：</strong>
                <span style={{ color: '#52c41a', fontWeight: 500 }}>¥{projectBudget.toLocaleString()}</span>
              </div>
              {budgetConfig.currency !== 'CNY' && (
                <>
                  <div style={{ fontSize: 12, marginBottom: 4, color: '#8c8c8c' }}>
                    <strong>计价币种：</strong>{exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currency} ({budgetConfig.currency})
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 4, color: '#8c8c8c' }}>
                    <strong>使用汇率：</strong>{exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.rate}
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    <strong>原币种金额：</strong>
                    {(() => {
                      const rate = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.rate || 1
                      const symbol = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'
                      return `${symbol}${(projectBudget / rate).toLocaleString()}`
                    })()}
                  </div>
                </>
              )}
            </div>
          )}
        </Col>
      </Row>
    </>
  )
}

export default ProjectBudgetConfig 