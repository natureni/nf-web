import React from 'react'
import { Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { PermissionModule, PermissionAction } from '../types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  module?: PermissionModule
  action?: PermissionAction
  requireAuth?: boolean
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  module,
  action,
  requireAuth = true,
  fallback
}) => {
  const { isAuthenticated, user, hasPermission, logout } = useAuth()

  // 如果需要认证但用户未登录，重定向到登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 如果指定了模块权限要求
  if (module && user) {
    const hasModulePermission = hasPermission(module, action)
    
    if (!hasModulePermission) {
      // 如果提供了自定义 fallback，使用它
      if (fallback) {
        return <>{fallback}</>
      }

      // 默认权限不足提示页面
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          padding: '20px'
        }}>
          <Result
            status="403"
            title="403"
            subTitle={`抱歉，您没有访问此页面的权限。当前角色：${user.name} (${user.role})`}
            extra={
              <div>
                <Button type="primary" onClick={() => window.history.back()}>
                  返回上一页
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={logout}>
                  切换账户
                </Button>
              </div>
            }
          />
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute 