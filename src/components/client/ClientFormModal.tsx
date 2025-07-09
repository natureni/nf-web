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
              <Input placeholder="公司名称 / Company Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="联系人 *" 
              name="contactPerson" 
              rules={[{ required: true, message: '请输入联系人姓名' }]}
            >
              <Input placeholder="联系人姓名 / Contact Person" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="职位" name="title">
              <Input placeholder="职位 / Job Title" />
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

        <Divider orientation="left">企业信息 / Business Information</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="地区" name="region">
              <Select placeholder="选择地区">
                <Option value="Asia-Pacific">Asia-Pacific 亚太地区</Option>
                <Option value="North-America">North-America 北美</Option>
                <Option value="Europe">Europe 欧洲</Option>
                <Option value="Middle-East">Middle-East 中东</Option>
                <Option value="Other">Other 其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="时区" name="timezone">
              <Input placeholder="AEST (UTC+10)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="语言" name="language">
              <Select mode="multiple" placeholder="选择语言">
                <Option value="English">English 英语</Option>
                <Option value="Mandarin">Mandarin 中文</Option>
                <Option value="Cantonese">Cantonese 粤语</Option>
                <Option value="Japanese">Japanese 日语</Option>
                <Option value="Korean">Korean 韩语</Option>
                <Option value="French">French 法语</Option>
                <Option value="German">German 德语</Option>
                <Option value="Spanish">Spanish 西班牙语</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="业务类型" name="businessType">
              <Select mode="multiple" placeholder="选择业务类型">
                <Option value="Urban Planning">Urban Planning 城市规划</Option>
                <Option value="Property Development">Property Development 房地产开发</Option>
                <Option value="Architecture">Architecture 建筑设计</Option>
                <Option value="Real Estate">Real Estate 房地产</Option>
                <Option value="Commercial Development">Commercial Development 商业开发</Option>
                <Option value="Exhibition Center">Exhibition Center 展览中心</Option>
                <Option value="Cultural Buildings">Cultural Buildings 文化建筑</Option>
                <Option value="Public Architecture">Public Architecture 公共建筑</Option>
                <Option value="Residential">Residential 住宅</Option>
                <Option value="Tourism">Tourism 旅游</Option>
                <Option value="Hospitality">Hospitality 酒店业</Option>
                <Option value="Sports Facilities">Sports Facilities 体育设施</Option>
                <Option value="Recreation">Recreation 娱乐</Option>
                <Option value="Entertainment">Entertainment 娱乐业</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">项目偏好 / Project Preferences</Divider>

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
            <Option value="Resort">Resort 度假</Option>
            <Option value="Luxury Residential">Luxury Residential 豪华住宅</Option>
            <Option value="Sports">Sports 体育</Option>
            <Option value="Functional">Functional 功能性</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
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
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item label="沟通方式" name={['projectPreferences', 'communication']}>
              <Select placeholder="选择沟通方式">
                <Option value="Email + Phone">Email + Phone</Option>
                <Option value="Email + Video Call">Email + Video Call</Option>
                <Option value="Phone + Email">Phone + Email</Option>
                <Option value="Video Call + Email">Video Call + Email</Option>
                <Option value="WeChat + Email">WeChat + Email</Option>
                <Option value="WhatsApp + Email">WhatsApp + Email</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">财务信息 / Financial Information</Divider>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="付款条款" name={['paymentInfo', 'terms']}>
              <Select placeholder="选择付款条款">
                <Option value="Net 15">Net 15</Option>
                <Option value="Net 30">Net 30</Option>
                <Option value="Net 45">Net 45</Option>
                <Option value="Net 60">Net 60</Option>
                <Option value="Net 90">Net 90</Option>
                <Option value="COD">COD</Option>
                <Option value="Prepaid">Prepaid</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="付款方式" name={['paymentInfo', 'method']}>
              <Select placeholder="选择付款方式">
                <Option value="Wire Transfer">Wire Transfer</Option>
                <Option value="Bank Transfer">Bank Transfer</Option>
                <Option value="Credit Card">Credit Card</Option>
                <Option value="ACH Transfer">ACH Transfer</Option>
                <Option value="PayPal">PayPal</Option>
                <Option value="Check">Check</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="币种" name={['paymentInfo', 'currency']}>
              <Select placeholder="选择币种">
                <Option value="USD">USD</Option>
                <Option value="AUD">AUD</Option>
                <Option value="CNY">CNY</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
                <Option value="HKD">HKD</Option>
                <Option value="SGD">SGD</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="信用评级" name={['paymentInfo', 'creditRating']}>
              <Select placeholder="选择信用评级">
                <Option value="A">A</Option>
                <Option value="B">B</Option>
                <Option value="C">C</Option>
                <Option value="D">D</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">项目历史数据</Divider>

        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 500 }}>项目历史统计</span>
            <Button 
              type="primary" 
              size="small" 
              icon={<ProjectOutlined />}
              onClick={handleUpdateProjectHistory}
            >
              从项目管理获取数据
            </Button>
          </div>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="总项目数" name={['projectHistory', 'total']}>
                <Input type="number" placeholder="0" disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="完成项目" name={['projectHistory', 'completed']}>
                <Input type="number" placeholder="0" disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="进行中" name={['projectHistory', 'ongoing']}>
                <Input type="number" placeholder="0" disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="项目总价值" name={['projectHistory', 'value']}>
                <Input type="number" placeholder="0" disabled addonBefore="$" />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            💡 项目历史数据将从项目管理模块自动获取，确保数据准确性和实时性。
          </div>
        </div>

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