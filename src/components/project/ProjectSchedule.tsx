import React from 'react'
import { Card, Table, Tag, DatePicker, Button, Switch, ColorPicker } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { ScheduleItem } from '../../types/project'

// 扩展dayjs功能
dayjs.extend(isSameOrBefore)

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

  // 生成甘特图时间轴
  const generateGanttTimeline = () => {
    if (scheduleItems.length === 0) return { startDate: dayjs(), endDate: dayjs().add(30, 'day'), timeline: [] }
    
    const allDates = scheduleItems.flatMap(item => [dayjs(item.startDate), dayjs(item.endDate)])
    
    // 使用reduce来找到最小和最大日期
    const minDate = allDates.reduce((min, current) => current.isBefore(min) ? current : min, allDates[0])
    const maxDate = allDates.reduce((max, current) => current.isAfter(max) ? current : max, allDates[0])
    
    // 扩展时间范围，前后各加5天
    const startDate = minDate.subtract(5, 'day')
    const endDate = maxDate.add(5, 'day')
    
    const timeline = []
    let current = startDate
    while (current.isSameOrBefore(endDate)) {
      timeline.push({
        date: current.format('YYYY-MM-DD'),
        dayOfWeek: current.format('ddd'),
        dayOfMonth: current.format('D'),
        isToday: current.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
        isWeekend: current.day() === 0 || current.day() === 6
      })
      current = current.add(1, 'day')
    }
    
    return { startDate, endDate, timeline }
  }

  const { timeline } = generateGanttTimeline()

  // 计算阶段在时间轴上的位置和宽度
  const getPhasePosition = (item: ScheduleItem) => {
    const startIndex = timeline.findIndex(t => t.date === item.startDate)
    const endIndex = timeline.findIndex(t => t.date === item.endDate)
    
    if (startIndex === -1 || endIndex === -1) return null
    
    const left = (startIndex / timeline.length) * 100
    const width = ((endIndex - startIndex + 1) / timeline.length) * 100
    
    return { left, width }
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
      {/* 配置表格 */}
      <Table
        columns={columns}
        dataSource={scheduleItems}
        rowKey="id"
        pagination={false}
        size="small"
        style={{ marginBottom: 24 }}
      />
      
      {/* 甘特图预览 */}
      <div style={{
        background: '#fafafa',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #f0f0f0'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>📊 甘特图预览</h4>
        
        {/* 时间轴标题 */}
        <div style={{ 
          display: 'flex', 
          marginBottom: 8,
          borderBottom: '2px solid #e8e8e8',
          paddingBottom: 8
        }}>
          <div style={{ width: 200, fontWeight: 'bold', padding: '0 8px' }}>
            项目阶段
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666'
            }}>
              {timeline.slice(0, Math.min(timeline.length, 15)).map((timePoint, index) => (
                <div 
                  key={timePoint.date}
                  style={{ 
                    textAlign: 'center',
                    minWidth: 40,
                    padding: '4px 2px',
                    backgroundColor: timePoint.isToday ? '#e6f7ff' : timePoint.isWeekend ? '#f5f5f5' : 'transparent',
                    borderRadius: 4,
                    border: timePoint.isToday ? '1px solid #1890ff' : 'none'
                  }}
                >
                  <div style={{ fontWeight: timePoint.isToday ? 'bold' : 'normal' }}>
                    {timePoint.dayOfMonth}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>
                    {timePoint.dayOfWeek}
                  </div>
                </div>
              ))}
              {timeline.length > 15 && (
                <div style={{ color: '#999', fontSize: '10px', alignSelf: 'center' }}>
                  ...+{timeline.length - 15}天
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 甘特图内容 */}
        <div style={{ minHeight: 200 }}>
          {scheduleItems.map((item) => {
            const position = getPhasePosition(item)
            
            return (
              <div 
                key={item.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: 12,
                  minHeight: 40
                }}
              >
                {/* 阶段名称 */}
                <div style={{ 
                  width: 200, 
                  padding: '0 8px',
                  fontWeight: 500,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    backgroundColor: item.color,
                    borderRadius: '50%'
                  }} />
                  {item.phase}
                </div>
                
                {/* 甘特图条 */}
                <div style={{ 
                  flex: 1, 
                  position: 'relative',
                  height: 32,
                  background: '#f8f8f8',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  {position && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {item.duration}天
                    </div>
                  )}
                  
                  {/* 今日标线 */}
                  {(() => {
                    const todayIndex = timeline.findIndex(t => t.isToday)
                    if (todayIndex !== -1) {
                      const todayPosition = (todayIndex / timeline.length) * 100
                      return (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${todayPosition}%`,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            backgroundColor: '#ff4d4f',
                            zIndex: 10,
                            boxShadow: '0 0 4px rgba(255, 77, 79, 0.5)'
                          }}
                        />
                      )
                    }
                    return null
                  })()}
                </div>
                
                {/* 日期信息 */}
                <div style={{ 
                  width: 120,
                  padding: '0 8px',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'right'
                }}>
                  <div>{dayjs(item.startDate).format('MM/DD')}</div>
                  <div>{dayjs(item.endDate).format('MM/DD')}</div>
                </div>
              </div>
            )
          })}
          
          {scheduleItems.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              padding: 40,
              fontSize: '14px'
            }}>
              暂无项目阶段，请点击"添加阶段"开始规划
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default ProjectSchedule 