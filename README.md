# Yizhen · 民宿预订官网

[![CI](https://github.com/Cc818818/-yizhen-to-users/actions/workflows/ci.yml/badge.svg)](https://github.com/Cc818818/-yizhen-to-users/actions/workflows/ci.yml)

一个面向顾客的民宿预订网站：浏览小屋、按人数筛选、选日期下单、Google 登录后在个人中心管理订单、退房后可以给小屋打分写评价。

**技术栈**：Next.js 14 (App Router) · React 18 · Tailwind CSS · Supabase (Postgres) · NextAuth v5 · Vitest · GitHub Actions

<!-- 截图区：SHOTS_START -->
<!-- 截图区：SHOTS_END -->

---

## 功能

| 模块 | 说明 |
|---|---|
| 小屋浏览 | 列表页按人数筛选（结果写入 URL，可分享、刷新不丢失）；详情页展示图片、介绍、日历与已订日期 |
| 预订 | 选日期 → 填人数 → 可选优惠码 → 服务端计算金额 → 写入订单 |
| 账户中心 | Google 登录后查看 / 修改 / 删除自己的订单，维护个人资料 |
| 评价 | 退房后可给小屋打 1–5 星并留言；小屋页面展示平均分与最新评价 |
| 界面 | 中性黑 + 玻璃质感，响应式布局 |

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14（App Router） / React 18 |
| 样式 | Tailwind CSS |
| 数据库 | Supabase（Postgres） |
| 认证 | NextAuth v5 + Google OAuth |
| 日期 | date-fns · react-day-picker |
| 测试 | Vitest |
| CI | GitHub Actions |

## 几个关键实现

### 1. 金额全部服务端计算

前端只提交「订哪一间、从哪天到哪天」，晚数、单价、总价、折扣全部由服务端重新计算——**前端传来的金额一律不采信**。

```js
// app/_lib/actions.js
const { cabinId } = bookingData;                     // 只取「订哪间」
const numNights = differenceInDays(endDate, startDate); // 晚数自己算
const cabin = await getCabinPrice(cabinId);          // 单价自己查
const { cabinPrice } = computeStayPrice({ ...cabin, numNights });
```

写入数据库时采用**字段白名单**，而不是展开前端传来的对象，避免前端注入额外字段。

### 2. 优惠码：9 条规则 + 数据库兜底

校验规则封装成纯函数（`app/_lib/coupons.js`），有效期、总量、每人限次、首单限定、连住门槛、最低消费、折扣封顶各一条。

- 界面预览与下单生效**各算一次**，共用同一个函数，但结果不复用（预览结果经过浏览器，不可信）
- 「每人每码限一次」由 `(couponId, guestId)` **唯一索引**在数据库层保证，插入失败即回滚订单

### 3. 评价：三重校验 + 冗余平均分

- 评价资格 = 订单归属 + 已退房 + 未评价，`reviews.bookingId` 唯一约束防重复
- 小屋平均分以 `avgRating` / `reviewCount` **冗余字段**存储，在写入评价的同一个 Server Action 内同步，避免列表页做 N 次聚合查询

### 4. 认证：双层防护

- `middleware` 做路由级访问控制，未登录访问账户区直接重定向到登录页
- 页面与每个 Server Action 内再校验一次身份，涉及他人数据的再做归属校验

### 5. 质量

- 36 个 Vitest 单元测试，覆盖价格计算、优惠码校验、日期冲突、评价资格四个纯函数模块
- GitHub Actions 在每次推送时执行 ESLint 与测试

## 本地运行

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 36 个单元测试
```

需要在项目根目录创建 `.env.local`：

```bash
SUPABASE_URL=
SUPABASE_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

数据库需要 `cabins` / `guests` / `bookings` / `settings` 四张基础表，以及 `coupons`、`coupon_redemptions`、`reviews`。

## 项目结构

```
app/
  _components/     组件
  _lib/            数据访问、Server Actions、纯函数
  cabins/          小屋列表与详情
  account/         账户中心（订单、资料、评价）
  api/             对外 REST 接口
middleware.js      路由级登录保护
tests/             单元测试
.github/workflows/ CI 配置
```

## 说明

这是一个个人练习项目，用于学习和展示 Next.js App Router 的完整实践：服务端组件、Server Actions、动态路由、认证与授权、数据库设计、单元测试与 CI。
