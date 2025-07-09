import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Steps,
  Button,
  Form,
  message,
  Spin,
} from 'antd'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

// 导入类型定义
import { 
  Project, 
  TeamMember, 
  ScheduleItem, 
  ExchangeRate, 
  BudgetConfig, 
  ImageQuantity,
  DepartmentCost 
} from '../types/project'

// 导入组件
import ProjectBasicInfoForm from '../components/project/ProjectBasicInfoForm'
import TeamMemberManager from '../components/project/TeamMemberManager'
import ProjectSchedule from '../components/project/ProjectSchedule'

const { Step } = Steps

interface Client {
  id: string
  companyName: string
  companyNameCN: string
  contactPerson: string
  preferredCurrency: string
  projectPreferences: {
    style: string[]
    budget: string | string[]
    timeline: string | string[]
    communication: string | string[]
  }
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  
  // 客户和预算相关状态
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [projectBudget, setProjectBudget] = useState<number>(0)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('CNY')
  
  // 团队成员数据
  const [modelingMembers, setModelingMembers] = useState<TeamMember[]>([])
  const [renderingMembers, setRenderingMembers] = useState<TeamMember[]>([])
  const [managementMembers, setManagementMembers] = useState<TeamMember[]>([])

  // 项目时间安排数据
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      phase: '项目报备',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      color: '#fa8c16',
      autoSchedule: false,
      duration: 4,
    },
    {
      id: '2', 
      phase: '建模阶段',
      startDate: dayjs().add(4, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().add(10, 'day').format('YYYY-MM-DD'),
      color: '#52c41a',
      autoSchedule: true,
      duration: 7,
    },
    {
      id: '3',
      phase: '渲染阶段',
      startDate: dayjs().add(11, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().add(17, 'day').format('YYYY-MM-DD'),
      color: '#1890ff',
      autoSchedule: true,
      duration: 7,
    },
    {
      id: '4',
      phase: '出图交付',
      startDate: dayjs().add(18, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().add(20, 'day').format('YYYY-MM-DD'),
      color: '#722ed1',
      autoSchedule: true,
      duration: 3,
    },
  ])

  // 客户数据（模拟）
  const clients: Client[] = [
    {
      id: 'client1',
      companyName: 'Bathurst Development Co.',
      companyNameCN: 'Bathurst开发公司',
      contactPerson: '张经理',
      preferredCurrency: 'AUD',
      projectPreferences: {
        style: ['现代', '商业'],
        budget: ['50000-100000'],
        timeline: ['2-3个月'],
        communication: ['邮件', '微信']
      }
    },
    {
      id: 'client2',
      companyName: 'NCCEC Group',
      companyNameCN: 'NCCEC集团',
      contactPerson: '李总',
      preferredCurrency: 'USD',
      projectPreferences: {
        style: ['现代', '办公'],
        budget: ['100000+'],
        timeline: ['3-6个月'],
        communication: ['邮件', '电话']
      }
    },
    {
      id: 'client3',
      companyName: 'Olympic Club International',
      companyNameCN: 'Olympic俱乐部国际',
      contactPerson: '王主任',
      preferredCurrency: 'EUR',
      projectPreferences: {
        style: ['创新', '现代'],
        budget: ['30000-80000'],
        timeline: ['1-2个月'],
        communication: ['微信', '钉钉']
      }
    }
  ]

  // 汇率数据（模拟）
  const exchangeRates: ExchangeRate[] = [
    { currency: '人民币', currencyCode: 'CNY', currencySymbol: '¥', rate: 1.0000, region: '中国', flag: '🇨🇳' },
    { currency: '美元', currencyCode: 'USD', currencySymbol: '$', rate: 7.2400, region: '美国', flag: '🇺🇸' },
    { currency: '澳元', currencyCode: 'AUD', currencySymbol: 'A$', rate: 4.7800, region: '澳大利亚', flag: '🇦🇺' },
    { currency: '欧元', currencyCode: 'EUR', currencySymbol: '€', rate: 7.8500, region: '欧盟', flag: '🇪🇺' },
    { currency: '英镑', currencyCode: 'GBP', currencySymbol: '£', rate: 9.1200, region: '英国', flag: '🇬🇧' },
    { currency: '加元', currencyCode: 'CAD', currencySymbol: 'C$', rate: 5.3200, region: '加拿大', flag: '🇨🇦' },
    { currency: '新加坡元', currencyCode: 'SGD', currencySymbol: 'S$', rate: 5.3600, region: '新加坡', flag: '🇸🇬' },
    { currency: '迪拉姆', currencyCode: 'AED', currencySymbol: 'د.إ', rate: 1.9700, region: '阿联酋', flag: '🇦🇪' },
  ]

  // 检查是否为编辑模式
  useEffect(() => {
    if (id) {
      setIsEditMode(true)
      loadProjectData()
    }
  }, [id])

  // 获取所有项目数据
  const getAllProjects = (): Project[] => {
    try {
      const storedProjects = localStorage.getItem('nflab_projects')
      if (storedProjects) {
        return JSON.parse(storedProjects)
      }
    } catch (error) {
      console.error('获取项目数据失败:', error)
    }
    return []
  }

  // 加载项目数据（编辑模式）
  const loadProjectData = async () => {
    try {
      setLoading(true)
      const allProjects = getAllProjects()
      const project = allProjects.find(p => p.id === id)
      
      if (project) {
        setCurrentProject(project)
        
        // 填充表单数据
        form.setFieldsValue({
          projectName: project.name,
          protocolNumber: project.protocolNumber,
          clientName: project.client,
          projectType: project.type,
          currency: project.currency,
          budget: project.budget,
          exchangeRate: project.exchangeRate,
          status: project.status,
          paymentStatus: project.paymentStatus,
          progress: project.progress,
          deadline: dayjs(project.deadline),
          supplier: 'supplier1',
          description: '',
        })
        
        setSelectedCurrency(project.currency)
        setProjectBudget(project.budget)
        
        message.success('项目数据加载成功')
      } else {
        message.error('项目不存在')
        navigate('/projects')
      }
    } catch (error) {
      console.error('加载项目数据失败:', error)
      message.error('加载项目数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 生成协议号
  const generateProtocolNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `NF${year}${month}${day}${random}`
  }

  // 处理客户选择
  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setSelectedClient(client)
      setSelectedCurrency(client.preferredCurrency)
      form.setFieldsValue({
        clientId: clientId,
        currency: client.preferredCurrency
      })
    }
  }

  // 计算总成本
  const calculateTotalCost = () => {
    const allMembers = [...modelingMembers, ...renderingMembers, ...managementMembers]
    return allMembers.reduce((sum, member) => sum + member.unitPrice, 0)
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <ProjectBasicInfoForm
              form={form}
              currentProject={currentProject}
            />
            
            {/* 客户选择 */}
            <div style={{
              background: '#fff',
              padding: 24,
              borderRadius: 8,
              marginTop: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3>客户信息</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {clients.map(client => (
                  <div
                    key={client.id}
                    style={{
                      border: selectedClient?.id === client.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: 8,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleClientSelect(client.id)}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>
                      {client.companyName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
                      中文名：{client.companyNameCN}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
                      联系人：{client.contactPerson}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1890ff' }}>
                      偏好币种：{client.preferredCurrency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3>团队成员分配</h3>
            
            <TeamMemberManager
              title="项目管理人员"
              color="#722ed1"
              members={managementMembers}
              onMembersChange={setManagementMembers}
            />
            
            <TeamMemberManager
              title="建模制作人员"
              color="#fa8c16"
              members={modelingMembers}
              onMembersChange={setModelingMembers}
            />
            
            <TeamMemberManager
              title="渲染制作人员"
              color="#52c41a"
              members={renderingMembers}
              onMembersChange={setRenderingMembers}
            />

            {/* 成本统计 */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: '#f5f5f5',
              borderRadius: 8
            }}>
              <h4>成本统计</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>管理费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
                    ¥{managementMembers.reduce((sum, m) => sum + m.unitPrice, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>建模费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
                    ¥{modelingMembers.reduce((sum, m) => sum + m.unitPrice, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>渲染费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    ¥{renderingMembers.reduce((sum, m) => sum + m.unitPrice, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>总成本</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    ¥{calculateTotalCost().toLocaleString()}
                  </div>
                </div>
              </div>
              
              {projectBudget > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e8e8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>项目预算：¥{projectBudget.toLocaleString()}</span>
                    <span style={{ 
                      color: projectBudget > calculateTotalCost() ? '#52c41a' : '#ff4d4f',
                      fontWeight: 'bold'
                    }}>
                      利润：¥{(projectBudget - calculateTotalCost()).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <ProjectSchedule
            scheduleItems={scheduleItems}
            onScheduleChange={setScheduleItems}
          />
        )

      case 3:
        return (
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3>项目预览与确认</h3>
            <div style={{ padding: '20px 0' }}>
              {/* 项目基本信息 */}
              <div style={{ marginBottom: 24 }}>
                <h4>项目基本信息</h4>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 20, 
                  borderRadius: 8,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16
                }}>
                  <div><strong>项目名称：</strong>{form.getFieldValue('projectName')}</div>
                  <div><strong>协议号：</strong>{form.getFieldValue('protocolNumber')}</div>
                  <div><strong>客户：</strong>{selectedClient?.companyNameCN || form.getFieldValue('clientName')}</div>
                  <div><strong>项目类型：</strong>{form.getFieldValue('projectType')}</div>
                  <div><strong>预算：</strong>¥{projectBudget.toLocaleString()}</div>
                  <div><strong>币种：</strong>{selectedCurrency}</div>
                </div>
              </div>

              {/* 团队配置 */}
              <div style={{ marginBottom: 24 }}>
                <h4>团队配置</h4>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 20, 
                  borderRadius: 8 
                }}>
                  <div>管理人员：{managementMembers.length} 人</div>
                  <div>建模人员：{modelingMembers.length} 人</div>
                  <div>渲染人员：{renderingMembers.length} 人</div>
                  <div style={{ marginTop: 8, fontWeight: 'bold' }}>
                    总成本：¥{calculateTotalCost().toLocaleString()}
                  </div>
                  <div style={{ fontWeight: 'bold', color: projectBudget > calculateTotalCost() ? '#52c41a' : '#ff4d4f' }}>
                    预期利润：¥{(projectBudget - calculateTotalCost()).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 时间安排 */}
              <div>
                <h4>时间安排</h4>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 20, 
                  borderRadius: 8 
                }}>
                  <div>项目阶段：{scheduleItems.length} 个</div>
                  <div>
                    总工期：{Math.max(...scheduleItems.map(item => 
                      dayjs(item.endDate).diff(dayjs(scheduleItems[0].startDate), 'day')
                    )) + 1} 天
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {scheduleItems.map(item => (
                      <div key={item.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        marginBottom: 4 
                      }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          backgroundColor: item.color,
                          borderRadius: '50%'
                        }} />
                        <span>{item.phase}: {dayjs(item.startDate).format('MM/DD')} - {dayjs(item.endDate).format('MM/DD')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const next = () => {
    if (currentStep === 0) {
      // 验证第一步必填项
      const protocolNumber = form.getFieldValue('protocolNumber')
      const projectName = form.getFieldValue('projectName')
      
      if (!protocolNumber || !projectName || !selectedClient) {
        message.error('请完善项目基本信息和客户选择')
        return
      }
      
      if (!projectBudget || projectBudget <= 0) {
        message.error('请设置项目预算')
        return
      }
    }
    
    if (currentStep === 1) {
      // 验证第二步团队分配
      const totalMembers = managementMembers.length + modelingMembers.length + renderingMembers.length
      if (totalMembers === 0) {
        message.error('请至少分配一名团队成员')
        return
      }
    }
    
    setCurrentStep(currentStep + 1)
  }

  const prev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleFinish = async () => {
    try {
      const projectData: Project = {
        id: isEditMode ? id! : `NF${Date.now().toString().slice(-6)}`,
        name: form.getFieldValue('projectName'),
        protocolNumber: form.getFieldValue('protocolNumber'),
        client: selectedClient?.companyNameCN || form.getFieldValue('clientName'),
        status: isEditMode ? currentProject?.status || 'reporting' : 'reporting',
        deadline: dayjs().add(30, 'day').format('YYYY-MM-DD'), // 默认30天后
        budget: projectBudget,
        currency: selectedCurrency,
        exchangeRate: exchangeRates.find(rate => rate.currencyCode === selectedCurrency)?.rate || 1,
        budgetCNY: projectBudget * (exchangeRates.find(rate => rate.currencyCode === selectedCurrency)?.rate || 1),
        paymentStatus: 'unpaid',
        progress: isEditMode ? currentProject?.progress || 0 : 0,
        type: form.getFieldValue('projectType') || '项目',
        createdAt: isEditMode ? currentProject?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // 获取现有项目数据
      const existingProjects = getAllProjects()
      
      let updatedProjects
      if (isEditMode) {
        // 编辑模式：更新现有项目
        updatedProjects = existingProjects.map(project => 
          project.id === id ? projectData : project
        )
        message.success(`项目"${projectData.name}"更新成功！`)
      } else {
        // 新建模式：添加新项目
        updatedProjects = [...existingProjects, projectData]
        message.success(`项目"${projectData.name}"创建成功！`)
      }
      
      // 保存到localStorage
      localStorage.setItem('nflab_projects', JSON.stringify(updatedProjects))
      
      console.log(isEditMode ? '项目更新数据:' : '项目创建数据:', projectData)
      
      // 延迟跳转
      setTimeout(() => {
        navigate('/projects')
      }, 1500)
      
    } catch (error) {
      console.error('保存项目数据失败:', error)
      message.error('保存项目数据失败，请重试')
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <Spin size="large" tip="加载项目数据中..." />
      </div>
    )
  }

  const steps = [
    {
      title: '基本信息',
      description: '项目基础信息和客户选择',
    },
    {
      title: '团队配置',
      description: '分配团队成员和预算',
    },
    {
      title: '时间安排',
      description: '设置项目时间规划',
    },
    {
      title: '确认提交',
      description: '预览并确认项目信息',
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
          >
            返回项目列表
          </Button>
          <div>
            <h1>{isEditMode ? '编辑项目' : '新建项目'}</h1>
            <p style={{ color: '#8c8c8c', marginTop: 8 }}>
              {isEditMode ? '修改项目信息和配置' : '创建新的项目并配置团队和时间安排'}
            </p>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
            />
          ))}
        </Steps>

        <div style={{ minHeight: '60vh' }}>
          {renderStepContent()}
        </div>

        <div style={{ 
          marginTop: 24, 
          textAlign: 'center',
          padding: '20px 0',
          borderTop: '1px solid #f0f0f0'
        }}>
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={prev}>
              上一步
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={next}>
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleFinish}>
              {isEditMode ? '保存项目' : '创建项目'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateProject