// DATA MODEL //

const VENUE = {
  name: 'Aurora Hall',
 
  event: {
    title: 'Winter Gala Concert',
    date: '2026-12-19T19:30'
  },
 
  currency: { code: 'AZN', symbol: '₼' },
 
  
  width: 1400,
  height: 1030,
  seatSize: 26,  
  seatStep: 32,   
  rowStep: 34,    
  aisleWidth: 26, 
 
  maxTicketsPerOrder: 10,
 
 
  unavailability: {
    seed: 'aurora-gala-2026',
    rate: 0.14,
    blocked: ['BAL-M-15', 'BAL-M-16', 'BAL-N-15', 'BAL-N-16', 'ORC-A-1', 'ORC-A-18']
  },
 

  categories: {
    box: {
      label: 'Royal Box',
      price: 120,
      color: '#ff7a59',
      description: 'Private side box close to the stage with extra legroom.'
    },
    vip: {
      label: 'VIP',
      price: 95,
      color: '#f5b942',
      description: 'Front orchestra rows — the closest view of the performers.'
    },
    premium: {
      label: 'Premium',
      price: 65,
      color: '#d36bff',
      description: 'Central stalls with the best balance of sound and view.'
    },
    standard: {
      label: 'Standard',
      price: 45,
      color: '#3fb6f5',
      description: 'Side stalls with an angled view of the stage.'
    },
    economy: {
      label: 'Economy',
      price: 25,
      color: '#9aa5ff',
      description: 'Upper balcony with a full overview of the hall.'
    }
  },
 

  sections: [
    {
      id: 'BXL', name: 'Box Left', category: 'box',
      rows: ['A', 'B', 'C'], seatsPerRow: 4, aisleAfter: [],
      cx: 190, y: 90, curve: 0
    },
    {
      id: 'BXR', name: 'Box Right', category: 'box',
      rows: ['A', 'B', 'C'], seatsPerRow: 4, aisleAfter: [],
      cx: 1210, y: 90, curve: 0
    },
    {
      id: 'ORC', name: 'Orchestra', category: 'vip',
      rows: ['A', 'B', 'C', 'D'], seatsPerRow: 18, aisleAfter: [9],
      cx: 700, y: 210, curve: 14
    },
    {
      id: 'STL', name: 'Stalls Left', category: 'standard',
      rows: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], seatsPerRow: 7, aisleAfter: [],
      cx: 190, y: 420, curve: 0
    },
    {
      id: 'STC', name: 'Stalls Centre', category: 'premium',
      rows: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], seatsPerRow: 20, aisleAfter: [10],
      cx: 700, y: 410, curve: 16
    },
    {
      id: 'STR', name: 'Stalls Right', category: 'standard',
      rows: ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], seatsPerRow: 7, aisleAfter: [],
      cx: 1210, y: 420, curve: 0
    },
    {
      id: 'BAL', name: 'Balcony', category: 'economy',
      rows: ['M', 'N', 'O', 'P', 'Q'], seatsPerRow: 30, aisleAfter: [10, 20],
      cx: 700, y: 810, curve: 24
    }
  ],
 

  features: [
    { type: 'stage',    label: 'Stage',               x: 450,  y: 30,  w: 500, h: 100 },
    { type: 'entrance', label: 'Entrance A',          x: 12,   y: 700, w: 64,  h: 90 },
    { type: 'entrance', label: 'Entrance B',          x: 1324, y: 700, w: 64,  h: 90 },
    { type: 'booth',    label: 'Sound & light booth', x: 590,  y: 704, w: 220, h: 34 },
    { type: 'label',    label: 'Balcony level ↑',     x: 1240, y: 760, w: 150, h: 20 },
    { type: 'exit',     label: 'Exit',                x: 12,   y: 960, w: 64,  h: 40 },
    { type: 'exit',     label: 'Exit',                x: 1324, y: 960, w: 64,  h: 40 }
  ]
};

(function () {
  'use strict';
 
  const ZOOM_MIN = 0.2;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 1.25;
  const PAN_STEP = 120;
  const MAX_TICKETS = VENUE.maxTicketsPerOrder;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  const $ = (selector) => document.querySelector(selector);
  const dom = {
    viewport: $('#viewport'),
    venue: $('#venue'),
    priceLegend: $('#priceLegend'),
    detailsTitle: $('#detailsTitle'),
    detailsBody: $('#detailsBody'),
    cartTitle: $('#cartTitle'),
    cartList: $('#cartList'),
    cartEmpty: $('#cartEmpty'),
    cartTotal: $('#cartTotal'),
    cartQty: $('#cartQty'),
    cartLimit: $('#cartLimit'),
    cartBadge: $('#cartBadge'),
    clearCart: $('#clearCart'),
    zoomLevel: $('#zoomLevel'),
    btn: {
      zoomIn: $('#btnZoomIn'),
      zoomOut: $('#btnZoomOut'),
      up: $('#btnUp'),
      down: $('#btnDown'),
      left: $('#btnLeft'),
      right: $('#btnRight'),
      reset: $('#btnReset')
    }
  };
 
  const seats = [];
  const seatsById = new Map();
  const seatEls = new Map();
 
  const state = {
    cart: [],
    inspectedId: null,
    view: { scale: 1, x: 0, y: 0, fitted: true }
  };
 
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
 
  const formatPrice = (amount) => `${VENUE.currency.symbol}${amount.toFixed(2)}`;
 
  const category = (seat) => VENUE.categories[seat.category];
 
  const isInCart = (id) => state.cart.includes(id);
 
  function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
 
  const seatName = (seat) => `${seat.sectionName}, Row ${seat.row}, Seat ${seat.number}`;
 
  function hashToUnit(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0) / 4294967296;
  }
 
  function seatStatus(seat) {
    if (seat.unavailable) return 'unavailable';
    if (isInCart(seat.id)) return 'in-cart';
    return 'available';
  }
 
  const STATUS_TEXT = {
    'available': 'Available',
    'in-cart': 'In your cart',
    'unavailable': 'Unavailable'
  };
 
  function buildModel() {
    const { seatSize, seatStep, rowStep, aisleWidth, unavailability } = VENUE;
    const blocked = new Set(unavailability.blocked || []);
 
    VENUE.sections.forEach((section) => {
      const aisles = section.aisleAfter || [];
      const curve = section.curve || 0;
      const rowWidth = (section.seatsPerRow - 1) * seatStep + seatSize + aisles.length * aisleWidth;
      const left = section.cx - rowWidth / 2;
      const middle = (section.seatsPerRow - 1) / 2;
 
      section.bounds = {
        left: left - 34,
        top: section.y - curve - 34,
        width: rowWidth + 68,
        height: (section.rows.length - 1) * rowStep + seatSize + curve + 46
      };
      section.rowLabels = [];
 
      section.rows.forEach((row, rowIndex) => {
        let x = left;
        const rowSeats = [];
 
        for (let number = 1; number <= section.seatsPerRow; number++) {
          const offset = middle ? (number - 1 - middle) / middle : 0;
          const y = Math.round(section.y + rowIndex * rowStep - curve * offset * offset);
          const id = `${section.id}-${row}-${number}`;
 
          const seat = {
            id,
            sectionId: section.id,
            sectionName: section.name,
            row,
            number,
            category: section.category,
            price: VENUE.categories[section.category].price,
            x: Math.round(x),
            y,
            unavailable: blocked.has(id) || hashToUnit(unavailability.seed + id) < unavailability.rate
          };
 
          seats.push(seat);
          seatsById.set(id, seat);
          rowSeats.push(seat);
 
          x += seatStep;
          if (aisles.includes(number)) x += aisleWidth;
        }
 
        section.rowLabels.push({ row, first: rowSeats[0], last: rowSeats[rowSeats.length - 1] });
      });
    });
  }
 
  function renderVenue() {
    const venue = dom.venue;
    venue.style.width = `${VENUE.width}px`;
    venue.style.height = `${VENUE.height}px`;
    const fragment = document.createDocumentFragment();
 
    VENUE.features.forEach((feature) => {
      const el = document.createElement('div');
      el.className = `feature feature--${feature.type}`;
      el.style.left = `${feature.x}px`;
      el.style.top = `${feature.y}px`;
      el.style.width = `${feature.w}px`;
      el.style.height = `${feature.h}px`;
      el.textContent = feature.label;
      el.setAttribute('aria-hidden', 'true');
      fragment.appendChild(el);
    });
 
    VENUE.sections.forEach((section) => {
      const cat = VENUE.categories[section.category];
 
      const zone = document.createElement('div');
      zone.className = 'zone';
      zone.style.backgroundColor = hexToRgba(cat.color, 0.07);
      zone.style.borderColor = hexToRgba(cat.color, 0.32);
      zone.style.left = `${section.bounds.left}px`;
      zone.style.top = `${section.bounds.top}px`;
      zone.style.width = `${section.bounds.width}px`;
      zone.style.height = `${section.bounds.height}px`;
      zone.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'zone__label';
      label.style.color = cat.color;
      label.textContent = `${section.name} · ${cat.label} · ${formatPrice(cat.price)}`;
      zone.appendChild(label);
      fragment.appendChild(zone);
 
      section.rowLabels.forEach(({ row, first, last }) => {
        [[first.x - 22, first.y], [last.x + VENUE.seatSize + 4, last.y]].forEach(([x, y]) => {
          const rowLabel = document.createElement('span');
          rowLabel.className = 'row-label';
          rowLabel.style.left = `${x}px`;
          rowLabel.style.top = `${y}px`;
          rowLabel.textContent = row;
          rowLabel.setAttribute('aria-hidden', 'true');
          fragment.appendChild(rowLabel);
        });
      });
 
      const group = document.createElement('div');
      group.className = 'seat-group';
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', `${section.name} — ${cat.label}, ${formatPrice(cat.price)}`);
 
      seats
        .filter((seat) => seat.sectionId === section.id)
        .forEach((seat) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `seat seat--${seat.category}`;
          button.dataset.id = seat.id;
          button.style.left = `${seat.x}px`;
          button.style.top = `${seat.y}px`;
          button.textContent = seat.number;
          if (seat.unavailable) {
            button.classList.add('is-unavailable');
            button.setAttribute('aria-disabled', 'true');
          }
          seatEls.set(seat.id, button);
          group.appendChild(button);
        });
 
      fragment.appendChild(group);
    });
 
    venue.replaceChildren(fragment);
  }
 
  function renderLegend() {
    dom.priceLegend.innerHTML = Object.entries(VENUE.categories)
      .map(([key, cat]) => {
        const free = seats.filter((s) => s.category === key && !s.unavailable && !isInCart(s.id)).length;
        return `<li>
            <span class="legend__swatch" style="background:${cat.color}" aria-hidden="true"></span>
            <span>${cat.label}</span>
            <strong>${formatPrice(cat.price)}</strong>
            <small>${free} left</small>
          </li>`;
      })
      .join('');
  }
 
  function renderDetails() {
    const seat = state.inspectedId ? seatsById.get(state.inspectedId) : null;
 
    if (!seat) {
      dom.detailsBody.innerHTML = `
        <div class="details__empty">
          <p><strong>No seat selected.</strong></p>
          <p>Click any seat on the map to see its section, row, number and price.
             Nothing is added to your cart until you press <strong>ADD TO CART</strong>.</p>
        </div>`;
      return;
    }
 
    const cat = category(seat);
    const status = seatStatus(seat);
    const cartFull = state.cart.length >= MAX_TICKETS;
    const canAdd = status === 'available' && !cartFull;
 
    let note = '';
    if (status === 'unavailable') note = 'This seat is already sold and cannot be added to the cart.';
    else if (status === 'in-cart') note = 'This seat is already in your cart. Each seat can only be added once.';
    else if (cartFull) note = `You have reached the limit of ${MAX_TICKETS} tickets per order.`;
 
    dom.detailsBody.innerHTML = `
      <div class="details__head">
        <span class="details__swatch" style="background:${cat.color}" aria-hidden="true"></span>
        <div>
          <p class="eyebrow">Section</p>
          <h3 class="details__section">${seat.sectionName}</h3>
        </div>
        <button type="button" class="icon-btn" data-action="close" aria-label="Close seat details" title="Close (Esc)">×</button>
      </div>
 
      <dl class="details__grid">
        <div><dt>Row</dt><dd>${seat.row}</dd></div>
        <div><dt>Seat</dt><dd>${seat.number}</dd></div>
        <div><dt>Category</dt><dd>${cat.label}</dd></div>
        <div><dt>Seat ID</dt><dd class="mono">${seat.id}</dd></div>
      </dl>
 
      <p class="details__desc">${cat.description}</p>
 
      <div class="details__price">
        <span>Ticket price</span>
        <strong>${formatPrice(seat.price)}</strong>
      </div>
 
      <p class="status status--${status}">${STATUS_TEXT[status]}</p>
 
      <button type="button" class="btn btn--primary btn--block" data-action="add" ${canAdd ? '' : 'disabled'}>
        ADD TO CART
      </button>
      ${status === 'in-cart'
        ? '<button type="button" class="btn btn--ghost btn--block" data-action="remove">Remove from cart</button>'
        : ''}
      ${note ? `<p class="details__note">${note}</p>` : ''}
      <button type="button" class="link-btn" data-action="locate">Show seat on map</button>`;
  }
 
  function renderCart() {
    const items = state.cart.map((id) => seatsById.get(id)).filter(Boolean);
    const total = items.reduce((sum, seat) => sum + seat.price, 0);
 
    dom.cartList.innerHTML = items
      .map((seat) => {
        const cat = category(seat);
        return `<li class="cart-item">
            <span class="cart-item__dot" style="background:${cat.color}" aria-hidden="true"></span>
            <button type="button" class="cart-item__info" data-action="locate" data-id="${seat.id}"
                    title="Show this seat on the map">
              <span class="cart-item__name">${seat.sectionName}</span>
              <span class="cart-item__meta">Row ${seat.row} · Seat ${seat.number} · ${cat.label}</span>
            </button>
            <span class="cart-item__price">${formatPrice(seat.price)}</span>
            <button type="button" class="cart-item__remove" data-action="remove" data-id="${seat.id}"
                    aria-label="Remove ${seatName(seat)} from cart" title="Remove">×</button>
          </li>`;
      })
      .join('');
 
    const count = items.length;
    dom.cartEmpty.hidden = count > 0;
    dom.cartTotal.textContent = formatPrice(total);
    dom.cartQty.textContent = `${count} ticket${count === 1 ? '' : 's'}`;
    dom.cartBadge.textContent = count;
    dom.clearCart.disabled = count === 0;
    dom.cartLimit.textContent = count >= MAX_TICKETS
      ? `Maximum of ${MAX_TICKETS} tickets per order reached.`
      : `You can add ${MAX_TICKETS - count} more ticket${MAX_TICKETS - count === 1 ? '' : 's'}.`;
 
    renderLegend();
  }
 
  function updateSeat(id) {
    const seat = seatsById.get(id);
    const button = seatEls.get(id);
    if (!seat || !button) return;
 
    const status = seatStatus(seat);
    const inspected = state.inspectedId === id;
 
    button.classList.toggle('is-in-cart', status === 'in-cart');
    button.classList.toggle('is-inspected', inspected);
    button.setAttribute('aria-pressed', String(inspected));
    button.setAttribute('aria-label',
      `${seatName(seat)}, ${category(seat).label}, ${formatPrice(seat.price)}, ${STATUS_TEXT[status]}`);
    button.title = `${seatName(seat)} — ${formatPrice(seat.price)} (${STATUS_TEXT[status]})`;
  }
 
  function updateAllSeats() {
    seats.forEach((seat) => updateSeat(seat.id));
  }
 
  function inspectSeat(id, { center = false } = {}) {
    const previous = state.inspectedId;
    state.inspectedId = id && seatsById.has(id) ? id : null;
 
    if (previous && previous !== state.inspectedId) updateSeat(previous);
    if (state.inspectedId) updateSeat(state.inspectedId);
    renderDetails();
 
    if (center && state.inspectedId) centerOnSeat(seatsById.get(state.inspectedId), 1.2);
  }
 
  function addToCart(id) {
    const seat = seatsById.get(id);
    if (!seat) return false;
 
    if (seat.unavailable) {
      return false;
    }
    if (isInCart(id)) {
      return false;
    }
 
    state.cart.push(id);
    updateSeat(id);
    renderCart();
    renderDetails();
    return true;
  }
 
  function removeFromCart(id) {
    if (!isInCart(id)) return false;
 
    state.cart = state.cart.filter((cartId) => cartId !== id);
    updateSeat(id);
    renderCart();
    renderDetails();
    return true;
  }
 
  function clearCart() {
    if (!state.cart.length) return;
    if (!window.confirm('Remove all tickets from your cart?')) return;
 
    const removed = state.cart.slice();
    state.cart = [];
    removed.forEach(updateSeat);
    renderCart();
    renderDetails();
  }
 
  function viewportSize() {
    return { vw: dom.viewport.clientWidth, vh: dom.viewport.clientHeight };
  }
 
  function getBounds(scale) {
    const { vw, vh } = viewportSize();
    const cw = VENUE.width * scale;
    const ch = VENUE.height * scale;
    const axis = (view, content, margin) =>
      content <= view
        ? { min: 0, max: view - content }
        : { min: view - content - margin, max: margin };
    const bx = axis(vw, cw, Math.min(80, vw * 0.2));
    const by = axis(vh, ch, Math.min(80, vh * 0.2));
    return { minX: bx.min, maxX: bx.max, minY: by.min, maxY: by.max };
  }
 
  function applyView(animate = false) {
    const view = state.view;
    const bounds = getBounds(view.scale);
    view.x = clamp(view.x, bounds.minX, bounds.maxX);
    view.y = clamp(view.y, bounds.minY, bounds.maxY);
 
    dom.venue.classList.toggle('is-animating', animate && !reducedMotion);
    dom.venue.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    dom.zoomLevel.textContent = `${Math.round(view.scale * 100)}%`;
 
    const eps = 0.5;
    dom.btn.zoomIn.disabled = view.scale >= ZOOM_MAX - 0.001;
    dom.btn.zoomOut.disabled = view.scale <= ZOOM_MIN + 0.001;
    dom.btn.up.disabled = view.y >= bounds.maxY - eps;
    dom.btn.down.disabled = view.y <= bounds.minY + eps;
    dom.btn.left.disabled = view.x >= bounds.maxX - eps;
    dom.btn.right.disabled = view.x <= bounds.minX + eps;
  }
 
  function zoomAt(factor, px, py, animate) {
    const view = state.view;
    const next = clamp(view.scale * factor, ZOOM_MIN, ZOOM_MAX);
    if (Math.abs(next - view.scale) < 0.0001) return;
    const k = next / view.scale;
    view.x = px - (px - view.x) * k;
    view.y = py - (py - view.y) * k;
    view.scale = next;
    view.fitted = false;
    applyView(animate);
  }
 
  function zoomAtCenter(factor) {
    const { vw, vh } = viewportSize();
    zoomAt(factor, vw / 2, vh / 2, true);
  }
 
  function panBy(dx, dy, animate = true) {
    state.view.x += dx;
    state.view.y += dy;
    state.view.fitted = false;
    applyView(animate);
  }
 
  function resetView(animate = true) {
    const { vw, vh } = viewportSize();
    if (!vw || !vh) return;
    const scale = clamp(Math.min(vw / VENUE.width, vh / VENUE.height) * 0.96, ZOOM_MIN, ZOOM_MAX);
    state.view.scale = scale;
    state.view.x = (vw - VENUE.width * scale) / 2;
    state.view.y = (vh - VENUE.height * scale) / 2;
    state.view.fitted = true;
    applyView(animate);
  }
 
  function centerOnSeat(seat, minScale) {
    const { vw, vh } = viewportSize();
    const view = state.view;
    view.scale = clamp(Math.max(view.scale, minScale || 0), ZOOM_MIN, ZOOM_MAX);
    const half = VENUE.seatSize / 2;
    view.x = vw / 2 - (seat.x + half) * view.scale;
    view.y = vh / 2 - (seat.y + half) * view.scale;
    view.fitted = false;
    applyView(true);
  }
 
  function navigate(action) {
    switch (action) {
      case 'zoom-in': zoomAtCenter(ZOOM_STEP); break;
      case 'zoom-out': zoomAtCenter(1 / ZOOM_STEP); break;
      case 'up': panBy(0, PAN_STEP); break;
      case 'down': panBy(0, -PAN_STEP); break;
      case 'left': panBy(PAN_STEP, 0); break;
      case 'right': panBy(-PAN_STEP, 0); break;
      case 'reset': resetView(true); break;
      default: break;
    }
  }
 
  function bindEvents() {
    dom.venue.addEventListener('click', (event) => {
      const button = event.target.closest('.seat');
      if (!button) return;
      inspectSeat(button.dataset.id);
    });
 
    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.nav));
    });
 
    const keyMap = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      '+': 'zoom-in', '=': 'zoom-in', '-': 'zoom-out', '_': 'zoom-out', '0': 'reset'
    };
    dom.viewport.addEventListener('keydown', (event) => {
      if (event.target !== dom.viewport) return;
      const action = keyMap[event.key];
      if (!action) return;
      event.preventDefault();
      navigate(action);
    });
 
    dom.detailsBody.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button || !state.inspectedId) return;
      const id = state.inspectedId;
 
      switch (button.dataset.action) {
        case 'add':
          if (addToCart(id)) {
          }
          break;
        case 'remove':
          if (removeFromCart(id)) {
          }
          break;
        case 'close':
          inspectSeat(null);
          break;
        case 'locate':
          centerOnSeat(seatsById.get(id), 1.2);
          break;
        default: break;
      }
    });
 
    dom.cartList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const id = button.dataset.id;
 
      if (button.dataset.action === 'remove') {
        removeFromCart(id);
      } else if (button.dataset.action === 'locate') {
        inspectSeat(id, { center: true });
      }
    });
 
    dom.clearCart.addEventListener('click', clearCart);
 
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.inspectedId) inspectSeat(null);
    });
 
  }
 
  function init() {
    buildModel();
    renderVenue();
    updateAllSeats();
    renderCart();
    renderDetails();
    bindEvents();
    resetView(false);
  }
 
  init();
})();