// ============================================
// DIGITAL CORTE — App Controller
// ============================================

const App = {
  currentModule: 'dashboard',

  init() {
    this.cacheDom();
    this.bindEvents();
    
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

// ── Dashboard Overview Module ──
const DashboardModule = {
  render(container) {
    const stats = Store.getStats();
    const projetos = Store.projetos.getAll();
    const orcamentos = Store.orcamentos.getAll();
    const financeiro = Store.financeiro.getAll();

    // Monthly chart data
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const receitasMensais = meses.map((m, i) => {
      const mes = financeiro.filter(f => f.tipo === 'receita' && new Date(f.data).getMonth() === i + (new Date().getMonth() - 5));
      return { label: m, value: mes.reduce((s, f) => s + (f.valor || 0), 0) };
    });
    // Fill with sample if all zero
    if (receitasMensais.every(d => d.value === 0)) {
      receitasMensais[0].value = 8500;
      receitasMensais[1].value = 12300;
      receitasMensais[2].value = 15250;
      receitasMensais[3].value = 19875;
      receitasMensais[4].value = 14200;
      receitasMensais[5].value = 22100;
    }

    container.innerHTML = `
      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('financeiro', 20)}</div>
          <div class="kpi-label">Receita Total</div>
          <div class="kpi-value">${Utils.currency(stats.receitas)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">${Utils.icon('projetos', 20)}</div>
          <div class="kpi-label">Projetos Ativos</div>
          <div class="kpi-value">${stats.projetosAtivos}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('clientes', 20)}</div>
          <div class="kpi-label">Clientes</div>
          <div class="kpi-value">${stats.totalClientes}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon yellow">${Utils.icon('orcamento', 20)}</div>
          <div class="kpi-label">Taxa Conversão</div>
          <div class="kpi-value">${stats.taxaConversao.toFixed(0)}%</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2" style="margin-bottom:20px">
        <div class="panel">
          <div class="panel-header">
            <h3>Receita Mensal</h3>
          </div>
          <div class="chart-container">
            <canvas id="chart-receita"></canvas>
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h3>Visão Geral</h3>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:10px 0">
            <div style="text-align:center">
              <div class="chart-container" style="height:160px;margin:0 auto;max-width:160px">
                <canvas id="chart-status"></canvas>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;justify-content:center;gap:14px">
              <div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px">Ticket Médio</div>
                <div style="font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:600">${Utils.currency(stats.ticketMedio)}</div>
              </div>
              <div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px">Lucro</div>
                <div style="font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:600;color:${stats.lucro >= 0 ? 'var(--success)' : 'var(--danger)'}">${Utils.currency(stats.lucro)}</div>
              </div>
              <div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px">Negociações Abertas</div>
                <div style="font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:600">${stats.negociacoesAbertas}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid-2">
        <div class="panel">
          <div class="panel-header">
            <h3>Projetos Recentes</h3>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('projetos')">Ver todos</button>
          </div>
          <div class="activity-list" id="recent-projects"></div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h3>Alertas de Estoque</h3>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('estoque')">Ver estoque</button>
          </div>
          <div class="activity-list" id="stock-alerts"></div>
        </div>
      </div>
    `;

    // Render charts
    setTimeout(() => {
      const receitaCanvas = document.getElementById('chart-receita');
      if (receitaCanvas) Utils.drawBarChart(receitaCanvas, receitasMensais);

      const statusCanvas = document.getElementById('chart-status');
      if (statusCanvas) {
        Utils.drawDonutChart(statusCanvas, [
          { label: 'Aprovados', value: stats.orcamentosAprovados || 1 },
          { label: 'Pendentes', value: (stats.totalOrcamentos - stats.orcamentosAprovados) || 1 },
          { label: 'Projetos', value: stats.projetosAtivos || 1 },
        ], { centerText: stats.totalOrcamentos.toString() });
      }

      // Recent projects
      const projectsList = document.getElementById('recent-projects');
      if (projectsList) {
        const recent = projetos.slice(-4).reverse();
        if (recent.length === 0) {
          projectsList.innerHTML = '<div class="empty-state"><p>Nenhum projeto ainda</p></div>';
        } else {
          projectsList.innerHTML = recent.map(p => `
            <div class="activity-item">
              <div class="activity-dot" style="background:${p.status === 'em_andamento' ? 'var(--info)' : p.status === 'concluido' ? 'var(--success)' : 'var(--warning)'}"></div>
              <div class="activity-content">
                <p><strong>${p.nome}</strong> — ${p.clienteNome || 'Sem cliente'}</p>
                <div class="activity-time">${Utils.currency(p.valor)}</div>
              </div>
              <span class="status-badge ${Utils.statusColor(p.status)}">${Utils.statusLabel(p.status)}</span>
            </div>
          `).join('');
        }
      }

      // Stock alerts
      const alertsList = document.getElementById('stock-alerts');
      if (alertsList) {
        const alerts = Store.estoque.getAll().filter(e => e.quantidade <= (e.minimo || 5));
        if (alerts.length === 0) {
          alertsList.innerHTML = '<div class="empty-state" style="padding:24px"><p style="color:var(--success)">✓ Estoque em dia</p></div>';
        } else {
          alertsList.innerHTML = alerts.map(e => `
            <div class="activity-item">
              <div class="activity-dot" style="background:var(--danger)"></div>
              <div class="activity-content">
                <p><strong>${e.nome}</strong></p>
                <div class="activity-time">${e.quantidade} ${e.unidade || 'un'} restantes (mín: ${e.minimo || 5})</div>
              </div>
            </div>
          `).join('');
        }
      }
    }, 50);
  }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => App.init());
