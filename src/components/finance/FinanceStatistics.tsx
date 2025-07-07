import React from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { DollarOutlined, TrophyOutlined } from '@ant-design/icons'
import { MonthlyFinance, TimePeriod } from '../../types/finance'

interface FinanceStatisticsProps {
  monthlyFinance: MonthlyFinance
  timePeriod: TimePeriod
  completedProjectsCount: number
  profitMargin: number
}

const FinanceStatistics: React.FC<FinanceStatisticsProps> = ({
  monthlyFinance,
  timePeriod,
  completedProjectsCount,
  profitMargin
}) => {
  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'month': return '本月'
      case 'quarter': return '本季度'
      case 'halfYear': return '本期'
      case 'year': return '本年'
      default: return '本月'
    }
  }

  const periodLabel = getPeriodLabel()

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`${periodLabel}出图项目收入`}
            value={monthlyFinance.revenue}
            prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
            suffix="元"
            valueStyle={{ color: '#52c41a' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            出图项目: {completedProjectsCount} 个
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`${periodLabel}出图项目成本`}
            value={monthlyFinance.cost}
            prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
            suffix="元"
            valueStyle={{ color: '#fa8c16' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            成本率: {monthlyFinance.revenue > 0 ? ((monthlyFinance.cost / monthlyFinance.revenue) * 100).toFixed(1) : 0}%
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`${periodLabel}毛利润`}
            value={monthlyFinance.profit}
            prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
            suffix="元"
            valueStyle={{ color: '#1890ff' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            利润贡献: ¥{(monthlyFinance.profit / 10000).toFixed(1)}万
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title={`${periodLabel}毛利润率`}
            value={profitMargin}
            prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
            suffix="%"
            precision={1}
            valueStyle={{ color: '#722ed1' }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            {profitMargin >= 30 ? '优秀' : profitMargin >= 20 ? '良好' : '需改善'}
          </div>
        </Card>
      </Col>
    </Row>
  )
}

export default FinanceStatistics 