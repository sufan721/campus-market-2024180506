import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const SELECT = `SELECT id, user_id AS userId, title, task_type AS taskType,
  reward, from_location AS \`from\`, to_location AS \`to\`,
  deadline, publisher, status, image, description FROM errands`

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
  const { title, taskType, reward, from, to, deadline, publisher, status, image, description } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO errands (user_id, title, task_type, reward, from_location, to_location, deadline, publisher, status, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, taskType, reward || 0, from, to, deadline, publisher, status || 'open', image || '', description || ''],
    )
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
