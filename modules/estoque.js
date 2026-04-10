// ============================================
// DIGITAL CORTE — Módulo: Estoque
// ============================================

const EstoqueModule = {
  render(container) {
    const estoque = Store.estoque.getAll();

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('estoque', 20)}</div>
          <div class="kpi-label">Total de Itens</div>
          <div class="kpi-value">${estoque.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon red">${Utils.icon('alert', 20)}</div>
          <div class="kpi-label">Estoque Baixo</div>
          <div class="kpi-value">${estoque.filter(e => e.quantidade <= (e.minimo || 5)).length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange">${Utils.icon('financeiro', 20)}</div>
          <div class="kpi-label">Valor em Estoque</div>
          <div class="kpi-value">${Utils.currency(estoque.reduce((s, e) => s + (e.preco || 0) * (e.quantidade || 0), 0))}</div>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-add-group" style="margin-bottom:12px">
            <div class="search-box">
              ${Utils.icon('search', 18)}
              <input type="text" class="form-input" placeholder="Buscar material..." id="est-search">
            </div>
            <button class="btn btn-primary btn-square" onclick="EstoqueModule.openForm()" title="Novo Item">
              ${Utils.icon('plus', 20)}
            </button>
          </div>
          <div class="filter-pills">
            <button class="filter-pill active" data-filter="todos">Todos</button>
            <button class="filter-pill" data-filter="Chapas">Chapas</button>
            <button class="filter-pill" data-filter="Ferragens">Ferragens</button>
            <button class="filter-pill" data-filter="Acabamento">Acabamento</button>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table-responsive">
          <thead>
            <tr>
              <th>Material</th>
              <th class="col-hide-sm">Categoria</th>
              <th class="col-hide-sm">Quantidade</th>
              <th class="col-hide-md">Mínimo</th>
              <th class="col-hide-md">Preço Unit.</th>
              <th class="col-hide-sm">Status</th>
              <th class="col-hide-sm col-actions" style="width:100px">Ações</th>
            </tr>
          </thead>
          <tbody id="est-table-body"></tbody>
        </table>
      </div>
    `;

    this.renderTable(estoque);
    this.setupFilters();
  },

  renderTable(data) {
    const tbody = document.getElementById('est-table-body');
    if (!tbody) return;
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Nenhum item no estoque</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(e => {
      const isLow = e.quantidade <= (e.minimo || 5);
      return `
        <tr class="row-clickable" onclick="EstoqueModule.viewDetail('${e.id}')">
          <td>
            ${e.nome}
            ${isLow ? '<span class="mobile-badge" style="display:none;margin-left:8px;width:6px;height:6px;border-radius:50%;background:var(--danger);vertical-align:middle"></span>' : ''}
          </td>
          <td class="col-hide-sm">${e.categoria || '—'}</td>
          <td class="col-hide-sm" style="font-family:'Space Grotesk',sans-serif;font-weight:600;color:${isLow ? 'var(--danger)' : 'var(--text)'}">
            ${e.quantidade} ${e.unidade || 'un'}
          </td>
          <td class="col-hide-md">${e.minimo || 5} ${e.unidade || 'un'}</td>
          <td class="col-hide-md">${Utils.currency(e.preco)}</td>
          <td class="col-hide-sm">
            ${isLow
              ? '<span class="status-badge status-danger">Baixo</span>'
              : '<span class="status-badge status-success">Normal</span>'
            }
          </td>
          <td class="col-hide-sm col-actions" onclick="event.stopPropagation()">
            <div class="table-actions">
              <button class="btn btn-sm btn-ghost btn-icon" onclick="EstoqueModule.openForm('${e.id}')" title="Editar">${Utils.icon('edit', 16)}</button>
              <button class="btn btn-sm btn-danger btn-icon" onclick="EstoqueModule.remove('${e.id}')" title="Excluir">${Utils.icon('trash', 16)}</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  viewDetail(id) {
    const e = Store.estoque.getById(id);
    if (!e) return;
    const isLow = e.quantidade <= (e.minimo || 5);
    const valorTotal = (e.preco || 0) * (e.quantidade || 0);

    const content = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Material</span>
          <span class="detail-value">${e.nome}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Categoria</span>
          <span class="detail-value">${e.categoria || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Quantidade</span>
          <span class="detail-value" style="color:${isLow ? 'var(--danger)' : 'var(--text)'};font-weight:600">${e.quantidade} ${e.unidade || 'un'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mínimo</span>
          <span class="detail-value">${e.minimo || 5} ${e.unidade || 'un'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Preço Unitário</span>
          <span class="detail-value">${Utils.currency(e.preco)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor Total</span>
          <span class="detail-value" style="font-family:'Space Grotesk',sans-serif;font-weight:600">${Utils.currency(valorTotal)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value">${isLow ? '<span class="status-badge status-danger">Estoque Baixo</span>' : '<span class="status-badge status-success">Normal</span>'}</span>
        </div>
      </div>
    `;

    const overlay = Utils.modal(e.nome, content, null);
    const footer = overlay.querySelector('.dc-modal-footer');
    footer.innerHTML = `
      <button class="btn btn-danger btn-sm" onclick="EstoqueModule.remove('${e.id}')">
        ${Utils.icon('trash', 14)} Excluir
      </button>
      <button class="btn btn-ghost" onclick="this.closest('.dc-modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="this.closest('.dc-modal-overlay').remove();EstoqueModule.openForm('${e.id}')">
        ${Utils.icon('edit', 14)} Editar
      </button>
    `;
  },

  setupFilters() {
    const search = document.getElementById('est-search');
    const pills = document.querySelectorAll('.filter-pills .filter-pill');
    let currentFilter = 'todos';

    const applyFilter = () => {
      let data = Store.estoque.getAll();
      const q = (search?.value || '').toLowerCase();
      if (q) data = data.filter(e => e.nome.toLowerCase().includes(q));
      if (currentFilter !== 'todos') data = data.filter(e => e.categoria === currentFilter);
      this.renderTable(data);
    };

    search?.addEventListener('input', Utils.debounce(applyFilter));
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.dataset.filter;
        applyFilter();
      });
    });
  },

  openForm(id = null) {
    const item = id ? Store.estoque.getById(id) : null;
    const content = `
      <div class="form-row">
        <div class="form-group">
          <label>Nome do Material</label>
          <input class="form-input" id="est-nome" value="${item?.nome || ''}" placeholder="Ex: MDF Branco 15mm">
        </div>
        <div class="form-group">
          <label>Categoria</label>
          <select class="form-select" id="est-categoria">
            <option value="Chapas" ${item?.categoria === 'Chapas' ? 'selected' : ''}>Chapas</option>
            <option value="Ferragens" ${item?.categoria === 'Ferragens' ? 'selected' : ''}>Ferragens</option>
            <option value="Acabamento" ${item?.categoria === 'Acabamento' ? 'selected' : ''}>Acabamento</option>
            <option value="Outros" ${item?.categoria === 'Outros' ? 'selected' : ''}>Outros</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Quantidade</label>
          <input type="number" class="form-input" id="est-qtd" value="${item?.quantidade || 0}" min="0">
        </div>
        <div class="form-group">
          <label>Quantidade Mínima</label>
          <input type="number" class="form-input" id="est-min" value="${item?.minimo || 5}" min="0">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Unidade</label>
          <select class="form-select" id="est-unidade">
            <option value="un" ${item?.unidade === 'un' ? 'selected' : ''}>Unidade</option>
            <option value="chapa" ${item?.unidade === 'chapa' ? 'selected' : ''}>Chapa</option>
            <option value="par" ${item?.unidade === 'par' ? 'selected' : ''}>Par</option>
            <option value="rolo" ${item?.unidade === 'rolo' ? 'selected' : ''}>Rolo</option>
            <option value="m" ${item?.unidade === 'm' ? 'selected' : ''}>Metro</option>
            <option value="m²" ${item?.unidade === 'm²' ? 'selected' : ''}>m²</option>
            <option value="kg" ${item?.unidade === 'kg' ? 'selected' : ''}>Kg</option>
          </select>
        </div>
        <div class="form-group">
          <label>Preço Unitário (R$)</label>
          <input type="number" class="form-input" id="est-preco" value="${item?.preco || 0}" min="0" step="0.01">
        </div>
      </div>
    `;

    Utils.modal(id ? 'Editar Material' : 'Novo Material', content, () => {
      this.save(id);
    });
  },

  save(id) {
    const nome = document.getElementById('est-nome')?.value?.trim();
    if (!nome) { Utils.toast('Informe o nome do material', 'error'); return; }

    const data = {
      nome,
      categoria: document.getElementById('est-categoria')?.value,
      quantidade: parseInt(document.getElementById('est-qtd')?.value) || 0,
      minimo: parseInt(document.getElementById('est-min')?.value) || 5,
      unidade: document.getElementById('est-unidade')?.value,
      preco: parseFloat(document.getElementById('est-preco')?.value) || 0,
    };

    if (id) {
      Store.estoque.update(id, data);
      Utils.toast('Material atualizado');
    } else {
      Store.estoque.add(data);
      Utils.toast('Material adicionado');
    }

    App.refresh();
  },

  async remove(id) {
    const ok = await Utils.confirm('Deseja excluir este material?');
    if (ok) {
      Store.estoque.remove(id);
      Utils.toast('Material excluído');
      document.querySelector('.dc-modal-overlay')?.remove();
      App.refresh();
    }
  },
};
