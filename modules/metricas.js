// ============================================
// STATE MARCENARIA — Métricas (Clean)
// ============================================

const MetricasModule = {
  render(container) {
    const stats = Store.getStats();

    container.innerHTML = `
      <div class="stats-bar">
        <div class="stat-mini">
          <div class="stat-mini-icon orange"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <div><div class="stat-mini-value">${Utils.currency(stats.ticketMedio)}</div><div class="stat-mini-label">Ticket Médio</div></div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-icon green"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div><div class="stat-mini-value">${stats.taxaConversao.toFixed(1)}%</div><div class="stat-mini-label">Conversão</div></div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-icon blue"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8l-7-4-7 4v8l7 4 7-4z"/></svg></div>
          <div><div class="stat-mini-value">${stats.totalClientes > 0 ? Utils.currency(stats.receitas / stats.totalClientes) : 'R$ 0'}</div><div class="stat-mini-label">Por Cliente</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Resumo Geral</div>
        </div>
        <div class="section-body">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px">
            <div style="text-align:center;padding:16px;background:var(--surface-2);border-radius:var(--radius)">
              <div style="font-size:1.5rem;font-weight:700;font-family:var(--font-display)">${stats.totalOrcamentos}</div>
              <div style="font-size:0.75rem;color:var(--text-2)">Orçamentos</div>
            </div>
            <div style="text-align:center;padding:16px;background:var(--surface-2);border-radius:var(--radius)">
              <div style="font-size:1.5rem;font-weight:700;font-family:var(--font-display)">${stats.totalClientes}</div>
              <div style="font-size:0.75rem;color:var(--text-2)">Clientes</div>
            </div>
            <div style="text-align:center;padding:16px;background:var(--surface-2);border-radius:var(--radius)">
              <div style="font-size:1.5rem;font-weight:700;font-family:var(--font-display)">${stats.totalProjetos}</div>
              <div style="font-size:0.75rem;color:var(--text-2)">Projetos</div>
            </div>
            <div style="text-align:center;padding:16px;background:var(--surface-2);border-radius:var(--radius)">
              <div style="font-size:1.5rem;font-weight:700;font-family:var(--font-display);color:var(--${stats.lucro >= 0 ? 'success' : 'danger'})">${Utils.currency(stats.lucro)}</div>
              <div style="font-size:0.75rem;color:var(--text-2)">Lucro</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};