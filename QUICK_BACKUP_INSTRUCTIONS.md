# 快速备份指南 - NFLAB-WEB-MG

## 🚀 一键备份命令

### 方法1：PowerShell一键命令（推荐）

在项目根目录打开PowerShell，运行以下命令：

#### 创建源码备份（不含node_modules，~3MB）
```powershell
$date = Get-Date -Format "yyyy-MM-dd-HHmm"; Compress-Archive -Path "src","public","package.json","package-lock.json","index.html","vite.config.ts","tsconfig.json","README.md","INSTALL.md","SYSTEM_BACKUP_2025-01-27.md","FILES_MANIFEST.md","BACKUP_GUIDE.md" -DestinationPath "NFLAB-WEB-MG-源码备份-$date.zip" -Force; Write-Host "备份完成: NFLAB-WEB-MG-源码备份-$date.zip" -ForegroundColor Green
```

#### 创建完整备份（含node_modules，~244MB）
```powershell
$date = Get-Date -Format "yyyy-MM-dd-HHmm"; Compress-Archive -Path "src","public","package.json","package-lock.json","index.html","vite.config.ts","tsconfig.json","README.md","INSTALL.md","SYSTEM_BACKUP_2025-01-27.md","FILES_MANIFEST.md","BACKUP_GUIDE.md","node_modules" -DestinationPath "NFLAB-WEB-MG-完整备份-$date.zip" -Force; Write-Host "备份完成: NFLAB-WEB-MG-完整备份-$date.zip" -ForegroundColor Green
```

### 方法2：使用自动化脚本

运行我们提供的批处理脚本：
```cmd
.\create-backup.bat
```

### 方法3：手动压缩（适用于所有系统）

1. **选择要备份的文件和文件夹：**
   ```
   必需文件：
   ✅ src/                 # 源代码目录
   ✅ public/              # 静态资源
   ✅ package.json         # 项目配置
   ✅ package-lock.json    # 依赖锁定
   ✅ index.html           # 入口页面
   ✅ vite.config.ts       # 构建配置
   ✅ tsconfig.json        # TypeScript配置
   ✅ README.md            # 项目文档
   
   可选文件：
   🔄 node_modules/        # 依赖包（244MB，可选）
   🔄 dist/                # 构建输出
   🔄 INSTALL.md           # 安装指南
   🔄 SYSTEM_BACKUP_2025-01-27.md  # 系统备份文档
   🔄 FILES_MANIFEST.md    # 文件清单
   🔄 BACKUP_GUIDE.md      # 备份指南
   🔄 .gitignore           # Git忽略规则
   ```

2. **压缩步骤：**
   - 按住Ctrl键，选择上述文件和文件夹
   - 右键选择"添加到压缩文件"（WinRAR）或"发送到 > 压缩文件夹"（Windows内置）
   - 命名为：`NFLAB-WEB-MG-完整备份-2025-01-27.zip`

## 📊 备份大小对比

| 备份类型 | 包含内容 | 文件大小 | 适用场景 |
|---------|----------|---------|---------|
| **源码备份** | src + 配置文件 | ~3MB | 版本控制、传输 |
| **完整备份** | 源码 + node_modules | ~244MB | 快速部署、恢复 |

## 🔄 恢复指南

### 源码备份恢复
```bash
# 1. 解压备份文件
unzip NFLAB-WEB-MG-源码备份-2025-01-27.zip

# 2. 进入目录
cd NFLAB-WEB-MG

# 3. 安装依赖
npm install

# 4. 启动项目
npm run dev
```

### 完整备份恢复
```bash
# 1. 解压备份文件
unzip NFLAB-WEB-MG-完整备份-2025-01-27.zip

# 2. 进入目录  
cd NFLAB-WEB-MG

# 3. 直接启动（无需安装依赖）
npm run dev
```

## ⚡ 快速创建脚本

如果你想要一个更简单的备份脚本，可以创建一个文件 `backup.ps1`：

```powershell
# 简单备份脚本
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupName = "NFLAB-WEB-MG-Backup-$timestamp.zip"

# 基本文件列表
$files = @(
    "src", "public", "package.json", "package-lock.json", 
    "index.html", "vite.config.ts", "tsconfig.json", "README.md"
)

# 添加可选文件
$optionalFiles = @(
    "INSTALL.md", "SYSTEM_BACKUP_2025-01-27.md", 
    "FILES_MANIFEST.md", "BACKUP_GUIDE.md", "dist"
)

foreach ($file in $optionalFiles) {
    if (Test-Path $file) {
        $files += $file
    }
}

# 询问是否包含node_modules
$includeNodeModules = Read-Host "Include node_modules? (y/n)"
if ($includeNodeModules -eq "y") {
    $files += "node_modules"
    $backupName = "NFLAB-WEB-MG-Complete-$timestamp.zip"
}

# 创建备份
Compress-Archive -Path $files -DestinationPath $backupName -Force
Write-Host "Backup created: $backupName" -ForegroundColor Green
```

然后运行：
```powershell
.\backup.ps1
```

## 💡 备份建议

1. **定期备份**：建议每周创建一次完整备份
2. **多重存储**：将备份保存到多个位置
3. **版本命名**：使用日期时间命名便于管理
4. **测试恢复**：定期验证备份文件的完整性

---

**快速备份指南版本**: v1.0  
**最后更新**: 2025-01-27  
**兼容系统**: Windows / Linux / Mac 