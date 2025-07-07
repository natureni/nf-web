import React, { useState } from 'react'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Checkbox, 
  Divider,
  Alert,
  Row,
  Col,
  Tag
} from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { LoginForm } from '../types/auth'
import { DEFAULT_USERS, ROLE_NAMES } from '../config/permissions'
import { Navigate } from 'react-router-dom'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { login, isAuthenticated, user } = useAuth()

  // 如果已经登录，重定向到主页
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (values: LoginForm) => {
    setLoading(true)
    try {
      const success = await login(values)
      if (success) {
        // 登录成功会由 AuthContext 处理页面跳转
      }
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (username: string) => {
    const password = username === 'admin' ? 'admin123' : '123456'
    form.setFieldsValue({ username, password, remember: true })
    handleLogin({ username, password, remember: true })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '1000px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row>
          {/* 左侧 - 登录表单 */}
          <Col xs={24} lg={12} style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                NFLAB 项目管理系统
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                效果图公司专业项目管理平台
              </Text>
            </div>

            <Form
              form={form}
              name="login"
              size="large"
              onFinish={handleLogin}
              autoComplete="off"
              initialValues={{ remember: false }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>记住登录状态</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<LoginOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">演示账户</Text>
            </Divider>

            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {DEFAULT_USERS.map(user => (
                <Button
                  key={user.id}
                  type="text"
                  size="small"
                  onClick={() => handleQuickLogin(user.username)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    height: 'auto',
                    padding: '8px 12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {user.username} / {user.username === 'admin' ? 'admin123' : '123456'}
                      </div>
                    </div>
                    <Tag color="blue" style={{ margin: 0 }}>
                      {ROLE_NAMES[user.role]}
                    </Tag>
                  </div>
                </Button>
              ))}
            </Space>
          </Col>

          {/* 右侧 - 系统介绍 */}
          <Col xs={24} lg={12} style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
                🚀 权限管理系统
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                全新的分权限角色管理，精确控制每个用户的操作权限
              </Text>
            </div>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="权限角色说明"
                description={
                  <div style={{ marginTop: '12px' }}>
                    <div><strong>管理员</strong>：拥有所有模块的完整权限</div>
                    <div><strong>项目经理</strong>：项目管理 + 客户管理 + 团队管理</div>
                    <div><strong>模型师</strong>：项目管理 + 模型团队管理</div>
                    <div><strong>渲染师</strong>：项目管理 + 渲染团队管理</div>
                    <div><strong>销售人员</strong>：项目管理 + 财务管理 + 客户管理</div>
                  </div>
                }
                type="info"
                icon={<InfoCircleOutlined />}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              />

              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Title level={4} style={{ color: 'white', marginBottom: '12px' }}>
                  ⭐ 系统特色
                </Title>
                <ul style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0 }}>
                  <li>🔐 细粒度权限控制</li>
                  <li>🎯 角色定制化管理</li>
                  <li>📊 实时权限验证</li>
                  <li>🔄 动态权限更新</li>
                  <li>🛡️ 安全性保障</li>
                </ul>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  Version 4.0 | Production Ready
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Login 