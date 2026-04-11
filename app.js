// ============================================
// DIGITAL CORTE — App Controller (Ultra Clean)
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

    this.navigate(this.currentModule);
  },

  navigate(moduleName) {
    this.currentModule = moduleName;
    
    document.querySelectorAll('.icon-nav-btn[data-module]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === moduleName);
    });

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
  },

  updateEstoqueBadge() {
    const badge = document.getElementById('estoque-alert-badge');
    const alertCount = Store.estoque.getAll().filter(e => e.quantidade <= (e.minimo || 5)).length;
    if (alertCount > 0) {
      badge.style.display = 'flex';
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

document.addEventListener('DOMContentLoaded', () => App.init());