import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Steps,
  Button,
  Form,
  Card,
  message,
  Spin,
  InputNumber,
  Row,
  Col,
  Tag,
  Upload,
} from 'antd'
import {
  ArrowLeftOutlined,
  PictureOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

// 导入类型定义
import { Project, ProjectTeamMember, ScheduleItem } from '../types/project'

// 导入组件
import ProjectBasicInfoForm from '../components/project/ProjectBasicInfoForm'
import TeamMemberManager from '../components/project/TeamMemberManager'
import ProjectSchedule from '../components/project/ProjectSchedule'
import { getProjectExchangeRates } from '../utils/exchangeRates'

const { Step } = Steps

const EditProject: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  // 团队成员数据 - 扩展为多个部门
  const [modelingMembers, setModelingMembers] = useState<ProjectTeamMember[]>([])
  const [renderingMembers, setRenderingMembers] = useState<ProjectTeamMember[]>([])
  const [animationMembers, setAnimationMembers] = useState<ProjectTeamMember[]>([])
  const [managerMembers, setManagerMembers] = useState<ProjectTeamMember[]>([])
  const [salesMembers, setSalesMembers] = useState<ProjectTeamMember[]>([])

  // 图量设置状态
  const [imageQuantities, setImageQuantities] = useState({
    birdView: 1,
    halfBirdView: 2,
    humanView: 2,
    animation: 30
  })

  // 项目时间安排数据
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      phase: '项目报备',
      startDate: '2025-06-02',
      endDate: '2025-06-05',
      color: '#d9d9d9', // 灰色
      autoSchedule: false,
      duration: 4,
    },
    {
      id: '2', 
      phase: '项目建模',
      startDate: '2025-06-06',
      endDate: '2025-06-07',
      color: '#fa8c16', // 橙色
      autoSchedule: true,
      duration: 2,
    },
    {
      id: '3',
      phase: '项目渲染/动画',
      startDate: '2025-06-08', 
      endDate: '2025-06-12',
      color: '#52c41a', // 绿色 (渲染/动画)
      autoSchedule: true,
      duration: 5,
    },
    {
      id: '4',
      phase: '项目出图',
      startDate: '2025-06-13',
      endDate: '2025-06-19',
      color: '#ff4d4f', // 红色 (出图)
      autoSchedule: true,
      duration: 7,
    },
    {
      id: '5',
      phase: '项目暂停',
      startDate: '2025-06-20',
      endDate: '2025-06-28',
      color: '#8c8c8c', // 浅灰色 (暂停)
      autoSchedule: true,
      duration: 9,
    },
  ])

  // 计算基于图量的预算（从ProjectBasicInfoForm复制）
  const calculateBudgetFromImages = (): number => {
    // 标准单价（美元基准）
    const basePrices = {
      humanView: 800,
      halfBirdView: 1200,
      birdView: 1600,
      animation: 170
    }

    // 计算美元总计
    const humanViewUSD = imageQuantities.humanView * basePrices.humanView
    const halfBirdViewUSD = imageQuantities.halfBirdView * basePrices.halfBirdView
    const birdViewUSD = imageQuantities.birdView * basePrices.birdView
    const animationUSD = imageQuantities.animation * basePrices.animation
    
    const totalUSD = humanViewUSD + halfBirdViewUSD + birdViewUSD + animationUSD
    
    // 转换为人民币：美元金额 × 美元汇率（使用系统设置中的汇率）
    const exchangeRates = getProjectExchangeRates()
    const usdRate = exchangeRates.find(rate => rate.currencyCode === 'USD')?.rate || 7.2
    
    return Math.round(totalUSD * usdRate)
  }

  // 获取所有项目数据
  const getAllProjects = (): Project[] => {
    try {
      const storedProjects = localStorage.getItem('nflab_projects')
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects)
        
        // 检查是否有旧数据需要更新（检查NF2501项目的预算）
        const nf2501Project = parsedProjects.find((p: Project) => p.id === 'NF2501')
        if (nf2501Project && (nf2501Project.budget !== 15226 || nf2501Project.budgetCNY !== 68517)) {
          console.log('检测到旧数据，更新为新的默认数据')
          const defaultProjects = getDefaultProjectsData()
          localStorage.setItem('nflab_projects', JSON.stringify(defaultProjects))
          return defaultProjects
        }
        
        return parsedProjects
      }
    } catch (error) {
      console.error('获取项目数据失败:', error)
    }
    
    // 返回默认数据
    return getDefaultProjectsData()
  }

  // 默认项目数据
  const getDefaultProjectsData = (): Project[] => {
    return [
      {
        id: 'NF2501',
        name: 'Sydney CBD Tower',
        protocolNumber: 'NF2501',
        client: 'Bathurst开发公司',
        status: 'reporting',
        deadline: '2025-03-15',
        budget: 15226,
        currency: 'AUD',
        exchangeRate: 4.5,
        budgetCNY: 68517,
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
        budget: 68400,
        currency: 'USD',
        exchangeRate: 7.24,
        budgetCNY: 495216,
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

  // 处理图量分配
  const handleImageQuantityDistribution = (distribution: any) => {
    // 更新建模成员的工作量
    const updatedModelingMembers = modelingMembers.map(member => ({
      ...member,
      assignedWorkload: distribution[member.id]?.modeling || member.assignedWorkload || 1
    }))

    // 更新渲染成员的工作量和具体分配
    const updatedRenderingMembers = renderingMembers.map(member => {
      const memberDistribution = distribution[member.id]
      if (memberDistribution) {
        return {
          ...member,
          assignedWorkload: (memberDistribution.birdView || 0) + (memberDistribution.halfBirdView || 0) + (memberDistribution.humanView || 0) || member.assignedWorkload || 1,
          imageDistribution: {
            birdView: memberDistribution.birdView || 0,
            halfBirdView: memberDistribution.halfBirdView || 0,
            humanView: memberDistribution.humanView || 0
          }
        }
      }
      return member
    })

    // 更新动画成员的工作量
    const updatedAnimationMembers = animationMembers.map(member => ({
      ...member,
      assignedWorkload: distribution[member.id]?.animation || member.assignedWorkload || 1
    }))

    setModelingMembers(updatedModelingMembers)
    setRenderingMembers(updatedRenderingMembers)
    setAnimationMembers(updatedAnimationMembers)
  }

  // 智能分配算法
  const smartDistribute = () => {
    // 为建模成员分配工作量
    const updatedModelingMembers = modelingMembers.map(member => ({
      ...member,
      birdViewWorkload: imageQuantities.birdView,
      halfBirdViewWorkload: imageQuantities.halfBirdView,
      humanViewWorkload: imageQuantities.humanView,
      animationWorkload: 0
    }))

    // 为渲染成员分配工作量（平均分配）
    const updatedRenderingMembers = renderingMembers.map((member, index) => {
      const memberCount = renderingMembers.length
      const birdViewPerMember = Math.floor(imageQuantities.birdView / memberCount) + (index < imageQuantities.birdView % memberCount ? 1 : 0)
      const halfBirdViewPerMember = Math.floor(imageQuantities.halfBirdView / memberCount) + (index < imageQuantities.halfBirdView % memberCount ? 1 : 0)
      const humanViewPerMember = Math.floor(imageQuantities.humanView / memberCount) + (index < imageQuantities.humanView % memberCount ? 1 : 0)
      
      return {
        ...member,
        birdViewWorkload: birdViewPerMember,
        halfBirdViewWorkload: halfBirdViewPerMember,
        humanViewWorkload: humanViewPerMember,
        animationWorkload: 0
      }
    })

    // 为动画成员分配工作量（平均分配）
    const updatedAnimationMembers = animationMembers.map((member, index) => {
      const memberCount = animationMembers.length
      const animationPerMember = Math.floor(imageQuantities.animation / memberCount) + (index < imageQuantities.animation % memberCount ? 1 : 0)
      
      return {
        ...member,
        birdViewWorkload: 0,
        halfBirdViewWorkload: 0,
        humanViewWorkload: 0,
        animationWorkload: animationPerMember
      }
    })

    setModelingMembers(updatedModelingMembers)
    setRenderingMembers(updatedRenderingMembers)
    setAnimationMembers(updatedAnimationMembers)
    
    message.success('智能分配完成！已为每个成员分配工作量')
  }

  // 获取项目预算（动态计算）
  const getProjectBudget = (): number => {
    // 优先使用当前项目的人民币预算
    if (currentProject?.budgetCNY) {
      return currentProject.budgetCNY
    }
    
    // 如果没有，则基于图量计算
    return calculateBudgetFromImages()
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    const projectBudget = getProjectBudget() // 动态获取预算

    switch (currentStep) {
      case 0:
        return (
          <ProjectBasicInfoForm
            form={form}
            currentProject={currentProject}
            imageQuantities={imageQuantities}
            onImageQuantitiesChange={setImageQuantities}
            projectTotalPrice={projectBudget} // 使用动态预算
          />
        )

      case 1:
        return (
          <Card title="团队成员分配与费用设置" style={{ marginTop: 24 }}>
            {/* 图量设置区域 */}
            <Card size="small" style={{ marginBottom: 24, backgroundColor: '#f8f9fa' }}>
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <PictureOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  项目图量设置
                </h4>
              </div>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={5}>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="red">鸟瞰视角</Tag>
                  </div>
                    <InputNumber
                    value={imageQuantities.birdView}
                    onChange={(value) => setImageQuantities(prev => ({ ...prev, birdView: value || 0 }))}
                      min={0}
                    style={{ width: '100%' }}
                    addonAfter="张"
                    />
                </Col>
                <Col span={5}>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="orange">半鸟瞰</Tag>
                  </div>
                    <InputNumber
                    value={imageQuantities.halfBirdView}
                    onChange={(value) => setImageQuantities(prev => ({ ...prev, halfBirdView: value || 0 }))}
                      min={0}
                    style={{ width: '100%' }}
                    addonAfter="张"
                    />
                </Col>
                <Col span={5}>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="blue">人视角</Tag>
                  </div>
                    <InputNumber
                    value={imageQuantities.humanView}
                    onChange={(value) => setImageQuantities(prev => ({ ...prev, humanView: value || 0 }))}
                    min={0}
                      style={{ width: '100%' }}
                    addonAfter="张"
                  />
                </Col>
                <Col span={5}>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="purple">动画</Tag>
                  </div>
                  <InputNumber
                    value={imageQuantities.animation}
                    onChange={(value) => setImageQuantities(prev => ({ ...prev, animation: value || 0 }))}
                      min={0}
                    style={{ width: '100%' }}
                    addonAfter="秒"
                    />
                </Col>
                <Col span={4}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: '#666' }}>智能分配</span>
                  </div>
                  <Button 
                    type="primary" 
                    onClick={smartDistribute}
                    style={{ width: '100%' }}
                    disabled={modelingMembers.length === 0 && renderingMembers.length === 0 && animationMembers.length === 0}
                  >
                    一键分配
                  </Button>
                </Col>
              </Row>
              <div style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
                总计：{imageQuantities.birdView + imageQuantities.halfBirdView + imageQuantities.humanView} 张图 + {imageQuantities.animation} 秒动画
              </div>
            </Card>
            
            <TeamMemberManager
              title="建模制作人员"
              color="#faad14"
              members={modelingMembers}
              onMembersChange={setModelingMembers}
              departmentKey="modeling"
            />
            
            <TeamMemberManager
              title="渲染制作人员"
              color="#52c41a"
              members={renderingMembers}
              onMembersChange={setRenderingMembers}
              departmentKey="rendering"
            />
            
            <TeamMemberManager
              title="动画制作人员"
              color="#1890ff"
              members={animationMembers}
              onMembersChange={setAnimationMembers}
              departmentKey="rendering" // 动画师暂时归类到渲染部
            />

            <TeamMemberManager
              title="项目管理人员"
              color="#722ed1"
              members={managerMembers}
              onMembersChange={setManagerMembers}
              departmentKey="manager"
              projectTotalPrice={projectBudget} // 使用动态预算
            />

            <TeamMemberManager
              title="销售人员"
              color="#f5222d"
              members={salesMembers}
              onMembersChange={setSalesMembers}
              departmentKey="sales"
              projectTotalPrice={projectBudget} // 使用动态预算
            />

            {/* 费用总计 */}
            <div style={{
              marginTop: 24,
                  padding: 16,
              background: '#f5f5f5',
              borderRadius: 8
            }}>
              <h4>费用统计</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>建模费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>
                    ¥{(() => {
                      // 建模费用 = 各成员的工作量 × 对应单价
                      return modelingMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'percentage') {
                          return sum // 百分比费用单独计算
                        }
                        const birdViewCost = (m.birdViewWorkload || 0) * (m.originalMember?.birdViewPrice || 0)
                        const halfBirdViewCost = (m.halfBirdViewWorkload || 0) * (m.originalMember?.halfBirdViewPrice || 0)
                        const humanViewCost = (m.humanViewWorkload || 0) * (m.originalMember?.humanViewPrice || 0)
                        return sum + birdViewCost + halfBirdViewCost + humanViewCost
                      }, 0).toLocaleString()
                    })()}
                  </div>
                  </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>渲染费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    ¥{(() => {
                      // 渲染费用 = 各成员的工作量 × 对应单价
                      return renderingMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'percentage') {
                          return sum // 百分比费用单独计算
                        }
                        const birdViewCost = (m.birdViewWorkload || 0) * (m.originalMember?.birdViewPrice || 0)
                        const halfBirdViewCost = (m.halfBirdViewWorkload || 0) * (m.originalMember?.halfBirdViewPrice || 0)
                        const humanViewCost = (m.humanViewWorkload || 0) * (m.originalMember?.humanViewPrice || 0)
                        return sum + birdViewCost + halfBirdViewCost + humanViewCost
                      }, 0).toLocaleString()
                    })()}
                </div>
            </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>动画费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                    ¥{(() => {
                      // 动画费用 = 各成员的动画工作量 × 动画单价
                      return animationMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'percentage') {
                          return sum // 百分比费用单独计算
                        }
                        return sum + ((m.animationWorkload || 0) * (m.originalMember?.animationPrice || 0))
                      }, 0).toLocaleString()
                    })()}
              </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>管理费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
                    ¥{(() => {
                      return managerMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'percentage') {
                          return sum + (projectBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
                        }
                        return sum
                      }, 0).toLocaleString()
                    })()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>销售费用</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f5222d' }}>
                    ¥{(() => {
                      return salesMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'percentage') {
                          return sum + (projectBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
                        }
                        return sum
                      }, 0).toLocaleString()
                    })()}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>总费用</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  ¥{(() => {
                    // 建模固定费用
                    const modelingTotal = modelingMembers.reduce((sum, m) => {
                      if (m.originalMember?.priceType === 'fixed') {
                        const birdViewCost = (m.birdViewWorkload || 0) * (m.originalMember?.birdViewPrice || 0)
                        const halfBirdViewCost = (m.halfBirdViewWorkload || 0) * (m.originalMember?.halfBirdViewPrice || 0)
                        const humanViewCost = (m.humanViewWorkload || 0) * (m.originalMember?.humanViewPrice || 0)
                        return sum + birdViewCost + halfBirdViewCost + humanViewCost
                      }
                      return sum
                    }, 0)
                    
                    // 渲染固定费用
                    const renderingTotal = renderingMembers.reduce((sum, m) => {
                      if (m.originalMember?.priceType === 'fixed') {
                        const birdViewCost = (m.birdViewWorkload || 0) * (m.originalMember?.birdViewPrice || 0)
                        const halfBirdViewCost = (m.halfBirdViewWorkload || 0) * (m.originalMember?.halfBirdViewPrice || 0)
                        const humanViewCost = (m.humanViewWorkload || 0) * (m.originalMember?.humanViewPrice || 0)
                        return sum + birdViewCost + halfBirdViewCost + humanViewCost
                      }
                      return sum
                    }, 0)
                    
                    // 动画固定费用
                    const animationTotal = animationMembers.reduce((sum, m) => {
                      return m.originalMember?.priceType === 'fixed' ? sum + ((m.animationWorkload || 0) * (m.originalMember?.animationPrice || 0)) : sum
                    }, 0)
                    
                    // 管理费用
                    const managerTotal = managerMembers.reduce((sum, m) => {
                      if (m.originalMember?.priceType === 'percentage') {
                        return sum + (projectBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
                      }
                      return sum
                    }, 0)
                    
                    // 销售费用
                    const salesTotal = salesMembers.reduce((sum, m) => {
                      if (m.originalMember?.priceType === 'percentage') {
                        return sum + (projectBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
                      }
                      return sum
                    }, 0)
                    
                    return (modelingTotal + renderingTotal + animationTotal + managerTotal + salesTotal).toLocaleString()
                  })()}
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
                      <strong>项目金额：</strong>¥{projectBudget.toLocaleString()}
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
                {/* 建模人员详情 */}
                {modelingMembers.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#faad14', marginBottom: 8 }}>建模制作人员 ({modelingMembers.length} 人)</h4>
                    {modelingMembers.map(member => (
                      <div key={member.id} style={{ 
                        marginBottom: 8, 
                        padding: '8px 12px', 
                        background: '#fff', 
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{member.originalMember?.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          鸟瞰: {member.birdViewWorkload || 0}张 | 
                          半鸟瞰: {member.halfBirdViewWorkload || 0}张 | 
                          人视角: {member.humanViewWorkload || 0}张
                </div>
                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                          费用: ¥{(() => {
                            const birdViewCost = (member.birdViewWorkload || 0) * (member.originalMember?.birdViewPrice || 0)
                            const halfBirdViewCost = (member.halfBirdViewWorkload || 0) * (member.originalMember?.halfBirdViewPrice || 0)
                            const humanViewCost = (member.humanViewWorkload || 0) * (member.originalMember?.humanViewPrice || 0)
                            return (birdViewCost + halfBirdViewCost + humanViewCost).toLocaleString()
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 渲染人员详情 */}
                {renderingMembers.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#52c41a', marginBottom: 8 }}>渲染制作人员 ({renderingMembers.length} 人)</h4>
                    {renderingMembers.map(member => (
                  <div key={member.id} style={{ 
                        marginBottom: 8, 
                        padding: '8px 12px', 
                        background: '#fff', 
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{member.originalMember?.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          鸟瞰: {member.birdViewWorkload || 0}张 | 
                          半鸟瞰: {member.halfBirdViewWorkload || 0}张 | 
                          人视角: {member.humanViewWorkload || 0}张
                    </div>
                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                          费用: ¥{(() => {
                            const birdViewCost = (member.birdViewWorkload || 0) * (member.originalMember?.birdViewPrice || 0)
                            const halfBirdViewCost = (member.halfBirdViewWorkload || 0) * (member.originalMember?.halfBirdViewPrice || 0)
                            const humanViewCost = (member.humanViewWorkload || 0) * (member.originalMember?.humanViewPrice || 0)
                            return (birdViewCost + halfBirdViewCost + humanViewCost).toLocaleString()
                          })()}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Upload
                            multiple
                            accept="image/*"
                            listType="picture-card"
                            beforeUpload={() => false} // 阻止自动上传
                            onChange={(info) => {
                              message.success(`已选择 ${info.fileList.length} 个文件`)
                            }}
                            showUploadList={{
                              showPreviewIcon: true,
                              showRemoveIcon: true,
                            }}
                          >
                            <div style={{ textAlign: 'center' }}>
                              <UploadOutlined style={{ fontSize: '16px', color: '#999' }} />
                              <div style={{ fontSize: '12px', marginTop: 4 }}>上传图像</div>
                    </div>
                          </Upload>
                  </div>
            </div>
                    ))}
                  </div>
                )}

                {/* 动画人员详情 */}
                {animationMembers.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#1890ff', marginBottom: 8 }}>动画制作人员 ({animationMembers.length} 人)</h4>
                    {animationMembers.map(member => (
                      <div key={member.id} style={{ 
                        marginBottom: 8, 
                        padding: '8px 12px', 
                        background: '#fff', 
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{member.originalMember?.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          动画制作: {member.animationWorkload || 0}秒
            </div>
                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                          费用: ¥{((member.animationWorkload || 0) * (member.originalMember?.animationPrice || 0)).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 管理人员详情 */}
                {managerMembers.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#722ed1', marginBottom: 8 }}>项目管理人员 ({managerMembers.length} 人)</h4>
                    {managerMembers.map(member => (
                      <div key={member.id} style={{ 
                        marginBottom: 8, 
                        padding: '8px 12px', 
                        background: '#fff', 
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{member.originalMember?.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          提成比例: {member.originalMember?.unitPrice}% | 工作量: {member.assignedWorkload || 1}
                </div>
                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                          费用: ¥{(projectBudget * (member.originalMember?.unitPrice || 0) / 100 * (member.assignedWorkload || 1)).toLocaleString()}
                </div>
              </div>
                    ))}
                  </div>
                )}

                {/* 销售人员详情 */}
                {salesMembers.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#f5222d', marginBottom: 8 }}>销售人员 ({salesMembers.length} 人)</h4>
                    {salesMembers.map(member => (
                      <div key={member.id} style={{ 
                        marginBottom: 8, 
                        padding: '8px 12px', 
                        background: '#fff', 
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{member.originalMember?.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          提成比例: {member.originalMember?.unitPrice}% | 工作量: {member.assignedWorkload || 1}
                  </div>
                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                          费用: ¥{(projectBudget * (member.originalMember?.unitPrice || 0) / 100 * (member.assignedWorkload || 1)).toLocaleString()}
                  </div>
                  </div>
                    ))}
            </div>
                )}

                {/* 费用汇总 */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e8e8' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    总费用：¥{(() => {
                      // 建模固定费用
                      const modelingTotal = modelingMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'fixed') {
                          const birdViewCost = (m.birdViewWorkload || 0) * (m.originalMember?.birdViewPrice || 0)
                          const halfBirdViewCost = (m.halfBirdViewWorkload || 0) * (m.originalMember?.halfBirdViewPrice || 0)
                          const humanViewCost = (m.humanViewWorkload || 0) * (m.originalMember?.humanViewPrice || 0)
                          return sum + birdViewCost + halfBirdViewCost + humanViewCost
                        }
                        return sum
                      }, 0)
                      
                      // 渲染固定费用
                      const renderingTotal = renderingMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'fixed') {
                          const birdViewCost = (m.birdViewWorkload || 0) * (m.originalMember?.birdViewPrice || 0)
                          const halfBirdViewCost = (m.halfBirdViewWorkload || 0) * (m.originalMember?.halfBirdViewPrice || 0)
                          const humanViewCost = (m.humanViewWorkload || 0) * (m.originalMember?.humanViewPrice || 0)
                          return sum + birdViewCost + halfBirdViewCost + humanViewCost
                        }
                        return sum
                      }, 0)
                      
                      // 动画固定费用
                      const animationTotal = animationMembers.reduce((sum, m) => {
                        return m.originalMember?.priceType === 'fixed' ? sum + ((m.animationWorkload || 0) * (m.originalMember?.animationPrice || 0)) : sum
                      }, 0)
                      
                      // 管理费用
                      const managerTotal = managerMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'percentage') {
                          return sum + (projectBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
                        }
                        return sum
                      }, 0)
                      
                      // 销售费用
                      const salesTotal = salesMembers.reduce((sum, m) => {
                        if (m.originalMember?.priceType === 'percentage') {
                          return sum + (projectBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
                        }
                        return sum
                      }, 0)
                      
                      return (modelingTotal + renderingTotal + animationTotal + managerTotal + salesTotal).toLocaleString()
                    })()}
                </div>
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
      
      // 计算实际的项目预算（基于团队配置）
      const calculateActualBudget = () => {
        // 建模固定费用
        const modelingTotal = modelingMembers.reduce((sum, m) => {
          if (m.originalMember?.priceType === 'fixed') {
            return sum + 
              ((m.birdViewWorkload || 0) * (m.originalMember?.birdViewPrice || 0)) +
              ((m.halfBirdViewWorkload || 0) * (m.originalMember?.halfBirdViewPrice || 0)) +
              ((m.humanViewWorkload || 0) * (m.originalMember?.humanViewPrice || 0))
          }
          return sum
        }, 0)
        
        // 渲染固定费用
        const renderingTotal = renderingMembers.reduce((sum, m) => {
          return m.originalMember?.priceType === 'fixed' ? sum + ((m.assignedWorkload || 0) * (m.originalMember?.unitPrice || 0)) : sum
        }, 0)
        
        // 动画固定费用
        const animationTotal = animationMembers.reduce((sum, m) => {
          return m.originalMember?.priceType === 'fixed' ? sum + ((m.animationWorkload || 0) * (m.originalMember?.animationPrice || 0)) : sum
        }, 0)
        
        // 管理费用（基于总费用的百分比）
        const baseBudget = modelingTotal + renderingTotal + animationTotal
        const managerTotal = managerMembers.reduce((sum, m) => {
          if (m.originalMember?.priceType === 'percentage') {
            return sum + (baseBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
          }
          return sum
        }, 0)
        
        // 销售费用
        const salesTotal = salesMembers.reduce((sum, m) => {
          if (m.originalMember?.priceType === 'percentage') {
            return sum + (baseBudget * (m.originalMember?.unitPrice || 0) / 100 * (m.assignedWorkload || 1))
          }
          return sum
        }, 0)
        
        return modelingTotal + renderingTotal + animationTotal + managerTotal + salesTotal
      }
      
      const actualBudget = calculateActualBudget()
      const currentExchangeRate = formValues.exchangeRate || currentProject?.exchangeRate || 1
      
      // 构建更新后的项目数据
      const updatedProject: Project = {
        ...currentProject!,
        name: formValues.projectName || currentProject?.name,
        protocolNumber: formValues.protocolNumber || currentProject?.protocolNumber,
        client: formValues.clientName || currentProject?.client,
        type: formValues.projectType || currentProject?.type,
        currency: formValues.currency || currentProject?.currency,
        budget: actualBudget, // 使用实际计算的预算
        exchangeRate: currentExchangeRate,
        budgetCNY: actualBudget * currentExchangeRate, // 使用实际计算的人民币预算
        status: formValues.status || currentProject?.status,
        paymentStatus: formValues.paymentStatus || currentProject?.paymentStatus,
        progress: formValues.progress || currentProject?.progress,
        deadline: formValues.deadline ? formValues.deadline.format('YYYY-MM-DD') : currentProject?.deadline || dayjs().format('YYYY-MM-DD'),
        updatedAt: new Date().toISOString(),
        paidAmount: formValues.paidAmount || currentProject?.paidAmount,
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