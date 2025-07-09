import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Steps,
  Button,
  Form,
  Card,
  message,
  Spin,
} from 'antd'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

// 导入类型定义
import { Project, TeamMember, ScheduleItem } from '../types/project'

// 导入组件
import ProjectBasicInfoForm from '../components/project/ProjectBasicInfoForm'
import TeamMemberManager from '../components/project/TeamMemberManager'
import ProjectSchedule from '../components/project/ProjectSchedule'

const { Step } = Steps

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

  // 项目时间安排数据
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      phase: '项目报备',
      startDate: '2025-06-02',
      endDate: '2025-06-05',
      color: '#fa8c16',
      autoSchedule: false,
      duration: 4,
    },
    {
      id: '2', 
      phase: '项目建模与设计',
      startDate: '2025-06-06',
      endDate: '2025-06-07',
      color: '#52c41a',
      autoSchedule: true,
      duration: 2,
    },
    {
      id: '3',
      phase: '项目制作设计',
      startDate: '2025-06-08', 
      endDate: '2025-06-12',
      color: '#1890ff',
      autoSchedule: true,
      duration: 5,
    },
    {
      id: '4',
      phase: '项目制作完善改造',
      startDate: '2025-06-13',
      endDate: '2025-06-19',
      color: '#52c41a',
      autoSchedule: true,
      duration: 7,
    },
    {
      id: '5',
      phase: '项目发副总监',
      startDate: '2025-06-20',
      endDate: '2025-06-28',
      color: '#ff4d4f',
      autoSchedule: true,
      duration: 9,
    },
  ])

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
    
    // 返回默认数据
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
      // 可以添加更多默认项目...
    ]
  }

  // 加载项目数据
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
          supplier: 'supplier1', // 默认值
          description: '', // 默认值
        })
        
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

  // 组件挂载时加载数据
  useEffect(() => {
    if (id) {
      loadProjectData()
    }
  }, [id])

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectBasicInfoForm
            form={form}
            currentProject={currentProject}
          />
        )

      case 1:
        return (
          <Card title="团队成员分配与费用设置" style={{ marginTop: 24 }}>
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
            
            <TeamMemberManager
              title="动画制作人员"
              color="#1890ff"
              members={animationMembers}
              onMembersChange={setAnimationMembers}
            />

            {/* 费用总计 */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: '#f5f5f5',
              borderRadius: 8
            }}>
              <h4>费用统计</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>动画费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                    ¥{animationMembers.reduce((sum, m) => sum + m.unitPrice, 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>总费用</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  ¥{[...modelingMembers, ...renderingMembers, ...animationMembers]
                    .reduce((sum, m) => sum + m.unitPrice, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
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
          <Card title="项目预览与确认" style={{ marginTop: 24 }}>
            <div style={{ padding: '20px 0' }}>
              <h3>项目信息确认</h3>
              {currentProject && (
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 20, 
                  borderRadius: 8,
                  marginTop: 16 
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div>
                      <strong>项目名称：</strong>{form.getFieldValue('projectName') || currentProject.name}
                    </div>
                    <div>
                      <strong>协议号：</strong>{form.getFieldValue('protocolNumber') || currentProject.protocolNumber}
                    </div>
                    <div>
                      <strong>客户：</strong>{form.getFieldValue('clientName') || currentProject.client}
                    </div>
                    <div>
                      <strong>预算：</strong>¥{(form.getFieldValue('budget') || currentProject.budget).toLocaleString()}
                    </div>
                    <div>
                      <strong>状态：</strong>{form.getFieldValue('status') || currentProject.status}
                    </div>
                    <div>
                      <strong>进度：</strong>{form.getFieldValue('progress') || currentProject.progress}%
                    </div>
                  </div>
                </div>
              )}
              
              <h3 style={{ marginTop: 24 }}>团队配置</h3>
              <div style={{ 
                background: '#f5f5f5', 
                padding: 20, 
                borderRadius: 8,
                marginTop: 16 
              }}>
                <div>建模人员：{modelingMembers.length} 人</div>
                <div>渲染人员：{renderingMembers.length} 人</div>
                <div>动画人员：{animationMembers.length} 人</div>
                <div style={{ marginTop: 8, fontWeight: 'bold' }}>
                  总计费用：¥{[...modelingMembers, ...renderingMembers, ...animationMembers]
                    .reduce((sum, m) => sum + m.unitPrice, 0).toLocaleString()}
                </div>
              </div>

              <h3 style={{ marginTop: 24 }}>时间安排</h3>
              <div style={{ 
                background: '#f5f5f5', 
                padding: 20, 
                borderRadius: 8,
                marginTop: 16 
              }}>
                <div>项目阶段：{scheduleItems.length} 个</div>
                <div>
                  总工期：{Math.max(...scheduleItems.map(item => 
                    dayjs(item.endDate).diff(dayjs(scheduleItems[0].startDate), 'day')
                  )) + 1} 天
                </div>
              </div>
            </div>
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

  const handleFinish = async () => {
    try {
      const formValues = await form.validateFields()
      
      // 构建更新后的项目数据
      const updatedProject: Project = {
        ...currentProject!,
        name: formValues.projectName,
        protocolNumber: formValues.protocolNumber,
        client: formValues.clientName,
        type: formValues.projectType,
        currency: formValues.currency,
        budget: formValues.budget,
        exchangeRate: formValues.exchangeRate,
        budgetCNY: formValues.budget * formValues.exchangeRate,
        status: formValues.status,
        paymentStatus: formValues.paymentStatus,
        progress: formValues.progress,
        deadline: formValues.deadline.format('YYYY-MM-DD'),
        updatedAt: new Date().toISOString(),
      }

      // 保存到localStorage
      const allProjects = getAllProjects()
      const updatedProjects = allProjects.map(p => 
        p.id === id ? updatedProject : p
      )
      
      localStorage.setItem('nflab_projects', JSON.stringify(updatedProjects))
      
      message.success('项目更新成功！')
      navigate('/projects')
    } catch (error) {
      console.error('保存项目失败:', error)
      message.error('保存项目失败，请重试')
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
      description: '项目基础信息设置',
    },
    {
      title: '团队配置',
      description: '分配团队成员和费用',
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
            <h1>编辑项目</h1>
            <p style={{ color: '#8c8c8c', marginTop: 8 }}>
              修改项目信息、团队配置和时间安排
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
              保存项目
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditProject 