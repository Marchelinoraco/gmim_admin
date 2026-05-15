import { createRouter, createWebHistory } from "vue-router"
import AdminLayout from "@/layouts/AdminLayout.vue"

const routes = [
  { path: "/", redirect: "/super-admin/dashboard" },
  {
    path: "/super-admin",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/super-admin/dashboard" },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/super-admin/dashboard/DashboardView.vue")
      },
      // Gereja
      {
        path: "gereja",
        name: "DaftarGereja",
        component: () => import("@/views/super-admin/gereja/GerejaListView.vue")
      },
      {
        path: "gereja/tambah",
        name: "TambahGereja",
        component: () => import("@/views/super-admin/gereja/GerejaTambahView.vue")
      },
      {
        path: "gereja/:id",
        name: "DetailGereja",
        component: () => import("@/views/super-admin/gereja/GerejaDetailView.vue"),
        props: true
      },
      {
        path: "gereja/:id/edit",
        name: "EditGereja",
        component: () => import("@/views/super-admin/gereja/GerejaEditView.vue"),
        props: true
      },
      // Bendahara
      {
        path: "bendahara",
        name: "DaftarBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaListView.vue")
      },
      {
        path: "bendahara/tambah",
        name: "TambahBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaTambahView.vue")
      },
      {
        path: "bendahara/:id",
        name: "DetailBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaDetailView.vue"),
        props: true
      },
      {
        path: "bendahara/:id/edit",
        name: "EditBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaEditView.vue"),
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
