@echo off
chcp 65001 > nul
echo 🚀 发布分支到GitHub
echo ==================
echo.

echo 📋 当前状态：
git branch --show-current
git status --porcelain
echo.

echo 🔧 配置远程仓库认证...
git remote set-url origin https://natureni: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@github.com/natureni/nf-web.git

echo 📤 推送分支到GitHub...
git push --set-upstream origin 20250708

if %errorlevel% equ 0 (
    echo ✅ 分支发布成功！
    echo 🌐 现在可以在GitHub上看到你的分支
    echo 📱 访问：https://github.com/natureni/nf-web/tree/20250708
) else (
    echo ❌ 发布失败
    echo 💡 建议：
    echo    1. 检查网络连接
    echo    2. 确认Token是否有效
    echo    3. 使用GitHub Desktop重新登录
)

echo.
pause 