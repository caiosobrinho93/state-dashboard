// ============================================
// DIGITAL CORTE — Dashboard (Clean)
// ============================================

const DashboardModule = {
  render(container) {
    const stats = Store.getStats();
    const projetos = Store.projetos.getAll();
    const orcamentos = Store.orcamentos.getAll();

    container.innerHTML = `
      <div class="stats-bar">
        <div class="stat-mini">
          <div class="stat-mini-icon green">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div class="stat-mini-value">${Utils.currency(stats.receitas)}</div>
            <div class="stat-mini-label">Receita</div>
          </div>
        </div>
        
        <div class="stat-mini">
          <div class="stat-mini-icon orange">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div class="stat-mini-value">${stats.projetosAtivos}</div>
            <div class="stat-mini-label">Projetos</div>
          </div>
        </div>
        
        <div class="stat-mini">
          <div class="stat-mini-icon blue">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div>
            <div class="stat-mini-value">${stats.totalClientes}</div>
            <div class="stat-mini-label">Clientes</div>
          </div>
        </div>
        
        <div class="stat-mini">
          <div class="stat-mini-icon yellow">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
          </div>
          <div>
            <div class="stat-mini-value">${stats.taxaConversao.toFixed(0)}%</div>
            <div class="stat-mini-label">Conversão</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Projetos Recentes
          </div>
          <svg class="section-toggle" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div class="section-body">
          <div class="item-list">
            ${projetos.slice(0, 5).map(p => `
              <div class="item-row" onclick="App.navigate('projetos')">
                <div class="item-dot ${p.status === 'em_andamento' ? 'orange' : p.status === 'concluido' ? 'green' : 'blue'}"></div>
                <div class="item-info">
                  <div class="item-name">${Utils.escapeHtml(p.nome)}</div>
                  <div class="item-meta">${p.clienteNome || 'Sem cliente'}</div>
                </div>
                <div class="item-value">${Utils.currency(p.valor)}</div>
              </div>
            `).join('') || '<div class="empty-mini">Nenhum projeto</div>'}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8l-7-4-7 4v8l7 4 7-4z"/></svg>
            Alertas de Estoque
          </div>
          <svg class="section-toggle" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div class="section-body">
          <div class="item-list">
            ${Store.estoque.getAll().filter(e => e.quantidade <= (e.minimo || 5)).slice(0, 5).map(e => `
              <div class="item-row" onclick="App.navigate('estoque')">
                <div class="item-dot red"></div>
                <div class="item-info">
                  <div class="item-name">${Utils.escapeHtml(e.nome)}</div>
                  <div class="item-meta">${e.quantidade} ${e.unidade} em estoque</div>
                </div>
                <div class="item-value" style="color:var(--danger)">Mín: ${e.minimo}</div>
              </div>
            `).join('') || '<div class="empty-mini">Estoque OK</div>'}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <div class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Orçamentos Recentes
          </div>
          <svg class="section-toggle" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <div class="section-body">
          <div class="item-list">
            ${orcamentos.slice(0, 5).map(o => `
              <div class="item-row" onclick="App.navigate('orcamentos')">
                <div class="item-dot ${o.status === 'aprovado' ? 'green' : o.status === 'pendente' ? 'yellow' : 'red'}"></div>
                <div class="item-info">
                  <div class="item-name">${Utils.escapeHtml(o.titulo)}</div>
                  <div class="item-meta">${o.clienteNome || '—'}</div>
                </div>
                <div class="item-value">${Utils.currency(o.total)}</div>
              </div>
            `).join('') || '<div class="empty-mini">Nenhum orçamento</div>'}
          </div>
        </div>
      </div>
    `;
  }
};