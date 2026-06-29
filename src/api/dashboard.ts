import http from './http'

export interface CategoryItem {
  name: string
  count: number
  color: string
}

export interface WeeklyItem {
  day: string
  count: number
}

export interface DashboardData {
  id: number
  userCount: number
  productCount: number
  orderCount: number
  activeToday: number
  weeklyData: WeeklyItem[]
  categories: CategoryItem[]
}

export function getDashboard() {
  return http.get<DashboardData>('/dashboard/1')
}
