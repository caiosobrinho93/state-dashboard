// ============================================
// DIGITAL CORTE — Módulo: Projetos
// Com visualização de projeto como página
// ============================================

const ProjetosModule = {
  render(container) {
    const projetos = Store.projetos.getAll();
    const stats = {
      total: projetos.length,
      em_andamento: projetos.filter(p => p.status === 'em_andamento').length,
      concluido: projetos.filter(p => p.status === 'concluido').length,
      valorTotal: projetos.reduce((s, p) => s + (p.valor || 0), 0),
    };

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('projetos', 20)}</div>
          <div class="kpi-label">Total de Projetos</div>
          <div class="kpi-value">${stats.total}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange">${Utils.icon('dashboard', 20)}</div>
          <div class="kpi-label">Em Andamento</div>
          <div class="kpi-value">${stats.em_andamento}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">${Utils.icon('check', 20)}</div>
          <div class="kpi-label">Concluídos</div>
          <div class="kpi-value">${stats.concluido}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon yellow">${Utils.icon('financeiro', 20)}</div>
          <div class="kpi-label">Valor Total</div>
          <div class="kpi-value">${Utils.currency(stats.valorTotal)}</div>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box">
            ${Utils.icon('search', 18)}
            <input type="text" class="form-input" placeholder="Buscar projeto..." id="proj-search" style="padding-left:40px;max-width:320px">
          </div>
          <div class="filter-pills">
            <button class="filter-pill active" data-filter="todos">Todos</button>
            <button class="filter-pill" data-filter="orcamento">Orçamento</button>
            <button class="filter-pill" data-filter="em_andamento">Em Andamento</button>
            <button class="filter-pill" data-filter="concluido">Concluído</button>
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" onclick="ProjetosModule.openForm()">
            ${Utils.icon('plus', 18)} Novo Projeto
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table-responsive">
          <thead>
            <tr>
              <th>Projeto</th>
              <th class="col-hide-sm">Cliente</th>
              <th class="col-hide-sm">Valor</th>
              <th class="col-hide-md">Início</th>
              <th class="col-hide-md">Previsão</th>
              <th class="col-hide-sm">Status</th>
              <th class="col-hide-sm col-actions" style="width:100px">Ações</th>
            </tr>
          </thead>
          <tbody id="proj-table-body"></tbody>
        </table>
      </div>
    `;

    this.renderTable(projetos);
    this.setupFilters();
  },

  renderTable(data) {
    const tbody = document.getElementById('proj-table-body');
    if (!tbody) return;
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Nenhum projeto encontrado</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(p => `
      <tr class="row-clickable" onclick="ProjetosModule.viewProject('${p.id}')">
        <td>
          <div style="font-weight:500">${p.nome}</div>
        </td>
        <td class="col-hide-sm">${p.clienteNome || '—'}</td>
        <td class="col-hide-sm" style="font-family:'Space Grotesk',sans-serif;font-weight:600">${Utils.currency(p.valor)}</td>
        <td class="col-hide-md">${Utils.date(p.inicio)}</td>
        <td class="col-hide-md">${Utils.date(p.previsao)}</td>
        <td class="col-hide-sm"><span class="status-badge ${Utils.statusColor(p.status)}">${Utils.statusLabel(p.status)}</span></td>
        <td class="col-hide-sm col-actions" onclick="event.stopPropagation()">
          <div class="table-actions">
            <button class="btn btn-sm btn-ghost btn-icon" onclick="ProjetosModule.openForm('${p.id}')" title="Editar">${Utils.icon('edit', 16)}</button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="ProjetosModule.remove('${p.id}')" title="Excluir">${Utils.icon('trash', 16)}</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // ── Projeto como Página ──
  viewProject(id) {
    const p = Store.projetos.getById(id);
    if (!p) return;

    const cliente = p.clienteId ? Store.clientes.getById(p.clienteId) : null;
    const orcamentos = Store.orcamentos.getAll().filter(o => o.clienteId === p.clienteId);
    const financeiro = Store.financeiro.getAll().filter(f => (f.descricao || '').toLowerCase().includes(p.nome.toLowerCase()));

    // Calculate progress
    let progress = 0;
    if (p.status === 'concluido') progress = 100;
    else if (p.status === 'em_andamento' && p.inicio && p.previsao) {
      const start = new Date(p.inicio).getTime();
      const end = new Date(p.previsao).getTime();
      const now = Date.now();
      progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    } else if (p.status === 'em_andamento') {
      progress = 50;
    }

    const diasRestantes = p.previsao ? Math.ceil((new Date(p.previsao) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    const container = document.getElementById('main-content');
    document.getElementById('page-title').textContent = p.nome;

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('projetos')">← Voltar</button>
        <span class="status-badge ${Utils.statusColor(p.status)}">${Utils.statusLabel(p.status)}</span>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon orange">${Utils.icon('financeiro', 20)}</div>
          <div class="kpi-label">Valor do Projeto</div>
          <div class="kpi-value">${Utils.currency(p.valor)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('dashboard', 20)}</div>
          <div class="kpi-label">Progresso</div>
          <div class="kpi-value">${progress}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon ${diasRestantes !== null && diasRestantes < 0 ? 'red' : 'green'}">${Utils.icon('projetos', 20)}</div>
          <div class="kpi-label">${diasRestantes !== null && diasRestantes < 0 ? 'Atrasado' : 'Dias Restantes'}</div>
          <div class="kpi-value" style="color:${diasRestantes !== null && diasRestantes < 0 ? 'var(--danger)' : ''}">${diasRestantes !== null ? (diasRestantes < 0 ? Math.abs(diasRestantes) + ' dias' : diasRestantes + ' dias') : '—'}</div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="panel">
          <div class="panel-header"><h3>Detalhes do Projeto</h3>
            <button class="btn btn-sm btn-ghost" onclick="ProjetosModule.openForm('${p.id}')">
              ${Utils.icon('edit', 14)} Editar
            </button>
          </div>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">Nome</span>
              <span class="detail-value">${p.nome}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Descrição</span>
              <span class="detail-value">${p.descricao || '—'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Início</span>
              <span class="detail-value">${Utils.date(p.inicio)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Previsão</span>
              <span class="detail-value">${Utils.date(p.previsao)}</span>
            </div>
          </div>
          <!-- Progress bar -->
          <div style="margin-top:20px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:0.8rem;color:var(--text-secondary)">Progresso</span>
              <span style="font-size:0.8rem;font-weight:600;font-family:'Space Grotesk',sans-serif">${progress}%</span>
            </div>
            <div style="height:8px;background:var(--surface-hover);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${progress}%;background:${progress >= 100 ? 'var(--success)' : 'var(--accent)'};border-radius:4px;transition:width 0.6s ease"></div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><h3>Cliente</h3></div>
          ${cliente ? `
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">Nome</span>
                <span class="detail-value">${cliente.nome}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Telefone</span>
                <span class="detail-value">${cliente.telefone || '—'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">${cliente.email || '—'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Endereço</span>
                <span class="detail-value">${cliente.endereco || '—'}</span>
              </div>
            </div>
          ` : '<div class="empty-state" style="padding:20px"><p>Nenhum cliente vinculado</p></div>'}
        </div>
      </div>

      ${orcamentos.length > 0 ? `
        <div class="panel" style="margin-bottom:20px">
          <div class="panel-header"><h3>Orçamentos Relacionados</h3></div>
          <div class="activity-list">
            ${orcamentos.map(o => `
              <div class="activity-item" style="cursor:pointer" onclick="OrcamentoModule.viewDetail('${o.id}')">
                <div class="activity-dot" style="background:${o.status === 'aprovado' ? 'var(--success)' : 'var(--warning)'}"></div>
                <div class="activity-content">
                  <p><strong>${o.titulo}</strong></p>
                  <div class="activity-time">${Utils.currency(o.total)}</div>
                </div>
                <span class="status-badge ${Utils.statusColor(o.status)}">${Utils.statusLabel(o.status)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button class="btn btn-danger btn-sm" onclick="ProjetosModule.remove('${p.id}')">
          ${Utils.icon('trash', 14)} Excluir Projeto
        </button>
        <button class="btn btn-primary" onclick="ProjetosModule.openForm('${p.id}')">
          ${Utils.icon('edit', 14)} Editar Projeto
        </button>
      </div>
    `;
  },

  setupFilters() {
    const search = document.getElementById('proj-search');
    const pills = document.querySelectorAll('.filter-pills .filter-pill');
    let currentFilter = 'todos';

    const applyFilter = () => {
      let data = Store.projetos.getAll();
      const q = (search?.value || '').toLowerCase();
      if (q) data = data.filter(p => p.nome.toLowerCase().includes(q) || (p.clienteNome || '').toLowerCase().includes(q));
      if (currentFilter !== 'todos') data = data.filter(p => p.status === currentFilter);
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
    const proj = id ? Store.projetos.getById(id) : null;
    const clientes = Store.clientes.getAll();
    const clienteOptions = clientes.map(c =>
      `<option value="${c.id}" ${proj?.clienteId === c.id ? 'selected' : ''}>${c.nome}</option>`
    ).join('');

    const content = `
      <div class="form-group">
        <label>Nome do Projeto</label>
        <input class="form-input" id="proj-nome" value="${proj?.nome || ''}" placeholder="Ex: Cozinha Planejada">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Cliente</label>
          <select class="form-select" id="proj-cliente">
            <option value="">Selecione...</option>
            ${clienteOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" class="form-input" id="proj-valor" value="${proj?.valor || 0}" min="0" step="0.01">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Data Início</label>
          <input type="date" class="form-input" id="proj-inicio" value="${Utils.dateInput(proj?.inicio)}">
        </div>
        <div class="form-group">
          <label>Previsão de Entrega</label>
          <input type="date" class="form-input" id="proj-previsao" value="${Utils.dateInput(proj?.previsao)}">
        </div>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select class="form-select" id="proj-status">
          <option value="orcamento" ${proj?.status === 'orcamento' ? 'selected' : ''}>Orçamento</option>
          <option value="em_andamento" ${proj?.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
          <option value="concluido" ${proj?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
          <option value="cancelado" ${proj?.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea class="form-textarea" id="proj-desc" placeholder="Detalhes do projeto...">${proj?.descricao || ''}</textarea>
      </div>
    `;

    Utils.modal(id ? 'Editar Projeto' : 'Novo Projeto', content, () => {
      this.save(id);
    });
  },

  save(id) {
    const nome = document.getElementById('proj-nome')?.value?.trim();
    if (!nome) { Utils.toast('Informe o nome do projeto', 'error'); return; }

    const clienteId = document.getElementById('proj-cliente')?.value;
    const cliente = clienteId ? Store.clientes.getById(clienteId) : null;

    const data = {
      nome,
      clienteId,
      clienteNome: cliente?.nome || '',
      valor: parseFloat(document.getElementById('proj-valor')?.value) || 0,
      inicio: document.getElementById('proj-inicio')?.value,
      previsao: document.getElementById('proj-previsao')?.value,
      status: document.getElementById('proj-status')?.value,
      descricao: document.getElementById('proj-desc')?.value?.trim(),
    };

    if (id) {
      Store.projetos.update(id, data);
      Utils.toast('Projeto atualizado');
    } else {
      Store.projetos.add(data);
      Utils.toast('Projeto criado');
    }

    App.refresh();
  },

  async remove(id) {
    const ok = await Utils.confirm('Deseja excluir este projeto?');
    if (ok) {
      Store.projetos.remove(id);
      Utils.toast('Projeto excluído');
      document.querySelector('.dc-modal-overlay')?.remove();
      App.navigate('projetos');
    }
  },
};
