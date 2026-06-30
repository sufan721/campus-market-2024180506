import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const SELECT = `SELECT id, user_id AS userId, title, type, item_name AS itemName,
  location, event_time AS eventTime, contact, status, image, description FROM lost_founds`

// GET /lostFounds
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

// GET /lostFounds/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /lostFounds
router.post('/', requireAuth, async (req, res) => {
  const { title, type, itemName, location, eventTime, contact, status, image, description } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO lost_founds (user_id, title, type, item_name, location, event_time, contact, status, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, type, itemName, location, eventTime, contact, status || 'open', image || '', description || ''],
    )
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
