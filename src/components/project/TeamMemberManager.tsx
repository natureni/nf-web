import React from 'react'
import { Card, Select, Button, Input, InputNumber, Avatar, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { TeamMember } from '../../types/project'

interface TeamMemberManagerProps {
  title: string
  color: string
  members: TeamMember[]
  onMembersChange: (members: TeamMember[]) => void
}

const TeamMemberManager: React.FC<TeamMemberManagerProps> = ({
  title,
  color,
  members,
  onMembersChange
}) => {
  const addMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: `新${title}`,
      department: title,
      unitPrice: 1500,
      priceType: 'fixed'
    }
    onMembersChange([...members, newMember])
  }

  const updateMember = (id: string, field: keyof TeamMember, value: any) => {
    const updatedMembers = members.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    )
    onMembersChange(updatedMembers)
  }

  const deleteMember = (id: string) => {
    const updatedMembers = members.filter(member => member.id !== id)
    onMembersChange(updatedMembers)
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
      </div>
      
      <Select
        placeholder={`选择${title}...`}
        style={{ width: '100%', marginBottom: 16 }}
        value=""
        dropdownRender={() => (
          <div style={{ padding: 8 }}>
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              style={{ width: '100%' }}
              onClick={addMember}
            >
              添加{title}
            </Button>
          </div>
        )}
      />

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
            style={{ backgroundColor: color, marginRight: 12 }} 
          />
          
          <Row gutter={16} style={{ flex: 1 }}>
            <Col span={6}>
              <Input
                placeholder="姓名"
                value={member.name}
                onChange={(e) => updateMember(member.id, 'name', e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="部门"
                value={member.department}
                onChange={(value) => updateMember(member.id, 'department', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value="modeling">建模部</Select.Option>
                <Select.Option value="rendering">渲染部</Select.Option>
                <Select.Option value="animation">动画部</Select.Option>
                <Select.Option value="manager">管理部</Select.Option>
              </Select>
            </Col>
            <Col span={6}>
              <InputNumber
                placeholder="费用"
                value={member.unitPrice}
                onChange={(value) => updateMember(member.id, 'unitPrice', value || 0)}
                style={{ width: '100%' }}
                min={0}
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/¥\s?|(,*)/g, '') as any}
              />
            </Col>
            <Col span={4}>
              <Select
                value={member.priceType}
                onChange={(value) => updateMember(member.id, 'priceType', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value="fixed">固定</Select.Option>
                <Select.Option value="percentage">百分比</Select.Option>
              </Select>
            </Col>
            <Col span={2}>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => deleteMember(member.id)}
              />
            </Col>
          </Row>
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
          暂无{title}，点击上方按钮添加
        </div>
      )}
    </div>
  )
}

export default TeamMemberManager 