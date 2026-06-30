<template>
  <div class="heatmap-wrapper">
    <div class="heatmap-header">
      <span class="heatmap-title">📊 活动热力图</span>
      <span class="heatmap-subtitle">近 20 周活动分布</span>
    </div>

    <div class="heatmap-body">
      <!-- 月份标签行 -->
      <div class="heatmap-months">
        <span class="day-label-placeholder" />
        <div class="months-row">
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

      <div class="heatmap-grid-row">
        <!-- 星期标签列 -->
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

        <!-- 格子矩阵 -->
        <div class="cells-grid">
          <div
            v-for="cell in cells"
            :key="cell.date"
            class="cell"
            :class="{ 'cell--today': cell.isToday }"
            :style="{ backgroundColor: cell.color, gridColumnStart: cell.col, gridRowStart: cell.row }"
            :title="cell.tooltip"
            @mouseenter="hoveredCell = cell"
            @mouseleave="hoveredCell = null"
          />
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div v-if="hoveredCell" class="heatmap-tooltip">
      {{ hoveredCell.tooltip }}
    </div>

    <!-- 图例 -->
    <div class="heatmap-legend">
      <span class="legend-label">少</span>
      <span class="legend-block" style="background:#ebedf0" />
      <span class="legend-block" style="background:#9be9a8" />
      <span class="legend-block" style="background:#40c463" />
      <span class="legend-block" style="background:#30a14e" />
      <span class="legend-block" style="background:#216e39" />
      <span class="legend-label">多</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface ActivityDay {
  date: string   // 'YYYY-MM-DD'
  count: number
}

const props = withDefaults(defineProps<{
  activities: ActivityDay[]
  /** 展示多少周（从今天往前算） */
  weekCount?: number
}>(), {
  weekCount: 20,
})

const gridCols = computed(() => props.weekCount)

const hoveredCell = ref<CellData | null>(null)

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
  if (count === 0) return '#ebedf0'
  if (count === 1) return '#9be9a8'
  if (count <= 3) return '#40c463'
  if (count <= 6) return '#30a14e'
  return '#216e39'
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

  // 计算网格起始日期：从今天往前推 weekCount 周，并对齐到周一
  const totalDays = props.weekCount * 7
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - totalDays + 1)
  // 对齐到周一 (getDay() 0=Sun, 1=Mon, ..., 6=Sat)
  const dayOfWeek = startDate.getDay()
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startDate.setDate(startDate.getDate() + offsetToMonday)

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

/** 生成月份标签：收集每一列对应哪个月份 */
const monthLabels = computed(() => {
  const cols = props.weekCount
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalDays = cols * 7
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - totalDays + 1)
  const dayOfWeek = startDate.getDay()
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startDate.setDate(startDate.getDate() + offsetToMonday)

  const labels: { label: string; col: number }[] = []
  let lastMonth = -1

  for (let col = 1; col <= cols; col++) {
    const cur = new Date(startDate)
    cur.setDate(startDate.getDate() + (col - 1) * 7)
    const month = cur.getMonth()
    if (month !== lastMonth) {
      labels.push({
        label: `${cur.getFullYear()}-${String(month + 1).padStart(2, '0')}`,
        col,
      })
      lastMonth = month
    }
  }

  return labels
})

/** 星期标签：周一/三/五 */
const dayLabels = computed(() => [
  { label: '一', row: 1 },
  { label: '三', row: 3 },
  { label: '五', row: 5 },
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

.heatmap-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.heatmap-title {
  font-weight: 600;
  font-size: 16px;
}

.heatmap-subtitle {
  font-size: 12px;
  color: #999;
}

.heatmap-body {
  overflow-x: auto;
  padding-bottom: 4px;
}

.heatmap-months {
  display: flex;
  margin-bottom: 2px;
}

.day-label-placeholder {
  width: 24px;
  flex-shrink: 0;
}

.months-row {
  display: grid;
  grid-template-columns: repeat(v-bind(gridCols), 13px);
  gap: 3px;
  flex: 1;
  position: relative;
}

.month-label {
  font-size: 10px;
  color: #999;
  white-space: nowrap;
}

.heatmap-grid-row {
  display: flex;
}

.day-labels {
  display: grid;
  grid-template-rows: repeat(7, 13px);
  gap: 3px;
  width: 24px;
  flex-shrink: 0;
  margin-right: 4px;
}

.day-label {
  font-size: 10px;
  color: #999;
  line-height: 13px;
  text-align: right;
  padding-right: 3px;
}

.cells-grid {
  display: grid;
  grid-template-rows: repeat(7, 13px);
  grid-template-columns: repeat(v-bind(gridCols), 13px);
  gap: 3px;
}

.cell {
  width: 13px;
  height: 13px;
  border-radius: 2px;
  cursor: pointer;
  transition: outline 0.1s;
  outline: 1px solid transparent;
  outline-offset: 0;
}

.cell:hover {
  outline-color: rgba(0, 0, 0, 0.3);
}

.cell--today {
  outline-color: #409eff;
  outline-width: 2px;
}

.heatmap-tooltip {
  position: absolute;
  top: -34px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 10px;
}

.legend-label {
  font-size: 11px;
  color: #999;
  margin: 0 3px;
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
  background: #ddd;
  border-radius: 2px;
}
</style>
