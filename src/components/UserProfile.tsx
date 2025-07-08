import React from 'react'
import { 
  Dropdown, 
  Avatar, 
  Space, 
  Typography, 
  Menu, 
  Divider, 
  Tag,
  Modal,
  Descriptions
} from 'antd'
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  InfoCircleOutlined,
  CrownOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { ROLE_NAMES } from '../config/permissions'
import { useState } from 'react'

const { Text } = Typography

const UserProfile: React.FC = () => {
  const { user, logout, getUserPermissions } = useAuth()
  const [profileModalVisible, setProfileModalVisible] = useState(false)

  if (!user) {
    return null
  }

  const permissions = getUserPermissions()

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        setProfileModalVisible(true)
        break
      case 'settings':
        window.location.href = '/settings'
        break
      case 'logout':
        Modal.confirm({
          title: '确认退出',
          content: '您确定要退出登录吗？',
          onOk: logout,
          okText: '确认',
          cancelText: '取消'
        })
        break
    }
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<InfoCircleOutlined />}>
        个人信息
      </Menu.Item>
      {user.role === 'admin' && (
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          系统设置
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
        <div style={{ 
          cursor: 'pointer', 
          padding: '4px 8px',
          borderRadius: '6px',
          transition: 'background-color 0.3s'
        }}>
          <Space>
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: user.role === 'admin' ? '#f56a00' : '#1890ff' 
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.2 }}>
                {user.name}
              </Text>
              <Text style={{ fontSize: '12px', color: '#8c8c8c', lineHeight: 1.2 }}>
                {ROLE_NAMES[user.role]}
              </Text>
            </div>
            {user.role === 'admin' && (
              <CrownOutlined style={{ color: '#f56a00', fontSize: '16px' }} />
            )}
          </Space>
        </div>
      </Dropdown>

      {/* 个人信息模态框 */}
      <Modal
        title="个人信息"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={600}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="用户名" span={1}>
            {user.username}
          </Descriptions.Item>
          <Descriptions.Item label="姓名" span={1}>
            {user.name}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱" span={2}>
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label="角色" span={1}>
            <Tag color={user.role === 'admin' ? 'gold' : 'blue'}>
              {ROLE_NAMES[user.role]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="部门" span={1}>
            {user.department}
          </Descriptions.Item>
          <Descriptions.Item label="账户状态" span={1}>
            <Tag color={user.status === 'active' ? 'green' : 'red'}>
              {user.status === 'active' ? '正常' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={1}>
            {user.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label="最后登录" span={2}>
            {user.lastLoginAt || '从未登录'}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">权限列表</Divider>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {permissions.map((permission, index) => (
            <div key={index} style={{ marginBottom: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                {getModuleName(permission.module)}
              </div>
              <div>
                {permission.actions.map(action => (
                  <Tag key={action} color="blue" style={{ marginBottom: '4px' }}>
                    {getActionName(action)}
                  </Tag>
                ))}
              </div>
              {permission.conditions && (
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                  条件：{JSON.stringify(permission.conditions)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

// 模块名称映射
const getModuleName = (module: string) => {
  const moduleNames: { [key: string]: string } = {
    dashboard: '工作台',
    projects: '项目管理',
    clients: '客户管理',
    finance: '财务管理',
    team: '团队管理',
    gantt: '甘特图'
  }
  return moduleNames[module] || module
}

// 操作名称映射
const getActionName = (action: string) => {
  const actionNames: { [key: string]: string } = {
    view: '查看',
    create: '创建',
    edit: '编辑',
    delete: '删除',
    export: '导出'
  }
  return actionNames[action] || action
}

export default UserProfile