// ============================================
// DIGITAL CORTE — Estoque (Clean)
// ============================================

const EstoqueModule = {
  render(container) {
    const estoque = Store.estoque.getAll();
    const alertas = estoque.filter(e => e.quantidade <= (e.minimo || 5)).length;

    container.innerHTML = `
      <div class="stats-bar">
        <div class="stat-mini">
          <div class="stat-mini-icon blue"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8l-7-4-7 4v8l7 4 7-4z"/></svg></div>
          <div><div class="stat-mini-value">${estoque.length}</div><div class="stat-mini-label">Itens</div></div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-icon red"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg></div>
          <div><div class="stat-mini-value">${alertas}</div><div class="stat-mini-label">Alertas</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Estoque (${estoque.length})</div>
          <button class="btn btn-primary btn-sm" onclick="EstoqueModule.openForm()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo
          </button>
        </div>
        <div class="section-body">
          ${estoque.length ? `
            <table class="table-minimal table-clickable">
              <thead><tr><th>Material</th><th>Categoria</th><th>Qtd</th><th>Status</th></tr></thead>
              <tbody>
                ${estoque.map(e => {
                  const isLow = e.quantidade <= (e.minimo || 5);
                  return `
                    <tr onclick="EstoqueModule.openDetail('${e.id}')">
                      <td><strong>${Utils.escapeHtml(e.nome)}</strong></td>
                      <td>${e.categoria || '—'}</td>
                      <td>${e.quantidade} ${e.unidade || ''}</td>
                      <td>
                        <span class="status-pill ${isLow ? 'red' : 'green'}">
                          ${isLow ? 'Baixo' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-mini">Nenhum item. Clique em Novo para adicionar.</div>'}
        </div>
      </div>
    `;
  },

  openDetail(id) {
    const e = Store.estoque.getById(id);
    if (!e) return;

    const isLow = e.quantidade <= (e.minimo || 5);

    const html = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="detail-row-mini">
          <span>Material</span>
          <strong>${Utils.escapeHtml(e.nome)}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Categoria</span>
          <strong>${e.categoria || '—'}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Quantidade</span>
          <strong style="color:${isLow ? 'var(--danger)' : 'inherit'}">${e.quantidade} ${e.unidade || ''}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Mínimo</span>
          <strong>${e.minimo || 5} ${e.unidade || ''}</strong>
        </div>
        <div class="detail-row-mini">
          <span>Status</span>
          <span class="status-pill ${isLow ? 'red' : 'green'}">${isLow ? 'Estoque Baixo' : 'Normal'}</span>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-danger" onclick="EstoqueModule.remove('${e.id}');document.querySelector('.modal-overlay').remove()">Excluir</button>
      <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Fechar</button>
      <button class="btn btn-primary" onclick="document.querySelector('.modal-overlay').remove();EstoqueModule.openForm('${e.id}')">Editar</button>
    `;

    Utils.modal(Utils.escapeHtml(e.nome), html, null, footer);
  },

  openForm(id = null) {
    const e = id ? Store.estoque.getById(id) : null;

    const html = `
      <div class="form-group">
        <label>Material</label>
        <input class="form-input" id="est-nome" value="${Utils.escapeHtml(e?.nome || '')}" placeholder="Ex: MDF Branco 15mm">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Categoria</label>
          <select class="form-select" id="est-cat">
            <option value="Chapas" ${e?.categoria === 'Chapas' ? 'selected' : ''}>Chapas</option>
            <option value="Ferragens" ${e?.categoria === 'Ferragens' ? 'selected' : ''}>Ferragens</option>
            <option value="Acabamento" ${e?.categoria === 'Acabamento' ? 'selected' : ''}>Acabamento</option>
            <option value="Outros" ${e?.categoria === 'Outros' ? 'selected' : ''}>Outros</option>
          </select>
        </div>
        <div class="form-group">
          <label>Unidade</label>
          <select class="form-select" id="est-unid">
            <option value="un" ${e?.unidade === 'un' ? 'selected' : ''}>Unidade</option>
            <option value="chapa" ${e?.unidade === 'chapa' ? 'selected' : ''}>Chapa</option>
            <option value="m" ${e?.unidade === 'm' ? 'selected' : ''}>Metro</option>
            <option value="kg" ${e?.unidade === 'kg' ? 'selected' : ''}>Kg</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Quantidade</label>
          <input type="number" class="form-input" id="est-qtd" value="${e?.quantidade || 0}" min="0">
        </div>
        <div class="form-group">
          <label>Mínimo</label>
          <input type="number" class="form-input" id="est-min" value="${e?.minimo || 5}" min="0">
        </div>
      </div>
    `;

    Utils.modal(id ? 'Editar Material' : 'Novo Material', html, () => this.save(id));
  },

  save(id) {
    const nome = document.getElementById('est-nome')?.value?.trim();
    if (!nome) { Utils.toast('Informe o material', 'error'); return; }

    const data = {
      nome,
      categoria: document.getElementById('est-cat')?.value,
      unidade: document.getElementById('est-unid')?.value,
      quantidade: parseInt(document.getElementById('est-qtd')?.value) || 0,
      minimo: parseInt(document.getElementById('est-min')?.value) || 5,
      preco: 0,
    };

    if (id) {
      Store.estoque.update(id, data);
      Utils.toast('Atualizado');
    } else {
      Store.estoque.add(data);
      Utils.toast('Adicionado');
    }

    App.refresh();
  },

  remove(id) {
    Store.estoque.remove(id);
    Utils.toast('Excluído');
    App.refresh();
  }
};