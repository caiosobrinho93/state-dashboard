// ============================================
// DIGITAL CORTE — Shared Utilities
// ============================================

const Utils = {
  // Format currency BRL
  currency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  },

  // Format date
  date(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  },

  dateInput(dateStr) {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  },

  // Relative time
  timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
    return Utils.date(dateStr);
  },

  // Status labels
  statusLabel(status) {
    const map = {
      'pendente': 'Pendente',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'orcamento': 'Orçamento',
      'contato': 'Contato Inicial',
      'proposta': 'Proposta Enviada',
      'negociacao': 'Em Negociação',
      'fechado': 'Fechado',
      'perdido': 'Perdido',
    };
    return map[status] || status;
  },

  // Status color class
  statusColor(status) {
    const map = {
      'pendente': 'status-warning',
      'aprovado': 'status-success',
      'rejeitado': 'status-danger',
      'em_andamento': 'status-info',
      'concluido': 'status-success',
      'cancelado': 'status-danger',
      'orcamento': 'status-muted',
      'contato': 'status-muted',
      'proposta': 'status-warning',
      'negociacao': 'status-info',
      'fechado': 'status-success',
      'perdido': 'status-danger',
    };
    return map[status] || 'status-muted';
  },

  // Debounce
  debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  // Simple toast notification
  toast(message, type = 'success') {
    const existing = document.querySelector('.dc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `dc-toast dc-toast-${type}`;
    toast.innerHTML = `
      <span class="dc-toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('dc-toast-show'));
    setTimeout(() => {
      toast.classList.remove('dc-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Modal
  modal(title, content, onConfirm) {
    const existing = document.querySelector('.dc-modal-overlay');
    if (existing) existing.remove();

    const footerHtml = onConfirm
      ? `<div class="dc-modal-footer">
          <button class="btn btn-ghost" onclick="this.closest('.dc-modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" id="dc-modal-confirm">Confirmar</button>
        </div>`
      : `<div class="dc-modal-footer">
          <button class="btn btn-ghost" onclick="this.closest('.dc-modal-overlay').remove()">Fechar</button>
        </div>`;

    const overlay = document.createElement('div');
    overlay.className = 'dc-modal-overlay';
    overlay.innerHTML = `
      <div class="dc-modal">
        <div class="dc-modal-header">
          <h3>${title}</h3>
          <button class="dc-modal-close" onclick="this.closest('.dc-modal-overlay').remove()">✕</button>
        </div>
        <div class="dc-modal-body">${content}</div>
        ${footerHtml}
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('dc-modal-show'));

    if (onConfirm) {
      overlay.querySelector('#dc-modal-confirm').addEventListener('click', () => {
        onConfirm(overlay);
        overlay.classList.remove('dc-modal-show');
        setTimeout(() => overlay.remove(), 200);
      });
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('dc-modal-show');
        setTimeout(() => overlay.remove(), 200);
      }
    });

    return overlay;
  },

  // Confirm dialog
  confirm(message) {
    return new Promise(resolve => {
      Utils.modal('Confirmar', `<p>${message}</p>`, () => resolve(true));
      document.querySelector('.dc-modal .btn-ghost').addEventListener('click', () => resolve(false));
    });
  },

  // SVG Icons (inline, no dependencies)
  icons: {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="10" width="7" height="11" rx="1"/><rect x="3" y="13" width="7" height="8" rx="1"/></svg>',
    orcamento: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>',
    estoque: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></svg>',
    clientes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    projetos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    financeiro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    negociacoes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M7 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/><path d="m16 3 2 2-2 2"/><path d="m8 3-2 2 2 2"/></svg>',
    metricas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M9 15v-2h2a1 1 0 1 1 0 2H9z"/></svg>',
  },

  icon(name, size = 20) {
    return `<span class="dc-icon" style="width:${size}px;height:${size}px">${this.icons[name] || ''}</span>`;
  },

  // Number with animation placeholder
  animateNumber(el, target, duration = 600) {
    const start = parseFloat(el.textContent.replace(/[^\d.-]/g, '')) || 0;
    const range = target - start;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  // Simple chart helpers (Canvas-based)
  drawBarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barWidth = chartW / data.length * 0.6;
    const gap = chartW / data.length * 0.4;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Utils.currency(maxVal - (maxVal / 4) * i).replace('R$\u00a0', ''), padding.left - 8, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
      const x = padding.left + (chartW / data.length) * i + gap / 2;
      const barH = (d.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      const gradient = ctx.createLinearGradient(x, y, x, y + barH);
      gradient.addColorStop(0, options.color || '#e85d04');
      gradient.addColorStop(1, options.colorEnd || 'rgba(232, 93, 4, 0.3)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barWidth / 2, h - padding.bottom + 20);
    });
  },

  drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    // Line
    ctx.strokeStyle = options.color || '#e85d04';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding.left + (chartW / (data.length - 1)) * i;
      const y = padding.top + chartH - (d.value / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill
    const lastX = padding.left + chartW;
    const lastY = padding.top + chartH - (data[data.length - 1].value / maxVal) * chartH;
    ctx.lineTo(lastX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(232, 93, 4, 0.15)');
    gradient.addColorStop(1, 'rgba(232, 93, 4, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Points + Labels
    data.forEach((d, i) => {
      const x = padding.left + (chartW / (data.length - 1)) * i;
      const y = padding.top + chartH - (d.value / maxVal) * chartH;

      ctx.fillStyle = options.color || '#e85d04';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x, h - padding.bottom + 20);
    });
  },

  drawDonutChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 10;
    const innerRadius = radius * 0.65;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;

    const colors = options.colors || ['#e85d04', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

    let startAngle = -Math.PI / 2;
    data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#fafafa';
    ctx.font = '600 18px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.centerText || total.toString(), cx, cy);
  },
};
