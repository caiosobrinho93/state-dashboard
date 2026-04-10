// ============================================
// DIGITAL CORTE — Módulo: Orçamentos
// Com formulário completo de gerador de PDF
// ============================================

const OrcamentoModule = {
  render(container) {
    const orcamentos = Store.orcamentos.getAll();

    container.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-add-group" style="margin-bottom:12px">
            <div class="search-box">
              ${Utils.icon('search', 18)}
              <input type="text" class="form-input" placeholder="Buscar orçamento..." id="orc-search">
            </div>
            <button class="btn btn-primary btn-square" onclick="OrcamentoModule.openForm()" title="Novo Orçamento">
              ${Utils.icon('plus', 20)}
            </button>
            <button class="btn btn-ghost btn-square" onclick="OrcamentoModule.openGerador()" title="Gerar PDF">
              ${Utils.icon('pdf', 20)}
            </button>
          </div>
          <div class="filter-pills">
            <button class="filter-pill active" data-filter="todos">Todos</button>
            <button class="filter-pill" data-filter="pendente">Pendentes</button>
            <button class="filter-pill" data-filter="aprovado">Aprovados</button>
            <button class="filter-pill" data-filter="rejeitado">Rejeitados</button>
          </div>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table-responsive">
          <thead>
            <tr>
              <th>Título</th>
              <th class="col-hide-sm">Cliente</th>
              <th class="col-hide-sm">Valor</th>
              <th class="col-hide-md">Validade</th>
              <th class="col-hide-sm">Status</th>
              <th class="col-hide-sm col-actions" style="width:120px">Ações</th>
            </tr>
          </thead>
          <tbody id="orc-table-body"></tbody>
        </table>
      </div>
    `;

    this.renderTable(orcamentos);
    this.setupFilters();
  },

  renderTable(data) {
    const tbody = document.getElementById('orc-table-body');
    if (!tbody) return;
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><p>Nenhum orçamento encontrado</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = data.map(o => `
      <tr class="row-clickable" onclick="OrcamentoModule.viewDetail('${o.id}')">
        <td>${o.titulo || '—'}</td>
        <td class="col-hide-sm">${o.clienteNome || '—'}</td>
        <td class="col-hide-sm" style="font-family:'Space Grotesk',sans-serif;font-weight:600">${Utils.currency(o.total)}</td>
        <td class="col-hide-md">${Utils.date(o.validade)}</td>
        <td class="col-hide-sm"><span class="status-badge ${Utils.statusColor(o.status)}">${Utils.statusLabel(o.status)}</span></td>
        <td class="col-hide-sm col-actions" onclick="event.stopPropagation()">
          <div class="table-actions">
            <button class="btn btn-sm btn-ghost btn-icon" onclick="OrcamentoModule.gerarPDF('${o.id}')" title="Gerar PDF">${Utils.icon('pdf', 16)}</button>
            <button class="btn btn-sm btn-ghost btn-icon" onclick="OrcamentoModule.openForm('${o.id}')" title="Editar">${Utils.icon('edit', 16)}</button>
            <button class="btn btn-sm btn-danger btn-icon" onclick="OrcamentoModule.remove('${o.id}')" title="Excluir">${Utils.icon('trash', 16)}</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  viewDetail(id) {
    const o = Store.orcamentos.getById(id);
    if (!o) return;

    const content = `
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Título</span>
          <span class="detail-value">${o.titulo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cliente</span>
          <span class="detail-value">${o.clienteNome || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-badge ${Utils.statusColor(o.status)}">${Utils.statusLabel(o.status)}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Validade</span>
          <span class="detail-value">${Utils.date(o.validade)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total</span>
          <span class="detail-value" style="font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:700;color:var(--accent)">${Utils.currency(o.total)}</span>
        </div>
      </div>
      ${(o.itens && o.itens.length > 0) ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);margin-bottom:10px">ITENS (${o.itens.length})</div>
          ${o.itens.map(item => `
            <div class="detail-list-item">
              <div>
                <div style="font-weight:500">${item.desc}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">${item.qtd}x ${Utils.currency(item.valor)}</div>
              </div>
              <span style="font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:0.9rem">${Utils.currency(item.qtd * item.valor)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    const overlay = Utils.modal(o.titulo, content, null);
    const footer = overlay.querySelector('.dc-modal-footer');
    footer.innerHTML = `
      <button class="btn btn-danger btn-sm" onclick="OrcamentoModule.remove('${o.id}')">
        ${Utils.icon('trash', 14)} Excluir
      </button>
      <button class="btn btn-ghost" onclick="this.closest('.dc-modal-overlay').remove();OrcamentoModule.gerarPDF('${o.id}')">
        ${Utils.icon('pdf', 14)} Gerar PDF
      </button>
      <button class="btn btn-primary" onclick="this.closest('.dc-modal-overlay').remove();OrcamentoModule.openForm('${o.id}')">
        ${Utils.icon('edit', 14)} Editar
      </button>
    `;
  },

  setupFilters() {
    const search = document.getElementById('orc-search');
    const pills = document.querySelectorAll('.filter-pills .filter-pill');
    let currentFilter = 'todos';

    const applyFilter = () => {
      let data = Store.orcamentos.getAll();
      const q = (search?.value || '').toLowerCase();
      if (q) data = data.filter(o => (o.titulo || '').toLowerCase().includes(q) || (o.clienteNome || '').toLowerCase().includes(q));
      if (currentFilter !== 'todos') data = data.filter(o => o.status === currentFilter);
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

  // ── Gerador de Orçamento (formulário fullpage) ──
  openGerador(id = null) {
    const orc = id ? Store.orcamentos.getById(id) : null;
    const clientes = Store.clientes.getAll();
    const container = document.getElementById('main-content');

    document.getElementById('page-title').textContent = id ? 'Editar Orçamento' : 'Gerador de Orçamentos';

    const clienteOptions = clientes.map(c => `<option value="${c.id}" ${orc?.clienteId === c.id ? 'selected' : ''}>${c.nome}</option>`).join('');

    const itensHtml = (orc?.itens || [{ desc: '', qtd: 1, valor: 0 }]).map((item, i) => this._itemRowHtml(item, i)).join('');

    container.innerHTML = `
      <div style="max-width:800px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('orcamentos')">← Voltar</button>
          <h3 style="font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:600">${id ? 'Editar Orçamento' : '📄 Novo Orçamento'}</h3>
        </div>

        <div class="panel" style="margin-bottom:20px">
          <div class="panel-header"><h3>Dados do Orçamento</h3></div>
          <div class="form-row" style="margin-bottom:16px">
            <div class="form-group">
              <label>Título do Orçamento</label>
              <input class="form-input" id="gen-titulo" value="${orc?.titulo || ''}" placeholder="Ex: Cozinha Planejada Completa">
            </div>
            <div class="form-group">
              <label>Cliente</label>
              <select class="form-select" id="gen-cliente" onchange="OrcamentoModule._syncClientInfo()">
                <option value="">Selecione um cliente...</option>
                ${clienteOptions}
              </select>
            </div>
          </div>
          <div class="form-row" style="margin-bottom:16px">
            <div class="form-group">
              <label>Status</label>
              <select class="form-select" id="gen-status">
                <option value="pendente" ${orc?.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                <option value="aprovado" ${orc?.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
                <option value="rejeitado" ${orc?.status === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
              </select>
            </div>
            <div class="form-group">
              <label>Validade do Orçamento</label>
              <input type="date" class="form-input" id="gen-validade" value="${Utils.dateInput(orc?.validade) || ''}">
            </div>
          </div>
          <div id="gen-client-preview" style="display:none;padding:14px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border)">
            <div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Dados do Cliente</div>
            <div id="gen-client-data" style="font-size:0.85rem;color:var(--text-secondary)"></div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:20px">
          <div class="panel-header">
            <h3>Itens do Orçamento</h3>
            <button class="btn btn-sm btn-ghost" onclick="OrcamentoModule._addGenItemRow()">
              ${Utils.icon('plus', 14)} Adicionar Item
            </button>
          </div>
          <div id="gen-itens-container" style="display:flex;flex-direction:column;gap:8px">
            ${itensHtml}
          </div>
          <div style="display:flex;justify-content:flex-end;align-items:center;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
            <span style="color:var(--text-muted);font-size:0.9rem">Total:</span>
            <span style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:var(--accent)" id="gen-total">${Utils.currency(orc?.total || 0)}</span>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn-ghost" onclick="App.navigate('orcamentos')">Cancelar</button>
          <button class="btn btn-ghost" onclick="OrcamentoModule._saveGerador('${id || ''}', false)">
            ${Utils.icon('check', 16)} Salvar
          </button>
          <button class="btn btn-primary" onclick="OrcamentoModule._saveGerador('${id || ''}', true)">
            ${Utils.icon('pdf', 16)} Salvar e Gerar PDF
          </button>
        </div>
      </div>
    `;

    // Setup listeners
    setTimeout(() => {
      this._syncClientInfo();
      document.querySelectorAll('.item-qtd, .item-valor').forEach(input => {
        input.addEventListener('input', () => this._updateGenTotal());
      });
    }, 50);
  },

  _itemRowHtml(item, i) {
    return `
      <div class="gen-item-row" style="display:grid;grid-template-columns:2fr 80px 130px 40px;gap:10px;align-items:end">
        <div class="form-group">
          ${i === 0 ? '<label>Descrição</label>' : ''}
          <input class="form-input item-desc" value="${item.desc || ''}" placeholder="Ex: Gabinete inferior">
        </div>
        <div class="form-group">
          ${i === 0 ? '<label>Qtd</label>' : ''}
          <input type="number" class="form-input item-qtd" value="${item.qtd || 1}" min="1" oninput="OrcamentoModule._updateGenTotal()">
        </div>
        <div class="form-group">
          ${i === 0 ? '<label>Valor (R$)</label>' : ''}
          <input type="number" class="form-input item-valor" value="${item.valor || 0}" min="0" step="0.01" oninput="OrcamentoModule._updateGenTotal()">
        </div>
        <button class="btn btn-sm btn-danger btn-icon" onclick="this.closest('.gen-item-row').remove();OrcamentoModule._updateGenTotal()" style="margin-bottom:1px">
          ${Utils.icon('close', 14)}
        </button>
      </div>
    `;
  },

  _addGenItemRow() {
    const container = document.getElementById('gen-itens-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'gen-item-row';
    div.style.cssText = 'display:grid;grid-template-columns:2fr 80px 130px 40px;gap:10px;align-items:end';
    div.innerHTML = `
      <div class="form-group"><input class="form-input item-desc" placeholder="Descrição do item"></div>
      <div class="form-group"><input type="number" class="form-input item-qtd" value="1" min="1" oninput="OrcamentoModule._updateGenTotal()"></div>
      <div class="form-group"><input type="number" class="form-input item-valor" value="0" min="0" step="0.01" oninput="OrcamentoModule._updateGenTotal()"></div>
      <button class="btn btn-sm btn-danger btn-icon" onclick="this.closest('.gen-item-row').remove();OrcamentoModule._updateGenTotal()" style="margin-bottom:1px">
        ${Utils.icon('close', 14)}
      </button>
    `;
    container.appendChild(div);
    div.querySelector('.item-desc').focus();
  },

  _updateGenTotal() {
    const rows = document.querySelectorAll('.gen-item-row');
    let total = 0;
    rows.forEach(row => {
      const qtd = parseFloat(row.querySelector('.item-qtd')?.value) || 0;
      const valor = parseFloat(row.querySelector('.item-valor')?.value) || 0;
      total += qtd * valor;
    });
    const el = document.getElementById('gen-total');
    if (el) el.textContent = Utils.currency(total);
  },

  _syncClientInfo() {
    const clienteId = document.getElementById('gen-cliente')?.value;
    const preview = document.getElementById('gen-client-preview');
    const dataEl = document.getElementById('gen-client-data');
    if (!clienteId) { if (preview) preview.style.display = 'none'; return; }
    const c = Store.clientes.getById(clienteId);
    if (!c) { if (preview) preview.style.display = 'none'; return; }
    if (preview) preview.style.display = '';
    if (dataEl) dataEl.innerHTML = `
      <strong>${c.nome}</strong><br>
      ${c.telefone ? c.telefone + '<br>' : ''}
      ${c.email ? c.email + '<br>' : ''}
      ${c.endereco || ''}
    `;
  },

  _saveGerador(id, generatePdf) {
    const titulo = document.getElementById('gen-titulo')?.value?.trim();
    const clienteId = document.getElementById('gen-cliente')?.value;
    const status = document.getElementById('gen-status')?.value;
    const validade = document.getElementById('gen-validade')?.value;

    if (!titulo) { Utils.toast('Informe o título do orçamento', 'error'); return; }

    const itens = [];
    document.querySelectorAll('.gen-item-row').forEach(row => {
      const desc = row.querySelector('.item-desc')?.value?.trim();
      const qtd = parseFloat(row.querySelector('.item-qtd')?.value) || 1;
      const valor = parseFloat(row.querySelector('.item-valor')?.value) || 0;
      if (desc) itens.push({ desc, qtd, valor });
    });

    if (itens.length === 0) { Utils.toast('Adicione pelo menos um item', 'error'); return; }

    const total = itens.reduce((s, item) => s + item.qtd * item.valor, 0);
    const cliente = clienteId ? Store.clientes.getById(clienteId) : null;

    const data = { titulo, clienteId, clienteNome: cliente?.nome || '', status, validade, itens, total };

    let savedId;
    if (id) {
      Store.orcamentos.update(id, data);
      savedId = id;
      Utils.toast('Orçamento atualizado');
    } else {
      const saved = Store.orcamentos.add(data);
      savedId = saved.id;
      Utils.toast('Orçamento criado');
    }

    App.updateEstoqueBadge();

    if (generatePdf) {
      this.gerarPDF(savedId);
    }

    App.navigate('orcamentos');
  },

  openForm(id = null) {
    // Redirect to full gerador page
    this.openGerador(id);
  },

  addItemRow() { this._addGenItemRow(); },
  updateTotal() { this._updateGenTotal(); },

  save(id) {
    this._saveGerador(id, false);
  },

  async remove(id) {
    const ok = await Utils.confirm('Deseja excluir este orçamento?');
    if (ok) {
      Store.orcamentos.remove(id);
      Utils.toast('Orçamento excluído');
      document.querySelector('.dc-modal-overlay')?.remove();
      App.refresh();
    }
  },

  // ── PDF Clean Generator ──
  gerarPDF(id) {
    const orc = Store.orcamentos.getById(id);
    if (!orc) return;

    const cliente = orc.clienteId ? Store.clientes.getById(orc.clienteId) : null;

    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Orçamento - ${orc.titulo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a1a; background: #fff; font-size: 10pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 210mm; min-height: 297mm; padding: 32mm 28mm 28mm; position: relative; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; margin-bottom: 28px; border-bottom: 2px solid #e85d04; }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .logo-mark { width: 40px; height: 40px; background: #e85d04; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: white; }
    .company-name { font-family: 'Space Grotesk', sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; }
    .company-subtitle { font-size: 8pt; color: #888; margin-top: 2px; }
    .doc-info { text-align: right; font-size: 8.5pt; color: #666; }
    .doc-info strong { color: #1a1a1a; display: block; font-family: 'Space Grotesk', sans-serif; font-size: 14pt; margin-bottom: 4px; }
    .section { margin-bottom: 24px; }
    .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 10px; }
    .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 32px; font-size: 9.5pt; }
    .client-info span { color: #666; }
    .client-info strong { color: #1a1a1a; font-weight: 500; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items-table thead th { font-family: 'Space Grotesk', sans-serif; font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #999; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
    .items-table thead th:last-child, .items-table thead th:nth-child(3), .items-table thead th:nth-child(2) { text-align: right; }
    .items-table tbody td { padding: 11px 12px; font-size: 9.5pt; color: #444; border-bottom: 1px solid #f5f5f5; }
    .items-table tbody tr:nth-child(even) td { background: #fafafa; }
    .items-table tbody td:first-child { color: #1a1a1a; font-weight: 450; }
    .items-table tbody td:nth-child(2), .items-table tbody td:nth-child(3), .items-table tbody td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    .total-area { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .total-box { text-align: right; min-width: 220px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 9.5pt; color: #666; }
    .total-row.final { border-top: 2px solid #e85d04; margin-top: 6px; padding-top: 10px; font-size: 13pt; font-weight: 700; color: #1a1a1a; font-family: 'Space Grotesk', sans-serif; }
    .conditions { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
    .conditions ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 32px; }
    .conditions li { font-size: 8.5pt; color: #888; padding-left: 14px; position: relative; }
    .conditions li::before { content: '·'; position: absolute; left: 0; font-weight: 700; color: #e85d04; font-size: 14pt; line-height: 1; top: -2px; }
    .footer { position: absolute; bottom: 20mm; left: 28mm; right: 28mm; text-align: center; font-size: 7.5pt; color: #bbb; padding-top: 16px; border-top: 1px solid #f0f0f0; }
    @media print { body { background: white; } .page { padding: 24mm 24mm 20mm; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo-area">
        <div class="logo-mark">DC</div>
        <div>
          <div class="company-name">Digital Corte</div>
          <div class="company-subtitle">Marcenaria & Móveis Planejados</div>
        </div>
      </div>
      <div class="doc-info">
        <strong>ORÇAMENTO</strong>
        Nº ${orc.id.toUpperCase().slice(0, 8)}<br>
        Emissão: ${Utils.date(orc.criadoEm)}<br>
        Validade: ${Utils.date(orc.validade) || '30 dias'}
      </div>
    </div>
    <div class="section">
      <div class="section-title">Dados do Cliente</div>
      <div class="client-info">
        <div><span>Nome:</span> <strong>${orc.clienteNome || '—'}</strong></div>
        ${cliente ? `<div><span>Telefone:</span> <strong>${cliente.telefone || '—'}</strong></div>
        <div><span>Email:</span> <strong>${cliente.email || '—'}</strong></div>
        <div><span>Endereço:</span> <strong>${cliente.endereco || '—'}</strong></div>` : ''}
      </div>
    </div>
    <div class="section">
      <div class="section-title">${orc.titulo || 'Itens do Orçamento'}</div>
      <table class="items-table">
        <thead><tr><th>Descrição</th><th>Qtd</th><th>Valor Unit.</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${(orc.itens || []).map(item => `<tr><td>${item.desc}</td><td>${item.qtd}</td><td>${Utils.currency(item.valor)}</td><td>${Utils.currency(item.qtd * item.valor)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="total-area">
      <div class="total-box">
        <div class="total-row"><span>Subtotal</span><span>${Utils.currency(orc.total)}</span></div>
        <div class="total-row final"><span>Total</span><span>${Utils.currency(orc.total)}</span></div>
      </div>
    </div>
    <div class="conditions">
      <div class="section-title">Condições</div>
      <ul>
        <li>Pagamento: 50% de entrada + 50% na entrega</li>
        <li>Prazo de produção: a combinar após aprovação</li>
        <li>Validade deste orçamento: ${Utils.date(orc.validade) || '30 dias'}</li>
        <li>Frete e instalação inclusos no valor</li>
        <li>Garantia de 12 meses contra defeitos</li>
        <li>Materiais de primeira qualidade</li>
      </ul>
    </div>
    <div class="footer">
      Digital Corte — Marcenaria & Móveis Planejados · CNPJ: 00.000.000/0001-00 · Tel: (11) 99999-0000
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHtml);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  },
};
