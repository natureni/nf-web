import React from 'react'
import { Modal, Button, Upload, Divider } from 'antd'
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface ClientImportModalProps {
  visible: boolean
  onClose: () => void
  onImport: (file: File) => void
}

const ClientImportModal: React.FC<ClientImportModalProps> = ({
  visible,
  onClose,
  onImport
}) => {
  const downloadTemplate = () => {
    const templateData = [
      {
        '公司名称*': 'URBIS 澳洲城市规划设计公司',
        '联系人*': 'David Johnson 大卫·约翰逊',
        '职位*': 'Senior Partner 高级合伙人',
        '邮箱*': 'david.johnson@urbis.com.au',
        '电话*': '+61 7 3007 3800',
        '地区*': 'Asia-Pacific',
        '网站': 'https://urbis.com.au',
        '时区': 'AEST (UTC+10)',
        '语言': 'English,Mandarin',
        '业务类型': 'Urban Planning,Property Development,Architecture',
        '偏好风格': 'Modern,Commercial,Residential High-rise',
        '预算范围': '$200,000 - $500,000',
        '时间周期': '3-6 months',
        '沟通方式': 'Email + Video Call',
        '付款条款': 'Net 30',
        '付款方式': 'Wire Transfer',
        '货币': 'AUD',
        '信用评级': 'A',
        '客户标签': 'VIP客户,长期合作,大型项目',
        '状态': 'active',
        '备注': '重要客户，澳洲知名城市规划设计公司，项目质量要求高，付款及时。'
      },
      {
        '公司名称*': 'Bathurst Development Corp 巴瑟斯特开发公司',
        '联系人*': 'Sarah Mitchell 萨拉·米切尔',
        '职位*': 'Development Manager 开发经理',
        '邮箱*': 'sarah.mitchell@bathurst.com',
        '电话*': '+61 2 6331 8900',
        '地区*': 'Asia-Pacific',
        '网站': 'https://bathurst-development.com',
        '时区': 'AEST (UTC+10)',
        '语言': 'English',
        '业务类型': 'Real Estate,Commercial Development',
        '偏好风格': 'Contemporary,Mixed-use',
        '预算范围': '$150,000 - $300,000',
        '时间周期': '2-4 months',
        '沟通方式': 'Email + Phone',
        '付款条款': 'Net 45',
        '付款方式': 'Bank Transfer',
        '货币': 'AUD',
        '信用评级': 'B',
        '客户标签': '中型项目,稳定客户',
        '状态': 'active',
        '备注': '地区性开发商，项目规模适中，合作关系良好。'
      },
      {
        '公司名称*': 'NCCEC Group 中国建筑工程集团',
        '联系人*': 'Wang Lei 王磊',
        '职位*': 'Project Director 项目总监',
        '邮箱*': 'wang.lei@nccec.com.cn',
        '电话*': '+86 10 8888 9999',
        '地区*': 'Asia-Pacific',
        '网站': 'https://nccec.com.cn',
        '时区': 'CST (UTC+8)',
        '语言': 'Mandarin,English',
        '业务类型': 'Architecture,Public Architecture,Cultural Buildings',
        '偏好风格': 'Grand,Cultural,Exhibition',
        '预算范围': '$500,000+',
        '时间周期': '6-12 months',
        '沟通方式': 'WeChat + Email',
        '付款条款': 'Net 60',
        '付款方式': 'Wire Transfer',
        '货币': 'CNY',
        '信用评级': 'A',
        '客户标签': '国际客户,大型项目,文化建筑',
        '状态': 'active',
        '备注': '中国大型建筑集团，主要承接文化建筑和公共建筑项目。'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '客户信息模板')
    
    // 设置列宽
    const colWidths = [
      { wch: 35 }, // 公司名称
      { wch: 25 }, // 联系人
      { wch: 25 }, // 职位
      { wch: 30 }, // 邮箱
      { wch: 18 }, // 电话
      { wch: 15 }, // 地区
      { wch: 30 }, // 网站
      { wch: 18 }, // 时区
      { wch: 20 }, // 语言
      { wch: 40 }, // 业务类型
      { wch: 40 }, // 偏好风格
      { wch: 25 }, // 预算范围
      { wch: 15 }, // 时间周期
      { wch: 20 }, // 沟通方式
      { wch: 12 }, // 付款条款
      { wch: 15 }, // 付款方式
      { wch: 10 }, // 货币
      { wch: 12 }, // 信用评级
      { wch: 30 }, // 客户标签
      { wch: 12 }, // 状态
      { wch: 50 }  // 备注
    ]
    ws['!cols'] = colWidths

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, '客户信息导入模板.xlsx')
  }

  return (
    <Modal
      title="批量导入客户信息"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="template" icon={<FileExcelOutlined />} onClick={downloadTemplate}>
          下载模板
        </Button>,
      ]}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Upload
          accept=".xlsx,.xls"
          beforeUpload={onImport}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} size="large" type="dashed" style={{ height: 80, width: 200 }}>
            <div style={{ marginTop: 8 }}>
              <div>点击上传Excel文件</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                支持 .xlsx, .xls 格式
              </div>
            </div>
          </Button>
        </Upload>
        
        <Divider />
        
        <div style={{ textAlign: 'left' }}>
          <h4>📋 导入说明：</h4>
          <ul style={{ color: '#666', lineHeight: 1.8 }}>
            <li>请先下载Excel模板，按照模板格式填写客户信息</li>
            <li>必填字段标有 * 号，请确保填写完整</li>
            <li>地区字段请使用：Asia-Pacific、North-America、Europe、Middle-East、Other</li>
            <li>状态字段请使用：active、inactive、potential、blacklist</li>
            <li>信用评级请使用：A、B、C、D</li>
            <li>多个标签或类型请用英文逗号分隔</li>
            <li><strong>项目偏好字段：</strong></li>
            <ul style={{ marginLeft: 20, marginTop: 8 }}>
              <li>风格偏好：Modern、Commercial、Residential High-rise、Contemporary、Mixed-use、Grand、Cultural、Exhibition、Resort、Luxury Residential、Sports、Functional</li>
              <li>预算范围：$50,000 - $100,000、$100,000 - $250,000、$150,000 - $300,000、$200,000 - $500,000、$300,000 - $600,000、$500,000+</li>
              <li>时间周期：1-2 months、2-3 months、2-4 months、3-6 months、4-8 months、6-12 months、12+ months</li>
              <li>沟通方式：Email + Phone、Email + Video Call、Phone + Email、Video Call + Email、WeChat + Email、WhatsApp + Email</li>
            </ul>
            <li><strong>财务信息字段：</strong></li>
            <ul style={{ marginLeft: 20, marginTop: 8 }}>
              <li>付款条款：Net 15、Net 30、Net 45、Net 60、Net 90、COD、Prepaid</li>
              <li>付款方式：Wire Transfer、Bank Transfer、Credit Card、ACH Transfer、PayPal、Check</li>
              <li>币种：USD、AUD、CNY、EUR、GBP、HKD、SGD</li>
            </ul>
            <li><strong>项目历史数据：</strong>导入后可点击"从项目管理获取数据"按钮自动同步最新数据</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default ClientImportModal 