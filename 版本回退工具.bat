@echo off
chcp 65001 > nul
echo 🔄 版本回退工具
echo ================
echo.

echo 📜 你的版本历史：
echo 1eb2f18 - 自动备份 - 添加GitHub备份脚本 (当前)
echo f570c74 - 客户管理和项目预算功能更新
echo fd2ed2e - 20250708-21.36
echo 6e3c20b - 20250708
echo 84a4793 - 更新 README.md
echo.

echo 🎯 常用回退操作：
echo 1. 回退到客户管理功能版本 (f570c74)
echo 2. 回退到昨天的版本 (fd2ed2e)
echo 3. 回退到main分支版本 (6e3c20b)
echo 4. 自定义版本号回退
echo 5. 查看当前状态
echo 6. 退出
echo.

set /p choice="请选择操作 (1-6): "

if "%choice%"=="1" (
    echo 回退到客户管理功能版本...
    git reset --soft f570c74
    echo ✅ 回退完成！现在在版本 f570c74
)

if "%choice%"=="2" (
    echo 回退到昨天的版本...
    git reset --soft fd2ed2e
    echo ✅ 回退完成！现在在版本 fd2ed2e
)

if "%choice%"=="3" (
    echo 回退到main分支版本...
    git reset --soft 6e3c20b
    echo ✅ 回退完成！现在在版本 6e3c20b
)

if "%choice%"=="4" (
    set /p version="请输入版本号（如：f570c74）: "
    git reset --soft %version%
    echo ✅ 回退完成！现在在版本 %version%
)

if "%choice%"=="5" (
    echo 📊 当前状态：
    git log --oneline -3
    echo.
    git status
)

if "%choice%"=="6" (
    echo 👋 再见！
    exit
)

echo.
echo 💡 提示：
echo - 这是软回退，所有更改都保留在暂存区
echo - 如果需要恢复，运行：git reset --hard origin/20250708
echo - 查看状态：git status
echo.
pause 