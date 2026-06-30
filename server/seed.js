import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { pool } from './db.js'

const md5 = (s) => crypto.createHash('md5').update(s).digest('hex')
const dbPath = path.resolve('../db.json')
const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

async function seed() {
  // 先清空所有表（子表优先，避免外键约束报错）
  await pool.query('SET FOREIGN_KEY_CHECKS = 0')
  await pool.query('TRUNCATE TABLE chat_messages')
  await pool.query('TRUNCATE TABLE messages')
  await pool.query('TRUNCATE TABLE errands')
  await pool.query('TRUNCATE TABLE group_buys')
  await pool.query('TRUNCATE TABLE lost_founds')
  await pool.query('TRUNCATE TABLE trades')
  await pool.query('TRUNCATE TABLE dashboard_weekly')
  await pool.query('TRUNCATE TABLE dashboard_categories')
  await pool.query('TRUNCATE TABLE dashboard')
  await pool.query('TRUNCATE TABLE users')
  await pool.query('SET FOREIGN_KEY_CHECKS = 1')
  console.log('All tables cleared')

  // 1. Users (with auth credentials — 学号为10位数字)
  // 格式：4位年 + 2位专业代码 + 2位班级 + 2位序号
  const users = [
    {
      id: 1,
      student_id: '2023010201',   // 2023级 软件工程(01) 02班 01号 → 张三
      password_md5: md5('123456'),
      name: '张三',
      avatar: '',
      school: 'XX大学',
      department: '软件工程',
      grade: '2023级',
      join_date: '2026-03-01',
      contact: 'QQ：111222333',
    },
    {
      id: 2,
      student_id: '2022020101',   // 2022级 数学(02) 01班 01号 → 李四
      password_md5: md5('123456'),
      name: '李四',
      avatar: '',
      school: 'XX大学',
      department: '数学学院',
      grade: '2022级',
      join_date: '2026-03-15',
      contact: '站内消息联系',
    },
  ]

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, student_id, password_md5, name, avatar, school, department, grade, join_date, contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.student_id, u.password_md5, u.name, u.avatar, u.school, u.department, u.grade, u.join_date, u.contact],
    )
  }
  console.log(`Seeded ${users.length} users`)

  // 2. Trades
  for (const t of data.trades) {
    await pool.query(
      `INSERT INTO trades (id, user_id, title, category, price, \`condition\`, location, publisher, publish_time, image, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.userId, t.title, t.category, t.price, t.condition, t.location, t.publisher, t.publishTime, t.image || '', t.status, t.description],
    )
  }
  console.log(`Seeded ${data.trades.length} trades`)

  // 3. Lost & Founds
  for (const l of data.lostFounds) {
    await pool.query(
      `INSERT INTO lost_founds (id, user_id, title, type, item_name, location, event_time, contact, status, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [l.id, l.userId, l.title, l.type, l.itemName, l.location, l.eventTime, l.contact, l.status, l.image || '', l.description],
    )
  }
  console.log(`Seeded ${data.lostFounds.length} lostFounds`)

  // 4. Group Buys
  for (const g of data.groupBuys) {
    await pool.query(
      `INSERT INTO group_buys (id, user_id, title, type, target_count, current_count, deadline, location, publisher, status, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [g.id, g.userId, g.title, g.type, g.targetCount, g.currentCount, g.deadline, g.location, g.publisher, g.status, g.image || '', g.description],
    )
  }
  console.log(`Seeded ${data.groupBuys.length} groupBuys`)

  // 5. Errands
  for (const e of data.errands) {
    await pool.query(
      `INSERT INTO errands (id, user_id, title, task_type, reward, from_location, to_location, deadline, publisher, status, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.id, e.userId, e.title, e.taskType, e.reward, e.from, e.to, e.deadline, e.publisher, e.status, e.image || '', e.description],
    )
  }
  console.log(`Seeded ${data.errands.length} errands`)

  // 6. Messages (inbox)
  for (const m of data.messages) {
    await pool.query(
      `INSERT INTO messages (id, user_id, from_name, content, time, unread)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(m.id), m.userId, m.from, m.content, m.time, m.unread ? 1 : 0],
    )
  }
  console.log(`Seeded ${data.messages.length} messages`)

  // 7. Chat Messages
  if (data.chatMessages) {
    for (const c of data.chatMessages) {
      await pool.query(
        `INSERT INTO chat_messages (id, user_id, contact_name, content, time, direction)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, c.userId, c.contactName, c.content, c.time, c.direction],
      )
    }
    console.log(`Seeded ${data.chatMessages.length} chatMessages`)
  }

  // 8. Dashboard
  const d = data.dashboard
  await pool.query(
    `INSERT INTO dashboard (id, user_count, product_count, order_count, active_today)
     VALUES (?, ?, ?, ?, ?)`,
    [d.id, d.userCount, d.productCount, d.orderCount, d.activeToday],
  )
  // Weekly data
  let wi = 1
  for (const w of d.weeklyData) {
    await pool.query(
      `INSERT INTO dashboard_weekly (id, dashboard_id, day, count) VALUES (?, ?, ?, ?)`,
      [wi++, d.id, w.day, w.count],
    )
  }
  // Categories
  let ci = 1
  for (const c of d.categories) {
    await pool.query(
      `INSERT INTO dashboard_categories (id, dashboard_id, name, count, color) VALUES (?, ?, ?, ?, ?)`,
      [ci++, d.id, c.name, c.count, c.color],
    )
  }
  console.log('Seeded dashboard with weekly and category data')

  // Reset AUTO_INCREMENT to avoid gaps
  await pool.query('ALTER TABLE users AUTO_INCREMENT = 100')
  await pool.query('ALTER TABLE trades AUTO_INCREMENT = 100')
  await pool.query('ALTER TABLE lost_founds AUTO_INCREMENT = 100')
  await pool.query('ALTER TABLE group_buys AUTO_INCREMENT = 100')
  await pool.query('ALTER TABLE errands AUTO_INCREMENT = 100')
  await pool.query('ALTER TABLE messages AUTO_INCREMENT = 100')
  await pool.query('ALTER TABLE chat_messages AUTO_INCREMENT = 100')

  console.log('\n✅ Seed complete!')
  console.log('   Default accounts (学号 / 密码):')
  console.log('   - 2023010201 / 123456  (张三)')
  console.log('   - 2022020101 / 123456  (李四)')
  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
