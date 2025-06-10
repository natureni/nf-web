import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Steps,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  InputNumber,
  message,
  Checkbox,
  Avatar,
  Table,
  Tag,
  Spin,
} from 'antd'
import {
  ArrowLeftOutlined,
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Step } = Steps
const { Option } = Select
const { TextArea } = Input

interface TeamMember {
  id: string
  name: string
  role: string
  cost: number
  unit: string
}

// 项目数据接口
interface Project {
  id: string
  name: string
  protocolNumber: string
  client: string
  status: 'reporting' | 'modeling' | 'rendering' | 'delivering'
  deadline: string
  budget: number
  currency: string
  exchangeRate: number
  budgetCNY: number
  paymentStatus: 'unpaid' | 'partial' | 'completed' | 'overdue'
  progress: number
  type: string
}

const EditProject: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  // 团队成员数据
  const [modelingMembers, setModelingMembers] = useState<TeamMember[]>([])
  const [renderingMembers, setRenderingMembers] = useState<TeamMember[]>([])
  const [animationMembers, setAnimationMembers] = useState<TeamMember[]>([])

  // 预算配置数据
  const [budgetItems] = useState([
    { id: '1', name: '建模制作费用', amount: 500, unit: '次性费用' },
    { id: '2', name: '正式制作费用', amount: 700, unit: '次性费用' },
    { id: '3', name: '完善制作费用', amount: 0, unit: '次性费用' },
  ])

  // 项目时间安排数据
  const [scheduleItems, setScheduleItems] = useState([
    {
      id: '1',
      phase: '项目报备',
      startDate: '2025-06-02',
      endDate: '2025-06-05',
      color: '#fa8c16',
      autoSchedule: false,
    },
    {
      id: '2', 
      phase: '项目建模与设计',
      startDate: '2025-06-06',
      endDate: '2025-06-07',
      color: '#52c41a',
      autoSchedule: true,
    },
    {
      id: '3',
      phase: '项目制作设计',
      startDate: '2025-06-08', 
      endDate: '2025-06-12',
      color: '#1890ff',
      autoSchedule: true,
    },
    {
      id: '4',
      phase: '项目制作完善改造',
      startDate: '2025-06-13',
      endDate: '2025-06-19',
      color: '#52c41a',
      autoSchedule: true,
    },
    {
      id: '5',
      phase: '项目发副总监',
      startDate: '2025-06-20',
      endDate: '2025-06-28',
      color: '#ff4d4f',
      autoSchedule: true,
    },
  ])

  // 完整的项目数据 - 与ProjectList中的数据保持一致
  const getAllProjects = (): Project[] => {
    return [
      {
        id: 'NF2501',
        name: 'Sydney CBD Tower',
        protocolNumber: 'NF2501',
        client: 'Bathurst开发公司',
        status: 'reporting',
        deadline: '2025-03-15',
        budget: 45000,
        currency: 'AUD',
        exchangeRate: 4.78,
        budgetCNY: 215100,
        paymentStatus: 'unpaid',
        progress: 8,
        type: '商业综合体',
      },
      {
        id: 'NF2502',
        name: 'Manhattan Office Complex',
        protocolNumber: 'NF2502',
        client: 'NCCEC集团',
        status: 'modeling',
        deadline: '2025-04-20',
        budget: 68000,
        currency: 'USD',
        exchangeRate: 7.24,
        budgetCNY: 492320,
        paymentStatus: 'partial',
        progress: 35,
        type: '办公建筑',
      },
      {
        id: 'NF2503',
        name: 'Berlin Innovation Center',
        protocolNumber: 'NF2503',
        client: 'Olympic Club International',
        status: 'rendering',
        deadline: '2025-02-28',
        budget: 52000,
        currency: 'EUR',
        exchangeRate: 7.85,
        budgetCNY: 408200,
        paymentStatus: 'partial',
        progress: 72,
        type: '创新中心',
      },
      {
        id: 'NF2504',
        name: '上海国际金融中心',
        protocolNumber: 'NF2504',
        client: 'Norwell置业',
        status: 'delivering',
        deadline: '2025-02-15',
        budget: 278740,
        currency: 'CNY',
        exchangeRate: 1.00,
        budgetCNY: 278740,
        paymentStatus: 'completed',
        progress: 95,
        type: '金融中心',
      },
      {
        id: 'NF2505',
        name: 'Dubai Marina Towers',
        protocolNumber: 'NF2505',
        client: '科技创新园',
        status: 'modeling',
        deadline: '2025-05-10',
        budget: 275000,
        currency: 'AED',
        exchangeRate: 1.97,
        budgetCNY: 541750,
        paymentStatus: 'partial',
        progress: 28,
        type: '海滨大厦',
      },
      {
        id: 'NF2506',
        name: 'Toronto Skyline Plaza',
        protocolNumber: 'NF2506',
        client: '文化艺术区管委会',
        status: 'rendering',
        deadline: '2025-03-25',
        budget: 58000,
        currency: 'CAD',
        exchangeRate: 5.32,
        budgetCNY: 308560,
        paymentStatus: 'completed',
        progress: 88,
        type: '城市广场',
      },
      {
        id: 'NF2507',
        name: 'London Bridge District',
        protocolNumber: 'NF2507',
        client: '海滨度假村集团',
        status: 'delivering',
        deadline: '2025-02-20',
        budget: 48000,
        currency: 'GBP',
        exchangeRate: 9.12,
        budgetCNY: 437760,
        paymentStatus: 'completed',
        progress: 100,
        type: '商业区',
      },
      {
        id: 'NF2508',
        name: 'Singapore Bay Gardens',
        protocolNumber: 'NF2508',
        client: '智慧城市开发商',
        status: 'reporting',
        deadline: '2025-06-15',
        budget: 110000,
        currency: 'SGD',
        exchangeRate: 5.36,
        budgetCNY: 589600,
        paymentStatus: 'unpaid',
        progress: 12,
        type: '海湾花园',
      },
    ]
  }

  // 获取项目数据
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true)
        
        if (!id) {
          message.error('项目ID无效')
          navigate('/projects')
          return
        }

        // 从所有项目中查找对应的项目
        const allProjects = getAllProjects()
        const project = allProjects.find(p => p.id === id)

        if (!project) {
          message.error('未找到对应的项目')
          navigate('/projects')
          return
        }

        setCurrentProject(project)

        // 根据项目数据设置表单初始值
        const formData = {
          projectName: project.name,
          protocolNumber: project.protocolNumber,
          clientName: project.client,
          projectType: project.type,
          currency: project.currency,
          budget: project.budget,
          budgetCNY: project.budgetCNY,
          exchangeRate: project.exchangeRate,
          status: project.status,
          paymentStatus: project.paymentStatus,
          progress: project.progress,
          deadline: dayjs(project.deadline),
          supplier: 'supplier1', // 默认值
          description: `${project.type}项目，预算${project.currency} ${project.budget.toLocaleString()}，转换为人民币 ¥${project.budgetCNY.toLocaleString()}。项目当前状态：${getStatusText(project.status)}，进度：${project.progress}%。`,
        }

        form.setFieldsValue(formData)

        // 根据项目类型设置团队成员数据
        setModelingMembers([
          { id: '1', name: '张建模', role: '主建模师', cost: 1500, unit: '个月' },
          { id: '2', name: '刘建模', role: '建模助理', cost: 1000, unit: '个月' }
        ])
        
        setRenderingMembers([
          { id: '1', name: '李渲染', role: '主渲染师', cost: 2000, unit: '个月' },
          { id: '2', name: '王渲染', role: '渲染助理', cost: 1500, unit: '个月' }
        ])

        setAnimationMembers([
          { id: '1', name: '赵动画', role: '动画师', cost: 2500, unit: '个月' }
        ])

        setLoading(false)
        message.success(`已加载项目"${project.name}"的信息`)
      } catch (error) {
        console.error('加载项目数据失败:', error)
        message.error('加载项目数据失败')
        setLoading(false)
      }
    }

    loadProjectData()
  }, [id, form, navigate])

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap = {
      reporting: '报备中',
      modeling: '建模',
      rendering: '渲染',
      delivering: '出图'
    }
    return statusMap[status as keyof typeof statusMap] || '未知'
  }

  // 如果正在加载，显示加载指示器
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <Spin size="large" tip="正在加载项目信息..." />
      </div>
    )
  }

  const steps = [
    { title: '基本信息', description: '项目基础信息编辑' },
    { title: '团队分配', description: '团队成员分配与费用设置' },
    { title: '预算信息', description: '项目预算配置' },
    { title: '时间安排', description: '项目时间规划' },
  ]

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
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
            <Form form={form} layout="vertical">
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
                    rules={[{ required: true, message: '请输入客户名称' }]}
                  >
                    <Input placeholder="请输入客户名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="项目类型"
                    name="projectType"
                    rules={[{ required: true, message: '请选择项目类型' }]}
                  >
                    <Select placeholder="选择项目类型">
                      <Option value="商业综合体">商业综合体</Option>
                      <Option value="办公建筑">办公建筑</Option>
                      <Option value="创新中心">创新中心</Option>
                      <Option value="金融中心">金融中心</Option>
                      <Option value="海滨大厦">海滨大厦</Option>
                      <Option value="城市广场">城市广场</Option>
                      <Option value="商业区">商业区</Option>
                      <Option value="海湾花园">海湾花园</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={8}>
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
                <Col span={8}>
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
                <Col span={8}>
                  <Form.Item
                    label="汇率"
                    name="exchangeRate"
                    rules={[{ required: true, message: '请输入汇率' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="汇率"
                      min={0}
                      step={0.01}
                      precision={4}
                    />
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
                    <Select placeholder="选择项目状态">
                      <Option value="reporting">报备中</Option>
                      <Option value="modeling">建模</Option>
                      <Option value="rendering">渲染</Option>
                      <Option value="delivering">出图</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="付款状态"
                    name="paymentStatus"
                    rules={[{ required: true, message: '请选择付款状态' }]}
                  >
                    <Select placeholder="选择付款状态">
                      <Option value="unpaid">未付款</Option>
                      <Option value="partial">部分付款</Option>
                      <Option value="completed">已付款</Option>
                      <Option value="overdue">逾期</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="项目进度(%)"
                    name="progress"
                    rules={[{ required: true, message: '请输入项目进度' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="进度百分比"
                      min={0}
                      max={100}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="项目供应商"
                    name="supplier"
                    rules={[{ required: true, message: '请选择供应商' }]}
                  >
                    <Select placeholder="选择供应商">
                      <Option value="supplier1">内部团队</Option>
                      <Option value="supplier2">外包合作商A</Option>
                      <Option value="supplier3">外包合作商B</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="项目截止日期"
                    name="deadline"
                    rules={[{ required: true, message: '请选择截止日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="项目描述" name="description">
                <TextArea rows={4} placeholder="请输入项目描述..." />
              </Form.Item>

              <Form.Item>
                <Checkbox>提供发票</Checkbox>
              </Form.Item>
            </Form>
          </Card>
        )

      case 1:
        return (
          <Card title="团队成员分配与费用设置" style={{ marginTop: 24 }}>
            {/* 建模制作人员 */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  backgroundColor: '#fa8c16', 
                  borderRadius: '50%', 
                  marginRight: 8 
                }} />
                <h4 style={{ margin: 0 }}>建模制作人员</h4>
              </div>
              
              <Select
                placeholder="选择建模制作人员..."
                style={{ width: '100%', marginBottom: 16 }}
                value=""
                dropdownRender={() => (
                  <div style={{ padding: 8 }}>
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      style={{ width: '100%' }}
                      onClick={() => {
                        const newMember = {
                          id: Date.now().toString(),
                          name: '新建模师',
                          role: '建模制作人员',
                          cost: 1500,
                          unit: '个月'
                        }
                        setModelingMembers([...modelingMembers, newMember])
                      }}
                    >
                      添加
                    </Button>
                  </div>
                )}
              />

              {modelingMembers.map((member, index) => (
                <div key={member.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 16,
                  padding: 16,
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  background: '#fafafa'
                }}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{member.role}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>费用单价（按单位）</span>
                    <InputNumber
                      value={member.cost}
                      prefix="¥"
                      onChange={(value) => {
                        const updated = [...modelingMembers]
                        updated[index].cost = value || 0
                        setModelingMembers(updated)
                      }}
                    />
                    <Select
                      value={member.unit}
                      style={{ width: 80 }}
                      onChange={(value) => {
                        const updated = [...modelingMembers]
                        updated[index].unit = value
                        setModelingMembers(updated)
                      }}
                    >
                      <Option value="个月">个月</Option>
                      <Option value="个项目">个项目</Option>
                      <Option value="小时">小时</Option>
                    </Select>
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      danger
                      onClick={() => {
                        setModelingMembers(modelingMembers.filter(m => m.id !== member.id))
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 渲染制作人员 */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  backgroundColor: '#52c41a', 
                  borderRadius: '50%', 
                  marginRight: 8 
                }} />
                <h4 style={{ margin: 0 }}>渲染制作人员</h4>
              </div>
              
              <Select
                placeholder="选择渲染制作人员..."
                style={{ width: '100%', marginBottom: 16 }}
                value=""
                dropdownRender={() => (
                  <div style={{ padding: 8 }}>
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      style={{ width: '100%' }}
                      onClick={() => {
                        const newMember = {
                          id: Date.now().toString(),
                          name: '新渲染师',
                          role: '渲染制作人员',
                          cost: 3500,
                          unit: '个月'
                        }
                        setRenderingMembers([...renderingMembers, newMember])
                      }}
                    >
                      添加
                    </Button>
                  </div>
                )}
              />

              {renderingMembers.map((member, index) => (
                <div key={member.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 16,
                  padding: 16,
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  background: '#fafafa'
                }}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{member.role}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>费用单价（按单位）</span>
                    <InputNumber
                      value={member.cost}
                      prefix="¥"
                      onChange={(value) => {
                        const updated = [...renderingMembers]
                        updated[index].cost = value || 0
                        setRenderingMembers(updated)
                      }}
                    />
                    <Select
                      value={member.unit}
                      style={{ width: 80 }}
                      onChange={(value) => {
                        const updated = [...renderingMembers]
                        updated[index].unit = value
                        setRenderingMembers(updated)
                      }}
                    >
                      <Option value="个月">个月</Option>
                      <Option value="个项目">个项目</Option>
                      <Option value="小时">小时</Option>
                    </Select>
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      danger
                      onClick={() => {
                        setRenderingMembers(renderingMembers.filter(m => m.id !== member.id))
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 动画制作人员 */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  backgroundColor: '#ff4d4f', 
                  borderRadius: '50%', 
                  marginRight: 8 
                }} />
                <h4 style={{ margin: 0 }}>动画制作人员</h4>
              </div>
              
              <Select
                placeholder="选择动画制作人员..."
                style={{ width: '100%', marginBottom: 16 }}
                value=""
                dropdownRender={() => (
                  <div style={{ padding: 8 }}>
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      style={{ width: '100%' }}
                      onClick={() => {
                        const newMember = {
                          id: Date.now().toString(),
                          name: '新动画师',
                          role: '动画制作人员',
                          cost: 2500,
                          unit: '个月'
                        }
                        setAnimationMembers([...animationMembers, newMember])
                      }}
                    >
                      添加
                    </Button>
                  </div>
                )}
              />

              {animationMembers.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#8c8c8c', 
                  padding: 32,
                  border: '1px dashed #d9d9d9',
                  borderRadius: 8 
                }}>
                  暂未添加动画制作人员
                </div>
              ) : (
                animationMembers.map((member, index) => (
                  <div key={member.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 16,
                    padding: 16,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: '#fafafa'
                  }}>
                    <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{member.role}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>费用单价（按单位）</span>
                      <InputNumber
                        value={member.cost}
                        prefix="¥"
                        onChange={(value) => {
                          const updated = [...animationMembers]
                          updated[index].cost = value || 0
                          setAnimationMembers(updated)
                        }}
                      />
                      <Select
                        value={member.unit}
                        style={{ width: 80 }}
                        onChange={(value) => {
                          const updated = [...animationMembers]
                          updated[index].unit = value
                          setAnimationMembers(updated)
                        }}
                      >
                        <Option value="个月">个月</Option>
                        <Option value="个项目">个项目</Option>
                        <Option value="小时">小时</Option>
                      </Select>
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        danger
                        onClick={() => {
                          setAnimationMembers(animationMembers.filter(m => m.id !== member.id))
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 总计费用 */}
            <div style={{ 
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 500 }}>
                已选配 {modelingMembers.length + renderingMembers.length + animationMembers.length} 名团队成员
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
                各成员费用/详细费用：¥{(modelingMembers.reduce((sum, m) => sum + m.cost, 0) + 
                renderingMembers.reduce((sum, m) => sum + m.cost, 0) + 
                animationMembers.reduce((sum, m) => sum + m.cost, 0)).toLocaleString()}
              </span>
            </div>
          </Card>
        )

      case 2:
        return (
          <Card title="项目预算信息" style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 16 }}>
                项目服务类别  
                <Tag color="blue" style={{ marginLeft: 8 }}>建筑可视化</Tag>
              </h4>
              
              <div style={{ 
                background: '#f0f9ff',
                border: '1px solid #bae7ff',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24
              }}>
                <div style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8 }}>
                  商业建筑渲染项目服务
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  包含建筑外观效果图、内部空间设计渲染等专业服务
                </div>
              </div>

              <Row gutter={16}>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: 8, 
                      height: 8, 
                      backgroundColor: '#fa8c16', 
                      borderRadius: '50%', 
                      margin: '0 auto 8px' 
                    }} />
                    <span style={{ fontSize: 12 }}>实际预算</span>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: 8, 
                      height: 8, 
                      backgroundColor: '#52c41a', 
                      borderRadius: '50%', 
                      margin: '0 auto 8px' 
                    }} />
                    <span style={{ fontSize: 12 }}>全套预算</span>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: 8, 
                      height: 8, 
                      backgroundColor: '#1890ff', 
                      borderRadius: '50%', 
                      margin: '0 auto 8px' 
                    }} />
                    <span style={{ fontSize: 12 }}>出版预算</span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 预算项目表格 */}
            <Table
              dataSource={budgetItems}
              pagination={false}
              columns={[
                {
                  title: '名称',
                  dataIndex: 'name',
                  render: (text, record) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        backgroundColor: record.id === '1' ? '#fa8c16' : record.id === '2' ? '#52c41a' : '#1890ff', 
                        borderRadius: '50%', 
                        marginRight: 8 
                      }} />
                      {text}
                    </div>
                  ),
                },
                {
                  title: '开始时间',
                  render: () => (
                    <DatePicker 
                      defaultValue={dayjs('2025-06-02')}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: '发布时间',
                  render: () => (
                    <DatePicker 
                      defaultValue={dayjs('2025-06-05')}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: '实际发布',
                  render: (_, record) => (
                    record.id !== '3' ? (
                      <Checkbox defaultChecked>自动发布到实际时间</Checkbox>
                    ) : null
                  ),
                },
              ]}
              rowKey="id"
              style={{ marginBottom: 24 }}
            />

            {/* 项目信息汇总 */}
            <Card 
              size="small"
              title={
                <span>
                  📋 项目信息补充信息
                </span>
              }
            >
              <ul style={{ margin: 0, paddingLeft: 20, color: '#8c8c8c', fontSize: 12 }}>
                <li>一定要在输入正确，根据合作伙伴和一种效率建模工作</li>
                <li>如在修改与现在名称，手动修改初始化的项目时间</li>
                <li>预先分析的重要程序已完</li>
              </ul>
            </Card>

            {/* 选择期限 */}
            <Form style={{ marginTop: 24 }}>
              <Form.Item label="项目期限设置定义（月）">
                <Select defaultValue="2" style={{ width: 120 }}>
                  <Option value="1">1个月</Option>
                  <Option value="2">2个月</Option>
                  <Option value="3">3个月</Option>
                  <Option value="6">6个月</Option>
                  <Option value="12">12个月</Option>
                </Select>
              </Form.Item>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: -16 }}>
                项目完成期限（可在过程中修改人工各种工期，自动重新排列）
              </div>
            </Form>
          </Card>
        )

      case 3:
        return (
          <Card title="项目时间安排" style={{ marginTop: 24 }}>
            <div style={{ 
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
              color: '#52c41a'
            }}>
              项目时间安排已更新
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4>项目时间确认</h4>
              <p style={{ color: '#8c8c8c', fontSize: 12 }}>
                规则如下需要统计以及我们的项目时间
              </p>
            </div>

            {/* 步骤指示器 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>1</div>
                  <span style={{ marginLeft: 8 }}>基本信息</span>
                </div>
                <div style={{ width: 40, height: 2, background: '#d9d9d9' }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>2</div>
                  <span style={{ marginLeft: 8 }}>团队分配</span>
                </div>
                <div style={{ width: 40, height: 2, background: '#d9d9d9' }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>3</div>
                  <span style={{ marginLeft: 8 }}>预算设置</span>
                </div>
                <div style={{ width: 40, height: 2, background: '#d9d9d9' }} />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>4</div>
                  <span style={{ marginLeft: 8 }}>时间安排</span>
                </div>
              </div>
            </div>

            {/* 时间安排表格 */}
            <Table
              dataSource={scheduleItems}
              pagination={false}
              columns={[
                {
                  title: '阶段',
                  dataIndex: 'phase',
                  render: (text, record) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        backgroundColor: record.color, 
                        borderRadius: '50%', 
                        marginRight: 8 
                      }} />
                      {text}
                    </div>
                  ),
                },
                {
                  title: '开始时间',
                  dataIndex: 'startDate',
                  render: (date, _, index) => (
                    <DatePicker 
                      defaultValue={dayjs(date)}
                      onChange={(value) => {
                        const updated = [...scheduleItems]
                        updated[index].startDate = value?.format('YYYY-MM-DD') || date
                        setScheduleItems(updated)
                      }}
                      disabled={index === 0}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: '发布时间',
                  dataIndex: 'endDate',
                  render: (date, _, index) => (
                    <DatePicker 
                      defaultValue={dayjs(date)}
                      onChange={(value) => {
                        const updated = [...scheduleItems]
                        updated[index].endDate = value?.format('YYYY-MM-DD') || date
                        setScheduleItems(updated)
                      }}
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: '自动排期',
                  dataIndex: 'autoSchedule',
                  render: (auto, _, index) => (
                    <Checkbox 
                      checked={auto}
                      onChange={(e) => {
                        const updated = [...scheduleItems]
                        updated[index].autoSchedule = e.target.checked
                        setScheduleItems(updated)
                      }}
                    >
                      自动发布到实际时间
                    </Checkbox>
                  ),
                },
              ]}
              rowKey="id"
            />
          </Card>
        )

      default:
        return null
    }
  }

  const next = () => {
    if (currentStep === 0) {
      form.validateFields().then(() => {
        setCurrentStep(currentStep + 1)
      }).catch(() => {
        message.error('请完善基本信息')
      })
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const prev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleFinish = () => {
    form.validateFields().then((values) => {
      // 这里应该调用API保存项目数据
      // 目前只是模拟保存成功
      console.log('保存项目数据:', {
        ...values,
        projectId: id,
        currentProject
      })
      
      message.success(`项目"${currentProject?.name}"更新成功！`)
      setTimeout(() => {
        navigate('/projects')
      }, 1500)
    }).catch(() => {
      message.error('请完善所有必填信息')
    })
  }

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面头部 */}
      <div style={{ 
        background: '#fff', 
        padding: '16px 24px', 
        borderRadius: 8, 
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
          type="text"
        >
          返回项目列表
        </Button>
        <div>
          <h2 style={{ margin: 0 }}>编辑项目</h2>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: 14 }}>
            编辑项目信息和配置
          </p>
        </div>
      </div>

      {/* 步骤条 */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <Steps current={currentStep}>
          {steps.map((item, index) => (
            <Step 
              key={index} 
              title={item.title} 
              description={item.description}
            />
          ))}
        </Steps>
      </div>

      {/* 步骤内容 */}
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        {renderStepContent()}
        
        {/* 底部按钮 */}
        <div style={{ 
          padding: 24, 
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            {currentStep > 0 && (
              <Button onClick={prev}>
                上一步
              </Button>
            )}
          </div>
          <div>
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                下一步 ›
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleFinish}>
                💾 保存修改
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProject 