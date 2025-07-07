import React from 'react'
import { Form, Input, Select, DatePicker, Card, Row, Col, Button, Space, Alert } from 'antd'
import { Client, ExchangeRate } from '../../types/project'
import ClientPreferences from './ClientPreferences'

const { Option } = Select
const { TextArea } = Input

interface ProjectBasicInfoProps {
  form: any
  selectedClient: Client | null
  exchangeRates: ExchangeRate[]
  clients: Client[]
  onClientSelect: (value: string) => void
  onProtocolNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onProjectNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  generateProtocolNumber: () => string
  isEditMode?: boolean
}

const ProjectBasicInfo: React.FC<ProjectBasicInfoProps> = ({
  form,
  selectedClient,
  exchangeRates,
  clients,
  onClientSelect,
  onProtocolNumberChange,
  onProjectNameChange,
  generateProtocolNumber,
  isEditMode = false
}) => {
  return (
    <Card title="项目基本信息" style={{ marginTop: 24 }}>
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="项目协议号"
              name="protocolNumber"
              rules={[{ required: true, message: '请输入项目协议号' }]}
            >
              <Input 
                placeholder="请输入项目协议号" 
                onChange={onProtocolNumberChange}
                addonAfter={
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => {
                      const newNumber = generateProtocolNumber()
                      form.setFieldsValue({ protocolNumber: newNumber })
                      onProtocolNumberChange({ target: { value: newNumber } } as any)
                    }}
                  >
                    自动生成
                  </Button>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="项目名称"
              name="projectName"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input 
                placeholder="请输入项目名称" 
                onChange={onProjectNameChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="完整项目名称（协议号 + 项目名称）"
          name="fullProjectName"
        >
          <Input disabled placeholder="将自动生成完整项目名称" />
        </Form.Item>
        
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="客户名称"
              name="clientId"
              rules={[{ required: true, message: '请选择客户' }]}
            >
              <Select 
                placeholder="选择客户" 
                showSearch
                optionFilterProp="children"
                onChange={onClientSelect}
              >
                {clients.map(client => (
                  <Option key={client.id} value={client.id}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{client.companyName}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {client.companyNameCN} - {client.contactPerson}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="开始日期"
              name="startDate"
              rules={[{ required: true, message: '请选择开始日期' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="年-月-日"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="截止日期"
              name="endDate"
              rules={[{ required: true, message: '请选择截止日期' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="年-月-日"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="项目描述（已自动提取客户偏好信息）" name="description">
          <TextArea 
            rows={6} 
            placeholder="请输入项目描述..." 
            disabled={!selectedClient}
          />
        </Form.Item>

        {/* 使用新的ClientPreferences组件 */}
        <ClientPreferences
          selectedClient={selectedClient}
          exchangeRates={exchangeRates}
        />
      </Form>
    </Card>
  )
}

export default ProjectBasicInfo 