import { ApiService } from './ApiService'

export const DashboardService = {
  getProductCount: () => ApiService.count('/api/admin/product'),
  getOrderCount: () => ApiService.count('/api/admin/order'),
  getIncomeCount: () => ApiService.count('/api/admin/income'),
  getLatestIncomes: () => ApiService.latestIncomes(5),
  getChartData: () => ApiService.productChart(),
}
