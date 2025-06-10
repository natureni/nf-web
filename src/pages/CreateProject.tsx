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
  AutoComplete,
  Statistic,
  Space,
  Alert,
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

  // 检查编辑模式并加载项目数据
  useEffect(() => {
    const loadProjectData = async () => {
      if (id) {
        // 编辑模式
        setIsEditMode(true)
        setLoading(true)
        
        try {
          // 查找项目数据
          const allProjects = getAllProjects()
          const project = allProjects.find(p => p.id === id)

          if (!project) {
            message.error('未找到对应的项目')
            navigate('/projects')
            return
          }

          setCurrentProject(project)

          // 根据项目数据预填充表单
          const clientMatch = clients.find(c => c.companyNameCN === project.client || c.companyName === project.client)
          if (clientMatch) {
            setSelectedClient(clientMatch)
            setSelectedCurrency(clientMatch.preferredCurrency)
          } else {
            setSelectedCurrency(project.currency)
          }

          // 设置表单初始值
          form.setFieldsValue({
            projectName: project.name,
            protocolNumber: project.protocolNumber,
            clientName: project.client,
            projectBudget: project.budget,
            deadline: dayjs(project.deadline),
            description: `${project.type}项目，当前状态：${getStatusText(project.status)}，进度：${project.progress}%`,
          })

          setProjectBudget(project.budget)
          
          // 根据预算反推图量（简单估算）
          setImageQuantity({
            birdViewCount: Math.floor(project.budget / 15000) || 1,
            humanViewCount: Math.floor(project.budget / 8000) || 1,
            animationDuration: Math.floor(project.budget / 20000) || 0,
          })

          setLoading(false)
          message.success(`已加载项目"${project.name}"的信息`)
        } catch (error) {
          console.error('加载项目数据失败:', error)
          message.error('加载项目数据失败')
          setLoading(false)
        }
      } else {
        // 新建模式
        setIsEditMode(false)
        setCurrentProject(null)
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

  // 从系统设置加载汇率数据
  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setExchangeRates(settings.exchangeRates || [])
      } catch (error) {
        console.error('加载汇率设置失败:', error)
        // 设置默认汇率
        setExchangeRates([
          { currency: '人民币', currencyCode: 'CNY', currencySymbol: '¥', rate: 1, region: '中国', flag: '🇨🇳' },
          { currency: '美元', currencyCode: 'USD', currencySymbol: '$', rate: 7.24, region: '美国', flag: '🇺🇸' },
          { currency: '澳元', currencyCode: 'AUD', currencySymbol: 'A$', rate: 4.78, region: '澳大利亚', flag: '🇦🇺' },
          { currency: '欧元', currencyCode: 'EUR', currencySymbol: '€', rate: 7.85, region: '欧盟', flag: '🇪🇺' },
        ])
      }
    } else {
      // 设置默认汇率
      setExchangeRates([
        { currency: '人民币', currencyCode: 'CNY', currencySymbol: '¥', rate: 1, region: '中国', flag: '🇨🇳' },
        { currency: '美元', currencyCode: 'USD', currencySymbol: '$', rate: 7.24, region: '美国', flag: '🇺🇸' },
        { currency: '澳元', currencyCode: 'AUD', currencySymbol: 'A$', rate: 4.78, region: '澳大利亚', flag: '🇦🇺' },
        { currency: '欧元', currencyCode: 'EUR', currencySymbol: '€', rate: 7.85, region: '欧盟', flag: '🇪🇺' },
      ])
    }
  }, [])

  // 更新客户数据，添加偏好币种
  const [clients] = useState<Client[]>([
    {
      id: 'C001',
      companyName: 'URBIS',
      companyNameCN: '澳洲都市设计',
      contactPerson: 'John Smith',
      preferredCurrency: 'AUD', // 澳元
      projectPreferences: {
        style: ['现代风格', '商业', '住宅高层'],
        budget: 'A$450,000 - A$750,000',
        timeline: '3-6 months',
        communication: ['邮件', '视频会议']
      }
    },
    {
      id: 'C002',
      companyName: 'Bathurst Development Corp',
      companyNameCN: '巴瑟斯特发展公司',
      contactPerson: 'David Wilson',
      preferredCurrency: 'AUD', // 澳元
      projectPreferences: {
        style: ['传统', '住宅', '社区规划'],
        budget: 'A$225,000 - A$450,000',
        timeline: '2-4 months',
        communication: ['电话', '邮件']
      }
    },
    {
      id: 'C003',
      companyName: 'NCCEC Group',
      companyNameCN: '中建海外集团',
      contactPerson: 'Michael Chen',
      preferredCurrency: 'USD', // 美元
      projectPreferences: {
        style: ['现代风格', '大型综合体', '办公楼'],
        budget: '$750,000+',
        timeline: '6+ months',
        communication: ['邮件', '视频会议', '面对面会议']
      }
    },
    {
      id: 'C004',
      companyName: 'Norwell Properties',
      companyNameCN: '诺威尔地产',
      contactPerson: 'Sarah Johnson',
      preferredCurrency: 'USD', // 美元
      projectPreferences: {
        style: ['简约', '住宅', '别墅'],
        budget: '$150,000 - $300,000',
        timeline: '1-3 months',
        communication: ['邮件', '电话']
      }
    },
    {
      id: 'C005',
      companyName: 'Olympic Club International',
      companyNameCN: '奥林匹克国际俱乐部',
      contactPerson: 'James Miller',
      preferredCurrency: 'EUR', // 欧元
      projectPreferences: {
        style: ['豪华', '会所', '体育设施'],
        budget: '€540,000 - €810,000',
        timeline: '4-8 months',
        communication: ['视频会议', '面对面会议']
      }
    }
  ])

  // 模拟团队成员数据（实际应用中从团队管理获取）
  const [teamMembers] = useState<TeamMember[]>([
    // 项目经理
    { id: 'TM001', name: '赵项华', department: 'manager', unitPrice: 2, priceType: 'percentage' },
    { id: 'TM002', name: '李管理', department: 'manager', unitPrice: 2.5, priceType: 'percentage' },
    { id: 'TM003', name: '王总监', department: 'manager', unitPrice: 3, priceType: 'percentage' },
    
    // 销售
    { id: 'TM004', name: '陈销售', department: 'sales', unitPrice: 1, priceType: 'percentage' },
    { id: 'TM005', name: '王业务', department: 'sales', unitPrice: 1.2, priceType: 'percentage' },
    { id: 'TM006', name: '刘客户', department: 'sales', unitPrice: 0.8, priceType: 'percentage' },
    
    // 建模师
    { id: 'TM007', name: '张建模', department: 'modeling', unitPrice: 850, priceType: 'fixed', birdViewPrice: 850, humanViewPrice: 800 },
    { id: 'TM008', name: '刘模型', department: 'modeling', unitPrice: 780, priceType: 'fixed', birdViewPrice: 780, humanViewPrice: 750 },
    { id: 'TM009', name: '周三维', department: 'modeling', unitPrice: 920, priceType: 'fixed', birdViewPrice: 920, humanViewPrice: 870 },
    { id: 'TM010', name: '吴建模', department: 'modeling', unitPrice: 800, priceType: 'fixed', birdViewPrice: 800, humanViewPrice: 780 },
    { id: 'TM011', name: '马设计', department: 'modeling', unitPrice: 760, priceType: 'fixed', birdViewPrice: 760, humanViewPrice: 720 },
    
    // 渲染师
    { id: 'TM012', name: '李渲染', department: 'rendering', unitPrice: 1200, priceType: 'fixed', birdViewPrice: 1200, humanViewPrice: 1150, animationPrice: 200 },
    { id: 'TM013', name: '王后期', department: 'rendering', unitPrice: 1050, priceType: 'fixed', birdViewPrice: 1050, humanViewPrice: 1000, animationPrice: 180 },
    { id: 'TM014', name: '陈效果', department: 'rendering', unitPrice: 1180, priceType: 'fixed', birdViewPrice: 1180, humanViewPrice: 1120, animationPrice: 190 },
    { id: 'TM015', name: '赵渲染', department: 'rendering', unitPrice: 1100, priceType: 'fixed', birdViewPrice: 1100, humanViewPrice: 1050, animationPrice: 185 },
    { id: 'TM016', name: '钱视觉', department: 'rendering', unitPrice: 1000, priceType: 'fixed', birdViewPrice: 1000, humanViewPrice: 950, animationPrice: 175 },
    { id: 'TM017', name: '孙特效', department: 'rendering', unitPrice: 1300, priceType: 'fixed', birdViewPrice: 1300, humanViewPrice: 1250, animationPrice: 220 },
  ])

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
    rendering: []
  })

  // 部门成本配置
  const [departmentCosts, setDepartmentCosts] = useState<DepartmentCost[]>([
    { department: 'manager', departmentName: '项目经理', members: [], totalCost: 0 },
    { department: 'sales', departmentName: '销售', members: [], totalCost: 0 },
    { department: 'modeling', departmentName: '建模', members: [], totalCost: 0 },
    { department: 'rendering', departmentName: '渲染', members: [], totalCost: 0 },
  ])

  // 供应商列表（从团队管理中获取）
  const [suppliers] = useState([
    { value: 'internal', label: '内部团队' },
    { value: 'outsource_a', label: '外包合作商A' },
    { value: 'outsource_b', label: '外包合作商B' },
    { value: 'freelancer', label: '自由职业者' },
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

  const steps = [
    { title: '基本信息', description: '项目基础信息填写' },
    { title: '团队分配', description: '团队成员分配与费用设置' },
    { title: '时间安排', description: '项目时间规划' },
  ]

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

  // 处理团队选择
  const handleTeamSelect = (memberIds: string[]) => {
    const selectedMembers = teamMembers.filter(member => memberIds.includes(member.id))
    
    // 按部门自动分配成员
    const newAssignments = {
      manager: selectedMembers.filter(m => m.department === 'manager'),
      sales: selectedMembers.filter(m => m.department === 'sales'),
      modeling: selectedMembers.filter(m => m.department === 'modeling'),
      rendering: selectedMembers.filter(m => m.department === 'rendering'),
    }
    
    setTeamAssignments(newAssignments)
    
    // 触发重新计算成本
    calculateDepartmentCosts()
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
    
    // 总预算（原币种）
    const totalBudgetInOriginalCurrency = birdViewTotal + humanViewTotal + animationTotal
    
    // 转换为人民币
    const totalBudgetInCNY = totalBudgetInOriginalCurrency * exchangeRate
    
    setProjectBudget(totalBudgetInCNY)
    form.setFieldsValue({ projectBudget: totalBudgetInCNY })
    
    return {
      birdViewTotal: birdViewTotal * exchangeRate,
      humanViewTotal: humanViewTotal * exchangeRate,
      animationTotal: animationTotal * exchangeRate,
      totalBudget: totalBudgetInCNY,
      originalCurrency: {
        birdViewTotal,
        humanViewTotal,
        animationTotal,
        totalBudget: totalBudgetInOriginalCurrency,
        currency,
        exchangeRate
      }
    }
  }

  // 处理图量变化
  const handleImageQuantityChange = (field: string, value: number | null) => {
    const updatedQuantity = {
      ...imageQuantity,
      [field]: value || 0
    }
    setImageQuantity(updatedQuantity)
    
    // 自动计算预算
    setTimeout(() => {
      calculateBudget()
      calculateDepartmentCosts() // 重新计算团队成本
    }, 100)
  }

  // 处理预算配置变化
  const handleBudgetConfigChange = (field: string, value: number | null) => {
    const updatedConfig = {
      ...budgetConfig,
      [field]: value || 0
    }
    setBudgetConfig(updatedConfig)
    
    // 自动计算预算
    setTimeout(() => {
      calculateBudget()
      calculateDepartmentCosts() // 重新计算团队成本
    }, 100)
  }

  // 计算部门成本
  const calculateDepartmentCosts = () => {
    // 计算建模费用：基于实际分配给每个建模师的图量
    const modelingCost = teamAssignments.modeling.reduce((sum, member) => {
      const birdViewCost = (member.assignedBirdView || 0) * (member.birdViewPrice || 800)
      const humanViewCost = (member.assignedHumanView || 0) * (member.humanViewPrice || 800)
      return sum + birdViewCost + humanViewCost
    }, 0)

    // 计算渲染费用：基于实际分配给每个渲染师的图量和动画
    const renderingCost = teamAssignments.rendering.reduce((sum, member) => {
      const birdViewCost = (member.assignedBirdView || 0) * (member.birdViewPrice || 1200)
      const humanViewCost = (member.assignedHumanView || 0) * (member.humanViewPrice || 1200)
      const animationCost = (member.assignedAnimation || 0) * (member.animationPrice || 200)
      return sum + birdViewCost + humanViewCost + animationCost
    }, 0)

    const updatedCosts: DepartmentCost[] = [
      {
        department: 'manager',
        departmentName: '项目经理',
        members: teamAssignments.manager,
        totalCost: projectBudget * teamAssignments.manager.reduce((sum, m) => sum + m.unitPrice, 0) / 100
      },
      {
        department: 'sales',
        departmentName: '销售',
        members: teamAssignments.sales,
        totalCost: projectBudget * teamAssignments.sales.reduce((sum, m) => sum + m.unitPrice, 0) / 100
      },
      {
        department: 'modeling',
        departmentName: '建模',
        members: teamAssignments.modeling,
        totalCost: modelingCost
      },
      {
        department: 'rendering',
        departmentName: '渲染',
        members: teamAssignments.rendering,
        totalCost: renderingCost
      }
    ]
    setDepartmentCosts(updatedCosts)
  }

  // 更新部门成本当团队分配或预算变化时
  useEffect(() => {
    calculateDepartmentCosts()
  }, [teamAssignments, projectBudget])

  // 自动调度函数
  const autoSchedulePhases = (updatedItems: typeof scheduleItems) => {
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
          <Card title="项目基本信息" style={{ marginTop: 24 }}>
            <Form form={form} layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="项目协议号"
                    name="protocolNumber"
                    rules={[{ required: true, message: '请输入项目协议号' }]}
                  >
                    <Input 
                      placeholder="请输入项目协议号" 
                      onChange={handleProtocolNumberChange}
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => {
                            const newNumber = generateProtocolNumber()
                            form.setFieldsValue({ protocolNumber: newNumber })
                            handleProtocolNumberChange({ target: { value: newNumber } } as any)
                          }}
                        >
                          自动生成
                        </Button>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="项目名称"
                    name="projectName"
                    rules={[{ required: true, message: '请输入项目名称' }]}
                  >
                    <Input 
                      placeholder="请输入项目名称" 
                      onChange={handleProjectNameChange}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="完整项目名称（协议号 + 项目名称）"
                name="fullProjectName"
              >
                <Input disabled placeholder="将自动生成完整项目名称" />
              </Form.Item>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="客户名称"
                    name="clientId"
                    rules={[{ required: true, message: '请选择客户' }]}
                  >
                    <Select 
                      placeholder="选择客户" 
                      showSearch
                      optionFilterProp="children"
                      onChange={handleClientSelect}
                    >
                      {clients.map(client => (
                        <Option key={client.id} value={client.id}>
                          <div>
                            <div style={{ fontWeight: 500 }}>{client.companyName}</div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                              {client.companyNameCN} - {client.contactPerson}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="项目团队"
                    name="supplier"
                    rules={[{ required: true, message: '请选择团队' }]}
                  >
                    <Select 
                      placeholder="选择团队" 
                      mode="multiple"
                      onChange={handleTeamSelect}
                    >
                      {teamMembers.map(member => (
                        <Option key={member.id} value={member.id}>
                          {member.name} - {member.department === 'manager' ? '项目经理' : 
                                         member.department === 'sales' ? '销售' :
                                         member.department === 'modeling' ? '建模' : '渲染'}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="开始日期"
                    name="startDate"
                    rules={[{ required: true, message: '请选择开始日期' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      placeholder="年-月-日"
                    />
                  </Form.Item>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: -16 }}>
                    如不填写，将自动使用第一个阶段的开始日期
                  </div>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="截止日期"
                    name="endDate"
                    rules={[{ required: true, message: '请选择截止日期' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      placeholder="年-月-日"
                    />
                  </Form.Item>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: -16 }}>
                    如不填写，将自动使用最后一个阶段的结束日期
                  </div>
                </Col>
              </Row>

              {/* 项目图量 */}
              <Card size="small" title="项目图量设置" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="鸟瞰图"
                      name="birdViewCount"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="几张"
                        suffix="张"
                        onChange={(value) => handleImageQuantityChange('birdViewCount', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="人视角图"
                      name="humanViewCount"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="几张"
                        suffix="张"
                        onChange={(value) => handleImageQuantityChange('humanViewCount', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="动画时长"
                      name="animationDuration"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="几秒"
                        suffix="秒"
                        onChange={(value) => handleImageQuantityChange('animationDuration', value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* 预算计算配置 */}
              <Card size="small" title="预算计算配置" style={{ marginBottom: 16 }}>
                {/* 币种选择 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Form.Item label="项目币种" name="projectCurrency">
                      <Select 
                        value={budgetConfig.currency}
                        onChange={(value) => {
                          setSelectedCurrency(value)
                          setBudgetConfig(prev => ({ ...prev, currency: value }))
                          // 根据币种更新默认单价
                          let defaultPrices = { birdView: 1600, humanView: 800, animation: 140 }
                          switch (value) {
                            case 'AUD':
                              defaultPrices = { birdView: 2400, humanView: 1200, animation: 210 }
                              break
                            case 'EUR':
                              defaultPrices = { birdView: 1500, humanView: 750, animation: 130 }
                              break
                            case 'USD':
                              defaultPrices = { birdView: 1600, humanView: 800, animation: 140 }
                              break
                            case 'CNY':
                              defaultPrices = { birdView: 11600, humanView: 5800, animation: 1015 }
                              break
                          }
                          setBudgetConfig(prev => ({
                            ...prev,
                            birdViewPrice: defaultPrices.birdView,
                            humanViewPrice: defaultPrices.humanView,
                            animationPrice: defaultPrices.animation
                          }))
                          setTimeout(() => calculateBudget(), 100)
                        }}
                        placeholder="选择币种"
                      >
                        {exchangeRates.map(rate => (
                          <Option key={rate.currencyCode} value={rate.currencyCode}>
                            <Space>
                              <span>{rate.flag}</span>
                              <span>{rate.currencySymbol} {rate.currency}</span>
                              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                (汇率: {rate.rate})
                              </span>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    {selectedCurrency && selectedCurrency !== 'CNY' && (
                      <Alert
                        message={`当前使用 ${exchangeRates.find(r => r.currencyCode === selectedCurrency)?.currency} 计价，最终预算将按汇率转换为人民币`}
                        type="info"
                        showIcon
                        style={{ marginTop: 24 }}
                      />
                    )}
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Form.Item label={`鸟瞰图单价(${exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'})`}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={budgetConfig.birdViewPrice}
                        onChange={(value) => handleBudgetConfigChange('birdViewPrice', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={`人视角单价(${exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'})`}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={budgetConfig.humanViewPrice}
                        onChange={(value) => handleBudgetConfigChange('humanViewPrice', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={`动画单价(${exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'}/秒)`}>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        value={budgetConfig.animationPrice}
                        onChange={(value) => handleBudgetConfigChange('animationPrice', value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="鸟瞰图折扣(%)">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        value={budgetConfig.birdViewDiscount}
                        onChange={(value) => handleBudgetConfigChange('birdViewDiscount', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="人视角折扣(%)">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        value={budgetConfig.humanViewDiscount}
                        onChange={(value) => handleBudgetConfigChange('humanViewDiscount', value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="动画折扣(%)">
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        value={budgetConfig.animationDiscount}
                        onChange={(value) => handleBudgetConfigChange('animationDiscount', value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 预算计算明细 */}
                {(imageQuantity.birdViewCount > 0 || imageQuantity.humanViewCount > 0 || imageQuantity.animationDuration > 0) && (
                  <div style={{ 
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: '6px',
                    padding: '12px',
                    marginTop: '16px'
                  }}>
                    <div style={{ fontWeight: 500, marginBottom: 8, color: '#52c41a' }}>预算计算明细：</div>
                    {(() => {
                      const currencySymbol = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'
                      const exchangeRate = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.rate || 1
                      const birdViewOriginal = imageQuantity.birdViewCount * budgetConfig.birdViewPrice * budgetConfig.birdViewDiscount / 100
                      const humanViewOriginal = imageQuantity.humanViewCount * budgetConfig.humanViewPrice * budgetConfig.humanViewDiscount / 100
                      const animationOriginal = imageQuantity.animationDuration * budgetConfig.animationPrice * budgetConfig.animationDiscount / 100
                      const totalOriginal = birdViewOriginal + humanViewOriginal + animationOriginal
                      const totalCNY = totalOriginal * exchangeRate
                      
                      return (
                        <>
                          <Row gutter={16}>
                            <Col span={8}>
                              <div style={{ fontSize: 12 }}>
                                鸟瞰图: {imageQuantity.birdViewCount} × {currencySymbol}{budgetConfig.birdViewPrice} × {budgetConfig.birdViewDiscount}% = 
                                <span style={{ fontWeight: 500 }}> {currencySymbol}{birdViewOriginal.toLocaleString()}</span>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div style={{ fontSize: 12 }}>
                                人视角: {imageQuantity.humanViewCount} × {currencySymbol}{budgetConfig.humanViewPrice} × {budgetConfig.humanViewDiscount}% = 
                                <span style={{ fontWeight: 500 }}> {currencySymbol}{humanViewOriginal.toLocaleString()}</span>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div style={{ fontSize: 12 }}>
                                动画: {imageQuantity.animationDuration}秒 × {currencySymbol}{budgetConfig.animationPrice} × {budgetConfig.animationDiscount}% = 
                                <span style={{ fontWeight: 500 }}> {currencySymbol}{animationOriginal.toLocaleString()}</span>
                              </div>
                            </Col>
                          </Row>
                          <div style={{ marginTop: 8, padding: '8px', background: 'white', borderRadius: '4px' }}>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>
                              小计 ({budgetConfig.currency}): <span style={{ color: '#1890ff' }}>{currencySymbol}{totalOriginal.toLocaleString()}</span>
                            </div>
                            {budgetConfig.currency !== 'CNY' && (
                              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                                按汇率 {exchangeRate} 转换为人民币: <span style={{ fontWeight: 500, color: '#52c41a' }}>¥{totalCNY.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </Card>

              {/* 项目预算 */}
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="项目预算 (人民币)"
                    name="projectBudget"
                    rules={[{ required: true, message: '请输入项目预算' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="自动计算，也可手动调整"
                      prefix="¥"
                      value={projectBudget}
                      onChange={handleBudgetChange}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => parseInt(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {projectBudget > 0 && (
                    <div style={{ 
                      padding: '16px',
                      background: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: '6px',
                      marginTop: 24
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#52c41a' }}>
                        预算设置成功
                      </div>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>
                        <strong>项目总预算（人民币）：</strong>
                        <span style={{ color: '#52c41a', fontWeight: 500 }}>¥{projectBudget.toLocaleString()}</span>
                      </div>
                      {budgetConfig.currency !== 'CNY' && (
                        <>
                          <div style={{ fontSize: 12, marginBottom: 4, color: '#8c8c8c' }}>
                            <strong>计价币种：</strong>{exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currency} ({budgetConfig.currency})
                          </div>
                          <div style={{ fontSize: 12, marginBottom: 4, color: '#8c8c8c' }}>
                            <strong>使用汇率：</strong>{exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.rate}
                          </div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            <strong>原币种金额：</strong>
                            {(() => {
                              const rate = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.rate || 1
                              const symbol = exchangeRates.find(r => r.currencyCode === budgetConfig.currency)?.currencySymbol || '$'
                              return `${symbol}${(projectBudget / rate).toLocaleString()}`
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </Col>
              </Row>

              <Form.Item label="项目描述（已自动提取客户偏好信息）" name="description">
                <TextArea 
                  rows={6} 
                  placeholder="请输入项目描述..." 
                  disabled={!selectedClient}
                />
              </Form.Item>

              {selectedClient && (
                <Card size="small" title="客户偏好信息" style={{ background: '#f8f9fa' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div><strong>风格偏好:</strong> {Array.isArray(selectedClient.projectPreferences.style) ? selectedClient.projectPreferences.style.join(', ') : selectedClient.projectPreferences.style}</div>
                    </Col>
                    <Col span={12}>
                      <div><strong>预算范围:</strong> {selectedClient.projectPreferences.budget}</div>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <div><strong>时间周期:</strong> {selectedClient.projectPreferences.timeline}</div>
                    </Col>
                    <Col span={12}>
                      <div><strong>沟通方式:</strong> {Array.isArray(selectedClient.projectPreferences.communication) ? selectedClient.projectPreferences.communication.join(', ') : selectedClient.projectPreferences.communication}</div>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <div><strong>偏好币种:</strong> 
                        <span style={{ marginLeft: 8 }}>
                          {exchangeRates.find(r => r.currencyCode === selectedClient.preferredCurrency)?.flag} 
                          {selectedClient.preferredCurrency} ({exchangeRates.find(r => r.currencyCode === selectedClient.preferredCurrency)?.currency})
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div><strong>当前汇率:</strong> {exchangeRates.find(r => r.currencyCode === selectedClient.preferredCurrency)?.rate}</div>
                    </Col>
                  </Row>
                </Card>
              )}
            </Form>
          </Card>
        )

      case 1:
        return (
          <Card title="团队分配" style={{ marginTop: 24 }}>
            <Row gutter={24}>
              {/* 项目经理分配 */}
              <Col span={12}>
                <Card size="small" title="项目经理分配" style={{ marginBottom: 16 }}>
                  <Form.Item label="选择项目经理">
                    <Select
                      placeholder="选择项目经理"
                      style={{ width: '100%', marginBottom: 16 }}
                      onChange={(value) => {
                        const member = teamMembers.find(m => m.id === value)
                        if (member && !teamAssignments.manager.find(m => m.id === value)) {
                          setTeamAssignments(prev => ({
                            ...prev,
                            manager: [...prev.manager, member]
                          }))
                        }
                      }}
                    >
                      {teamMembers
                        .filter(m => m.department === 'manager')
                        .map(member => (
                          <Option key={member.id} value={member.id}>
                            {member.name} ({member.unitPrice}% 项目金额)
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                      已分配项目经理：
                    </div>
                    {teamAssignments.manager.map(member => (
                      <Tag 
                        key={member.id}
                        closable
                        onClose={() => {
                          setTeamAssignments(prev => ({
                            ...prev,
                            manager: prev.manager.filter(m => m.id !== member.id)
                          }))
                        }}
                        style={{ marginBottom: 8 }}
                      >
                        {member.name} ({member.unitPrice}%)
                      </Tag>
                    ))}
                  </div>

                  <Form.Item label="项目金额" style={{ marginBottom: 0 }}>
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="输入项目总金额"
                      prefix="¥"
                      value={projectBudget}
                      onChange={handleBudgetChange}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => parseInt(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                    />
                  </Form.Item>

                  {projectBudget > 0 && teamAssignments.manager.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                      项目经理总费用: ¥{(projectBudget * teamAssignments.manager.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
                    </div>
                  )}
                </Card>
              </Col>

              {/* 销售分配 */}
              <Col span={12}>
                <Card size="small" title="销售分配" style={{ marginBottom: 16 }}>
                  <Form.Item label="选择销售">
                    <Select
                      placeholder="选择销售"
                      style={{ width: '100%', marginBottom: 16 }}
                      onChange={(value) => {
                        const member = teamMembers.find(m => m.id === value)
                        if (member && !teamAssignments.sales.find(m => m.id === value)) {
                          setTeamAssignments(prev => ({
                            ...prev,
                            sales: [...prev.sales, member]
                          }))
                        }
                      }}
                    >
                      {teamMembers
                        .filter(m => m.department === 'sales')
                        .map(member => (
                          <Option key={member.id} value={member.id}>
                            {member.name} ({member.unitPrice}% 项目金额)
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                      已分配销售：
                    </div>
                    {teamAssignments.sales.map(member => (
                      <Tag 
                        key={member.id}
                        closable
                        onClose={() => {
                          setTeamAssignments(prev => ({
                            ...prev,
                            sales: prev.sales.filter(m => m.id !== member.id)
                          }))
                        }}
                        style={{ marginBottom: 8 }}
                      >
                        {member.name} ({member.unitPrice}%)
                      </Tag>
                    ))}
                  </div>

                  {projectBudget > 0 && teamAssignments.sales.length > 0 && (
                    <div style={{ fontSize: 12, color: '#52c41a' }}>
                      销售总费用: ¥{(projectBudget * teamAssignments.sales.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <Row gutter={24}>
              {/* 建模分配 */}
              <Col span={12}>
                <Card size="small" title="建模分配" style={{ marginBottom: 16 }}>
                  <Form.Item label="选择建模师">
                    <Select
                      placeholder="选择建模师"
                      style={{ width: '100%', marginBottom: 16 }}
                      onChange={(value) => {
                        const member = teamMembers.find(m => m.id === value)
                        if (member && !teamAssignments.modeling.find(m => m.id === value)) {
                          setTeamAssignments(prev => ({
                            ...prev,
                            modeling: [...prev.modeling, { ...member, cost: member.unitPrice, unit: '工作量' }]
                          }))
                        }
                      }}
                    >
                      {teamMembers
                        .filter(m => m.department === 'modeling')
                        .map(member => (
                          <Option key={member.id} value={member.id}>
                            {member.name} (¥{member.unitPrice}/工作量)
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                      已分配建模师：
                    </div>
                    {teamAssignments.modeling.map(member => (
                      <div key={member.id} style={{ 
                        marginBottom: 12,
                        padding: '12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        background: '#fafafa'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                          <span style={{ fontWeight: 500 }}>{member.name}</span>
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            style={{ marginLeft: 'auto' }}
                            onClick={() => {
                              setTeamAssignments(prev => ({
                                ...prev,
                                modeling: prev.modeling.filter(m => m.id !== member.id)
                              }))
                              calculateDepartmentCosts()
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, marginRight: 4 }}>鸟瞰图:</span>
                            <InputNumber
                              size="small"
                              style={{ width: 60 }}
                              value={member.assignedBirdView || 0}
                              min={0}
                              onChange={(value) => {
                                const updated = teamAssignments.modeling.map(m => 
                                  m.id === member.id ? { ...m, assignedBirdView: value || 0 } : m
                                )
                                setTeamAssignments(prev => ({
                                  ...prev,
                                  modeling: updated
                                }))
                                calculateDepartmentCosts()
                              }}
                            />
                            <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, marginRight: 4 }}>人视角:</span>
                            <InputNumber
                              size="small"
                              style={{ width: 60 }}
                              value={member.assignedHumanView || 0}
                              min={0}
                              onChange={(value) => {
                                const updated = teamAssignments.modeling.map(m => 
                                  m.id === member.id ? { ...m, assignedHumanView: value || 0 } : m
                                )
                                setTeamAssignments(prev => ({
                                  ...prev,
                                  modeling: updated
                                }))
                                calculateDepartmentCosts()
                              }}
                            />
                            <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                          费用: ¥{((member.assignedBirdView || 0) * (member.birdViewPrice || 800) + (member.assignedHumanView || 0) * (member.humanViewPrice || 800)).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    费用: ¥{departmentCosts.find(d => d.department === 'modeling')?.totalCost.toLocaleString() || '0'}
                  </div>
                </Card>
              </Col>

              {/* 渲染分配 */}
              <Col span={12}>
                <Card size="small" title="渲染分配" style={{ marginBottom: 16 }}>
                  <Form.Item label="选择渲染师">
                    <Select
                      placeholder="选择渲染师"
                      style={{ width: '100%', marginBottom: 16 }}
                      onChange={(value) => {
                        const member = teamMembers.find(m => m.id === value)
                        if (member && !teamAssignments.rendering.find(m => m.id === value)) {
                          setTeamAssignments(prev => ({
                            ...prev,
                            rendering: [...prev.rendering, { ...member, cost: member.unitPrice, unit: '工作量' }]
                          }))
                        }
                      }}
                    >
                      {teamMembers
                        .filter(m => m.department === 'rendering')
                        .map(member => (
                          <Option key={member.id} value={member.id}>
                            {member.name} (¥{member.unitPrice}/工作量)
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                      已分配渲染师：
                    </div>
                    {teamAssignments.rendering.map(member => (
                      <div key={member.id} style={{ 
                        marginBottom: 12,
                        padding: '12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        background: '#fafafa'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                          <span style={{ fontWeight: 500 }}>{member.name}</span>
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            style={{ marginLeft: 'auto' }}
                            onClick={() => {
                              setTeamAssignments(prev => ({
                                ...prev,
                                rendering: prev.rendering.filter(m => m.id !== member.id)
                              }))
                              calculateDepartmentCosts()
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, marginRight: 4 }}>鸟瞰图:</span>
                            <InputNumber
                              size="small"
                              style={{ width: 60 }}
                              value={member.assignedBirdView || 0}
                              min={0}
                              onChange={(value) => {
                                const updated = teamAssignments.rendering.map(m => 
                                  m.id === member.id ? { ...m, assignedBirdView: value || 0 } : m
                                )
                                setTeamAssignments(prev => ({
                                  ...prev,
                                  rendering: updated
                                }))
                                calculateDepartmentCosts()
                              }}
                            />
                            <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, marginRight: 4 }}>人视角:</span>
                            <InputNumber
                              size="small"
                              style={{ width: 60 }}
                              value={member.assignedHumanView || 0}
                              min={0}
                              onChange={(value) => {
                                const updated = teamAssignments.rendering.map(m => 
                                  m.id === member.id ? { ...m, assignedHumanView: value || 0 } : m
                                )
                                setTeamAssignments(prev => ({
                                  ...prev,
                                  rendering: updated
                                }))
                                calculateDepartmentCosts()
                              }}
                            />
                            <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, marginRight: 4 }}>动画:</span>
                            <InputNumber
                              size="small"
                              style={{ width: 60 }}
                              value={member.assignedAnimation || 0}
                              min={0}
                              onChange={(value) => {
                                const updated = teamAssignments.rendering.map(m => 
                                  m.id === member.id ? { ...m, assignedAnimation: value || 0 } : m
                                )
                                setTeamAssignments(prev => ({
                                  ...prev,
                                  rendering: updated
                                }))
                                calculateDepartmentCosts()
                              }}
                            />
                            <span style={{ fontSize: 12, marginLeft: 2 }}>秒</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                          费用: ¥{(
                            (member.assignedBirdView || 0) * (member.birdViewPrice || 1200) + 
                            (member.assignedHumanView || 0) * (member.humanViewPrice || 1200) + 
                            (member.assignedAnimation || 0) * (member.animationPrice || 200)
                          ).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    费用: ¥{departmentCosts.find(d => d.department === 'rendering')?.totalCost.toLocaleString() || '0'}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 团队分配总结 */}
            <Card size="small" title="团队分配总结" style={{ background: '#f8f9fa' }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic 
                    title="项目经理" 
                    value={teamAssignments.manager.length} 
                    suffix="人"
                    valueStyle={{ color: '#1890ff' }}
                  />
                  {projectBudget > 0 && (
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      费用: ¥{(projectBudget * teamAssignments.manager.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
                    </div>
                  )}
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="销售" 
                    value={teamAssignments.sales.length} 
                    suffix="人"
                    valueStyle={{ color: '#52c41a' }}
                  />
                  {projectBudget > 0 && (
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      费用: ¥{(projectBudget * teamAssignments.sales.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
                    </div>
                  )}
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="建模师" 
                    value={teamAssignments.modeling.length} 
                    suffix="人"
                    valueStyle={{ color: '#faad14' }}
                  />
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    费用: ¥{departmentCosts.find(d => d.department === 'modeling')?.totalCost.toLocaleString() || '0'}
                  </div>
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="渲染师" 
                    value={teamAssignments.rendering.length} 
                    suffix="人"
                    valueStyle={{ color: '#f5222d' }}
                  />
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    费用: ¥{departmentCosts.find(d => d.department === 'rendering')?.totalCost.toLocaleString() || '0'}
                  </div>
                </Col>
              </Row>
              
              <div style={{ 
                marginTop: 16, 
                padding: '12px',
                background: 'white',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <span style={{ fontWeight: 500, fontSize: 16 }}>团队总费用：</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#52c41a', marginLeft: 8 }}>
                  ¥{departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0).toLocaleString()}
                </span>
              </div>
            </Card>
          </Card>
        )

      case 2:
        return (
          <Card title="项目时间安排" style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <h4>项目阶段时间规划</h4>
              <p style={{ color: '#8c8c8c', fontSize: 14 }}>
                请设置项目各个阶段的时间安排。系统将根据您的设置自动生成甘特图。
              </p>
            </div>

            {/* 时间安排表格 */}
            <Table
              dataSource={scheduleItems}
              pagination={false}
              columns={[
                {
                  title: '项目阶段',
                  dataIndex: 'phase',
                  render: (text, record) => (
                    <Space>
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        backgroundColor: record.color, 
                        borderRadius: '50%', 
                        marginRight: 8 
                      }} />
                      <span style={{ fontWeight: 500 }}>{text}</span>
                    </Space>
                  ),
                },
                {
                  title: '开始日期',
                  dataIndex: 'startDate',
                  render: (date, record, index) => (
                    <DatePicker
                      value={dayjs(date)}
                      onChange={(newDate) => {
                        const updated = [...scheduleItems]
                        updated[index].startDate = newDate?.format('YYYY-MM-DD') || date
                        setScheduleItems(updated)
                      }}
                      disabled={record.autoSchedule}
                    />
                  ),
                },
                {
                  title: '结束日期',
                  dataIndex: 'endDate',
                  render: (date, record, index) => (
                    <DatePicker
                      value={dayjs(date)}
                      onChange={(newDate) => {
                        const updated = [...scheduleItems]
                        updated[index].endDate = newDate?.format('YYYY-MM-DD') || date
                        setScheduleItems(updated)
                      }}
                      disabled={record.autoSchedule}
                    />
                  ),
                },
                {
                  title: '工期',
                  render: (_, record, index) => {
                    if (record.autoSchedule) {
                      // 自动调度时显示默认工期并允许修改
                      return (
                        <InputNumber
                          value={record.duration}
                          min={1}
                          max={30}
                          suffix="天"
                          size="small"
                          style={{ width: 80 }}
                          onChange={(value) => {
                            const updated = [...scheduleItems]
                            updated[index].duration = value || record.duration
                            // 重新计算结束日期
                            const startDate = dayjs(updated[index].startDate)
                            updated[index].endDate = startDate.add((value || record.duration) - 1, 'day').format('YYYY-MM-DD')
                            setScheduleItems(updated)
                          }}
                        />
                      )
                    } else {
                      // 手动设置时显示实际工期
                      const start = dayjs(record.startDate)
                      const end = dayjs(record.endDate)
                      const days = end.diff(start, 'day') + 1
                      return <span>{days} 天</span>
                    }
                  },
                },
                {
                  title: '自动调度',
                  dataIndex: 'autoSchedule',
                  render: (auto, record, index) => (
                    <Checkbox
                      checked={auto}
                      onChange={(e) => {
                        const updated = [...scheduleItems]
                        updated[index].autoSchedule = e.target.checked
                        
                        if (e.target.checked && index > 0) {
                          // 如果勾选自动调度，自动计算该阶段的时间
                          const prevPhase = updated[index - 1]
                          const startDate = dayjs(prevPhase.endDate).add(1, 'day')
                          updated[index].startDate = startDate.format('YYYY-MM-DD')
                          updated[index].endDate = startDate.add(updated[index].duration - 1, 'day').format('YYYY-MM-DD')
                          
                          // 重新调度后续的自动调度阶段
                          setScheduleItems(autoSchedulePhases(updated))
                        } else {
                          setScheduleItems(updated)
                        }
                      }}
                      disabled={index === 0} // 第一个阶段不能设置自动调度
                    >
                      自动安排
                    </Checkbox>
                  ),
                },
              ]}
              footer={() => (
                <div style={{ 
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef'
                }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ fontWeight: 500 }}>时间安排说明：</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      • 项目报备阶段为固定阶段，不可设置自动调度<br/>
                      • 勾选"自动安排"的阶段将根据前一阶段的结束时间自动计算开始时间<br/>
                      • 项目总工期：{(() => {
                        const start = dayjs(scheduleItems[0].startDate)
                        const end = dayjs(scheduleItems[scheduleItems.length - 1].endDate)
                        return end.diff(start, 'day') + 1
                      })()} 天
                    </div>
                  </Space>
                </div>
              )}
            />

            {/* 项目概览 */}
            <Card size="small" title="项目创建概览" style={{ marginTop: 24, background: '#f8f9fa' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: '#8c8c8c' }}>项目信息</div>
                    <div style={{ fontSize: 16, fontWeight: 500, margin: '8px 0' }}>
                      {form.getFieldValue('fullProjectName') || '未设置项目名称'}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      客户：{selectedClient?.companyName || '未选择客户'}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: '#8c8c8c' }}>团队配置</div>
                    <div style={{ fontSize: 16, fontWeight: 500, margin: '8px 0' }}>
                      {teamAssignments.manager.length + teamAssignments.sales.length + teamAssignments.modeling.length + teamAssignments.rendering.length} 人
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      经理{teamAssignments.manager.length}人 销售{teamAssignments.sales.length}人 建模{teamAssignments.modeling.length}人 渲染{teamAssignments.rendering.length}人
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: '#8c8c8c' }}>项目预算</div>
                    <div style={{ fontSize: 16, fontWeight: 500, margin: '8px 0', color: '#52c41a' }}>
                      ¥{projectBudget.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      成本：¥{departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0).toLocaleString()}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Card>
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
      const supplier = form.getFieldValue('supplier')
      const birdViewCount = form.getFieldValue('birdViewCount')
      const humanViewCount = form.getFieldValue('humanViewCount')
      const animationDuration = form.getFieldValue('animationDuration')
      const projectBudget = form.getFieldValue('projectBudget')
      
      if (!protocolNumber || !projectName || !clientId || !supplier) {
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
      protocolNumber: form.getFieldValue('protocolNumber'),
      projectName: form.getFieldValue('projectName'),
      fullProjectName: form.getFieldValue('fullProjectName'),
      clientId: form.getFieldValue('clientId'),
      clientName: selectedClient?.companyName,
      supplier: form.getFieldValue('supplier'),
      startDate: form.getFieldValue('startDate')?.format('YYYY-MM-DD'),
      endDate: form.getFieldValue('endDate')?.format('YYYY-MM-DD'),
      description: form.getFieldValue('description'),
      
      // 项目图量
      birdViewCount: form.getFieldValue('birdViewCount'),
      humanViewCount: form.getFieldValue('humanViewCount'),
      animationDuration: form.getFieldValue('animationDuration'),
      
      // 团队分配
      teamAssignments,
      projectBudget,
      
      // 预算信息
      departmentCosts,
      totalCost: departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0),
      profit: projectBudget - departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0),
      
      // 时间安排
      scheduleItems,
      totalDuration: (() => {
        const start = dayjs(scheduleItems[0].startDate)
        const end = dayjs(scheduleItems[scheduleItems.length - 1].endDate)
        return end.diff(start, 'day') + 1
      })(),
      
      // 创建/修改时间
      createdAt: isEditMode ? currentProject?.createdAt : new Date().toISOString(),
      updatedAt: isEditMode ? new Date().toISOString() : undefined,
      status: isEditMode ? currentProject?.status : '报备中', // 编辑模式保持原状态，新建默认报备中
      projectId: isEditMode ? id : undefined
    }
    
    console.log(isEditMode ? '项目编辑数据:' : '项目创建数据:', projectData)
    
    if (isEditMode) {
      message.success(`项目"${currentProject?.name}"更新成功！即将返回项目列表`)
    } else {
      message.success('项目创建成功！即将跳转到项目列表')
    }
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(() => {
      navigate('/projects')
    }, 1500)
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
                {isEditMode ? '💾 保存修改' : '🔐 新建项目'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProject 