import React from 'react'
import { Card, Row, Col, Statistic, Progress, List, Avatar } from 'antd'
import { 
  UserOutlined, 
  ProjectOutlined, 
  AlertOutlined, 
  LineChartOutlined 
} from '@ant-design/icons'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TeamMember, WorkloadData, DepartmentStats, DEPARTMENTS } from '../../types/team'

interface TeamStatisticsProps {
  members: TeamMember[]
  selectedDepartment: string
  onDepartmentChange: (department: string) => void
}

const TeamStatistics: React.FC<TeamStatisticsProps> = ({
  members,
  selectedDepartment,
  onDepartmentChange
}) => {
  // 获取部门统计数据
  const getDepartmentStats = (): DepartmentStats[] => {
    return DEPARTMENTS.map(dept => {
      const deptMembers = members.filter(m => m.department === dept.key)
      const totalProjects = deptMembers.reduce((sum, m) => sum + m.currentProjects.length, 0)
      const avgWorkload = deptMembers.length > 0 ? totalProjects / deptMembers.length : 0
      
      return {
        department: dept.name,
        memberCount: deptMembers.length,
        totalProjects,
        avgWorkload: Math.round(avgWorkload * 100) / 100
      }
    })
  }

  // 获取工作量数据
  const getWorkloadData = (): WorkloadData[] => {
    return DEPARTMENTS.map(dept => {
      const deptMembers = members.filter(m => m.department === dept.key)
      const currentWorkload = deptMembers.reduce((sum, m) => 
        sum + m.currentProjects.reduce((pSum, p) => pSum + p.dailyWorkload, 0), 0
      )
      const maxWorkload = deptMembers.length * dept.maxDailyProjects
      const percentage = maxWorkload > 0 ? Math.round((currentWorkload / maxWorkload) * 100) : 0
      
      return {
        name: dept.name,
        current: currentWorkload,
        max: maxWorkload,
        percentage
      }
    })
  }

  // 获取过载成员
  const getOverloadedMembers = () => {
    return members.filter(member => {
      const dept = DEPARTMENTS.find(d => d.key === member.department)
      const currentWorkload = member.currentProjects.reduce((sum, p) => sum + p.dailyWorkload, 0)
      return dept && currentWorkload > dept.maxDailyProjects
    })
  }

  const departmentStats = getDepartmentStats()
  const workloadData = getWorkloadData()
  const overloadedMembers = getOverloadedMembers()

  const COLORS = ['#1890ff', '#faad14', '#52c41a', '#f5222d']

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 整体统计 */}
        <Col span={6}>
          <Card>
            <Statistic
              title="总成员数"
              value={members.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={members.reduce((sum, m) => sum + m.currentProjects.length, 0)}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="过载成员"
              value={overloadedMembers.length}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均工作量"
              value={members.length > 0 ? 
                Math.round((members.reduce((sum, m) => sum + m.currentProjects.length, 0) / members.length) * 100) / 100 : 0
              }
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 部门工作量统计 */}
        <Col span={12}>
          <Card title="部门工作量统计" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'current' ? ' (当前)' : ' (最大)'}`,
                    name === 'current' ? '当前工作量' : '最大工作量'
                  ]}
                />
                <Bar dataKey="current" fill="#1890ff" name="current" />
                <Bar dataKey="max" fill="#f0f0f0" name="max" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 部门成员分布 */}
        <Col span={12}>
          <Card title="部门成员分布" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, memberCount }) => `${department}: ${memberCount}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="memberCount"
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 部门详细统计 */}
        <Col span={12}>
          <Card title="部门详细统计" size="small">
            <List
              dataSource={departmentStats}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        icon={<UserOutlined />}
                      />
                    }
                    title={item.department}
                    description={
                      <div>
                        <div>成员数: {item.memberCount} | 项目数: {item.totalProjects}</div>
                        <div>平均工作量: {item.avgWorkload}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 工作量进度 */}
        <Col span={12}>
          <Card title="各部门工作量进度" size="small">
            <div style={{ padding: '16px 0' }}>
              {workloadData.map((item, index) => (
                <div key={item.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{item.name}</span>
                    <span>{item.current}/{item.max}</span>
                  </div>
                  <Progress 
                    percent={item.percentage}
                    status={item.percentage > 100 ? 'exception' : item.percentage > 80 ? 'active' : 'normal'}
                    strokeColor={COLORS[index % COLORS.length]}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 过载成员提醒 */}
      {overloadedMembers.length > 0 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="⚠️ 过载成员提醒" size="small">
              <List
                dataSource={overloadedMembers}
                renderItem={(member) => {
                  const dept = DEPARTMENTS.find(d => d.key === member.department)
                  const currentWorkload = member.currentProjects.reduce((sum, p) => sum + p.dailyWorkload, 0)
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            style={{ backgroundColor: '#f5222d' }}
                            icon={<AlertOutlined />}
                          />
                        }
                        title={`${member.name} (${dept?.name})`}
                        description={
                          <div>
                            <div>当前工作量: {currentWorkload} | 最大工作量: {dept?.maxDailyProjects}</div>
                            <div>超载项目: {member.currentProjects.map(p => p.projectName).join(', ')}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default TeamStatistics 