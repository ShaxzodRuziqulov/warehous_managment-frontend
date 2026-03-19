<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { primaryModules, secondaryModules } from '../config/modules'
import { authState, logout } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)

const pageTitle = computed(() => (route.meta.title as string) ?? 'Warehouse Admin')
const currentUserLabel = computed(() => authState.user?.username ?? 'Admin')
const isActive = (path: string) => route.path === `/${path}`

const closeSidebar = () => {
  sidebarOpen.value = false
}

const performLogout = async () => {
  logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-shell">
    <button
      v-if="sidebarOpen"
      class="sidebar-overlay"
      type="button"
      aria-label="Close navigation"
      @click="closeSidebar"
    ></button>

    <aside :class="['sidebar', { 'sidebar-open': sidebarOpen }]">
      <div class="sidebar-top">
        <div class="brand">
          <div class="brand-mark">WM</div>
          <div>
            <p class="eyebrow">Warehouse</p>
            <h1>Admin Panel</h1>
          </div>
        </div>

        <button class="sidebar-close" type="button" aria-label="Close sidebar" @click="closeSidebar">
          Close
        </button>
      </div>

      <div class="sidebar-body">
        <router-link
          to="/dashboard"
          class="nav-link nav-link-dashboard"
          :class="{ active: route.path === '/dashboard' }"
          @click="closeSidebar"
        >
          <span>Overview</span>
          <small>Dashboard</small>
        </router-link>

        <nav class="nav-section">
          <p class="nav-title">Core Modules</p>
          <router-link
            v-for="module in primaryModules"
            :key="module.key"
            :to="`/${module.route}`"
            class="nav-link"
            :class="{ active: isActive(module.route) }"
            @click="closeSidebar"
          >
            <span>{{ module.shortLabel }}</span>
            <small>{{ module.label }}</small>
          </router-link>
        </nav>

        <nav class="nav-section">
          <p class="nav-title">Secondary</p>
          <div class="nav-compact-grid">
            <router-link
              v-for="module in secondaryModules"
              :key="module.key"
              :to="`/${module.route}`"
              class="nav-link nav-link-compact"
              :class="{ active: isActive(module.route) }"
              @click="closeSidebar"
            >
              <span>{{ module.shortLabel }}</span>
              <small>{{ module.label }}</small>
            </router-link>
          </div>
        </nav>
      </div>

      <div class="sidebar-footer">
        <p class="eyebrow">Signed in as</p>
        <strong>{{ currentUserLabel }}</strong>
        <span>{{ authState.user?.roles?.join(', ') || 'ROLE_ADMIN' }}</span>
      </div>
    </aside>

    <div class="content-shell">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-button" type="button" @click="sidebarOpen = !sidebarOpen">Menu</button>
          <div>
            <p class="eyebrow">Warehouse Management</p>
            <h2>{{ pageTitle }}</h2>
          </div>
        </div>

        <div class="topbar-right">
          <div class="user-chip">
            <strong>{{ currentUserLabel }}</strong>
            <span>{{ authState.user?.roles?.join(', ') || 'ROLE_ADMIN' }}</span>
          </div>
          <button class="ghost-button" type="button" @click="performLogout">Logout</button>
        </div>
      </header>

      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
