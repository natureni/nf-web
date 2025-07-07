import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, Row, Col } from 'antd'
import { TeamMember, DEPARTMENTS } from '../../types/team'

const { Option } = Select

interface TeamMemberFormProps {
  visible: boolean
  member: TeamMember | null
  onClose: () => void
  onSubmit: (values: any) => void
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  visible,
  member,
  onClose,
  onSubmit
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible && member) {
      form.setFieldsValue(member)
    } else if (visible) {
      form.resetFields()
    }
  }, [visible, member, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      onSubmit(values)
      form.resetFields()
      onClose()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  return (
    <Modal
      title={member ? '编辑团队成员' : '新增团队成员'}
      open={visible}
      onCancel={() => {
        onClose()
        form.resetFields()
      }}
      onOk={handleSubmit}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priceType: 'fixed',
          paymentCycle: 30,
          skills: []
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="department" label="部门" rules={[{ required: true, message: '请选择部门' }]}>
              <Select 
                placeholder="请选择部门"
                onChange={(value) => {
                  // 根据部门自动设置priceType
                  const dept = DEPARTMENTS.find(d => d.key === value)
                  if (dept && (dept.key === 'manager' || dept.key === 'sales')) {
                    form.setFieldsValue({ priceType: 'percentage' })
                  } else {
                    form.setFieldsValue({ priceType: 'fixed' })
                  }
                }}
              >
                {DEPARTMENTS.map(dept => (
                  <Option key={dept.key} value={dept.key}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="phone" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}>
              <Input placeholder="请输入联系方式" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item dependencies={['department']} noStyle>
              {({ getFieldValue }) => {
                const department = getFieldValue('department')
                const isPercentage = department === 'manager' || department === 'sales'
                
                return (
                  <Form.Item 
                    name="unitPrice" 
                    label={
                      isPercentage 
                        ? "项目金额百分比(%)" 
                        : department === 'rendering' || department === 'modeling'
                          ? "工作量单价(元/工作量)"
                          : "项目单价(元/项目)"
                    } 
                    rules={[{ required: true, message: '请输入单价' }]}
                  >
                    <InputNumber 
                      min={0} 
                      max={isPercentage ? 100 : undefined}
                      style={{ width: '100%' }} 
                      placeholder={
                        isPercentage 
                          ? "输入百分比，如：2" 
                          : "输入金额"
                      }
                    />
                  </Form.Item>
                )
              }}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="priceType" style={{ display: 'none' }}>
          <Input />
        </Form.Item>

        <Form.Item name="idCard" label="身份证信息" rules={[{ required: true, message: '请输入身份证信息' }]}>
          <Input placeholder="请输入身份证信息" />
        </Form.Item>

        <Form.Item name="bankInfo" label="打款信息" rules={[{ required: true, message: '请输入打款信息' }]}>
          <Input placeholder="银行名称 + 卡号" />
        </Form.Item>

        {/* 详细单价设置 */}
        <Form.Item dependencies={['department']} noStyle>
          {({ getFieldValue }) => {
            const department = getFieldValue('department')
            const isModelingOrRendering = department === 'modeling' || department === 'rendering'
            
            if (isModelingOrRendering) {
              return (
                <>
                  <div style={{ margin: '16px 0', fontWeight: 500, color: '#1890ff' }}>详细单价设置</div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="birdViewPrice" label="鸟瞰单价(元/张)">
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1000" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="humanViewPrice" label="人视角单价(元/张)">
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1200" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="animationPrice" label="动画单价(元/秒)">
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1500" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="customPrice" label="自定义单价(元)">
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="如: 1000" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )
            } else if (department === 'manager' || department === 'sales') {
              return (
                <>
                  <div style={{ margin: '16px 0', fontWeight: 500, color: '#1890ff' }}>提成比例设置</div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="birdViewPrice" label="鸟瞰提成比例(%)">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 1" step={0.01} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="humanViewPrice" label="人视角提成比例(%)">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 2" step={0.01} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="animationPrice" label="动画提成比例(%)">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 3" step={0.01} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="customPrice" label="自定义提成比例(%)">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如: 0.5" step={0.01} />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )
            }
            return null
          }}
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="paymentCycle" label="出图后打款周期(天)" rules={[{ required: true, message: '请输入打款周期' }]}>
              <InputNumber min={1} max={365} style={{ width: '100%' }} placeholder="请输入天数" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="skills" label="技能标签">
              <Select mode="tags" placeholder="输入技能标签">
                <Option value="3D Max">3D Max</Option>
                <Option value="Maya">Maya</Option>
                <Option value="SketchUp">SketchUp</Option>
                <Option value="Rhino">Rhino</Option>
                <Option value="V-Ray">V-Ray</Option>
                <Option value="Corona">Corona</Option>
                <Option value="Lumion">Lumion</Option>
                <Option value="Enscape">Enscape</Option>
                <Option value="Photoshop">Photoshop</Option>
                <Option value="After Effects">After Effects</Option>
                <Option value="Premiere">Premiere</Option>
                <Option value="项目管理">项目管理</Option>
                <Option value="客户沟通">客户沟通</Option>
                <Option value="团队协调">团队协调</Option>
                <Option value="质量控制">质量控制</Option>
                <Option value="客户开发">客户开发</Option>
                <Option value="商务谈判">商务谈判</Option>
                <Option value="合同管理">合同管理</Option>
                <Option value="市场分析">市场分析</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default TeamMemberForm 