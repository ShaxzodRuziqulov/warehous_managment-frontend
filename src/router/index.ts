import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '../layouts/Layout.vue'
import LoginView from '../pages/LoginPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import ResourcePage from '../pages/ResourcePage.vue'
import NotFound from '../components/NotFound.vue'
import { adminModules } from '../config/modules'
import { isAuthenticated } from '../lib/auth'

const childRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
    },
  },
]

adminModules.forEach((module) => {
  childRoutes.push({
    path: module.route,
    name: module.route,
    component: ResourcePage,
    props: {
      moduleKey: module.key,
    },
    meta: {
      requiresAuth: true,
      title: module.label,
    },
  })
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
    },
    children: childRoutes,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      guestOnly: true,
      title: 'Login',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: 'Not Found',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (typeof to.meta.title === 'string') {
    document.title = `${to.meta.title} | Warehouse Admin`
  }

  if (to.meta.requiresAuth && !isAuthenticated()) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.guestOnly && isAuthenticated()) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
