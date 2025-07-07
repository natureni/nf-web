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
        '公司名称(英文)*': 'Company Name Ltd',
        '公司名称(中文)': '公司中文名',
        '联系人(英文)*': 'Contact Person',
        '联系人(中文)': '联系人中文名',
        '职位(英文)': 'Job Title',
        '职位(中文)': '职位中文',
        '邮箱*': 'email@company.com',
        '电话': '+61 7 3007 3800',
        '传真': '+61 7 3007 3801',
        '网站': 'https://company.com',
        '企业注册地址-街道*': 'Level 15, 500 Queen Street',
        '企业注册地址-城市*': 'Brisbane',
        '企业注册地址-州/省': 'QLD',
        '企业注册地址-邮编': '4000',
        '企业注册地址-国家*': 'Australia',
        '地区': 'Asia-Pacific',
        '时区': 'AEST (UTC+10)',
        '语言': 'English,Mandarin',
        '业务类型': 'Real Estate,Commercial Development',
        '风格偏好': 'Modern,Commercial,Residential High-rise',
        '预算范围': '$200,000 - $500,000',
        '时间周期': '3-6 months',
        '沟通方式': 'Email + Video Call',
        '付款条款': 'Net 30',
        '付款方式': 'Wire Transfer',
        '币种': 'AUD',
        '信用评级': 'A',
        '受益人银行名称*': 'Commonwealth Bank of Australia',
        '受益人银行地址*': '240 Queen Street, Brisbane QLD 4000',
        '受益人银行代码*': '062',
        'SWIFT代码*': 'CTBAAU2S',
        '受益人账户名称*': 'Company Name Pty Ltd',
        '受益人账户号码*': '062-001-12345678',
        '客户标签': 'VIP客户,长期合作',
        '客户状态': 'active',
        '备注': '重要客户，需要优先处理'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '客户信息模板')
    
    // 设置列宽
    const colWidths = [
      { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
      { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 35 }, { wch: 15 },
      { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 30 }
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