import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const SELECT = `SELECT id, user_id AS userId, contact_name AS contactName,
  content, time, direction FROM chat_messages`

// GET /chatMessages?contactName= — auth required
// If contactName omitted, returns all chat messages for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  const { contactName } = req.query
  try {
    if (contactName) {
      const [rows] = await pool.query(
        SELECT + ' WHERE user_id = ? AND contact_name = ? ORDER BY created_at ASC',
        [req.userId, contactName],
      )
      return res.json(rows)
    }
    // Return all chat messages for this user (useful for heatmap / activity stats)
    const [rows] = await pool.query(
      SELECT + ' WHERE user_id = ? ORDER BY created_at ASC',
      [req.userId],
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /chatMessages — auth required
router.post('/', requireAuth, async (req, res) => {
  const { contactName, content, time, direction } = req.body
  if (!contactName || !content) {
    return res.status(400).json({ error: 'contactName and content are required' })
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO chat_messages (user_id, contact_name, content, time, direction) VALUES (?, ?, ?, ?, ?)',
      [req.userId, contactName, content, time || '', direction || 'sent'],
    )
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
