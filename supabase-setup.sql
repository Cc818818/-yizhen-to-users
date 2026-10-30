-- ============================================================
--  The Wild Oasis 官网 —— 数据库修复 + 初始化脚本（第二版）
--
--  上一版为什么失败：
--    cabins 表里的列名是带大小写的 "maxCapacity"，SQL 里必须加双引号。
--    上一版没加引号 → Postgres 自动转成小写 maxcapacity → 找不到列。
--
--  这一版：所有含大写的列名都加了双引号。
--  可以反复执行，不会重复插数据。
--
--  用法：Supabase → SQL Editor → New query → 粘贴 → Run
-- ============================================================


-- ------------------------------------------------------------
-- 第 1 步：关掉 RLS（行级安全）—— 这一步是关键
--
-- 你的 4 张表现在开着 RLS，却没有任何 policy，结果：
--   读：静默返回空数组（页面上永远一间小屋都没有）
--   写：报 42501 new row violates row-level security policy
--
-- 学习项目直接关掉最省事。
-- ⚠️ 商业项目绝不能这么干，要按用户身份写策略（见文件末尾）。
-- ------------------------------------------------------------
alter table cabins   disable row level security;
alter table guests   disable row level security;
alter table bookings disable row level security;
alter table settings disable row level security;


-- ------------------------------------------------------------
-- 第 2 步：补 settings 那一行（没有它，小屋详情页会崩）
-- ------------------------------------------------------------
insert into settings ("minBookingLength", "maxBookingLength", "maxGuestsPerBooking", "breakfastPrice")
select 1, 20, 8, 15
where not exists (select 1 from settings);


-- ------------------------------------------------------------
-- 第 3 步：补 6 间小屋（只在 cabins 为空时才插）
-- ------------------------------------------------------------
insert into cabins (name, "maxCapacity", "regularPrice", discount, description, image)
select v.*
from (values
  ('Green Cabin', 2, 250, 0,
   'A cozy wooden hideaway surrounded by pine trees. Wake up to birdsong and the smell of the forest, then soak in your own private hot tub under the stars.',
   'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80'),

  ('Tiny House', 2, 350, 50,
   'Small in size, huge in character. A compact cabin with a wall of glass facing the valley, ideal for couples who want to disconnect completely.',
   'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'),

  ('A Frame', 4, 350, 0,
   'The classic A-frame silhouette against the Dolomites. Two bedrooms, a wood-burning stove and a deck that looks straight down the mountain.',
   'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'),

  ('Cozy Cabin', 4, 400, 50,
   'Warm wood, soft light and a fireplace that never goes out. Bookshelves on every wall and a reading nook that gets the morning sun.',
   'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80'),

  ('Forest View', 6, 500, 0,
   'A family-sized cabin at the edge of the dark forest. Room for six, a long dining table, and a covered terrace for rainy afternoons.',
   'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80'),

  ('Lakeside Retreat', 8, 700, 100,
   'Our largest cabin, right on the water. Sleeps eight across three bedrooms, with a sauna, an outdoor fire pit and a private jetty.',
   'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80')
) as v(name, "maxCapacity", "regularPrice", discount, description, image)
where not exists (select 1 from cabins);


-- ------------------------------------------------------------
-- 第 4 步：检查，应该返回 6 行
-- ------------------------------------------------------------
select id, name, "maxCapacity", "regularPrice", discount from cabins order by id;


-- ============================================================
--  商业项目应该怎么做（现在不用管，留着以后看）
--
--  alter table bookings enable row level security;
--
--  -- 客人只能看自己的订单
--  create policy "guest reads own bookings"
--    on bookings for select
--    using ("guestId" = current_setting('request.jwt.claims', true)::json->>'guestId');
--
--  -- 客人只能给自己下单
--  create policy "guest inserts own bookings"
--    on bookings for insert
--    with check ("guestId" = current_setting('request.jwt.claims', true)::json->>'guestId');
-- ============================================================
