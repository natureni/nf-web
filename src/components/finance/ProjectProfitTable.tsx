import React from 'react'
import { Card, Table, Button, Progress, Tag } from 'antd'
import { TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ProjectCost } from '../../types/finance'

interface ProjectProfitTableProps {
  projectCostAnalysis: ProjectCost[]
  selectedPeriod: string
  onSetSelectedPeriod: (period: string) => void
}

const ProjectProfitTable: React.FC<ProjectProfitTableProps> = ({
  projectCostAnalysis,
  selectedPeriod,
  onSetSelectedPeriod
}) => {
  const costAnalysisColumns: ColumnsType<ProjectCost> = [
    {
      title: '项目信息',
      key: 'projectInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.projectName}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.client} | {record.projectId}
          </div>
        </div>
      ),
    },
    {
      title: '项目金额',
      dataIndex: 'totalBudget',
      key: 'totalBudget',
      width: 120,
      render: (amount: number) => (
        <div style={{ color: '#1890ff', fontWeight: 500 }}>
          ¥{(amount / 10000).toFixed(1)}万
        </div>
      ),
    },
    {
      title: '成本明细',
      key: 'costDetails',
      width: 300,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>项目经理: ¥{record.projectManagerCost.toLocaleString()}</div>
          <div>模型: ¥{record.modelingCost.toLocaleString()}</div>
          <div>渲染: ¥{record.renderingCost.toLocaleString()}</div>
          <div>销售: ¥{record.salesCost.toLocaleString()}</div>
          <div>固定成本: ¥{record.fixedCost.toLocaleString()}</div>
        </div>
      ),
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      render: (cost: number) => (
        <div style={{ color: '#fa8c16', fontWeight: 500 }}>
          ¥{(cost / 10000).toFixed(1)}万
        </div>
      ),
    },
    {
      title: '毛利润',
      dataIndex: 'grossProfit',
      key: 'grossProfit',
      width: 120,
      render: (profit: number) => (
        <div style={{ color: profit > 0 ? '#52c41a' : '#f5222d', fontWeight: 500 }}>
          ¥{(profit / 10000).toFixed(1)}万
        </div>
      ),
    },
    {
      title: '利润率',
      dataIndex: 'profitMargin',
      key: 'profitMargin',
      width: 120,
      render: (margin: number) => (
        <div>
          <Progress
            percent={margin}
            size="small"
            status={margin >= 30 ? 'success' : margin >= 20 ? 'active' : 'exception'}
            format={() => `${margin.toFixed(1)}%`}
          />
        </div>
      ),
    },
    {
      title: '回款状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          unpaid: { color: 'default', text: '未付款' },
          partial: { color: 'warning', text: '部分付款' },
          completed: { color: 'success', text: '已完成' },
          overdue: { color: 'error', text: '逾期' }
        }
        return (
          <Tag color={statusConfig[status as keyof typeof statusConfig].color}>
            {statusConfig[status as keyof typeof statusConfig].text}
          </Tag>
        )
      },
    },
  ]

  return (
    <Card title={`${selectedPeriod} 已出图项目利润分析`} bordered={false}>
      {projectCostAnalysis.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
          <TeamOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <div>当前月份暂无已出图项目</div>
          <div style={{ marginTop: 8 }}>请选择有完成项目的月份查看利润分析</div>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => onSetSelectedPeriod('2025-01')}>
              查看2025年1月数据
            </Button>
          </div>
        </div>
      ) : (
        <Table
          columns={costAnalysisColumns}
          dataSource={projectCostAnalysis}
          rowKey="projectId"
          pagination={false}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>合计</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong style={{ color: '#1890ff' }}>
                    ¥{(projectCostAnalysis.reduce((sum, p) => sum + p.totalBudget, 0) / 10000).toFixed(1)}万
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
                <Table.Summary.Cell index={3}>
                  <strong style={{ color: '#fa8c16' }}>
                    ¥{(projectCostAnalysis.reduce((sum, p) => sum + p.totalCost, 0) / 10000).toFixed(1)}万
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <strong style={{ color: '#52c41a' }}>
                    ¥{(projectCostAnalysis.reduce((sum, p) => sum + p.grossProfit, 0) / 10000).toFixed(1)}万
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} />
                <Table.Summary.Cell index={6} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      )}
    </Card>
  )
}

export default ProjectProfitTable 