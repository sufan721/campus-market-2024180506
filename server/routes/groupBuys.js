import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const SELECT = `SELECT id, user_id AS userId, title, type,
  target_count AS targetCount, current_count AS currentCount,
  deadline, location, publisher, status, image, description FROM group_buys`

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    let sql = SELECT
    const params = []
    if (userId) {
      sql += ' WHERE user_id = ?'
      params.push(Number(userId))
    }
    sql += ' ORDER BY created_at DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, async (req, res) => {
  const { title, type, targetCount, currentCount, deadline, location, publisher, status, image, description } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO group_buys (user_id, title, type, target_count, current_count, deadline, location, publisher, status, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, type, targetCount || 0, currentCount || 0, deadline, location, publisher, status || 'open', image || '', description || ''],
    )
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
