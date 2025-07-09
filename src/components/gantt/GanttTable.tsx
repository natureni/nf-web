import React from 'react'
import { Table, Tag, Button, Popover } from 'antd'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { GanttProject, TaskCell } from '../../types/project'

interface GanttTableProps {
  projects: GanttProject[]
  baseDate: dayjs.Dayjs
  slidePosition: number
  selectedStatuses: string[]
  today: string
  onCellEdit: (projectId: string, date: string, currentTask?: TaskCell) => void
}

const GanttTable: React.FC<GanttTableProps> = ({
  projects,
  baseDate,
  slidePosition,
  selectedStatuses,
  today,
  onCellEdit
}) => {
  // 获取状态配置
  const getStatusConfig = (status: string) => {
    const configs = {
      reporting: { color: '#d9d9d9', text: '报备中' },
      modeling: { color: '#fa8c16', text: '建模' },
      rendering: { color: '#52c41a', text: '渲染' },
      delivering: { color: '#1890ff', text: '出图' },
      paused: { color: '#ff4d4f', text: '暂停' },
    }
    return configs[status as keyof typeof configs] || { color: '#d9d9d9', text: '未知' }
  }

  // 获取任务单元格样式
  const getTaskCellStyle = (task: TaskCell) => {
    const baseStyle: React.CSSProperties = {
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white',
      transition: 'all 0.3s ease',
      border: '2px solid transparent'
    }

    switch (task.type) {
      case 'M':
        return { ...baseStyle, backgroundColor: '#fa8c16' }
      case 'R':
        return { ...baseStyle, backgroundColor: '#52c41a' }
      case 'F':
        return { ...baseStyle, backgroundColor: '#dc143c' } // 大红色
      case 'P':
        return { ...baseStyle, backgroundColor: '#8c8c8c' } // 灰色
      case 'notice':
        return { ...baseStyle, backgroundColor: '#722ed1' }
      default:
        return { ...baseStyle, backgroundColor: '#f0f0f0', color: '#8c8c8c' }
    }
  }

  // 生成时间刻度
  const generateTimeScale = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = baseDate.add(slidePosition + i, 'day')
      dates.push({
        date: date.format('YYYY-MM-DD'),
        dayOfWeek: date.format('ddd'),
        dayOfMonth: date.format('D'),
        isToday: date.format('YYYY-MM-DD') === today,
        isWeekend: date.day() === 0 || date.day() === 6
      })
    }
    return dates
  }

  // 过滤项目
  const filteredProjects = projects.filter(project => 
    selectedStatuses.length === 0 || selectedStatuses.includes(project.status)
  )

  // 构建表格列
  const buildColumns = (): ColumnsType<GanttProject> => {
    const timeScale = generateTimeScale()
    
    const baseColumns: ColumnsType<GanttProject> = [
      {
        title: '项目信息',
        key: 'projectInfo',
        width: 280,
        fixed: 'left',
        render: (_, record) => (
          <div style={{ padding: '8px 0' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 8,
              gap: 8 
            }}>
              <div style={{ fontWeight: 500, fontSize: '14px' }}>
                {record.name}
              </div>
              <Tag 
                color={getStatusConfig(record.status).color}
                style={{ fontSize: '10px', padding: '0 4px' }}
              >
                {getStatusConfig(record.status).text}
              </Tag>
            </div>
            
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
              客户：{record.client}
            </div>
            
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
              负责人：{record.manager}
            </div>
            
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              工期：{dayjs(record.startDate).format('MM/DD')} - {dayjs(record.endDate).format('MM/DD')}
            </div>
          </div>
        ),
      }
    ]

    // 添加日期列
    const dateColumns = timeScale.map((timePoint) => ({
      title: (
        <div style={{ 
          textAlign: 'center',
          backgroundColor: timePoint.isToday ? '#e6f7ff' : timePoint.isWeekend ? '#fff2e8' : 'transparent',
          padding: '4px',
          borderRadius: '4px'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: timePoint.isToday ? '#1890ff' : '#8c8c8c',
            fontWeight: timePoint.isToday ? 'bold' : 'normal'
          }}>
            {timePoint.dayOfWeek}
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: timePoint.isToday ? '#1890ff' : '#000'
          }}>
            {timePoint.dayOfMonth}
          </div>
        </div>
      ),
      key: timePoint.date,
      width: 80,
      align: 'center' as const,
      render: (_, record: GanttProject) => {
        const task = record.schedule[timePoint.date] || { type: 'empty' }
        const isToday = timePoint.isToday
        
        const cellContent = (
          <div 
            style={{
              ...getTaskCellStyle(task),
              border: isToday ? '2px solid #1890ff' : '2px solid transparent',
              boxShadow: isToday ? '0 0 8px rgba(24, 144, 255, 0.3)' : 'none'
            }}
            onClick={() => onCellEdit(record.id, timePoint.date, task.type !== 'empty' ? task : undefined)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = isToday ? '0 0 8px rgba(24, 144, 255, 0.3)' : 'none'
            }}
          >
            {task.type === 'empty' ? '' : 
             task.type === 'notice' ? '!' : 
             task.count || task.type}
          </div>
        )

        if (task.note) {
          return (
            <Popover 
              content={task.note} 
              title="备注"
              trigger="hover"
            >
              {cellContent}
            </Popover>
          )
        }

        return cellContent
      },
    }))

    return [...baseColumns, ...dateColumns]
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Table
        columns={buildColumns()}
        dataSource={filteredProjects}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 1200 }}
        style={{ 
          backgroundColor: '#fff',
        }}
        rowClassName={(record, index) => 
          index % 2 === 0 ? 'gantt-row-even' : 'gantt-row-odd'
        }
      />
      
      {filteredProjects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 0',
          color: '#8c8c8c'
        }}>
          {selectedStatuses.length > 0 ? '没有符合筛选条件的项目' : '暂无项目数据'}
        </div>
      )}

      <style jsx>{`
        .gantt-row-even {
          background-color: #fafafa;
        }
        .gantt-row-odd {
          background-color: #ffffff;
        }
        .gantt-row-even:hover,
        .gantt-row-odd:hover {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  )
}

export default GanttTable 