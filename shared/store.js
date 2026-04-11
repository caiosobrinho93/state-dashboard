// ============================================
// DIGITAL CORTE — Data Store (localStorage)
// ============================================

const Store = {
  _get(key) {
    try {
      const data = localStorage.getItem(`dc_${key}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Store._get error:', e);
      return [];
    }
  },

  _set(key, data) {
    try {
      localStorage.setItem(`dc_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Store._set error (quota exceeded?):', e);
      Utils.toast('Erro ao salvar: armazenamento cheio', 'error');
    }
  },

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // Generic CRUD
  getAll(entity) {
    return this._get(entity);
  },

  getById(entity, id) {
    return this._get(entity).find(item => item.id === id) || null;
  },

  add(entity, item) {
    const items = this._get(entity);
    const newItem = { ...item, id: this._generateId(), criadoEm: new Date().toISOString() };
    items.push(newItem);
    this._set(entity, items);
    return newItem;
  },

  update(entity, id, updates) {
    const items = this._get(entity);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, atualizadoEm: new Date().toISOString() };
    this._set(entity, items);
    return items[index];
  },

  remove(entity, id) {
    const items = this._get(entity);
    const filtered = items.filter(item => item.id !== id);
    this._set(entity, filtered);
    return filtered.length < items.length;
  },

  // Convenience accessors
  clientes: {
    getAll: () => Store.getAll('clientes'),
    getById: (id) => Store.getById('clientes', id),
    add: (c) => Store.add('clientes', c),
    update: (id, c) => Store.update('clientes', id, c),
    remove: (id) => Store.remove('clientes', id),
  },

  estoque: {
    getAll: () => Store.getAll('estoque'),
    getById: (id) => Store.getById('estoque', id),
    add: (e) => Store.add('estoque', e),
    update: (id, e) => Store.update('estoque', id, e),
    remove: (id) => Store.remove('estoque', id),
  },

  projetos: {
    getAll: () => Store.getAll('projetos'),
    getById: (id) => Store.getById('projetos', id),
    add: (p) => Store.add('projetos', p),
    update: (id, p) => Store.update('projetos', id, p),
    remove: (id) => Store.remove('projetos', id),
  },

  orcamentos: {
    getAll: () => Store.getAll('orcamentos'),
    getById: (id) => Store.getById('orcamentos', id),
    add: (o) => Store.add('orcamentos', o),
    update: (id, o) => Store.update('orcamentos', id, o),
    remove: (id) => Store.remove('orcamentos', id),
  },

  financeiro: {
    getAll: () => Store.getAll('financeiro'),
    getById: (id) => Store.getById('financeiro', id),
    add: (f) => Store.add('financeiro', f),
    update: (id, f) => Store.update('financeiro', id, f),
    remove: (id) => Store.remove('financeiro', id),
  },

  negociacoes: {
    getAll: () => Store.getAll('negociacoes'),
    getById: (id) => Store.getById('negociacoes', id),
    add: (n) => Store.add('negociacoes', n),
    update: (id, n) => Store.update('negociacoes', id, n),
    remove: (id) => Store.remove('negociacoes', id),
  },

  // Stats helpers
  getStats() {
    const clientes = this.clientes.getAll();
    const projetos = this.projetos.getAll();
    const orcamentos = this.orcamentos.getAll();
    const financeiro = this.financeiro.getAll();
    const estoque = this.estoque.getAll();
    const negociacoes = this.negociacoes.getAll();

    const receitas = financeiro.filter(f => f.tipo === 'receita').reduce((s, f) => s + (f.valor || 0), 0);
    const despesas = financeiro.filter(f => f.tipo === 'despesa').reduce((s, f) => s + (f.valor || 0), 0);

    return {
      totalClientes: clientes.length,
      totalProjetos: projetos.length,
      projetosAtivos: projetos.filter(p => p.status === 'em_andamento').length,
      totalOrcamentos: orcamentos.length,
      orcamentosAprovados: orcamentos.filter(o => o.status === 'aprovado').length,
      totalEstoque: estoque.length,
      estoqueAlerta: estoque.filter(e => e.quantidade <= (e.minimo || 5)).length,
      receitas,
      despesas,
      lucro: receitas - despesas,
      totalNegociacoes: negociacoes.length,
      negociacoesAbertas: negociacoes.filter(n => n.status !== 'fechado' && n.status !== 'perdido').length,
      ticketMedio: orcamentos.length > 0
        ? orcamentos.reduce((s, o) => s + (o.total || 0), 0) / orcamentos.length
        : 0,
      taxaConversao: orcamentos.length > 0
        ? (orcamentos.filter(o => o.status === 'aprovado').length / orcamentos.length * 100)
        : 0,
    };
  },

  // Seed demo data
  seedDemoData() {
    if (this.clientes.getAll().length > 0) return;

    // Clientes
    const c1 = this.clientes.add({ nome: 'Maria Silva', email: 'maria@email.com', telefone: '(11) 99999-1111', endereco: 'Rua das Flores, 123 - SP' });
    const c2 = this.clientes.add({ nome: 'João Santos', email: 'joao@email.com', telefone: '(11) 98888-2222', endereco: 'Av. Brasil, 456 - SP' });
    const c3 = this.clientes.add({ nome: 'Ana Costa', email: 'ana@email.com', telefone: '(11) 97777-3333', endereco: 'Rua Augusta, 789 - SP' });

    // Estoque
    this.estoque.add({ nome: 'MDF Branco 15mm', categoria: 'Chapas', unidade: 'chapa', quantidade: 45, minimo: 10, preco: 189.90 });
    this.estoque.add({ nome: 'MDF Cru 18mm', categoria: 'Chapas', unidade: 'chapa', quantidade: 30, minimo: 10, preco: 165.00 });
    this.estoque.add({ nome: 'Dobradiça 35mm', categoria: 'Ferragens', unidade: 'un', quantidade: 200, minimo: 50, preco: 4.50 });
    this.estoque.add({ nome: 'Corrediça Telescópica 45cm', categoria: 'Ferragens', unidade: 'par', quantidade: 8, minimo: 20, preco: 32.00 });
    this.estoque.add({ nome: 'Puxador Inox 160mm', categoria: 'Acabamento', unidade: 'un', quantidade: 60, minimo: 15, preco: 18.90 });
    this.estoque.add({ nome: 'Fita de Borda Branca', categoria: 'Acabamento', unidade: 'rolo', quantidade: 3, minimo: 5, preco: 45.00 });

    // Projetos
    this.projetos.add({ nome: 'Cozinha Planejada', clienteId: c1.id, clienteNome: c1.nome, status: 'em_andamento', valor: 18500, inicio: '2025-03-15', previsao: '2025-04-30', descricao: 'Cozinha completa em L com ilha' });
    this.projetos.add({ nome: 'Closet Master', clienteId: c2.id, clienteNome: c2.nome, status: 'em_andamento', valor: 12000, inicio: '2025-03-20', previsao: '2025-04-20', descricao: 'Closet em U com portas de correr' });
    this.projetos.add({ nome: 'Painel Home Theater', clienteId: c3.id, clienteNome: c3.nome, status: 'orcamento', valor: 4800, inicio: '', previsao: '', descricao: 'Painel ripado com iluminação LED' });

    // Orçamentos
    this.orcamentos.add({ clienteId: c1.id, clienteNome: c1.nome, titulo: 'Cozinha Planejada Completa', itens: [{ desc: 'Gabinete inferior 3 portas', qtd: 1, valor: 4500 }, { desc: 'Aéreo 4 portas', qtd: 1, valor: 3200 }, { desc: 'Ilha central com cooktop', qtd: 1, valor: 6800 }, { desc: 'Instalação', qtd: 1, valor: 4000 }], total: 18500, status: 'aprovado', validade: '2025-04-15' });
    this.orcamentos.add({ clienteId: c2.id, clienteNome: c2.nome, titulo: 'Closet Quarto Master', itens: [{ desc: 'Módulo cabide duplo', qtd: 2, valor: 2800 }, { desc: 'Módulo gavetas', qtd: 1, valor: 2200 }, { desc: 'Módulo prateleiras', qtd: 2, valor: 1800 }, { desc: 'Portas de correr espelhadas', qtd: 1, valor: 3400 }], total: 12000, status: 'aprovado', validade: '2025-04-10' });
    this.orcamentos.add({ clienteId: c3.id, clienteNome: c3.nome, titulo: 'Painel Home Theater', itens: [{ desc: 'Painel ripado MDF', qtd: 1, valor: 2800 }, { desc: 'Fita LED embutida', qtd: 1, valor: 800 }, { desc: 'Instalação', qtd: 1, valor: 1200 }], total: 4800, status: 'pendente', validade: '2025-04-20' });

    // Financeiro
    this.financeiro.add({ tipo: 'receita', descricao: 'Sinal - Cozinha Planejada (Maria)', valor: 9250, data: '2025-03-15', categoria: 'Projetos' });
    this.financeiro.add({ tipo: 'receita', descricao: 'Sinal - Closet Master (João)', valor: 6000, data: '2025-03-20', categoria: 'Projetos' });
    this.financeiro.add({ tipo: 'despesa', descricao: 'Compra MDF Branco (20 chapas)', valor: 3798, data: '2025-03-10', categoria: 'Material' });
    this.financeiro.add({ tipo: 'despesa', descricao: 'Ferragens variadas', valor: 1280, data: '2025-03-12', categoria: 'Material' });
    this.financeiro.add({ tipo: 'despesa', descricao: 'Aluguel oficina', valor: 3500, data: '2025-03-01', categoria: 'Fixo' });
    this.financeiro.add({ tipo: 'receita', descricao: 'Parcela 2 - Cozinha (Maria)', valor: 4625, data: '2025-04-01', categoria: 'Projetos' });
    this.financeiro.add({ tipo: 'despesa', descricao: 'Energia elétrica', valor: 680, data: '2025-04-05', categoria: 'Fixo' });

    // Negociações
    this.negociacoes.add({ clienteNome: c3.nome, clienteId: c3.id, titulo: 'Painel Home Theater', valor: 4800, status: 'proposta', probabilidade: 70, notas: 'Cliente pediu desconto de 10%' });
    this.negociacoes.add({ clienteNome: 'Carlos Mendes', clienteId: null, titulo: 'Escritório completo', valor: 22000, status: 'contato', probabilidade: 30, notas: 'Primeiro contato via Instagram' });
    this.negociacoes.add({ clienteNome: 'Fernanda Lima', clienteId: null, titulo: 'Banheiro planejado', valor: 8500, status: 'negociacao', probabilidade: 60, notas: 'Enviou medidas, aguardando orçamento' });
  }
};
