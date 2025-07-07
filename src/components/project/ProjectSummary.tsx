import React from 'react'
import { Card, Row, Col } from 'antd'
import { Client, DepartmentCost, TeamMember } from '../../types/project'

interface ProjectSummaryProps {
  fullProjectName: string
  selectedClient: Client | null
  projectBudget: number
  departmentCosts: DepartmentCost[]
  teamAssignments: {
    manager: TeamMember[]
    sales: TeamMember[]
    modeling: TeamMember[]
    rendering: TeamMember[]
  }
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  fullProjectName,
  selectedClient,
  projectBudget,
  departmentCosts,
  teamAssignments
}) => {
  const getTotalTeamMembers = () => {
    return teamAssignments.manager.length + 
           teamAssignments.sales.length + 
           teamAssignments.modeling.length + 
           teamAssignments.rendering.length
  }

  const getTotalCost = () => {
    return departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0)
  }

  return (
    <Card size="small" title="项目创建概览" style={{ marginTop: 24, background: '#f8f9fa' }}>
      <Row gutter={16}>
        <Col span={8}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>项目信息</div>
            <div style={{ fontSize: 16, fontWeight: 500, margin: '8px 0' }}>
              {fullProjectName || '未设置项目名称'}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              客户：{selectedClient?.companyName || '未选择客户'}
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>团队配置</div>
            <div style={{ fontSize: 16, fontWeight: 500, margin: '8px 0' }}>
              {getTotalTeamMembers()} 人
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              经理{teamAssignments.manager.length}人 销售{teamAssignments.sales.length}人 建模{teamAssignments.modeling.length}人 渲染{teamAssignments.rendering.length}人
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>项目预算</div>
            <div style={{ fontSize: 16, fontWeight: 500, margin: '8px 0', color: '#52c41a' }}>
              ¥{projectBudget.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              成本：¥{getTotalCost().toLocaleString()}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default ProjectSummary 