import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const SELECT = `SELECT id, user_id AS userId, title, category, price,
  \`condition\`, location, publisher, publish_time AS publishTime,
  image, status, description FROM trades`

// GET /trades — public list with optional userId filter
router.get('/', async (req, res) => {
  try {
    const { userId, sort, order, limit } = req.query
    let sql = SELECT
    const params = []
    if (userId) {
      sql += ' WHERE user_id = ?'
      params.push(Number(userId))
    }
    if (sort === 'publishTime') {
      sql += ` ORDER BY publish_time ${order === 'asc' ? 'ASC' : 'DESC'}`
    } else {
      sql += ' ORDER BY created_at DESC'
    }
    if (limit) {
      sql += ' LIMIT ?'
      params.push(Number(limit))
    }
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /trades/:id — public single item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /trades — auth required
router.post('/', requireAuth, async (req, res) => {
  const { title, category, price, condition, location, publisher, publishTime, image, status, description } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO trades (user_id, title, category, price, \`condition\`, location, publisher, publish_time, image, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, category, price, condition, location, publisher, publishTime, image || '', status || 'open', description || ''],
    )
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
