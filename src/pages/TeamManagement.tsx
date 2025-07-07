import React, { useState } from 'react'
import { Card, Button, Tabs, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { TeamMember, PaymentHistory, DEPARTMENTS } from '../types/team'
import TeamMemberTable from '../components/team/TeamMemberTable'
import TeamMemberForm from '../components/team/TeamMemberForm'
import TeamStatistics from '../components/team/TeamStatistics'
import PaymentManagement from '../components/team/PaymentManagement'
import dayjs from 'dayjs'

const { TabPane } = Tabs

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('members')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [memberDepartmentFilter, setMemberDepartmentFilter] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState(dayjs().subtract(1, 'month').format('YYYY-MM'))
  const [historyDateRange, setHistoryDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ])

  // 模拟团队成员数据
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'TM001',
      name: '张建模',
      department: 'modeling',
      phone: '138****1234',
      idCard: '310***********1234',
      unitPrice: 800,
      priceType: 'fixed',
      birdViewPrice: 1000,
      humanViewPrice: 1200,
      animationPrice: 1500,
      customPrice: 1000,
      bankInfo: '工商银行 6222***********1234',
      paymentCycle: 30,
      skills: ['3D Max', 'Maya', 'SketchUp', 'Rhino'],
      joinDate: '2023-01-15',
      currentProjects: [
        { projectId: 'NF0810', projectName: 'Warsan Logistics Park R2', dailyWorkload: 1 },
        { projectId: 'NF0812', projectName: 'PUMPKIN', dailyWorkload: 1 },
        { projectId: 'NF0823', projectName: 'Business Center', dailyWorkload: 1 }
      ]
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
      humanViewPrice: 1800,
      animationPrice: 2000,
      customPrice: 1200,
      bankInfo: '建设银行 6227***********5678',
      paymentCycle: 15,
      skills: ['V-Ray', 'Corona', 'Lumion', 'Enscape'],
      joinDate: '2023-03-20',
      currentProjects: [
        { projectId: 'NF0811', projectName: 'AMSQ', dailyWorkload: 1 },
        { projectId: 'NF0814', projectName: 'Office Complex', dailyWorkload: 1 }
      ]
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
      humanViewPrice: 1500,
      animationPrice: 1800,
      customPrice: 1000,
      bankInfo: '农业银行 6228***********9012',
      paymentCycle: 30,
      skills: ['V-Ray', 'Photoshop', 'After Effects', 'Premiere'],
      joinDate: '2022-11-10',
      currentProjects: [
        { projectId: 'NF0812', projectName: 'PUMPKIN', dailyWorkload: 1 },
        { projectId: 'NF0815', projectName: 'Residential Tower', dailyWorkload: 1 },
        { projectId: 'NF0818', projectName: 'Shopping Mall', dailyWorkload: 1 }
      ]
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
      humanViewPrice: 0.03,
      animationPrice: 0.05,
      customPrice: 0.01,
      bankInfo: '招商银行 6225***********3456',
      paymentCycle: 30,
      skills: ['项目管理', '客户沟通', '团队协调', '质量控制'],
      joinDate: '2022-08-05',
      currentProjects: [
        { projectId: 'NF0808', projectName: 'Hotel Project', dailyWorkload: 1 },
        { projectId: 'NF0813', projectName: 'Retail Center', dailyWorkload: 1 },
        { projectId: 'NF0819', projectName: 'Mixed Use Development', dailyWorkload: 1 },
        { projectId: 'NF0821', projectName: 'Corporate Headquarters', dailyWorkload: 1 },
        { projectId: 'NF0824', projectName: 'Cultural Center', dailyWorkload: 1 }
      ]
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
      humanViewPrice: 0.02,
      animationPrice: 0.03,
      customPrice: 0.005,
      bankInfo: '中国银行 6216***********7890',
      paymentCycle: 30,
      skills: ['客户开发', '商务谈判', '合同管理', '市场分析'],
      joinDate: '2023-02-01',
      currentProjects: [
        { projectId: 'CLIENT001', projectName: '万科地产', dailyWorkload: 1 },
        { projectId: 'CLIENT002', projectName: '恒大集团', dailyWorkload: 1 },
        { projectId: 'CLIENT003', projectName: '碧桂园', dailyWorkload: 1 },
        { projectId: 'CLIENT004', projectName: '融创中国', dailyWorkload: 1 },
        { projectId: 'CLIENT005', projectName: '保利发展', dailyWorkload: 1 }
      ]
    }
  ])

  // 模拟打款历史数据
  const paymentHistory: PaymentHistory[] = [
    {
      id: 'PH001',
      memberId: 'TM001',
      memberName: '张建模',
      department: 'modeling',
      month: '2024-11',
      projectCount: 8,
      totalAmount: 6400,
      paymentDate: '2024-11-30',
      status: 'paid'
    },
    {
      id: 'PH002',
      memberId: 'TM002',
      memberName: '李渲染',
      department: 'rendering',
      month: '2024-11',
      projectCount: 6,
      totalAmount: 7200,
      paymentDate: '2024-11-30',
      status: 'paid'
    },
    {
      id: 'PH003',
      memberId: 'TM003',
      memberName: '王渲染',
      department: 'rendering',
      month: '2024-11',
      projectCount: 7,
      totalAmount: 7000,
      paymentDate: '2024-11-30',
      status: 'paid'
    },
    {
      id: 'PH004',
      memberId: 'TM004',
      memberName: '赵经理',
      department: 'manager',
      month: '2024-11',
      projectCount: 12,
      totalAmount: 8500,
      paymentDate: '2024-11-30',
      status: 'paid'
    },
    {
      id: 'PH005',
      memberId: 'TM005',
      memberName: '陈销售',
      department: 'sales',
      month: '2024-11',
      projectCount: 15,
      totalAmount: 12000,
      paymentDate: '2024-11-30',
      status: 'paid'
    },
    {
      id: 'PH006',
      memberId: 'TM001',
      memberName: '张建模',
      department: 'modeling',
      month: '2024-12',
      projectCount: 5,
      totalAmount: 4000,
      paymentDate: '2024-12-31',
      status: 'pending'
    },
    {
      id: 'PH007',
      memberId: 'TM002',
      memberName: '李渲染',
      department: 'rendering',
      month: '2024-12',
      projectCount: 4,
      totalAmount: 4800,
      paymentDate: '2024-12-31',
      status: 'pending'
    }
  ]

  const handleSaveMember = (values: any) => {
    if (editingMember) {
      // 更新现有成员
      setTeamMembers(prev => prev.map(member => 
        member.id === editingMember.id 
          ? { ...member, ...values }
          : member
      ))
      message.success('成员信息更新成功')
    } else {
      // 添加新成员
      const newMember: TeamMember = {
        ...values,
        id: `TM${Date.now()}`,
        joinDate: dayjs().format('YYYY-MM-DD'),
        currentProjects: []
      }
      setTeamMembers(prev => [...prev, newMember])
      message.success('成员添加成功')
    }
    setModalVisible(false)
    setEditingMember(null)
  }

  const handleDeleteMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id))
    message.success('成员删除成功')
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setModalVisible(true)
  }

  const handleAddMember = () => {
    setEditingMember(null)
    setModalVisible(true)
  }

  const handleViewPaymentDetail = (payment: PaymentHistory) => {
    message.info(`查看 ${payment.memberName} 的打款详情`)
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>团队管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddMember}
          >
            添加成员
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="团队成员" key="members">
            <TeamMemberTable
              members={teamMembers}
              departmentFilter={memberDepartmentFilter}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onDepartmentFilterChange={setMemberDepartmentFilter}
            />
          </TabPane>

          <TabPane tab="工作量统计" key="workload">
            <TeamStatistics
              members={teamMembers}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
            />
          </TabPane>

          <TabPane tab="打款管理" key="payment">
            <PaymentManagement
              paymentHistory={paymentHistory}
              selectedDepartment={selectedDepartment}
              selectedMonth={selectedMonth}
              historyDateRange={historyDateRange}
              onDepartmentChange={setSelectedDepartment}
              onMonthChange={setSelectedMonth}
              onDateRangeChange={setHistoryDateRange}
              onViewPaymentDetail={handleViewPaymentDetail}
            />
          </TabPane>
        </Tabs>

        <TeamMemberForm
          visible={modalVisible}
          member={editingMember}
          onClose={() => {
            setModalVisible(false)
            setEditingMember(null)
          }}
          onSubmit={handleSaveMember}
        />
      </Card>
    </div>
  )
}

export default TeamManagement 