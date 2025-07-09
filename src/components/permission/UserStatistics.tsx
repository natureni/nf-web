import React from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  CrownOutlined, 
  SafetyOutlined 
} from '@ant-design/icons'
import { User } from '../../types/auth'

interface UserStatisticsProps {
  users: User[]
}

const UserStatistics: React.FC<UserStatisticsProps> = ({ users }) => {
  const statistics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    roleDistribution: users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as { [key: string]: number })
  }

  return (
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
  )
}

export default UserStatistics 