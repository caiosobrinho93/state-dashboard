// ============================================
// DIGITAL CORTE — Orçamentos (Clean)
// ============================================

const OrcamentoModule = {
  render(container) {
    const orcamentos = Store.orcamentos.getAll();

    container.innerHTML = `
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/></svg>
            Orçamentos (${orcamentos.length})
          </div>
          <button class="btn btn-primary btn-sm" onclick="OrcamentoModule.openForm()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo
          </button>
        </div>
        <div class="section-body">
          ${orcamentos.length ? `
            <table class="table-minimal table-clickable">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${orcamentos.map(o => `
                  <tr onclick="OrcamentoModule.openDetail('${o.id}')">
                    <td><strong>${Utils.escapeHtml(o.titulo)}</strong></td>
                    <td>${Utils.escapeHtml(o.clienteNome) || '—'}</td>
                    <td class="col-num">${Utils.currency(o.total)}</td>
                    <td>
                      <span class="status-pill ${o.status === 'aprovado' ? 'green' : o.status === 'pendente' ? 'orange' : o.status === 'rejeitado' ? 'red' : 'blue'}">
                        ${o.status === 'aprovado' ? 'Aprovado' : o.status === 'pendente' ? 'Pendente' : o.status === 'rejeitado' ? 'Rejeitado' : 'Orçamento'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-mini">Nenhum orçamento. Clique em Novo para criar.</div>'}
        </div>
      </div>
    `;
  },

  openDetail(id) {
    const o = Store.orcamentos.getById(id);
    if (!o) return;

    const html = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="detail-row-mini">
          <span>Título</span>
          <strong>${Utils.escapeHtml(o.titulo)}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Cliente</span>
          <strong>${Utils.escapeHtml(o.clienteNome) || '—'}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Valor</span>
          <strong style="color:var(--accent)">${Utils.currency(o.total)}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Status</span>
          <span class="status-pill ${o.status === 'aprovado' ? 'green' : o.status === 'pendente' ? 'orange' : o.status === 'rejeitado' ? 'red' : 'blue'}">
            ${o.status === 'aprovado' ? 'Aprovado' : o.status === 'pendente' ? 'Pendente' : o.status === 'rejeitado' ? 'Rejeitado' : 'Orçamento'}
          </span>
        </div>
        <div class="detail-row-mini">
          <span>Validade</span>
          <strong>${Utils.date(o.validade) || '—'}</strong>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-danger" onclick="OrcamentoModule.remove('${o.id}');document.querySelector('.modal-overlay').remove()">Excluir</button>
      <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Fechar</button>
      <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove();OrcamentoModule.gerarPDF('${o.id}')">PDF</button>
      <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();OrcamentoModule.openForm('${o.id}')">Editar</button>
    `;

    Utils.modal(Utils.escapeHtml(o.titulo), html, null, footer);
  },

  openForm(id = null) {
    const orc = id ? Store.orcamentos.getById(id) : null;
    const clientes = Store.clientes.getAll();
    
    const html = `
      <div class="form-group">
        <label>Título</label>
        <input class="form-input" id="orc-titulo" value="${Utils.escapeHtml(orc?.titulo || '')}" placeholder="Ex: Cozinha Planejada">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Cliente</label>
          <select class="form-select" id="orc-cliente">
            <option value="">Selecione...</option>
            ${clientes.map(c => `<option value="${c.id}" ${orc?.clienteId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.nome)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-select" id="orc-status">
            <option value="orcamento" ${orc?.status === 'orcamento' ? 'selected' : ''}>Orçamento</option>
            <option value="pendente" ${orc?.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="aprovado" ${orc?.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
            <option value="rejeitado" ${orc?.status === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="number" class="form-input" id="orc-valor" value="${orc?.total || 0}" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label>Validade</label>
          <input type="date" class="form-input" id="orc-validade" value="${orc?.validade || ''}">
        </div>
      </div>
    `;

    Utils.modal(id ? 'Editar Orçamento' : 'Novo Orçamento', html, () => this.save(id));
  },

  save(id) {
    const titulo = document.getElementById('orc-titulo')?.value?.trim();
    if (!titulo) { Utils.toast('Informe o título', 'error'); return; }

    const clienteId = document.getElementById('orc-cliente')?.value;
    const cliente = clienteId ? Store.clientes.getById(clienteId) : null;
    
    const data = {
      titulo,
      clienteId,
      clienteNome: cliente?.nome || '',
      total: parseFloat(document.getElementById('orc-valor')?.value) || 0,
      status: document.getElementById('orc-status')?.value || 'orcamento',
      validade: document.getElementById('orc-validade')?.value,
      itens: []
    };

    if (id) {
      Store.orcamentos.update(id, data);
      Utils.toast('Atualizado');
    } else {
      Store.orcamentos.add(data);
      Utils.toast('Criado');
    }

    App.refresh();
  },

  async remove(id) {
    Store.orcamentos.remove(id);
    Utils.toast('Excluído');
    App.refresh();
  },

  gerarPDF(id) {
    const orc = Store.orcamentos.getById(id);
    if (!orc) return;
    
    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Orçamento - ${orc.titulo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; font-size: 11pt; }
    .page { width: 210mm; min-height: 297mm; padding: 40mm; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-mark { width: 48px; height: 48px; background: #e85d04; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; color: white; }
    .logo-text { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
    .logo-sub { font-size: 10px; color: #666; }
    .doc-title { text-align: right; }
    .doc-title strong { font-family: 'Space Grotesk', sans-serif; font-size: 24px; display: block; margin-bottom: 4px; }
    .doc-title span { font-size: 11px; color: #666; }
    .client { margin-bottom: 30px; padding: 20px; background: #f8f8f8; border-radius: 8px; }
    .client h4 { font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 10px; }
    .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
    .client-grid span { color: #666; }
    .client-grid strong { color: #1a1a1a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; font-size: 9px; text-transform: uppercase; color: #999; padding: 12px; border-bottom: 1px solid #eee; }
    td { padding: 12px; font-size: 11px; border-bottom: 1px solid #f0f0f0; }
    td:last-child, th:last-child { text-align: right; }
    .total { text-align: right; font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #e85d04; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 9px; color: #999; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-mark">DC</div>
        <div>
          <div class="logo-text">Digital Corte</div>
          <div class="logo-sub">Marcenaria & Móveis Planejados</div>
        </div>
      </div>
      <div class="doc-title">
        <strong>ORÇAMENTO</strong>
        <span>${Utils.date(orc.criadoEm)} • Val: ${Utils.date(orc.validade) || '30 dias'}</span>
      </div>
    </div>
    <div class="client">
      <h4>Cliente</h4>
      <div class="client-grid">
        <div><span>Nome:</span> <strong>${orc.clienteNome || '—'}</strong></div>
        <div><span>Data:</span> <strong>${Utils.date(orc.criadoEm)}</strong></div>
      </div>
    </div>
    <table>
      <thead><tr><th>Descrição</th><th>Qtd</th><th>Valor</th><th>Total</th></tr></thead>
      <tbody>
        ${(orc.itens && orc.itens.length > 0) ? orc.itens.map(item => `<tr><td>${item.desc}</td><td>${item.qtd}</td><td>${Utils.currency(item.valor)}</td><td>${Utils.currency(item.qtd * item.valor)}</td></tr>`).join('') : `<tr><td>${orc.titulo}</td><td>1</td><td>${Utils.currency(orc.total)}</td><td>${Utils.currency(orc.total)}</td></tr>`}
      </tbody>
    </table>
    <div class="total">Total: ${Utils.currency(orc.total)}</div>
    <div class="footer">Digital Corte — (11) 99999-0000 — digitalcorte@email.com</div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
};