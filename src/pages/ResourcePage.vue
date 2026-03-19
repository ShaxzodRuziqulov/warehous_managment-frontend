<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { getModuleByKey } from '../config/modules'
import { ApiService } from '../service/ApiService'

const props = defineProps<{ moduleKey: string }>()

const resource = computed(() => getModuleByKey(props.moduleKey))
const items = ref<Record<string, unknown>[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(10)
const search = ref('')
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const detail = ref<Record<string, unknown> | null>(null)
const form = reactive<Record<string, any>>({})
const editingId = ref<number | string | null>(null)

const formFields = computed(() => resource.value?.fields ?? [])
const columns = computed(() => resource.value?.tableColumns ?? [])
const supportsPaging = computed(() => resource.value?.supportsPaging !== false)

const hydrateForm = (payload?: Record<string, unknown>) => {
  formFields.value.forEach((field) => {
    form[field.key] = payload?.[field.key] ?? ''
  })
}

const resetForm = () => {
  editingId.value = null
  hydrateForm()
}

const formatValue = (value: unknown) => {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string' && value.includes('T')) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString()
  }
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return String(value ?? '-')
}

const loadItems = async () => {
  if (!resource.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await ApiService.loadCollection(
      resource.value.basePath,
      supportsPaging.value,
      search.value,
      page.value,
      size.value,
    )
    items.value = response.content
    total.value = response.totalElements ?? response.content.length
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ?? error?.response?.data ?? `${resource.value.label} data could not be loaded.`
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!resource.value) return

  submitting.value = true
  errorMessage.value = ''

  const payload = Object.fromEntries(
    Object.entries(form).map(([key, value]) => {
      const normalized =
        typeof value === 'string' && value.includes(',') && key === 'roles'
          ? value.split(',').map((item) => item.trim()).filter(Boolean)
          : value
      return [key, normalized]
    }),
  )

  try {
    if (editingId.value !== null) {
      await ApiService.update(resource.value.basePath, editingId.value, payload)
    } else {
      await ApiService.create(resource.value.basePath, payload)
    }
    resetForm()
    await loadItems()
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ?? error?.response?.data ?? `${resource.value.label} could not be saved.`
  } finally {
    submitting.value = false
  }
}

const inspectRow = async (row: Record<string, unknown>) => {
  if (!resource.value) return
  const id = ApiService.getIdValue(row)
  if (id === undefined) {
    detail.value = row
    return
  }
  try {
    detail.value = await ApiService.detail(resource.value.basePath, id)
  } catch {
    detail.value = row
  }
}

const editRow = (row: Record<string, unknown>) => {
  editingId.value = ApiService.getIdValue(row) ?? null
  hydrateForm(row)
}

const runWorkflow = async (row: Record<string, unknown>, endpoint: (id: number | string) => string) => {
  const id = ApiService.getIdValue(row)
  if (id === undefined) return
  try {
    await ApiService.workflow(endpoint(id))
    await loadItems()
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message ?? error?.response?.data ?? 'Workflow action failed.'
  }
}

const removeRow = async (row: Record<string, unknown>) => {
  if (!resource.value) return
  const id = ApiService.getIdValue(row)
  if (id === undefined) return
  if (!window.confirm(`Delete this ${resource.value.label.toLowerCase()} record?`)) return

  try {
    await ApiService.remove(resource.value.basePath, id, resource.value.deleteEndpoint)
    if (String(editingId.value) === String(id)) resetForm()
    await loadItems()
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ?? error?.response?.data ?? `${resource.value.label} could not be deleted.`
  }
}

watch(
  () => props.moduleKey,
  () => {
    detail.value = null
    search.value = ''
    page.value = 0
    resetForm()
    loadItems()
  },
)

watch(search, () => {
  page.value = 0
  loadItems()
})

onMounted(() => {
  hydrateForm()
  loadItems()
})
</script>

<template>
  <section v-if="resource" class="page-section">
    <div class="resource-header">
      <div>
        <p class="eyebrow">Resource</p>
        <h3>{{ resource.label }}</h3>
        <p class="section-copy">{{ resource.description }}</p>
      </div>

      <div class="toolbar">
        <input v-model.trim="search" class="search-input" type="search" placeholder="Search records" />
        <button class="ghost-button" type="button" @click="loadItems">Refresh</button>
      </div>
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div class="resource-grid">
      <article class="panel-card">
        <div class="panel-header">
          <div>
            <p class="eyebrow">{{ editingId !== null ? 'Edit' : 'Create' }}</p>
            <h3>{{ editingId !== null ? `Update ${resource.label}` : `New ${resource.label}` }}</h3>
          </div>
        </div>

        <form class="resource-form" @submit.prevent="submit">
          <label v-for="field in formFields" :key="field.key">
            <span>{{ field.label }}</span>

            <textarea v-if="field.type === 'textarea'" v-model="form[field.key]" :placeholder="field.placeholder" rows="4" />

            <select v-else-if="field.type === 'select'" v-model="form[field.key]">
              <option value="">Select {{ field.label }}</option>
              <option v-for="option in field.options || []" :key="String(option.value)" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <input
              v-else
              v-model="form[field.key]"
              :type="field.type === 'number' ? 'number' : 'text'"
              :placeholder="field.placeholder"
            />
          </label>

          <div class="form-actions">
            <button class="primary-button" :disabled="submitting" type="submit">
              {{ submitting ? 'Saving...' : editingId !== null ? 'Update' : 'Create' }}
            </button>
            <button class="ghost-button" type="button" @click="resetForm">Clear</button>
          </div>
        </form>
      </article>

      <article class="panel-card panel-span-2">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Listing</p>
            <h3>{{ resource.label }} table</h3>
          </div>
          <span class="muted-text">{{ total }} total</span>
        </div>

        <div v-if="loading" class="empty-state">Loading data...</div>
        <div v-else-if="!items.length" class="empty-state">No records found.</div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="column in columns" :key="column">{{ column }}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in items" :key="String(ApiService.getIdValue(row) ?? JSON.stringify(row))">
                <td v-for="column in columns" :key="column">{{ formatValue(row[column]) }}</td>
                <td>
                  <div class="row-actions">
                    <button class="table-button" type="button" @click="inspectRow(row)">View</button>
                    <button class="table-button" type="button" @click="editRow(row)">Edit</button>
                    <button
                      v-for="action in resource.actions || []"
                      :key="action.key"
                      class="table-button"
                      type="button"
                      @click="runWorkflow(row, action.endpoint)"
                    >
                      {{ action.label }}
                    </button>
                    <button class="table-button danger" type="button" @click="removeRow(row)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="ghost-button" type="button" :disabled="page === 0" @click="page -= 1; loadItems()">Prev</button>
          <span>Page {{ page + 1 }}</span>
          <button class="ghost-button" type="button" :disabled="(page + 1) * size >= total" @click="page += 1; loadItems()">Next</button>
        </div>
      </article>
    </div>

    <article v-if="detail" class="panel-card">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Detail</p>
          <h3>{{ resource.label }} detail</h3>
        </div>
        <button class="ghost-button" type="button" @click="detail = null">Close</button>
      </div>
      <div class="detail-grid">
        <div v-for="(value, key) in detail" :key="key" class="detail-item">
          <span>{{ key }}</span>
          <strong>{{ formatValue(value) }}</strong>
        </div>
      </div>
    </article>
  </section>
</template>
