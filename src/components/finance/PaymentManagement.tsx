import React from 'react'
import { Card, Table, Select, Space, Tag, Button, Modal, Form, DatePicker } from 'antd'
import { CalendarOutlined, AlertOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ProjectCost, PaymentStatusConfig } from '../../types/finance'
import dayjs from 'dayjs'

const { Option } = Select

interface PaymentManagementProps {
  allProjectsForPayment: ProjectCost[]
  filteredPaymentProjects: ProjectCost[]
  paymentFilter: string
  paymentModalVisible: boolean
  selectedProject: ProjectCost | null
  onPaymentFilterChange: (filter: string) => void
  onViewPaymentDetail: (project: ProjectCost) => void
  onClosePaymentModal: () => void
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({
  allProjectsForPayment,
  filteredPaymentProjects,
  paymentFilter,
  paymentModalVisible,
  selectedProject,
  onPaymentFilterChange,
  onViewPaymentDetail,
  onClosePaymentModal
}) => {
  const getPaymentStatusConfig = (status: string): PaymentStatusConfig => {
    const configs = {
      unpaid: { color: 'default', text: '未付款' },
      partial: { color: 'warning', text: '部分付款' },
      completed: { color: 'success', text: '已完成' },
      overdue: { color: 'error', text: '逾期' }
    }
    return configs[status as keyof typeof configs] || configs.unpaid
  }

  const paymentColumns: ColumnsType<ProjectCost> = [
    {
      title: '项目信息',
      key: 'projectInfo',
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
      key: 'totalBudget',
      width: 120,
      render: (amount: number) => (
        <div style={{ color: '#1890ff', fontWeight: 500 }}>
          ¥{(amount / 10000).toFixed(1)}万
        </div>
      ),
    },
    {
      title: '预期回款日期',
      dataIndex: 'expectedPaymentDate',
      key: 'expectedPaymentDate',
      width: 120,
      render: (date: string) => (
        <div style={{ fontSize: 12 }}>
          {dayjs(date).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      title: '回款状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status: string) => {
        const config = getPaymentStatusConfig(status)
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: '逾期天数',
      key: 'overdueDays',
      width: 100,
      render: (_, record) => {
        const today = dayjs()
        const expectedDate = dayjs(record.expectedPaymentDate)
        const overdueDays = today.diff(expectedDate, 'day')
        
        if (record.paymentStatus === 'completed') {
          return <span style={{ color: '#52c41a' }}>已完成</span>
        } else if (overdueDays > 0) {
          return <span style={{ color: '#f5222d' }}>逾期 {overdueDays} 天</span>
        } else if (overdueDays === 0) {
          return <span style={{ color: '#fa8c16' }}>今日到期</span>
        } else {
          return <span style={{ color: '#8c8c8c' }}>还有 {Math.abs(overdueDays)} 天</span>
        }
      },
    },
    {
      title: '毛利润',
      dataIndex: 'grossProfit',
      key: 'grossProfit',
      width: 120,
      render: (profit: number) => (
        <div style={{ color: profit > 0 ? '#52c41a' : '#f5222d', fontWeight: 500 }}>
          ¥{(profit / 10000).toFixed(1)}万
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />}
          onClick={() => onViewPaymentDetail(record)}
          size="small"
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card title="项目预期回款管理" bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <Space style={{ marginBottom: 16 }}>
            <Select
              value={paymentFilter}
              onChange={onPaymentFilterChange}
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

      {/* 付款状态更新弹窗 */}
      <Modal
        title="更新付款状态"
        open={paymentModalVisible}
        onCancel={onClosePaymentModal}
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
              <DatePicker 
                style={{ width: '100%' }}
                defaultValue={selectedProject.actualPaymentDate ? dayjs(selectedProject.actualPaymentDate) : undefined}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary">更新状态</Button>
                <Button onClick={onClosePaymentModal}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default PaymentManagement 