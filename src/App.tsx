import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout, Menu, Typography, Space, Breadcrumb, Alert, Spin } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  BarChartOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  WarningOutlined,
  SettingOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import UserProfile from './components/UserProfile'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectList from './pages/ProjectList'
import ProjectGantt from './pages/ProjectGantt'
import FinanceOverview from './pages/FinanceOverview'
import TeamManagement from './pages/TeamManagement'
import ClientManagement from './pages/ClientManagement'
import PermissionManagement from './pages/PermissionManagement'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'
import SystemSettings from './pages/SystemSettings'
import './index.css'

const { Header, Sider, Content } = Layout
const { Title } = Typography

// 主应用内容组件
const AppContent: React.FC = () => {
  const { isAuthenticated, user, hasPermission, initializing } = useAuth()
  const [collapsed, setCollapsed] = React.useState(false)

  // 如果正在初始化，显示加载指示器
  if (initializing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // 如果未登录，显示登录页面
  if (!isAuthenticated || !user) {
    return <Login />
  }

  // 根据权限过滤菜单项
  const getFilteredMenuItems = () => {
    const allMenuItems = [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: '工作台',
        module: 'dashboard' as const
      },
      {
        key: '/projects',
        icon: <ProjectOutlined />,
        label: '项目管理',
        module: 'projects' as const,
        children: [
          {
            key: '/projects/list',
            label: '项目列表',
            module: 'projects' as const
          },
          {
            key: '/gantt',
            label: '甘特图',
            module: 'gantt' as const
          }
        ]
      },
      {
        key: '/clients',
        icon: <UserOutlined />,
        label: '客户管理',
        module: 'clients' as const
      },
      {
        key: '/finance',
        icon: <DollarOutlined />,
        label: '财务管理',
        module: 'finance' as const
      },
      {
        key: '/team',
        icon: <TeamOutlined />,
        label: '团队管理',
        module: 'team' as const
      }
    ]

    // 如果是管理员，添加权限管理菜单
    if (user.role === 'admin') {
      allMenuItems.push(
        {
          key: '/permissions',
          icon: <SettingOutlined />,
          label: '权限管理',
          module: 'dashboard' as const // 管理员都有 dashboard 权限
        },
        {
          key: '/settings',
          icon: <GlobalOutlined />,
          label: '系统设置',
          module: 'dashboard' as const // 管理员都有 dashboard 权限
        }
      )
    }

    return allMenuItems.filter(item => {
      if (item.children) {
        // 如果有子菜单，过滤子菜单
        item.children = item.children.filter(child => hasPermission(child.module))
        return item.children.length > 0
      }
      return hasPermission(item.module)
    })
  }

  const filteredMenuItems = getFilteredMenuItems()

  // 获取面包屑导航项
  const getBreadcrumbItems = () => {
    const items = [
      {
        title: '首页',
        href: '/'
      }
    ]

    const pathTitleMap: { [key: string]: string } = {
      '/': '工作台',
      '/projects': '项目管理',
      '/gantt': '甘特图',
      '/clients': '客户管理',
      '/finance': '财务管理',
      '/team': '团队管理',
      '/permissions': '权限管理',
      '/settings': '系统设置'
    }

    const currentTitle = pathTitleMap[window.location.pathname] || '页面'
    items.push({
      title: currentTitle
    })

    return items
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
          }}
        >
          <div style={{ 
            height: '64px', 
            padding: '16px', 
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            {!collapsed ? (
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                NFLAB
              </Title>
            ) : (
              <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            )}
          </div>
          
          <Menu
            mode="inline"
            defaultSelectedKeys={[window.location.pathname]}
            defaultOpenKeys={['/projects']}
            style={{ border: 'none', marginTop: '8px' }}
            items={filteredMenuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              children: item.children?.map(child => ({
                key: child.key,
                label: child.label
              }))
            }))}
            onClick={({ key }) => {
              // 处理项目列表的特殊路由
              if (key === '/projects/list') {
                window.location.href = '/projects'
              } else {
                window.location.href = key
              }
            }}
          />
        </Sider>

        <Layout>
          <Header style={{ 
            background: '#fff', 
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Space>
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {collapsed ? '▶' : '◀'}
              </button>
              
              <Breadcrumb items={getBreadcrumbItems()} />
            </Space>

            <Space>
              {/* 权限提示 */}
              <Alert
                message={`当前角色：${user.name}`}
                type="info"
                showIcon
                style={{ 
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: 'none',
                  background: '#e6f7ff'
                }}
                icon={<WarningOutlined style={{ fontSize: '12px' }} />}
              />
              <UserProfile />
            </Space>
          </Header>

          <Content style={{ margin: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 112px)' }}>
            <Routes>
              {/* 工作台 */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute module="dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* 项目管理 */}
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute module="projects">
                    <ProjectList />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/gantt" 
                element={
                  <ProtectedRoute module="gantt">
                    <ProjectGantt />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/projects/create" 
                element={
                  <ProtectedRoute module="projects" action="create">
                    <CreateProject />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/projects/create/:id" 
                element={
                  <ProtectedRoute module="projects" action="edit">
                    <CreateProject />
                  </ProtectedRoute>
                } 
              />

              {/* 客户管理 */}
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute module="clients">
                    <ClientManagement />
                  </ProtectedRoute>
                } 
              />

              {/* 财务管理 */}
              <Route 
                path="/finance" 
                element={
                  <ProtectedRoute module="finance">
                    <FinanceOverview />
                  </ProtectedRoute>
                } 
              />

              {/* 团队管理 */}
              <Route 
                path="/team" 
                element={
                  <ProtectedRoute module="team">
                    <TeamManagement />
                  </ProtectedRoute>
                } 
              />

              {/* 权限管理 - 仅管理员可访问 */}
              <Route 
                path="/permissions" 
                element={
                  <ProtectedRoute 
                    requireAuth={true}
                    fallback={
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '60vh',
                        padding: '20px'
                      }}>
                        <Alert
                          message="权限不足"
                          description="只有系统管理员可以访问权限管理页面"
                          type="error"
                          showIcon
                        />
                      </div>
                    }
                  >
                    {user?.role === 'admin' ? <PermissionManagement /> : <Navigate to="/" replace />}
                  </ProtectedRoute>
                } 
              />

              {/* 系统设置 - 仅管理员可访问 */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute 
                    requireAuth={true}
                    fallback={
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '60vh',
                        padding: '20px'
                      }}>
                        <Alert
                          message="权限不足"
                          description="只有系统管理员可以访问系统设置页面"
                          type="error"
                          showIcon
                        />
                      </div>
                    }
                  >
                    {user?.role === 'admin' ? <SystemSettings /> : <Navigate to="/" replace />}
                  </ProtectedRoute>
                } 
              />

              {/* 登录页面 */}
              <Route path="/login" element={<Login />} />

              {/* 404 重定向 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  )
}

// 主应用组件
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟系统初始化
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>系统初始化中...</div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App 