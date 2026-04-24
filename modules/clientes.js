// ============================================
// STATE MARCENARIA — Clientes (Clean)
// ============================================

const ClientesModule = {
  render(container) {
    const clientes = Store.clientes.getAll();

    container.innerHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Clientes (${clientes.length})
          </div>
          <button class="btn btn-primary btn-sm" onclick="ClientesModule.openForm()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo
          </button>
        </div>
        <div class="section-body">
          ${clientes.length ? `
            <table class="table-minimal table-clickable">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Projetos</th>
                </tr>
              </thead>
              <tbody>
                ${clientes.map(c => `
                  <tr onclick="ClientesModule.openDetail('${c.id}')">
                    <td><strong>${Utils.escapeHtml(c.nome)}</strong></td>
                    <td>${c.telefone || c.email || '—'}</td>
                    <td>${Store.projetos.getAll().filter(p => p.clienteId === c.id).length}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-mini">Nenhum cliente. Clique em Novo para adicionar.</div>'}
        </div>
      </div>
    `;
  },

  openDetail(id) {
    const c = Store.clientes.getById(id);
    if (!c) return;

    const projetos = Store.projetos.getAll().filter(p => p.clienteId === id);
    const orcamentos = Store.orcamentos.getAll().filter(o => o.clienteId === id);

    const html = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="detail-row-mini">
          <span>Nome</span>
          <strong>${Utils.escapeHtml(c.nome)}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Telefone</span>
          <strong>${c.telefone || '—'}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Email</span>
          <strong>${c.email || '—'}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Endereço</span>
          <strong>${c.endereco || '—'}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Projetos</span>
          <strong>${projetos.length}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Orçamentos</span>
          <strong>${orcamentos.length}</strong>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-danger" onclick="ClientesModule.remove('${c.id}');document.querySelector('.modal-overlay').remove()">Excluir</button>
      <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();ClientesModule.openForm('${c.id}')">Editar</button>
    `;

    Utils.modal(Utils.escapeHtml(c.nome), html, null, footer);
  },

  openForm(id = null) {
    const c = id ? Store.clientes.getById(id) : null;
    
    const html = `
      <div class="form-group">
        <label>Nome</label>
        <input class="form-input" id="cli-nome" value="${Utils.escapeHtml(c?.nome || '')}" placeholder="Nome completo">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Telefone</label>
          <input class="form-input" id="cli-telefone" value="${Utils.escapeHtml(c?.telefone || '')}" placeholder="(11) 99999-0000">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input class="form-input" id="cli-email" value="${Utils.escapeHtml(c?.email || '')}" placeholder="email@exemplo.com">
        </div>
      </div>
      <div class="form-group">
        <label>Endereço</label>
        <input class="form-input" id="cli-endereco" value="${Utils.escapeHtml(c?.endereco || '')}" placeholder="Rua, número - Cidade">
      </div>
    `;

    Utils.modal(id ? 'Editar Cliente' : 'Novo Cliente', html, () => this.save(id));
  },

  save(id) {
    const nome = document.getElementById('cli-nome')?.value?.trim();
    if (!nome) { Utils.toast('Informe o nome', 'error'); return; }

    const data = {
      nome,
      telefone: document.getElementById('cli-telefone')?.value?.trim(),
      email: document.getElementById('cli-email')?.value?.trim(),
      endereco: document.getElementById('cli-endereco')?.value?.trim(),
    };

    if (id) {
      Store.clientes.update(id, data);
      Utils.toast('Atualizado');
    } else {
      Store.clientes.add(data);
      Utils.toast('Adicionado');
    }

    App.refresh();
  },

  remove(id) {
    Store.clientes.remove(id);
    Utils.toast('Excluído');
    App.refresh();
  }
};