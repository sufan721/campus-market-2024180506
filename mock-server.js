import { createServer } from 'http'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, 'db.json')

function readDB() {
  return JSON.parse(readFileSync(dbPath, 'utf-8'))
}

function writeDB(data) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Token 工具 ──
function makeToken(payload) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const b = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const s = Buffer.from('mock_secret_2026').toString('base64url')
  return `${h}.${b}.${s}`
}

function parseToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString())
  } catch { return null }
}

/** 从请求头提取当前登录用户 ID（可能为 null） */
function getAuthUserId(req) {
  const auth = (req.headers.authorization || '').replace('Bearer ', '')
  const payload = parseToken(auth)
  return payload?.userId || null
}

// ── JSON 解析 ──
function parseBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch { resolve(null) }
    })
  })
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  })
  res.end(JSON.stringify(data))
}

// ── 路由匹配 ──
function matchRoute(method, path, pattern) {
  const [pMethod, pPath] = pattern.split(' ')
  if (pMethod !== method) return null

  const pathParts = path.split('/').filter(Boolean)
  const patParts = pPath.split('/').filter(Boolean)

  if (pathParts.length !== patParts.length) return null

  const params = {}
  for (let i = 0; i < patParts.length; i++) {
    if (patParts[i].startsWith(':')) {
      params[patParts[i].slice(1)] = pathParts[i]
    } else if (patParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}

// ────────────────────────────────────────
// Server
// ────────────────────────────────────────
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname
  const method = req.method

  // CORS preflight
  if (method === 'OPTIONS') {
    return sendJSON(res, 204, '')
  }

  const body = method === 'POST' || method === 'PUT' || method === 'PATCH'
    ? await parseBody(req)
    : null

  const db = readDB()
  const authUserId = getAuthUserId(req)

  // ────── Auth ──────
  if (method === 'POST' && path === '/auth/register') {
    const { studentId, password, name } = body || {}
    if (!studentId || !password || !name) return sendJSON(res, 400, { error: '学号、密码和姓名为必填项' })
    if (db.users?.find(u => u.studentId === studentId)) return sendJSON(res, 400, { error: '该学号已注册' })
    const user = {
      id: String(Date.now()),
      studentId, password, name,
      avatar: '', school: '', department: '', grade: '',
      joinDate: new Date().toISOString().slice(0, 10),
      contact: '',
    }
    db.users = [...(db.users || []), user]
    writeDB(db)
    const token = makeToken({ userId: user.id, studentId })
    const { password: _, ...safe } = user
    return sendJSON(res, 201, { token, user: safe })
  }

  if (method === 'POST' && path === '/auth/login') {
    const { studentId, password } = body || {}
    const user = db.users?.find(u => u.studentId === studentId && u.password === password)
    if (!user) return sendJSON(res, 400, { error: '学号或密码错误' })
    const token = makeToken({ userId: user.id, studentId })
    const { password: _, ...safe } = user
    return sendJSON(res, 200, { token, user: safe })
  }

  if (method === 'GET' && path === '/auth/me') {
    if (!authUserId) return sendJSON(res, 401, { error: '未登录' })
    const user = db.users?.find(u => u.id === authUserId)
    if (!user) return sendJSON(res, 401, { error: '用户不存在' })
    const { password: _, ...safe } = user
    return sendJSON(res, 200, safe)
  }

  // ────── REST CRUD ──────
  const nameMatch = path.match(/^\/([a-zA-Z_]+)$/)
  const idMatch = path.match(/^\/([a-zA-Z_]+)\/(.+)$/)

  if (nameMatch) {
    const name = nameMatch[1]
    const collection = db[name]
    if (!collection) return sendJSON(res, 404, {})

    if (method === 'GET') {
      let filtered = [...collection]

      // ── 用户私有集合（仅看自己的数据）──
      const privateCollections = ['messages', 'chatMessages']
      if (privateCollections.includes(name)) {
        if (authUserId) {
          filtered = filtered.filter(item => String(item.userId) === authUserId)
        }
      }

      // ── 通用查询参数过滤 ──
      // 支持 ?userId= 过滤
      const filterUserId = url.searchParams.get('userId')
      if (filterUserId) {
        filtered = filtered.filter(item => String(item.userId) === filterUserId)
      }

      // 支持 ?contactName= 过滤（聊天消息）
      const filterContact = url.searchParams.get('contactName')
      if (filterContact) {
        filtered = filtered.filter(item => item.contactName === filterContact)
      }

      // 支持 ?type= 过滤
      const filterType = url.searchParams.get('type')
      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType)
      }

      return sendJSON(res, 200, filtered)
    }

    if (method === 'POST') {
      // 对所有用户内容集合自动注入 userId（从 JWT 提取）
      const autoUserIdCollections = [
        'trades', 'lostFounds', 'groupBuys', 'errands',
        'messages', 'chatMessages',
      ]
      const data = { ...body }
      if (autoUserIdCollections.includes(name) && authUserId && !data.userId) {
        data.userId = Number(authUserId)
      }

      const newItem = { id: String(Date.now()), ...data }
      db[name].push(newItem)

      // ── 聊天消息双向投递 ──
      // 如果提供了 contactUserId，同时为对方创建一条消息副本
      if (name === 'chatMessages' && data.contactUserId) {
        const senderUser = db.users?.find(u => String(u.id) === String(authUserId))
        const senderName = senderUser?.name || '未知用户'
        const recipientId = Number(data.contactUserId)

        // 接收方副本（userId = 对方的 ID，contactName = 发送者的名字）
        const receiverCopy = {
          id: String(Date.now() + 1),
          userId: recipientId,
          contactName: senderName,
          content: data.content,
          time: data.time,
          direction: 'received',
        }
        db.chatMessages.push(receiverCopy)

        // 消息列表去重：同一对 (userId, from) 只保留一条，更新为最新内容
        db.messages = db.messages || []
        const existingIdx = db.messages.findIndex(
          m => String(m.userId) === String(recipientId) && m.from === senderName,
        )
        const notification = {
          id: existingIdx >= 0 ? db.messages[existingIdx].id : String(Date.now() + 2),
          userId: recipientId,
          from: senderName,
          fromUserId: Number(authUserId),
          content: data.content,
          time: data.time,
          unread: true,
        }
        if (existingIdx >= 0) {
          db.messages[existingIdx] = notification
        } else {
          db.messages.push(notification)
        }
      }

      writeDB(db)
      return sendJSON(res, 201, newItem)
    }
  }

  if (idMatch) {
    const name = idMatch[1]
    const id = idMatch[2]
    const collection = db[name]
    if (!collection) return sendJSON(res, 404, {})

    const item = collection.find(i => String(i.id) === id)
    if (!item) return sendJSON(res, 404, {})

    if (method === 'GET') return sendJSON(res, 200, item)

    if (method === 'PUT') {
      const idx = collection.findIndex(i => String(i.id) === id)
      db[name][idx] = { ...body, id: String(id) }
      writeDB(db)
      return sendJSON(res, 200, db[name][idx])
    }

    if (method === 'PATCH') {
      const idx = collection.findIndex(i => String(i.id) === id)
      db[name][idx] = { ...db[name][idx], ...body, id: String(id) }
      writeDB(db)
      return sendJSON(res, 200, db[name][idx])
    }

    if (method === 'DELETE') {
      db[name] = collection.filter(i => String(i.id) !== id)
      writeDB(db)
      return sendJSON(res, 200, {})
    }
  }

  // 仪表盘
  if (method === 'GET' && path === '/dashboard') {
    return sendJSON(res, 200, db.dashboard || {})
  }

  return sendJSON(res, 404, { error: 'Not Found' })
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`  ✅ Mock API Server at http://localhost:${PORT}`)
  console.log(`  🔐 POST /auth/register   POST /auth/login   GET /auth/me`)
  console.log(`  📦 CRUD: /users /trades /lostFounds /groupBuys /errands /messages /chatMessages /dashboard`)
})
