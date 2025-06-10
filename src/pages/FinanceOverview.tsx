import React, { useState, useRef } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Upload, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  message,
  Tabs,
  Divider,
  Progress,
  Tooltip
} from 'antd'
import {
  DollarOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  InboxOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  AlertOutlined,
  PieChartOutlined,
  BarChartOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { Dragger } = Upload
const { Option } = Select
const { RangePicker } = DatePicker

// 项目接口定义
interface Project {
  id: string
  name: string
  protocolNumber: string
  client: string
  status: 'reporting' | 'modeling' | 'rendering' | 'delivering'
  deadline: string
  budget: number
  paymentStatus: 'unpaid' | 'partial' | 'completed' | 'overdue'
  progress: number
  type: string
  completedDate?: string // 出图完成日期
}

// 项目成本结构
interface ProjectCost {
  projectId: string
  projectName: string
  client: string
  totalBudget: number
  actualRevenue: number
  projectManagerCost: number  // 项目经理成本 (2%)
  modelingCost: number       // 模型成本 (按工作量)
  renderingCost: number      // 渲染成本 (按工作量)
  salesCost: number          // 销售成本 (1%)
  fixedCost: number          // 分摊固定成本
  totalCost: number
  grossProfit: number
  profitMargin: number
  expectedPaymentDate: string // 预期回款日期
  actualPaymentDate?: string
  paymentStatus: 'unpaid' | 'partial' | 'completed' | 'overdue'
}

// 固定成本结构
interface FixedCost {
  month: string
  rent: number
  utilities: number
  software: number
  equipment: number
  insurance: number
  other: number
  total: number
}

const FinanceOverview: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-01')
  // 新增时间维度筛选状态
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'halfYear' | 'year'>('month')
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01')
  
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
    // 预设一些固定成本数据
    {
      month: '2024-12',
      rent: 45000,
      utilities: 7500,
      software: 11000,
      equipment: 13000,
      insurance: 2800,
      other: 6200,
      total: 85500
    },
    {
      month: '2025-01',
      rent: 50000,
      utilities: 8000,
      software: 12000,
      equipment: 15000,
      insurance: 3000,
      other: 7000,
      total: 95000
    }
  ])
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCost | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<string>('all') // 账期管理筛选状态
  const fileInputRef = useRef<any>(null)

  // 丰富的项目数据 (同步项目管理模块)
  const projects: Project[] = [
    // 2024年12月完成的项目
    {
      id: 'NF0801',
      name: '万科翡翠天地住宅项目',
      protocolNumber: 'NF0801',
      client: '万科集团',
      status: 'delivering',
      deadline: '2024-12-15',
      budget: 280000,
      paymentStatus: 'completed',
      progress: 100,
      type: '住宅项目',
      completedDate: '2024-12-10'
    },
    {
      id: 'NF0802',
      name: '保利中央公园商业综合体',
      protocolNumber: 'NF0802',
      client: '保利地产',
      status: 'delivering',
      deadline: '2024-12-20',
      budget: 350000,
      paymentStatus: 'partial',
      progress: 100,
      type: '商业综合体',
      completedDate: '2024-12-18'
    },
    {
      id: 'NF0803',
      name: '龙湖天街购物中心',
      protocolNumber: 'NF0803',
      client: '龙湖集团',
      status: 'delivering',
      deadline: '2024-12-25',
      budget: 420000,
      paymentStatus: 'completed',
      progress: 100,
      type: '购物中心',
      completedDate: '2024-12-22'
    },

    // 2025年1月完成的项目 (当前月)
    {
      id: 'NF0808',
      name: 'Norwell',
      protocolNumber: 'NF0808',
      client: 'Norwell置业',
      status: 'delivering',
      deadline: '2025-05-30',
      budget: 220000,
      paymentStatus: 'partial',
      progress: 85,
      type: '住宅项目',
      completedDate: '2025-01-15'
    },
    {
      id: 'NF0813',
      name: '47-49 Fitzroy St',
      protocolNumber: 'NF0813',
      client: 'Fitzroy开发有限公司',
      status: 'delivering',
      deadline: '2025-04-10',
      budget: 250000,
      paymentStatus: 'completed',
      progress: 80,
      type: '街区改造',
      completedDate: '2025-01-10'
    },
    {
      id: 'NF0814',
      name: 'Airlie Beach - 等反璟',
      protocolNumber: 'NF0814',
      client: '海滨度假村集团',
      status: 'rendering',
      deadline: '2025-03-25',
      budget: 120000,
      paymentStatus: 'completed',
      progress: 100,
      type: '度假村',
      completedDate: '2025-01-20'
    },
    {
      id: 'NF0815',
      name: 'UCM COB3',
      protocolNumber: 'NF0815',
      client: 'UCM建设集团',
      status: 'delivering',
      deadline: '2025-08-05',
      budget: 350000,
      paymentStatus: 'partial',
      progress: 75,
      type: '办公建筑',
      completedDate: '2025-01-25'
    },
    {
      id: 'NF0817',
      name: '281 Springvale Rd R3',
      protocolNumber: 'NF0817',
      client: 'Springvale开发公司',
      status: 'delivering',
      deadline: '2025-02-28',
      budget: 220000,
      paymentStatus: 'completed',
      progress: 100,
      type: '道路沿线开发',
      completedDate: '2025-01-28'
    },
    {
      id: 'NF0820',
      name: '绿地中央广场',
      protocolNumber: 'NF0820',
      client: '绿地控股',
      status: 'delivering',
      deadline: '2025-03-15',
      budget: 380000,
      paymentStatus: 'overdue',
      progress: 90,
      type: '商业广场',
      completedDate: '2025-01-30'
    },

    // 进行中的项目 (未完成)
    {
      id: 'NF0805',
      name: '120 Bathurst St',
      protocolNumber: 'NF0805',
      client: 'Bathurst开发公司',
      status: 'reporting',
      deadline: '2025-06-15',
      budget: 180000,
      paymentStatus: 'partial',
      progress: 15,
      type: '商业建筑'
    },
    {
      id: 'NF0806',
      name: 'NCCEC',
      protocolNumber: 'NF0806',
      client: 'NCCEC集团',
      status: 'reporting',
      deadline: '2025-07-20',
      budget: 150000,
      paymentStatus: 'unpaid',
      progress: 8,
      type: '展览中心'
    },
    {
      id: 'NF0809',
      name: 'Jasper R2',
      protocolNumber: 'NF0809',
      client: 'Jasper开发有限公司',
      status: 'modeling',
      deadline: '2025-04-10',
      budget: 190000,
      paymentStatus: 'completed',
      progress: 40,
      type: '住宅综合体'
    },
    {
      id: 'NF0810',
      name: 'Warsan Logistics Park R2',
      protocolNumber: 'NF0810',
      client: '物流园区开发商',
      status: 'modeling',
      deadline: '2025-06-15',
      budget: 200000,
      paymentStatus: 'partial',
      progress: 45,
      type: '物流园区'
    },
    {
      id: 'NF0811',
      name: 'AMSQ',
      protocolNumber: 'NF0811',
      client: 'AMSQ集团',
      status: 'reporting',
      deadline: '2025-07-20',
      budget: 150000,
      paymentStatus: 'completed',
      progress: 10,
      type: '商业综合体'
    },
    {
      id: 'NF0812',
      name: 'PUMPKIN',
      protocolNumber: 'NF0812',
      client: '南瓜置业',
      status: 'rendering',
      deadline: '2025-05-30',
      budget: 180000,
      paymentStatus: 'partial',
      progress: 65,
      type: '住宅项目'
    },
    {
      id: 'NF0816',
      name: 'Parcel 5',
      protocolNumber: 'NF0816',
      client: '土地开发商',
      status: 'delivering',
      deadline: '2025-07-10',
      budget: 100000,
      paymentStatus: 'partial',
      progress: 80,
      type: '地块开发'
    },
    {
      id: 'NF0818',
      name: 'North Gosford R3',
      protocolNumber: 'NF0818',
      client: 'Gosford市政府',
      status: 'reporting',
      deadline: '2025-06-20',
      budget: 280000,
      paymentStatus: 'unpaid',
      progress: 12,
      type: '市政项目'
    },
    {
      id: 'NF0819',
      name: '华润万象城',
      protocolNumber: 'NF0819',
      client: '华润置地',
      status: 'rendering',
      deadline: '2025-04-30',
      budget: 450000,
      paymentStatus: 'partial',
      progress: 55,
      type: '购物中心'
    },
    {
      id: 'NF0821',
      name: '中海国际社区',
      protocolNumber: 'NF0821',
      client: '中海地产',
      status: 'modeling',
      deadline: '2025-05-15',
      budget: 320000,
      paymentStatus: 'unpaid',
      progress: 25,
      type: '住宅社区'
    }
  ]

  // 获取时间范围内的项目数据
  const getProjectsInPeriod = () => {
    const currentDate = dayjs()
    
    switch (timePeriod) {
      case 'month':
        // 获取指定月份的项目
        return projects.filter(project => {
          if (!project.completedDate) return false
          return dayjs(project.completedDate).format('YYYY-MM') === selectedPeriod
        })
      
      case 'quarter':
        // 获取指定季度的项目
        const quarter = parseInt(selectedPeriod.split('-Q')[1])
        const year = parseInt(selectedPeriod.split('-Q')[0])
        return projects.filter(project => {
          if (!project.completedDate) return false
          const projectDate = dayjs(project.completedDate)
          const projectQuarter = Math.ceil(projectDate.month() / 3)
          return projectDate.year() === year && projectQuarter === quarter
        })
      
      case 'halfYear':
        // 获取指定半年的项目
        const half = selectedPeriod.includes('H1') ? 1 : 2
        const halfYear = parseInt(selectedPeriod.split('-H')[0])
        return projects.filter(project => {
          if (!project.completedDate) return false
          const projectDate = dayjs(project.completedDate)
          const projectHalf = projectDate.month() < 6 ? 1 : 2
          return projectDate.year() === halfYear && projectHalf === half
        })
      
      case 'year':
        // 获取指定年份的项目
        const selectedYear = parseInt(selectedPeriod)
        return projects.filter(project => {
          if (!project.completedDate) return false
          return dayjs(project.completedDate).year() === selectedYear
        })
      
      default:
        return []
    }
  }

  // 生成时间选项
  const getTimeOptions = () => {
    const currentDate = dayjs()
    const options = []
    
    switch (timePeriod) {
      case 'month':
        // 生成最近12个月的选项
        for (let i = 11; i >= 0; i--) {
          const date = currentDate.subtract(i, 'month')
          options.push({
            value: date.format('YYYY-MM'),
            label: date.format('YYYY年MM月')
          })
        }
        break
      
      case 'quarter':
        // 生成最近8个季度的选项
        for (let i = 7; i >= 0; i--) {
          const date = currentDate.subtract(i * 3, 'month')
          const quarter = Math.ceil((date.month() + 1) / 3)
          options.push({
            value: `${date.year()}-Q${quarter}`,
            label: `${date.year()}年第${quarter}季度`
          })
        }
        break
      
      case 'halfYear':
        // 生成最近4个半年的选项
        for (let i = 3; i >= 0; i--) {
          const date = currentDate.subtract(i * 6, 'month')
          const half = date.month() < 6 ? 1 : 2
          options.push({
            value: `${date.year()}-H${half}`,
            label: `${date.year()}年${half === 1 ? '上' : '下'}半年`
          })
        }
        break
      
      case 'year':
        // 生成最近3年的选项
        for (let i = 2; i >= 0; i--) {
          const year = currentDate.subtract(i, 'year').year()
          options.push({
            value: year.toString(),
            label: `${year}年`
          })
        }
        break
    }
    
    return options
  }

  // 处理时间维度变化
  const handleTimePeriodChange = (newPeriod: 'month' | 'quarter' | 'halfYear' | 'year') => {
    setTimePeriod(newPeriod)
    // 设置默认的时间选择
    const options = getTimeOptions()
    if (options.length > 0) {
      setSelectedPeriod(options[0].value)
    }
  }

  // 计算项目成本的函数
  const calculateProjectCosts = (project: Project): ProjectCost => {
    const projectManagerCost = project.budget * 0.02 // 2%提成
    const salesCost = project.budget * 0.01 // 1%提成
    
    // 模拟建模和渲染工作量成本
    const modelingWorkload = Math.floor(project.budget / 50000) * 2 // 估算工作量
    const renderingWorkload = Math.floor(project.budget / 40000) * 3 // 估算工作量
    const modelingCost = modelingWorkload * 800
    const renderingCost = renderingWorkload * 800
    
    // 分摊固定成本 (假设每个项目分摊5000元)
    const fixedCost = 5000
    
    const totalCost = projectManagerCost + salesCost + modelingCost + renderingCost + fixedCost
    const actualRevenue = project.budget // 简化处理，实际应该考虑折扣
    const grossProfit = actualRevenue - totalCost
    const profitMargin = (grossProfit / actualRevenue) * 100

    return {
      projectId: project.id,
      projectName: project.name,
      client: project.client,
      totalBudget: project.budget,
      actualRevenue,
      projectManagerCost,
      modelingCost,
      renderingCost,
      salesCost,
      fixedCost,
      totalCost,
      grossProfit,
      profitMargin,
      expectedPaymentDate: dayjs(project.deadline).add(30, 'day').format('YYYY-MM-DD'),
      paymentStatus: project.paymentStatus
    }
  }

  // 获取本月已出图项目
  const completedProjects = getProjectsInPeriod()

  // 计算本月财务数据
  const monthlyFinance = completedProjects.reduce((acc, project) => {
    const costs = calculateProjectCosts(project)
    return {
      revenue: acc.revenue + costs.actualRevenue,
      cost: acc.cost + costs.totalCost,
      profit: acc.profit + costs.grossProfit
    }
  }, { revenue: 0, cost: 0, profit: 0 })

  const profitMargin = monthlyFinance.revenue > 0 ? (monthlyFinance.profit / monthlyFinance.revenue) * 100 : 0

  // 更真实的历史月度数据
  const monthlyTrends = [
    { month: '2024-08', revenue: 890000, cost: 623000, profit: 267000 },
    { month: '2024-09', revenue: 1200000, cost: 840000, profit: 360000 },
    { month: '2024-10', revenue: 980000, cost: 686000, profit: 294000 },
    { month: '2024-11', revenue: 1350000, cost: 945000, profit: 405000 },
    { month: '2024-12', revenue: 1050000, cost: 735000, profit: 315000 }, // 12月完成3个项目
    { month: '2025-01', revenue: monthlyFinance.revenue, cost: monthlyFinance.cost, profit: monthlyFinance.profit }
  ]

  // 项目利润分析数据
  const projectCostAnalysis = completedProjects.map(calculateProjectCosts)

  // 所有项目的账期管理 (包含未出图项目)
  const allProjectsForPayment = projects.map(project => ({
    ...calculateProjectCosts(project),
    status: project.status,
    progress: project.progress,
    deadline: project.deadline
  }))

  // 账期管理筛选逻辑
  const getFilteredPaymentProjects = () => {
    const currentMonth = dayjs().format('YYYY-MM')
    const nextMonth = dayjs().add(1, 'month').format('YYYY-MM')
    
    switch (paymentFilter) {
      case 'currentMonth': // 当月回款
        return allProjectsForPayment.filter(p => 
          dayjs(p.expectedPaymentDate).format('YYYY-MM') === currentMonth
        )
      case 'unpaid': // 总未回款
        return allProjectsForPayment.filter(p => 
          p.paymentStatus === 'unpaid' || p.paymentStatus === 'partial'
        )
      case 'nextMonth': // 下月预期回款
        return allProjectsForPayment.filter(p => 
          dayjs(p.expectedPaymentDate).format('YYYY-MM') === nextMonth
        )
      case 'overdue': // 逾期未回款
        return allProjectsForPayment.filter(p => 
          dayjs().isAfter(dayjs(p.expectedPaymentDate)) && p.paymentStatus !== 'completed'
        )
      case 'completed': // 已完成回款
        return allProjectsForPayment.filter(p => p.paymentStatus === 'completed')
      default:
        return allProjectsForPayment
    }
  }

  const filteredPaymentProjects = getFilteredPaymentProjects()

  // 下载Excel模版
  const downloadTemplate = () => {
    const templateData = [
      ['月份', '租金', '水电费', '软件费用', '设备费用', '保险费用', '其他费用'],
      ['2025-01', '50000', '8000', '12000', '15000', '3000', '7000'],
      ['示例说明', '办公室租金', '水电物业费', '软件许可费', '设备折旧费', '各类保险费', '其他杂项费用']
    ]
    
    // 创建CSV内容
    const csvContent = templateData.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', '固定成本导入模版.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('模版下载成功！')
  }

  // Excel上传处理
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv',
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel' ||
                     file.type === 'text/csv'
      if (!isExcel) {
        message.error('只能上传Excel或CSV文件!')
        return false
      }
      
      // 模拟解析Excel文件
      message.success('固定成本数据导入成功!')
      const mockFixedCost: FixedCost = {
        month: selectedPeriod,
        rent: 50000,
        utilities: 8000,
        software: 12000,
        equipment: 15000,
        insurance: 3000,
        other: 7000,
        total: 95000
      }
      setFixedCosts([...fixedCosts, mockFixedCost])
      return false
    }
  }

  // 付款状态配置
  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      unpaid: { color: '#ff4d4f', text: '未付款' },
      partial: { color: '#fa8c16', text: '部分付款' },
      completed: { color: '#52c41a', text: '已完成' },
      overdue: { color: '#a8071a', text: '逾期' },
    }
    return configs[status as keyof typeof configs] || { color: '#d9d9d9', text: '未知' }
  }

  // 项目成本分析表格列定义
  const costAnalysisColumns: ColumnsType<ProjectCost> = [
    {
      title: '项目信息',
      key: 'project',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.projectName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.client} | {record.projectId}
          </div>
        </div>
      ),
    },
    {
      title: '项目预算',
      dataIndex: 'totalBudget',
      render: (amount) => <span style={{ fontWeight: 500 }}>¥{(amount / 10000).toFixed(1)}万</span>,
    },
    {
      title: '成本明细',
      key: 'costDetails',
      width: 250,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>项目经理: ¥{record.projectManagerCost.toLocaleString()}</div>
          <div>模型成本: ¥{record.modelingCost.toLocaleString()}</div>
          <div>渲染成本: ¥{record.renderingCost.toLocaleString()}</div>
          <div>销售成本: ¥{record.salesCost.toLocaleString()}</div>
          <div>固定成本: ¥{record.fixedCost.toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      render: (cost) => <span style={{ color: '#fa8c16', fontWeight: 500 }}>¥{(cost / 10000).toFixed(1)}万</span>,
    },
    {
      title: '毛利润',
      key: 'profit',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: record.grossProfit > 0 ? '#52c41a' : '#ff4d4f' }}>
            ¥{(record.grossProfit / 10000).toFixed(1)}万
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.profitMargin.toFixed(1)}%
          </div>
        </div>
      ),
    }
  ]

  // 账期管理表格列定义
  const paymentColumns: ColumnsType<ProjectCost> = [
    {
      title: '项目信息',
      key: 'project',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.projectName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.client} | {record.projectId}
          </div>
        </div>
      ),
    },
    {
      title: '项目金额',
      dataIndex: 'totalBudget',
      render: (amount) => <span style={{ fontWeight: 500 }}>¥{(amount / 10000).toFixed(1)}万</span>,
    },
    {
      title: '预期回款日期',
      dataIndex: 'expectedPaymentDate',
      render: (date) => (
        <div>
          <div>{dayjs(date).format('YYYY-MM-DD')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(date).diff(dayjs(), 'day')}天后
          </div>
        </div>
      ),
    },
    {
      title: '付款状态',
      dataIndex: 'paymentStatus',
      render: (status, record) => {
        const config = getPaymentStatusConfig(status)
        const isOverdue = dayjs().isAfter(dayjs(record.expectedPaymentDate)) && status !== 'completed'
        return (
          <div>
            <Tag color={isOverdue ? '#a8071a' : config.color}>
              {isOverdue ? '逾期' : config.text}
            </Tag>
            {isOverdue && (
              <div style={{ fontSize: 12, color: '#a8071a', marginTop: 4 }}>
                逾期 {dayjs().diff(dayjs(record.expectedPaymentDate), 'day')} 天
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => {
            setSelectedProject(record)
            setPaymentModalVisible(true)
          }}
        >
          更新状态
        </Button>
      ),
    }
  ]

  // 根据当前月份项目动态计算成本结构数据
  const calculateCostStructure = () => {
    const totalProjectManagerCost = projectCostAnalysis.reduce((sum, p) => sum + p.projectManagerCost, 0)
    const totalModelingCost = projectCostAnalysis.reduce((sum, p) => sum + p.modelingCost, 0)
    const totalRenderingCost = projectCostAnalysis.reduce((sum, p) => sum + p.renderingCost, 0)
    const totalSalesCost = projectCostAnalysis.reduce((sum, p) => sum + p.salesCost, 0)
    const totalFixedCost = projectCostAnalysis.reduce((sum, p) => sum + p.fixedCost, 0)

    return [
      { name: '项目经理成本', value: totalProjectManagerCost || 26400, color: '#1890ff' },
      { name: '模型成本', value: totalModelingCost || 45600, color: '#52c41a' },
      { name: '渲染成本', value: totalRenderingCost || 60800, color: '#fa8c16' },
      { name: '销售成本', value: totalSalesCost || 13200, color: '#722ed1' },
      { name: '固定成本分摊', value: totalFixedCost || 25000, color: '#eb2f96' }
    ]
  }

  const costStructureData = calculateCostStructure()

  return (
    <div>
      <div className="page-header">
        <h1>财务管理</h1>
        <p style={{ color: '#8c8c8c', marginTop: 8 }}>
          项目收入分析、成本控制、利润统计和回款管理
        </p>
        
        {/* 时间维度筛选器 */}
        <div style={{ 
          marginTop: 16,
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <Row gutter={16} align="middle">
            <Col>
              <Space>
                <span style={{ fontWeight: 500, color: '#262626' }}>📊 财务分析维度：</span>
                <Select
                  value={timePeriod}
                  onChange={handleTimePeriodChange}
                  style={{ width: 120 }}
                  size="large"
                >
                  <Option value="month">
                    <Space>
                      <CalendarOutlined />
                      月度
                    </Space>
                  </Option>
                  <Option value="quarter">
                    <Space>
                      <BarChartOutlined />
                      季度
                    </Space>
                  </Option>
                  <Option value="halfYear">
                    <Space>
                      <PieChartOutlined />
                      半年
                    </Space>
                  </Option>
                  <Option value="year">
                    <Space>
                      <RiseOutlined />
                      年度
                    </Space>
                  </Option>
                </Select>
              </Space>
            </Col>
            
            <Col>
              <Space>
                <span style={{ fontWeight: 500, color: '#262626' }}>🗓 时间选择：</span>
                <Select
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  style={{ width: 200 }}
                  size="large"
                  placeholder="选择时间范围"
                >
                  {getTimeOptions().map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            
            <Col flex="auto">
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button type="primary" icon={<FileExcelOutlined />} onClick={() => fileInputRef.current?.click()}>
                    导入固定成本
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
                    下载导入模版
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>

          {/* 时间范围说明 */}
          <div style={{ 
            marginTop: 12, 
            padding: '8px 12px', 
            background: '#e6f7ff', 
            borderRadius: 4,
            fontSize: '12px',
            color: '#1890ff'
          }}>
            <Space>
              <InfoCircleOutlined />
              <span>
                当前分析范围：
                {(() => {
                  switch (timePeriod) {
                    case 'month':
                      return `${dayjs(selectedPeriod).format('YYYY年MM月')} 的财务数据`
                    case 'quarter':
                      const [year, quarter] = selectedPeriod.split('-Q')
                      return `${year}年第${quarter}季度 的财务数据`
                    case 'halfYear':
                      const [halfYear, half] = selectedPeriod.split('-H')
                      return `${halfYear}年${half === '1' ? '上' : '下'}半年 的财务数据`
                    case 'year':
                      return `${selectedPeriod}年 的财务数据`
                    default:
                      return '财务数据'
                  }
                })()}
                | 已完成项目：{completedProjects.length} 个
              </span>
            </Space>
          </div>
        </div>
      </div>

      {/* 财务核心指标 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`${timePeriod === 'month' ? '本月' : timePeriod === 'quarter' ? '本季度' : timePeriod === 'halfYear' ? '本期' : '本年'}出图项目收入`}
              value={monthlyFinance.revenue}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              出图项目: {completedProjects.length} 个
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`${timePeriod === 'month' ? '本月' : timePeriod === 'quarter' ? '本季度' : timePeriod === 'halfYear' ? '本期' : '本年'}出图项目成本`}
              value={monthlyFinance.cost}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              suffix="元"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              成本率: {monthlyFinance.revenue > 0 ? ((monthlyFinance.cost / monthlyFinance.revenue) * 100).toFixed(1) : 0}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`${timePeriod === 'month' ? '本月' : timePeriod === 'quarter' ? '本季度' : timePeriod === 'halfYear' ? '本期' : '本年'}毛利润`}
              value={monthlyFinance.profit}
              prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
              suffix="元"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              利润贡献: ¥{(monthlyFinance.profit / 10000).toFixed(1)}万
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`${timePeriod === 'month' ? '本月' : timePeriod === 'quarter' ? '本季度' : timePeriod === 'halfYear' ? '本期' : '本年'}毛利润率`}
              value={profitMargin}
              prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {profitMargin >= 30 ? '优秀' : profitMargin >= 20 ? '良好' : '需改善'}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 - 使用标签页 */}
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><BarChartOutlined />收入趋势</span>} key="1">
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="每月收入、成本、毛利润趋势" bordered={false}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        `¥${(value as number / 10000).toFixed(1)}万`,
                        name === 'revenue' ? '收入' : name === 'cost' ? '成本' : '毛利润'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#1890ff" name="收入" />
                    <Bar dataKey="cost" fill="#fa8c16" name="成本" />
                    <Bar dataKey="profit" fill="#52c41a" name="毛利润" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="利润率趋势" bordered={false}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyTrends.map(item => ({
                    ...item,
                    profitRate: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, '利润率']} />
                    <Line type="monotone" dataKey="profitRate" stroke="#722ed1" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><PieChartOutlined />成本分析</span>} key="2">
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="成本结构分析" bordered={false}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={costStructureData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {costStructureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`¥${(value as number).toLocaleString()}`, '金额']} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="月固定成本导入" bordered={false}>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button icon={<DownloadOutlined />} onClick={downloadTemplate} style={{ marginBottom: 16 }}>
                      下载导入模版
                    </Button>
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">点击或拖拽Excel/CSV文件到此区域上传</p>
                      <p className="ant-upload-hint">
                        支持单个文件上传，包含租金、水电、软件、设备等固定成本
                      </p>
                    </Dragger>
                  </Space>
                  
                  {fixedCosts.length > 0 && (
                    <div style={{ marginTop: 16, textAlign: 'left' }}>
                      <h4>已导入的固定成本:</h4>
                      {fixedCosts.map((cost, index) => (
                        <div key={index} style={{ marginBottom: 8, padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
                          <div><strong>{cost.month}月固定成本</strong></div>
                          <Row gutter={16} style={{ fontSize: 12, marginTop: 4 }}>
                            <Col span={8}>租金: ¥{cost.rent.toLocaleString()}</Col>
                            <Col span={8}>水电: ¥{cost.utilities.toLocaleString()}</Col>
                            <Col span={8}>软件: ¥{cost.software.toLocaleString()}</Col>
                          </Row>
                          <Row gutter={16} style={{ fontSize: 12, marginTop: 4 }}>
                            <Col span={8}>设备: ¥{cost.equipment.toLocaleString()}</Col>
                            <Col span={8}>保险: ¥{cost.insurance.toLocaleString()}</Col>
                            <Col span={8}>其他: ¥{cost.other.toLocaleString()}</Col>
                          </Row>
                          <div style={{ marginTop: 4, fontWeight: 500 }}>
                            总计: ¥{cost.total.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><TeamOutlined />项目利润分析</span>} key="3">
          <Card title={`${selectedPeriod} 已出图项目利润分析`} bordered={false}>
            {projectCostAnalysis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                <TeamOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>当前月份暂无已出图项目</div>
                <div style={{ marginTop: 8 }}>请选择有完成项目的月份查看利润分析</div>
                <div style={{ marginTop: 16 }}>
                  <Button type="primary" onClick={() => setSelectedPeriod('2025-01')}>
                    查看2025年1月数据
                  </Button>
                </div>
              </div>
            ) : (
              <Table
                columns={costAnalysisColumns}
                dataSource={projectCostAnalysis}
                rowKey="projectId"
                pagination={false}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>合计</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong style={{ color: '#1890ff' }}>
                          ¥{(projectCostAnalysis.reduce((sum, p) => sum + p.totalBudget, 0) / 10000).toFixed(1)}万
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                      <Table.Summary.Cell index={3}>
                        <strong style={{ color: '#fa8c16' }}>
                          ¥{(projectCostAnalysis.reduce((sum, p) => sum + p.totalCost, 0) / 10000).toFixed(1)}万
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong style={{ color: '#52c41a' }}>
                          ¥{(projectCostAnalysis.reduce((sum, p) => sum + p.grossProfit, 0) / 10000).toFixed(1)}万
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            )}
          </Card>
        </TabPane>

        <TabPane tab={<span><CalendarOutlined />账期管理</span>} key="4">
          <Card title="项目预期回款管理" bordered={false}>
            <div style={{ marginBottom: 16 }}>
              <Space style={{ marginBottom: 16 }}>
                <Select
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  style={{ width: 200 }}
                  placeholder="选择筛选条件"
                >
                  <Option value="all">全部项目</Option>
                  <Option value="currentMonth">当月回款</Option>
                  <Option value="nextMonth">下月预期回款</Option>
                  <Option value="unpaid">总未回款</Option>
                  <Option value="overdue">逾期未回款</Option>
                  <Option value="completed">已完成回款</Option>
                </Select>
              </Space>
              
              <Space>
                <Tag color="#ff4d4f" icon={<AlertOutlined />}>
                  {allProjectsForPayment.filter(p => 
                    dayjs().isAfter(dayjs(p.expectedPaymentDate)) && p.paymentStatus !== 'completed'
                  ).length} 个项目逾期未回款
                </Tag>
                <Tag color="#fa8c16">
                  {allProjectsForPayment.filter(p => p.paymentStatus === 'partial').length} 个项目部分回款
                </Tag>
                <Tag color="#52c41a">
                  {allProjectsForPayment.filter(p => p.paymentStatus === 'completed').length} 个项目已完成回款
                </Tag>
                <Tag color="#1890ff">
                  {allProjectsForPayment.filter(p => 
                    dayjs(p.expectedPaymentDate).format('YYYY-MM') === dayjs().format('YYYY-MM')
                  ).length} 个项目当月回款
                </Tag>
              </Space>
            </div>
            
            <Table
              columns={paymentColumns}
              dataSource={filteredPaymentProjects}
              rowKey="projectId"
              pagination={{
                total: filteredPaymentProjects.length,
                pageSize: 10,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 付款状态更新弹窗 */}
      <Modal
        title="更新付款状态"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedProject && (
          <Form layout="vertical">
            <Form.Item label="项目信息">
              <div>
                <div style={{ fontWeight: 500 }}>{selectedProject.projectName}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {selectedProject.client} | ¥{(selectedProject.totalBudget / 10000).toFixed(1)}万
                </div>
              </div>
            </Form.Item>
            
            <Form.Item label="当前付款状态">
              <Tag color={getPaymentStatusConfig(selectedProject.paymentStatus).color}>
                {getPaymentStatusConfig(selectedProject.paymentStatus).text}
              </Tag>
            </Form.Item>

            <Form.Item label="更新付款状态">
              <Select defaultValue={selectedProject.paymentStatus} style={{ width: '100%' }}>
                <Option value="unpaid">未付款</Option>
                <Option value="partial">部分付款</Option>
                <Option value="completed">已完成</Option>
              </Select>
            </Form.Item>

            <Form.Item label="实际回款日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="备注">
              <Input.TextArea rows={3} placeholder="请输入付款相关备注信息..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" onClick={() => {
                  message.success('付款状态更新成功!')
                  setPaymentModalVisible(false)
                }}>
                  更新
                </Button>
                <Button onClick={() => setPaymentModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            message.success('固定成本数据导入成功!')
            const mockFixedCost: FixedCost = {
              month: selectedPeriod,
              rent: 50000,
              utilities: 8000,
              software: 12000,
              equipment: 15000,
              insurance: 3000,
              other: 7000,
              total: 95000
            }
            setFixedCosts([...fixedCosts, mockFixedCost])
          }
        }}
      />
    </div>
  )
}

export default FinanceOverview 