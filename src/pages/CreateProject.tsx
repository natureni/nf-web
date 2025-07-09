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
import { getProjectExchangeRates, isFixedRateMode, getRateModeDescription } from '../utils/exchangeRates'

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
  
  // 预算相关状态
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

  // 汇率数据（从系统设置获取）
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])

  // 初始化汇率数据
  useEffect(() => {
    const projectRates = getProjectExchangeRates()
    setExchangeRates(projectRates)
  }, [])

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
          deadline: dayjs(project.deadline),
          description: '',
          // 如果项目有已付金额信息，也要填充
          paidAmount: (project as any).paidAmount,
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

  // 计算总成本
  const calculateTotalCost = () => {
    const allMembers = [...modelingMembers, ...renderingMembers, ...managementMembers]
    return allMembers.reduce((sum, member) => sum + member.unitPrice, 0)
  }

  // 根据项目状态自动计算进度
  const calculateProgressByStatus = (status: string): number => {
    const progressMap = {
      'reporting': 5,    // 报备中: 5%
      'modeling': 25,    // 建模: 25%
      'rendering': 60,   // 渲染: 60%
      'delivering': 90,  // 出图: 90%
      'paused': 0        // 暂停: 保持当前进度(这里返回0，实际应保持原进度)
    }
    return progressMap[status as keyof typeof progressMap] || 0
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
                  <div><strong>客户：</strong>{form.getFieldValue('clientName')}</div>
                  <div><strong>项目类型：</strong>{form.getFieldValue('projectType')}</div>
                  <div><strong>项目状态：</strong>{
                    (() => {
                      const status = form.getFieldValue('status')
                      const statusMap = {
                        'reporting': '报备中',
                        'modeling': '建模',
                        'rendering': '渲染', 
                        'delivering': '出图',
                        'paused': '暂停'
                      }
                      return statusMap[status as keyof typeof statusMap] || status
                    })()
                  }</div>
                  <div><strong>付款状态：</strong>{
                    (() => {
                      const paymentStatus = form.getFieldValue('paymentStatus')
                      const paymentMap = {
                        'unpaid': '未付款',
                        'partial': '部分付款',
                        'completed': '已付款',
                        'overdue': '逾期'
                      }
                      const statusText = paymentMap[paymentStatus as keyof typeof paymentMap] || paymentStatus
                      
                      // 如果是部分付款，显示已付金额
                      if (paymentStatus === 'partial') {
                        const paidAmount = form.getFieldValue('paidAmount')
                        const budget = form.getFieldValue('budget')
                        if (paidAmount && budget) {
                          const percentage = ((paidAmount / budget) * 100).toFixed(1)
                          return `${statusText} (已付: ${paidAmount.toLocaleString()}, ${percentage}%)`
                        }
                      }
                      
                      return statusText
                    })()
                  }</div>
                  <div><strong>预算：</strong>{selectedCurrency} {projectBudget.toLocaleString()}</div>
                  <div><strong>币种：</strong>{selectedCurrency}</div>
                  <div><strong>项目进度：</strong>{calculateProgressByStatus(form.getFieldValue('status') || 'reporting')}% (根据状态自动计算)</div>
                  <div><strong>预期项目结束时期：</strong>{
                    form.getFieldValue('deadline') ? dayjs(form.getFieldValue('deadline')).format('YYYY-MM-DD') : '未设置'
                  }</div>
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
      const clientName = form.getFieldValue('clientName')
      
      if (!protocolNumber || !projectName || !clientName) {
        message.error('请完善项目基本信息')
        return
      }
      
      if (!projectBudget || projectBudget <= 0) {
        message.error('请设置项目预算')
        return
      }

      // 验证部分付款时的已付金额
      const paymentStatus = form.getFieldValue('paymentStatus')
      if (paymentStatus === 'partial') {
        const paidAmount = form.getFieldValue('paidAmount')
        if (!paidAmount || paidAmount <= 0) {
          message.error('部分付款状态下请输入已付金额')
          return
        }
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
      const status = form.getFieldValue('status') || 'reporting'
      const paymentStatus = form.getFieldValue('paymentStatus') || 'unpaid'
      const paidAmount = paymentStatus === 'partial' ? form.getFieldValue('paidAmount') : 0
      
      const projectData: Project = {
        id: isEditMode ? id! : `NF${Date.now().toString().slice(-6)}`,
        name: form.getFieldValue('projectName'),
        protocolNumber: form.getFieldValue('protocolNumber'),
        client: form.getFieldValue('clientName'),
        status: status,
        deadline: form.getFieldValue('deadline') ? dayjs(form.getFieldValue('deadline')).format('YYYY-MM-DD') : dayjs().add(30, 'day').format('YYYY-MM-DD'),
        budget: projectBudget,
        currency: selectedCurrency,
        exchangeRate: exchangeRates.find(rate => rate.currencyCode === selectedCurrency)?.rate || 1,
        budgetCNY: projectBudget * (exchangeRates.find(rate => rate.currencyCode === selectedCurrency)?.rate || 1),
        paymentStatus: paymentStatus,
        progress: calculateProgressByStatus(status),
        type: form.getFieldValue('projectType') || '项目',
        createdAt: isEditMode ? currentProject?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // 添加已付金额字段（扩展Project类型）
        ...(paymentStatus === 'partial' && { paidAmount: paidAmount }),
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