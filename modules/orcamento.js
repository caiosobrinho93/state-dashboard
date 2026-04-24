// ============================================
// STATE MARCENARIA — Orçamentos (Clean)
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
                  <th>Ações</th>
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
                    <td onclick="event.stopPropagation()">
                      <button class="btn btn-sm btn-ghost" onclick="OrcamentoModule.gerarPDF('${o.id}')" title="Gerar PDF">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                      </button>
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

    const itensHtml = o.itens && o.itens.length > 0 
      ? `<div class="detail-row-mini"><span>Itens</span><div style="margin-top:4px;font-size:11px">${o.itens.map(i => `<div>${Utils.escapeHtml(i.desc)} - ${i.qtd}x ${Utils.currency(i.valor)} = ${Utils.currency(i.subtotal)}</div>`).join('')}</div></div>`
      : '';
    const descontoHtml = o.desconto && o.desconto > 0
      ? `<div class="detail-row-mini"><span>Desconto</span><strong style="color:green">-${Utils.currency(o.desconto)}</strong></div>`
      : '';

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
        ${itensHtml}
        ${descontoHtml}
        ${o.anotacoes ? `
        <div class="detail-row-mini">
          <span>Anotações</span>
          <strong>${Utils.escapeHtml(o.anotacoes)}</strong>
        </div>
        ` : ''}
        ${o.imagens && o.imagens.length > 0 ? `
        <div class="detail-row-mini">
          <span>Imagens</span>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
            ${o.imagens.map(img => `<img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:4px">`).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    `;

    const footer = `
      <button class="btn btn-danger" onclick="OrcamentoModule.remove('${o.id}');document.querySelector('.modal-overlay').remove()">Excluir</button>
      <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();OrcamentoModule.gerarPDF('${o.id}')">PDF</button>
      <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();OrcamentoModule.openForm('${o.id}')">Editar</button>
    `;

    Utils.modal(Utils.escapeHtml(o.titulo), html, null, footer);
  },

  openForm(id = null) {
    OrcamentoModule.currentEditId = id;
    const orc = id ? Store.orcamentos.getById(id) : null;
    const clientes = Store.clientes.getAll();
    const existingImagens = orc?.imagens || [];
    const existingItens = orc?.itens || [];
    
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
          <label>Validade</label>
          <input type="date" class="form-input" id="orc-validade" value="${orc?.validade || ''}">
        </div>
        <div class="form-group">
          <label>Desconto (R$)</label>
          <input type="number" class="form-input" id="orc-desconto" value="${orc?.desconto || 0}" min="0" step="0.01" placeholder="0,00">
        </div>
      </div>
      <div class="form-group">
        <label>Itens do Orçamento</label>
        <div id="orc-itens-container">
          ${existingItens.map((item, i) => `
            <div class="item-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
              <input type="text" class="form-input" placeholder="Descrição do item" value="${Utils.escapeHtml(item.desc)}" data-item-desc="${i}" style="flex:2">
              <input type="number" class="form-input" placeholder="Qtd" value="${item.qtd}" data-item-qtd="${i}" min="1" step="1" style="width:60px">
              <input type="number" class="form-input" placeholder="Valor" value="${item.valor}" data-item-valor="${i}" min="0" step="0.01" style="width:100px">
              <span class="item-subtotal" data-item-subtotal="${i}" style="font-weight:600;min-width:80px;text-align:right">${Utils.currency(item.subtotal)}</span>
              <button type="button" onclick="OrcamentoModule.removeItem(${i})" style="background:none;border:none;cursor:pointer;color:red;font-size:18px">×</button>
            </div>
          `).join('')}
        </div>
        <button type="button" class="btn btn-sm btn-ghost" onclick="OrcamentoModule.addItem()">+ Adicionar Item</button>
      </div>
      <div class="form-group">
        <label>Anotações</label>
        <textarea class="form-input" id="orc-anotacoes" rows="3" placeholder="Observações do orçamento...">${Utils.escapeHtml(orc?.anotacoes || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Imagens</label>
        <input type="file" id="orc-imagens-input" multiple accept="image/*" style="margin-bottom:8px">
        <div id="orc-imagens-preview" class="imagens-preview"></div>
        <input type="hidden" id="orc-imagens-data" value="${JSON.stringify(existingImagens)}">
      </div>
      <style>
        .imagens-preview { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .preview-item { position: relative; width: 80px; height: 80px; }
        .preview-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
        .preview-remove { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; background: #e85d04; color: white; border: none; cursor: pointer; font-size: 14px; line-height: 1; }
      </style>
    `;

    Utils.modal(id ? 'Editar Orçamento' : 'Novo Orçamento', html, () => this.save(id));

    const input = document.getElementById('orc-imagens-input');
    const previewContainer = document.getElementById('orc-imagens-preview');
    
    existingImagens.forEach((img, i) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `<img src="${img}" alt="Imagem"><button type="button" class="preview-remove" onclick="OrcamentoModule.removeImage(${i})">×</button>`;
      previewContainer.appendChild(div);
    });
    
    input?.addEventListener('change', function() {
      const files = Array.from(this.files);
      const hiddenInput = document.getElementById('orc-imagens-data');
      let imagens = JSON.parse(hiddenInput.value || '[]');
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          imagens.push(e.target.result);
          hiddenInput.value = JSON.stringify(imagens);
          const div = document.createElement('div');
          div.className = 'preview-item';
          div.innerHTML = `<img src="${e.target.result}" alt="Imagem"><button type="button" class="preview-remove" onclick="OrcamentoModule.removeImage(${imagens.length - 1})">×</button>`;
          document.getElementById('orc-imagens-preview').appendChild(div);
        };
        reader.readAsDataURL(file);
      });
      this.value = '';
    });

    document.querySelectorAll('[data-item-qtd], [data-item-valor]').forEach(el => {
      el.addEventListener('input', OrcamentoModule.calcTotal);
    });
  },

  addItem() {
    const container = document.getElementById('orc-itens-container');
    const idx = container.children.length;
    const div = document.createElement('div');
    div.className = 'item-row';
    div.style = 'display:flex;gap:8px;margin-bottom:8px;align-items:center';
    div.innerHTML = `
      <input type="text" class="form-input" placeholder="Descrição do item" data-item-desc="${idx}" style="flex:2">
      <input type="number" class="form-input" placeholder="Qtd" value="1" data-item-qtd="${idx}" min="1" step="1" style="width:60px">
      <input type="number" class="form-input" placeholder="Valor" value="0" data-item-valor="${idx}" min="0" step="0.01" style="width:100px">
      <span class="item-subtotal" data-item-subtotal="${idx}" style="font-weight:600;min-width:80px;text-align:right">R$ 0,00</span>
      <button type="button" onclick="OrcamentoModule.removeItem(${idx})" style="background:none;border:none;cursor:pointer;color:red;font-size:18px">×</button>
    `;
    container.appendChild(div);
    
    div.querySelectorAll('[data-item-qtd], [data-item-valor]').forEach(el => {
      el.addEventListener('input', OrcamentoModule.calcTotal);
    });
  },

  removeItem(idx) {
    const container = document.getElementById('orc-itens-container');
    if (container && container.children[idx]) {
      container.children[idx].remove();
      OrcamentoModule.reindexItens();
      OrcamentoModule.calcTotal();
    }
  },

  reindexItens() {
    const container = document.getElementById('orc-itens-container');
    Array.from(container.children).forEach((row, i) => {
      row.querySelectorAll('[data-item-desc], [data-item-qtd], [data-item-valor], [data-item-subtotal]').forEach(el => {
        el.setAttribute(el.getAttribute('data-item-desc') ? 'data-item-desc' : 
                      el.getAttribute('data-item-qtd') ? 'data-item-qtd' :
                      el.getAttribute('data-item-valor') ? 'data-item-valor' : 'data-item-subtotal', i);
      });
    });
  },

  calcTotal() {
    const container = document.getElementById('orc-itens-container');
    let total = 0;
    Array.from(container.children).forEach((row, i) => {
      const qtd = parseFloat(row.querySelector(`[data-item-qtd="${i}"]`)?.value) || 0;
      const valor = parseFloat(row.querySelector(`[data-item-valor="${i}"]`)?.value) || 0;
      const subtotal = qtd * valor;
      total += subtotal;
      const subtotalEl = row.querySelector(`[data-item-subtotal="${i}"]`);
      if (subtotalEl) subtotalEl.textContent = Utils.currency(subtotal);
    });
    return total;
  },

  removeImage(idx) {
    const hiddenInput = document.getElementById('orc-imagens-data');
    let imagens = JSON.parse(hiddenInput.value || '[]');
    imagens.splice(idx, 1);
    hiddenInput.value = JSON.stringify(imagens);
    const previewContainer = document.getElementById('orc-imagens-preview');
    previewContainer.innerHTML = '';
    imagens.forEach((img, i) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `<img src="${img}" alt="Imagem"><button type="button" class="preview-remove" onclick="OrcamentoModule.removeImage(${i})">×</button>`;
      previewContainer.appendChild(div);
    });
  },

  save(id) {
    const titulo = document.getElementById('orc-titulo')?.value?.trim();
    if (!titulo) { Utils.toast('Informe o título', 'error'); return; }

    const clienteId = document.getElementById('orc-cliente')?.value;
    const cliente = clienteId ? Store.clientes.getById(clienteId) : null;
    const hiddenInput = document.getElementById('orc-imagens-data');
    const imagens = hiddenInput ? JSON.parse(hiddenInput.value || '[]') : [];
    const container = document.getElementById('orc-itens-container');
    
    if (!container) {
      const data = {
        titulo,
        clienteId,
        clienteNome: cliente?.nome || '',
        total: 0,
        subtotalGeral: 0,
        desconto: 0,
        status: document.getElementById('orc-status')?.value || 'orcamento',
        validade: document.getElementById('orc-validade')?.value,
        anotacoes: '',
        imagens: imagens,
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
      return;
    }

    const itens = [];
    Array.from(container.children).forEach((row, i) => {
      const descInput = row.querySelector(`[data-item-desc="${i}"]`);
      const qtdInput = row.querySelector(`[data-item-qtd="${i}"]`);
      const valorInput = row.querySelector(`[data-item-valor="${i}"]`);
      
      if (descInput && qtdInput && valorInput) {
        const desc = descInput.value?.trim();
        const qtd = parseInt(qtdInput.value) || 1;
        const valor = parseFloat(valorInput.value) || 0;
        const subtotal = qtd * valor;
        if (desc || valor > 0) {
          itens.push({ desc, qtd, valor, subtotal });
        }
      }
    });

    let subtotalGeral = 0;
    itens.forEach(item => subtotalGeral += item.subtotal);
    const desconto = parseFloat(document.getElementById('orc-desconto')?.value) || 0;
    const total = Math.max(0, subtotalGeral - desconto);
    
    const data = {
      titulo,
      clienteId,
      clienteNome: cliente?.nome || '',
      total,
      subtotalGeral,
      desconto,
      status: document.getElementById('orc-status')?.value || 'orcamento',
      validade: document.getElementById('orc-validade')?.value,
      anotacoes: document.getElementById('orc-anotacoes')?.value || '',
      imagens: imagens,
      itens: itens
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
    
    const logoSrc = 'logo-state.png';
    const imagensHtml = orc.imagens && orc.imagens.length > 0 
      ? `<div class="imagens-section">
          <h4 style="font-size:9px;text-transform:uppercase;color:#fff;margin-bottom:8px;letter-spacing:1px">Imagens de Referência</h4>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${orc.imagens.map(img => `<img src="${img}" style="width:100px;height:100px;object-fit:cover;border-radius:4px;border:1px solid #333">`).join('')}
          </div>
        </div>` 
      : '';
    
    const anotacoesHtml = orc.anotacoes 
      ? `<div style="margin-top:15px;padding:15px;background:#1a1a1a;border-radius:8px;border-left:3px solid #fff">
          <h4 style="font-size:9px;text-transform:uppercase;color:#999;margin-bottom:8px;letter-spacing:1px">Observações</h4>
          <p style="font-size:10px;line-height:1.5;color:#ccc;white-space:pre-wrap">${orc.anotacoes}</p>
        </div>` 
      : '';
    
    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Orçamento - ${orc.titulo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 210mm; height: 297mm; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #fff; background: #000; font-size: 10pt; }
    .page { width: 210mm; height: 297mm; padding: 15mm 20mm; background: #000; overflow: hidden; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    @page { size: A4; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; background: #000; padding: 12px 15px; margin: -15mm -20mm 15mm -20mm; border-bottom: 1px solid #333; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-mark { width: 45px; height: 45px; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .logo-mark img { width: 100%; height: 100%; object-fit: contain; }
    .logo-text { font-size: 18px; font-weight: 700; color: #fff; }
    .logo-sub { font-size: 9px; color: #999; margin-top: 2px; }
    .doc-title { text-align: right; }
    .doc-title strong { font-size: 22px; font-weight: 700; color: #fff; }
    .doc-title .status { display: inline-block; background: #222; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 8px; font-weight: 600; margin-top: 4px; text-transform: uppercase; }
    .doc-title .date { font-size: 9px; color: #888; display: block; margin-top: 6px; }
    .info-row { display: flex; gap: 15px; margin-bottom: 15px; }
    .info-card { flex: 1; padding: 12px 15px; background: #111; border-radius: 6px; }
    .info-card h4 { font-size: 8px; text-transform: uppercase; color: #666; margin-bottom: 6px; letter-spacing: 1px; }
    .info-card .value { font-size: 12px; font-weight: 600; color: #fff; }
    .info-card .sub { font-size: 9px; color: #888; margin-top: 2px; }
    .items-title { font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #111; font-size: 8px; text-transform: uppercase; color: #888; padding: 10px 12px; text-align: left; letter-spacing: 0.5px; font-weight: 600; border-bottom: 1px solid #333; }
    td { padding: 10px 12px; font-size: 10px; color: #ddd; border-bottom: 1px solid #222; }
    td:last-child, th:last-child { text-align: right; }
    .item-name { font-weight: 500; color: #fff; }
    .item-qtd { color: #888; }
    .item-price { font-weight: 500; }
    .item-total { font-weight: 600; color: #fff; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 15px; }
    .totals-card { min-width: 180px; padding: 12px 15px; background: #111; border-radius: 6px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 10px; color: #888; }
    .totals-row.subtotal { color: #888; }
    .totals-row.desconto { color: #4ade80; }
    .totals-row.total { border-top: 1px solid #333; margin-top: 6px; padding-top: 8px; font-size: 14px; font-weight: 700; color: #fff; }
    .footer { margin-top: 15px; padding-top: 12px; border-top: 1px solid #333; text-align: center; }
    .footer .contact { display: flex; justify-content: center; gap: 20px; font-size: 9px; color: #666; }
    .footer .brand { font-size: 10px; color: #555; margin-top: 8px; }
    .imagens-section { margin-top: 15px; }
    .imagens-section h4 { font-size: 9px; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 1px; }
    .imagens-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .imagens-grid img { border-radius: 4px; border: 1px solid #333; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-mark"><img src="${logoSrc}" alt="Logo"></div>
        <div>
          <div class="logo-text">STATE MARCENARIA</div>
          <div class="logo-sub">Móveis Planejados</div>
        </div>
      </div>
      <div class="doc-title">
        <strong>ORÇAMENTO</strong>
        <span class="status">${orc.status === 'aprovado' ? 'Aprovado' : orc.status === 'pendente' ? 'Pendente' : orc.status === 'rejeitado' ? 'Rejeitado' : 'Orçamento'}</span>
        <span class="date">${Utils.date(orc.criadoEm)} • Válido: ${Utils.date(orc.validade) || '30 dias'}</span>
      </div>
    </div>
    <div class="info-row">
      <div class="info-card" style="flex:2">
        <h4>Cliente</h4>
        <div class="value">${orc.clienteNome || '—'}</div>
        <div class="sub">${orc.titulo}</div>
      </div>
      <div class="info-card">
        <h4>Data</h4>
        <div class="value">${Utils.date(orc.criadoEm)}</div>
        <div class="sub">#${orc.id?.slice(-6) || ''}</div>
      </div>
      <div class="info-card">
        <h4>Validade</h4>
        <div class="value">${Utils.date(orc.validade) || '30 dias'}</div>
      </div>
    </div>
    <div class="items-title">Itens do Orçamento</div>
    <table>
      <thead><tr><th>Descrição</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead>
      <tbody>
        ${(orc.itens && orc.itens.length > 0) ? orc.itens.map(item => `<tr><td class="item-name">${item.desc}</td><td class="item-qtd">${item.qtd}</td><td class="item-price">${Utils.currency(item.valor)}</td><td class="item-total">${Utils.currency(item.subtotal)}</td></tr>`).join('') : `<tr><td class="item-name">${orc.titulo}</td><td class="item-qtd">1</td><td class="item-price">${Utils.currency(orc.total)}</td><td class="item-total">${Utils.currency(orc.total)}</td></tr>`}
      </tbody>
    </table>
    <div class="totals">
      <div class="totals-card">
        <div class="totals-row subtotal">
          <span>Subtotal</span>
          <span>${Utils.currency(orc.subtotalGeral || orc.total)}</span>
        </div>
        ${orc.desconto && orc.desconto > 0 ? `<div class="totals-row desconto">
          <span>Desconto</span>
          <span>-${Utils.currency(orc.desconto)}</span>
        </div>` : ''}
        <div class="totals-row total">
          <span>Total</span>
          <span>${Utils.currency(orc.total)}</span>
        </div>
      </div>
    </div>
    ${anotacoesHtml}
    ${imagensHtml}
    <div class="footer">
      <div class="contact">
        <span>(11) 99999-0000</span>
        <span>statemarcenaria@email.com</span>
        <span>São Paulo, SP</span>
      </div>
      <div class="brand">STATE MARCENARIA — Móveis Planejados</div>
    </div>
  </div>
</body>
</html>`;
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 210mm; height: 297mm; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; color: #fff; background: #000; font-size: 10pt; }
    .page { width: 210mm; height: 297mm; padding: 15mm 20mm; background: #000; }
    .header { display: flex; justify-content: space-between; align-items: center; background: #000; padding: 12px 15px; margin: -15mm -20mm 15mm -20mm; border-bottom: 1px solid #333; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-mark { width: 45px; height: 45px; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .logo-mark img { width: 100%; height: 100%; object-fit: contain; }
    .logo-text { font-size: 18px; font-weight: 700; color: #fff; }
    .logo-sub { font-size: 9px; color: #999; margin-top: 2px; }
    .doc-title { text-align: right; }
    .doc-title strong { font-size: 22px; font-weight: 700; color: #fff; }
    .doc-title .status { display: inline-block; background: #222; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 8px; font-weight: 600; margin-top: 4px; text-transform: uppercase; }
    .doc-title .date { font-size: 9px; color: #888; display: block; margin-top: 6px; }
    .info-row { display: flex; gap: 15px; margin-bottom: 15px; }
    .info-card { flex: 1; padding: 12px 15px; background: #111; border-radius: 6px; }
    .info-card h4 { font-size: 8px; text-transform: uppercase; color: #666; margin-bottom: 6px; letter-spacing: 1px; }
    .info-card .value { font-size: 12px; font-weight: 600; color: #fff; }
    .info-card .sub { font-size: 9px; color: #888; margin-top: 2px; }
    .items-title { font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #111; font-size: 8px; text-transform: uppercase; color: #888; padding: 10px 12px; text-align: left; letter-spacing: 0.5px; font-weight: 600; border-bottom: 1px solid #333; }
    td { padding: 10px 12px; font-size: 10px; color: #ddd; border-bottom: 1px solid #222; }
    td:last-child, th:last-child { text-align: right; }
    .item-name { font-weight: 500; color: #fff; }
    .item-qtd { color: #888; }
    .item-price { font-weight: 500; }
    .item-total { font-weight: 600; color: #fff; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 15px; }
    .totals-card { min-width: 180px; padding: 12px 15px; background: #111; border-radius: 6px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 10px; color: #888; }
    .totals-row.subtotal { color: #888; }
    .totals-row.desconto { color: #4ade80; }
    .totals-row.total { border-top: 1px solid #333; margin-top: 6px; padding-top: 8px; font-size: 14px; font-weight: 700; color: #fff; }
    .footer { margin-top: 15px; padding-top: 12px; border-top: 1px solid #333; text-align: center; }
    .footer .contact { display: flex; justify-content: center; gap: 20px; font-size: 9px; color: #666; }
    .footer .brand { font-size: 10px; color: #555; margin-top: 8px; }
    .imagens-section { margin-top: 15px; }
    .imagens-section h4 { font-size: 9px; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 1px; }
    .imagens-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .imagens-grid img { border-radius: 4px; border: 1px solid #333; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-mark"><img src="${logoSrc}" alt="Logo"></div>
        <div>
          <div class="logo-text">STATE MARCENARIA</div>
          <div class="logo-sub">Móveis Planejados</div>
        </div>
      </div>
      <div class="doc-title">
        <strong>ORÇAMENTO</strong>
        <span class="status">${orc.status === 'aprovado' ? 'Aprovado' : orc.status === 'pendente' ? 'Pendente' : orc.status === 'rejeitado' ? 'Rejeitado' : 'Orçamento'}</span>
        <span class="date">${Utils.date(orc.criadoEm)} • Válido: ${Utils.date(orc.validade) || '30 dias'}</span>
      </div>
    </div>
    <div class="info-row">
      <div class="info-card" style="flex:2">
        <h4>Cliente</h4>
        <div class="value">${orc.clienteNome || '—'}</div>
        <div class="sub">${orc.titulo}</div>
      </div>
      <div class="info-card">
        <h4>Data</h4>
        <div class="value">${Utils.date(orc.criadoEm)}</div>
        <div class="sub">#${orc.id?.slice(-6) || ''}</div>
      </div>
      <div class="info-card">
        <h4>Validade</h4>
        <div class="value">${Utils.date(orc.validade) || '30 dias'}</div>
      </div>
    </div>
    <div class="items-title">Itens do Orçamento</div>
    <table>
      <thead><tr><th>Descrição</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead>
      <tbody>
        ${(orc.itens && orc.itens.length > 0) ? orc.itens.map(item => `<tr><td class="item-name">${item.desc}</td><td class="item-qtd">${item.qtd}</td><td class="item-price">${Utils.currency(item.valor)}</td><td class="item-total">${Utils.currency(item.subtotal)}</td></tr>`).join('') : `<tr><td class="item-name">${orc.titulo}</td><td class="item-qtd">1</td><td class="item-price">${Utils.currency(orc.total)}</td><td class="item-total">${Utils.currency(orc.total)}</td></tr>`}
      </tbody>
    </table>
    <div class="totals">
      <div class="totals-card">
        <div class="totals-row subtotal">
          <span>Subtotal</span>
          <span>${Utils.currency(orc.subtotalGeral || orc.total)}</span>
        </div>
        ${orc.desconto && orc.desconto > 0 ? `<div class="totals-row desconto">
          <span>Desconto</span>
          <span>-${Utils.currency(orc.desconto)}</span>
        </div>` : ''}
        <div class="totals-row total">
          <span>Total</span>
          <span>${Utils.currency(orc.total)}</span>
        </div>
      </div>
    </div>
    ${anotacoesHtml}
    ${imagensHtml}
    <div class="footer">
      <div class="contact">
        <span>(11) 99999-0000</span>
        <span>statemarcenaria@email.com</span>
        <span>São Paulo, SP</span>
      </div>
      <div class="brand">STATE MARCENARIA — Móveis Planejados</div>
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHtml);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
};