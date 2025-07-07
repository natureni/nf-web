import React from 'react'
import { Card, Row, Col, Select, Tag, Button, InputNumber, Avatar, Statistic } from 'antd'
import { UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { TeamMember, DepartmentCost } from '../../types/project'

const { Option } = Select

interface TeamAssignmentProps {
  teamMembers: TeamMember[]
  teamAssignments: {
    manager: TeamMember[]
    sales: TeamMember[]
    modeling: TeamMember[]
    rendering: TeamMember[]
  }
  departmentCosts: DepartmentCost[]
  projectBudget: number
  onTeamAssignmentChange: (assignments: any) => void
  onDepartmentCostsChange: () => void
}

const TeamAssignment: React.FC<TeamAssignmentProps> = ({
  teamMembers,
  teamAssignments,
  departmentCosts,
  projectBudget,
  onTeamAssignmentChange,
  onDepartmentCostsChange
}) => {
  // 添加团队成员
  const addTeamMember = (department: string, memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (member && !teamAssignments[department as keyof typeof teamAssignments].find(m => m.id === memberId)) {
      const updatedAssignments = {
        ...teamAssignments,
        [department]: [...teamAssignments[department as keyof typeof teamAssignments], { ...member, cost: member.unitPrice, unit: '工作量' }]
      }
      onTeamAssignmentChange(updatedAssignments)
    }
  }

  // 移除团队成员
  const removeTeamMember = (department: string, memberId: string) => {
    const updatedAssignments = {
      ...teamAssignments,
      [department]: teamAssignments[department as keyof typeof teamAssignments].filter(m => m.id !== memberId)
    }
    onTeamAssignmentChange(updatedAssignments)
    onDepartmentCostsChange()
  }

  // 更新成员分配
  const updateMemberAssignment = (department: string, memberId: string, field: string, value: number) => {
    const updatedAssignments = {
      ...teamAssignments,
      [department]: teamAssignments[department as keyof typeof teamAssignments].map(m => 
        m.id === memberId ? { ...m, [field]: value || 0 } : m
      )
    }
    onTeamAssignmentChange(updatedAssignments)
    onDepartmentCostsChange()
  }

  return (
    <Card title="团队分配" style={{ marginTop: 24 }}>
      <Row gutter={24}>
        {/* 项目经理分配 */}
        <Col span={12}>
          <Card size="small" title="项目经理分配" style={{ marginBottom: 16 }}>
            <Select
              placeholder="选择项目经理"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={(value) => addTeamMember('manager', value)}
            >
              {teamMembers
                .filter(m => m.department === 'manager')
                .map(member => (
                  <Option key={member.id} value={member.id}>
                    {member.name} ({member.unitPrice}% 项目金额)
                  </Option>
                ))}
            </Select>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                已分配项目经理：
              </div>
              {teamAssignments.manager.map(member => (
                <Tag 
                  key={member.id}
                  closable
                  onClose={() => removeTeamMember('manager', member.id)}
                  style={{ marginBottom: 8 }}
                >
                  {member.name} ({member.unitPrice}%)
                </Tag>
              ))}
            </div>

            {projectBudget > 0 && teamAssignments.manager.length > 0 && (
              <div style={{ fontSize: 12, color: '#52c41a' }}>
                项目经理总费用: ¥{(projectBudget * teamAssignments.manager.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
              </div>
            )}
          </Card>
        </Col>

        {/* 销售分配 */}
        <Col span={12}>
          <Card size="small" title="销售分配" style={{ marginBottom: 16 }}>
            <Select
              placeholder="选择销售"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={(value) => addTeamMember('sales', value)}
            >
              {teamMembers
                .filter(m => m.department === 'sales')
                .map(member => (
                  <Option key={member.id} value={member.id}>
                    {member.name} ({member.unitPrice}% 项目金额)
                  </Option>
                ))}
            </Select>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                已分配销售：
              </div>
              {teamAssignments.sales.map(member => (
                <Tag 
                  key={member.id}
                  closable
                  onClose={() => removeTeamMember('sales', member.id)}
                  style={{ marginBottom: 8 }}
                >
                  {member.name} ({member.unitPrice}%)
                </Tag>
              ))}
            </div>

            {projectBudget > 0 && teamAssignments.sales.length > 0 && (
              <div style={{ fontSize: 12, color: '#52c41a' }}>
                销售总费用: ¥{(projectBudget * teamAssignments.sales.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* 建模分配 */}
        <Col span={12}>
          <Card size="small" title="建模分配" style={{ marginBottom: 16 }}>
            <Select
              placeholder="选择建模师"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={(value) => addTeamMember('modeling', value)}
            >
              {teamMembers
                .filter(m => m.department === 'modeling')
                .map(member => (
                  <Option key={member.id} value={member.id}>
                    {member.name} (¥{member.unitPrice}/工作量)
                  </Option>
                ))}
            </Select>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                已分配建模师：
              </div>
              {teamAssignments.modeling.map(member => (
                <div key={member.id} style={{ 
                  marginBottom: 12,
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                    <span style={{ fontWeight: 500 }}>{member.name}</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      style={{ marginLeft: 'auto' }}
                      onClick={() => removeTeamMember('modeling', member.id)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, marginRight: 4 }}>鸟瞰图:</span>
                      <InputNumber
                        size="small"
                        style={{ width: 60 }}
                        value={member.assignedBirdView || 0}
                        min={0}
                        onChange={(value) => updateMemberAssignment('modeling', member.id, 'assignedBirdView', value || 0)}
                      />
                      <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, marginRight: 4 }}>人视角:</span>
                      <InputNumber
                        size="small"
                        style={{ width: 60 }}
                        value={member.assignedHumanView || 0}
                        min={0}
                        onChange={(value) => updateMemberAssignment('modeling', member.id, 'assignedHumanView', value || 0)}
                      />
                      <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                    费用: ¥{((member.assignedBirdView || 0) * (member.birdViewPrice || 800) + (member.assignedHumanView || 0) * (member.humanViewPrice || 800)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              费用: ¥{departmentCosts.find(d => d.department === 'modeling')?.totalCost.toLocaleString() || '0'}
            </div>
          </Card>
        </Col>

        {/* 渲染分配 */}
        <Col span={12}>
          <Card size="small" title="渲染分配" style={{ marginBottom: 16 }}>
            <Select
              placeholder="选择渲染师"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={(value) => addTeamMember('rendering', value)}
            >
              {teamMembers
                .filter(m => m.department === 'rendering')
                .map(member => (
                  <Option key={member.id} value={member.id}>
                    {member.name} (¥{member.unitPrice}/工作量)
                  </Option>
                ))}
            </Select>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                已分配渲染师：
              </div>
              {teamAssignments.rendering.map(member => (
                <div key={member.id} style={{ 
                  marginBottom: 12,
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                    <span style={{ fontWeight: 500 }}>{member.name}</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      style={{ marginLeft: 'auto' }}
                      onClick={() => removeTeamMember('rendering', member.id)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, marginRight: 4 }}>鸟瞰图:</span>
                      <InputNumber
                        size="small"
                        style={{ width: 60 }}
                        value={member.assignedBirdView || 0}
                        min={0}
                        onChange={(value) => updateMemberAssignment('rendering', member.id, 'assignedBirdView', value || 0)}
                      />
                      <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, marginRight: 4 }}>人视角:</span>
                      <InputNumber
                        size="small"
                        style={{ width: 60 }}
                        value={member.assignedHumanView || 0}
                        min={0}
                        onChange={(value) => updateMemberAssignment('rendering', member.id, 'assignedHumanView', value || 0)}
                      />
                      <span style={{ fontSize: 12, marginLeft: 2 }}>张</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, marginRight: 4 }}>动画:</span>
                      <InputNumber
                        size="small"
                        style={{ width: 60 }}
                        value={member.assignedAnimation || 0}
                        min={0}
                        onChange={(value) => updateMemberAssignment('rendering', member.id, 'assignedAnimation', value || 0)}
                      />
                      <span style={{ fontSize: 12, marginLeft: 2 }}>秒</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                    费用: ¥{(
                      (member.assignedBirdView || 0) * (member.birdViewPrice || 1200) + 
                      (member.assignedHumanView || 0) * (member.humanViewPrice || 1200) + 
                      (member.assignedAnimation || 0) * (member.animationPrice || 200)
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              费用: ¥{departmentCosts.find(d => d.department === 'rendering')?.totalCost.toLocaleString() || '0'}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 团队分配总结 */}
      <Card size="small" title="团队分配总结" style={{ background: '#f8f9fa' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic 
              title="项目经理" 
              value={teamAssignments.manager.length} 
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
            />
            {projectBudget > 0 && (
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                费用: ¥{(projectBudget * teamAssignments.manager.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
              </div>
            )}
          </Col>
          <Col span={6}>
            <Statistic 
              title="销售" 
              value={teamAssignments.sales.length} 
              suffix="人"
              valueStyle={{ color: '#52c41a' }}
            />
            {projectBudget > 0 && (
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                费用: ¥{(projectBudget * teamAssignments.sales.reduce((sum, m) => sum + m.unitPrice, 0) / 100).toLocaleString()}
              </div>
            )}
          </Col>
          <Col span={6}>
            <Statistic 
              title="建模师" 
              value={teamAssignments.modeling.length} 
              suffix="人"
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              费用: ¥{departmentCosts.find(d => d.department === 'modeling')?.totalCost.toLocaleString() || '0'}
            </div>
          </Col>
          <Col span={6}>
            <Statistic 
              title="渲染师" 
              value={teamAssignments.rendering.length} 
              suffix="人"
              valueStyle={{ color: '#f5222d' }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              费用: ¥{departmentCosts.find(d => d.department === 'rendering')?.totalCost.toLocaleString() || '0'}
            </div>
          </Col>
        </Row>
        
        <div style={{ 
          marginTop: 16, 
          padding: '12px',
          background: 'white',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <span style={{ fontWeight: 500, fontSize: 16 }}>团队总费用：</span>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#52c41a', marginLeft: 8 }}>
            ¥{departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0).toLocaleString()}
          </span>
        </div>
      </Card>
    </Card>
  )
}

export default TeamAssignment 