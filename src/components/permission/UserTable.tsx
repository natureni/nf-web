import React from 'react'
import { Table, Tag, Space, Button, Modal, message } from 'antd'
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CrownOutlined 
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { User, UserRole } from '../../types/auth'
import { ROLE_NAMES, getRolePermissions } from '../../config/permissions'

interface UserTableProps {
  users: User[]
  currentUser?: User | null
  onEditUser: (user: User) => void
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUser,
  onEditUser
}) => {
  const handleDeleteUser = (user: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户"${user.name}"吗？`,
      onOk: () => {
        // 这里应该调用删除API
        message.success('用户删除成功')
      },
    })
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'user',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ 
            fontSize: '24px',
            color: record.role === 'admin' ? '#f56a00' : '#1890ff'
          }} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.name}
              {record.role === 'admin' && (
                <CrownOutlined style={{ marginLeft: 8, color: '#f56a00' }} />
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.username} | {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (role: UserRole) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>
          {ROLE_NAMES[role]}
        </Tag>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '权限数量',
      key: 'permissions',
      render: (_, record) => {
        const permissions = getRolePermissions(record.role)
        return (
          <Space>
            <Tag color="cyan">{permissions.length} 个模块</Tag>
            <Tag color="purple">
              {permissions.reduce((sum, p) => sum + p.actions.length, 0)} 项操作
            </Tag>
          </Space>
        )
      },
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      render: (date: string) => (
        <div style={{ fontSize: '12px' }}>
          {date || '从未登录'}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditUser(record)}
            disabled={record.id === currentUser?.id}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            danger
            disabled={record.role === 'admin' || record.id === currentUser?.id}
            onClick={() => handleDeleteUser(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      pagination={{
        total: users.length,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `显示 ${range[0]}-${range[1]} 条记录，共 ${total} 条记录`,
      }}
    />
  )
}

export default UserTable 