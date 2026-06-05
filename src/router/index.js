import { createRouter, createWebHistory } from "vue-router"
import AdminLayout from "@/layouts/AdminLayout.vue"
import { useAdminAuthStore } from "@/stores/adminAuthStore"

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/LoginView.vue"),
  },
  { path: "/", redirect: "/super-admin/dashboard" },
  {
    path: "/super-admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/super-admin/dashboard" },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/super-admin/dashboard/DashboardView.vue"),
      },
      // Gereja
      {
        path: "gereja",
        name: "DaftarGereja",
        component: () => import("@/views/super-admin/gereja/GerejaListView.vue"),
      },
      {
        path: "gereja/tambah",
        name: "TambahGereja",
        component: () => import("@/views/super-admin/gereja/GerejaTambahView.vue"),
      },
      {
        path: "gereja/:id",
        name: "DetailGereja",
        component: () => import("@/views/super-admin/gereja/GerejaDetailView.vue"),
        props: true,
      },
      {
        path: "gereja/:id/edit",
        name: "EditGereja",
        component: () => import("@/views/super-admin/gereja/GerejaEditView.vue"),
        props: true,
      },
      // Bendahara / Pengguna
      {
        path: "bendahara",
        name: "DaftarBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaListView.vue"),
      },
      {
        path: "bendahara/tambah",
        name: "TambahBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaTambahView.vue"),
      },
      {
        path: "bendahara/:id",
        name: "DetailBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaDetailView.vue"),
        props: true,
      },
      {
        path: "bendahara/:id/edit",
        name: "EditBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaEditView.vue"),
        props: true,
      },
      // Langganan
      {
        path: "langganan",
        name: "DaftarLangganan",
        component: () => import("@/views/super-admin/langganan/LanggananListView.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAdminAuthStore()

  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: "Login" })
  }

  if (to.name === "Login" && authStore.isAuthenticated) {
    return next({ name: "Dashboard" })
  }

  next()
})

export default router
