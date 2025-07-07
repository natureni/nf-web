import React from 'react'
import { Card, Table, DatePicker, InputNumber, Checkbox, Space } from 'antd'
import dayjs from 'dayjs'
import { ScheduleItem } from '../../types/project'

interface ProjectScheduleProps {
  scheduleItems: ScheduleItem[]
  onScheduleChange: (items: ScheduleItem[]) => void
  autoSchedulePhases: (items: ScheduleItem[]) => ScheduleItem[]
}

const ProjectSchedule: React.FC<ProjectScheduleProps> = ({
  scheduleItems,
  onScheduleChange,
  autoSchedulePhases
}) => {
  const handleDateChange = (index: number, field: 'startDate' | 'endDate', newDate: dayjs.Dayjs | null) => {
    const updated = [...scheduleItems]
    updated[index][field] = newDate?.format('YYYY-MM-DD') || updated[index][field]
    onScheduleChange(updated)
  }

  const handleDurationChange = (index: number, value: number | null) => {
    const updated = [...scheduleItems]
    updated[index].duration = value || updated[index].duration
    // 重新计算结束日期
    const startDate = dayjs(updated[index].startDate)
    updated[index].endDate = startDate.add((value || updated[index].duration) - 1, 'day').format('YYYY-MM-DD')
    onScheduleChange(updated)
  }

  const handleAutoScheduleChange = (index: number, checked: boolean) => {
    const updated = [...scheduleItems]
    updated[index].autoSchedule = checked
    
    if (checked && index > 0) {
      // 如果勾选自动调度，自动计算该阶段的时间
      const prevPhase = updated[index - 1]
      const startDate = dayjs(prevPhase.endDate).add(1, 'day')
      updated[index].startDate = startDate.format('YYYY-MM-DD')
      updated[index].endDate = startDate.add(updated[index].duration - 1, 'day').format('YYYY-MM-DD')
      
      // 重新调度后续的自动调度阶段
      onScheduleChange(autoSchedulePhases(updated))
    } else {
      onScheduleChange(updated)
    }
  }

  const columns = [
    {
      title: '项目阶段',
      dataIndex: 'phase',
      render: (text: string, record: ScheduleItem) => (
        <Space>
          <div style={{ 
            width: 8, 
            height: 8, 
            backgroundColor: record.color, 
            borderRadius: '50%', 
            marginRight: 8 
          }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      render: (date: string, record: ScheduleItem, index: number) => (
        <DatePicker
          value={dayjs(date)}
          onChange={(newDate) => handleDateChange(index, 'startDate', newDate)}
          disabled={record.autoSchedule}
        />
      ),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      render: (date: string, record: ScheduleItem, index: number) => (
        <DatePicker
          value={dayjs(date)}
          onChange={(newDate) => handleDateChange(index, 'endDate', newDate)}
          disabled={record.autoSchedule}
        />
      ),
    },
    {
      title: '工期',
      render: (_: any, record: ScheduleItem, index: number) => {
        if (record.autoSchedule) {
          // 自动调度时显示默认工期并允许修改
          return (
            <InputNumber
              value={record.duration}
              min={1}
              max={30}
              suffix="天"
              size="small"
              style={{ width: 80 }}
              onChange={(value) => handleDurationChange(index, value)}
            />
          )
        } else {
          // 手动设置时显示实际工期
          const start = dayjs(record.startDate)
          const end = dayjs(record.endDate)
          const days = end.diff(start, 'day') + 1
          return <span>{days} 天</span>
        }
      },
    },
    {
      title: '自动调度',
      dataIndex: 'autoSchedule',
      render: (auto: boolean, record: ScheduleItem, index: number) => (
        <Checkbox
          checked={auto}
          onChange={(e) => handleAutoScheduleChange(index, e.target.checked)}
          disabled={index === 0} // 第一个阶段不能设置自动调度
        >
          自动安排
        </Checkbox>
      ),
    },
  ]

  const getTotalDuration = () => {
    const start = dayjs(scheduleItems[0].startDate)
    const end = dayjs(scheduleItems[scheduleItems.length - 1].endDate)
    return end.diff(start, 'day') + 1
  }

  return (
    <Card title="项目时间安排" style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h4>项目阶段时间规划</h4>
        <p style={{ color: '#8c8c8c', fontSize: 14 }}>
          请设置项目各个阶段的时间安排。系统将根据您的设置自动生成甘特图。
        </p>
      </div>

      {/* 时间安排表格 */}
      <Table
        dataSource={scheduleItems}
        columns={columns}
        pagination={false}
        footer={() => (
          <div style={{ 
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>时间安排说明：</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                • 项目报备阶段为固定阶段，不可设置自动调度<br/>
                • 勾选"自动安排"的阶段将根据前一阶段的结束时间自动计算开始时间<br/>
                • 项目总工期：{getTotalDuration()} 天
              </div>
            </Space>
          </div>
        )}
      />
    </Card>
  )
}

export default ProjectSchedule 