import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "./ui/layouts/AdminLayout.vue";
import DashboardPage from "./ui/pages/super-admin/DashboardPage.vue";

import ChurchesListPage from "./ui/pages/super-admin/churches/ChurchesListPage.vue";
import ChurchCreatePage from "./ui/pages/super-admin/churches/ChurchCreatePage.vue";
import ChurchDetailPage from "./ui/pages/super-admin/churches/ChurchDetailPage.vue";
import ChurchEditPage from "./ui/pages/super-admin/churches/ChurchEditPage.vue";

import TreasurersListPage from "./ui/pages/super-admin/treasurers/TreasurersListPage.vue";
import TreasurerCreatePage from "./ui/pages/super-admin/treasurers/TreasurerCreatePage.vue";
import TreasurerDetailPage from "./ui/pages/super-admin/treasurers/TreasurerDetailPage.vue";
import TreasurerEditPage from "./ui/pages/super-admin/treasurers/TreasurerEditPage.vue";

import SubscriptionsPage from "./ui/pages/super-admin/subscriptions/SubscriptionsPage.vue";
import PaymentsPage from "./ui/pages/super-admin/subscriptions/PaymentsPage.vue";
import SubscriptionHistoryPage from "./ui/pages/super-admin/subscriptions/SubscriptionHistoryPage.vue";

import MonitoringPage from "./ui/pages/super-admin/monitoring/MonitoringPage.vue";

import SettingsPage from "./ui/pages/super-admin/settings/SettingsPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/super-admin/dashboard" },
    {
      path: "/super-admin",
      component: AdminLayout,
      children: [
        { path: "", redirect: "/super-admin/dashboard" },
        { path: "dashboard", component: DashboardPage },

        { path: "churches", component: ChurchesListPage },
        { path: "churches/new", component: ChurchCreatePage },
        { path: "churches/:id", component: ChurchDetailPage, props: true },
        { path: "churches/:id/edit", component: ChurchEditPage, props: true },

        { path: "treasurers", component: TreasurersListPage },
        { path: "treasurers/new", component: TreasurerCreatePage },
        { path: "treasurers/:id", component: TreasurerDetailPage, props: true },
        { path: "treasurers/:id/edit", component: TreasurerEditPage, props: true },

        { path: "subscriptions", component: SubscriptionsPage },
        { path: "payments", component: PaymentsPage },
        { path: "subscription-history", component: SubscriptionHistoryPage },

        { path: "monitoring", component: MonitoringPage },
        { path: "settings", component: SettingsPage }
      ]
    }
  ]
});
