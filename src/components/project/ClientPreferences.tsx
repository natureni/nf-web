import React from 'react'
import { Card, Row, Col } from 'antd'
import { Client, ExchangeRate } from '../../types/project'

interface ClientPreferencesProps {
  selectedClient: Client | null
  exchangeRates: ExchangeRate[]
}

const ClientPreferences: React.FC<ClientPreferencesProps> = ({
  selectedClient,
  exchangeRates
}) => {
  if (!selectedClient) {
    return null
  }

  const getStyleDisplay = (style: string | string[]) => {
    return Array.isArray(style) ? style.join(', ') : style
  }

  const getCommunicationDisplay = (communication: string | string[]) => {
    return Array.isArray(communication) ? communication.join(', ') : communication
  }

  const getCurrentRate = () => {
    return exchangeRates.find(r => r.currencyCode === selectedClient.preferredCurrency)
  }

  const currentRate = getCurrentRate()

  return (
    <Card size="small" title="客户偏好信息" style={{ background: '#f8f9fa', marginTop: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <div><strong>风格偏好:</strong> {getStyleDisplay(selectedClient.projectPreferences.style)}</div>
        </Col>
        <Col span={12}>
          <div><strong>预算范围:</strong> {selectedClient.projectPreferences.budget}</div>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 8 }}>
        <Col span={12}>
          <div><strong>时间周期:</strong> {selectedClient.projectPreferences.timeline}</div>
        </Col>
        <Col span={12}>
          <div><strong>沟通方式:</strong> {getCommunicationDisplay(selectedClient.projectPreferences.communication)}</div>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 8 }}>
        <Col span={12}>
          <div><strong>偏好币种:</strong> 
            <span style={{ marginLeft: 8 }}>
              {currentRate?.flag} {selectedClient.preferredCurrency} ({currentRate?.currency})
            </span>
          </div>
        </Col>
        <Col span={12}>
          <div><strong>当前汇率:</strong> {currentRate?.rate}</div>
        </Col>
      </Row>
    </Card>
  )
}

export default ClientPreferences 