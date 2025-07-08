import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Card, 
  Steps, 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message, 
  Row, 
  Col, 
  Divider, 
  Space, 
  Alert, 
  Spin,
  Tag
} from 'antd'
import { 
  FileTextOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getCurrentExchangeRates, isFixedRateMode, getExchangeRate } from '../utils/exchangeRates'
import ProjectBasicInfo from '../components/project/ProjectBasicInfo'
import ProjectBudgetConfig from '../components/project/ProjectBudgetConfig'
import TeamAssignment from '../components/project/TeamAssignment'
import ProjectSchedule from '../components/project/ProjectSchedule'
import ProjectSummary from '../components/project/ProjectSummary'

const { Option } = Select
const { Step } = Steps

// 本地类型定义
interface ExchangeRate {
  currency: string
  currencyCode: string
  currencySymbol: string
  rate: number
  lastUpdated?: string
  region?: string
  flag?: string
}

interface Client {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  preferredCurrency: string
  projectPreferences: {
    style: string | string[]
    budget: string | string[]
    timeline: string | string[]
    communication: string | string[]
  }
}

interface Project {
  id: string
  name: string
  protocolNumber: string
  client: string
  status: string
  deadline: string
  budget: number
  currency: string
  exchangeRate: number
  budgetCNY: number
  paymentStatus: string
  progress: number
  type: string
  createdAt?: string
  updatedAt?: string
}

interface TeamMember {
  id: string
  name: string
  department: string
  position: string
  hourlyRate: number
  avatar?: string
}

interface DepartmentCost {
  department: string
  members: TeamMember[]
  hourlyRate: number
  estimatedHours: number
  totalCost: number
}

interface ScheduleItem {
  id: string
  title: string
  department: string
  startDate: string
  endDate: string
  duration: number
  dependencies: string[]
  assignedTo: string[]
  status: 'pending' | 'in-progress' | 'completed' | 'delayed'
  progress: number
  description?: string
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
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD') // 默认美元，但支持人民币
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  
  // 预算计算配置（支持多币种）
  const [budgetConfig, setBudgetConfig] = useState({
    birdViewPrice: 1600, // 鸟瞰图单价
    halfBirdViewPrice: 1200, // 半鸟瞰图单价
    humanViewPrice: 800, // 人视角单价
    animationPrice: 140, // 动画单价/秒
    birdViewDiscount: 100, // 鸟瞰图折扣百分比
    halfBirdViewDiscount: 100, // 半鸟瞰图折扣百分比
    humanViewDiscount: 100, // 人视角折扣百分比
    animationDiscount: 100, // 动画折扣百分比
    currency: 'USD' // 默认美元，支持切换到人民币等其他币种
  })
  
  // 图量信息
  const [imageQuantity, setImageQuantity] = useState({
    birdViewCount: 0,
    halfBirdViewCount: 0, // 新增半鸟瞰数量
    humanViewCount: 0,
    animationDuration: 0,
  })

  // 团队分配状态
  const [teamAssignments, setTeamAssignments] = useState({
    manager: [] as TeamMember[],
    sales: [] as TeamMember[],
    modeling: [] as TeamMember[],
    rendering: [] as TeamMember[],
  })

  // 部门成本状态
  const [departmentCosts, setDepartmentCosts] = useState<DepartmentCost[]>([])

  // 项目时间安排数据
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      title: '项目报备',
      department: 'manager',
      startDate: '2025-06-02',
      endDate: '2025-06-05',
      duration: 4, // 默认工期（天）
      dependencies: [],
      assignedTo: [],
      status: 'pending',
      progress: 0,
    },
    {
      id: '2', 
      title: '建模',
      department: 'modeling',
      startDate: '2025-06-06',
      endDate: '2025-06-07',
      duration: 2, // 默认2天
      dependencies: [],
      assignedTo: [],
      status: 'pending',
      progress: 0,
    },
    {
      id: '3',
      title: '渲染',
      department: 'rendering',
      startDate: '2025-06-08', 
      endDate: '2025-06-09',
      duration: 2, // 默认2天
      dependencies: [],
      assignedTo: [],
      status: 'pending',
      progress: 0,
    },
    {
      id: '4',
      title: '出图',
      department: 'rendering',
      startDate: '2025-06-10',
      endDate: '2025-06-10',
      duration: 1, // 默认1天
      dependencies: [],
      assignedTo: [],
      status: 'pending',
      progress: 0,
    },
    {
      id: '5',
      title: '备份',
      department: 'rendering',
      startDate: '2025-06-11',
      endDate: '2025-06-17',
      duration: 7, // 默认7天
      dependencies: [],
      assignedTo: [],
      status: 'pending',
      progress: 0,
    },
  ])

  // 客户数据
  const [clients] = useState<Client[]>([
    {
      id: 'client_001',
      companyName: 'URBIS',
      contactPerson: 'Sarah Johnson',
      email: 'sarah.j@urbis.com',
      phone: '+61 2 9876 5432',
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
      contactPerson: 'Michael Chen',
      email: 'michael.c@bathurst.com',
      phone: '+61 2 1234 5678',
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
      contactPerson: 'David Liu',
      email: 'david.l@nccec.com',
      phone: '+1 202-555-0123',
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
      contactPerson: 'Emma Wilson',
      email: 'emma.w@norwell.com',
      phone: '+86 10 1234 5678',
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
      contactPerson: 'James Smith',
      email: 'james.s@olympicclub.com',
      phone: '+33 1 23 45 67 89',
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
      position: '建模师',
      hourlyRate: 80,
    },
    {
      id: 'TM002',
      name: '李渲染',
      department: 'rendering',
      position: '渲染师',
      hourlyRate: 100,
    },
    {
      id: 'TM003',
      name: '王渲染',
      department: 'rendering',
      position: '渲染师',
      hourlyRate: 90,
    },
    {
      id: 'TM004',
      name: '赵经理',
      department: 'manager',
      position: '项目经理',
      hourlyRate: 150,
    },
    {
      id: 'TM005',
      name: '陈销售',
      department: 'sales',
      position: '销售',
      hourlyRate: 50,
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
    // 使用新的汇率管理工具
    const rates = getCurrentExchangeRates()
    setExchangeRates(rates)
    
    // 检查是否为固定汇率模式
    const isFixed = isFixedRateMode()
    if (isFixed) {
      message.info('当前处于固定汇率模式，汇率将使用系统设置的固定值')
    }
    
    // 初始化表单字段默认值
    if (!isEditMode) {
      form.setFieldsValue({
        birdViewCount: 0,
        halfBirdViewCount: 0,
        humanViewCount: 0,
        animationDuration: 0,
        projectBudget: 0
      })
    }
  }, [isEditMode, form])

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
          halfBirdViewCount: project.halfBirdViewCount || 0,
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
        let defaultPrices = { birdView: 1600, halfBirdView: 1200, humanView: 800, animation: 140 }
        
        switch (client.preferredCurrency) {
          case 'AUD':
            defaultPrices = { birdView: 2400, halfBirdView: 1800, humanView: 1200, animation: 210 } // 澳元单价
            break
          case 'EUR':
            defaultPrices = { birdView: 1500, halfBirdView: 1125, humanView: 750, animation: 130 } // 欧元单价
            break
          case 'USD':
            defaultPrices = { birdView: 1600, halfBirdView: 1200, humanView: 800, animation: 140 } // 美元单价
            break
          case 'CNY':
            defaultPrices = { birdView: 11600, halfBirdView: 8700, humanView: 5800, animation: 1015 } // 人民币单价
            break
        }
        
        setBudgetConfig(prev => ({
          ...prev,
          birdViewPrice: defaultPrices.birdView,
          halfBirdViewPrice: defaultPrices.halfBirdView,
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
    const { birdViewCount, halfBirdViewCount, humanViewCount, animationDuration } = imageQuantity
    const { birdViewPrice, halfBirdViewPrice, humanViewPrice, animationPrice, birdViewDiscount, halfBirdViewDiscount, humanViewDiscount, animationDiscount, currency } = budgetConfig
    
    // 获取当前币种的汇率
    const currencyRate = exchangeRates.find(rate => rate.currencyCode === currency)
    const exchangeRate = currencyRate ? currencyRate.rate : 1
    
    // 计算各项费用（原币种）
    const birdViewTotal = birdViewCount * birdViewPrice * (birdViewDiscount / 100)
    const halfBirdViewTotal = halfBirdViewCount * halfBirdViewPrice * (halfBirdViewDiscount / 100)
    const humanViewTotal = humanViewCount * humanViewPrice * (humanViewDiscount / 100)
    const animationTotal = animationDuration * animationPrice * (animationDiscount / 100)
    
    // 总费用（原币种）
    const totalOriginal = birdViewTotal + halfBirdViewTotal + humanViewTotal + animationTotal
    
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
        members: teamAssignments.manager,
        hourlyRate: 150, // 项目经理的固定小时费率
        estimatedHours: 10, // 项目经理的估计工时
        totalCost: 150 * 10
      },
      {
        department: 'sales',
        members: teamAssignments.sales,
        hourlyRate: 50, // 销售人员的固定小时费率
        estimatedHours: 5, // 销售人员的估计工时
        totalCost: 50 * 5
      },
      {
        department: 'modeling',
        members: teamAssignments.modeling,
        hourlyRate: 80, // 建模师的固定小时费率
        estimatedHours: 100, // 建模师的估计工时
        totalCost: 80 * 100
      },
      {
        department: 'rendering',
        members: teamAssignments.rendering,
        hourlyRate: 100, // 渲染师的固定小时费率
        estimatedHours: 200, // 渲染师的估计工时
        totalCost: 100 * 200
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
      const halfBirdViewCount = form.getFieldValue('halfBirdViewCount')
      const humanViewCount = form.getFieldValue('humanViewCount')
      const animationDuration = form.getFieldValue('animationDuration')
      const projectBudget = form.getFieldValue('projectBudget')
      
      console.log('验证数据:', {
        protocolNumber,
        projectName,
        clientId,
        birdViewCount,
        halfBirdViewCount,
        humanViewCount,
        animationDuration,
        projectBudget
      })
      
      if (!protocolNumber || !projectName || !clientId) {
        message.error('请完善项目基本信息')
        return
      }
      
      // 修复验证逻辑：允许0值，只检查null和undefined
      if (birdViewCount === null || birdViewCount === undefined || 
          halfBirdViewCount === null || halfBirdViewCount === undefined || 
          humanViewCount === null || humanViewCount === undefined || 
          animationDuration === null || animationDuration === undefined) {
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
      halfBirdViewCount: form.getFieldValue('halfBirdViewCount'),
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
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>
          {`正在加载${isEditMode ? '项目' : '创建'}信息...`}
        </div>
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