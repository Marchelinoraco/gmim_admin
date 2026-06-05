/*
 * Shared layout (nav + footer) untuk semua halaman skema arsitektur.
 * Disisipkan via JS agar konsisten tanpa menduplikasi markup di tiap file.
 * Setiap halaman set `window.PAGE = "<key>"` SEBELUM memuat script ini.
 */
(function () {
  const PAGES = [
    { key: "index", href: "index.html", num: "•", label: "Ringkasan" },
    { key: "01", href: "01-arsitektur.html", num: "01", label: "Arsitektur Multi-Tenant" },
    { key: "02", href: "02-onboarding.html", num: "02", label: "Autentikasi & Onboarding" },
    { key: "03", href: "03-model-data.html", num: "03", label: "Model Data (ERD)" },
    { key: "04", href: "04-modul-fitur.html", num: "04", label: "Modul Fitur" },
    { key: "05", href: "05-keamanan.html", num: "05", label: "Keamanan & RBAC" },
    { key: "08", href: "08-langganan.html", num: "08", label: "Langganan & Billing" },
    { key: "09", href: "09-operasional.html", num: "09", label: "Kesiapan Operasional" },
    { key: "10", href: "10-plan-lanjutan.html", num: "10", label: "Plan Fitur Lanjutan" },
    { key: "06", href: "06-roadmap.html", num: "06", label: "Roadmap" },
    { key: "07", href: "07-sso.html", num: "07", label: "SSO (ditunda)" },
  ];
  const active = window.PAGE || "index";

  const navItems = PAGES.map((p) => {
    const on = p.key === active;
    return `<a href="${p.href}"
      class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition
      ${on ? "bg-brand-600 text-white shadow-md shadow-brand-500/30" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"}">
      <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-extrabold
        ${on ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700"}">${p.num}</span>
      <span>${p.label}</span>
    </a>`;
  }).join("");

  const sidebar = document.getElementById("sidebar-nav");
  if (sidebar) sidebar.innerHTML = navItems;

  const mobile = document.getElementById("mobile-nav");
  if (mobile) {
    mobile.innerHTML = PAGES.map((p) => {
      const on = p.key === active;
      return `<option value="${p.href}" ${on ? "selected" : ""}>${p.num === "•" ? "" : p.num + " · "}${p.label}</option>`;
    }).join("");
    mobile.addEventListener("change", (e) => { window.location.href = e.target.value; });
  }

  // Prev/next footer
  const idx = PAGES.findIndex((p) => p.key === active);
  const prev = idx > 0 ? PAGES[idx - 1] : null;
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
  const footer = document.getElementById("page-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="mt-12 flex items-center justify-between border-t border-slate-200 pt-6 text-sm">
        ${prev ? `<a href="${prev.href}" class="inline-flex items-center gap-2 font-semibold text-slate-500 hover:text-brand-700">← ${prev.label}</a>` : "<span></span>"}
        ${next ? `<a href="${next.href}" class="inline-flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-900">${next.label} →</a>` : "<span></span>"}
      </div>
      <p class="mt-8 text-center text-xs text-slate-400">Skema Arsitektur SaaS Keuangan GMIM · dokumen rancangan · 2026-06-04 · Soli Deo Gloria</p>`;
  }
})();
