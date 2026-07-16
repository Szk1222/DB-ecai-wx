# 标贝易采 — 数据采集小程序原型 Plan

## Context

用户需要构建「标贝易采」ToC 数据采集平台的交互原型，覆盖 P1 用户端 + P2 运营后台范围。
参考图片提供了主色调（Teal 绿 `#3DBFA0`）和整体 UI 风格（微信小程序风格，移动端优先）。
当前项目是空白的 Figma Make 项目，已有 shadcn/ui + Radix UI + Tailwind v4 + React Router 7 等基础设施。

### 技术栈定位（已确认）

| 层级 | 最终生产技术栈 | 本原型的实现方式 |
|---|---|---|
| 用户端 | 微信原生小程序 + TypeScript + WXML/WXSS | **Web 高保真仿小程序模拟器**（React + Tailwind，390px 容器，遵循微信 UI 规范） |
| UI 组件 | TDesign MiniProgram | shadcn/ui + 自定义组件，色彩/间距对齐 TDesign 设计令牌 |
| 运营后台 | React + TypeScript + Ant Design Pro | **React + antd**（需安装 antd + @ant-design/icons），标准 Pro Layout |
| 业务后台 | Java 21 + Spring Boot 3 模块化单体 | 全 Mock 数据，原型不涉及真实 API |

> **原型价值**：用于需求冻结前的 UI/交互走查，直接交付给微信小程序和后台开发团队作为视觉与逻辑参考，不作为生产代码复用。

---

## 目标

构建一个可交互的高保真原型，覆盖：
- **用户端**：登录注册 → 任务大厅 → 任务详情 → 多模态采集 → 审核进度 → 积分/提现 → 邀请 → 个人中心
- **运营后台**：项目任务管理 → 质检工作台 → 用户标签 → 结算看板

---

## 颜色体系

参考 UI 图，更新 `src/styles/theme.css` 中的 CSS 变量：

| Token | 用途 | 值 |
|---|---|---|
| `--primary` | 主色（Teal） | `#3DBFA0` |
| `--primary-dark` | 深色背景区（Header） | `#2E3D4F` |
| `--primary-foreground` | 主色按钮上文字 | `#ffffff` |
| `--background` | 页面背景 | `#F5F6F8` |
| `--card` | 卡片背景 | `#ffffff` |

---

## 架构设计

### 整体结构
```
src/app/App.tsx              — Router 根 + 状态上下文（auth/tab）
src/app/context/
  AppContext.tsx             — 全局状态（用户、积分、任务、tab）
src/app/data/
  mockData.ts               — 全量 Mock 数据（任务/积分/邀请/质检/结算）
src/app/components/
  layout/
    MobileShell.tsx          — 390×844px 手机容器（居中，圆角边框，状态栏）
    BottomNav.tsx            — 底部双 Tab（任务 / 我的），Teal 激活
  screens/user/              ← 仿微信小程序，运行在 MobileShell 内
    OnboardingScreen.tsx     — 登录注册 + 服务协议弹窗（与参考图一致）
    TaskHall.tsx             — 任务大厅（推荐/公开/定向 Tabs + 搜索）
    TaskDetail.tsx           — 任务详情 + 资格要求 + 领取按钮
    MyTasks.tsx              — 已做任务（状态 Tabs：进行中/审核中/通过/返工）
    CollectVoice.tsx         — 语音采集（波形动画 + 录制控制 + 草稿）
    CollectText.tsx          — 文本采集（朗读文本 + 跟读输入 + 字数校验）
    CollectImage.tsx         — 图片采集（上传预览 + 多张管理）
    ReviewProgress.tsx       — 审核进度（模型检测 → 人工复核 → 积分到账 步骤）
    MyProfile.tsx            — 个人中心（头像/手机/语言/等级/勋章入口）
    PointsCenter.tsx         — 积分中心（余额 + 冻结 + 流水 + 兑换）
    WithdrawPage.tsx         — 提现（费率说明 6.75% + 实名前置 + 申请记录）
    InvitePage.tsx           — 邀请好友（邀请码海报 + 进度 + 奖励记录）
    CertificatePage.tsx      — 认证中心（大模型测评 + 成长等级 + 勋章墙）
  screens/admin/             ← Ant Design Pro 风格，PC 宽屏布局
    AdminLayout.tsx          — 侧边栏 + 顶栏（antd Layout + Menu）
    AdminDashboard.tsx       — 运营看板（KPI 卡 + Recharts 折线/柱状图）
    AdminTasks.tsx           — 项目/任务管理（antd Table + 状态流转）
    AdminQC.tsx              — 质检工作台（待审列表 + 音频/文本预览 + 通过/返工）
    AdminUsers.tsx           — 用户管理（标签、认证状态、任务量筛选）
    AdminSettle.tsx          — 结算（积分账户 + 提现审核 + 费用明细）
  common/
    TaskCard.tsx             — 任务卡片（类型图标/奖励/名额/进度条）
    StatusBadge.tsx          — 状态标签（统一 7 种状态色）
    ProgressStepper.tsx      — 三步审核进度条
    PointsBadge.tsx          — 积分展示气泡
    WaveAnimation.tsx        — 语音录制波形动画（CSS keyframes）
```

### 路由设计（React Router）
```
/                   → OnboardingScreen（登录 + 协议）
/app/tasks          → TaskHall（任务大厅）
/app/tasks/my       → MyTasks（已做任务）
/app/tasks/:id      → TaskDetail
/app/tasks/:id/collect/voice  → CollectVoice
/app/tasks/:id/collect/text   → CollectText
/app/tasks/:id/collect/image  → CollectImage
/app/tasks/:id/review         → ReviewProgress
/app/me             → MyProfile
/app/me/points      → PointsCenter
/app/me/withdraw    → WithdrawPage
/app/me/invite      → InvitePage
/app/me/certs       → CertificatePage
/admin              → AdminDashboard（后台，PC 宽屏布局）
/admin/tasks        → AdminTasks
/admin/qc           → AdminQC
/admin/users        → AdminUsers
/admin/settle       → AdminSettle
```

---

## 关键 UI 规范

- **移动端容器**：`max-w-[390px] mx-auto` + 固定高度 `h-[844px]`（iPhone 14），overflow hidden + 内部 scroll
- **底部导航**：仅 任务（ListTodo 图标）/ 我的（User 图标），Teal 激活色
- **卡片**：`rounded-2xl shadow-sm bg-white` 
- **主按钮**：`bg-[#3DBFA0] text-white rounded-full` 
- **状态色**：进行中蓝、审核中橙、通过绿、返工红、过期灰
- **后台**：标准 PC 侧边栏布局，不套移动容器

---

## Mock 数据规划

在 `src/app/data/mockData.ts` 中定义：
- 5 个任务（覆盖语音/文本/图片类型，不同状态）
- 3 个用户任务（进行中/审核中/已通过）
- 积分流水 10 条
- 邀请记录 5 条
- 后台：待质检数据 8 条、结算记录 6 条

---

## 依赖安装

后台使用 Ant Design，需安装（用 pnpm）：
```
pnpm add antd @ant-design/icons @ant-design/colors
```
用户端继续使用项目已有的 shadcn/ui + Radix UI + Tailwind v4，无需额外安装。

## 实施步骤

1. **安装 antd** — `pnpm add antd @ant-design/icons @ant-design/colors`
2. **更新主题** — 修改 `src/styles/theme.css`，写入 Teal 色系（`--primary: #3DBFA0` 等）
3. **Mock 数据** — 创建 `src/app/data/mockData.ts`（任务 5 条、用户任务 8 条、积分流水、邀请、质检、结算）
4. **AppContext** — `src/app/context/AppContext.tsx`（用户 auth、积分、当前 tab、导航）
5. **公共组件** — MobileShell、BottomNav、TaskCard、StatusBadge、ProgressStepper、WaveAnimation
6. **用户端页面**（按主流程顺序）：
   - Onboarding → TaskHall → TaskDetail → CollectVoice / CollectText / CollectImage → ReviewProgress
   - MyProfile → PointsCenter → WithdrawPage → InvitePage → CertificatePage
7. **后台页面**：AdminLayout（antd）→ AdminDashboard → AdminTasks → AdminQC → AdminUsers → AdminSettle
8. **路由接线** — `App.tsx` 配置全部路由，首页入口 + 后台入口（右上角「进入后台」浮动按钮）

---

## 验证方案

- 在预览界面确认登录流程：点击「登录」→ 协议弹窗 → 进入任务大厅
- 点击任务卡片 → 任务详情 → 领取 → 进入采集界面（语音/文本/图片）
- 提交后查看审核进度三步骤动画
- 切换「我的」tab → 积分余额、提现、邀请流程可见
- 访问 `/admin` 路由确认后台看板和侧边栏正常显示
- 移动容器在桌面居中显示，宽度限制在 390px
