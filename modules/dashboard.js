// ============================================
// DIGITAL CORTE — Módulo: Dashboard (Geral)
// ============================================

const DashboardModule = {
  render(container) {
    const stats = Store.getStats();
    const projetos = Store.projetos.getAll();
    const financeiro = Store.financeiro.getAll();

    // Monthly chart data
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const receitasMensais = meses.map((m, i) => {
      const mes = financeiro.filter(f => f.tipo === 'receita' && new Date(f.data).getMonth() === i + (new Date().getMonth() - 5));
      return { label: m, value: mes.reduce((s, f) => s + (f.valor || 0), 0) };
    });

    // Sample data if empty
    if (receitasMensais.every(d => d.value === 0)) {
      receitasMensais[0].value = 8500;
      receitasMensais[1].value = 12300;
      receitasMensais[2].value = 15250;
    }

    container.innerHTML = `
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

      <div class="grid-2" style="margin-bottom:20px">
        <div class="panel">
          <div class="panel-header"><h3>Receita Mensal</h3></div>
          <div class="chart-container"><canvas id="chart-receita"></canvas></div>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>Status Geral</h3></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div class="chart-container" style="height:160px"><canvas id="chart-status-dash"></canvas></div>
            <div style="display:flex;flex-direction:column;justify-content:center;gap:12px">
               <div><div class="kpi-label" style="font-size:0.7rem">Ticket Médio</div><div class="kpi-value" style="font-size:1.1rem">${Utils.currency(stats.ticketMedio)}</div></div>
               <div><div class="kpi-label" style="font-size:0.7rem">Lucro</div><div class="kpi-value" style="font-size:1.1rem;color:var(--success)">${Utils.currency(stats.lucro)}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="panel">
          <div class="panel-header">
            <h3>Projetos Recentes</h3>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('projetos')">Ver todos</button>
          </div>
          <div class="activity-list" id="recent-projects-list"></div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h3>Alertas de Estoque</h3>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('estoque')">Ver estoque</button>
          </div>
          <div class="activity-list" id="stock-alerts-list"></div>
        </div>
      </div>
    `;

    this.initCharts(receitasMensais, stats);
    this.renderActivity(projetos);
  },

  initCharts(receitasMensais, stats) {
    setTimeout(() => {
      const recCanvas = document.getElementById('chart-receita');
      if (recCanvas) Utils.drawBarChart(recCanvas, receitasMensais);

      const stCanvas = document.getElementById('chart-status-dash');
      if (stCanvas) {
        Utils.drawDonutChart(stCanvas, [
          { label: 'Aprovados', value: stats.orcamentosAprovados || 1 },
          { label: 'Pendentes', value: (stats.totalOrcamentos - stats.orcamentosAprovados) || 1 }
        ], { centerText: stats.totalOrcamentos.toString() });
      }
    }, 100);
  },

  renderActivity(projetos) {
    setTimeout(() => {
      const pList = document.getElementById('recent-projects-list');
      if (pList) {
        const recent = projetos.slice(-4).reverse();
        pList.innerHTML = recent.length ? recent.map(p => `
          <div class="activity-item">
            <div class="activity-dot" style="background:var(--info)"></div>
            <div class="activity-content"><p><strong>${p.nome}</strong></p></div>
            <span class="status-badge ${Utils.statusColor(p.status)}">${Utils.statusLabel(p.status)}</span>
          </div>
        `).join('') : '<p class="empty-state">Nenhum projeto</p>';
      }

      const sList = document.getElementById('stock-alerts-list');
      if (sList) {
        const alerts = Store.estoque.getAll().filter(e => e.quantidade <= (e.minimo || 5));
        sList.innerHTML = alerts.length ? alerts.map(e => `
          <div class="activity-item">
            <div class="activity-dot" style="background:var(--danger)"></div>
            <div class="activity-content"><p><strong>${e.nome}</strong></p><div class="activity-time">${e.quantidade} ${e.unidade} restando</div></div>
          </div>
        `).join('') : '<p class="empty-state">Estoque em dia</p>';
      }
    }, 100);
  }
};
