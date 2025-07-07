import React from 'react'
import { Row, Col, Card, Button, Upload, Space, Divider } from 'antd'
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { MonthlyTrend, CostStructureData, FixedCost } from '../../types/finance'

const { Dragger } = Upload

interface FinanceChartsProps {
  monthlyTrends: MonthlyTrend[]
  costStructureData: CostStructureData[]
  fixedCosts: FixedCost[]
  uploadProps: any
  onDownloadTemplate: () => void
}

const FinanceCharts: React.FC<FinanceChartsProps> = ({
  monthlyTrends,
  costStructureData,
  fixedCosts,
  uploadProps,
  onDownloadTemplate
}) => {
  return (
    <div>
      {/* 收入趋势标签页内容 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>📈 收入趋势分析</h3>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="每月收入、成本、毛利润趋势" bordered={false}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `¥${(value as number / 10000).toFixed(1)}万`,
                      name === 'revenue' ? '收入' : name === 'cost' ? '成本' : '毛利润'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1890ff" name="收入" />
                  <Bar dataKey="cost" fill="#fa8c16" name="成本" />
                  <Bar dataKey="profit" fill="#52c41a" name="毛利润" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="利润率趋势" bordered={false}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrends.map(item => ({
                  ...item,
                  profitRate: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, '利润率']} />
                  <Line type="monotone" dataKey="profitRate" stroke="#722ed1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* 成本分析标签页内容 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>🥧 成本结构分析</h3>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="成本结构分析" bordered={false}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={costStructureData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {costStructureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`¥${(value as number).toLocaleString()}`, '金额']} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="月固定成本导入" bordered={false}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button icon={<DownloadOutlined />} onClick={onDownloadTemplate} style={{ marginBottom: 16 }}>
                    下载导入模版
                  </Button>
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽Excel/CSV文件到此区域上传</p>
                    <p className="ant-upload-hint">
                      支持单个文件上传，包含租金、水电、软件、设备等固定成本
                    </p>
                  </Dragger>
                </Space>
                
                {fixedCosts.length > 0 && (
                  <div style={{ marginTop: 16, textAlign: 'left' }}>
                    <h4>已导入的固定成本:</h4>
                    {fixedCosts.map((cost, index) => (
                      <div key={index} style={{ marginBottom: 8, padding: 8, background: '#f0f0f0', borderRadius: 4 }}>
                        <div><strong>{cost.month}月固定成本</strong></div>
                        <Row gutter={16} style={{ fontSize: 12, marginTop: 4 }}>
                          <Col span={8}>租金: ¥{cost.rent.toLocaleString()}</Col>
                          <Col span={8}>水电: ¥{cost.utilities.toLocaleString()}</Col>
                          <Col span={8}>软件: ¥{cost.software.toLocaleString()}</Col>
                        </Row>
                        <Row gutter={16} style={{ fontSize: 12, marginTop: 4 }}>
                          <Col span={8}>设备: ¥{cost.equipment.toLocaleString()}</Col>
                          <Col span={8}>保险: ¥{cost.insurance.toLocaleString()}</Col>
                          <Col span={8}>其他: ¥{cost.other.toLocaleString()}</Col>
                        </Row>
                        <div style={{ marginTop: 4, fontWeight: 500 }}>
                          总计: ¥{cost.total.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default FinanceCharts 