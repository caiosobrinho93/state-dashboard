// ============================================
// DIGITAL CORTE — Módulo: Financeiro
// ============================================

const FinanceiroModule = {
  render(container) {
    const lancamentos = Store.financeiro.getAll();
    const receitas = lancamentos.filter(f => f.tipo === 'receita').reduce((s, f) => s + (f.valor || 0), 0);
    const despesas = lancamentos.filter(f => f.tipo === 'despesa').reduce((s, f) => s + (f.valor || 0), 0);
    const lucro = receitas - despesas;

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const recentMonths = [];
    for (let i = 5; i >= 0; i--) {
      const m = (currentMonth - i + 12) % 12;
      const monthLancs = lancamentos.filter(f => new Date(f.data).getMonth() === m);
      const rec = monthLancs.filter(f => f.tipo === 'receita').reduce((s, f) => s + (f.valor || 0), 0);
      const desp = monthLancs.filter(f => f.tipo === 'despesa').reduce((s, f) => s + (f.valor || 0), 0);
      recentMonths.push({ label: meses[m], receita: rec, despesa: desp });
    }

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon green">${Utils.icon('arrowUp', 20)}</div>
          <div class="kpi-label">Receitas</div>
          <div class="kpi-value" style="color:var(--success)">${Utils.currency(receitas)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon red">${Utils.icon('arrowDown', 20)}</div>
          <div class="kpi-label">Despesas</div>
          <div class="kpi-value" style="color:var(--danger)">${Utils.currency(despesas)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange">${Utils.icon('financeiro', 20)}</div>
          <div class="kpi-label">Lucro</div>
          <div class="kpi-value" style="color:${lucro >= 0 ? 'var(--success)' : 'var(--danger)'}">
            ${Utils.currency(lucro)}
          </div>
        </div>
      </div>

      <div class="panel" style="margin-bottom:24px">
        <div class="panel-header">
          <h3>Fluxo de Caixa (6 meses)</h3>
        </div>
        <div class="chart-container">
          <canvas id="chart-financeiro"></canvas>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="filter-pills">
            <button class="filter-pill active" data-filter="todos">Todos</button>
            <button class="filter-pill" data-filter="receita">Receitas</button>
            <button class="filter-pill" data-filter="despesa">Despesas</button>
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-ghost" onclick="FinanceiroModule.openForm('despesa')">
            ${Utils.icon('arrowDown', 16)} Nova Despesa
          </button>
          <button class="btn btn-primary" onclick="FinanceiroModule.openForm('receita')">
            ${Utils.icon('arrowUp', 16)} Nova Receita
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table-responsive">
          <thead>
            <tr>
              <th>Descrição</th>
              <th class="col-hide-sm">Categoria</th>
              <th class="col-hide-sm">Data</th>
              <th class="col-hide-md">Tipo</th>
              <th class="col-hide-sm">Valor</th>
              <th class="col-hide-sm col-actions" style="width:80px">Ações</th>
            </tr>
          </thead>
          <tbody id="fin-table-body"></tbody>
        </table>
      </div>
    `;

    this.renderTable(lancamentos);
    this.setupFilters();

    setTimeout(() => {
      const canvas = document.getElementById('chart-financeiro');
      if (canvas) {
        const data = recentMonths.map(m => ({ label: m.label, value: m.receita || 1 }));
        Utils.drawBarChart(canvas, data);
      }
    }, 50);
  },

  renderTable(data) {
    const tbody = document.getElementById('fin-table-body');
    if (!tbody) return;
    data.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><p>Nenhum lançamento encontrado</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = data.map(f => `
      <tr class="row-clickable" onclick="FinanceiroModule.viewDetail('${f.id}')">
        <td>
          ${f.descricao || '—'}
          <span class="mobile-type-dot" style="display:none;margin-left:6px;width:6px;height:6px;border-radius:50%;background:${f.tipo === 'receita' ? 'var(--success)' : 'var(--danger)'};vertical-align:middle"></span>
        </td>
        <td class="col-hide-sm">${f.categoria || '—'}</td>
        <td class="col-hide-sm">${Utils.date(f.data)}</td>
        <td class="col-hide-md">
          <span class="status-badge ${f.tipo === 'receita' ? 'status-success' : 'status-danger'}">
            ${f.tipo === 'receita' ? 'Receita' : 'Despesa'}
          </span>
        </td>
        <td class="col-hide-sm" style="font-family:'Space Grotesk',sans-serif;font-weight:600;color:${f.tipo === 'receita' ? 'var(--success)' : 'var(--danger)'}">
          ${f.tipo === 'receita' ? '+' : '-'}${Utils.currency(f.valor)}
        </td>
        <td class="col-hide-sm col-actions" onclick="event.stopPropagation()">
          <div class="table-actions">
            <button class="btn btn-sm btn-ghost btn-icon" onclick="FinanceiroModule.editForm('${f.id}')" title="Editar">${Utils.icon('edit', 16)}</button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="FinanceiroModule.remove('${f.id}')" title="Excluir">${Utils.icon('trash', 16)}</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  viewDetail(id) {
    const f = Store.financeiro.getById(id);
    if (!f) return;

    const content = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Descrição</span>
          <span class="detail-value">${f.descricao}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo</span>
          <span class="detail-value"><span class="status-badge ${f.tipo === 'receita' ? 'status-success' : 'status-danger'}">${f.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor</span>
          <span class="detail-value" style="font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:700;color:${f.tipo === 'receita' ? 'var(--success)' : 'var(--danger)'}">
            ${f.tipo === 'receita' ? '+' : '-'}${Utils.currency(f.valor)}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data</span>
          <span class="detail-value">${Utils.date(f.data)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Categoria</span>
          <span class="detail-value">${f.categoria || '—'}</span>
        </div>
      </div>
    `;

    const overlay = Utils.modal(f.descricao, content, null);
    const footer = overlay.querySelector('.dc-modal-footer');
    footer.innerHTML = `
      <button class="btn btn-danger btn-sm" onclick="FinanceiroModule.remove('${f.id}')">
        ${Utils.icon('trash', 14)} Excluir
      </button>
      <button class="btn btn-ghost" onclick="this.closest('.dc-modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="this.closest('.dc-modal-overlay').remove();FinanceiroModule.editForm('${f.id}')">
        ${Utils.icon('edit', 14)} Editar
      </button>
    `;
  },

  setupFilters() {
    const pills = document.querySelectorAll('.filter-pills .filter-pill');
    let currentFilter = 'todos';

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.dataset.filter;
        let data = Store.financeiro.getAll();
        if (currentFilter !== 'todos') data = data.filter(f => f.tipo === currentFilter);
        this.renderTable(data);
      });
    });
  },

  openForm(tipo = 'receita') {
    this._showForm(null, tipo);
  },

  editForm(id) {
    const lanc = Store.financeiro.getById(id);
    if (lanc) this._showForm(lanc, lanc.tipo);
  },

  _showForm(lanc, tipo) {
    const content = `
      <div class="form-group">
        <label>Descrição</label>
        <input class="form-input" id="fin-desc" value="${lanc?.descricao || ''}" placeholder="Ex: Pagamento do projeto X">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" class="form-input" id="fin-valor" value="${lanc?.valor || 0}" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Data</label>
          <input type="date" class="form-input" id="fin-data" value="${Utils.dateInput(lanc?.data) || new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tipo</label>
          <select class="form-select" id="fin-tipo">
            <option value="receita" ${tipo === 'receita' ? 'selected' : ''}>Receita</option>
            <option value="despesa" ${tipo === 'despesa' ? 'selected' : ''}>Despesa</option>
          </select>
        </div>
        <div class="form-group">
          <label>Categoria</label>
          <select class="form-select" id="fin-cat">
            <option value="Projetos" ${lanc?.categoria === 'Projetos' ? 'selected' : ''}>Projetos</option>
            <option value="Material" ${lanc?.categoria === 'Material' ? 'selected' : ''}>Material</option>
            <option value="Fixo" ${lanc?.categoria === 'Fixo' ? 'selected' : ''}>Custos Fixos</option>
            <option value="Serviços" ${lanc?.categoria === 'Serviços' ? 'selected' : ''}>Serviços</option>
            <option value="Outros" ${lanc?.categoria === 'Outros' ? 'selected' : ''}>Outros</option>
          </select>
        </div>
      </div>
    `;

    Utils.modal(lanc ? 'Editar Lançamento' : (tipo === 'receita' ? 'Nova Receita' : 'Nova Despesa'), content, () => {
      this.save(lanc?.id);
    });
  },

  save(id) {
    const descricao = document.getElementById('fin-desc')?.value?.trim();
    if (!descricao) { Utils.toast('Informe a descrição', 'error'); return; }

    const data = {
      descricao,
      valor: parseFloat(document.getElementById('fin-valor')?.value) || 0,
      data: document.getElementById('fin-data')?.value,
      tipo: document.getElementById('fin-tipo')?.value,
      categoria: document.getElementById('fin-cat')?.value,
    };

    if (id) {
      Store.financeiro.update(id, data);
      Utils.toast('Lançamento atualizado');
    } else {
      Store.financeiro.add(data);
      Utils.toast('Lançamento adicionado');
    }

    App.refresh();
  },

  async remove(id) {
    const ok = await Utils.confirm('Deseja excluir este lançamento?');
    if (ok) {
      Store.financeiro.remove(id);
      Utils.toast('Lançamento excluído');
      document.querySelector('.dc-modal-overlay')?.remove();
      App.refresh();
    }
  },
};
