import React from 'react'
import { 
  Modal, 
  Tabs, 
  Descriptions, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Divider 
} from 'antd'
import { 
  ProjectOutlined, 
  HeartOutlined 
} from '@ant-design/icons'
import { Client, RegionConfig } from '../../types/client'

const { TabPane } = Tabs

interface ClientDetailModalProps {
  visible: boolean
  client: Client | null
  onClose: () => void
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  visible,
  client,
  onClose
}) => {
  if (!client) return null

  const regionConfig: RegionConfig = {
    'Asia-Pacific': { text: 'Asia-Pacific 亚太地区', color: 'blue' },
    'North-America': { text: 'North-America 北美', color: 'green' },
    'Europe': { text: 'Europe 欧洲', color: 'purple' },
    'Middle-East': { text: 'Middle-East 中东', color: 'orange' },
    'Other': { text: 'Other 其他', color: 'default' }
  }

  return (
    <Modal
      title={`客户详情 - ${client.companyName}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <Tabs defaultActiveKey="basic" size="large">
        <TabPane tab="基本信息 / Basic Info" key="basic">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="公司名称 / Company" span={2}>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{client.companyName}</div>
            </Descriptions.Item>
            <Descriptions.Item label="联系人 / Contact">
                <div style={{ fontWeight: 500 }}>{client.contactPerson}</div>
            </Descriptions.Item>
            <Descriptions.Item label="职位 / Title">
                <div>{client.title}</div>
            </Descriptions.Item>
            <Descriptions.Item label="邮箱 / Email">
              <a href={`mailto:${client.email}`}>{client.email}</a>
            </Descriptions.Item>
            <Descriptions.Item label="电话 / Phone">
              <a href={`tel:${client.phone}`}>{client.phone}</a>
            </Descriptions.Item>
            <Descriptions.Item label="网站 / Website">
              {client.website ? (
                <a href={client.website} target="_blank" rel="noopener noreferrer">
                  {client.website}
                </a>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="地区 / Region">
              <Tag color={regionConfig[client.region].color}>
                {regionConfig[client.region].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="时区 / Timezone">
              {client.timezone}
            </Descriptions.Item>
            <Descriptions.Item label="语言 / Languages">
              {client.language.map(lang => (
                <Tag key={lang} color="blue" style={{ marginBottom: 4 }}>{lang}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="业务类型 / Business Type">
              {client.businessType.map(type => (
                <Tag key={type} color="green" style={{ marginBottom: 4 }}>
                  {type}
                </Tag>
              ))}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="项目偏好 / Preferences" key="preferences">
          <Card size="small" title="项目偏好设置 / Project Preferences">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="风格偏好 / Style Preferences">
                <div style={{ marginTop: 8 }}>
                  {client.projectPreferences.style.map(style => (
                    <Tag key={style} color="purple" icon={<HeartOutlined />} style={{ marginBottom: 4 }}>
                      {style}
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="预算范围 / Budget Range">
                <Tag color="gold" style={{ fontSize: 13 }}>
                  {Array.isArray(client.projectPreferences.budget) 
                    ? client.projectPreferences.budget.join(', ') 
                    : client.projectPreferences.budget}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="时间周期 / Timeline">
                <Tag color="cyan" style={{ fontSize: 13 }}>
                  {Array.isArray(client.projectPreferences.timeline) 
                    ? client.projectPreferences.timeline.join(', ') 
                    : client.projectPreferences.timeline}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="沟通方式 / Communication">
                <Tag color="orange" style={{ fontSize: 13 }}>
                  {Array.isArray(client.projectPreferences.communication) 
                    ? client.projectPreferences.communication.join(', ') 
                    : client.projectPreferences.communication}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab="项目历史 / Project History" key="history">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic 
                title="总项目数 / Total Projects" 
                value={client.projectHistory.total}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="完成项目 / Completed" 
                value={client.projectHistory.completed}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="进行中 / Ongoing" 
                value={client.projectHistory.ongoing}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="项目总价值 / Total Value" 
                value={client.projectHistory.value}
                precision={0}
                prefix="$"
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="circle" 
                  percent={Math.round((client.projectHistory.completed / client.projectHistory.total) * 100)}
                  format={(percent) => `完成率 ${percent}%`}
                  strokeColor="#52c41a"
                  size={120}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="circle" 
                  percent={Math.round((client.projectHistory.ongoing / client.projectHistory.total) * 100)}
                  format={(percent) => `进行中 ${percent}%`}
                  strokeColor="#fa8c16"
                  size={120}
                />
              </div>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="财务信息 / Financial Info" key="financial">
          <Card size="small" title="付款信息 / Payment Information">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="付款条款 / Payment Terms">
                {client.paymentInfo.terms}
              </Descriptions.Item>
              <Descriptions.Item label="付款方式 / Payment Method">
                {client.paymentInfo.method}
              </Descriptions.Item>
              <Descriptions.Item label="币种 / Currency">
                {client.paymentInfo.currency}
              </Descriptions.Item>
              <Descriptions.Item label="信用评级 / Credit Rating">
                <Tag color={
                  client.paymentInfo.creditRating === 'A' ? 'green' :
                  client.paymentInfo.creditRating === 'B' ? 'blue' :
                  client.paymentInfo.creditRating === 'C' ? 'orange' : 'red'
                }>
                  {client.paymentInfo.creditRating}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>

        <TabPane tab="其他信息 / Other Info" key="other">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="客户标签 / Tags">
              {client.tags.map(tag => (
                <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                  {tag}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="备注 / Notes">
              {client.notes || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间 / Created At">
              {client.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="最后联系 / Last Contact">
              {client.lastContact}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default ClientDetailModal 