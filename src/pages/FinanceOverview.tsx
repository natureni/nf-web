import React, { useState, useRef } from 'react'
import { 
  Row, 
  Col, 
  Select, 
  Button, 
  Space, 
  message,
  Tabs,
  Upload
} from 'antd'
import {
  FileExcelOutlined,
  CalendarOutlined,
  BarChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  RiseOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import dayjs from 'dayjs'

// 导入类型定义
import { 
  Project, 
  ProjectCost, 
  FixedCost, 
  MonthlyFinance, 
  MonthlyTrend, 
  CostStructureData,
  TimePeriod 
} from '../types/finance'

// 导入拆分后的组件
import FinanceStatistics from '../components/finance/FinanceStatistics'
import FinanceCharts from '../components/finance/FinanceCharts'
import ProjectProfitTable from '../components/finance/ProjectProfitTable'
import PaymentManagement from '../components/finance/PaymentManagement'

const { TabPane } = Tabs
const { Option } = Select

const FinanceOverview: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-01')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectCost | null>(null)
  const fileInputRef = useRef<any>(null)

  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
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

  // 项目数据 (简化版，实际应从API获取)
  const projects: Project[] = [
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
    // 添加更多项目数据...
  ]

  // 业务逻辑函数
  const getProjectsInPeriod = () => {
    return projects.filter(project => {
      if (!project.completedDate) return false
      
      const completedDate = dayjs(project.completedDate)
      
      switch (timePeriod) {
        case 'month':
          return completedDate.format('YYYY-MM') === selectedPeriod
        case 'quarter':
          const [year, quarter] = selectedPeriod.split('-Q')
          const quarterStart = dayjs(`${year}-${(parseInt(quarter) - 1) * 3 + 1}-01`)
          const quarterEnd = quarterStart.add(3, 'month').subtract(1, 'day')
          return completedDate.isBetween(quarterStart, quarterEnd, null, '[]')
        case 'halfYear':
          const [halfYear, half] = selectedPeriod.split('-H')
          const halfStart = dayjs(`${halfYear}-${half === '1' ? '01' : '07'}-01`)
          const halfEnd = halfStart.add(6, 'month').subtract(1, 'day')
          return completedDate.isBetween(halfStart, halfEnd, null, '[]')
        case 'year':
          return completedDate.format('YYYY') === selectedPeriod
        default:
          return false
      }
    })
  }

  const calculateProjectCosts = (project: Project): ProjectCost => {
    const totalBudget = project.budget
    const actualRevenue = totalBudget
    
    // 成本计算逻辑
    const projectManagerCost = totalBudget * 0.02
    const modelingCost = totalBudget * 0.15
    const renderingCost = totalBudget * 0.20
    const salesCost = totalBudget * 0.01
    const fixedCost = 8000 // 固定成本分摊
    
    const totalCost = projectManagerCost + modelingCost + renderingCost + salesCost + fixedCost
    const grossProfit = actualRevenue - totalCost
    const profitMargin = (grossProfit / actualRevenue) * 100
    
    return {
      projectId: project.id,
      projectName: project.name,
      client: project.client,
      totalBudget,
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

  const getTimeOptions = () => {
    const options: Array<{ value: string; label: string }> = []
    
    switch (timePeriod) {
      case 'month':
        for (let i = 0; i < 12; i++) {
          const month = dayjs().subtract(i, 'month')
          options.push({
            value: month.format('YYYY-MM'),
            label: month.format('YYYY年MM月')
          })
        }
        break
      case 'quarter':
        for (let i = 0; i < 8; i++) {
          const quarter = dayjs().subtract(i * 3, 'month')
          const quarterNum = Math.floor(quarter.month() / 3) + 1
          options.push({
            value: `${quarter.year()}-Q${quarterNum}`,
            label: `${quarter.year()}年第${quarterNum}季度`
          })
        }
        break
      case 'halfYear':
        for (let i = 0; i < 4; i++) {
          const half = dayjs().subtract(i * 6, 'month')
          const halfNum = half.month() < 6 ? 1 : 2
          options.push({
            value: `${half.year()}-H${halfNum}`,
            label: `${half.year()}年${halfNum === 1 ? '上' : '下'}半年`
          })
        }
        break
      case 'year':
        for (let i = 0; i < 5; i++) {
          const year = dayjs().subtract(i, 'year')
          options.push({
            value: year.format('YYYY'),
            label: `${year.format('YYYY')}年`
          })
        }
        break
    }
    
    return options
  }

  // 计算数据
  const completedProjects = getProjectsInPeriod()
  const projectCostAnalysis = completedProjects.map(calculateProjectCosts)
  
  const monthlyFinance: MonthlyFinance = {
    revenue: projectCostAnalysis.reduce((sum, p) => sum + p.actualRevenue, 0),
    cost: projectCostAnalysis.reduce((sum, p) => sum + p.totalCost, 0),
    profit: projectCostAnalysis.reduce((sum, p) => sum + p.grossProfit, 0),
    profitMargin: 0
  }
  
  const profitMargin = monthlyFinance.revenue > 0 ? (monthlyFinance.profit / monthlyFinance.revenue) * 100 : 0

  // 月度趋势数据
  const monthlyTrends: MonthlyTrend[] = [
    { month: '2024-10', revenue: 850000, cost: 520000, profit: 330000, profitRate: 38.8 },
    { month: '2024-11', revenue: 920000, cost: 580000, profit: 340000, profitRate: 37.0 },
    { month: '2024-12', revenue: 1050000, cost: 650000, profit: 400000, profitRate: 38.1 },
    { month: '2025-01', revenue: monthlyFinance.revenue, cost: monthlyFinance.cost, profit: monthlyFinance.profit, profitRate: profitMargin }
  ]

  // 成本结构数据
  const costStructureData: CostStructureData[] = [
    { name: '项目经理成本', value: 26400, color: '#1890ff' },
    { name: '模型成本', value: 45600, color: '#52c41a' },
    { name: '渲染成本', value: 60800, color: '#fa8c16' },
    { name: '销售成本', value: 13200, color: '#722ed1' },
    { name: '固定成本分摊', value: 25000, color: '#eb2f96' }
  ]

  // 获取回款项目数据
  const allProjectsForPayment = projects.map(calculateProjectCosts)
  const filteredPaymentProjects = allProjectsForPayment.filter(project => {
    switch (paymentFilter) {
      case 'currentMonth':
        return dayjs(project.expectedPaymentDate).format('YYYY-MM') === dayjs().format('YYYY-MM')
      case 'nextMonth':
        return dayjs(project.expectedPaymentDate).format('YYYY-MM') === dayjs().add(1, 'month').format('YYYY-MM')
      case 'unpaid':
        return project.paymentStatus !== 'completed'
      case 'overdue':
        return dayjs().isAfter(dayjs(project.expectedPaymentDate)) && project.paymentStatus !== 'completed'
      case 'completed':
        return project.paymentStatus === 'completed'
      default:
        return true
    }
  })

  // 事件处理函数
  const handleTimePeriodChange = (newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod)
    setSelectedPeriod(getTimeOptions()[0].value)
  }

  const downloadTemplate = () => {
    const csvContent = "月份,租金,水电,软件,设备,保险,其他\n2025-01,50000,8000,12000,15000,3000,7000"
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '固定成本导入模板.csv'
    link.click()
    message.success('模板下载成功')
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv,.xlsx,.xls',
    beforeUpload: (file) => {
      message.success(`${file.name} 文件上传成功`)
      return false
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  const handleViewPaymentDetail = (project: ProjectCost) => {
    setSelectedProject(project)
    setPaymentModalVisible(true)
  }

  const handleClosePaymentModal = () => {
    setPaymentModalVisible(false)
    setSelectedProject(null)
  }

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
      <FinanceStatistics
        monthlyFinance={monthlyFinance}
        timePeriod={timePeriod}
        completedProjectsCount={completedProjects.length}
        profitMargin={profitMargin}
      />

      {/* 主要内容区域 - 使用标签页 */}
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><BarChartOutlined />收入趋势</span>} key="1">
          <FinanceCharts
            monthlyTrends={monthlyTrends}
            costStructureData={costStructureData}
            fixedCosts={fixedCosts}
            uploadProps={uploadProps}
            onDownloadTemplate={downloadTemplate}
          />
        </TabPane>

        <TabPane tab={<span><TeamOutlined />项目利润分析</span>} key="2">
          <ProjectProfitTable
            projectCostAnalysis={projectCostAnalysis}
            selectedPeriod={selectedPeriod}
            onSetSelectedPeriod={setSelectedPeriod}
          />
        </TabPane>

        <TabPane tab={<span><CalendarOutlined />账期管理</span>} key="3">
          <PaymentManagement
            allProjectsForPayment={allProjectsForPayment}
            filteredPaymentProjects={filteredPaymentProjects}
            paymentFilter={paymentFilter}
            paymentModalVisible={paymentModalVisible}
            selectedProject={selectedProject}
            onPaymentFilterChange={setPaymentFilter}
            onViewPaymentDetail={handleViewPaymentDetail}
            onClosePaymentModal={handleClosePaymentModal}
          />
        </TabPane>
      </Tabs>

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,.xlsx,.xls"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            message.success(`${e.target.files[0].name} 文件上传成功`)
          }
        }}
      />
    </div>
  )
}

export default FinanceOverview 