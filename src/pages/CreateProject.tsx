import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Steps,
  Button,
  Form,
  message,
  Spin,
  Tag,
} from 'antd'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

// 导入拆分的组件
import ProjectBasicInfo from '../components/project/ProjectBasicInfo'
import ProjectBudgetConfig from '../components/project/ProjectBudgetConfig'
import TeamAssignment from '../components/project/TeamAssignment'
import ProjectSchedule from '../components/project/ProjectSchedule'
import ProjectSummary from '../components/project/ProjectSummary'

const { Step } = Steps

interface ExchangeRate {
  currency: string
  currencyCode: string
  currencySymbol: string
  rate: number
  lastUpdated?: string
  region?: string
  flag?: string
}

interface TeamMember {
  id: string
  name: string
  department: string
  unitPrice: number
  priceType: 'fixed' | 'percentage'
  birdViewPrice?: number // 鸟瞰单价
  humanViewPrice?: number // 人视角单价
  animationPrice?: number // 动画单价（每秒）
  customPrice?: number // 自定义单价
  cost?: number
  unit?: string
  assignedBirdView?: number // 分配的鸟瞰图数量
  assignedHumanView?: number // 分配的人视角图数量
  assignedAnimation?: number // 分配的动画时长（仅渲染）
}

interface Client {
  id: string
  companyName: string
  companyNameCN: string
  contactPerson: string
  preferredCurrency: string // 客户偏好币种
  projectPreferences: {
    style: string[]
    budget: string | string[]
    timeline: string | string[]
    communication: string | string[]
  }
}

interface DepartmentCost {
  department: string
  departmentName: string
  members: TeamMember[]
  totalCost: number
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
  createdAt?: string
  updatedAt?: string
}

// 时间安排项目接口
interface ScheduleItem {
  id: string
  phase: string
  startDate: string
  endDate: string
  color: string
  autoSchedule: boolean
  duration: number
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>() // 获取URL中的项目ID
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [projectBudget, setProjectBudget] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false) // 编辑模式状态
  const [currentProject, setCurrentProject] = useState<Project | null>(null) // 当前编辑的项目
  
  // 币种和汇率相关状态
  const [selectedCurrency, setSelectedCurrency] = useState<string>('CNY') // 默认人民币
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  
  // 预算计算配置（支持多币种）
  const [budgetConfig, setBudgetConfig] = useState({
    birdViewPrice: 1600, // 鸟瞰图单价
    humanViewPrice: 800, // 人视角单价
    animationPrice: 140, // 动画单价/秒
    birdViewDiscount: 100, // 鸟瞰图折扣百分比
    humanViewDiscount: 100, // 人视角折扣百分比
    animationDiscount: 100, // 动画折扣百分比
    currency: 'USD' // 默认美元
  })
  
  // 图量信息
  const [imageQuantity, setImageQuantity] = useState({
    birdViewCount: 0,
    humanViewCount: 0,
    animationDuration: 0,
  })

  // 团队分配状态
  const [teamAssignments, setTeamAssignments] = useState<{
    manager: TeamMember[]
    sales: TeamMember[]
    modeling: TeamMember[]
    rendering: TeamMember[]
  }>({
    manager: [],
    sales: [],
    modeling: [],
    rendering: [],
  })

  // 部门成本状态
  const [departmentCosts, setDepartmentCosts] = useState<DepartmentCost[]>([])

  // 项目时间安排数据
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      phase: '项目报备',
      startDate: '2025-06-02',
      endDate: '2025-06-05',
      color: '#fa8c16',
      autoSchedule: false,
      duration: 4, // 默认工期（天）
    },
    {
      id: '2', 
      phase: '建模',
      startDate: '2025-06-06',
      endDate: '2025-06-07',
      color: '#52c41a',
      autoSchedule: true,
      duration: 2, // 默认2天
    },
    {
      id: '3',
      phase: '渲染',
      startDate: '2025-06-08', 
      endDate: '2025-06-09',
      color: '#1890ff',
      autoSchedule: true,
      duration: 2, // 默认2天
    },
    {
      id: '4',
      phase: '出图',
      startDate: '2025-06-10',
      endDate: '2025-06-10',
      color: '#722ed1',
      autoSchedule: true,
      duration: 1, // 默认1天
    },
    {
      id: '5',
      phase: '备份',
      startDate: '2025-06-11',
      endDate: '2025-06-17',
      color: '#ff4d4f',
      autoSchedule: true,
      duration: 7, // 默认7天
    },
  ])

  // 客户数据
  const [clients] = useState<Client[]>([
    {
      id: 'client_001',
      companyName: 'URBIS',
      companyNameCN: 'URBIS建筑设计',
      contactPerson: 'Sarah Johnson',
      preferredCurrency: 'AUD',
      projectPreferences: {
        style: ['Modern', 'Commercial', 'Residential High-rise'],
        budget: '$200,000 - $500,000',
        timeline: '3-6 months',
        communication: ['Email + Video Call']
      }
    },
    {
      id: 'client_002',
      companyName: 'Bathurst开发公司',
      companyNameCN: 'Bathurst Development Corp',
      contactPerson: 'Michael Chen',
      preferredCurrency: 'AUD',
      projectPreferences: {
        style: ['Contemporary', 'Mixed Use'],
        budget: '$150,000 - $400,000',
        timeline: '2-4 months',
        communication: ['Email', 'Phone']
      }
    },
    {
      id: 'client_003',
      companyName: 'NCCEC集团',
      companyNameCN: 'NCCEC Group',
      contactPerson: 'David Liu',
      preferredCurrency: 'USD',
      projectPreferences: {
        style: ['Corporate', 'Office Building'],
        budget: '$500,000 - $1,000,000',
        timeline: '6-12 months',
        communication: ['Email + Video Call', 'WeChat']
      }
    },
    {
      id: 'client_004',
      companyName: 'Norwell置业',
      companyNameCN: 'Norwell Properties',
      contactPerson: 'Emma Wilson',
      preferredCurrency: 'CNY',
      projectPreferences: {
        style: ['Luxury Residential', 'Villa'],
        budget: '¥800,000 - ¥2,000,000',
        timeline: '4-8 months',
        communication: ['WeChat', 'Email']
      }
    },
    {
      id: 'client_005',
      companyName: 'Olympic Club International',
      companyNameCN: 'Olympic Club International',
      contactPerson: 'James Smith',
      preferredCurrency: 'EUR',
      projectPreferences: {
        style: ['Sports Facility', 'Recreation Center'],
        budget: '€300,000 - €700,000',
        timeline: '4-6 months',
        communication: ['Email + Video Call']
      }
    }
  ])

  // 团队成员数据
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 'TM001',
      name: '张建模',
      department: 'modeling',
      unitPrice: 800,
      priceType: 'fixed',
      birdViewPrice: 1000,
      humanViewPrice: 1200,
      animationPrice: 1500,
    },
    {
      id: 'TM002',
      name: '李渲染',
      department: 'rendering',
      unitPrice: 1200,
      priceType: 'fixed',
      birdViewPrice: 1500,
      humanViewPrice: 1800,
      animationPrice: 2000,
    },
    {
      id: 'TM003',
      name: '王渲染',
      department: 'rendering',
      unitPrice: 1000,
      priceType: 'fixed',
      birdViewPrice: 1200,
      humanViewPrice: 1500,
      animationPrice: 1800,
    },
    {
      id: 'TM004',
      name: '赵经理',
      department: 'manager',
      unitPrice: 2,
      priceType: 'percentage',
    },
    {
      id: 'TM005',
      name: '陈销售',
      department: 'sales',
      unitPrice: 1,
      priceType: 'percentage',
    }
  ])

  const steps = [
    { title: '基本信息', description: '项目基础信息填写' },
    { title: '团队分配', description: '团队成员分配与费用设置' },
    { title: '时间安排', description: '项目时间规划' },
  ]

  // 获取所有项目数据 - 与ProjectList保持一致
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
      // ... 其他项目数据
    ]
  }

  // 初始化汇率数据
  useEffect(() => {
    const rates: ExchangeRate[] = [
      { currency: '人民币', currencyCode: 'CNY', currencySymbol: '¥', rate: 1.00, flag: '🇨🇳' },
      { currency: '美元', currencyCode: 'USD', currencySymbol: '$', rate: 7.24, flag: '🇺🇸' },
      { currency: '澳元', currencyCode: 'AUD', currencySymbol: 'A$', rate: 4.78, flag: '🇦🇺' },
      { currency: '欧元', currencyCode: 'EUR', currencySymbol: '€', rate: 7.85, flag: '🇪🇺' },
    ]
    setExchangeRates(rates)
  }, [])

  // 检查是否为编辑模式
  useEffect(() => {
    if (id) {
      setIsEditMode(true)
      loadProjectData()
    }
  }, [id])

  // 加载项目数据
  const loadProjectData = async () => {
    setLoading(true)
    try {
      // 从localStorage获取项目数据
      const projectsJson = localStorage.getItem('nflab_projects')
      const projects = projectsJson ? JSON.parse(projectsJson) : getAllProjects()
      
      const project = projects.find((p: any) => p.id === id)
      if (project) {
        setCurrentProject(project)
        
        // 填充表单数据
        form.setFieldsValue({
          protocolNumber: project.protocolNumber,
          projectName: project.name,
          fullProjectName: `${project.protocolNumber} - ${project.name}`,
          clientId: project.client,
          startDate: project.startDate ? dayjs(project.startDate) : undefined,
          endDate: project.deadline ? dayjs(project.deadline) : undefined,
          description: project.description || '',
          birdViewCount: project.birdViewCount || 0,
          humanViewCount: project.humanViewCount || 0,
          animationDuration: project.animationDuration || 0,
          projectBudget: project.budget,
          projectCurrency: project.currency
        })
        
        // 设置其他状态
        setProjectBudget(project.budget)
        setSelectedCurrency(project.currency)
        
        // 设置客户信息
        const client = clients.find(c => c.companyName === project.client)
        if (client) {
          setSelectedClient(client)
        }
        
        message.success(`已加载项目"${project.name}"的数据`)
      } else {
        message.error('未找到指定的项目')
        navigate('/projects')
      }
    } catch (error) {
      console.error('加载项目数据失败:', error)
      message.error('加载项目数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理客户选择
  const handleClientSelect = (value: string) => {
    const client = clients.find(c => c.id === value)
    if (client) {
      setSelectedClient(client)
      
      // 自动设置客户偏好币种
      setSelectedCurrency(client.preferredCurrency)
      setBudgetConfig(prev => ({
        ...prev,
        currency: client.preferredCurrency
      }))
      
      // 根据客户偏好币种设置默认单价
      const currencyRate = exchangeRates.find(rate => rate.currencyCode === client.preferredCurrency)
      if (currencyRate) {
        // 根据不同币种设置合适的默认单价
        let defaultPrices = { birdView: 1600, humanView: 800, animation: 140 }
        
        switch (client.preferredCurrency) {
          case 'AUD':
            defaultPrices = { birdView: 2400, humanView: 1200, animation: 210 } // 澳元单价
            break
          case 'EUR':
            defaultPrices = { birdView: 1500, humanView: 750, animation: 130 } // 欧元单价
            break
          case 'USD':
            defaultPrices = { birdView: 1600, humanView: 800, animation: 140 } // 美元单价
            break
          case 'CNY':
            defaultPrices = { birdView: 11600, humanView: 5800, animation: 1015 } // 人民币单价
            break
        }
        
        setBudgetConfig(prev => ({
          ...prev,
          birdViewPrice: defaultPrices.birdView,
          humanViewPrice: defaultPrices.humanView,
          animationPrice: defaultPrices.animation,
          currency: client.preferredCurrency
        }))
      }
      
      // 自动填充项目描述为客户偏好信息
      const styleArray = Array.isArray(client.projectPreferences.style) ? client.projectPreferences.style : [client.projectPreferences.style]
      const commArray = Array.isArray(client.projectPreferences.communication) ? client.projectPreferences.communication : [client.projectPreferences.communication]
      
      const preferences = [
        `风格偏好: ${styleArray.join(', ')}`,
        `预算范围: ${client.projectPreferences.budget}`,
        `时间周期: ${client.projectPreferences.timeline}`,
        `沟通方式: ${commArray.join(', ')}`,
        `偏好币种: ${client.preferredCurrency}`
      ].join('\n')
      
      form.setFieldsValue({
        clientName: client.companyName,
        description: preferences,
        projectCurrency: client.preferredCurrency
      })
      
      // 重新计算预算
      setTimeout(() => {
        calculateBudget()
      }, 100)
    }
  }

  // 生成项目协议号
  const generateProtocolNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `NF${year}${month}${day}${random}`
  }

  // 处理项目名称变化
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const projectName = e.target.value
    const protocolNumber = form.getFieldValue('protocolNumber')
    if (protocolNumber && projectName) {
      // 更新完整项目名称（协议号 + 项目名称）
      form.setFieldsValue({
        fullProjectName: `${protocolNumber} - ${projectName}`
      })
    }
  }

  // 处理协议号变化
  const handleProtocolNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const protocolNumber = e.target.value
    const projectName = form.getFieldValue('projectName')
    if (protocolNumber && projectName) {
      form.setFieldsValue({
        fullProjectName: `${protocolNumber} - ${projectName}`
      })
    }
  }

  // 处理项目预算变化
  const handleBudgetChange = (value: number | null) => {
    const budget = value || 0
    setProjectBudget(budget)
    
    // 自动计算团队成本
    calculateDepartmentCosts()
  }

  // 自动计算预算（支持多币种）
  const calculateBudget = () => {
    const { birdViewCount, humanViewCount, animationDuration } = imageQuantity
    const { birdViewPrice, humanViewPrice, animationPrice, birdViewDiscount, humanViewDiscount, animationDiscount, currency } = budgetConfig
    
    // 获取当前币种的汇率
    const currencyRate = exchangeRates.find(rate => rate.currencyCode === currency)
    const exchangeRate = currencyRate ? currencyRate.rate : 1
    
    // 计算各项费用（原币种）
    const birdViewTotal = birdViewCount * birdViewPrice * (birdViewDiscount / 100)
    const humanViewTotal = humanViewCount * humanViewPrice * (humanViewDiscount / 100)
    const animationTotal = animationDuration * animationPrice * (animationDiscount / 100)
    
    // 总费用（原币种）
    const totalOriginal = birdViewTotal + humanViewTotal + animationTotal
    
    // 转换为人民币
    const totalCNY = totalOriginal * exchangeRate
    
    // 设置项目预算（人民币）
    setProjectBudget(Math.round(totalCNY))
    form.setFieldsValue({ projectBudget: Math.round(totalCNY) })
  }

  // 处理图量变化
  const handleImageQuantityChange = (field: string, value: number | null) => {
    const newQuantity = { ...imageQuantity, [field]: value || 0 }
    setImageQuantity(newQuantity)
    
    // 重新计算预算
    setTimeout(() => {
      calculateBudget()
    }, 100)
  }

  // 处理预算配置变化
  const handleBudgetConfigChange = (field: string, value: number | null) => {
    const newConfig = { ...budgetConfig, [field]: value || 0 }
    setBudgetConfig(newConfig)
    
    // 重新计算预算
    setTimeout(() => {
      calculateBudget()
    }, 100)
  }

  // 处理币种变化
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value)
    setBudgetConfig(prev => ({ ...prev, currency: value }))
    
    // 重新计算预算
    setTimeout(() => {
      calculateBudget()
    }, 100)
  }

  // 计算部门成本
  const calculateDepartmentCosts = () => {
    const costs: DepartmentCost[] = [
      {
        department: 'manager',
        departmentName: '项目经理',
        members: teamAssignments.manager,
        totalCost: teamAssignments.manager.reduce((sum, member) => 
          sum + (projectBudget * member.unitPrice / 100), 0
        )
      },
      {
        department: 'sales',
        departmentName: '销售',
        members: teamAssignments.sales,
        totalCost: teamAssignments.sales.reduce((sum, member) => 
          sum + (projectBudget * member.unitPrice / 100), 0
        )
      },
      {
        department: 'modeling',
        departmentName: '建模',
        members: teamAssignments.modeling,
        totalCost: teamAssignments.modeling.reduce((sum, member) => {
          const birdViewCost = (member.assignedBirdView || 0) * (member.birdViewPrice || 800)
          const humanViewCost = (member.assignedHumanView || 0) * (member.humanViewPrice || 800)
          return sum + birdViewCost + humanViewCost
        }, 0)
      },
      {
        department: 'rendering',
        departmentName: '渲染',
        members: teamAssignments.rendering,
        totalCost: teamAssignments.rendering.reduce((sum, member) => {
          const birdViewCost = (member.assignedBirdView || 0) * (member.birdViewPrice || 1200)
          const humanViewCost = (member.assignedHumanView || 0) * (member.humanViewPrice || 1200)
          const animationCost = (member.assignedAnimation || 0) * (member.animationPrice || 200)
          return sum + birdViewCost + humanViewCost + animationCost
        }, 0)
      }
    ]
    
    setDepartmentCosts(costs)
  }

  // 自动调度阶段
  const autoSchedulePhases = (updatedItems: ScheduleItem[]) => {
    for (let i = 1; i < updatedItems.length; i++) {
      if (updatedItems[i].autoSchedule) {
        const prevPhase = updatedItems[i - 1]
        const startDate = dayjs(prevPhase.endDate).add(1, 'day')
        updatedItems[i].startDate = startDate.format('YYYY-MM-DD')
        updatedItems[i].endDate = startDate.add(updatedItems[i].duration - 1, 'day').format('YYYY-MM-DD')
      }
    }
    return updatedItems
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <ProjectBasicInfo
              form={form}
              selectedClient={selectedClient}
              exchangeRates={exchangeRates}
              clients={clients}
              onClientSelect={handleClientSelect}
              onProtocolNumberChange={handleProtocolNumberChange}
              onProjectNameChange={handleProjectNameChange}
              generateProtocolNumber={generateProtocolNumber}
              isEditMode={isEditMode}
            />
            <ProjectBudgetConfig
              form={form}
              budgetConfig={budgetConfig}
              imageQuantity={imageQuantity}
              exchangeRates={exchangeRates}
              selectedCurrency={selectedCurrency}
              projectBudget={projectBudget}
              onImageQuantityChange={handleImageQuantityChange}
              onBudgetConfigChange={handleBudgetConfigChange}
              onCurrencyChange={handleCurrencyChange}
              onBudgetChange={handleBudgetChange}
            />
          </>
        )

      case 1:
        return (
          <TeamAssignment
            teamMembers={teamMembers}
            teamAssignments={teamAssignments}
            departmentCosts={departmentCosts}
            projectBudget={projectBudget}
            onTeamAssignmentChange={setTeamAssignments}
            onDepartmentCostsChange={calculateDepartmentCosts}
          />
        )

      case 2:
        return (
          <>
            <ProjectSchedule
              scheduleItems={scheduleItems}
              onScheduleChange={setScheduleItems}
              autoSchedulePhases={autoSchedulePhases}
            />
            <ProjectSummary
              fullProjectName={form.getFieldValue('fullProjectName') || ''}
              selectedClient={selectedClient}
              projectBudget={projectBudget}
              departmentCosts={departmentCosts}
              teamAssignments={teamAssignments}
            />
          </>
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
      const clientId = form.getFieldValue('clientId')
      const birdViewCount = form.getFieldValue('birdViewCount')
      const humanViewCount = form.getFieldValue('humanViewCount')
      const animationDuration = form.getFieldValue('animationDuration')
      const projectBudget = form.getFieldValue('projectBudget')
      
      if (!protocolNumber || !projectName || !clientId) {
        message.error('请完善项目基本信息')
        return
      }
      
      if (birdViewCount === undefined || humanViewCount === undefined || animationDuration === undefined) {
        message.error('请完善项目图量设置')
        return
      }
      
      if (!projectBudget || projectBudget <= 0) {
        message.error('请设置项目预算')
        return
      }
    }
    
    if (currentStep === 1) {
      // 验证第二步团队分配
      if (teamAssignments.manager.length === 0 && teamAssignments.sales.length === 0 && 
          teamAssignments.modeling.length === 0 && teamAssignments.rendering.length === 0) {
        message.error('请至少分配一名团队成员')
        return
      }
      
      if (projectBudget <= 0) {
        message.error('请设置项目金额')
        return
      }
    }
    
    setCurrentStep(currentStep + 1)
  }

  const prev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleFinish = () => {
    // 收集所有项目数据
    const projectData = {
      // 基本信息
      id: isEditMode ? id : `NF${Date.now().toString().slice(-6)}`, // 生成唯一ID
      name: form.getFieldValue('projectName'),
      protocolNumber: form.getFieldValue('protocolNumber'),
      client: selectedClient?.companyName || form.getFieldValue('clientId'),
      status: isEditMode ? currentProject?.status : 'reporting',
      deadline: form.getFieldValue('endDate')?.format('YYYY-MM-DD'),
      budget: projectBudget,
      currency: selectedCurrency,
      exchangeRate: exchangeRates.find(rate => rate.currencyCode === selectedCurrency)?.rate || 1,
      budgetCNY: projectBudget * (exchangeRates.find(rate => rate.currencyCode === selectedCurrency)?.rate || 1),
      paymentStatus: 'unpaid',
      progress: isEditMode ? currentProject?.progress : 0,
      type: form.getFieldValue('description') || '项目',
      createdAt: isEditMode ? currentProject?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // 扩展信息
      fullProjectName: form.getFieldValue('fullProjectName'),
      startDate: form.getFieldValue('startDate')?.format('YYYY-MM-DD'),
      description: form.getFieldValue('description'),
      birdViewCount: form.getFieldValue('birdViewCount'),
      humanViewCount: form.getFieldValue('humanViewCount'),
      animationDuration: form.getFieldValue('animationDuration'),
      teamAssignments,
      departmentCosts,
      totalCost: departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0),
      profit: projectBudget - departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0),
      scheduleItems,
      totalDuration: (() => {
        if (scheduleItems.length === 0) return 0
        const start = dayjs(scheduleItems[0].startDate)
        const end = dayjs(scheduleItems[scheduleItems.length - 1].endDate)
        return end.diff(start, 'day') + 1
      })()
    }
    
    try {
      // 获取现有项目数据
      const existingProjectsJson = localStorage.getItem('nflab_projects')
      const existingProjects = existingProjectsJson ? JSON.parse(existingProjectsJson) : []
      
      let updatedProjects
      if (isEditMode) {
        // 编辑模式：更新现有项目
        updatedProjects = existingProjects.map((project: any) => 
          project.id === id ? { ...project, ...projectData } : project
        )
        message.success(`项目"${projectData.name}"更新成功！`)
      } else {
        // 新建模式：添加新项目
        updatedProjects = [...existingProjects, projectData]
        message.success(`项目"${projectData.name}"创建成功！`)
      }
      
      // 保存到localStorage
      localStorage.setItem('nflab_projects', JSON.stringify(updatedProjects))
      
      console.log(isEditMode ? '项目编辑数据:' : '项目创建数据:', projectData)
      console.log('已保存到localStorage:', updatedProjects)
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        navigate('/projects')
      }, 1500)
      
    } catch (error) {
      console.error('保存项目数据失败:', error)
      message.error('保存项目数据失败，请重试')
    }
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
        <Spin size="large" tip={`正在加载${isEditMode ? '项目' : '创建'}信息...`} />
      </div>
    )
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
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0 }}>
              {isEditMode ? '编辑项目' : '创建新项目'}
            </h2>
            {isEditMode && currentProject && (
              <Tag color="blue">正在编辑：{currentProject.name}</Tag>
            )}
          </div>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: 14 }}>
            {isEditMode 
              ? `修改项目"${currentProject?.name}"的信息和配置`
              : '填写以下表单以创建新的项目'
            }
          </p>
        </div>
      </div>

      {/* 步骤条 */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <Steps current={currentStep}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} description={item.description} />
          ))}
        </Steps>
      </div>

      {/* 表单内容 */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
        {renderStepContent()}
        
        {/* 操作按钮 */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prev}>
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
              {isEditMode ? '保存修改' : '创建项目'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateProject