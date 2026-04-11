// ============================================
// DIGITAL CORTE — App Controller (Clean + Mobile)
// ============================================

const App = {
  currentModule: 'dashboard',

  init() {
    Store.seedDemoData();
    
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
      const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const d = new Date();
      dateEl.textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    }

    document.querySelectorAll('.icon-nav-btn[data-module]').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.module));
    });

    this.initMobileMenu();
    this.navigate(this.currentModule);
  },

  initMobileMenu() {
    const items = [
      { module: 'dashboard', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="10" width="7" height="11" rx="1"/><rect x="3" y="13" width="7" height="8" rx="1"/></svg>' },
      { module: 'orcamentos', label: 'Orçamentos', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>' },
      { module: 'clientes', label: 'Clientes', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
      { module: 'projetos', label: 'Projetos', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' },
      { module: 'estoque', label: 'Estoque', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8l-7-4-7 4v8l7 4 7-4z"/></svg>', badge: 'estoque-alert-badge' },
      { module: 'financeiro', label: 'Financeiro', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
      { module: 'negociacoes', label: 'Negociações', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 8-4 4-2-2"/></svg>' },
      { module: 'metricas', label: 'Métricas', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>' },
    ];

    const container = document.getElementById('mobileMenuItems');
    container.innerHTML = items.map(item => {
      const badge = item.badge ? `<span class="badge" id="${item.badge}" style="display:none">0</span>` : '';
      return `<button class="mobile-menu-btn" data-module="${item.module}" onclick="App.navigateMobile('${item.module}')">
        <span class="icon">${item.icon}</span>
        ${item.label}
        ${badge}
      </button>`;
    }).join('');
  },

  navigate(moduleName) {
    this.currentModule = moduleName;
    
    document.querySelectorAll('.icon-nav-btn[data-module]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === moduleName);
    });

    const content = document.getElementById('main-content');
    
    const modules = {
      dashboard: DashboardModule,
      orcamentos: OrcamentoModule,
      clientes: ClientesModule,
      projetos: ProjetosModule,
      estoque: EstoqueModule,
      financeiro: FinanceiroModule,
      negociacoes: NegociacoesModule,
      metricas: MetricasModule,
    };

    const mod = modules[moduleName];
    if (mod) {
      content.innerHTML = '';
      mod.render(content);
    }

    this.closeMobileMenu();
    this.updateMobileActiveState();
  },

  navigateMobile(moduleName) {
    this.navigate(moduleName);
  },

  updateMobileActiveState() {
    document.querySelectorAll('.mobile-menu-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === this.currentModule);
    });
  },

  toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('show');
  },

  closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.remove('show');
  },

  updateEstoqueBadge() {
    const badges = document.querySelectorAll('#estoque-alert-badge');
    const alertCount = Store.estoque.getAll().filter(e => e.quantidade <= (e.minimo || 5)).length;
    badges.forEach(badge => {
      if (alertCount > 0) {
        badge.style.display = 'inline-flex';
        badge.textContent = alertCount;
      } else {
        badge.style.display = 'none';
      }
    });
  },

  refresh() {
    this.navigate(this.currentModule);
    this.updateEstoqueBadge();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());