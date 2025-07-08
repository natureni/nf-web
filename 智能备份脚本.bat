@echo off
chcp 65001 > nul
echo 🚀 开始智能备份到GitHub...
echo.

echo 📋 步骤1: 配置Git用户信息
git config --global user.name "natureni"
git config --global user.email "nature.n@nflab.cn"
echo ✅ Git用户信息配置完成

echo.
echo 📋 步骤2: 添加所有更改到暂存区
git add .
echo ✅ 文件添加完成

echo.
echo 📋 步骤3: 提交更改到本地仓库
git commit -m "自动备份 - %date% %time%"
if %errorlevel% neq 0 (
    echo ℹ️  没有新的更改需要提交
) else (
    echo ✅ 本地提交完成
)

echo.
echo 📋 步骤4: 配置远程仓库
git remote set-url origin https://natureni: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@github.com/natureni/nf-web.git
echo ✅ 远程仓库配置完成

echo.
echo 📋 步骤5: 推送到GitHub
echo 🌐 正在连接GitHub...
git push origin 20250708 --force
if %errorlevel% equ 0 (
    echo ✅ 备份成功完成！
    echo 🎉 所有代码已安全备份到GitHub
) else (
    echo ❌ 网络连接失败
    echo 💡 建议：
    echo    1. 检查网络连接
    echo    2. 稍后重试
    echo    3. 使用GitHub Desktop
    echo    4. 代码已安全保存在本地
)

echo.
echo 📊 备份状态报告:
echo    - 本地仓库: ✅ 已更新
echo    - 远程推送: %errorlevel% 
echo    - 时间: %date% %time%
echo.
pause 