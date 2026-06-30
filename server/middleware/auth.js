import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'campus_market_jwt_secret_2026'

/** 验证 JWT，失败不拒绝，设置 req.userId 或 null */
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.userId = decoded.userId
    } catch {
      req.userId = null
    }
  } else {
    req.userId = null
  }
  next()
}

/** 验证 JWT，失败返回 401 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' })
  }
  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}
