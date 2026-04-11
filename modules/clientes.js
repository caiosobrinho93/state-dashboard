// ============================================
// DIGITAL CORTE — Clientes (Clean)
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
            <table class="table-minimal">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Projetos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${clientes.map(c => `
                  <tr>
                    <td><strong>${Utils.escapeHtml(c.nome)}</strong></td>
                    <td>${c.telefone || c.email || '—'}</td>
                    <td>${Store.projetos.getAll().filter(p => p.clienteId === c.id).length}</td>
                    <td>
                      <div class="actions-mini">
                        <button class="btn-icon-mini" onclick="ClientesModule.openForm('${c.id}')" title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon-mini danger" onclick="ClientesModule.remove('${c.id}')" title="Excluir">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-mini">Nenhum cliente. Clique em Novo para adicionar.</div>'}
        </div>
      </div>
    `;
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

  async remove(id) {
    if (confirm('Excluir cliente?')) {
      Store.clientes.remove(id);
      Utils.toast('Excluído');
      App.refresh();
    }
  }
};