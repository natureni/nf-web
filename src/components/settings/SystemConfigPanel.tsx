import React from 'react'
import { Card, Alert } from 'antd'

const SystemConfigPanel: React.FC = () => {
  return (
    <Card title="系统配置" style={{ marginBottom: 24 }}>
      <Alert
        message="功能开发中"
        description="更多系统配置功能正在开发中，敬请期待。"
        type="info"
        showIcon
      />
    </Card>
  )
}

export default SystemConfigPanel 