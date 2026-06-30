import { Router } from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'campus_market_jwt_secret_2026'

const router = Router()

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, studentId: user.studentId || user.student_id },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
}

function safeUser(row) {
  const { password_md5, ...rest } = row
  return rest
}

const USER_SELECT =
  'SELECT id, student_id AS studentId, name, avatar, school, department, grade, join_date AS joinDate, contact FROM users'

// POST /auth/register
router.post('/register', async (req, res) => {
  const { studentId, password, name, school, department, grade, contact } = req.body
  if (!studentId || !password || !name) {
    return res.status(400).json({ error: '学号、密码和姓名为必填项' })
  }
  if (!/^\d{10}$/.test(studentId)) {
    return res.status(400).json({ error: '学号必须为10位数字' })
  }
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE student_id = ?', [studentId])
    if (existing.length > 0) {
      return res.status(409).json({ error: '该学号已被注册' })
    }
    const passwordMd5 = md5(password)
    const [result] = await pool.query(
      `INSERT INTO users (student_id, password_md5, name, school, department, grade, contact, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [studentId, passwordMd5, name, school || '', department || '', grade || '', contact || ''],
    )
    const [rows] = await pool.query(USER_SELECT + ' WHERE id = ?', [result.insertId])
    const user = rows[0]
    const token = signToken({ id: user.id, student_id: user.studentId })
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { studentId, password } = req.body
  if (!studentId || !password) {
    return res.status(400).json({ error: '请输入学号和密码' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, student_id AS studentId, name, avatar, school, department, grade, join_date AS joinDate, contact, password_md5 FROM users WHERE student_id = ?',
      [studentId],
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: '学号或密码错误' })
    }
    const user = rows[0]
    if (user.password_md5 !== md5(password)) {
      return res.status(401).json({ error: '学号或密码错误' })
    }
    const token = signToken(user)
    res.json({ token, user: safeUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(USER_SELECT + ' WHERE id = ?', [req.userId])
    if (rows.length === 0) return res.status(404).json({ error: '用户不存在' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
