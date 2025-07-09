import React from 'react'
import { Card, Table, Tag, DatePicker, Button, Switch, ColorPicker } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { ScheduleItem } from '../../types/project'

interface ProjectScheduleProps {
  scheduleItems: ScheduleItem[]
  onScheduleChange: (items: ScheduleItem[]) => void
}

const ProjectSchedule: React.FC<ProjectScheduleProps> = ({
  scheduleItems,
  onScheduleChange
}) => {
  const addScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      phase: '新阶段',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      color: '#1890ff',
      autoSchedule: false,
      duration: 7
    }
    onScheduleChange([...scheduleItems, newItem])
  }

  const updateScheduleItem = (id: string, field: keyof ScheduleItem, value: any) => {
    const updatedItems = scheduleItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        
        // 如果修改了开始日期或结束日期，重新计算duration
        if (field === 'startDate' || field === 'endDate') {
          const start = dayjs(field === 'startDate' ? value : item.startDate)
          const end = dayjs(field === 'endDate' ? value : item.endDate)
          updated.duration = end.diff(start, 'day') + 1
        }
        
        return updated
      }
      return item
    })
    onScheduleChange(updatedItems)
  }

  const deleteScheduleItem = (id: string) => {
    const updatedItems = scheduleItems.filter(item => item.id !== id)
    onScheduleChange(updatedItems)
  }

  const columns = [
    {
      title: '阶段名称',
      dataIndex: 'phase',
      key: 'phase',
      width: 200,
      render: (text: string, record: ScheduleItem) => (
        <input
          value={text}
          onChange={(e) => updateScheduleItem(record.id, 'phase', e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            width: '100%',
            fontWeight: 500
          }}
        />
      ),
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
      render: (date: string, record: ScheduleItem) => (
        <DatePicker
          value={dayjs(date)}
          onChange={(value) => updateScheduleItem(record.id, 'startDate', value?.format('YYYY-MM-DD'))}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150,
      render: (date: string, record: ScheduleItem) => (
        <DatePicker
          value={dayjs(date)}
          onChange={(value) => updateScheduleItem(record.id, 'endDate', value?.format('YYYY-MM-DD'))}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '工期',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration: number) => (
        <Tag color="blue">{duration}天</Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string, record: ScheduleItem) => (
        <ColorPicker
          value={color}
          onChange={(value) => updateScheduleItem(record.id, 'color', value.toHexString())}
          size="small"
          presets={[
            {
              label: '推荐颜色',
              colors: [
                '#d9d9d9', // 灰色 - 项目报备
                '#fa8c16', // 橙色 - 项目建模
                '#52c41a', // 绿色 - 项目渲染/动画
                '#ff4d4f', // 红色 - 项目出图
                '#8c8c8c', // 浅灰色 - 项目暂停
                '#1890ff', // 蓝色
                '#722ed1', // 紫色
              ],
            },
          ]}
        />
      ),
    },
    {
      title: '自动排期',
      dataIndex: 'autoSchedule',
      key: 'autoSchedule',
      width: 100,
      render: (autoSchedule: boolean, record: ScheduleItem) => (
        <Switch
          checked={autoSchedule}
          onChange={(checked) => updateScheduleItem(record.id, 'autoSchedule', checked)}
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record: ScheduleItem) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => deleteScheduleItem(record.id)}
        />
      ),
    },
  ]

  return (
    <Card 
      title="项目时间安排" 
      style={{ marginTop: 24 }}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addScheduleItem}
        >
          添加阶段
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={scheduleItems}
        rowKey="id"
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />
      
      <div style={{
        background: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        marginTop: 16
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>时间轴预览</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {scheduleItems.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '8px 12px',
                backgroundColor: item.color,
                color: 'white',
                borderRadius: 4,
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              {item.phase}
              <div style={{ fontSize: '10px', opacity: 0.9, marginTop: 2 }}>
                {dayjs(item.startDate).format('MM/DD')} - {dayjs(item.endDate).format('MM/DD')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default ProjectSchedule 