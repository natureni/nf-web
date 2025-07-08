@echo off
echo 开始备份到GitHub...

git config --global user.name "nature.n@nflab.cn"
git config --global user.email "nature.n@nflab.cn"

git add .
git commit -m "自动备份"

git remote set-url origin https://nature.n@nflab.cn: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@github.com/natureni/nf-web.git

git push origin 20250708

echo 备份完成！
pause 