# GitHub Desktop认证问题解决方案

## 🚨 问题描述
GitHub Desktop在发布分支时出现"Authentication failed"错误

## 🔧 解决步骤

### 步骤1：检查登录状态
1. 打开GitHub Desktop
2. 查看左上角是否显示你的用户名
3. 如果没有显示，需要重新登录

### 步骤2：重新配置认证
1. **菜单操作**：
   - Windows: File → Options → Accounts
   - Mac: GitHub Desktop → Preferences → Accounts

2. **退出当前账户**：
   - 点击"Sign out"

3. **重新登录**：
   - 点击"Sign in to GitHub.com"
   - 选择"Sign in using your browser"

### 步骤3：使用Personal Access Token
如果浏览器登录失败，使用Token登录：

1. **选择Token登录**：
   - 在登录界面选择"Sign in with token"
   
2. **输入Token信息**：
   - Token: `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`

### 步骤4：验证仓库权限
1. **检查仓库访问权限**：
   - 确认你有对 `natureni/nf-web` 仓库的写入权限
   
2. **刷新仓库列表**：
   - File → Add Local Repository
   - 重新添加你的项目目录

## 🎯 具体操作指南

### 在GitHub Desktop中发布分支：

1. **确认当前分支**：
   - 当前分支应该是 `20250708`
   
2. **点击Publish branch**：
   - 确认分支名称
   - 选择是否设为私有仓库
   
3. **如果仍然失败**：
   - 尝试先Fetch origin
   - 然后再Publish branch

## 🔄 备用方案：命令行发布

如果GitHub Desktop继续出现问题，可以使用命令行：

```bash
# 配置远程仓库
git remote set-url origin https://natureni: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@github.com/natureni/nf-web.git

# 推送分支
git push origin 20250708

# 设置上游分支
git push --set-upstream origin 20250708
```

## 💡 预防措施

### 定期更新Token
- Personal Access Token有过期时间
- 建议设置提醒定期更新

### 保存认证信息
- 在安全的地方保存Token
- 避免在代码中硬编码Token

## 🆘 如果问题持续存在

1. **重启GitHub Desktop**
2. **清除缓存**：
   - Windows: `%APPDATA%\GitHub Desktop`
   - Mac: `~/Library/Application Support/GitHub Desktop`
3. **重新安装GitHub Desktop**
4. **检查网络连接**

## 📞 联系支持

如果所有方法都失败：
- GitHub Support: https://support.github.com/
- 检查GitHub状态页面：https://www.githubstatus.com/

---

**记住**：Personal Access Token就像密码一样重要，要妥善保管！ 