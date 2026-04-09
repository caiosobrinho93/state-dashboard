// ============================================
// DIGITAL CORTE — Módulo: Métricas
// ============================================

const MetricasModule = {
  render(container) {
    const stats = Store.getStats();
    const orcamentos = Store.orcamentos.getAll();
    const projetos = Store.projetos.getAll();
    const financeiro = Store.financeiro.getAll();
    const negociacoes = Store.negociacoes.getAll();

    // Calculate additional metrics
    const projetosConcluidos = projetos.filter(p => p.status === 'concluido');
    const tempoMedioEntrega = projetosConcluidos.length > 0
      ? projetosConcluidos.reduce((s, p) => {
          if (p.inicio && p.previsao) {
            const dias = Math.ceil((new Date(p.previsao) - new Date(p.inicio)) / (1000 * 60 * 60 * 24));
            return s + dias;
          }
          return s;
        }, 0) / projetosConcluidos.length
      : 0;

    // Revenue by category
    const receitaPorCategoria = {};
    financeiro.filter(f => f.tipo === 'receita').forEach(f => {
      receitaPorCategoria[f.categoria || 'Outros'] = (receitaPorCategoria[f.categoria || 'Outros'] || 0) + (f.valor || 0);
    });

    const despesaPorCategoria = {};
    financeiro.filter(f => f.tipo === 'despesa').forEach(f => {
      despesaPorCategoria[f.categoria || 'Outros'] = (despesaPorCategoria[f.categoria || 'Outros'] || 0) + (f.valor || 0);
    });

    // Negociações por etapa
    const negPorEtapa = {};
    negociacoes.forEach(n => {
      negPorEtapa[n.status] = (negPorEtapa[n.status] || 0) + 1;
    });

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('financeiro', 20)}</div>
          <div class="kpi-label">Ticket Médio</div>
          <div class="kpi-value">${Utils.currency(stats.ticketMedio)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">${Utils.icon('check', 20)}</div>
          <div class="kpi-label">Taxa de Conversão</div>
          <div class="kpi-value">${stats.taxaConversao.toFixed(1)}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('projetos', 20)}</div>
          <div class="kpi-label">Tempo Médio Entrega</div>
          <div class="kpi-value">${tempoMedioEntrega > 0 ? Math.round(tempoMedioEntrega) + ' dias' : '—'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon yellow">${Utils.icon('clientes', 20)}</div>
          <div class="kpi-label">Valor por Cliente</div>
          <div class="kpi-value">${Utils.currency(stats.totalClientes > 0 ? stats.receitas / stats.totalClientes : 0)}</div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="panel">
          <div class="panel-header">
            <h3>Receitas por Categoria</h3>
          </div>
          <div class="chart-container" style="height:220px">
            <canvas id="chart-receita-cat"></canvas>
          </div>
          <div id="legend-receita" style="display:flex;gap:16px;flex-wrap:wrap;padding-top:12px;justify-content:center"></div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h3>Despesas por Categoria</h3>
          </div>
          <div class="chart-container" style="height:220px">
            <canvas id="chart-despesa-cat"></canvas>
          </div>
          <div id="legend-despesa" style="display:flex;gap:16px;flex-wrap:wrap;padding-top:12px;justify-content:center"></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="panel">
          <div class="panel-header">
            <h3>Status dos Projetos</h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${this._progressBar('Orçamento', projetos.filter(p => p.status === 'orcamento').length, stats.totalProjetos, 'var(--warning)')}
            ${this._progressBar('Em Andamento', stats.projetosAtivos, stats.totalProjetos, 'var(--info)')}
            ${this._progressBar('Concluído', projetosConcluidos.length, stats.totalProjetos, 'var(--success)')}
            ${this._progressBar('Cancelado', projetos.filter(p => p.status === 'cancelado').length, stats.totalProjetos, 'var(--danger)')}
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <h3>Pipeline de Negociações</h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${this._progressBar('Contato', negPorEtapa['contato'] || 0, stats.totalNegociacoes, 'var(--text-muted)')}
            ${this._progressBar('Proposta', negPorEtapa['proposta'] || 0, stats.totalNegociacoes, 'var(--warning)')}
            ${this._progressBar('Negociação', negPorEtapa['negociacao'] || 0, stats.totalNegociacoes, 'var(--info)')}
            ${this._progressBar('Fechado', negPorEtapa['fechado'] || 0, stats.totalNegociacoes, 'var(--success)')}
            ${this._progressBar('Perdido', negPorEtapa['perdido'] || 0, stats.totalNegociacoes, 'var(--danger)')}
          </div>
        </div>
      </div>

      <div class="panel" style="margin-top:20px">
        <div class="panel-header">
          <h3>Resumo Geral</h3>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;text-align:center">
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">Orçamentos</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700">${stats.totalOrcamentos}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">Clientes</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700">${stats.totalClientes}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">Projetos</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700">${stats.totalProjetos}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">Itens no Estoque</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700">${stats.totalEstoque}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">Alertas Estoque</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:${stats.estoqueAlerta > 0 ? 'var(--danger)' : 'var(--success)'}">${stats.estoqueAlerta}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px">Lucro Total</div>
            <div style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:${stats.lucro >= 0 ? 'var(--success)' : 'var(--danger)'}">${Utils.currency(stats.lucro)}</div>
          </div>
        </div>
      </div>
    `;

    // Charts
    setTimeout(() => {
      const colors = ['#d4af37', '#00ffaa', '#00f2ff', '#ffcc00', '#8b5cf6', '#ec4899'];

      // Receita donut
      const recCanvas = document.getElementById('chart-receita-cat');
      const recData = Object.entries(receitaPorCategoria).map(([k, v]) => ({ label: k, value: v }));
      if (recCanvas && recData.length > 0) {
        Utils.drawDonutChart(recCanvas, recData, { colors, centerText: Utils.currency(stats.receitas).replace('R$\u00a0', '') });
        this._renderLegend('legend-receita', recData, colors);
      }

      // Despesa donut
      const despCanvas = document.getElementById('chart-despesa-cat');
      const despData = Object.entries(despesaPorCategoria).map(([k, v]) => ({ label: k, value: v }));
      if (despCanvas && despData.length > 0) {
        Utils.drawDonutChart(despCanvas, despData, { colors: colors.slice(1), centerText: Utils.currency(stats.despesas).replace('R$\u00a0', '') });
        this._renderLegend('legend-despesa', despData, colors.slice(1));
      }
    }, 50);
  },

  _progressBar(label, value, total, color) {
    const pct = total > 0 ? (value / total) * 100 : 0;
    return `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:0.8rem;color:var(--text-secondary)">${label}</span>
          <span style="font-size:0.8rem;font-weight:600;font-family:'Space Grotesk',sans-serif">${value}</span>
        </div>
        <div style="height:6px;background:var(--surface-hover);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.6s ease"></div>
        </div>
      </div>
    `;
  },

  _renderLegend(containerId, data, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = data.map((d, i) => `
      <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--text-secondary)">
        <span style="width:8px;height:8px;border-radius:2px;background:${colors[i % colors.length]}"></span>
        ${d.label}
      </div>
    `).join('');
  },
};
