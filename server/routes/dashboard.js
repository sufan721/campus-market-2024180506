import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// GET /dashboard/1 — public singleton
router.get('/1', async (req, res) => {
  try {
    const [dashRows] = await pool.query('SELECT * FROM dashboard WHERE id = 1')
    if (dashRows.length === 0) return res.status(404).json({ error: 'Not found' })

    const dash = dashRows[0]
    const [weekly] = await pool.query(
      'SELECT day, count FROM dashboard_weekly WHERE dashboard_id = 1 ORDER BY id',
    )
    const [categories] = await pool.query(
      'SELECT name, count, color FROM dashboard_categories WHERE dashboard_id = 1 ORDER BY id',
    )

    res.json({
      id: dash.id,
      userCount: dash.user_count,
      productCount: dash.product_count,
      orderCount: dash.order_count,
      activeToday: dash.active_today,
      weeklyData: weekly,
      categories,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
