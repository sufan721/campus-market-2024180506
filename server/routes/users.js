import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// GET /users/:id (public profile, strips sensitive fields)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, avatar, school, department, grade, join_date AS joinDate, contact FROM users WHERE id = ?',
      [req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ error: '用户不存在' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
