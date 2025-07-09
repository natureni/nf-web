import React from 'react'
import { Modal, Form, Input, Select, Row, Col, Button, message } from 'antd'
import { User } from '../../types/auth'

const { Option } = Select

interface UserEditModalProps {
  visible: boolean
  user: User | null
  form: any
  onCancel: () => void
  onSave: (values: any) => void
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  visible,
  user,
  form,
  onCancel,
  onSave
}) => {
  const handleResetPassword = () => {
    if (!user) return
    
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置用户"${user.name}"的密码吗？新密码将发送至用户邮箱。`,
      onOk: () => {
        message.success(`密码重置成功！新密码已发送至 ${user.email}`)
      }
    })
  }

  const handleSave = () => {
    form.validateFields().then((values: any) => {
      onSave(values)
      message.success('用户信息更新成功')
    }).catch((error: any) => {
      console.error('表单验证失败:', error)
    })
  }

  const isCreateMode = !user

  return (
    <Modal
      title={isCreateMode ? "新增用户" : "编辑用户"}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        ...(isCreateMode ? [] : [
          <Button key="reset-password" onClick={handleResetPassword}>
            重置密码
          </Button>
        ]),
        <Button key="save" type="primary" onClick={handleSave}>
          {isCreateMode ? "创建用户" : "保存更改"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="用户名" 
              name="username"
              rules={isCreateMode ? [
                { required: true, message: '请输入用户名' },
                { min: 4, max: 20, message: '用户名长度为4-20位' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
              ] : []}
            >
              <Input 
                placeholder="请输入用户名" 
                disabled={!isCreateMode}
                style={!isCreateMode ? { color: '#8c8c8c' } : {}}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="姓名" 
              name="name"
              rules={[
                { required: true, message: '请输入姓名' },
                { max: 50, message: '姓名不能超过50个字符' }
              ]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          label="邮箱" 
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' }
          ]}
        >
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>

        {isCreateMode && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="初始密码" 
                name="password" 
                rules={[
                  { required: true, message: '请输入初始密码' },
                  { min: 6, max: 20, message: '密码长度为6-20位' },
                  { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含字母和数字' }
                ]}
              >
                <Input.Password placeholder="请输入初始密码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="确认密码" 
                name="confirmPassword" 
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入密码" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="角色" 
              name="role"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择角色">
                {!isCreateMode && <Option value="admin">系统管理员</Option>}
                <Option value="project_manager">项目经理</Option>
                <Option value="modeler">模型师</Option>
                <Option value="renderer">渲染师</Option>
                <Option value="sales">销售人员</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="部门" 
              name="department"
              rules={[{ required: true, message: '请选择部门' }]}
            >
              <Select placeholder="请选择部门">
                <Option value="管理层">管理层</Option>
                <Option value="项目管理部">项目管理部</Option>
                <Option value="建模部">建模部</Option>
                <Option value="渲染部">渲染部</Option>
                <Option value="销售部">销售部</Option>
                <Option value="行政部">行政部</Option>
                <Option value="财务部">财务部</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {!isCreateMode && (
          <Form.Item 
            label="状态" 
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        )}

        <div style={{ 
          background: isCreateMode ? '#f6ffed' : '#fff7e6', 
          border: isCreateMode ? '1px solid #b7eb8f' : '1px solid #ffd591', 
          borderRadius: 6, 
          padding: 12, 
          marginTop: 16 
        }}>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 500, 
            color: isCreateMode ? '#52c41a' : '#d46b08', 
            marginBottom: 8 
          }}>
            {isCreateMode ? '📧 密码安全提醒' : '🔐 密码管理说明'}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {isCreateMode ? (
              <>
                • 用户创建成功后，初始密码将通过邮件发送给用户<br/>
                • 建议用户首次登录后立即修改密码<br/>
                • 邮箱将用于密码找回功能，请确保邮箱有效
              </>
            ) : (
              <>
                • 点击"重置密码"按钮可为用户生成新密码<br/>
                • 新密码将通过邮件发送至用户邮箱<br/>
                • 建议用户收到新密码后立即登录并修改
              </>
            )}
          </div>
        </div>
      </Form>
    </Modal>
  )
}

export default UserEditModal 