<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' ? redirect : '/dashboard'
})

const submit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await login(form)
    await router.push(redirectPath.value)
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message ?? error?.response?.data ?? 'Login failed. Check username and password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-copy">
        <p class="eyebrow">Warehouse Management</p>
        <h1>Admin access</h1>
        <p>
          JWT auth, protected routing, dashboard counters, and CRUD workflows for the warehouse backend.
        </p>
        <ul class="login-highlights">
          <li>Products, stock, orders, incomes</li>
          <li>Suppliers, customers, warehouses, users</li>
          <li>Secondary admin resources in one reusable shell</li>
        </ul>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <div>
          <label for="username">Username</label>
          <input id="username" v-model.trim="form.username" type="text" placeholder="admin" required />
        </div>

        <div>
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" placeholder="password" required />
        </div>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <button class="primary-button" :disabled="loading" type="submit">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>
