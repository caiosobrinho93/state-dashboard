// ============================================
// DIGITAL CORTE — Financeiro (Clean)
// ============================================

const FinanceiroModule = {
  render(container) {
    const lancamentos = Store.financeiro.getAll();
    const receitas = lancamentos.filter(f => f.tipo === 'receita').reduce((s, f) => s + (f.valor || 0), 0);
    const despesas = lancamentos.filter(f => f.tipo === 'despesa').reduce((s, f) => s + (f.valor || 0), 0);
    const lucro = receitas - despesas;

    container.innerHTML = `
      <div class="stats-bar">
        <div class="stat-mini">
          <div class="stat-mini-icon green"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg></div>
          <div><div class="stat-mini-value">${Utils.currency(receitas)}</div><div class="stat-mini-label">Receitas</div></div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-icon red"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div>
          <div><div class="stat-mini-value">${Utils.currency(despesas)}</div><div class="stat-mini-label">Despesas</div></div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-icon ${lucro >= 0 ? 'green' : 'red'}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/></svg></div>
          <div><div class="stat-mini-value">${Utils.currency(lucro)}</div><div class="stat-mini-label">Lucro</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Lançamentos (${lancamentos.length})</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" onclick="FinanceiroModule.openForm('receita')">+ Receita</button>
            <button class="btn btn-ghost btn-sm" onclick="FinanceiroModule.openForm('despesa')">+ Despesa</button>
          </div>
        </div>
        <div class="section-body">
          ${lancamentos.length ? `
            <table class="table-minimal">
              <thead><tr><th>Descrição</th><th>Data</th><th>Tipo</th><th>Valor</th><th></th></tr></thead>
              <tbody>
                ${lancamentos.sort((a,b) => new Date(b.data) - new Date(a.data)).map(f => `
                  <tr>
                    <td><strong>${Utils.escapeHtml(f.descricao)}</strong></td>
                    <td>${Utils.date(f.data)}</td>
                    <td><span class="status-pill ${f.tipo === 'receita' ? 'green' : 'red'}">${f.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
                    <td class="col-num" style="color:var(--${f.tipo === 'receita' ? 'success' : 'danger'})">${f.tipo === 'receita' ? '+' : '-'}${Utils.currency(f.valor)}</td>
                    <td>
                      <div class="actions-mini">
                        <button class="btn-icon-mini danger" onclick="FinanceiroModule.remove('${f.id}')" title="Excluir">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-mini">Nenhum lançamento. Clique em + Receita ou + Despesa.</div>'}
        </div>
      </div>
    `;
  },

  openForm(tipo = 'receita') {
    const html = `
      <div class="form-group">
        <label>Descrição</label>
        <input class="form-input" id="fin-desc" placeholder="Ex: Pagamento projeto">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" class="form-input" id="fin-valor" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Data</label>
          <input type="date" class="form-input" id="fin-data" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select class="form-select" id="fin-tipo">
          <option value="receita" ${tipo === 'receita' ? 'selected' : ''}>Receita</option>
          <option value="despesa" ${tipo === 'despesa' ? 'selected' : ''}>Despesa</option>
        </select>
      </div>
    `;

    Utils.modal(tipo === 'receita' ? 'Nova Receita' : 'Nova Despesa', html, () => this.save());
  },

  save() {
    const descricao = document.getElementById('fin-desc')?.value?.trim();
    if (!descricao) { Utils.toast('Informe a descrição', 'error'); return; }

    const data = {
      descricao,
      valor: parseFloat(document.getElementById('fin-valor')?.value) || 0,
      data: document.getElementById('fin-data')?.value,
      tipo: document.getElementById('fin-tipo')?.value,
      categoria: 'Outros',
    };

    Store.financeiro.add(data);
    Utils.toast('Adicionado');
    App.refresh();
  },

  async remove(id) {
    if (confirm('Excluir lançamento?')) {
      Store.financeiro.remove(id);
      Utils.toast('Excluído');
      App.refresh();
    }
  }
};