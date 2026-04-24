# 华夏星河录 — 部署上线指南

## 🎉 项目已就绪！

本地开发服务器已在 `http://localhost:5173` 运行，项目代码位于：
```
C:\Users\ping\WorkBuddy\20260424001520\huaxia-stars
```

---

## ⚠️ 第三步：配置密钥（最关键！）

在部署之前，你需要在 `src/App.jsx` 中填入你自己的密钥。目前这两个都是空字符串，AI 对话和云端存储功能无法使用。

### 1. Gemini API Key（AI 对话功能）

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 点击 "Create API Key"
3. 复制生成的 Key

然后在 `src/App.jsx` 中找到以下位置，填入你的 Key：

```javascript
// 搜索这一行（约第 88 行附近）：
const apiKey = "";

// 替换为：
const apiKey = "你的Gemini_API_Key";
```

### 2. Firebase 配置（云端存储功能）

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击 "添加项目"，起个名字（如 `huaxia-stars`）
3. 项目创建后：
   - 左侧 **Build → Authentication** → 点击"开始" → 启用 **匿名(Anonymous)** 登录方式
   - 左侧 **Build → Firestore Database** → 点击"创建数据库" → 选择"测试模式"启动
4. 左上角 ⚙️ 项目设置 → 最底部"您的应用" → 点击 `</>` 添加 Web 应用
5. 复制给出的 `firebaseConfig` 对象

然后在 `src/App.jsx` 中找到以下位置（约第 70-80 行），替换配置：

```javascript
const firebaseConfig = {
    apiKey: "你从Firebase复制的apiKey",
    authDomain: "你的项目.firebaseapp.com",
    projectId: "你的项目ID",
    storageBucket: "你的项目.appspot.com",
    messagingSenderId: "你的senderId",
    appId: "你的appId"
};
```

> 💡 **注意**：如果不填 Firebase 配置，应用仍可正常运行（降级为本地模式），只是云端存储功能不可用。但 Gemini API Key 必须填写才能使用 AI 对话功能。

---

## 🚀 第四步：部署到 Vercel

### 方式 A：通过 GitHub 部署（推荐）

#### A1. 初始化 Git 并推送到 GitHub

```bash
cd C:\Users\ping\WorkBuddy\20260424001520\huaxia-stars

# 初始化 Git
git init
git add .
git commit -m "feat: 华夏星河录初始版本"

# 如果还没有 GitHub CLI，先安装：winget install GitHub.cli
# 然后登录：gh auth login

# 创建远程仓库并推送
gh repo create huaxia-stars --public --source=. --push
```

或者手动方式：
1. 在 [GitHub](https://github.com/new) 创建新仓库 `huaxia-stars`
2. 然后执行：
```bash
git remote add origin https://github.com/你的用户名/huaxia-stars.git
git push -u origin main
```

#### A2. 在 Vercel 部署

1. 访问 [vercel.com](https://vercel.com/) 并用 GitHub 账号登录
2. 点击 **"Add New..." → "Project"**
3. 找到 `huaxia-stars` 仓库，点击 **Import**
4. Framework Preset 会自动识别为 **Vite**，无需修改
5. 点击 **Deploy** 🎉

等待约 1 分钟，你会得到一个类似 `https://huaxia-stars.vercel.app` 的免费网址！

### 方式 B：通过 Vercel CLI 直接部署（无需 GitHub）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目目录下执行
cd C:\Users\ping\WorkBuddy\20260424001520\huaxia-stars
vercel

# 按提示操作即可（首次需要登录）
# 后续更新只需执行：vercel --prod
```

---

## 🌐 绑定自定义域名（可选）

如果你有自己的域名（如 `huaxia.yourname.com`）：

1. 在 Vercel 项目页面 → **Settings → Domains**
2. 输入你的域名，按提示配置 DNS
3. 在域名注册商那里添加 CNAME 记录指向 `cname.vercel-dns.com`

---

## 🔧 后续更新流程

代码修改后，只需：

```bash
cd C:\Users\ping\WorkBuddy\20260424001520\huaxia-stars
git add .
git commit -m "update: 更新描述"
git push
```

Vercel 会自动检测到更新并重新部署，约 1 分钟后生效。

---

## 📋 功能清单

| 功能 | 状态 | 说明 |
|------|------|------|
| 星图可视化 | ✅ | SVG 星空布局，人物按朝代分布 |
| 人物详情面板 | ✅ | 名字、朝代、简介、名言 |
| AI 对话 | ⚠️ 需密钥 | 需配置 Gemini API Key |
| 云端存储 | ⚠️ 需密钥 | 需配置 Firebase |
| 朝代/分类筛选 | ✅ | 7个朝代 + 7个分类 |
| 搜索功能 | ✅ | 支持名字/称号/简介搜索 |
| 时间线侧栏 | ✅ | 按出生年份排列 |
| 统计面板 | ✅ | 各朝代人物数量统计 |
| 动画效果 | ✅ | framer-motion 入场/交互动画 |
| 响应式设计 | ✅ | 桌面端 + 移动端自适应 |

---

## 📂 项目结构

```
huaxia-stars/
├── index.html          # 入口 HTML（含 Google 字体）
├── package.json        # 依赖配置
├── vite.config.js      # Vite 配置
├── src/
│   ├── main.jsx        # React 入口
│   ├── index.css       # 全局样式 + Tailwind
│   ├── App.jsx         # 主应用（所有组件）
│   └── App.css         # 预留样式文件
└── public/             # 静态资源
```

---

*祝你的华夏星河早日闪耀在互联网上！✦*
