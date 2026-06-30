import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const SELECT = `SELECT id, user_id AS userId, from_name AS \`from\`,
  content, time, unread FROM messages`

// GET /messages — auth required, uses JWT userId
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      SELECT + ' WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId],
    )
    // Convert unread from 0/1 to boolean
    const mapped = rows.map((r) => ({ ...r, unread: !!r.unread }))
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /messages/:id — mark as read
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM messages WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ])
    if (existing.length === 0) return res.status(404).json({ error: 'Not found' })
    await pool.query('UPDATE messages SET unread = 0 WHERE id = ?', [req.params.id])
    const [rows] = await pool.query(SELECT + ' WHERE id = ?', [req.params.id])
    const mapped = { ...rows[0], unread: !!rows[0].unread }
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
