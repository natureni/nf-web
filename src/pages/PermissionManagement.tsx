import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Tabs,
  Descriptions,
  Alert,
  Row,
  Col,
  Statistic,
  Typography
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CrownOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { User, UserRole, Permission } from '../types/auth'
import { DEFAULT_USERS, ROLE_PERMISSIONS, ROLE_NAMES, getRolePermissions } from '../config/permissions'
import { useAuth } from '../contexts/AuthContext'

const { TabPane } = Tabs
const { Title, Text } = Typography
const { Option } = Select

const PermissionManagement: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [users] = useState<User[]>(DEFAULT_USERS)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 用户表格列定义
  const userColumns: ColumnsType<User> = [
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
            onClick={() => {
              setSelectedUser(record)
              form.setFieldsValue(record)
              setEditModalVisible(true)
            }}
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
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除用户"${record.name}"吗？`,
                onOk: () => message.success('用户删除成功'),
              })
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

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

  // 统计数据
  const getStatistics = () => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.status === 'active').length
    const adminUsers = users.filter(u => u.role === 'admin').length
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      roleDistribution
    }
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
            onClick={() => {
              form.resetFields()
              setCreateModalVisible(true)
            }}
          >
            新增用户
          </Button>
        </div>
      </div>

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
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={statistics.activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="管理员"
              value={statistics.adminUsers}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f56a00' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="角色类型"
              value={Object.keys(statistics.roleDistribution).length}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane tab="用户管理" key="1">
          <Card>
            <Table
              columns={userColumns}
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
                        <span>{ROLE_NAMES[role as UserRole]}</span>
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
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="reset-password" 
            onClick={() => {
              Modal.confirm({
                title: '重置密码',
                content: `确定要重置用户"${selectedUser?.name}"的密码吗？新密码将发送至用户邮箱。`,
                onOk: () => {
                  message.success(`密码重置成功！新密码已发送至 ${selectedUser?.email}`)
                }
              })
            }}
          >
            重置密码
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={() => {
              form.validateFields().then(values => {
                console.log('更新用户数据:', values)
                message.success('用户信息更新成功')
                setEditModalVisible(false)
              }).catch(error => {
                console.error('表单验证失败:', error)
              })
            }}
          >
            保存更改
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="用户名" name="username">
                <Input disabled style={{ color: '#8c8c8c' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="姓名" 
                name="name"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { max: 50, message: '姓名不能超过50个字符' }
                ]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="邮箱" 
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="角色" 
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">系统管理员</Option>
                  <Option value="project_manager">项目经理</Option>
                  <Option value="modeler">模型师</Option>
                  <Option value="renderer">渲染师</Option>
                  <Option value="sales">销售人员</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="部门" 
                name="department"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="管理层">管理层</Option>
                  <Option value="项目管理部">项目管理部</Option>
                  <Option value="建模部">建模部</Option>
                  <Option value="渲染部">渲染部</Option>
                  <Option value="销售部">销售部</Option>
                  <Option value="行政部">行政部</Option>
                  <Option value="财务部">财务部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="状态" 
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <div style={{ 
            background: '#fff7e6', 
            border: '1px solid #ffd591', 
            borderRadius: 6, 
            padding: 12, 
            marginTop: 16 
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#d46b08', marginBottom: 8 }}>
              🔐 密码管理说明
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              • 点击"重置密码"按钮可为用户生成新密码<br/>
              • 新密码将通过邮件发送至用户邮箱<br/>
              • 建议用户收到新密码后立即登录并修改
            </div>
          </div>
        </Form>
      </Modal>

      {/* 新增用户模态框 */}
      <Modal
        title="新增用户"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setCreateModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="create" 
            type="primary" 
            onClick={() => {
              form.validateFields().then(values => {
                console.log('新增用户数据:', values)
                message.success('用户创建成功！登录密码已发送至用户邮箱')
                setCreateModalVisible(false)
                form.resetFields()
              }).catch(error => {
                console.error('表单验证失败:', error)
              })
            }}
          >
            创建用户
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="用户名" 
                name="username" 
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 4, max: 20, message: '用户名长度为4-20位' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="姓名" 
                name="name" 
                rules={[
                  { required: true, message: '请输入姓名' },
                  { max: 50, message: '姓名不能超过50个字符' }
                ]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="邮箱" 
            name="email" 
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱地址（用于密码找回）" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="初始密码" 
                name="password" 
                rules={[
                  { required: true, message: '请输入初始密码' },
                  { min: 6, max: 20, message: '密码长度为6-20位' },
                  { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含字母和数字' }
                ]}
              >
                <Input.Password placeholder="请输入初始密码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="确认密码" 
                name="confirmPassword" 
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入密码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="角色" 
                name="role" 
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="project_manager">项目经理</Option>
                  <Option value="modeler">模型师</Option>
                  <Option value="renderer">渲染师</Option>
                  <Option value="sales">销售人员</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="部门" 
                name="department" 
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="项目管理部">项目管理部</Option>
                  <Option value="建模部">建模部</Option>
                  <Option value="渲染部">渲染部</Option>
                  <Option value="销售部">销售部</Option>
                  <Option value="行政部">行政部</Option>
                  <Option value="财务部">财务部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: 6, 
            padding: 12, 
            marginTop: 16 
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#52c41a', marginBottom: 8 }}>
              📧 密码安全提醒
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              • 用户创建成功后，初始密码将通过邮件发送给用户<br/>
              • 建议用户首次登录后立即修改密码<br/>
              • 邮箱将用于密码找回功能，请确保邮箱有效
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default PermissionManagement 