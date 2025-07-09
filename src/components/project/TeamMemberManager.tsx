import React, { useState, useEffect } from 'react'
import { Card, Select, Button, InputNumber, Avatar, Row, Col, Divider, Tag, message } from 'antd'
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { TeamMember } from '../../types/project'
import { TeamMember as TeamManagementMember, DEPARTMENTS } from '../../types/team'

interface ProjectTeamMember extends TeamMember {
  originalMember?: TeamManagementMember
  assignedWorkload?: number
  // 详细工作量分配
  birdViewWorkload?: number
  halfBirdViewWorkload?: number
  humanViewWorkload?: number
  animationWorkload?: number
}

interface TeamMemberManagerProps {
  title: string
  color: string
  members: ProjectTeamMember[]
  onMembersChange: (members: ProjectTeamMember[]) => void
  departmentKey?: string // 对应的部门key
  projectTotalPrice?: number // 项目总价，用于计算管理和销售费用
}

const TeamMemberManager: React.FC<TeamMemberManagerProps> = ({
  title,
  color,
  members,
  onMembersChange,
  departmentKey,
  projectTotalPrice = 0
}) => {
  const [availableMembers, setAvailableMembers] = useState<TeamManagementMember[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')

  // 加载团队管理中的成员数据
  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = () => {
    try {
      // 这里应该从团队管理中获取数据，暂时使用模拟数据
      const mockTeamMembers: TeamManagementMember[] = [
        {
          id: 'TM001',
          name: '张建模',
          department: 'modeling',
          phone: '138****1234',
          idCard: '310***********1234',
          unitPrice: 800,
          priceType: 'fixed',
          birdViewPrice: 1000,
          halfBirdViewPrice: 800,
          humanViewPrice: 1200,
          animationPrice: 1500,
          customPrice: 1000,
          bankInfo: '工商银行 6222***********1234',
          paymentCycle: 30,
          skills: ['3D Max', 'Maya', 'SketchUp', 'Rhino'],
          joinDate: '2023-01-15',
          currentProjects: []
        },
        {
          id: 'TM002',
          name: '李渲染',
          department: 'rendering',
          phone: '139****5678',
          idCard: '320***********5678',
          unitPrice: 1200,
          priceType: 'fixed',
          birdViewPrice: 1500,
          halfBirdViewPrice: 1200,
          humanViewPrice: 1800,
          animationPrice: 2000,
          customPrice: 1200,
          bankInfo: '建设银行 6227***********5678',
          paymentCycle: 15,
          skills: ['V-Ray', 'Corona', 'Lumion', 'Enscape'],
          joinDate: '2023-03-20',
          currentProjects: []
        },
        {
          id: 'TM003',
          name: '王渲染',
          department: 'rendering',
          phone: '137****9012',
          idCard: '330***********9012',
          unitPrice: 1000,
          priceType: 'fixed',
          birdViewPrice: 1200,
          halfBirdViewPrice: 1000,
          humanViewPrice: 1500,
          animationPrice: 1800,
          customPrice: 1000,
          bankInfo: '农业银行 6228***********9012',
          paymentCycle: 30,
          skills: ['V-Ray', 'Photoshop', 'After Effects', 'Premiere'],
          joinDate: '2022-11-10',
          currentProjects: []
        },
        {
          id: 'TM004',
          name: '赵经理',
          department: 'manager',
          phone: '135****3456',
          idCard: '110***********3456',
          unitPrice: 2,
          priceType: 'percentage',
          birdViewPrice: 0.02,
          halfBirdViewPrice: 0.015,
          humanViewPrice: 0.03,
          animationPrice: 0.05,
          customPrice: 0.01,
          bankInfo: '招商银行 6225***********3456',
          paymentCycle: 30,
          skills: ['项目管理', '客户沟通', '团队协调', '质量控制'],
          joinDate: '2022-08-05',
          currentProjects: []
        },
        {
          id: 'TM005',
          name: '陈销售',
          department: 'sales',
          phone: '136****7890',
          idCard: '440***********7890',
          unitPrice: 1,
          priceType: 'percentage',
          birdViewPrice: 0.01,
          halfBirdViewPrice: 0.008,
          humanViewPrice: 0.02,
          animationPrice: 0.03,
          customPrice: 0.005,
          bankInfo: '中国银行 6216***********7890',
          paymentCycle: 30,
          skills: ['客户开发', '商务谈判', '合同管理', '市场分析'],
          joinDate: '2023-02-01',
          currentProjects: []
        },
        {
          id: 'TM006',
          name: '刘动画',
          department: 'rendering', // 动画师暂时归类到渲染部
          phone: '133****1111',
          idCard: '350***********1111',
          unitPrice: 1500,
          priceType: 'fixed',
          birdViewPrice: 1800,
          halfBirdViewPrice: 1500,
          humanViewPrice: 2000,
          animationPrice: 2500,
          customPrice: 1500,
          bankInfo: '交通银行 6222***********1111',
          paymentCycle: 20,
          skills: ['After Effects', 'Cinema 4D', 'Blender', 'Maya'],
          joinDate: '2023-05-10',
          currentProjects: []
        }
      ]

      // 根据部门过滤成员，如果没有指定部门则显示所有成员
      let filteredMembers = mockTeamMembers
      if (departmentKey) {
        filteredMembers = mockTeamMembers.filter(member => member.department === departmentKey)
      }

      setAvailableMembers(filteredMembers)
    } catch (error) {
      console.error('加载团队成员失败:', error)
      message.error('加载团队成员失败')
    }
  }

  // 添加团队成员到项目
  const addMemberToProject = () => {
    if (!selectedMemberId) {
      message.warning('请选择团队成员')
      return
    }

    const selectedMember = availableMembers.find(m => m.id === selectedMemberId)
    if (!selectedMember) {
      message.error('选择的成员不存在')
      return
    }

    // 检查是否已经添加过该成员
    if (members.find(m => m.id === selectedMember.id)) {
      message.warning('该成员已添加到项目中')
      return
    }

    // 转换为项目团队成员格式
    const projectMember: ProjectTeamMember = {
      id: selectedMember.id,
      name: selectedMember.name,
      department: getDepartmentName(selectedMember.department),
      unitPrice: selectedMember.unitPrice,
      priceType: selectedMember.priceType,
      originalMember: selectedMember,
      assignedWorkload: 1 // 默认工作量为1
    }

    onMembersChange([...members, projectMember])
    setSelectedMemberId('')
    message.success(`成功添加 ${selectedMember.name} 到项目团队`)
  }

  // 获取部门显示名称
  const getDepartmentName = (departmentKey: string): string => {
    const dept = DEPARTMENTS.find(d => d.key === departmentKey)
    return dept ? dept.name : departmentKey
  }

  // 获取部门颜色
  const getDepartmentColor = (departmentKey: string): string => {
    const dept = DEPARTMENTS.find(d => d.key === departmentKey)
    return dept ? dept.color : '#666'
  }

  // 更新成员信息
  const updateMember = (id: string, field: keyof ProjectTeamMember, value: any) => {
    const updatedMembers = members.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    )
    onMembersChange(updatedMembers)
  }

  // 删除成员
  const deleteMember = (id: string) => {
    const member = members.find(m => m.id === id)
    const updatedMembers = members.filter(member => member.id !== id)
    onMembersChange(updatedMembers)
    if (member) {
      message.success(`已将 ${member.name} 从项目团队中移除`)
    }
  }

  // 过滤可选择的成员（排除已添加的）
  const getSelectableMembers = () => {
    const addedMemberIds = members.map(m => m.id)
    return availableMembers.filter(member => !addedMemberIds.includes(member.id))
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ 
          width: 8, 
          height: 8, 
          backgroundColor: color, 
          borderRadius: '50%', 
          marginRight: 8 
        }} />
        <h4 style={{ margin: 0 }}>{title}</h4>
        <Tag color={color} style={{ marginLeft: 8 }}>
          {members.length} 人
        </Tag>
      </div>
      
      {/* 添加成员选择器 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Select
          placeholder={`从团队管理中选择${title}...`}
          style={{ flex: 1 }}
          value={selectedMemberId}
          onChange={setSelectedMemberId}
          showSearch
          filterOption={(input, option) =>
            (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {getSelectableMembers().map(member => (
            <Select.Option key={member.id} value={member.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{member.name}</span>
                <div>
                  <Tag color={getDepartmentColor(member.department)} size="small">
                    {getDepartmentName(member.department)}
                  </Tag>
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: 8 }}>
                    {member.priceType === 'fixed' ? `¥${member.unitPrice}` : `${member.unitPrice}%`}
                  </span>
                </div>
              </div>
            </Select.Option>
          ))}
        </Select>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={addMemberToProject}
          disabled={!selectedMemberId}
        >
          添加成员
        </Button>
      </div>

      {/* 已添加的成员列表 */}
      {members.map((member, index) => (
        <div key={member.id} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 16,
          padding: 16,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          backgroundColor: '#fafafa'
        }}>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: member.originalMember ? 
                getDepartmentColor(member.originalMember.department) : color, 
              marginRight: 12 
            }} 
          />
          
          <div style={{ flex: 1 }}>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {member.originalMember && (
                      <Tag color={getDepartmentColor(member.originalMember.department)} size="small">
                        {getDepartmentName(member.originalMember.department)}
                      </Tag>
                    )}
                  </div>
                </div>
              </Col>
              
              {/* 显示详细单价信息 */}
              {member.originalMember && (
                <>
                  {/* 百分比计费的管理和销售人员简化显示 */}
                  {member.originalMember.priceType === 'percentage' && 
                   (member.originalMember.department === 'manager' || member.originalMember.department === 'sales') ? (
                    <>
                      <Col span={8}>
                        <div style={{ fontSize: '12px', color: '#666' }}>提成比例</div>
                        <div style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>
                          {member.originalMember.unitPrice}%
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ fontSize: '12px', color: '#666' }}>计算费用</div>
                        <div style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '16px' }}>
                          ¥{((projectTotalPrice * member.originalMember.unitPrice / 100) * (member.assignedWorkload || 1)).toLocaleString()}
                        </div>
                      </Col>
                      <Col span={2}>
                        <div style={{ fontSize: '12px', color: '#8c8c8c', textAlign: 'center' }}>
                          基于项目总价
                        </div>
                      </Col>
                    </>
                  ) : (
                    /* 固定计费或建模/渲染/动画人员显示详细单价 */
                    <>
                      <Col span={3}>
                        <div style={{ fontSize: '12px', color: '#666' }}>鸟瞰单价</div>
                        <div style={{ fontWeight: 'bold', color: '#f5222d', marginBottom: 4 }}>
                          {member.originalMember.priceType === 'percentage' 
                            ? `${member.originalMember.birdViewPrice}%` 
                            : `¥${member.originalMember.birdViewPrice}`
                          }
                        </div>
                        <InputNumber
                          value={member.birdViewWorkload || 0}
                          onChange={(value) => updateMember(member.id, 'birdViewWorkload', value || 0)}
                          min={0}
                          style={{ width: '100%' }}
                          size="small"
                          placeholder="工作量"
                        />
                      </Col>
                      <Col span={3}>
                        <div style={{ fontSize: '12px', color: '#666' }}>半鸟瞰单价</div>
                        <div style={{ fontWeight: 'bold', color: '#fa8c16', marginBottom: 4 }}>
                          {member.originalMember.priceType === 'percentage' 
                            ? `${member.originalMember.halfBirdViewPrice}%` 
                            : `¥${member.originalMember.halfBirdViewPrice}`
                          }
                        </div>
                        <InputNumber
                          value={member.halfBirdViewWorkload || 0}
                          onChange={(value) => updateMember(member.id, 'halfBirdViewWorkload', value || 0)}
                          min={0}
                          style={{ width: '100%' }}
                          size="small"
                          placeholder="工作量"
                        />
                      </Col>
                      <Col span={3}>
                        <div style={{ fontSize: '12px', color: '#666' }}>人视角单价</div>
                        <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: 4 }}>
                          {member.originalMember.priceType === 'percentage' 
                            ? `${member.originalMember.humanViewPrice}%` 
                            : `¥${member.originalMember.humanViewPrice}`
                          }
                        </div>
                        <InputNumber
                          value={member.humanViewWorkload || 0}
                          onChange={(value) => updateMember(member.id, 'humanViewWorkload', value || 0)}
                          min={0}
                          style={{ width: '100%' }}
                          size="small"
                          placeholder="工作量"
                        />
                      </Col>
                      <Col span={3}>
                        <div style={{ fontSize: '12px', color: '#666' }}>动画单价</div>
                        <div style={{ fontWeight: 'bold', color: '#722ed1', marginBottom: 4 }}>
                          {member.originalMember.priceType === 'percentage' 
                            ? `${member.originalMember.animationPrice}%` 
                            : `¥${member.originalMember.animationPrice}/秒`
                          }
                        </div>
                        <InputNumber
                          value={member.animationWorkload || 0}
                          onChange={(value) => updateMember(member.id, 'animationWorkload', value || 0)}
                          min={0}
                          style={{ width: '100%' }}
                          size="small"
                          placeholder="工作量"
                        />
                      </Col>
                      <Col span={3}>
                        <div style={{ fontSize: '12px', color: '#666' }}>总费用</div>
                        <div style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '14px' }}>
                          {member.originalMember.priceType === 'percentage' 
                            ? `${(member.originalMember.birdViewPrice + member.originalMember.halfBirdViewPrice + member.originalMember.humanViewPrice + member.originalMember.animationPrice)}%`
                            : `¥${(
                                (member.birdViewWorkload || 0) * member.originalMember.birdViewPrice +
                                (member.halfBirdViewWorkload || 0) * member.originalMember.halfBirdViewPrice +
                                (member.humanViewWorkload || 0) * member.originalMember.humanViewPrice +
                                (member.animationWorkload || 0) * member.originalMember.animationPrice
                              ).toLocaleString()}`
                          }
                        </div>
                      </Col>
                    </>
                  )}
                </>
              )}
              
              <Col span={2}>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => deleteMember(member.id)}
                  title="移除成员"
                />
              </Col>
            </Row>
            
            {/* 显示成员技能 */}
            {member.originalMember?.skills && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>技能：</div>
                <div>
                  {member.originalMember.skills.map(skill => (
                    <Tag key={skill} size="small" style={{ marginBottom: 2 }}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* 显示图量分配详情（仅渲染人员） */}
            {member.imageDistribution && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>图量分配：</div>
                <div>
                  {member.imageDistribution.birdView > 0 && (
                    <Tag color="red" size="small">鸟瞰 {member.imageDistribution.birdView}张</Tag>
                  )}
                  {member.imageDistribution.halfBirdView > 0 && (
                    <Tag color="orange" size="small">半鸟瞰 {member.imageDistribution.halfBirdView}张</Tag>
                  )}
                  {member.imageDistribution.humanView > 0 && (
                    <Tag color="blue" size="small">人视角 {member.imageDistribution.humanView}张</Tag>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 0',
          color: '#8c8c8c',
          border: '1px dashed #d9d9d9',
          borderRadius: 8
        }}>
          <UserOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
          <div>暂无{title}，请从上方选择添加</div>
        </div>
      )}
    </div>
  )
}

export default TeamMemberManager 