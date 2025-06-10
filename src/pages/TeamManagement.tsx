import React, { useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, InputNumber, Tag, Tabs, Progress, Statistic, Row, Col, List, Avatar, Space, Tooltip, Badge, DatePicker, Radio } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, PhoneOutlined, BankOutlined, CalendarOutlined, AlertOutlined, DollarOutlined, HistoryOutlined, LineChartOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Option } = Select
const { TabPane } = Tabs
const { RangePicker } = DatePicker

// 部门配置 - 包含每日极限项目数
const DEPARTMENTS = [
  { key: 'manager', name: '项目经理', color: '#1890ff', maxDailyProjects: 11 },
  { key: 'modeling', name: '模型', color: '#faad14', maxDailyProjects: 5 },
  { key: 'rendering', name: '渲染', color: '#52c41a', maxDailyProjects: 3 },
  { key: 'sales', name: '销售', color: '#f5222d', maxDailyProjects: 15 }
]

// 制作人信息接口
interface TeamMember {
  id: string
  name: string
  department: string
  phone: string
  idCard: string
  unitPrice: number // 工作量单价（按项目计算）或百分比
  priceType: 'fixed' | 'percentage' // 'fixed'表示固定单价，'percentage'表示百分比
  // 新增4种单价类型
  birdViewPrice?: number // 鸟瞰单价
  humanViewPrice?: number // 人视角单价
  animationPrice?: number // 动画单价（每秒）
  customPrice?: number // 自定义单价
  bankInfo: string // 打款信息
  paymentCycle: number // 出图后的打款周期时间（天）
  skills: string[]
  joinDate: string
  avatar?: string
  currentProjects: Array<{
    projectId: string
    projectName: string
    dailyWorkload: number // 每日处理项目数量
  }>
}

// 历史打款记录接口
interface PaymentHistory {
  id: string
  memberId: string
  memberName: string
  department: string
  month: string
  projectCount: number
  totalAmount: number
  paymentDate: string
  status: 'paid' | 'pending' | 'processing'
}

// 打款信息接口
interface PaymentInfo {
  memberId: string
  memberName: string
  department: string
  projects: Array<{
    projectId: string
    projectName: string
    projectCount: number
    amount: number
  }>
  totalAmount: number
  paymentDate: string
}

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('members')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [memberDepartmentFilter, setMemberDepartmentFilter] = useState<string>('all') // 团队成员部门筛选
  const [selectedMonth, setSelectedMonth] = useState(dayjs().subtract(1, 'month').format('YYYY-MM')) // 默认选择上个月
  const [historyDateRange, setHistoryDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ])
  const [form] = Form.useForm()

  // 模拟团队成员数据
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'TM001',
      name: '张建模',
      department: 'modeling',
      phone: '138****1234',
      idCard: '310***********1234',
      unitPrice: 800, // 每个项目800元
      priceType: 'fixed',
      birdViewPrice: 1000,
      humanViewPrice: 1200,
      animationPrice: 1500,
      customPrice: 1000,
      bankInfo: '工商银行 6222***********1234',
      paymentCycle: 30,
      skills: ['3D Max', 'Maya', 'SketchUp', 'Rhino'],
      joinDate: '2023-01-15',
      currentProjects: [
        { projectId: 'NF0810', projectName: 'Warsan Logistics Park R2', dailyWorkload: 1 },
        { projectId: 'NF0812', projectName: 'PUMPKIN', dailyWorkload: 1 },
        { projectId: 'NF0823', projectName: 'Business Center', dailyWorkload: 1 }
      ]
    },
    {
      id: 'TM002',
      name: '李渲染',
      department: 'rendering',
      phone: '139****5678',
      idCard: '320***********5678',
      unitPrice: 1200, // 每个项目1200元
      priceType: 'fixed',
      birdViewPrice: 1500,
      humanViewPrice: 1800,
      animationPrice: 2000,
      customPrice: 1200,
      bankInfo: '建设银行 6227***********5678',
      paymentCycle: 15,
      skills: ['V-Ray', 'Corona', 'Lumion', 'Enscape'],
      joinDate: '2023-03-20',
      currentProjects: [
        { projectId: 'NF0811', projectName: 'AMSQ', dailyWorkload: 1 },
        { projectId: 'NF0814', projectName: 'Office Complex', dailyWorkload: 1 }
      ]
    },
    {
      id: 'TM003',
      name: '王渲染',
      department: 'rendering',
      phone: '137****9012',
      idCard: '330***********9012',
      unitPrice: 1000,
      priceType: 'fixed',
      birdViewPrice: 1200,
      humanViewPrice: 1500,
      animationPrice: 1800,
      customPrice: 1000,
      bankInfo: '农业银行 6228***********9012',
      paymentCycle: 30,
      skills: ['V-Ray', 'Photoshop', 'After Effects', 'Premiere'],
      joinDate: '2022-11-10',
      currentProjects: [
        { projectId: 'NF0812', projectName: 'PUMPKIN', dailyWorkload: 1 },
        { projectId: 'NF0815', projectName: 'Residential Tower', dailyWorkload: 1 },
        { projectId: 'NF0818', projectName: 'Shopping Mall', dailyWorkload: 1 }
      ]
    },
    {
      id: 'TM004',
      name: '赵经理',
      department: 'manager',
      phone: '135****3456',
      idCard: '110***********3456',
      unitPrice: 2, // 项目金额的2%
      priceType: 'percentage',
      birdViewPrice: 0.02,
      humanViewPrice: 0.03,
      animationPrice: 0.05,
      customPrice: 0.01,
      bankInfo: '招商银行 6225***********3456',
      paymentCycle: 30,
      skills: ['项目管理', '客户沟通', '团队协调', '质量控制'],
      joinDate: '2022-08-05',
      currentProjects: [
        { projectId: 'NF0808', projectName: 'Hotel Project', dailyWorkload: 1 },
        { projectId: 'NF0813', projectName: 'Retail Center', dailyWorkload: 1 },
        { projectId: 'NF0819', projectName: 'Mixed Use Development', dailyWorkload: 1 },
        { projectId: 'NF0821', projectName: 'Corporate Headquarters', dailyWorkload: 1 },
        { projectId: 'NF0824', projectName: 'Cultural Center', dailyWorkload: 1 }
      ]
    },
    {
      id: 'TM005',
      name: '陈销售',
      department: 'sales',
      phone: '136****7890',
      idCard: '440***********7890',
      unitPrice: 1, // 项目金额的1%
      priceType: 'percentage',
      birdViewPrice: 0.01,
      humanViewPrice: 0.02,
      animationPrice: 0.03,
      customPrice: 0.005,
      bankInfo: '中国银行 6216***********7890',
      paymentCycle: 30,
      skills: ['客户开发', '商务谈判', '合同管理', '市场分析'],
      joinDate: '2023-02-01',
      currentProjects: [
        { projectId: 'CLIENT001', projectName: '万科地产', dailyWorkload: 1 },
        { projectId: 'CLIENT002', projectName: '恒大集团', dailyWorkload: 1 },
        { projectId: 'CLIENT003', projectName: '碧桂园', dailyWorkload: 1 },
        { projectId: 'CLIENT004', projectName: '融创中国', dailyWorkload: 1 },
        { projectId: 'CLIENT005', projectName: '保利发展', dailyWorkload: 1 }
      ]
    },
    {
      id: 'TM006',
      name: '刘建模',
      department: 'modeling',
      phone: '158****2468',
      idCard: '350***********2468',
      unitPrice: 750,
      priceType: 'fixed',
      birdViewPrice: 1000,
      humanViewPrice: 1200,
      animationPrice: 1500,
      customPrice: 750,
      bankInfo: '交通银行 6222***********2468',
      paymentCycle: 30,
      skills: ['3D Max', 'V-Ray', 'AutoCAD', 'Revit'],
      joinDate: '2023-05-10',
      currentProjects: [
        { projectId: 'NF0816', projectName: 'Industrial Park', dailyWorkload: 1 },
        { projectId: 'NF0820', projectName: 'Sports Complex', dailyWorkload: 1 },
        { projectId: 'NF0825', projectName: 'Educational Campus', dailyWorkload: 1 },
        { projectId: 'NF0827', projectName: 'Healthcare Facility', dailyWorkload: 1 }
      ]
    }
  ])

  // 模拟历史打款记录
  const [paymentHistory] = useState<PaymentHistory[]>([
    // 2024年12月数据
    { id: 'PH001', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-12', projectCount: 8, totalAmount: 6400, paymentDate: '2024-12-31', status: 'pending' },
    { id: 'PH002', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-12', projectCount: 5, totalAmount: 6000, paymentDate: '2024-12-31', status: 'pending' },
    { id: 'PH003', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-12', projectCount: 6, totalAmount: 6000, paymentDate: '2024-12-31', status: 'pending' },
    { id: 'PH004', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-12', projectCount: 15, totalAmount: 7500, paymentDate: '2024-12-31', status: 'pending' },
    { id: 'PH005', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-12', projectCount: 20, totalAmount: 6000, paymentDate: '2024-12-31', status: 'pending' },
    { id: 'PH006', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-12', projectCount: 10, totalAmount: 7500, paymentDate: '2024-12-31', status: 'pending' },
    
    // 2024年11月数据
    { id: 'PH007', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-11', projectCount: 12, totalAmount: 9600, paymentDate: '2024-11-30', status: 'paid' },
    { id: 'PH008', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-11', projectCount: 7, totalAmount: 8400, paymentDate: '2024-11-30', status: 'paid' },
    { id: 'PH009', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-11', projectCount: 8, totalAmount: 8000, paymentDate: '2024-11-30', status: 'paid' },
    { id: 'PH010', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-11', projectCount: 18, totalAmount: 9000, paymentDate: '2024-11-30', status: 'paid' },
    { id: 'PH011', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-11', projectCount: 25, totalAmount: 7500, paymentDate: '2024-11-30', status: 'paid' },
    { id: 'PH012', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-11', projectCount: 14, totalAmount: 10500, paymentDate: '2024-11-30', status: 'paid' },
    
    // 2024年10月数据
    { id: 'PH013', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-10', projectCount: 10, totalAmount: 8000, paymentDate: '2024-10-31', status: 'paid' },
    { id: 'PH014', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-10', projectCount: 6, totalAmount: 7200, paymentDate: '2024-10-31', status: 'paid' },
    { id: 'PH015', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-10', projectCount: 7, totalAmount: 7000, paymentDate: '2024-10-31', status: 'paid' },
    { id: 'PH016', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-10', projectCount: 16, totalAmount: 8000, paymentDate: '2024-10-31', status: 'paid' },
    { id: 'PH017', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-10', projectCount: 22, totalAmount: 6600, paymentDate: '2024-10-31', status: 'paid' },
    { id: 'PH018', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-10', projectCount: 11, totalAmount: 8250, paymentDate: '2024-10-31', status: 'paid' },
    
    // 2024年9月数据
    { id: 'PH019', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-09', projectCount: 9, totalAmount: 7200, paymentDate: '2024-09-30', status: 'paid' },
    { id: 'PH020', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-09', projectCount: 5, totalAmount: 6000, paymentDate: '2024-09-30', status: 'paid' },
    { id: 'PH021', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-09', projectCount: 6, totalAmount: 6000, paymentDate: '2024-09-30', status: 'paid' },
    { id: 'PH022', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-09', projectCount: 14, totalAmount: 7000, paymentDate: '2024-09-30', status: 'paid' },
    { id: 'PH023', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-09', projectCount: 18, totalAmount: 5400, paymentDate: '2024-09-30', status: 'paid' },
    { id: 'PH024', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-09', projectCount: 8, totalAmount: 6000, paymentDate: '2024-09-30', status: 'paid' },
    
    // 2024年8月数据
    { id: 'PH025', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-08', projectCount: 11, totalAmount: 8800, paymentDate: '2024-08-31', status: 'paid' },
    { id: 'PH026', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-08', projectCount: 8, totalAmount: 9600, paymentDate: '2024-08-31', status: 'paid' },
    { id: 'PH027', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-08', projectCount: 9, totalAmount: 9000, paymentDate: '2024-08-31', status: 'paid' },
    { id: 'PH028', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-08', projectCount: 20, totalAmount: 10000, paymentDate: '2024-08-31', status: 'paid' },
    { id: 'PH029', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-08', projectCount: 28, totalAmount: 8400, paymentDate: '2024-08-31', status: 'paid' },
    { id: 'PH030', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-08', projectCount: 13, totalAmount: 9750, paymentDate: '2024-08-31', status: 'paid' },
    
    // 2024年7月数据
    { id: 'PH031', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-07', projectCount: 7, totalAmount: 5600, paymentDate: '2024-07-31', status: 'paid' },
    { id: 'PH032', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-07', projectCount: 4, totalAmount: 4800, paymentDate: '2024-07-31', status: 'paid' },
    { id: 'PH033', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-07', projectCount: 5, totalAmount: 5000, paymentDate: '2024-07-31', status: 'paid' },
    { id: 'PH034', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-07', projectCount: 12, totalAmount: 6000, paymentDate: '2024-07-31', status: 'paid' },
    { id: 'PH035', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-07', projectCount: 15, totalAmount: 4500, paymentDate: '2024-07-31', status: 'paid' },
    { id: 'PH036', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-07', projectCount: 6, totalAmount: 4500, paymentDate: '2024-07-31', status: 'paid' },
    
    // 2024年6月数据
    { id: 'PH037', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-06', projectCount: 13, totalAmount: 10400, paymentDate: '2024-06-30', status: 'paid' },
    { id: 'PH038', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-06', projectCount: 9, totalAmount: 10800, paymentDate: '2024-06-30', status: 'paid' },
    { id: 'PH039', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-06', projectCount: 10, totalAmount: 10000, paymentDate: '2024-06-30', status: 'paid' },
    { id: 'PH040', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-06', projectCount: 22, totalAmount: 11000, paymentDate: '2024-06-30', status: 'paid' },
    { id: 'PH041', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-06', projectCount: 30, totalAmount: 9000, paymentDate: '2024-06-30', status: 'paid' },
    { id: 'PH042', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-06', projectCount: 15, totalAmount: 11250, paymentDate: '2024-06-30', status: 'paid' },
    
    // 2024年5月数据
    { id: 'PH043', memberId: 'TM001', memberName: '张建模', department: '模型', month: '2024-05', projectCount: 8, totalAmount: 6400, paymentDate: '2024-05-31', status: 'paid' },
    { id: 'PH044', memberId: 'TM002', memberName: '李渲染', department: '渲染', month: '2024-05', projectCount: 6, totalAmount: 7200, paymentDate: '2024-05-31', status: 'paid' },
    { id: 'PH045', memberId: 'TM003', memberName: '王渲染', department: '渲染', month: '2024-05', projectCount: 7, totalAmount: 7000, paymentDate: '2024-05-31', status: 'paid' },
    { id: 'PH046', memberId: 'TM004', memberName: '赵经理', department: '项目经理', month: '2024-05', projectCount: 17, totalAmount: 8500, paymentDate: '2024-05-31', status: 'paid' },
    { id: 'PH047', memberId: 'TM005', memberName: '陈销售', department: '销售', month: '2024-05', projectCount: 24, totalAmount: 7200, paymentDate: '2024-05-31', status: 'paid' },
    { id: 'PH048', memberId: 'TM006', memberName: '刘建模', department: '模型', month: '2024-05', projectCount: 9, totalAmount: 6750, paymentDate: '2024-05-31', status: 'paid' }
  ])

  // 获取部门统计
  const getDepartmentStats = () => {
    const stats = DEPARTMENTS.map(dept => {
      const members = teamMembers.filter(m => m.department === dept.key)
      const totalProjects = members.reduce((sum, m) => sum + m.currentProjects.length, 0)
      const avgProjects = members.length > 0 ? totalProjects / members.length : 0
      const maxCapacity = members.length * dept.maxDailyProjects
      const utilizationRate = maxCapacity > 0 ? Math.round((totalProjects / maxCapacity) * 100) : 0
      
      return {
        department: dept.name,
        memberCount: members.length,
        currentProjects: totalProjects,
        avgProjects: Math.round(avgProjects * 10) / 10,
        utilizationRate,
        color: dept.color
      }
    })
    return stats
  }

  // 获取工作负荷数据
  const getWorkloadData = () => {
    return teamMembers.map(member => {
      const dept = DEPARTMENTS.find(d => d.key === member.department)
      const currentProjects = member.currentProjects.length
      const maxProjects = dept?.maxDailyProjects || 1
      const workloadRate = Math.round((currentProjects / maxProjects) * 100)
      
      return {
        name: member.name,
        department: dept?.name || '',
        currentProjects,
        maxProjects,
        workloadRate,
        color: workloadRate > 90 ? '#ff4d4f' : workloadRate > 70 ? '#faad14' : '#52c41a'
      }
    })
  }

  // 获取当月打款信息
  const getCurrentMonthPaymentData = (): PaymentInfo[] => {
    return teamMembers.map(member => {
      const dept = DEPARTMENTS.find(d => d.key === member.department)
      const projects = member.currentProjects.map(project => ({
        projectId: project.projectId,
        projectName: project.projectName,
        projectCount: 1, // 按项目计费
        amount: member.unitPrice
      }))
      
      return {
        memberId: member.id,
        memberName: member.name,
        department: dept?.name || '',
        projects,
        totalAmount: projects.reduce((sum, p) => sum + p.amount, 0),
        paymentDate: dayjs().endOf('month').format('YYYY-MM-DD')
      }
    })
  }

  // 获取历史打款趋势数据
  const getPaymentTrendData = () => {
    const monthlyData: { [key: string]: { [dept: string]: number } } = {}
    
    paymentHistory.forEach(record => {
      if (!monthlyData[record.month]) {
        monthlyData[record.month] = {}
      }
      if (!monthlyData[record.month][record.department]) {
        monthlyData[record.month][record.department] = 0
      }
      monthlyData[record.month][record.department] += record.totalAmount
    })

    return Object.keys(monthlyData).sort().map(month => ({
      month,
      项目经理: monthlyData[month]['项目经理'] || 0,
      模型: monthlyData[month]['模型'] || 0,
      渲染: monthlyData[month]['渲染'] || 0,
      销售: monthlyData[month]['销售'] || 0,
      总计: Object.values(monthlyData[month]).reduce((sum: number, val: number) => sum + val, 0)
    }))
  }

  // 根据部门筛选历史记录
  const getFilteredPaymentHistory = () => {
    return paymentHistory.filter(record => {
      const matchDept = selectedDepartment === 'all' || 
        DEPARTMENTS.find(d => d.key === selectedDepartment)?.name === record.department
      const matchMonth = record.month === selectedMonth
      return matchDept && matchMonth
    })
  }

  // 添加/编辑成员
  const handleSaveMember = (values: any) => {
    // 根据部门自动设置priceType
    const priceType = (values.department === 'manager' || values.department === 'sales') 
      ? 'percentage' 
      : 'fixed'
    
    if (editingMember) {
      // 编辑
      setTeamMembers(prev => prev.map(m => 
        m.id === editingMember.id 
          ? { ...m, ...values, priceType, skills: values.skills || [] }
          : m
      ))
    } else {
      // 新增
      const newMember: TeamMember = {
        id: `TM${Date.now()}`,
        ...values,
        priceType,
        skills: values.skills || [],
        joinDate: dayjs().format('YYYY-MM-DD'),
        currentProjects: []
      }
      setTeamMembers(prev => [...prev, newMember])
    }
    setModalVisible(false)
    setEditingMember(null)
    form.resetFields()
  }

  // 删除成员
  const handleDeleteMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id))
  }

  // 团队成员表格列配置
  const membersColumns: ColumnsType<TeamMember> = [
    {
      title: '成员信息',
      key: 'member',
      render: (_, record) => {
        const dept = DEPARTMENTS.find(d => d.key === record.department)
        return (
          <Space>
            <Avatar style={{ backgroundColor: dept?.color }} icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 500 }}>{record.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <Tag color={dept?.color} size="small">{dept?.name}</Tag>
                入职：{record.joinDate}
              </div>
            </div>
          </Space>
        )
      }
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      )
    },
    {
      title: '当前项目',
      key: 'currentProjects',
      render: (_, record) => {
        const dept = DEPARTMENTS.find(d => d.key === record.department)
        const currentCount = record.currentProjects.length
        const maxCount = dept?.maxDailyProjects || 1
        const rate = Math.round((currentCount / maxCount) * 100)
        
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 500 }}>{currentCount}/{maxCount}</span>
              <Progress 
                percent={rate} 
                size="small" 
                style={{ flex: 1, minWidth: '60px' }}
                status={rate > 90 ? 'exception' : rate > 70 ? 'active' : 'success'}
                showInfo={false}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              负荷率：{rate}%
            </div>
          </div>
        )
      }
    },
    {
      title: '月预估收入',
      key: 'monthlyIncome',
      render: (_, record) => {
        if (record.priceType === 'percentage') {
          return (
            <div>
              <div style={{ fontWeight: 500, color: '#722ed1' }}>
                按项目金额{record.unitPrice}%计算
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.currentProjects.length}个项目跟进中
              </div>
            </div>
          )
        } else {
          const monthlyIncome = record.currentProjects.length * record.unitPrice * 30 // 按30天算
          return (
            <div>
              <div style={{ fontWeight: 500, color: '#52c41a' }}>
                ¥{monthlyIncome.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.currentProjects.length}项目 × ¥{record.unitPrice}
              </div>
            </div>
          )
        }
      },
      sorter: (a, b) => {
        // 对于百分比类型，按项目数量排序；固定单价按收入排序
        if (a.priceType === 'percentage' && b.priceType === 'percentage') {
          return a.currentProjects.length - b.currentProjects.length
        } else if (a.priceType === 'fixed' && b.priceType === 'fixed') {
          const aIncome = a.currentProjects.length * a.unitPrice * 30
          const bIncome = b.currentProjects.length * b.unitPrice * 30
          return aIncome - bIncome
        } else {
          return 0 // 不同类型不比较
        }
      }
    },
    {
      title: '技能标签',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <div>
          {skills.slice(0, 2).map(skill => (
            <Tag key={skill} size="small">{skill}</Tag>
          ))}
          {skills.length > 2 && (
            <Tooltip title={skills.slice(2).join(', ')}>
              <Tag size="small">+{skills.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => {
              setEditingMember(record)
              form.setFieldsValue(record)
              setModalVisible(true)
            }}
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteMember(record.id)}
          />
        </Space>
      )
    }
  ]

  const departmentStats = getDepartmentStats()
  const workloadData = getWorkloadData()
  const currentMonthPaymentData = getCurrentMonthPaymentData()
  const totalCurrentPayment = currentMonthPaymentData.reduce((sum, p) => sum + p.totalAmount, 0)
  const trendData = getPaymentTrendData()
  const filteredHistory = getFilteredPaymentHistory()

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>团队管理</h1>
            <p style={{ color: '#8c8c8c', margin: 0 }}>
              团队成员管理、工作负荷监控、打款管理和历史分析
            </p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingMember(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            添加成员
          </Button>
        </div>
      </div>

      <div className="content-wrapper">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 团队成员列表 */}
          <TabPane tab="团队成员列表" key="members">
            {/* 部门统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {departmentStats.map((stat, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#666', fontSize: '14px' }}>{stat.department}</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>
                          {stat.memberCount}人
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          进行中项目：{stat.currentProjects}个
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Progress 
                          type="circle" 
                          percent={stat.utilizationRate} 
                          size={50}
                          strokeColor={stat.color}
                          format={() => `${stat.utilizationRate}%`}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          负荷率
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 成员详情表格 */}
            <Card title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>团队成员详情</span>
                <Select
                  value={memberDepartmentFilter}
                  onChange={setMemberDepartmentFilter}
                  style={{ width: 120 }}
                  placeholder="筛选部门"
                >
                  <Option value="all">全部部门</Option>
                  {DEPARTMENTS.map(dept => (
                    <Option key={dept.key} value={dept.key}>{dept.name}</Option>
                  ))}
                </Select>
              </div>
            }>
              <Table 
                columns={membersColumns} 
                dataSource={teamMembers.filter(member => 
                  memberDepartmentFilter === 'all' || member.department === memberDepartmentFilter
                )}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
                scroll={{ x: 1200 }}
              />
            </Card>
          </TabPane>

          {/* 工作负荷分析 */}
          <TabPane tab="工作负荷分析" key="workload">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="部门工作负荷对比">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="currentProjects" fill="#1890ff" name="当前项目数" />
                      <Bar dataKey="utilizationRate" fill="#52c41a" name="负荷率(%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {workloadData.map((member, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card size="small">
                    <div style={{ textAlign: 'center' }}>
                      <Avatar 
                        style={{ backgroundColor: DEPARTMENTS.find(d => d.name === member.department)?.color }} 
                        icon={<UserOutlined />} 
                      />
                      <div style={{ marginTop: 8, fontWeight: 500 }}>{member.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{member.department}</div>
                      <Progress 
                        type="circle" 
                        percent={member.workloadRate} 
                        size={60}
                        status={member.workloadRate > 90 ? 'exception' : member.workloadRate > 70 ? 'active' : 'success'}
                        style={{ marginTop: 8 }}
                      />
                      <div style={{ marginTop: 8, fontSize: '12px' }}>
                        {member.currentProjects}/{member.maxProjects} 项目
                      </div>
                      <div style={{ fontSize: '10px', color: '#999' }}>
                        负荷率: {member.workloadRate}%
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          {/* 本月打款管理 */}
          <TabPane tab="本月打款管理" key="payment">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        {dayjs().format('YYYY年M月')} 打款统计
                      </h3>
                      <p style={{ color: '#666', margin: 0 }}>
                        预计打款日期：{dayjs().endOf('month').format('YYYY年M月D日')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Statistic
                        title="总打款金额"
                        value={totalCurrentPayment}
                        prefix="¥"
                        valueStyle={{ color: '#f5222d', fontSize: '24px' }}
                      />
                    </div>
                  </div>

                  <List
                    dataSource={currentMonthPaymentData}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button type="link" onClick={() => setPaymentModalVisible(true)}>
                            查看明细
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              style={{ backgroundColor: DEPARTMENTS.find(d => d.name === item.department)?.color }}
                              icon={<UserOutlined />} 
                            />
                          }
                          title={
                            <Space>
                              {item.memberName}
                              <Tag color={DEPARTMENTS.find(d => d.name === item.department)?.color}>
                                {item.department}
                              </Tag>
                            </Space>
                          }
                          description={
                            <div>
                              <div>参与项目：{item.projects.map(p => p.projectName).join('、')}</div>
                              <div style={{ marginTop: 4 }}>
                                项目数量：{item.projects.length}个
                              </div>
                            </div>
                          }
                        />
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: 500, color: '#f5222d' }}>
                            ¥{item.totalAmount.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {item.paymentDate}
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 历史打款分析 */}
          <TabPane tab="历史打款分析" key="history">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <LineChartOutlined style={{ marginRight: 8 }} />
                      打款趋势分析
                    </span>
                    <Space>
                      <RangePicker 
                        value={historyDateRange}
                        onChange={(dates) => dates && setHistoryDateRange(dates)}
                        picker="month"
                      />
                    </Space>
                  </div>
                }>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [`¥${value?.toLocaleString()}`, '']} />
                      <Area type="monotone" dataKey="项目经理" stackId="1" stroke="#1890ff" fill="#1890ff" />
                      <Area type="monotone" dataKey="模型" stackId="1" stroke="#faad14" fill="#faad14" />
                      <Area type="monotone" dataKey="渲染" stackId="1" stroke="#52c41a" fill="#52c41a" />
                      <Area type="monotone" dataKey="销售" stackId="1" stroke="#f5222d" fill="#f5222d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <HistoryOutlined style={{ marginRight: 8 }} />
                      历史打款记录
                    </span>
                    <Space>
                      <Select
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                        style={{ width: 120 }}
                      >
                        <Option value="all">全部部门</Option>
                        {DEPARTMENTS.map(dept => (
                          <Option key={dept.key} value={dept.key}>{dept.name}</Option>
                        ))}
                      </Select>
                      <DatePicker
                        value={dayjs(selectedMonth)}
                        onChange={(date) => date && setSelectedMonth(date.format('YYYY-MM'))}
                        picker="month"
                      />
                    </Space>
                  </div>
                }>
                  <Table
                    dataSource={filteredHistory}
                    rowKey="id"
                    columns={[
                      {
                        title: '成员',
                        key: 'member',
                        render: (_, record) => (
                          <Space>
                            <Avatar 
                              style={{ backgroundColor: DEPARTMENTS.find(d => d.name === record.department)?.color }}
                              icon={<UserOutlined />} 
                            />
                            <div>
                              <div>{record.memberName}</div>
                              <Tag color={DEPARTMENTS.find(d => d.name === record.department)?.color} size="small">
                                {record.department}
                              </Tag>
                            </div>
                          </Space>
                        )
                      },
                      {
                        title: '月份',
                        dataIndex: 'month',
                        key: 'month'
                      },
                      {
                        title: '项目数量',
                        dataIndex: 'projectCount',
                        key: 'projectCount',
                        render: (count) => `${count}个`
                      },
                      {
                        title: '打款金额',
                        dataIndex: 'totalAmount',
                        key: 'totalAmount',
                        render: (amount) => `¥${amount.toLocaleString()}`,
                        sorter: (a, b) => a.totalAmount - b.totalAmount
                      },
                      {
                        title: '打款日期',
                        dataIndex: 'paymentDate',
                        key: 'paymentDate'
                      },
                      {
                        title: '状态',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                          const statusConfig = {
                            paid: { text: '已打款', color: 'success' },
                            pending: { text: '待打款', color: 'warning' },
                            processing: { text: '处理中', color: 'processing' }
                          }
                          const config = statusConfig[status as keyof typeof statusConfig]
                          return <Badge status={config.color as any} text={config.text} />
                        }
                      }
                    ]}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        {/* 添加/编辑成员弹窗 */}
        <Modal
          title={editingMember ? "编辑成员" : "添加成员"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false)
            setEditingMember(null)
            form.resetFields()
          }}
          onOk={() => form.submit()}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveMember}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="department" label="部门" rules={[{ required: true }]}>
                  <Select onChange={(value) => {
                    // 根据部门自动设置priceType
                    const dept = DEPARTMENTS.find(d => d.key === value)
                    if (dept && (dept.key === 'manager' || dept.key === 'sales')) {
                      form.setFieldsValue({ priceType: 'percentage' })
                    } else {
                      form.setFieldsValue({ priceType: 'fixed' })
                    }
                  }}>
                    {DEPARTMENTS.map(dept => (
                      <Option key={dept.key} value={dept.key}>{dept.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" label="联系方式" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item dependencies={['department']} noStyle>
                  {({ getFieldValue }) => {
                    const department = getFieldValue('department')
                    const isPercentage = department === 'manager' || department === 'sales'
                    
                    return (
                      <Form.Item 
                        name="unitPrice" 
                        label={
                          isPercentage 
                            ? "项目金额百分比(%)" 
                            : department === 'rendering' || department === 'modeling'
                              ? "工作量单价(元/工作量)"
                              : "项目单价(元/项目)"
                        } 
                        rules={[{ required: true }]}
                      >
                        <InputNumber 
                          min={0} 
                          max={isPercentage ? 100 : undefined}
                          style={{ width: '100%' }} 
                          placeholder={
                            isPercentage 
                              ? "输入百分比，如：2" 
                              : "输入金额"
                          }
                        />
                      </Form.Item>
                    )
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="priceType" style={{ display: 'none' }}>
              <Input />
            </Form.Item>

            <Form.Item name="idCard" label="身份证信息" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="bankInfo" label="打款信息" rules={[{ required: true }]}>
              <Input placeholder="银行名称 + 卡号" />
            </Form.Item>

            {/* 添加4种单价类型 */}
            <Form.Item dependencies={['department']} noStyle>
              {({ getFieldValue }) => {
                const department = getFieldValue('department')
                const isModelingOrRendering = department === 'modeling' || department === 'rendering'
                
                if (isModelingOrRendering) {
                  return (
                    <>
                      <div style={{ margin: '16px 0', fontWeight: 500, color: '#1890ff' }}>详细单价设置</div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="birdViewPrice" label="鸟瞰单价(元/张)">
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1000" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="humanViewPrice" label="人视角单价(元/张)">
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1200" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="animationPrice" label="动画单价(元/秒)">
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1500" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="customPrice" label="自定义单价(元)">
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1000" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )
                } else if (department === 'manager' || department === 'sales') {
                  return (
                    <>
                      <div style={{ margin: '16px 0', fontWeight: 500, color: '#1890ff' }}>提成比例设置</div>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="birdViewPrice" label="鸟瞰提成比例(%)">
                            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 1" step={0.01} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="humanViewPrice" label="人视角提成比例(%)">
                            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 2" step={0.01} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="animationPrice" label="动画提成比例(%)">
                            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 3" step={0.01} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="customPrice" label="自定义提成比例(%)">
                            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 0.5" step={0.01} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )
                }
                return null
              }}
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="paymentCycle" label="出图后打款周期(天)" rules={[{ required: true }]}>
                  <InputNumber min={1} max={365} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="skills" label="技能标签">
                  <Select mode="tags" placeholder="输入技能标签">
                    <Option value="3D Max">3D Max</Option>
                    <Option value="Maya">Maya</Option>
                    <Option value="V-Ray">V-Ray</Option>
                    <Option value="Corona">Corona</Option>
                    <Option value="Photoshop">Photoshop</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* 打款明细弹窗 */}
        <Modal
          title="打款明细"
          open={paymentModalVisible}
          onCancel={() => setPaymentModalVisible(false)}
          footer={null}
          width={800}
        >
          <div>打款明细内容...</div>
        </Modal>
      </div>
    </div>
  )
}

export default TeamManagement 