// ============================================
// DIGITAL CORTE — Módulo: Clientes
// ============================================

const ClientesModule = {
  render(container) {
    const clientes = Store.clientes.getAll();

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-add-group">
            <div class="search-box">
              ${Utils.icon('search', 18)}
              <input type="text" class="form-input" placeholder="Buscar cliente..." id="cli-search">
            </div>
            <button class="btn btn-primary btn-square" onclick="ClientesModule.openForm()" title="Novo Cliente">
              ${Utils.icon('plus', 20)}
            </button>
          </div>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table-responsive">
          <thead>
            <tr>
              <th>Nome</th>
              <th class="col-hide-sm">Email</th>
              <th class="col-hide-sm">Telefone</th>
              <th class="col-hide-md">Endereço</th>
              <th class="col-hide-md">Projetos</th>
              <th class="col-hide-sm col-actions" style="width:100px">Ações</th>
            </tr>
          </thead>
          <tbody id="cli-table-body"></tbody>
        </table>
      </div>
    `;

    this.renderTable(clientes);

    const search = document.getElementById('cli-search');
    search?.addEventListener('input', Utils.debounce(() => {
      const q = search.value.toLowerCase();
      const filtered = clientes.filter(c => c.nome.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q));
      this.renderTable(filtered);
    }));
  },

  renderTable(data) {
    const tbody = document.getElementById('cli-table-body');
    if (!tbody) return;
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><p>Nenhum cliente encontrado</p></div></td></tr>';
      return;
    }
    const projetos = Store.projetos.getAll();
    tbody.innerHTML = data.map(c => {
      const clienteProjetos = projetos.filter(p => p.clienteId === c.id);
      return `
        <tr class="row-clickable" onclick="ClientesModule.viewDetail('${c.id}')">
          <td>${c.nome}</td>
          <td class="col-hide-sm">${c.email || '—'}</td>
          <td class="col-hide-sm">${c.telefone || '—'}</td>
          <td class="col-hide-md" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.endereco || '—'}</td>
          <td class="col-hide-md" style="font-family:'Space Grotesk',sans-serif;font-weight:600">${clienteProjetos.length}</td>
          <td class="col-hide-sm col-actions" onclick="event.stopPropagation()">
            <div class="table-actions">
              <button class="btn btn-sm btn-ghost btn-icon" onclick="ClientesModule.openForm('${c.id}')" title="Editar">${Utils.icon('edit', 16)}</button>
              <button class="btn btn-sm btn-danger btn-icon" onclick="ClientesModule.remove('${c.id}')" title="Excluir">${Utils.icon('trash', 16)}</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  viewDetail(id) {
    const c = Store.clientes.getById(id);
    if (!c) return;
    const projetos = Store.projetos.getAll().filter(p => p.clienteId === id);
    const orcamentos = Store.orcamentos.getAll().filter(o => o.clienteId === id);

    const content = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Nome</span>
          <span class="detail-value">${c.nome}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${c.email || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Telefone</span>
          <span class="detail-value">${c.telefone || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Endereço</span>
          <span class="detail-value">${c.endereco || '—'}</span>
        </div>
        ${c.observacoes ? `<div class="detail-row"><span class="detail-label">Observações</span><span class="detail-value">${c.observacoes}</span></div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Cadastrado em</span>
          <span class="detail-value">${Utils.date(c.criadoEm)}</span>
        </div>
      </div>
      ${projetos.length > 0 ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);margin-bottom:10px">PROJETOS (${projetos.length})</div>
          ${projetos.map(p => `
            <div class="detail-list-item">
              <div>
                <div style="font-weight:500">${p.nome}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">${Utils.currency(p.valor)}</div>
              </div>
              <span class="status-badge ${Utils.statusColor(p.status)}">${Utils.statusLabel(p.status)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${orcamentos.length > 0 ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);margin-bottom:10px">ORÇAMENTOS (${orcamentos.length})</div>
          ${orcamentos.map(o => `
            <div class="detail-list-item">
              <div>
                <div style="font-weight:500">${o.titulo}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">${Utils.currency(o.total)}</div>
              </div>
              <span class="status-badge ${Utils.statusColor(o.status)}">${Utils.statusLabel(o.status)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    const overlay = Utils.modal(c.nome, content, null);
    // Replace confirm with edit/delete buttons
    const footer = overlay.querySelector('.dc-modal-footer');
    footer.innerHTML = `
      <button class="btn btn-danger btn-sm" onclick="ClientesModule.remove('${c.id}')">
        ${Utils.icon('trash', 14)} Excluir
      </button>
      <button class="btn btn-ghost" onclick="this.closest('.dc-modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="this.closest('.dc-modal-overlay').remove();ClientesModule.openForm('${c.id}')">
        ${Utils.icon('edit', 14)} Editar
      </button>
    `;
  },

  openForm(id = null) {
    const client = id ? Store.clientes.getById(id) : null;
    const content = `
      <div class="form-group">
        <label>Nome Completo</label>
        <input class="form-input" id="cli-nome" value="${client?.nome || ''}" placeholder="Nome do cliente">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-input" id="cli-email" value="${client?.email || ''}" placeholder="email@exemplo.com">
        </div>
        <div class="form-group">
          <label>Telefone</label>
          <input class="form-input" id="cli-telefone" value="${client?.telefone || ''}" placeholder="(11) 99999-0000">
        </div>
      </div>
      <div class="form-group">
        <label>Endereço</label>
        <input class="form-input" id="cli-endereco" value="${client?.endereco || ''}" placeholder="Rua, número - Cidade/UF">
      </div>
      <div class="form-group">
        <label>Observações</label>
        <textarea class="form-textarea" id="cli-obs" placeholder="Anotações sobre o cliente...">${client?.observacoes || ''}</textarea>
      </div>
    `;

    Utils.modal(id ? 'Editar Cliente' : 'Novo Cliente', content, () => {
      this.save(id);
    });
  },

  save(id) {
    const nome = document.getElementById('cli-nome')?.value?.trim();
    if (!nome) { Utils.toast('Informe o nome do cliente', 'error'); return; }

    const data = {
      nome,
      email: document.getElementById('cli-email')?.value?.trim(),
      telefone: document.getElementById('cli-telefone')?.value?.trim(),
      endereco: document.getElementById('cli-endereco')?.value?.trim(),
      observacoes: document.getElementById('cli-obs')?.value?.trim(),
    };

    if (id) {
      Store.clientes.update(id, data);
      Utils.toast('Cliente atualizado');
    } else {
      Store.clientes.add(data);
      Utils.toast('Cliente adicionado');
    }

    App.refresh();
  },

  async remove(id) {
    const ok = await Utils.confirm('Deseja excluir este cliente? Projetos e orçamentos vinculados não serão removidos.');
    if (ok) {
      Store.clientes.remove(id);
      Utils.toast('Cliente excluído');
      document.querySelector('.dc-modal-overlay')?.remove();
      App.refresh();
    }
  },
};
