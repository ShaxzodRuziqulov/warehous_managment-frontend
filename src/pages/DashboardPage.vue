<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DashboardService } from '../service/DashboardService'
import { authState } from '../composables/useAuth'

const loading = ref(true)
const errorMessage = ref('')
const summary = ref({ products: 0, orders: 0, incomes: 0 })
const latestIncomes = ref<Record<string, unknown>[]>([])
const chartItems = ref<Array<{ label: string; value: number }>>([])

const maxChartValue = computed(() => Math.max(...chartItems.value.map((item) => item.value), 1))

const resolveChartValue = (entry: Record<string, unknown>) => Number(entry.value ?? entry.count ?? entry.total ?? 0)
const resolveChartLabel = (entry: Record<string, unknown>) => String(entry.label ?? entry.name ?? entry.status ?? 'Unknown')

const loadDashboard = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [products, orders, incomes, latest, chart] = await Promise.all([
      DashboardService.getProductCount(),
      DashboardService.getOrderCount(),
      DashboardService.getIncomeCount(),
      DashboardService.getLatestIncomes(),
      DashboardService.getChartData(),
    ])

    summary.value = { products, orders, incomes }
    latestIncomes.value = latest
    chartItems.value = chart.map((item: any) => ({
      label: resolveChartLabel(item),
      value: resolveChartValue(item),
    }))
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ?? error?.response?.data ?? 'Dashboard data could not be loaded.'
  } finally {
    loading.value = false
  }
}

const formatValue = (value: unknown) => {
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string' && value.includes('T')) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString()
  }
  return String(value ?? '-')
}

onMounted(loadDashboard)
</script>

<template>
  <section class="page-section">
    <div class="hero-card">
      <div>
        <p class="eyebrow">Overview</p>
        <h3>Welcome, {{ authState.user?.username || 'admin' }}</h3>
        <p class="hero-copy">
          This dashboard is wired to the documented backend counts, chart feed, and latest income activity.
        </p>
      </div>

      <div class="quick-links">
        <router-link class="quick-link" to="/products">Products</router-link>
        <router-link class="quick-link" to="/orders">Orders</router-link>
        <router-link class="quick-link" to="/stock">Stock</router-link>
        <router-link class="quick-link" to="/incomes">Incomes</router-link>
      </div>
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div class="stats-grid">
      <article class="stat-card">
        <span>Active products</span>
        <strong>{{ loading ? '...' : summary.products.toLocaleString() }}</strong>
      </article>
      <article class="stat-card">
        <span>Active orders</span>
        <strong>{{ loading ? '...' : summary.orders.toLocaleString() }}</strong>
      </article>
      <article class="stat-card">
        <span>Active incomes</span>
        <strong>{{ loading ? '...' : summary.incomes.toLocaleString() }}</strong>
      </article>
    </div>

    <div class="dashboard-grid">
      <article class="panel-card">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Chart</p>
            <h3>Product status</h3>
          </div>
          <button class="ghost-button" type="button" @click="loadDashboard">Refresh</button>
        </div>

        <div v-if="chartItems.length" class="chart-list">
          <div v-for="item in chartItems" :key="item.label" class="chart-row">
            <div class="chart-meta">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="chart-track">
              <div class="chart-bar" :style="{ width: `${(item.value / maxChartValue) * 100}%` }"></div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">No chart data returned by backend.</div>
      </article>

      <article class="panel-card">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Recent activity</p>
            <h3>Latest incomes</h3>
          </div>
        </div>

        <div v-if="latestIncomes.length" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="column in Object.keys(latestIncomes[0])" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(income, index) in latestIncomes" :key="index">
                <td v-for="column in Object.keys(latestIncomes[0])" :key="column">{{ formatValue(income[column]) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">No latest income entries returned by backend.</div>
      </article>
    </div>
  </section>
</template>
