import React from 'react'
import { Table, Tag, Progress, Space, Tooltip, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Project } from '../../types/project'

interface ProjectTableProps {
  projects: Project[]
  loading?: boolean
  onEditProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  onGenerateContract: (project: Project) => void
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading = false,
  onEditProject,
  onDeleteProject,
  onGenerateContract
}) => {
  // 状态配置
  const getStatusConfig = (status: string) => {
    const configs = {
      reporting: { color: '#d9d9d9', text: '报备中' },
      modeling: { color: '#fa8c16', text: '建模' },
      rendering: { color: '#52c41a', text: '渲染' },
      delivering: { color: '#ff4d4f', text: '出图' },
    }
    return configs[status as keyof typeof configs] || { color: '#d9d9d9', text: '未知' }
  }

  // 付款状态配置
  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      unpaid: { color: '#ff4d4f', text: '未付款' },
      partial: { color: '#fa8c16', text: '部分付款' },
      completed: { color: '#52c41a', text: '已付款' },
      overdue: { color: '#a8071a', text: '逾期' },
    }
    return configs[status as keyof typeof configs] || { color: '#d9d9d9', text: '未知' }
  }

  // 获取进度条颜色
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#52c41a'
    if (progress >= 50) return '#1890ff'
    if (progress >= 20) return '#fa8c16'
    return '#ff4d4f'
  }

  // 获取币种符号
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'AUD': 'A$',
      'EUR': '€',
      'CNY': '¥',
      'GBP': '£',
      'CAD': 'C$'
    }
    return symbols[currency] || currency
  }

  const columns: ColumnsType<Project> = [
    {
      title: '项目信息',
      key: 'projectInfo',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.protocolNumber} | {record.client}
          </div>
          <div style={{ fontSize: '12px', color: '#1890ff', marginTop: 2 }}>
            {record.type}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      filters: [
        { text: '报备中', value: 'reporting' },
        { text: '建模', value: 'modeling' },
        { text: '渲染', value: 'rendering' },
        { text: '出图', value: 'delivering' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const config = getStatusConfig(status)
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      width: 120,
      sorter: (a, b) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix(),
      render: (deadline) => {
        const isOverdue = dayjs().isAfter(dayjs(deadline))
        const daysLeft = dayjs(deadline).diff(dayjs(), 'day')
        
        return (
          <div>
            <div style={{ 
              color: isOverdue ? '#ff4d4f' : daysLeft <= 3 ? '#fa8c16' : '#000',
              fontWeight: isOverdue || daysLeft <= 3 ? 500 : 'normal'
            }}>
              {dayjs(deadline).format('MM-DD')}
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              {isOverdue ? '已逾期' : daysLeft === 0 ? '今天' : `${daysLeft}天`}
            </div>
          </div>
        )
      },
    },
    {
      title: '预算',
      key: 'budget',
      width: 200,
      sorter: (a, b) => a.budgetCNY - b.budgetCNY,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff', fontSize: '14px' }}>
            ¥{record.budgetCNY.toLocaleString()}
          </div>
          {record.currency !== 'CNY' && (
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 2 }}>
              {getCurrencySymbol(record.currency)}{record.budget.toLocaleString()} 
              <span style={{ marginLeft: 4 }}>({record.currency})</span>
            </div>
          )}
          {record.currency !== 'CNY' && (
            <div style={{ fontSize: '11px', color: '#bfbfbf', marginTop: 1 }}>
              汇率: {record.exchangeRate}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '付款状态',
      dataIndex: 'paymentStatus',
      width: 110,
      filters: [
        { text: '未付款', value: 'unpaid' },
        { text: '部分付款', value: 'partial' },
        { text: '已付款', value: 'completed' },
        { text: '逾期', value: 'overdue' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
      render: (paymentStatus) => {
        const config = getPaymentStatusConfig(paymentStatus)
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={getProgressColor(progress)}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="生成合同">
            <Button 
              type="text" 
              size="small" 
              icon={<FileTextOutlined style={{ color: '#52c41a' }} />}
              onClick={() => onGenerateContract(record)}
            />
          </Tooltip>
          <Tooltip title="编辑项目">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />}
              onClick={() => onEditProject(record)}
            />
          </Tooltip>
          <Tooltip title="删除项目">
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => onDeleteProject(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={projects}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
      }}
      scroll={{ x: 1200 }}
      size="middle"
    />
  )
}

export default ProjectTable 