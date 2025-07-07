import React from 'react'
import { Table, Tag, Space, Tooltip, Button, Modal, message, Avatar } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { Client, RegionConfig } from '../../types/client'
import dayjs from 'dayjs'

const { confirm } = Modal

interface ClientTableProps {
  clients: Client[]
  loading?: boolean
  onViewClient: (client: Client) => void
  onEditClient: (client: Client) => void
  onDeleteClient: (client: Client) => void
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  loading = false,
  onViewClient,
  onEditClient,
  onDeleteClient
}) => {
  const regionConfig: RegionConfig = {
    'Asia-Pacific': { text: 'Asia-Pacific 亚太地区', color: 'blue' },
    'North-America': { text: 'North-America 北美', color: 'green' },
    'Europe': { text: 'Europe 欧洲', color: 'purple' },
    'Middle-East': { text: 'Middle-East 中东', color: 'orange' },
    'Other': { text: 'Other 其他', color: 'default' }
  }

  const statusConfig = {
    active: { text: 'Active 活跃', color: 'success' },
    inactive: { text: 'Inactive 非活跃', color: 'default' },
    potential: { text: 'Potential 潜在', color: 'processing' },
    blacklist: { text: 'Blacklist 黑名单', color: 'error' }
  }

  const handleDelete = (client: Client) => {
    confirm({
      title: '确认删除客户',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除客户 "${client.companyName}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onDeleteClient(client)
        message.success('客户删除成功')
      }
    })
  }

  const columns: ColumnsType<Client> = [
    {
      title: '客户信息 / Client Info',
      key: 'clientInfo',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: record.status === 'active' ? '#52c41a' : 
                               record.status === 'potential' ? '#1890ff' : 
                               record.status === 'blacklist' ? '#ff4d4f' : '#d9d9d9',
              marginRight: 12 
            }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {record.companyName}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              {record.companyNameCN}
            </div>
            <div style={{ color: '#999', fontSize: 12 }}>
              {record.contactPerson} ({record.contactPersonCN})
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '联系方式 / Contact',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            <a href={`mailto:${record.email}`} style={{ color: '#1890ff' }}>
              {record.email}
            </a>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <a href={`tel:${record.phone}`} style={{ color: '#666' }}>
              {record.phone}
            </a>
          </div>
        </div>
      ),
    },
    {
      title: '地区 / Region',
      dataIndex: 'region',
      key: 'region',
      width: 150,
      render: (region: Client['region']) => (
        <Tag color={regionConfig[region].color}>
          {regionConfig[region].text}
        </Tag>
      ),
    },
    {
      title: '项目统计 / Projects',
      key: 'projectStats',
      width: 120,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
            {record.projectHistory.total}
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>
            完成 {record.projectHistory.completed} | 进行中 {record.projectHistory.ongoing}
          </div>
          <div style={{ fontSize: 11, color: '#52c41a', fontWeight: 500 }}>
            ${record.projectHistory.value.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '状态 / Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: Client['status']) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].text}
        </Tag>
      ),
    },
    {
      title: '最后联系 / Last Contact',
      dataIndex: 'lastContact',
      key: 'lastContact',
      width: 120,
      render: (date: string) => (
        <div style={{ fontSize: 12 }}>
          {dayjs(date).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      title: '操作 / Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => onViewClient(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEditClient(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={clients}
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

export default ClientTable 