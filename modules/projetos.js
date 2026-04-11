// ============================================
// DIGITAL CORTE — Projetos (Clean)
// ============================================

const ProjetosModule = {
  render(container) {
    const projetos = Store.projetos.getAll();
    const stats = Store.getStats();

    container.innerHTML = `
      <div class="stats-bar">
        <div class="stat-mini">
          <div class="stat-mini-icon orange"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
          <div><div class="stat-mini-value">${stats.totalProjetos}</div><div class="stat-mini-label">Total</div></div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-icon green"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div><div class="stat-mini-value">${stats.projetosAtivos}</div><div class="stat-mini-label">Em Andamento</div></div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-icon blue"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg></div>
          <div><div class="stat-mini-value">${projetos.filter(p => p.status === 'concluido').length}</div><div class="stat-mini-label">Concluídos</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Projetos (${projetos.length})</div>
          <button class="btn btn-primary btn-sm" onclick="ProjetosModule.openForm()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo
          </button>
        </div>
        <div class="section-body">
          ${projetos.length ? `
            <table class="table-minimal">
              <thead><tr><th>Projeto</th><th>Cliente</th><th>Valor</th><th>Status</th><th></th></tr></thead>
              <tbody>
                ${projetos.map(p => `
                  <tr>
                    <td><strong>${Utils.escapeHtml(p.nome)}</strong></td>
                    <td>${Utils.escapeHtml(p.clienteNome) || '—'}</td>
                    <td class="col-num">${Utils.currency(p.valor)}</td>
                    <td>
                      <span class="status-pill ${p.status === 'em_andamento' ? 'orange' : p.status === 'concluido' ? 'green' : p.status === 'orcamento' ? 'blue' : 'red'}">
                        ${p.status === 'em_andamento' ? 'Em Andamento' : p.status === 'concluido' ? 'Concluído' : p.status === 'orcamento' ? 'Orçamento' : 'Cancelado'}
                      </span>
                    </td>
                    <td>
                      <div class="actions-mini">
                        <button class="btn-icon-mini" onclick="ProjetosModule.openForm('${p.id}')" title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon-mini danger" onclick="ProjetosModule.remove('${p.id}')" title="Excluir">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-mini">Nenhum projeto. Clique em Novo para criar.</div>'}
        </div>
      </div>
    `;
  },

  openForm(id = null) {
    const p = id ? Store.projetos.getById(id) : null;
    const clientes = Store.clientes.getAll();

    const html = `
      <div class="form-group">
        <label>Nome do Projeto</label>
        <input class="form-input" id="proj-nome" value="${Utils.escapeHtml(p?.nome || '')}" placeholder="Ex: Cozinha Planejada">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Cliente</label>
          <select class="form-select" id="proj-cliente">
            <option value="">Selecione...</option>
            ${clientes.map(c => `<option value="${c.id}" ${p?.clienteId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.nome)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="proj-status">
            <option value="orcamento" ${p?.status === 'orcamento' ? 'selected' : ''}>Orçamento</option>
            <option value="em_andamento" ${p?.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
            <option value="concluido" ${p?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
            <option value="cancelado" ${p?.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" class="form-input" id="proj-valor" value="${p?.valor || 0}" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Previsão</label>
          <input type="date" class="form-input" id="proj-previsao" value="${p?.previsao || ''}">
        </div>
      </div>
    `;

    Utils.modal(id ? 'Editar Projeto' : 'Novo Projeto', html, () => this.save(id));
  },

  save(id) {
    const nome = document.getElementById('proj-nome')?.value?.trim();
    if (!nome) { Utils.toast('Informe o nome', 'error'); return; }

    const clienteId = document.getElementById('proj-cliente')?.value;
    const cliente = clienteId ? Store.clientes.getById(clienteId) : null;

    const data = {
      nome,
      clienteId,
      clienteNome: cliente?.nome || '',
      valor: parseFloat(document.getElementById('proj-valor')?.value) || 0,
      status: document.getElementById('proj-status')?.value || 'orcamento',
      previsao: document.getElementById('proj-previsao')?.value,
      inicio: new Date().toISOString().split('T')[0],
    };

    if (id) {
      Store.projetos.update(id, data);
      Utils.toast('Atualizado');
    } else {
      Store.projetos.add(data);
      Utils.toast('Criado');
    }

    App.refresh();
  },

  async remove(id) {
    if (confirm('Excluir projeto?')) {
      Store.projetos.remove(id);
      Utils.toast('Excluído');
      App.refresh();
    }
  }
};