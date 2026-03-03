# 孩子作业管理系统设计文档

**创建日期：** 2026-03-02
**版本：** 1.0
**状态：** 已批准

---

## 一、项目概述

### 1.1 核心目标

综合解决孩子作业管理中的三大问题：
- **时间管理困难**：孩子拖延、不按时完成任务
- **缺乏激励动力**：孩子缺乏主动性和积极性
- **家长监督负担**：需要反复提醒，沟通成本高

### 1.2 核心理念

- **家长发布任务，孩子规划时间**：培养孩子的自主规划能力
- **游戏化激励**：通过积分、等级、虚拟物品、实物兑换建立持续动力
- **最小化电子设备使用**：每天操作时间 <10 分钟，支持锁屏计时
- **可视化成长**：用森林成长系统展示进步过程

### 1.3 目标用户

- **主要用户**：1个孩子（后续可扩展到多个）
- **次要用户**：家长（任务发布、奖励管理、统计分析）
- **使用场景**：孩子使用家长的手机

---

## 二、系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────┐
│              前端 (React + TypeScript)           │
├─────────────────────────────────────────────────┤
│  • 家长端：任务发布、奖励设置、统计查看          │
│  • 孩子端：任务规划、计时执行、奖励查看          │
│  • 共享：登录、统计展示、设置                   │
└─────────────────────────────────────────────────┘
                      ↕ HTTP/REST
┌─────────────────────────────────────────────────┐
│            后端 (Node.js + Express)              │
├─────────────────────────────────────────────────┤
│  • 认证服务：JWT登录、角色验证                   │
│  • 任务服务：CRUD、OCR识别                       │
│  • 奖励服务：积分计算、等级晋升、兑换            │
│  • 计时服务：计时跟踪、超时处理                  │
│  • 统计服务：日/周/月数据聚合                    │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│         数据库 (SQLite)                          │
├─────────────────────────────────────────────────┤
│  • users (用户表)                                │
│  • tasks (任务表)                                │
│  • rewards (奖励记录表)                          │
│  • achievements (成就表)                         │
│  • time_logs (计时记录表)                        │
└─────────────────────────────────────────────────┘
```

### 2.2 技术选型

**前端技术栈：**
- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式框架）
- shadcn/ui（UI组件库）
- React Router（路由）
- Zustand（状态管理）
- Axios（HTTP客户端）
- Tesseract.js（OCR识别）
- jsPDF + html2canvas（PDF生成）

**后端技术栈：**
- Node.js 18+
- Express（Web框架）
- SQLite3 + Better-SQLite3（数据库）
- JWT（认证）
- bcrypt（密码加密）
- Multer（文件上传）
- Sharp（图片处理）

**开发工具：**
- ESLint + Prettier（代码规范）
- Jest + React Testing Library（单元测试）
- Cypress（E2E测试）
- Git（版本控制）

---

## 三、核心功能设计

### 3.1 任务管理系统

#### 任务分类
- **学校作业**：语文、数学、英语等
- **兴趣班任务**：练琴、画画、运动等
- **家庭任务**：阅读、写作、做家务等
- **自定义类别**：家长可自定义

#### 任务类型
1. **固定任务**（每日重复）
   - 家长设置固定任务模板
   - 每天早上 7:00 自动生成
   - 可设置"周末不执行"
   - 示例：练琴、阅读、整理房间

2. **动态任务**（当天添加）
   - 傍晚钉钉作业（OCR识别或手动添加）
   - 临时家庭任务
   - 孩子自己增加的任务（需家长确认）

#### 任务状态流转
```
待规划 → 已规划 → 进行中 → 已完成/已超时
```

#### 任务属性
```javascript
{
  id: 主键,
  title: 任务标题,
  description: 任务描述,
  category: 分类,
  assigned_to: 分配给孩子ID,
  created_by: 创建者ID,
  suggested_duration: 建议时长（分钟）,
  scheduled_date: 计划日期,
  scheduled_time: 计划时间段（可选）,
  status: 状态,
  points: 完成积分,
  bonus_items: 奖励物品（JSON）,
  overtime_penalty: 超时扣分规则（JSON）,
  actual_start_time: 实际开始时间,
  actual_end_time: 实际结束时间,
  overtime_minutes: 超时分钟数
}
```

### 3.2 时间规划与执行

#### 早上规划（2分钟）
- 查看今日任务列表
- 拖拽调整执行顺序
- 点击"开始今天的学习"

#### 任务执行（每个任务1分钟操作）
1. 点击"开始" → 计时器启动
2. 锁屏/放下手机，专注执行
3. 时间到 → 声音提醒
4. 点击"完成"或"继续做"

#### 超时处理
- 超时后继续计时
- 声音提醒 + 震动
- 显示超时时长
- 超时超过设定时间倒扣奖励
- 示例：超时5分钟后，每分钟扣2分

### 3.3 奖励系统

#### 积分与等级系统

**森林成长体系：**

```
第1棵树：小树苗 → 参天大树
├─ Lv.1 种子 (0分) 🌱
├─ Lv.2 发芽 (50分) 🌿
├─ Lv.3 小苗 (150分) 🌱
├─ Lv.4 小树 (300分) 🌳
└─ Lv.5 参天大树 (500分) 🌳

第2棵树：500分后开启
├─ Lv.6 种子 (500分) 🌱
├─ Lv.7 发芽 (650分) 🌿
├─ Lv.8 小苗 (800分) 🌱
├─ Lv.9 小树 (900分) 🌳
└─ Lv.10 参天大树 (1000分) 🌳

第3棵树：1000分后开启
...
```

**成就系统：**
- 种植 1棵树：🌱 林场新手
- 种植 3棵树：🌲 小树林主人
- 种植 5棵树：🌳 森林守护者
- 种植 10棵树：🏔️ 绿化英雄

#### 虚拟物品收集
```javascript
收集物品类型：
- 💎 钻石
- ⭐ 星星
- 🪙 金币
- 🏆 勋章

存储结构：
{
  user_id: 用户ID,
  item_type: 物品类型,
  item_name: 物品名称,
  quantity: 数量,
  icon_url: 图标URL
}
```

#### 实物奖励兑换
```javascript
可兑换奖励（家长设置）：
{
  name: "1小时游戏时间",
  description: "周末可以使用",
  required_points: 100,
  required_items: [
    { type: "star", quantity: 5 }
  ],
  created_by: 家长ID,
  is_active: true
}

兑换记录：
{
  user_id: 孩子ID,
  reward_id: 兑换奖励ID,
  points_spent: 消耗积分,
  items_spent: 消耗物品,
  status: "待兑现/已兑现",
  created_at: 创建时间,
  fulfilled_at: 兑现时间
}
```

### 3.4 统计展示

#### 日统计
```
今日成就 - 3月1日
━━━━━━━━━━━━━━━━━━
完成率：4/5 (80%)
获得积分：+85
获得物品：💎x1, ⭐x2
超时扣分：-10
今日净积分：+75
连续完成天数：🔥 7天
```

#### 周/月统计
```
本周概览（3月1日-7日）
━━━━━━━━━━━━━━━━━━
总完成率：92%
累计积分：+420
本周新增：⭐x15, 💎x3

[柱状图：每天完成率]
[折线图：积分趋势]
最佳表现日：周三 (100%完成)
```

#### 森林成长展示
```
我的森林花园
┌─────────────────────────────────┐
│   🌳      🌳        🌱          │
│  (大树)   (大树)   (种子)       │
│   500分   500分    刚种下       │
│                                 │
│   当前正在培养：第3棵树          │
│   🌿 小苗 (已有200/300分)       │
│   [=========>    ] 67%          │
│                                 │
│ 🏆 成就：小树林主人              │
│ 💰 总积分：1700                  │
└─────────────────────────────────┘
```

---

## 四、特殊功能设计

### 4.1 OCR 截图识别

**实现流程：**
1. 用户上传钉钉作业截图
2. 图像预处理（转黑白、增强对比度、去噪）
3. Tesseract.js OCR 识别中文
4. 文本后处理，提取关键信息
5. 填充到任务创建表单
6. 家长确认/编辑后发布

**优化策略：**
- 提示用户截取清晰图片
- 首次使用时下载中文语言包（约10MB）
- 缓存语言包到本地
- 提供"识别不准确？手动编辑"选项

### 4.2 锁屏通知与后台计时

**技术方案：**
- PWA + Web Notifications + Service Worker
- 计时开始时请求通知权限
- Service Worker 保持后台计时
- 时间到达时发送通知 + 播放提示音 + 震动

**兼容性：**
- iOS Safari：后台计时最多10分钟
- Android Chrome：可长时间后台运行
- 降级方案：Wake Lock API 保持屏幕常亮

### 4.3 声音提醒系统

**场景音效：**
- 计时开始：轻快的"叮"声
- 时间到：温和铃声 + 语音播报
- 超时提醒：急促提示音 + 语音提醒
- 任务完成：庆祝音效 + 语音反馈
- 升级/种树：成长音效 + 语音祝贺

**实现：**
- Web Audio API
- 预加载所有音效
- 支持静音模式（震动代替）
- 音量可调节

### 4.4 离线支持

**策略：**
- 本地 IndexedDB 存储任务数据
- Service Worker 缓存静态资源
- 离线可查看任务、开始/结束计时
- 有网络时自动同步到服务器
- 冲突解决：以最新时间戳为准

### 4.5 打印功能

**周计划表PDF：**
- 使用 jsPDF + html2canvas 生成
- 包含每日任务清单（可打勾）
- 任务时间建议
- 周目标积分
- 激励语句

---

## 五、数据库设计

### 5.1 核心表结构

**users（用户表）**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('parent', 'child') NOT NULL,
  avatar VARCHAR(255),
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**tasks（任务表）**
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  assigned_to INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  suggested_duration INTEGER,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status ENUM('pending', 'planned', 'in_progress', 'completed', 'overtime') DEFAULT 'pending',
  points INTEGER DEFAULT 0,
  bonus_items TEXT, -- JSON
  overtime_penalty TEXT, -- JSON
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  overtime_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**time_logs（计时记录表）**
```sql
CREATE TABLE time_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER, -- 分钟
  is_overtime BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**rewards（奖励记录表）**
```sql
CREATE TABLE rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  task_id INTEGER,
  type ENUM('points', 'item', 'exchange') NOT NULL,
  amount INTEGER,
  item_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

**user_items（用户收集物品表）**
```sql
CREATE TABLE user_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 0,
  icon_url VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, item_type, item_name)
);
```

**exchangeable_rewards（可兑换奖励表）**
```sql
CREATE TABLE exchangeable_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  required_points INTEGER NOT NULL,
  required_items TEXT, -- JSON
  created_by INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**reward_exchanges（兑换记录表）**
```sql
CREATE TABLE reward_exchanges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reward_id INTEGER NOT NULL,
  points_spent INTEGER NOT NULL,
  items_spent TEXT, -- JSON
  status ENUM('pending', 'fulfilled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fulfilled_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reward_id) REFERENCES exchangeable_rewards(id)
);
```

---

## 六、API 设计

### 6.1 认证相关

```
POST /api/auth/register
  - 注册新家庭（家长账号）

POST /api/auth/login
  - 登录

POST /api/auth/switch-role
  - 切换角色（需要验证）

GET /api/auth/profile
  - 获取当前用户信息
```

### 6.2 任务相关

```
GET /api/tasks
  - 获取任务列表
  - 参数：date, status, assigned_to

POST /api/tasks
  - 创建任务（家长权限）

PUT /api/tasks/:id
  - 更新任务

DELETE /api/tasks/:id
  - 删除任务

POST /api/tasks/ocr
  - OCR识别截图

POST /api/tasks/template
  - 创建固定任务模板

GET /api/tasks/templates
  - 获取固定任务模板列表

POST /api/tasks/start/:id
  - 开始任务计时

POST /api/tasks/complete/:id
  - 完成任务

POST /api/tasks/pause/:id
  - 暂停计时
```

### 6.3 奖励相关

```
GET /api/rewards/items
  - 获取用户的收集物品

POST /api/rewards/exchange
  - 兑换奖励

GET /api/rewards/exchangeable
  - 获取可兑换奖励列表

POST /api/rewards/exchangeable
  - 创建可兑换奖励（家长权限）

PUT /api/rewards/exchange/:id/fulfill
  - 兑现奖励（家长权限）
```

### 6.4 统计相关

```
GET /api/stats/daily/:date
  - 获取日统计

GET /api/stats/weekly/:startDate
  - 获取周统计

GET /api/stats/monthly/:yearMonth
  - 获取月统计

GET /api/stats/forest
  - 获取森林成长数据
```

### 6.5 用户相关

```
PUT /api/users/profile
  - 更新用户信息

GET /api/users/children
  - 获取孩子列表（家长权限）

POST /api/users/children
  - 创建孩子账号（家长权限）
```

---

## 七、安全与性能

### 7.1 安全措施

**密码安全：**
- bcrypt 加密存储
- 家长密码强度要求（8位+数字+字母）
- 孩子密码可以简单（4位数字）

**角色验证：**
- 孩子切换到家长：需要家长密码
- 5次错误后锁定15分钟
- JWT Token 有效期：7天

**数据隐私：**
- 所有数据本地存储
- 不收集个人信息到第三方
- 可选端到端加密

**备份机制：**
- 每天凌晨 2:00 自动备份
- 保留最近 7 天备份
- 支持手动导出/导入

### 7.2 性能优化

**前端优化：**
- 代码分割，按路由懒加载
- OCR 模块单独打包
- 树木图片使用 SVG
- Service Worker 缓存静态资源
- IndexedDB 缓存任务数据

**后端优化：**
- 数据库索引优化
- API 响应压缩
- 静态资源 CDN（可选）

**目标：**
- 首屏加载 < 2秒
- API 响应 < 200ms
- Lighthouse 得分 > 90

---

## 八、测试策略

### 8.1 单元测试

**工具：** Jest + React Testing Library

**覆盖范围：**
- 积分计算逻辑
- 等级晋升逻辑
- 超时扣分逻辑
- 时间格式化函数
- 数据验证函数

**目标：** 80%+ 代码覆盖率

### 8.2 集成测试

**工具：** Supertest（后端）+ Cypress（前端）

**测试场景：**
- 用户注册登录流程
- 创建任务并完成
- OCR 识别流程
- 奖励兑换流程
- 统计数据展示

### 8.3 端到端测试

**关键路径：**
1. 家长注册 → 创建孩子账号 → 发布任务
2. 孩子登录 → 查看任务 → 开始计时 → 完成
3. 查看积分增加 → 查看树木成长
4. 兑换奖励 → 家长确认兑现

**移动端测试：**
- iOS Safari
- Android Chrome
- 不同屏幕尺寸适配

---

## 九、部署方案

### 9.1 本地开发环境

```
前端：Vite Dev Server (http://localhost:5173)
后端：Nodemon (http://localhost:3000)
数据库：SQLite (./data/database.sqlite)

启动命令：
npm run dev:frontend
npm run dev:backend
```

### 9.2 生产环境（推荐初期）

**单服务器部署：**
```
配置：
- 2核4G云服务器
- Ubuntu 22.04
- Node.js 18+

架构：
Nginx (反向代理 + SSL)
  ↓
Node.js Express (端口 3000)
  ↓
SQLite (文件存储)

成本：约 50-100 元/月
```

**Serverless 部署（可选）：**
```
前端：Vercel / Netlify (免费)
后端：Vercel Serverless Functions (免费)
数据库：PlanetScale / Turso (免费额度)

优点：几乎零成本，自动扩展
缺点：冷启动，数据库容量限制
```

---

## 十、开发计划

### 10.1 第一阶段：核心功能（2周）

**Week 1：**
- 项目脚手架搭建
- 数据库设计实现
- 用户认证系统
- 基础任务 CRUD

**Week 2：**
- 任务计时功能
- 积分系统
- 等级与森林可视化
- 基础统计功能

### 10.2 第二阶段：增强功能（1-2周）

**Week 3：**
- OCR 识别功能
- 声音提醒系统
- 后台计时（PWA）
- 奖励兑换系统

**Week 4：**
- 周/月统计
- 打印功能
- 响应式优化
- 性能优化

### 10.3 第三阶段：测试与部署（1周）

**Week 5：**
- 单元测试
- 集成测试
- E2E 测试
- Bug 修复
- 部署上线

---

## 十一、未来扩展

### 11.1 多家庭支持

- 数据库添加 family_id
- 完善权限系统
- 云端数据同步

### 11.2 社交功能

- 孩子之间的成就对比
- 家庭排行榜
- 分享森林成长

### 11.3 AI 辅助

- 智能任务推荐
- 学习时间优化建议
- OCR 识别准确率提升

---

## 十二、成功指标

### 12.1 用户满意度

- 孩子主动使用率 > 80%
- 家长满意度 > 90%
- 日均任务完成率 > 85%

### 12.2 技术指标

- 系统可用性 > 99%
- 页面加载时间 < 2秒
- 错误率 < 0.1%

### 12.3 行为改善

- 孩子拖延时间减少 50%
- 家长提醒次数减少 70%
- 孩子自主规划能力提升

---

**文档状态：** ✅ 已批准，准备进入实现阶段
