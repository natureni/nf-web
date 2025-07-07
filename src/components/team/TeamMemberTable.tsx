import React from 'react'
import { Table, Tag, Space, Tooltip, Button, Modal, Avatar, Progress } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  PhoneOutlined,
  BankOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { TeamMember, DEPARTMENTS } from '../../types/team'
import dayjs from 'dayjs'

const { confirm } = Modal

interface TeamMemberTableProps {
  members: TeamMember[]
  loading?: boolean
  departmentFilter: string
  onEditMember: (member: TeamMember) => void
  onDeleteMember: (id: string) => void
  onDepartmentFilterChange: (department: string) => void
}

const TeamMemberTable: React.FC<TeamMemberTableProps> = ({
  members,
  loading = false,
  departmentFilter,
  onEditMember,
  onDeleteMember,
  onDepartmentFilterChange
}) => {
  const handleDelete = (member: TeamMember) => {
    confirm({
      title: '确认删除成员',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除成员 "${member.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => onDeleteMember(member.id)
    })
  }

  const getDepartmentInfo = (departmentKey: string) => {
    return DEPARTMENTS.find(dept => dept.key === departmentKey)
  }

  const filteredMembers = departmentFilter === 'all' 
    ? members 
    : members.filter(member => member.department === departmentFilter)

  const columns: ColumnsType<TeamMember> = [
    {
      title: '成员信息',
      key: 'memberInfo',
      width: 200,
      render: (_, record) => {
        const deptInfo = getDepartmentInfo(record.department)
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: deptInfo?.color || '#d9d9d9',
                marginRight: 12 
              }}
            />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {record.name}
              </div>
              <div style={{ color: '#666', fontSize: 12 }}>
                <Tag color={deptInfo?.color} size="small">
                  {deptInfo?.name}
                </Tag>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            {record.phone}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <BankOutlined style={{ marginRight: 4 }} />
            {record.bankInfo.substring(0, 20)}...
          </div>
        </div>
      ),
    },
    {
      title: '薪资设置',
      key: 'salary',
      width: 120,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}>
            {record.priceType === 'percentage' 
              ? `${record.unitPrice}%` 
              : `¥${record.unitPrice}`}
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>
            {record.priceType === 'percentage' ? '按比例' : '固定单价'}
          </div>
        </div>
      ),
    },
    {
      title: '当前项目',
      key: 'currentProjects',
      width: 150,
      render: (_, record) => {
        const deptInfo = getDepartmentInfo(record.department)
        const currentWorkload = record.currentProjects.reduce((sum, p) => sum + p.dailyWorkload, 0)
        const maxWorkload = deptInfo?.maxDailyProjects || 1
        const percentage = Math.round((currentWorkload / maxWorkload) * 100)
        
        return (
          <div>
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              {currentWorkload}/{maxWorkload} 项目
            </div>
            <Progress 
              percent={percentage}
              size="small"
              status={percentage > 100 ? 'exception' : percentage > 80 ? 'active' : 'normal'}
              showInfo={false}
            />
          </div>
        )
      },
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      width: 200,
      render: (skills: string[]) => (
        <div>
          {skills.slice(0, 3).map(skill => (
            <Tag key={skill} size="small" style={{ marginBottom: 2 }}>
              {skill}
            </Tag>
          ))}
          {skills.length > 3 && (
            <Tag size="small" color="default">+{skills.length - 3}</Tag>
          )}
        </div>
      ),
    },
    {
      title: '入职时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 100,
      render: (date: string) => (
        <div style={{ fontSize: 12 }}>
          {dayjs(date).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      title: '打款周期',
      dataIndex: 'paymentCycle',
      key: 'paymentCycle',
      width: 80,
      render: (cycle: number) => (
        <div style={{ textAlign: 'center', fontSize: 12 }}>
          {cycle}天
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEditMember(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ marginRight: 8 }}>部门筛选：</span>
          <Button.Group>
            <Button 
              type={departmentFilter === 'all' ? 'primary' : 'default'}
              onClick={() => onDepartmentFilterChange('all')}
            >
              全部
            </Button>
            {DEPARTMENTS.map(dept => (
              <Button
                key={dept.key}
                type={departmentFilter === dept.key ? 'primary' : 'default'}
                onClick={() => onDepartmentFilterChange(dept.key)}
              >
                {dept.name}
              </Button>
            ))}
          </Button.Group>
        </div>
        
        <div style={{ color: '#666', fontSize: 12 }}>
          共 {filteredMembers.length} 名成员
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredMembers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
        }}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  )
}

export default TeamMemberTable 