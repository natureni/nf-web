import React, { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Checkbox, Row, Col, Card, Tag, Button, Space, Modal, message } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Project } from '../../types/project'
import { Client } from '../../types/client'

const { Option } = Select
const { TextArea } = Input

interface ProjectBasicInfoFormProps {
  form: any
  currentProject?: Project | null
}

const ProjectBasicInfoForm: React.FC<ProjectBasicInfoFormProps> = ({
  form,
  currentProject
}) => {
  const [paymentStatus, setPaymentStatus] = useState<string>('unpaid')
  const [clients, setClients] = useState<Client[]>([])
  const [projectTypeOptions, setProjectTypeOptions] = useState<string[]>([
    '商业综合体',
    '办公建筑',
    '创新中心',
    '金融中心',
    '海滨大厦',
    '城市广场',
    '商业区',
    '海湾花园',
    '住宅小区',
    '别墅项目',
    '酒店建筑',
    '度假村',
    '体育场馆',
    '文化建筑',
    '教育建筑',
    '医疗建筑',
    '工业建筑',
    '物流园区',
    '科技园区',
    '会展中心',
    '交通枢纽',
    '公共建筑',
    '宗教建筑',
    '历史建筑',
    '景观项目'
  ])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [newProjectType, setNewProjectType] = useState('')

  // 获取客户数据（从客户管理模块）
  useEffect(() => {
    // 模拟从客户管理获取数据，实际应该从API或localStorage获取
    const mockClients: Client[] = [
      {
        id: '1',
        companyName: 'URBIS 澳洲城市规划设计公司',
        contactPerson: 'David Johnson 大卫·约翰逊',
        title: 'Senior Partner 高级合伙人',
        email: 'david.johnson@urbis.com.au',
        phone: '+61 7 3007 3800',
        website: 'https://urbis.com.au',
        region: 'Asia-Pacific',
        timezone: 'AEST (UTC+10)',
        language: ['English', 'Mandarin'],
        businessType: ['Urban Planning', 'Property Development', 'Architecture'],
        projectPreferences: {
          style: ['Modern', 'Commercial', 'Residential High-rise'],
          budget: '$200,000 - $500,000',
          timeline: '3-6 months',
          communication: 'Email + Video Call'
        },
        projectHistory: {
          total: 8,
          completed: 6,
          ongoing: 2,
          value: 2600000
        },
        paymentInfo: {
          terms: 'Net 30',
          method: 'Wire Transfer',
          currency: 'AUD',
          creditRating: 'A'
        },
        tags: ['VIP客户', '长期合作', '大型项目'],
        notes: '重要客户，澳洲知名城市规划设计公司，项目质量要求高，付款及时。',
        status: 'active',
        createdAt: '2023-01-15',
        lastContact: '2024-12-01'
      },
      {
        id: '2',
        companyName: 'Bathurst Development Corp 巴瑟斯特开发公司',
        contactPerson: 'Sarah Mitchell 萨拉·米切尔',
        title: 'Development Manager 开发经理',
        email: 'sarah.mitchell@bathurst.com',
        phone: '+61 2 6331 8900',
        website: 'https://bathurst-development.com',
        region: 'Asia-Pacific',
        timezone: 'AEST (UTC+10)',
        language: ['English'],
        businessType: ['Real Estate', 'Commercial Development'],
        projectPreferences: {
          style: ['Contemporary', 'Mixed-use'],
          budget: '$150,000 - $300,000',
          timeline: '2-4 months',
          communication: 'Email + Phone'
        },
        projectHistory: {
          total: 5,
          completed: 4,
          ongoing: 1,
          value: 1240000
        },
        paymentInfo: {
          terms: 'Net 45',
          method: 'Bank Transfer',
          currency: 'AUD',
          creditRating: 'B'
        },
        tags: ['中型项目', '稳定客户'],
        notes: '地区性开发商，项目规模适中，合作关系良好。',
        status: 'active',
        createdAt: '2023-03-20',
        lastContact: '2024-11-28'
      },
      {
        id: '3',
        companyName: 'NCCEC Group 中国建筑工程集团',
        contactPerson: 'Wang Lei 王磊',
        title: 'Project Director 项目总监',
        email: 'wang.lei@nccec.com.cn',
        phone: '+86 10 8888 9999',
        website: 'https://nccec.com.cn',
        region: 'Asia-Pacific',
        timezone: 'CST (UTC+8)',
        language: ['Mandarin', 'English'],
        businessType: ['Architecture', 'Public Architecture', 'Cultural Buildings'],
        projectPreferences: {
          style: ['Grand', 'Cultural', 'Exhibition'],
          budget: '$500,000+',
          timeline: '6-12 months',
          communication: 'WeChat + Email'
        },
        projectHistory: {
          total: 3,
          completed: 1,
          ongoing: 2,
          value: 2150000
        },
        paymentInfo: {
          terms: 'Net 60',
          method: 'Wire Transfer',
          currency: 'CNY',
          creditRating: 'A'
        },
        tags: ['国际客户', '大型项目', '文化建筑'],
        notes: '中国大型建筑集团，主要承接文化建筑和公共建筑项目。',
        status: 'active',
        createdAt: '2023-06-10',
        lastContact: '2024-11-25'
      },
      {
        id: '4',
        companyName: 'Norwell Properties 诺威尔地产',
        contactPerson: 'Michael Chen 陈迈克',
        title: 'CEO 首席执行官',
        email: 'michael.chen@norwell.com',
        phone: '+1 604 123 4567',
        website: 'https://norwell-properties.com',
        region: 'North-America',
        timezone: 'PST (UTC-8)',
        language: ['English', 'Mandarin'],
        businessType: ['Real Estate', 'Residential'],
        projectPreferences: {
          style: ['Resort', 'Luxury Residential'],
          budget: '$100,000 - $250,000',
          timeline: '2-3 months',
          communication: 'Email + Video Call'
        },
        projectHistory: {
          total: 4,
          completed: 3,
          ongoing: 1,
          value: 680000
        },
        paymentInfo: {
          terms: 'Net 30',
          method: 'Wire Transfer',
          currency: 'CAD',
          creditRating: 'A'
        },
        tags: ['度假项目', '豪华住宅', '美国客户'],
        notes: '专注于度假村和豪华住宅项目的北美开发商。',
        status: 'active',
        createdAt: '2023-08-15',
        lastContact: '2024-11-30'
      },
      {
        id: '5',
        companyName: 'Olympic Club International 奥林匹克俱乐部国际',
        contactPerson: 'Robert Taylor 罗伯特·泰勒',
        title: 'Facilities Manager 设施经理',
        email: 'robert.taylor@olympic-club.com',
        phone: '+1 415 555 0123',
        website: 'https://olympic-club.com',
        region: 'North-America',
        timezone: 'PST (UTC-8)',
        language: ['English'],
        businessType: ['Sports Facilities', 'Recreation', 'Entertainment'],
        projectPreferences: {
          style: ['Sports', 'Functional'],
          budget: '$300,000 - $600,000',
          timeline: '4-8 months',
          communication: 'Phone + Email'
        },
        projectHistory: {
          total: 2,
          completed: 1,
          ongoing: 1,
          value: 970000
        },
        paymentInfo: {
          terms: 'Net 15',
          method: 'ACH Transfer',
          currency: 'USD',
          creditRating: 'A'
        },
        tags: ['体育设施', '娱乐业', '美国客户'],
        notes: '历史悠久的体育俱乐部，专注于体育设施和娱乐场所的开发。',
        status: 'active',
        createdAt: '2023-10-05',
        lastContact: '2024-11-20'
      }
    ]
    
    // 只显示活跃客户
    const activeClients = mockClients.filter(client => client.status === 'active')
    setClients(activeClients)

    // 从localStorage加载自定义项目类型
    const savedProjectTypes = localStorage.getItem('nflab_project_types')
    if (savedProjectTypes) {
      try {
        const customTypes = JSON.parse(savedProjectTypes)
        setProjectTypeOptions(customTypes)
      } catch (error) {
        console.error('加载自定义项目类型失败:', error)
      }
    }
  }, [])

  // 监听付款状态变化
  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatus(value)
    // 如果不是部分付款，清空已付金额
    if (value !== 'partial') {
      form.setFieldValue('paidAmount', undefined)
    }
  }

  // 监听表单值变化来更新付款状态
  useEffect(() => {
    const currentPaymentStatus = form.getFieldValue('paymentStatus')
    if (currentPaymentStatus) {
      setPaymentStatus(currentPaymentStatus)
    }
  }, [form])

  // 删除项目类型选项
  const handleDeleteProjectType = (typeToDelete: string) => {
    const updatedTypes = projectTypeOptions.filter(type => type !== typeToDelete)
    setProjectTypeOptions(updatedTypes)
    localStorage.setItem('nflab_project_types', JSON.stringify(updatedTypes))
    message.success(`已删除项目类型："${typeToDelete}"`)
  }

  // 添加新的项目类型
  const handleAddProjectType = () => {
    if (!newProjectType.trim()) {
      message.error('请输入项目类型名称')
      return
    }
    
    if (projectTypeOptions.includes(newProjectType.trim())) {
      message.error('该项目类型已存在')
      return
    }

    const updatedTypes = [...projectTypeOptions, newProjectType.trim()]
    setProjectTypeOptions(updatedTypes)
    localStorage.setItem('nflab_project_types', JSON.stringify(updatedTypes))
    setNewProjectType('')
    setEditModalVisible(false)
    message.success(`已添加项目类型："${newProjectType.trim()}"`)
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>项目基本信息</span>
          {currentProject && (
            <Tag color="blue">正在编辑：{currentProject.name}</Tag>
          )}
        </div>
      } 
      style={{ marginTop: 24 }}
    >
      <Form form={form} layout="vertical" initialValues={{ status: 'reporting' }}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="项目名称"
              name="projectName"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="项目协议号"
              name="protocolNumber"
              rules={[{ required: true, message: '请输入项目协议号' }]}
            >
              <Input placeholder="请输入项目协议号" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="客户名称"
              name="clientName"
              rules={[{ required: true, message: '请选择客户' }]}
            >
              <Select 
                placeholder="请选择客户"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {clients.map(client => (
                  <Option key={client.id} value={client.companyName}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{client.companyName}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          {client.contactPerson} | {client.paymentInfo.currency}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        {client.tags.slice(0, 2).map(tag => (
                          <Tag key={tag} size="small" color="blue">{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>项目类型</span>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<EditOutlined />}
                    onClick={() => setEditModalVisible(true)}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    编辑选项
                  </Button>
                </div>
              }
              name="projectType"
              rules={[{ required: true, message: '请输入或选择项目类型' }]}
            >
              <Select
                mode="combobox"
                placeholder="请输入或选择项目类型"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {projectTypeOptions.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="项目预算"
              name="budget"
              rules={[{ required: true, message: '请输入项目预算' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入预算金额"
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="项目货币"
              name="currency"
              rules={[{ required: true, message: '请选择货币类型' }]}
            >
              <Select placeholder="选择货币">
                <Option value="CNY">人民币 (CNY)</Option>
                <Option value="USD">美元 (USD)</Option>
                <Option value="AUD">澳元 (AUD)</Option>
                <Option value="EUR">欧元 (EUR)</Option>
                <Option value="GBP">英镑 (GBP)</Option>
                <Option value="CAD">加元 (CAD)</Option>
                <Option value="SGD">新加坡元 (SGD)</Option>
                <Option value="AED">迪拉姆 (AED)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="项目状态"
              name="status"
              rules={[{ required: true, message: '请选择项目状态' }]}
            >
              <Select placeholder="选择项目状态" defaultValue="reporting">
                <Option value="reporting">报备中</Option>
                <Option value="modeling">建模</Option>
                <Option value="rendering">渲染</Option>
                <Option value="delivering">出图</Option>
                <Option value="paused">暂停</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="付款状态"
              name="paymentStatus"
              rules={[{ required: true, message: '请选择付款状态' }]}
            >
              <Select 
                placeholder="选择付款状态" 
                onChange={handlePaymentStatusChange}
              >
                <Option value="unpaid">未付款</Option>
                <Option value="partial">部分付款</Option>
                <Option value="completed">已付款</Option>
                <Option value="overdue">逾期</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="预期项目结束时期"
              name="deadline"
              rules={[{ required: true, message: '请选择预期结束时期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择预期结束时期" />
            </Form.Item>
          </Col>
        </Row>

        {/* 部分付款时显示已付金额字段 */}
        {paymentStatus === 'partial' && (
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="已付金额"
                name="paidAmount"
                rules={[
                  { required: true, message: '请输入已付金额' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const budget = getFieldValue('budget')
                      if (!value || !budget) {
                        return Promise.resolve()
                      }
                      if (value > budget) {
                        return Promise.reject(new Error('已付金额不能超过项目预算'))
                      }
                      if (value <= 0) {
                        return Promise.reject(new Error('已付金额必须大于0'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入已付金额"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ 
                marginTop: 30, 
                padding: '8px 12px', 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: '6px',
                fontSize: '12px',
                color: '#52c41a'
              }}>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
                  prevValues.budget !== currentValues.budget || 
                  prevValues.paidAmount !== currentValues.paidAmount
                }>
                  {({ getFieldValue }) => {
                    const budget = getFieldValue('budget') || 0
                    const paidAmount = getFieldValue('paidAmount') || 0
                    const remaining = budget - paidAmount
                    const percentage = budget > 0 ? ((paidAmount / budget) * 100).toFixed(1) : 0
                    return (
                      <div>
                        <div>已付比例: {percentage}%</div>
                        <div>剩余金额: {remaining.toLocaleString()}</div>
                      </div>
                    )
                  }}
                </Form.Item>
              </div>
            </Col>
          </Row>
        )}

        <Form.Item label="项目描述" name="description">
          <TextArea rows={4} placeholder="请输入项目描述..." />
        </Form.Item>

        {/* 项目进度说明 */}
        <div style={{
          background: '#f0f6ff',
          border: '1px solid #d6e4ff',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '16px'
        }}>
          <div style={{ fontWeight: 500, marginBottom: 8, color: '#1890ff' }}>项目进度说明：</div>
          <div style={{ fontSize: '12px', color: '#595959', lineHeight: '1.6' }}>
            项目进度将根据项目状态自动计算：<br />
            • 报备中: 0-10%<br />
            • 建模: 10-40%<br />
            • 渲染: 40-80%<br />
            • 出图: 80-100%<br />
            • 暂停: 保持当前进度<br />
            具体进度将在团队配置和时间安排中根据实际完成情况自动更新。
          </div>
        </div>
      </Form>

      {/* 项目类型编辑弹窗 */}
      <Modal
        title="编辑项目类型选项"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setNewProjectType('')
        }}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="输入新的项目类型"
              value={newProjectType}
              onChange={(e) => setNewProjectType(e.target.value)}
              onPressEnter={handleAddProjectType}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProjectType}>
              添加
            </Button>
          </Space.Compact>
        </div>
        
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <div style={{ marginBottom: 8, fontWeight: 500, color: '#666' }}>
            当前项目类型选项（点击删除按钮可移除）：
          </div>
          <Space size={[8, 8]} wrap>
            {projectTypeOptions.map(type => (
              <Tag
                key={type}
                closable
                onClose={() => handleDeleteProjectType(type)}
                style={{ marginBottom: 8 }}
              >
                {type}
              </Tag>
            ))}
          </Space>
        </div>
      </Modal>
    </Card>
  )
}

export default ProjectBasicInfoForm 