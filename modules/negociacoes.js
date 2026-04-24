// ============================================
// STATE MARCENARIA — Negociações (Clean)
// ============================================

const NegociacoesModule = {
  stages: [
    { key: 'contato', label: 'Contato', color: 'blue' },
    { key: 'proposta', label: 'Proposta', color: 'orange' },
    { key: 'negociacao', label: 'Negociação', color: 'yellow' },
    { key: 'fechado', label: 'Fechado', color: 'green' },
  ],

  render(container) {
    const negs = Store.negociacoes.getAll();

    container.innerHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-title">Pipeline (${negs.length})</div>
          <button class="btn btn-primary btn-sm" onclick="NegociacoesModule.openForm()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova
          </button>
        </div>
        <div class="section-body">
          <div class="pipeline-grid">
            ${this.stages.map(stage => {
              const stageNegs = negs.filter(n => n.status === stage.key);
              return `
                <div class="pipeline-col">
                  <div class="pipeline-col-header">
                    <div class="pipeline-col-title">
                      <span style="background:var(--${stage.color === 'blue' ? 'info' : stage.color === 'orange' ? 'accent' : stage.color === 'yellow' ? 'warning' : 'success'})"></span>
                      ${stage.label}
                    </div>
                    <span class="pipeline-col-count">${stageNegs.length}</span>
                  </div>
                  ${stageNegs.length ? stageNegs.map(n => `
                    <div class="pipeline-card-mini" onclick="event.stopPropagation();NegociacoesModule.openDetail('${n.id}')">
                      <div class="pipeline-card-title">${Utils.escapeHtml(n.titulo)}</div>
                      <div class="pipeline-card-value">${Utils.currency(n.valor)}</div>
                    </div>
                  `).join('') : '<div style="font-size:0.75rem;color:var(--text-3);text-align:center;padding:20px 0">Nenhuma</div>'}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  openDetail(id) {
    const n = Store.negociacoes.getById(id);
    if (!n) return;

    const html = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="detail-row-mini">
          <span>Título</span>
          <strong>${Utils.escapeHtml(n.titulo)}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Cliente</span>
          <strong>${Utils.escapeHtml(n.clienteNome) || '—'}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Valor</span>
          <strong style="color:var(--accent)">${Utils.currency(n.valor)}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Status</span>
          <span class="status-pill ${n.status === 'contato' ? 'blue' : n.status === 'proposta' ? 'orange' : n.status === 'negociacao' ? 'yellow' : 'green'}">
            ${n.status === 'contato' ? 'Contato' : n.status === 'proposta' ? 'Proposta' : n.status === 'negociacao' ? 'Negociação' : 'Fechado'}
          </span>
        </div>
        <div class="detail-row-mini">
          <span>Probabilidade</span>
          <strong>${n.probabilidade || 50}%</strong>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-danger" onclick="NegociacoesModule.remove('${n.id}');document.querySelector('.modal-overlay').remove()">Excluir</button>
      <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();NegociacoesModule.openForm('${n.id}')">Editar</button>
    `;

    Utils.modal(Utils.escapeHtml(n.titulo), html, null, footer);
  },

  openForm(id = null) {
    const n = id ? Store.negociacoes.getById(id) : null;
    const clientes = Store.clientes.getAll();

    const html = `
      <div class="form-group">
        <label>Título</label>
        <input class="form-input" id="neg-titulo" value="${Utils.escapeHtml(n?.titulo || '')}" placeholder="Ex: Cozinha completa">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Cliente</label>
          <select class="form-select" id="neg-cliente">
            <option value="">Selecione...</option>
            ${clientes.map(c => `<option value="${c.id}" ${n?.clienteId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.nome)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" class="form-input" id="neg-valor" value="${n?.valor || 0}" min="0">
        </div>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select class="form-select" id="neg-status">
          <option value="contato" ${n?.status === 'contato' ? 'selected' : ''}>Contato</option>
          <option value="proposta" ${n?.status === 'proposta' ? 'selected' : ''}>Proposta</option>
          <option value="negociacao" ${n?.status === 'negociacao' ? 'selected' : ''}>Negociação</option>
          <option value="fechado" ${n?.status === 'fechado' ? 'selected' : ''}>Fechado</option>
        </select>
      </div>
    `;

    Utils.modal(id ? 'Editar Negociação' : 'Nova Negociação', html, () => this.save(id));
  },

  save(id) {
    const titulo = document.getElementById('neg-titulo')?.value?.trim();
    if (!titulo) { Utils.toast('Informe o título', 'error'); return; }

    const clienteId = document.getElementById('neg-cliente')?.value;
    const cliente = clienteId ? Store.clientes.getById(clienteId) : null;

    const data = {
      titulo,
      clienteId,
      clienteNome: cliente?.nome || '',
      valor: parseFloat(document.getElementById('neg-valor')?.value) || 0,
      status: document.getElementById('neg-status')?.value || 'contato',
      probabilidade: 50,
      notas: '',
    };

    if (id) {
      Store.negociacoes.update(id, data);
      Utils.toast('Atualizado');
    } else {
      Store.negociacoes.add(data);
      Utils.toast('Criada');
    }

    App.refresh();
  },

  remove(id) {
    Store.negociacoes.remove(id);
    Utils.toast('Excluída');
    App.refresh();
  }
};