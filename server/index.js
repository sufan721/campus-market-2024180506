import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './db.js'
import { requireAuth } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import tradeRoutes from './routes/trades.js'
import lostFoundRoutes from './routes/lostFounds.js'
import groupBuyRoutes from './routes/groupBuys.js'
import errandRoutes from './routes/errands.js'
import messageRoutes from './routes/messages.js'
import chatMessageRoutes from './routes/chatMessages.js'
import dashboardRoutes from './routes/dashboard.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Mount routes — same paths as json-server
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/trades', tradeRoutes)
app.use('/lostFounds', lostFoundRoutes)
app.use('/groupBuys', groupBuyRoutes)
app.use('/errands', errandRoutes)
app.use('/messages', messageRoutes)
app.use('/chatMessages', chatMessageRoutes)
app.use('/dashboard', dashboardRoutes)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }))
// Root info
app.get('/', (_req, res) =>
  res.json({ name: '校园轻集市 API', version: '1.0.0', docs: '/health' }),
)

const PORT = process.env.PORT || 3001

// 启动前先测试数据库连接
try {
  const [result] = await pool.query('SELECT 1 AS ok')
  console.log(`  MySQL connected  ✓  (${result[0].ok === 1 ? 'ok' : 'fail'})`)
} catch (err) {
  console.error('  MySQL FAILED:', err.message)
  console.error('  Please check MySQL is running and .env is correct')
  process.exit(1)
}

app.listen(PORT, () => {
  console.log('')
  console.log('  ╔══════════════════════════════════════╗')
  console.log('  ║   🏪  校园轻集市 API Server         ║')
  console.log(`  ║   http://localhost:${PORT}              ║`)
  console.log('  ║   Ctrl+C to stop                    ║')
  console.log('  ╚══════════════════════════════════════╝')
  console.log('')
})
