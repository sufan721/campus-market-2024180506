<template>
  <div class="heatmap-wrapper">
    <div class="heatmap-body">
      <!-- 月份标签行 -->
      <div class="months-row">
        <div class="month-spacer" />
        <div class="months-inner">
          <span
            v-for="(m, i) in monthLabels"
            :key="i"
            class="month-label"
            :style="{ gridColumnStart: m.col }"
          >
            {{ m.label }}
          </span>
        </div>
      </div>

      <!-- 主网格：星期标签 + 格子 -->
      <div class="grid-row">
        <div class="day-labels">
          <span
            v-for="(d, i) in dayLabels"
            :key="i"
            class="day-label"
            :style="{ gridRowStart: d.row }"
          >
            {{ d.label }}
          </span>
        </div>

        <div class="cells-grid">
          <div
            v-for="cell in cells"
            :key="cell.date"
            class="cell"
            :class="{ 'cell--today': cell.isToday }"
            :style="{ backgroundColor: cell.color, gridColumnStart: cell.col, gridRowStart: cell.row }"
            :title="cell.tooltip"
          />
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="heatmap-legend">
      <span class="legend-label">Less</span>
      <span class="legend-block" :style="{ background: 'var(--color-heatmap-empty)' }" />
      <span class="legend-block" :style="{ background: 'var(--color-heatmap-l1)' }" />
      <span class="legend-block" :style="{ background: 'var(--color-heatmap-l2)' }" />
      <span class="legend-block" :style="{ background: 'var(--color-heatmap-l3)' }" />
      <span class="legend-block" :style="{ background: 'var(--color-heatmap-l4)' }" />
      <span class="legend-label">More</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ActivityDay {
  date: string   // 'YYYY-MM-DD'
  count: number
}

const props = withDefaults(defineProps<{
  activities: ActivityDay[]
  /** 展示多少周（从今天往前算，默认 26 周 ≈ 6 个月） */
  weekCount?: number
}>(), {
  weekCount: 26,
})

const gridCols = computed(() => props.weekCount)

// ====== 内部数据结构 ======

interface CellData {
  date: string
  count: number
  color: string
  col: number
  row: number
  tooltip: string
  isToday: boolean
}

/**
 * 根据 count 返回颜色（GitHub 风格绿色阶梯）
 */
function pickColor(count: number): string {
  if (count === 0) return 'var(--color-heatmap-empty)'
  if (count === 1) return 'var(--color-heatmap-l1)'
  if (count <= 3) return 'var(--color-heatmap-l2)'
  if (count <= 6) return 'var(--color-heatmap-l3)'
  return 'var(--color-heatmap-l4)'
}

/**
 * 格式化日期为中文展示
 */
function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${y}年${m}月${day}日 ${weekdays[d.getDay()]}`
}

const cells = computed<CellData[]>(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 构建日期 → count 的映射
  const countMap = new Map<string, number>()
  for (const a of props.activities) {
    const key = a.date.slice(0, 10) // 确保取 YYYY-MM-DD
    countMap.set(key, (countMap.get(key) || 0) + a.count)
  }

  // 以"本周日"为网格终点，往前推 weekCount 周，确保今天一定在网格内
  const totalDays = props.weekCount * 7
  const todayDay = today.getDay() // 0=Sun, 1=Mon, …, 6=Sat
  const daysToSunday = todayDay === 0 ? 0 : 7 - todayDay
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysToSunday)

  // startDate = endDate 往前 totalDays-1 天（自动落在周一）
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - totalDays + 1)

  const result: CellData[] = []
  const todayStr = toDateString(today)

  for (let d = 0; d < totalDays; d++) {
    const cur = new Date(startDate)
    cur.setDate(startDate.getDate() + d)
    const dateStr = toDateString(cur)
    const count = countMap.get(dateStr) || 0
    const col = Math.floor(d / 7) + 1 // 第几周，从 1 开始
    const row = cur.getDay() === 0 ? 7 : cur.getDay() // Mon=1 ... Sun=7

    result.push({
      date: dateStr,
      count,
      color: pickColor(count),
      col,
      row,
      tooltip: `${formatDateCN(dateStr)} — ${count} 次活动`,
      isToday: dateStr === todayStr,
    })
  }

  return result
})

/** 生成月份标签：收集每一列对应哪个月份（GitHub 风格短英文） */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const monthLabels = computed(() => {
  const cols = props.weekCount
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalDays = cols * 7
  const todayDay = today.getDay()
  const daysToSunday = todayDay === 0 ? 0 : 7 - todayDay
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysToSunday)
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - totalDays + 1)

  const labels: { label: string; col: number }[] = []
  let lastMonth = -1

  for (let col = 1; col <= cols; col++) {
    const cur = new Date(startDate)
    cur.setDate(startDate.getDate() + (col - 1) * 7)
    const month = cur.getMonth()
    if (month !== lastMonth) {
      labels.push({
        label: MONTH_NAMES[month],
        col,
      })
      lastMonth = month
    }
  }

  return labels
})

/** 星期标签：Mon / Wed / Fri */
const dayLabels = computed(() => [
  { label: 'Mon', row: 1 },
  { label: 'Wed', row: 3 },
  { label: 'Fri', row: 5 },
])

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<style scoped>
.heatmap-wrapper {
  position: relative;
}

.heatmap-body {
  overflow-x: auto;
  padding-bottom: 4px;
}

/* ====== 月份行 ====== */
.months-row {
  display: flex;
  margin-bottom: 4px;
}

.month-spacer {
  width: 32px;
  flex-shrink: 0;
}

.months-inner {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(v-bind(gridCols), 1fr);
  gap: 3px;
}

.month-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ====== 主网格行（星期 + 格子） ====== */
.grid-row {
  display: flex;
  align-items: stretch;
}

.day-labels {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  gap: 3px;
  width: 32px;
  flex-shrink: 0;
}

.day-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
}

.cells-grid {
  flex: 1;
  display: grid;
  grid-template-rows: repeat(7, auto);
  grid-template-columns: repeat(v-bind(gridCols), 1fr);
  gap: 3px;
}

/* ====== 格子 ====== */
.cell {
  aspect-ratio: 1;
  border-radius: 2px;
  cursor: pointer;
  transition: outline 0.1s;
  outline: 1px solid var(--shadow-heatmap-cell);
  outline-offset: -1px;
}

.cell:hover {
  outline-color: rgba(0, 0, 0, 0.3);
}

.cell--today {
  outline-color: var(--el-color-primary);
  outline-width: 2px;
}

/* ====== 图例 ====== */
.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 10px;
}

.legend-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  margin: 0 4px;
}

.legend-block {
  width: 11px;
  height: 11px;
  border-radius: 2px;
}

/* 滚动条美化 */
.heatmap-body::-webkit-scrollbar {
  height: 4px;
}

.heatmap-body::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: 2px;
}
</style>
