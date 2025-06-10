import React from 'react'
import { Row, Col, Card, Statistic, Progress, List, Avatar, Tag } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  ProjectOutlined,
  DollarOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const Dashboard: React.FC = () => {
  // 模拟数据
  const projectStatusData = [
    { name: '报备中', value: 8, color: '#d9d9d9' },
    { name: '建模中', value: 15, color: '#fa8c16' },
    { name: '渲染中', value: 12, color: '#52c41a' },
    { name: '交付中', value: 5, color: '#ff4d4f' },
  ]

  const monthlyRevenueData = [
    { month: '1月', revenue: 320000, projects: 15 },
    { month: '2月', revenue: 280000, projects: 12 },
    { month: '3月', revenue: 450000, projects: 18 },
    { month: '4月', revenue: 380000, projects: 16 },
    { month: '5月', revenue: 520000, projects: 22 },
    { month: '6月', revenue: 600000, projects: 25 },
  ]

  const recentProjects = [
    {
      id: 1,
      name: '万科翡翠天地住宅项目',
      client: '万科集团',
      status: 'rendering',
      progress: 75,
      deadline: '2024-01-15',
    },
    {
      id: 2,
      name: '保利中央公园商业综合体',
      client: '保利地产',
      status: 'modeling',
      progress: 45,
      deadline: '2024-01-20',
    },
    {
      id: 3,
      name: '融创壹号院别墅项目',
      client: '融创中国',
      status: 'delivering',
      progress: 90,
      deadline: '2024-01-10',
    },
  ]

  const teamWorkload = [
    { name: '建模团队', workload: 85, members: 8, projects: 12 },
    { name: '渲染团队', workload: 92, members: 6, projects: 15 },
    { name: '后期团队', workload: 68, members: 4, projects: 8 },
    { name: '设计团队', workload: 75, members: 5, projects: 10 },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#d9d9d9',
      modeling: '#fa8c16',
      rendering: '#52c41a',
      delivering: '#ff4d4f',
    }
    return colors[status as keyof typeof colors] || '#d9d9d9'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: '报备中',
      modeling: '建模中',
      rendering: '渲染中',
      delivering: '交付中',
    }
    return texts[status as keyof typeof texts] || '未知'
  }

  return (
    <div>
      <div className="page-header">
        <h1>工作台概览</h1>
        <p style={{ color: '#8c8c8c', marginTop: 8 }}>
          欢迎回来！今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中项目"
              value={40}
              prefix={<ProjectOutlined style={{ color: '#1890ff' }} />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <ArrowUpOutlined style={{ color: '#52c41a' }} /> 较上月增长 12%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={600000}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <ArrowUpOutlined style={{ color: '#52c41a' }} /> 较上月增长 15%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={23}
              prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
              suffix="人"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <ArrowDownOutlined style={{ color: '#ff4d4f' }} /> 平均负荷 80%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="项目成功率"
              value={95.5}
              prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <ArrowUpOutlined style={{ color: '#52c41a' }} /> 较上月提升 2%
            </div>
          </Card>
        </Col>
      </Row>

      {/* 数据图表区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="项目状态分布" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="月度收入趋势" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}元`, '收入']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 项目和团队信息 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="最近项目进展" bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={recentProjects}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tag color={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Tag>,
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                      <UserOutlined /> {item.deadline}
                    </span>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.client[0]}</Avatar>}
                    title={item.name}
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>客户：{item.client}</div>
                        <Progress percent={item.progress} size="small" />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="团队工作负荷" bordered={false}>
            <div style={{ marginBottom: 16 }}>
              {teamWorkload.map((team, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{team.name}</span>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {team.members}人 · {team.projects}个项目
                    </span>
                  </div>
                  <Progress 
                    percent={team.workload} 
                    size="small"
                    strokeColor={team.workload > 90 ? '#ff4d4f' : team.workload > 80 ? '#fa8c16' : '#52c41a'}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard 