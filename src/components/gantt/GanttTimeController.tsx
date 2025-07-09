import React from 'react'
import { Button, DatePicker, Select, Slider, Space, Tag } from 'antd'
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

// 时间范围模式配置
const TIME_RANGE_MODES = [
  { label: '7天', value: 7, days: 7 },
  { label: '30天', value: 30, days: 30 },
  { label: '3个月', value: 90, days: 90 },
  { label: '6个月', value: 180, days: 180 },
  { label: '12个月', value: 365, days: 365 },
]

interface GanttTimeControllerProps {
  baseDate: dayjs.Dayjs
  timeRangeMode: number
  slidePosition: number
  onBaseDateChange: (date: dayjs.Dayjs) => void
  onTimeRangeModeChange: (mode: number) => void
  onSlidePositionChange: (position: number) => void
  onDateRangeChange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void
}

const GanttTimeController: React.FC<GanttTimeControllerProps> = ({
  baseDate,
  timeRangeMode,
  slidePosition,
  onBaseDateChange,
  onTimeRangeModeChange,
  onSlidePositionChange,
  onDateRangeChange
}) => {
  const currentMode = TIME_RANGE_MODES.find(mode => mode.value === timeRangeMode)
  const maxSlidePosition = Math.max(0, (currentMode?.days || 7) - 7)

  const getViewRange = () => {
    const startDate = baseDate.add(slidePosition, 'day')
    const endDate = startDate.add(6, 'day')
    return { startDate, endDate }
  }

  const getDateRangeText = () => {
    const { startDate, endDate } = getViewRange()
    const startMonth = startDate.format('M月')
    const endMonth = endDate.format('M月')
    
    if (startMonth === endMonth) {
      return `${startMonth}${startDate.format('D')}日-${endDate.format('D')}日`
    } else {
      return `${startDate.format('M月D日')}-${endDate.format('M月D日')}`
    }
  }

  const handlePrevWeek = () => {
    const newPosition = Math.max(0, slidePosition - 7)
    onSlidePositionChange(newPosition)
  }

  const handleNextWeek = () => {
    const newPosition = Math.min(maxSlidePosition, slidePosition + 7)
    onSlidePositionChange(newPosition)
  }

  const handleTodayClick = () => {
    const today = dayjs()
    const diffDays = today.diff(baseDate, 'day')
    
    if (diffDays >= 0 && diffDays < (currentMode?.days || 7)) {
      // 如果今天在当前时间范围内，调整滑块位置
      const newPosition = Math.max(0, Math.min(maxSlidePosition, diffDays - 3))
      onSlidePositionChange(newPosition)
    } else {
      // 否则重新设置基准日期
      onBaseDateChange(today.subtract(3, 'day'))
      onSlidePositionChange(0)
    }
  }

  return (
    <div style={{
      background: '#fff',
      padding: '16px 24px',
      borderRadius: 8,
      marginBottom: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 500 }}>时间视图：</span>
            <Select
              value={timeRangeMode}
              onChange={onTimeRangeModeChange}
              style={{ width: 120 }}
            >
              {TIME_RANGE_MODES.map(mode => (
                <Option key={mode.value} value={mode.value}>
                  {mode.label}
                </Option>
              ))}
            </Select>
          </div>
          
          <Button onClick={handleTodayClick} type="primary" ghost>
            回到今天
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#8c8c8c' }}>快速跳转：</span>
          <RangePicker
            value={[getViewRange().startDate, getViewRange().endDate]}
            onChange={onDateRangeChange}
            allowClear={false}
            style={{ width: 240 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          icon={<LeftOutlined />}
          onClick={handlePrevWeek}
          disabled={slidePosition === 0}
          size="small"
        >
          上一周
        </Button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ minWidth: 100, textAlign: 'center', fontWeight: 500 }}>
            {getDateRangeText()}
          </span>
          
          <Slider
            value={slidePosition}
            onChange={onSlidePositionChange}
            min={0}
            max={maxSlidePosition}
            step={1}
            style={{ flex: 1 }}
            tooltip={{
              formatter: (value) => {
                const date = baseDate.add(value || 0, 'day')
                return date.format('YYYY-MM-DD')
              }
            }}
          />
          
          <Tag color="blue">
            {slidePosition + 1}/{(currentMode?.days || 7) - 6}周
          </Tag>
        </div>

        <Button
          icon={<RightOutlined />}
          onClick={handleNextWeek}
          disabled={slidePosition >= maxSlidePosition}
          size="small"
        >
          下一周
        </Button>
      </div>
    </div>
  )
}

export default GanttTimeController 