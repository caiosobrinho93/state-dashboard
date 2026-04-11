// ============================================
// DIGITAL CORTE — App Controller
// ============================================

const App = {
  currentModule: 'dashboard',

  init() {
    this.cacheDom();
    
    // Seed demo data
    Store.seedDemoData();

    // Update date
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    // Navigation
    document.querySelectorAll('.sidebar-link[data-module]').forEach(link => {
      link.addEventListener('click', () => this.navigate(link.dataset.module));
    });

    // Initial render
    this.navigate(this.currentModule);
  },

  cacheDom() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const mod = window.location.hash.replace('#', '');
      if (mod && mod !== this.currentModule) this.navigate(mod);
    });
  },

  navigate(moduleName) {
    this.currentModule = moduleName;
    window.location.hash = moduleName;

    // Update active nav
    document.querySelectorAll('.sidebar-link[data-module]').forEach(link => {
      link.classList.toggle('active', link.dataset.module === moduleName);
    });

    // Update title
    const titles = {
      dashboard: 'Dashboard',
      orcamentos: 'Orçamentos',
      clientes: 'Clientes',
      projetos: 'Projetos',
      estoque: 'Estoque',
      financeiro: 'Financeiro',
      negociacoes: 'Negociações',
      metricas: 'Métricas',
    };
    document.getElementById('page-title').textContent = titles[moduleName] || 'Dashboard';

    // Render module
    const content = document.getElementById('main-content');
    content.style.animation = 'none';
    content.offsetHeight; // trigger reflow
    content.style.animation = '';

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

    // Close sidebar on mobile
    this.closeSidebar();
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('show');
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  },

  updateEstoqueBadge() {
    const badge = document.getElementById('estoque-alert-badge');
    const alertCount = Store.estoque.getAll().filter(e => e.quantidade <= (e.minimo || 5)).length;
    if (alertCount > 0) {
      badge.style.display = '';
      badge.textContent = alertCount;
    } else {
      badge.style.display = 'none';
    }
  },

  refresh() {
    this.navigate(this.currentModule);
    this.updateEstoqueBadge();
  }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => App.init());
