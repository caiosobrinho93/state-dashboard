// ============================================
// DIGITAL CORTE — Módulo: Negociações
// ============================================

const NegociacoesModule = {
  stages: [
    { key: 'contato', label: 'Contato Inicial', color: 'var(--text-muted)' },
    { key: 'proposta', label: 'Proposta Enviada', color: 'var(--warning)' },
    { key: 'negociacao', label: 'Em Negociação', color: 'var(--info)' },
    { key: 'fechado', label: 'Fechado', color: 'var(--success)' },
    { key: 'perdido', label: 'Perdido', color: 'var(--danger)' },
  ],

  render(container) {
    const negs = Store.negociacoes.getAll();
    const valorTotal = negs.filter(n => n.status !== 'perdido').reduce((s, n) => s + (n.valor || 0), 0);
    const fechados = negs.filter(n => n.status === 'fechado');

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">${Utils.icon('negociacoes', 20)}</div>
          <div class="kpi-label">Negociações Ativas</div>
          <div class="kpi-value">${negs.filter(n => n.status !== 'fechado' && n.status !== 'perdido').length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange">${Utils.icon('financeiro', 20)}</div>
          <div class="kpi-label">Valor no Pipeline</div>
          <div class="kpi-value">${Utils.currency(valorTotal)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">${Utils.icon('check', 20)}</div>
          <div class="kpi-label">Fechados</div>
          <div class="kpi-value">${fechados.length}</div>
        </div>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <h3 style="font-family:'Space Grotesk',sans-serif;font-size:1rem">Pipeline de Vendas</h3>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" onclick="NegociacoesModule.openForm()">
            ${Utils.icon('plus', 18)} Nova Negociação
          </button>
        </div>
      </div>

      <div class="pipeline" id="neg-pipeline"></div>
    `;

    this.renderPipeline(negs);
  },

  renderPipeline(negs) {
    const pipeline = document.getElementById('neg-pipeline');
    if (!pipeline) return;

    const activeStages = this.stages.filter(s => s.key !== 'perdido');

    pipeline.innerHTML = activeStages.map(stage => {
      const stageNegs = negs.filter(n => n.status === stage.key);
      const stageTotal = stageNegs.reduce((s, n) => s + (n.valor || 0), 0);

      return `
        <div class="pipeline-column">
          <div class="pipeline-column-header">
            <div class="pipeline-column-title">
              <span style="width:8px;height:8px;border-radius:50%;background:${stage.color};display:inline-block"></span>
              ${stage.label}
            </div>
            <span class="pipeline-column-count">${stageNegs.length}</span>
          </div>
          ${stageNegs.length === 0 
            ? '<div style="padding:20px;text-align:center;font-size:0.8rem;color:var(--text-muted)">Nenhuma negociação</div>'
            : stageNegs.map(n => `
              <div class="pipeline-card" onclick="NegociacoesModule.viewDetail('${n.id}')">
                <div class="pipeline-card-title">${n.titulo || '—'}</div>
                <div class="pipeline-card-meta">${n.clienteNome || 'Sem cliente'}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                  <div class="pipeline-card-value">${Utils.currency(n.valor)}</div>
                  ${n.probabilidade ? `<span style="font-size:0.7rem;color:var(--text-muted)">${n.probabilidade}%</span>` : ''}
                </div>
              </div>
            `).join('')
          }
          ${stage.key !== 'fechado' ? `<div style="text-align:right;padding-top:8px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:0.75rem;color:var(--text-muted)">Total: ${Utils.currency(stageTotal)}</span></div>` : ''}
        </div>
      `;
    }).join('');
  },

  viewDetail(id) {
    const n = Store.negociacoes.getById(id);
    if (!n) return;
    const stageInfo = this.stages.find(s => s.key === n.status) || {};

    const content = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Título</span>
          <span class="detail-value">${n.titulo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cliente</span>
          <span class="detail-value">${n.clienteNome || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor</span>
          <span class="detail-value" style="font-family:'Space Grotesk',sans-serif;font-size:1.2rem;font-weight:700;color:var(--accent)">${Utils.currency(n.valor)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Etapa</span>
          <span class="detail-value">
            <span style="display:inline-flex;align-items:center;gap:6px">
              <span style="width:8px;height:8px;border-radius:50%;background:${stageInfo.color || 'var(--text-muted)'}"></span>
              ${stageInfo.label || n.status}
            </span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Probabilidade</span>
          <span class="detail-value">${n.probabilidade || 0}%</span>
        </div>
        ${n.notas ? `<div class="detail-row"><span class="detail-label">Notas</span><span class="detail-value">${n.notas}</span></div>` : ''}
      </div>
    `;

    const overlay = Utils.modal(n.titulo, content, null);
    const footer = overlay.querySelector('.dc-modal-footer');
    footer.innerHTML = `
      <button class="btn btn-danger btn-sm" onclick="NegociacoesModule.remove('${n.id}')">
        ${Utils.icon('trash', 14)} Excluir
      </button>
      <button class="btn btn-ghost" onclick="this.closest('.dc-modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="this.closest('.dc-modal-overlay').remove();NegociacoesModule.openForm('${n.id}')">
        ${Utils.icon('edit', 14)} Editar
      </button>
    `;
  },

  openForm(id = null) {
    const neg = id ? Store.negociacoes.getById(id) : null;
    const clientes = Store.clientes.getAll();
    const clienteOptions = clientes.map(c =>
      `<option value="${c.id}" ${neg?.clienteId === c.id ? 'selected' : ''}>${c.nome}</option>`
    ).join('');

    const stageOptions = this.stages.map(s =>
      `<option value="${s.key}" ${neg?.status === s.key ? 'selected' : ''}>${s.label}</option>`
    ).join('');

    const content = `
      <div class="form-group">
        <label>Título da Negociação</label>
        <input class="form-input" id="neg-titulo" value="${neg?.titulo || ''}" placeholder="Ex: Cozinha planejada">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Cliente</label>
          <select class="form-select" id="neg-cliente">
            <option value="">Selecione ou deixe em branco...</option>
            ${clienteOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Nome do Cliente</label>
          <input class="form-input" id="neg-cliente-nome" value="${neg?.clienteNome || ''}" placeholder="Caso não esteja cadastrado">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" class="form-input" id="neg-valor" value="${neg?.valor || 0}" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Probabilidade (%)</label>
          <input type="number" class="form-input" id="neg-prob" value="${neg?.probabilidade || 50}" min="0" max="100">
        </div>
      </div>
      <div class="form-group">
        <label>Etapa</label>
        <select class="form-select" id="neg-status">
          ${stageOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Notas</label>
        <textarea class="form-textarea" id="neg-notas" placeholder="Observações sobre a negociação...">${neg?.notas || ''}</textarea>
      </div>
      ${id ? `<div style="padding-top:8px;border-top:1px solid var(--border)">
        <button class="btn btn-danger btn-sm" onclick="NegociacoesModule.remove('${id}')">
          ${Utils.icon('trash', 14)} Excluir Negociação
        </button>
      </div>` : ''}
    `;

    Utils.modal(id ? 'Editar Negociação' : 'Nova Negociação', content, () => {
      this.save(id);
    });

    // Sync client name from select
    setTimeout(() => {
      document.getElementById('neg-cliente')?.addEventListener('change', (e) => {
        const cli = Store.clientes.getById(e.target.value);
        if (cli) document.getElementById('neg-cliente-nome').value = cli.nome;
      });
    }, 100);
  },

  save(id) {
    const titulo = document.getElementById('neg-titulo')?.value?.trim();
    if (!titulo) { Utils.toast('Informe o título da negociação', 'error'); return; }

    const clienteId = document.getElementById('neg-cliente')?.value || null;
    const clienteNome = document.getElementById('neg-cliente-nome')?.value?.trim() || '';

    const data = {
      titulo,
      clienteId,
      clienteNome,
      valor: parseFloat(document.getElementById('neg-valor')?.value) || 0,
      probabilidade: parseInt(document.getElementById('neg-prob')?.value) || 50,
      status: document.getElementById('neg-status')?.value || 'contato',
      notas: document.getElementById('neg-notas')?.value?.trim(),
    };

    if (id) {
      Store.negociacoes.update(id, data);
      Utils.toast('Negociação atualizada');
    } else {
      Store.negociacoes.add(data);
      Utils.toast('Negociação criada');
    }

    App.refresh();
  },

  async remove(id) {
    const ok = await Utils.confirm('Deseja excluir esta negociação?');
    if (ok) {
      Store.negociacoes.remove(id);
      Utils.toast('Negociação excluída');
      // Close modal
      document.querySelector('.dc-modal-overlay')?.remove();
      App.refresh();
    }
  },
};
