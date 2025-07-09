import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Form,
  message,
  Tabs,
  Alert,
  Row,
  Col,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SafetyOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { User, Permission, UserRole } from '../types/auth'
import { DEFAULT_USERS, ROLE_PERMISSIONS, ROLE_NAMES } from '../config/permissions'
import { useAuth } from '../contexts/AuthContext'

// 导入组件
import UserStatistics from '../components/permission/UserStatistics'
import UserTable from '../components/permission/UserTable'
import UserEditModal from '../components/permission/UserEditModal'

const { TabPane } = Tabs
const { Title, Text } = Typography

const PermissionManagement: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [users] = useState<User[]>(DEFAULT_USERS)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 权限详情表格列定义
  const permissionColumns: ColumnsType<Permission> = [
    {
      title: '模块',
      dataIndex: 'module',
      render: (module: string) => {
        const moduleNames: { [key: string]: string } = {
          dashboard: '工作台',
          projects: '项目管理',
          clients: '客户管理',
          finance: '财务管理',
          team: '团队管理',
          gantt: '甘特图'
        }
        return (
          <Space>
            <SafetyOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 500 }}>{moduleNames[module] || module}</span>
          </Space>
        )
      },
    },
    {
      title: '操作权限',
      dataIndex: 'actions',
      render: (actions: string[]) => (
        <Space wrap>
          {actions.map(action => {
            const actionNames: { [key: string]: string } = {
              view: '查看',
              create: '创建',
              edit: '编辑',
              delete: '删除',
              export: '导出'
            }
            const colors: { [key: string]: string } = {
              view: 'blue',
              create: 'green',
              edit: 'orange',
              delete: 'red',
              export: 'purple'
            }
            return (
              <Tag key={action} color={colors[action] || 'default'}>
                {actionNames[action] || action}
              </Tag>
            )
          })}
        </Space>
      ),
    },
    {
      title: '特殊条件',
      dataIndex: 'conditions',
      render: (conditions: any) => (
        <div>
          {conditions ? (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {JSON.stringify(conditions)}
            </Text>
          ) : (
            <Text type="secondary">无限制</Text>
          )}
        </div>
      ),
    },
  ]

  // 处理编辑用户
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    form.setFieldsValue(user)
    setEditModalVisible(true)
  }

  // 处理保存用户
  const handleSaveUser = (values: any) => {
    console.log('更新用户数据:', values)
    setEditModalVisible(false)
  }

  // 处理创建用户
  const handleCreateUser = () => {
    form.resetFields()
    setCreateModalVisible(true)
  }

  // 处理新增用户保存
  const handleCreateSave = () => {
    form.validateFields().then(values => {
      console.log('新增用户数据:', values)
      message.success('用户创建成功！登录密码已发送至用户邮箱')
      setCreateModalVisible(false)
      form.resetFields()
    }).catch(error => {
      console.error('表单验证失败:', error)
    })
  }

  // 获取统计数据
  const getStatistics = () => {
    const totalUsers = users.length
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    return { totalUsers, roleDistribution }
  }

  const statistics = getStatistics()

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              权限管理
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              管理用户角色和权限分配
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateUser}
          >
            新增用户
          </Button>
        </div>
      </div>

      <div className="content-wrapper">
        {/* 权限说明警告 */}
        <Alert
          message="权限管理说明"
          description="只有管理员可以访问此页面。修改用户权限需要谨慎操作，避免影响系统正常运行。"
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* 统计数据 */}
        <UserStatistics users={users} />

        <Tabs defaultActiveKey="1">
          <TabPane tab="用户管理" key="1">
            <Card>
              <UserTable
                users={users}
                currentUser={currentUser}
                onEditUser={handleEditUser}
              />
            </Card>
          </TabPane>

          <TabPane tab="角色权限" key="2">
            <Row gutter={[16, 16]}>
              {ROLE_PERMISSIONS.map(rolePermission => (
                <Col key={rolePermission.role} span={24}>
                  <Card
                    title={
                      <Space>
                        <Tag color={rolePermission.role === 'admin' ? 'gold' : 'blue'}>
                          {ROLE_NAMES[rolePermission.role]}
                        </Tag>
                        <span>{rolePermission.description}</span>
                      </Space>
                    }
                    size="small"
                  >
                    <Table
                      columns={permissionColumns}
                      dataSource={rolePermission.permissions}
                      rowKey={(record) => `${rolePermission.role}-${record.module}`}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="权限统计" key="3">
            <Card title="权限分布统计">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="角色分布">
                    {Object.entries(statistics.roleDistribution).map(([role, count]) => (
                      <div key={role} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{ROLE_NAMES[role as UserRole] || role}</span>
                          <Space>
                            <span>{count} 人</span>
                            <Tag color="blue">
                              {((count / statistics.totalUsers) * 100).toFixed(1)}%
                            </Tag>
                          </Space>
                        </div>
                      </div>
                    ))}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="权限覆盖率">
                    {ROLE_PERMISSIONS.map(rolePermission => (
                      <div key={rolePermission.role} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{ROLE_NAMES[rolePermission.role]}</span>
                          <Space>
                            <span>{rolePermission.permissions.length} 模块</span>
                            <Tag color="green">
                              {((rolePermission.permissions.length / 6) * 100).toFixed(1)}% 覆盖
                            </Tag>
                          </Space>
                        </div>
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>

        {/* 编辑用户模态框 */}
        <UserEditModal
          visible={editModalVisible}
          user={selectedUser}
          form={form}
          onCancel={() => setEditModalVisible(false)}
          onSave={handleSaveUser}
        />

        {/* 新增用户模态框 */}
        <UserEditModal
          visible={createModalVisible}
          user={null}
          form={form}
          onCancel={() => setCreateModalVisible(false)}
          onSave={handleCreateSave}
        />
      </div>
    </div>
  )
}

export default PermissionManagement 