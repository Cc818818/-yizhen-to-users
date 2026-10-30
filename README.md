# Yizhen — 民宿预订官网

一个面向顾客的民宿预订网站：浏览小屋、按人数筛选、选日期下单、Google 登录后在个人中心管理订单、退房后给小屋打分写评价。

线上地址：_待部署_

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14（App Router） / React 18 |
| 样式 | Tailwind CSS |
| 数据库 | Supabase（Postgres） |
| 认证 | NextAuth v5 + Google OAuth |
| 日期 | date-fns · react-day-picker |
| 测试 | Vitest |

## 功能

- **小屋浏览**：列表页按人数筛选，详情页看图片、介绍、日历与已订日期
- **预订**：选日期、填人数、可选优惠码，服务端计算金额
- **账户中心**：Google 登录后查看/修改/删除自己的订单，维护个人资料
- **评价**：退房后可以给小屋打分（1–5 星）并留言，小屋页面展示平均分
- **主题**：深色界面，响应式布局

## 几个实现上的取舍

- **金额全部服务端计算**：前端只提交「订哪间、从哪天到哪天」，价格由服务端用 `cabinId` 重查单价后计算。前端传来的金额一律不采信。
- **优惠码一单一张**：`coupon_redemptions` 上对 `(couponId, guestId)` 建唯一索引，"每人每码一次"由数据库兜底，而不是靠应用层先查再插。
- **日期冲突双重校验**：日历上禁用已订日期只是体验，真正生效的是下单时的服务端校验。
- **评价一单一次**：`reviews.bookingId` 唯一约束；"住过才能评"用三条判断（是你的订单 / 已退房 / 未评价）。
- **评分冗余存储**：`cabins.avgRating` / `reviewCount` 是冗余列，写评价时同步更新，避免列表页做 N 次聚合查询。
- **校验规则前后端共用**：`app/_lib/` 下的纯函数同时被页面和 Server Action 调用，避免两边规则漂移。

## 本地运行

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 单元测试
```

需要在项目根目录创建 `.env.local`：

```bash
SUPABASE_URL=
SUPABASE_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

数据库需要四张基础表 `cabins` / `guests` / `bookings` / `settings`，以及 `coupons`、`coupon_redemptions`、`reviews`。

## 目录结构

```
app/
  _components/     组件
  _lib/            数据访问、Server Actions、纯函数
  cabins/          小屋列表与详情
  account/         账户中心（订单、资料、评价）
  api/             少量 REST 接口
middleware.js      路由级登录保护
tests/             单元测试
```
