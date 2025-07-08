@echo off
chcp 65001 > nul
echo 🔧 修复GitHub Desktop认证问题
echo ================================
echo.

echo 📋 步骤1: 关闭GitHub Desktop进程
echo 正在关闭GitHub Desktop...
taskkill /f /im "GitHubDesktop.exe" 2>nul
if %errorlevel% equ 0 (
    echo ✅ GitHub Desktop已关闭
) else (
    echo ℹ️ GitHub Desktop未运行或已关闭
)
echo.

echo 📋 步骤2: 清除GitHub Desktop缓存
echo 正在清除缓存文件...
if exist "%APPDATA%\GitHub Desktop" (
    rd /s /q "%APPDATA%\GitHub Desktop\logs" 2>nul
    rd /s /q "%APPDATA%\GitHub Desktop\databases" 2>nul
    echo ✅ 缓存清除完成
) else (
    echo ℹ️ 缓存目录不存在
)
echo.

echo 📋 步骤3: 清除Git凭据
echo 正在清除Git凭据...
git config --global --unset credential.helper
cmdkey /delete:LegacyGeneric:target=git:https://github.com 2>nul
echo ✅ Git凭据清除完成
echo.

echo 📋 步骤4: 重新配置Git
echo 正在配置Git用户信息...
git config --global user.name "natureni"
git config --global user.email "nature.n@nflab.cn"
git config --global credential.helper manager
echo ✅ Git配置完成
echo.

echo 📋 步骤5: 配置项目远程仓库
echo 正在配置远程仓库...
git remote set-url origin https://github.com/natureni/nf-web.git
echo ✅ 远程仓库配置完成
echo.

echo 🚀 修复完成！请按以下步骤操作：
echo.
echo 1. 重新打开GitHub Desktop
echo 2. 点击 File → Options → Accounts
echo 3. 点击 "Sign in to GitHub.com"
echo 4. 使用以下信息登录：
echo    用户名: natureni
echo    密码: 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
echo.
echo 5. 登录后，重新添加仓库：
echo    File → Add Local Repository
echo    选择目录: %CD%
echo.
echo 6. 然后尝试Publish branch
echo.
echo 💡 如果仍然失败，请使用命令行方式推送！
echo.
pause 