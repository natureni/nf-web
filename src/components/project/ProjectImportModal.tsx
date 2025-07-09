import React, { useState } from 'react'
import { Modal, Button, Upload, Divider, message, Progress, Alert } from 'antd'
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import { Project, ProjectStatus, PaymentStatus } from '../../types/project'
import { getExchangeRate } from '../../utils/exchangeRates'

interface ProjectImportModalProps {
  open: boolean
  onClose: () => void
  onImportSuccess: (projects: Project[]) => void
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
  warnings: string[]
}

const ProjectImportModal: React.FC<ProjectImportModalProps> = ({
  open,
  onClose,
  onImportSuccess
}) => {
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // 验证项目状态
  const validateProjectStatus = (status: string): ProjectStatus | null => {
    const validStatuses: ProjectStatus[] = ['reporting', 'modeling', 'rendering', 'delivering', 'paused']
    return validStatuses.includes(status as ProjectStatus) ? status as ProjectStatus : null
  }

  // 验证付款状态
  const validatePaymentStatus = (status: string): PaymentStatus | null => {
    const validStatuses: PaymentStatus[] = ['unpaid', 'partial', 'completed', 'overdue']
    return validStatuses.includes(status as PaymentStatus) ? status as PaymentStatus : null
  }

  // 验证日期格式
  const validateDate = (dateStr: string): boolean => {
    const date = dayjs(dateStr, 'YYYY-MM-DD', true)
    return date.isValid()
  }

  // 生成唯一ID
  const generateProjectId = (protocolNumber: string): string => {
    return protocolNumber || `NF${Date.now().toString().slice(-6)}`
  }

  // 解析Excel文件
  const parseExcelFile = (file: File): Promise<Project[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          const projects: Project[] = []
          const errors: string[] = []
          const warnings: string[] = []

          // 获取现有项目以检查重复协议号
          const existingProjects = JSON.parse(localStorage.getItem('nflab_projects') || '[]')
          const existingProtocolNumbers = existingProjects.map((p: Project) => p.protocolNumber)

          jsonData.forEach((row: any, index: number) => {
            const rowNumber = index + 2 // Excel行号从2开始（包含表头）

            try {
              // 验证必填字段
              if (!row['项目名称*']) {
                errors.push(`第${rowNumber}行：项目名称不能为空`)
                return
              }
              if (!row['协议号*']) {
                errors.push(`第${rowNumber}行：协议号不能为空`)
                return
              }
              if (!row['客户名称*']) {
                errors.push(`第${rowNumber}行：客户名称不能为空`)
                return
              }
              if (!row['项目类型*']) {
                errors.push(`第${rowNumber}行：项目类型不能为空`)
                return
              }
              if (!row['预算金额*'] || row['预算金额*'] <= 0) {
                errors.push(`第${rowNumber}行：预算金额必须大于0`)
                return
              }
              if (!row['货币*']) {
                errors.push(`第${rowNumber}行：货币不能为空`)
                return
              }
              if (!row['截止日期*']) {
                errors.push(`第${rowNumber}行：截止日期不能为空`)
                return
              }

              // 检查协议号重复
              if (existingProtocolNumbers.includes(row['协议号*'])) {
                errors.push(`第${rowNumber}行：协议号"${row['协议号*']}"已存在`)
                return
              }

              // 验证项目状态
              const projectStatus = validateProjectStatus(row['项目状态'] || 'reporting')
              if (!projectStatus) {
                warnings.push(`第${rowNumber}行：项目状态无效，已设置为"报备中"`)
              }

              // 验证付款状态
              const paymentStatus = validatePaymentStatus(row['付款状态'] || 'unpaid')
              if (!paymentStatus) {
                warnings.push(`第${rowNumber}行：付款状态无效，已设置为"未付款"`)
              }

              // 验证日期
              if (!validateDate(row['截止日期*'])) {
                errors.push(`第${rowNumber}行：截止日期格式无效，请使用YYYY-MM-DD格式`)
                return
              }

              // 验证创建日期（如果提供）
              const createdAt = row['创建日期'] ? row['创建日期'] : dayjs().format('YYYY-MM-DD')
              if (row['创建日期'] && !validateDate(row['创建日期'])) {
                warnings.push(`第${rowNumber}行：创建日期格式无效，已使用当前日期`)
              }

              // 验证项目进度
              let progress = Number(row['项目进度']) || 0
              if (progress < 0 || progress > 100) {
                progress = 0
                warnings.push(`第${rowNumber}行：项目进度无效，已设置为0`)
              }

              // 验证已付金额
              const paidAmount = Number(row['已付金额']) || 0
              const budget = Number(row['预算金额*'])
              if (paidAmount > budget) {
                errors.push(`第${rowNumber}行：已付金额不能超过预算金额`)
                return
              }

              // 获取汇率
              const currency = row['货币*']
              const exchangeRate = getExchangeRate(currency)
              if (exchangeRate === 1 && currency !== 'CNY') {
                warnings.push(`第${rowNumber}行：货币"${currency}"汇率未找到，已使用默认汇率1`)
              }

              // 计算人民币预算
              const budgetCNY = budget * exchangeRate

              // 创建项目对象
              const project: Project = {
                id: generateProjectId(row['协议号*']),
                name: row['项目名称*'],
                protocolNumber: row['协议号*'],
                client: row['客户名称*'],
                type: row['项目类型*'],
                status: projectStatus || 'reporting',
                budget: budget,
                currency: currency,
                exchangeRate: exchangeRate,
                budgetCNY: budgetCNY,
                paymentStatus: paymentStatus || 'unpaid',
                paidAmount: paidAmount > 0 ? paidAmount : undefined,
                progress: progress,
                deadline: row['截止日期*'],
                createdAt: createdAt,
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
              }

              projects.push(project)
              existingProtocolNumbers.push(project.protocolNumber) // 添加到已存在列表中防止同批次重复

            } catch (error) {
              errors.push(`第${rowNumber}行：数据解析失败 - ${error}`)
            }
          })

          if (errors.length > 0) {
            reject({ errors, warnings, projects })
          } else {
            resolve(projects)
          }

        } catch (error) {
          reject({ errors: ['Excel文件解析失败'], warnings: [], projects: [] })
        }
      }

      reader.onerror = () => {
        reject({ errors: ['文件读取失败'], warnings: [], projects: [] })
      }

      reader.readAsArrayBuffer(file)
    })
  }

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    setImporting(true)
    setImportResult(null)

    try {
      const projects = await parseExcelFile(file)
      
      // 获取现有项目
      const existingProjects = JSON.parse(localStorage.getItem('nflab_projects') || '[]')
      const allProjects = [...existingProjects, ...projects]

      setImportResult({
        success: projects.length,
        failed: 0,
        errors: [],
        warnings: []
      })

      message.success(`成功导入 ${projects.length} 个项目！`)
      onImportSuccess(allProjects)

    } catch (result: any) {
      setImportResult({
        success: result.projects?.length || 0,
        failed: result.errors?.length || 0,
        errors: result.errors || [],
        warnings: result.warnings || []
      })

      if (result.projects?.length > 0) {
        message.warning(`部分导入成功：${result.projects.length} 个项目导入成功，${result.errors.length} 个失败`)
        
        // 获取现有项目
        const existingProjects = JSON.parse(localStorage.getItem('nflab_projects') || '[]')
        const allProjects = [...existingProjects, ...result.projects]
        onImportSuccess(allProjects)
      } else {
        message.error('导入失败，请检查数据格式')
      }
    } finally {
      setImporting(false)
    }

    return false // 阻止默认上传行为
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        '项目名称*': 'Sydney CBD Tower',
        '协议号*': 'NF2501',
        '客户名称*': 'Bathurst开发公司',
        '项目类型*': '商业综合体',
        '项目状态': 'reporting',
        '预算金额*': 45000,
        '货币*': 'AUD',
        '付款状态': 'unpaid',
        '已付金额': 0,
        '项目进度': 8,
        '截止日期*': '2025-03-15',
        '创建日期': '2025-01-20',
        '备注': '悉尼CBD核心区域的商业综合体项目'
      },
      {
        '项目名称*': 'Manhattan Office Complex',
        '协议号*': 'NF2502',
        '客户名称*': 'NCCEC集团',
        '项目类型*': '办公建筑',
        '项目状态': 'modeling',
        '预算金额*': 68000,
        '货币*': 'USD',
        '付款状态': 'partial',
        '已付金额': 20000,
        '项目进度': 35,
        '截止日期*': '2025-04-20',
        '创建日期': '2025-01-15',
        '备注': '曼哈顿高端办公建筑群项目'
      },
      {
        '项目名称*': '上海国际金融中心',
        '协议号*': 'NF2504',
        '客户名称*': 'Norwell置业',
        '项目类型*': '金融中心',
        '项目状态': 'delivering',
        '预算金额*': 278740,
        '货币*': 'CNY',
        '付款状态': 'completed',
        '已付金额': 278740,
        '项目进度': 95,
        '截止日期*': '2025-02-15',
        '创建日期': '2024-12-01',
        '备注': '上海浦东新区国际金融中心渲染项目'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目信息模板')
    
    // 设置列宽
    const colWidths = [
      { wch: 30 }, // 项目名称
      { wch: 15 }, // 协议号
      { wch: 25 }, // 客户名称
      { wch: 20 }, // 项目类型
      { wch: 12 }, // 项目状态
      { wch: 15 }, // 预算金额
      { wch: 10 }, // 货币
      { wch: 12 }, // 付款状态
      { wch: 15 }, // 已付金额
      { wch: 12 }, // 项目进度
      { wch: 15 }, // 截止日期
      { wch: 15 }, // 创建日期
      { wch: 40 }  // 备注
    ]
    ws['!cols'] = colWidths

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, '项目信息导入模板.xlsx')
  }

  const handleClose = () => {
    setImportResult(null)
    setImporting(false)
    onClose()
  }

  return (
    <Modal
      title="批量导入项目信息"
      open={open}
      onCancel={handleClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button key="template" icon={<FileExcelOutlined />} onClick={downloadTemplate}>
          下载模板
        </Button>,
      ]}
    >
      <div style={{ padding: '20px 0' }}>
        {/* 上传区域 */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Upload
            accept=".xlsx,.xls"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            disabled={importing}
          >
            <Button 
              icon={<UploadOutlined />} 
              size="large" 
              type="dashed" 
              style={{ height: 80, width: 200 }}
              loading={importing}
            >
              <div style={{ marginTop: 8 }}>
                <div>{importing ? '正在导入...' : '点击上传Excel文件'}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  支持 .xlsx, .xls 格式
                </div>
              </div>
            </Button>
          </Upload>
        </div>

        {/* 导入进度 */}
        {importing && (
          <div style={{ marginBottom: 20 }}>
            <Progress percent={50} status="active" showInfo={false} />
            <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
              正在解析Excel文件并验证数据...
            </div>
          </div>
        )}

        {/* 导入结果 */}
        {importResult && (
          <div style={{ marginBottom: 20 }}>
            <Alert
              message="导入结果"
              description={
                <div>
                  <p>✅ 成功导入：{importResult.success} 个项目</p>
                  {importResult.failed > 0 && <p>❌ 失败：{importResult.failed} 个项目</p>}
                  {importResult.warnings.length > 0 && (
                    <div>
                      <p style={{ color: '#faad14', marginTop: 8 }}>⚠️ 警告信息：</p>
                      <ul style={{ marginLeft: 20, color: '#faad14' }}>
                        {importResult.warnings.slice(0, 5).map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                        {importResult.warnings.length > 5 && (
                          <li>...还有 {importResult.warnings.length - 5} 条警告</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div>
                      <p style={{ color: '#f5222d', marginTop: 8 }}>❌ 错误信息：</p>
                      <ul style={{ marginLeft: 20, color: '#f5222d' }}>
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>...还有 {importResult.errors.length - 5} 条错误</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              }
              type={importResult.failed > 0 ? 'warning' : 'success'}
              showIcon
            />
          </div>
        )}
        
        <Divider />
        
        <div style={{ textAlign: 'left' }}>
          <h4>📋 导入说明：</h4>
          <ul style={{ color: '#666', lineHeight: 1.8 }}>
            <li>请先下载Excel模板，按照模板格式填写项目信息</li>
            <li>必填字段标有 * 号，请确保填写完整</li>
            <li>项目状态请使用：reporting、modeling、rendering、delivering、paused</li>
            <li>付款状态请使用：unpaid、partial、completed、overdue</li>
            <li>货币代码请使用：CNY、USD、EUR、GBP、AUD、CAD、SGD、HKD、JPY、KRW等</li>
            <li>日期格式请使用：YYYY-MM-DD（如：2025-03-15）</li>
            <li><strong>字段说明：</strong></li>
            <ul style={{ marginLeft: 20, marginTop: 8 }}>
              <li>项目状态：reporting(报备中)、modeling(建模)、rendering(渲染)、delivering(出图)、paused(暂停)</li>
              <li>付款状态：unpaid(未付款)、partial(部分付款)、completed(已付款)、overdue(逾期)</li>
              <li>项目进度：0-100的数字，表示完成百分比</li>
              <li>已付金额：当付款状态为partial时，填写已支付的金额</li>
              <li>货币：系统支持的货币代码，汇率将自动计算</li>
            </ul>
            <li><strong>数据验证：</strong></li>
            <ul style={{ marginLeft: 20, marginTop: 8 }}>
              <li>协议号必须唯一，不能与现有项目重复</li>
              <li>预算金额必须大于0</li>
              <li>项目进度范围：0-100</li>
              <li>已付金额不能超过预算金额</li>
              <li>截止日期不能早于创建日期</li>
            </ul>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export default ProjectImportModal 