# 🚀 效果图公司项目管理系统 - 环境依赖安装指南

## 📋 环境要求

### 基础环境
- **Node.js**: 16.0.0 或更高版本
- **npm**: 8.0.0 或更高版本 (推荐) 
- **yarn**: 1.22.0 或更高版本 (可选)

### 系统要求
- **操作系统**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **内存**: 最少 4GB RAM，推荐 8GB+
- **硬盘**: 至少 2GB 可用空间
- **浏览器**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

## 🚀 快速安装

### 1. 克隆项目
```bash
git clone https://github.com/your-username/NFLAB-WEB-MG.git
cd NFLAB-WEB-MG
```

### 2. 安装依赖
```bash
npm install
```

或使用 yarn:
```bash
yarn install
```

### 3. 启动开发服务器
```bash
npm run dev
```

或使用 yarn:
```bash
yarn dev
```

### 4. 访问应用
打开浏览器访问：http://localhost:5174

## 📦 依赖包说明

### 核心依赖
- **React 18**: 前端框架
- **TypeScript**: 类型安全
- **Ant Design 5**: UI组件库
- **React Router DOM 6**: 路由管理
- **Vite**: 构建工具

### 功能依赖
- **Recharts**: 数据可视化图表
- **dayjs**: 日期处理库
- **xlsx**: Excel文件处理
- **file-saver**: 文件下载
- **jsPDF**: PDF生成
- **html2canvas**: HTML转图片

### 开发依赖
- **@types/react**: React类型定义
- **@types/node**: Node.js类型定义
- **@types/file-saver**: file-saver类型定义
- **@vitejs/plugin-react**: Vite React插件

## 🛠 构建和部署

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 类型检查
```bash
npx tsc --noEmit
```

## 🔧 配置说明

### Vite配置 (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### TypeScript配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "node",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🎯 功能模块

### 核心页面
- **Dashboard**: 工作台概览 `/`
- **ProjectList**: 项目列表 `/projects`
- **ProjectGantt**: 甘特图 `/gantt`
- **ClientManagement**: 客户管理 `/clients`
- **FinanceOverview**: 财务管理 `/finance`
- **TeamManagement**: 团队管理 `/team`

### 数据结构
所有数据目前存储在组件状态中，包含：
- 22个示例项目
- 5个客户档案
- 20+团队成员
- 8个月财务数据
- 完整的合同模板

## 🔍 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 查看端口使用情况
netstat -ano | findstr :5174
# 或者修改端口
npm run dev -- --port 3000
```

**2. 依赖安装失败**
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**3. TypeScript 错误**
```bash
# 类型检查
npx tsc --noEmit
# 忽略某些错误可以在代码中添加
// @ts-ignore
```

**4. 构建失败**
```bash
# 检查依赖版本兼容性
npm ls
npm outdated
```

### 性能优化

**1. 开发环境优化**
- 使用 React Developer Tools
- 开启 Hot Module Replacement (HMR)
- 合理使用 React.memo 和 useMemo

**2. 生产环境优化**
- 启用代码分割
- 压缩资源文件
- 使用 CDN 加速

## 📚 开发指南

### 代码结构
```
src/
├── App.tsx              # 主应用组件
├── main.tsx             # 应用入口
├── index.css            # 全局样式
└── pages/               # 页面组件目录
    ├── Dashboard.tsx
    ├── ProjectList.tsx
    ├── ProjectGantt.tsx
    ├── ClientManagement.tsx
    ├── FinanceOverview.tsx
    ├── TeamManagement.tsx
    ├── CreateProject.tsx
    └── EditProject.tsx
```

### 开发规范
1. **组件命名**: 使用 PascalCase
2. **文件命名**: 使用 PascalCase
3. **变量命名**: 使用 camelCase
4. **常量命名**: 使用 UPPER_SNAKE_CASE
5. **类型定义**: 使用 interface 定义数据结构

### Git 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

## 🔐 安全注意事项

1. **数据安全**: 目前为演示系统，生产环境需要后端API
2. **身份验证**: 需要添加用户登录和权限管理
3. **数据校验**: 前端数据校验需要后端验证配合
4. **文件上传**: 需要限制文件类型和大小

## 📈 扩展功能

### 后端集成
- REST API 接口
- 数据库设计 (MySQL/PostgreSQL)
- 用户认证系统
- 文件存储服务

### 第三方集成
- 支付网关集成
- 邮件服务集成
- 短信通知服务
- 云存储服务

## 📞 技术支持

### 问题反馈
- 提交 Issue: GitHub Issues
- 技术交流: 创建 Discussion
- 文档建议: 提交 Pull Request

### 参考资源
- [React 官方文档](https://react.dev/)
- [Ant Design 官方文档](https://ant.design/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)

---

**系统版本**: v4.0  
**最后更新**: 2024-12-25  
**兼容性**: React 18, Node.js 16+ 