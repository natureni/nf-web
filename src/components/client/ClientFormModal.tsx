import React, { useEffect } from 'react'
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  Divider, 
  Button, 
  message 
} from 'antd'
import { ProjectOutlined } from '@ant-design/icons'
import { Client } from '../../types/client'

const { Option } = Select
const { TextArea } = Input

interface ClientFormModalProps {
  visible: boolean
  client: Client | null
  onClose: () => void
  onSubmit: (values: any) => void
  onUpdateProjectHistory?: (companyName: string) => void
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  visible,
  client,
  onClose,
  onSubmit,
  onUpdateProjectHistory
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible && client) {
      form.setFieldsValue(client)
    } else if (visible) {
      form.resetFields()
    }
  }, [visible, client, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      onSubmit(values)
      form.resetFields()
      onClose()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleUpdateProjectHistory = () => {
    const companyName = form.getFieldValue('companyName')
    if (companyName && onUpdateProjectHistory) {
      onUpdateProjectHistory(companyName)
    } else {
      message.warning('请先填写公司名称')
    }
  }

  return (
    <Modal
      title={client ? '编辑客户信息' : '新建客户'}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {client ? '更新' : '创建'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'active',
          region: 'Asia-Pacific',
          language: ['English'],
          businessType: ['Real Estate'],
          projectPreferences: {
            style: ['Modern'],
            budget: '$200,000 - $500,000',
            timeline: '3-6 months',
            communication: 'Email + Video Call'
          },
          paymentInfo: {
            terms: 'Net 30',
            method: 'Wire Transfer',
            currency: 'AUD',
            creditRating: 'A'
          }
        }}
      >
        <Divider orientation="left">基本信息 / Basic Information</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="公司名称 *" 
              name="companyName" 
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input placeholder="公司名称 (支持中英文)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="联系人 *" 
              name="contactPerson" 
              rules={[{ required: true, message: '请输入联系人姓名' }]}
            >
              <Input placeholder="联系人姓名 (支持中英文)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="职位" name="titleCN">
              <Input placeholder="职位" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="邮箱 *" 
              name="email" 
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="email@company.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="电话" 
              name="phone"
              rules={[{ required: true, message: '请输入电话号码' }]}
            >
              <Input placeholder="+61 7 3007 3800" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="网站" name="website">
              <Input placeholder="https://company.com" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">项目偏好 / Project Preferences</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="风格偏好" name={['projectPreferences', 'style']}>
              <Select mode="multiple" placeholder="选择风格偏好">
                <Option value="Modern">Modern 现代</Option>
                <Option value="Commercial">Commercial 商业</Option>
                <Option value="Residential High-rise">Residential High-rise 高层住宅</Option>
                <Option value="Contemporary">Contemporary 当代</Option>
                <Option value="Mixed-use">Mixed-use 混合用途</Option>
                <Option value="Grand">Grand 宏伟</Option>
                <Option value="Cultural">Cultural 文化</Option>
                <Option value="Exhibition">Exhibition 展览</Option>
                <Option value="Resort">Resort 度假村</Option>
                <Option value="Luxury Residential">Luxury Residential 豪华住宅</Option>
                <Option value="Sports">Sports 体育</Option>
                <Option value="Functional">Functional 功能性</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="预算范围" name={['projectPreferences', 'budget']}>
              <Select placeholder="选择预算范围">
                <Option value="$50,000 - $100,000">$50,000 - $100,000</Option>
                <Option value="$100,000 - $250,000">$100,000 - $250,000</Option>
                <Option value="$150,000 - $300,000">$150,000 - $300,000</Option>
                <Option value="$200,000 - $500,000">$200,000 - $500,000</Option>
                <Option value="$300,000 - $600,000">$300,000 - $600,000</Option>
                <Option value="$500,000+">$500,000+</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="时间周期" name={['projectPreferences', 'timeline']}>
              <Select placeholder="选择时间周期">
                <Option value="1-2 months">1-2 months</Option>
                <Option value="2-3 months">2-3 months</Option>
                <Option value="2-4 months">2-4 months</Option>
                <Option value="3-6 months">3-6 months</Option>
                <Option value="4-8 months">4-8 months</Option>
                <Option value="6-12 months">6-12 months</Option>
                <Option value="12+ months">12+ months</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="客户标签" name="tags">
          <Select mode="tags" placeholder="添加客户标签">
            <Option value="VIP客户">VIP客户</Option>
            <Option value="长期合作">长期合作</Option>
            <Option value="大型项目">大型项目</Option>
            <Option value="中型项目">中型项目</Option>
            <Option value="稳定客户">稳定客户</Option>
            <Option value="国际客户">国际客户</Option>
            <Option value="度假项目">度假项目</Option>
            <Option value="豪华住宅">豪华住宅</Option>
            <Option value="体育设施">体育设施</Option>
            <Option value="美国客户">美国客户</Option>
            <Option value="文化建筑">文化建筑</Option>
          </Select>
        </Form.Item>

        <Form.Item label="客户状态" name="status">
          <Select placeholder="选择客户状态">
            <Option value="active">Active 活跃客户</Option>
            <Option value="inactive">Inactive 非活跃</Option>
            <Option value="potential">Potential 潜在客户</Option>
            <Option value="blacklist">Blacklist 黑名单</Option>
          </Select>
        </Form.Item>

        <Form.Item label="备注" name="notes">
          <TextArea rows={3} placeholder="客户备注信息..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ClientFormModal 