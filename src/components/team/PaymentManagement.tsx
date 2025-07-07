import React from 'react'
import { Card, Row, Col, Select, DatePicker, Table, Tag, Button, Modal, Statistic } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { 
  DollarOutlined, 
  HistoryOutlined, 
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { PaymentHistory, PaymentInfo, PaymentTrendData, DEPARTMENTS } from '../../types/team'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

interface PaymentManagementProps {
  paymentHistory: PaymentHistory[]
  selectedDepartment: string
  selectedMonth: string
  historyDateRange: [dayjs.Dayjs, dayjs.Dayjs]
  onDepartmentChange: (department: string) => void
  onMonthChange: (month: string) => void
  onDateRangeChange: (dates: [dayjs.Dayjs, dayjs.Dayjs]) => void
  onViewPaymentDetail: (payment: PaymentHistory) => void
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({
  paymentHistory,
  selectedDepartment,
  selectedMonth,
  historyDateRange,
  onDepartmentChange,
  onMonthChange,
  onDateRangeChange,
  onViewPaymentDetail
}) => {
  // 获取当月打款数据
  const getCurrentMonthPaymentData = (): PaymentInfo[] => {
    const currentMonth = selectedMonth
    const filteredHistory = paymentHistory.filter(h => h.month === currentMonth)
    
    return filteredHistory.map(h => ({
      memberId: h.memberId,
      memberName: h.memberName,
      department: h.department,
      projects: [
        {
          projectId: 'P001',
          projectName: '示例项目',
          projectCount: h.projectCount,
          amount: h.totalAmount
        }
      ],
      totalAmount: h.totalAmount,
      paymentDate: h.paymentDate
    }))
  }

  // 获取支付趋势数据
  const getPaymentTrendData = (): PaymentTrendData[] => {
    const monthlyData: { [key: string]: number } = {}
    
    paymentHistory.forEach(h => {
      if (!monthlyData[h.month]) {
        monthlyData[h.month] = 0
      }
      monthlyData[h.month] += h.totalAmount
    })
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month,
        amount
      }))
  }

  // 获取过滤后的打款历史
  const getFilteredPaymentHistory = () => {
    return paymentHistory.filter(h => {
      const matchesDepartment = selectedDepartment === 'all' || h.department === selectedDepartment
      const paymentDate = dayjs(h.paymentDate)
      const matchesDateRange = paymentDate.isBetween(historyDateRange[0], historyDateRange[1], null, '[]')
      return matchesDepartment && matchesDateRange
    })
  }

  const currentMonthPaymentData = getCurrentMonthPaymentData()
  const paymentTrendData = getPaymentTrendData()
  const filteredHistory = getFilteredPaymentHistory()

  // 计算统计数据
  const totalPayment = filteredHistory.reduce((sum, h) => sum + h.totalAmount, 0)
  const avgPayment = filteredHistory.length > 0 ? totalPayment / filteredHistory.length : 0
  const pendingPayments = filteredHistory.filter(h => h.status === 'pending').length

  const columns: ColumnsType<PaymentHistory> = [
    {
      title: '成员信息',
      key: 'memberInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.memberName}</div>
          <div style={{ color: '#666', fontSize: 12 }}>
            {DEPARTMENTS.find(d => d.key === record.department)?.name}
          </div>
        </div>
      ),
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      render: (month: string) => (
        <Tag color="blue">{month}</Tag>
      ),
    },
    {
      title: '项目数量',
      dataIndex: 'projectCount',
      key: 'projectCount',
      render: (count: number) => (
        <span style={{ fontWeight: 500 }}>{count}</span>
      ),
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '打款日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => (
        <span>{dayjs(date).format('YYYY-MM-DD')}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          paid: { color: 'success', text: '已打款' },
          pending: { color: 'warning', text: '待打款' },
          processing: { color: 'processing', text: '处理中' }
        }
        return (
          <Tag color={statusConfig[status as keyof typeof statusConfig].color}>
            {statusConfig[status as keyof typeof statusConfig].text}
          </Tag>
        )
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />}
          onClick={() => onViewPaymentDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总打款金额"
              value={totalPayment}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均打款金额"
              value={avgPayment}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待打款数量"
              value={pendingPayments}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月打款"
              value={currentMonthPaymentData.reduce((sum, p) => sum + p.totalAmount, 0)}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* 打款趋势图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="打款趋势分析" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={paymentTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`¥${Number(value).toLocaleString()}`, '打款金额']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 筛选条件 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="选择部门"
            value={selectedDepartment}
            onChange={onDepartmentChange}
          >
            <Option value="all">全部部门</Option>
            {DEPARTMENTS.map(dept => (
              <Option key={dept.key} value={dept.key}>{dept.name}</Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="选择月份"
            value={selectedMonth}
            onChange={onMonthChange}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const month = dayjs().subtract(i, 'month').format('YYYY-MM')
              return (
                <Option key={month} value={month}>
                  {dayjs(month).format('YYYY年MM月')}
                </Option>
              )
            })}
          </Select>
        </Col>
        <Col span={8}>
          <RangePicker
            style={{ width: '100%' }}
            value={historyDateRange}
            onChange={(dates) => dates && onDateRangeChange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>

      {/* 打款历史表格 */}
      <Card title="打款历史记录" size="small">
        <Table
          columns={columns}
          dataSource={filteredHistory}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
          size="middle"
        />
      </Card>
    </div>
  )
}

export default PaymentManagement 