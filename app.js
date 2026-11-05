(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- Configuration: edit these to change the menu, hours and collection ---------- */
  var TEMPS = [{ k: 'hot', label: 'caliente' }, { k: 'iced', label: 'fr\u00edo' }];
  var MENU = [
    { sec: 'Lattes', items: [
      { id: 'honey',     name: 'Honey latte',            price: 5.5, temps: true },
      { id: 'mascabado', name: 'Mascabado latte', price: 5.5, temps: true, note: 'piloncillo, cinnamon' },
      { id: 'horchata',  name: 'Horchata latte',         price: 6,   temps: true, note: 'homemade horchata' },
      { id: 'matcha',    name: 'Matcha w/ vanilla foam', price: 6.5, temps: true, note: 'ceremonial matcha' }
    ] },
    { sec: 'Frescas', items: [
      { id: 'jamaica', name: 'Jamaica',               price: 4.5 },
      { id: 'tejuino', name: 'Tejuino estilo Colima', price: 5 },
      { id: 'horchata-agua', name: 'Horchata',          price: 4.5, note: 'homemade' }
    ] },
    { sec: 'Comida', items: [
      { id: 'tamal', name: 'Tamales', price: 4.5, unit: 'each', note: 'rojo de pollo' }
    ] }
  ];
  /* Pieces for Ropa y Objetos: { id, title, detail, size, price, status: 'available' | 'sold', img: 'url or data URI' } */
  var PIECES = [];
  /* Arte: pieces to show. Upload the image files, then list them here.
     status is 'available', 'nfs' (not for sale) or 'sold'. Leave price out to show "Price on request".
     img is a file name inside ART_FOLDER, for example 'painting-01.jpg'. Use ART_FOLDER = '' if the images sit at the top level.
     INQUIRY_EMAIL is where "Inquire" emails go. Leave it empty to hide the inquiry links. */
  var INQUIRY_EMAIL = '';
  var ART_FOLDER = 'fotos/';
  /* Square photos. plain: true shows just the picture. href makes a tile a link instead of opening larger.
     Name each file in the fotos folder exactly as below (.png; .jpg, .jpeg and .webp also work). */
  var ART = [
    { id: 'ca', title: 'CA', img: 'CA.png', plain: true },
    { id: 'volcan', title: 'Volcan', img: 'Volcan.png', plain: true },
    { id: 'phx', title: 'PHX', img: 'PHX.png', plain: true },
    { id: 'colima', title: 'Colima', img: 'Colima.png', plain: true },
    { id: 'benito', title: 'Benito', img: 'Benito.png', plain: true, href: 'gracias.html' },
    { id: 'torres', title: 'Torres', img: 'Torres.png', plain: true }
  ];
  var ART_PREVIEW = false;
  var ART_INLINE = {};
  /* Where orders, reservations and hold requests are sent. Paste your form endpoint here, for example
     'https://formspree.io/f/xxxxxxxx'. Leave it empty and the page shows a copy-the-details screen instead. */
  var SUBMIT_URL = 'https://formspree.io/f/xyeeevne';
  var TOGO = { days: [0, 6], open: 540, close: 960, step: 15, lead: 20, horizon: 7 };
  var DINNER = { days: [5, 6], slots: [1080, 1110, 1140, 1170, 1200, 1230, 1260, 1290], horizon: 21, lead: 60, maxParty: 8, defaultSlot: 1140 };

  /* ---------- Helpers ---------- */
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var byId = {}; MENU.forEach(function (s) { s.items.forEach(function (m) { byId[m.id] = m; }); });
  var tempBy = {}; TEMPS.forEach(function (t) { tempBy[t.k] = t; });
  function money(n) { return '$' + n.toFixed(2); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromIso(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function nowMin() { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
  function fmtT(m) { var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + pad(mm) + ' ' + (h >= 12 ? 'PM' : 'AM'); }
  function fmtD(d) { return DAY[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); }
  function dayLabel(d, offset) { return (offset === 0 ? 'Today, ' : offset === 1 ? 'Tomorrow, ' : '') + fmtD(d); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function code() { var a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function isToday(d) { return iso(d) === iso(new Date()); }

  /* ---------- Tabs ---------- */
  var TABS = ['home', 'sonidos', 'cafe', 'events', 'ropa', 'arte'];
  function showTab(t, remember) {
    if (TABS.indexOf(t) < 0) t = 'home';
    $$('.panel').forEach(function (p) { p.hidden = p.dataset.panel !== t; });
    $$('.tab').forEach(function (b) { if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (remember) { try { history.replaceState(null, '', '#' + t); } catch (e) {} window.scrollTo(0, 0); }
  }
  $$('.tab').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab, true); }); });
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.go, true); }); });
  var startHash = ''; try { startHash = (location.hash || '').replace('#', ''); } catch (e) {}
  showTab(startHash, false);

  /* ---------- Cart (a key is "itemId|temp") ---------- */
  function split(k) { var p = k.split('|'); return { id: p[0], opt: p[1] || '' }; }
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('boca-cart-v3') || '{}') || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(function (k) {
    var s = split(k), m = byId[s.id];
    if (!m || !(cart[k] > 0) || (m.temps ? !tempBy[s.opt] : s.opt !== '')) delete cart[k];
  });
  function saveCart() { try { localStorage.setItem('boca-cart-v3', JSON.stringify(cart)); } catch (e) {} }
  function count() { return Object.keys(cart).reduce(function (a, k) { return a + cart[k]; }, 0); }
  function subtotal() { return Object.keys(cart).reduce(function (a, k) { return a + byId[split(k).id].price * cart[k]; }, 0); }
  function nameOf(k) { var s = split(k), n = byId[s.id].name; return s.opt ? n + ' (' + tempBy[s.opt].label + ')' : n; }
  function setQty(key, q) {
    q = Math.max(0, Math.min(20, q));
    if (q === 0) delete cart[key]; else cart[key] = q;
    saveCart(); sync();
  }

  /* ---------- Menu sheet ---------- */
  function rowHTML(it) {
    return '<li class="m-row" data-id="' + it.id + '"><div class="m-line"><span class="m-name">' + esc(it.name) + '</span>' +
      '<span class="m-dots" aria-hidden="true"></span><span class="m-price">' + it.price.toFixed(2) + (it.unit ? ' ' + it.unit : '') + '</span></div>' +
      (it.note ? '<p class="m-note">' + esc(it.note) + '</p>' : '') + '<div class="m-adds"></div></li>';
  }
  $('#menuBody').innerHTML = MENU.map(function (s) {
    return '<section class="m-sec"><h4 class="m-h">' + esc(s.sec) + '</h4><ul class="m-list" style="padding:0;margin:0">' + s.items.map(rowHTML).join('') + '</ul></section>';
  }).join('');

  var activeKey = null; /* the menu item whose + / - counter is open */
  function addsHTML(it) {
    var opts = it.temps ? TEMPS : [{ k: '', label: 'add' }];
    return opts.map(function (o) {
      var key = it.id + '|' + o.k, q = cart[key] || 0, nm = esc(it.name + (o.k ? ' (' + o.label + ')' : ''));
      if (!q || key !== activeKey) return '<button type="button" class="m-btn" data-act="add" data-key="' + key + '" aria-label="Add ' + nm + ' to order' + (q ? ' (' + q + ' in order)' : '') + '"><span class="lbl">' + o.label + ' +' + (q ? ' &times;' + q : '') + '</span></button>';
      return '<span class="m-step" role="group" aria-label="' + nm + ' quantity">' + (o.k ? '<span class="m-opt">' + o.label + '</span>' : '') +
        '<button type="button" data-act="dec" data-key="' + key + '" aria-label="Remove one ' + nm + '">&minus;</button><output>' + q + '</output>' +
        '<button type="button" data-act="inc" data-key="' + key + '" aria-label="Add one ' + nm + '">+</button></span>';
    }).join('');
  }
  function stepperHTML(key, q, n) {
    return '<div class="stepper" role="group" aria-label="' + n + ' quantity">' +
      '<button type="button" data-act="dec" data-key="' + key + '" aria-label="Remove one ' + n + '">&minus;</button><span>' + q + '</span>' +
      '<button type="button" data-act="inc" data-key="' + key + '" aria-label="Add one ' + n + '">+</button></div>';
  }

  var lines = $('#lines'), orderForm = $('#orderForm');
  function sync() {
    $('#cartCount').textContent = count();
    $('#openCart').hidden = count() === 0;
    $('#openCart').setAttribute('aria-label', 'Open order, ' + count() + ' items');
    $$('.m-row').forEach(function (row) { row.querySelector('.m-adds').innerHTML = addsHTML(byId[row.dataset.id]); });
    lines.innerHTML = Object.keys(cart).map(function (key) {
      var m = byId[split(key).id], q = cart[key], n = esc(nameOf(key));
      return '<li class="line"><div class="ln"><span class="n">' + n + '</span><span class="muted small">' + money(m.price) + (m.unit ? ' ' + m.unit : ' each') + '</span></div>' +
        stepperHTML(key, q, n) + '<span class="lt price">' + money(m.price * q) + '</span></li>';
    }).join('');
    $('#sub').textContent = money(subtotal());
    var has = count() > 0;
    $('#emptyMsg').hidden = has;
    orderForm.hidden = !has;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var key = b.dataset.key, a = b.dataset.act, inDrawer = !!b.closest('#lines');
    if (!inDrawer && (a === 'add' || a === 'inc')) activeKey = key;
    if (a === 'add' || a === 'inc') setQty(key, (cart[key] || 0) + 1);
    else if (a === 'dec') setQty(key, (cart[key] || 0) - 1);
    else return;
    if (!(cart[key] > 0) && activeKey === key) { activeKey = null; sync(); }
    var want = (cart[key] || 0) > 0 ? (a === 'dec' ? 'dec' : 'inc') : 'add';
    var scope = inDrawer ? lines : document.querySelector('.m-row[data-id="' + split(key).id + '"]');
    var t = scope && scope.querySelector('[data-act="' + want + '"][data-key="' + key + '"]');
    if (t) t.focus(); else if (inDrawer) $('#closeCart').focus();
  });

  document.addEventListener('click', function (e) {
    if (activeKey && !e.target.closest('.m-step') && !e.target.closest('[data-act="add"]')) { activeKey = null; sync(); }
  });

  /* ---------- Drawer ---------- */
  var drawer = $('#cart'), scrim = $('#scrim'), lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    $('#cartMain').hidden = false; $('#cartDone').hidden = true;
    fillPickupDates();
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('#closeCart').focus();
  }
  function closeCart() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.hidden = true;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });

  /* ---------- Pickup times ---------- */
  function togoTimes(d) {
    var out = [], min = isToday(d) ? nowMin() + TOGO.lead : 0;
    for (var t = TOGO.open; t <= TOGO.close - TOGO.step; t += TOGO.step) if (t >= min) out.push(t);
    return out;
  }
  function togoDates() {
    var out = [], today = new Date();
    for (var i = 0; i <= TOGO.horizon; i++) {
      var d = addDays(today, i);
      if (TOGO.days.indexOf(d.getDay()) < 0) continue;
      if (i === 0 && !togoTimes(d).length) continue;
      out.push({ d: d, i: i });
    }
    return out;
  }
  function fillPickupDates() {
    var s = $('#oDate'), prev = s.value;
    s.innerHTML = togoDates().map(function (x) { return '<option value="' + iso(x.d) + '">' + dayLabel(x.d, x.i) + '</option>'; }).join('');
    if (prev && s.querySelector('option[value="' + prev + '"]')) s.value = prev;
    fillPickupTimes();
  }
  function fillPickupTimes() {
    var s = $('#oTime'), prev = s.value, v = $('#oDate').value;
    s.innerHTML = v ? togoTimes(fromIso(v)).map(function (t) { return '<option value="' + t + '">' + fmtT(t) + '</option>'; }).join('') : '';
    if (prev && s.querySelector('option[value="' + prev + '"]')) s.value = prev;
  }
  $('#oDate').addEventListener('change', fillPickupTimes);

  /* ---------- Sending ---------- */
  function send(kind, doc) {
    if (!SUBMIT_URL) return Promise.resolve('offline');
    var title = kind === 'orders' ? 'order' : kind === 'reservations' ? 'dinner reservation' : 'hold request';
    var text = kind === 'orders' ? orderText(doc) : kind === 'reservations' ? resText(doc) : holdText(doc);
    var payload = { _subject: 'boca ' + title + ' ' + doc.code, type: title, code: doc.code, name: doc.name, phone: doc.phone, message: text };
    if (doc.email) payload.email = doc.email;
    return fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok ? 'ok' : 'error'; }, function () { return 'error'; });
  }
  function itemLine(i) { return i.qty + ' x ' + i.name + (i.optLabel ? ' (' + i.optLabel + ')' : ''); }
  function orderText(d) {
    return ['boca pickup order ' + d.code, 'Name: ' + d.name, 'Phone: ' + d.phone,
      'Pickup: ' + fmtD(fromIso(d.pickupDate)) + ' at ' + fmtT(d.pickupTime)]
      .concat(d.items.map(function (i) { return itemLine(i) + '  ' + money(i.price * i.qty); }))
      .concat(['Subtotal: ' + money(d.subtotal) + ' (pay at pickup)'], d.note ? ['Note: ' + d.note] : []).join('\n');
  }
  function resText(d) {
    return ['boca dinner reservation request ' + d.code, 'Name: ' + d.name, 'Phone: ' + d.phone]
      .concat(d.email ? ['Email: ' + d.email] : [])
      .concat(['Date: ' + fmtD(fromIso(d.date)) + ' at ' + fmtT(d.time), 'Guests: ' + d.party], d.note ? ['Note: ' + d.note] : []).join('\n');
  }
  function holdText(d) {
    return ['boca hold request ' + d.code, 'Piece: ' + d.pieceTitle, 'Name: ' + d.name, 'Phone: ' + d.phone].concat(d.note ? ['Note: ' + d.note] : []).join('\n');
  }
  function copyFrom(btn, ta) {
    var done = function () { btn.textContent = 'Copied'; };
    var fallback = function () { ta.focus(); ta.select(); btn.textContent = 'Press Ctrl or Cmd + C'; };
    try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (e) { fallback(); }
  }
  function renderOutcome(el, state, d, type) {
    var text = type === 'order' ? orderText(d) : type === 'res' ? resText(d) : holdText(d), h;
    var heading = type === 'order' ? 'Order received' : type === 'res' ? 'Request received' : 'Hold requested';
    var label = type === 'order' ? 'Order' : type === 'res' ? 'Request' : 'Hold';
    if (state === 'ok') {
      h = '<p class="eyebrow">' + label + ' ' + d.code + '</p><h3>' + heading + '</h3><p>' +
        (type === 'order' ? 'Pickup ' + esc(fmtD(fromIso(d.pickupDate))) + ' at ' + esc(fmtT(d.pickupTime)) + '. Pay when you collect.'
          : type === 'res' ? esc(fmtD(fromIso(d.date))) + ' at ' + esc(fmtT(d.time)) + ', ' + d.party + (d.party === 1 ? ' guest' : ' guests') + '. We will confirm using the contact details you gave.'
          : esc(d.pieceTitle) + '. We will contact you to arrange pickup and payment.') + '</p><pre>' + esc(text) + '</pre>';
    } else {
      h = '<h3>Not sent</h3><p>This page is not connected to boca yet, so nothing was delivered. Copy the details and send them to boca directly.</p>' +
        '<textarea readonly aria-label="Details to copy">' + esc(text) + '</textarea><button class="btn ghost" type="button" data-copy="1">Copy details</button>';
    }
    h += '<button class="btn' + (state === 'ok' ? '' : ' ghost') + '" type="button" data-back="' + type + '">' + (type === 'order' ? (state === 'ok' ? 'Done' : 'Back to order') : state === 'ok' ? 'Done' : 'Edit request') + '</button>';
    el.innerHTML = h;
    var cb = el.querySelector('[data-copy]');
    if (cb) cb.addEventListener('click', function () { copyFrom(cb, el.querySelector('textarea')); });
  }

  /* ---------- Place order ---------- */
  var orderErr = $('#orderErr');
  function orderFail(msg, field) { orderErr.textContent = msg; if (field) field.focus(); }
  orderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    orderErr.textContent = '';
    if (!count()) return;
    var name = $('#oName').value.trim(), phone = $('#oPhone').value.trim(), date = $('#oDate').value, time = $('#oTime').value;
    if (!name) return orderFail('Add a name for the pickup.', $('#oName'));
    if (phone.replace(/\D/g, '').length < 7) return orderFail('Add a phone number we can reach.', $('#oPhone'));
    if (!date || !time) return orderFail('Pick a pickup day and time.', $('#oTime'));
    var doc = {
      kind: 'order', code: code(), status: 'new', createdAt: new Date().toISOString(),
      name: name, phone: phone, pickupDate: date, pickupTime: Number(time), note: $('#oNote').value.trim().slice(0, 300),
      items: Object.keys(cart).map(function (k) {
        var s = split(k);
        return { id: s.id, opt: s.opt, optLabel: s.opt ? tempBy[s.opt].label : '', name: byId[s.id].name, qty: cart[k], price: byId[s.id].price };
      }),
      subtotal: Math.round(subtotal() * 100) / 100
    };
    var btn = $('#orderBtn'); btn.disabled = true; btn.textContent = 'Sending';
    send('orders', doc).then(function (state) {
      btn.disabled = false; btn.textContent = 'Place order';
      if (state === 'error') return orderFail('That did not go through. Try again in a moment.');
      renderOutcome($('#cartDone'), state, doc, 'order');
      $('#cartMain').hidden = true; $('#cartDone').hidden = false;
      if (state === 'ok') { cart = {}; saveCart(); sync(); $('#oNote').value = ''; }
      $('#cartDone').querySelector('button:last-child').focus();
    });
  });

  /* ---------- Reservation ---------- */
  var party = 2;
  function dinnerSlots(d) {
    var min = isToday(d) ? nowMin() + DINNER.lead : 0;
    return DINNER.slots.filter(function (t) { return t >= min; });
  }
  function dinnerDates() {
    var out = [], today = new Date();
    for (var i = 0; i <= DINNER.horizon; i++) {
      var d = addDays(today, i);
      if (DINNER.days.indexOf(d.getDay()) < 0) continue;
      if (!dinnerSlots(d).length) continue;
      out.push({ d: d, i: i });
    }
    return out;
  }
  function fillSlots() {
    var wrap = $('#slots'), cur = wrap.querySelector('input:checked'), prev = cur ? Number(cur.value) : DINNER.defaultSlot, v = $('#rDate').value;
    var slots = v ? dinnerSlots(fromIso(v)) : [];
    var pick = slots.indexOf(prev) >= 0 ? prev : slots[0];
    wrap.innerHTML = slots.map(function (t) {
      return '<label class="chip"><input type="radio" name="rtime" value="' + t + '"' + (t === pick ? ' checked' : '') + '><span>' + fmtT(t) + '</span></label>';
    }).join('');
  }
  $('#rDate').innerHTML = dinnerDates().map(function (x) { return '<option value="' + iso(x.d) + '">' + dayLabel(x.d, x.i) + '</option>'; }).join('');
  $('#rDate').addEventListener('change', fillSlots);
  fillSlots();
  function setParty(n) {
    party = Math.max(1, Math.min(DINNER.maxParty, n));
    $('#pVal').textContent = party;
    $('#pMinus').disabled = party <= 1; $('#pPlus').disabled = party >= DINNER.maxParty;
  }
  $('#pMinus').addEventListener('click', function () { setParty(party - 1); });
  $('#pPlus').addEventListener('click', function () { setParty(party + 1); });
  setParty(2);

  var resErr = $('#resErr');
  function resFail(msg, field) { resErr.textContent = msg; if (field) field.focus(); }
  $('#resForm').addEventListener('submit', function (e) {
    e.preventDefault();
    resErr.textContent = '';
    var name = $('#rName').value.trim(), phone = $('#rPhone').value.trim(), email = $('#rEmail').value.trim();
    var slot = $('#slots input:checked'), date = $('#rDate').value;
    if (!name) return resFail('Add a name for the reservation.', $('#rName'));
    if (phone.replace(/\D/g, '').length < 7) return resFail('Add a phone number we can reach.', $('#rPhone'));
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return resFail('That email address looks incomplete.', $('#rEmail'));
    if (!date || !slot) return resFail('Pick a date and a seating.', $('#slots input') || $('#rDate'));
    var doc = {
      kind: 'reservation', code: code(), status: 'new', createdAt: new Date().toISOString(),
      name: name, phone: phone, email: email, date: date, time: Number(slot.value), party: party, note: $('#rNote').value.trim().slice(0, 300)
    };
    var btn = $('#resBtn'); btn.disabled = true; btn.textContent = 'Sending';
    send('reservations', doc).then(function (state) {
      btn.disabled = false; btn.textContent = 'Request table';
      if (state === 'error') return resFail('That did not go through. Try again in a moment.');
      renderOutcome($('#resOutcome'), state, doc, 'res');
      $('#resForm').hidden = true; $('#resOutcome').hidden = false;
      if (state === 'ok') { $('#resForm').reset(); setParty(2); fillSlots(); }
      $('#resOutcome').querySelector('button:last-child').focus();
    });
  });

  /* ---------- Ropa y Objetos ---------- */
  function renderPieces() {
    var g = $('#pieces'), has = PIECES.length > 0;
    $('#ropaTitle').textContent = has ? 'Ropa y Objetos' : 'Pronto';
    $('#ropaLede').hidden = !has; g.hidden = !has;
    g.innerHTML = PIECES.map(function (p) {
      var sold = p.status === 'sold';
      return '<article class="piece' + (sold ? ' sold' : '') + '"><div class="piece-img"' + (p.img ? ' style="background-image:url(\'' + esc(p.img) + '\')" role="img" aria-label="' + esc(p.title) + '"' : '') + '>' + (p.img ? '' : 'Photo soon') + '</div>' +
        '<div class="row"><h3>' + esc(p.title) + '</h3><span class="price">' + (p.price ? money(Number(p.price)) : '') + '</span></div>' +
        '<p class="muted small">' + esc([p.detail, p.size].filter(Boolean).join(' \u00b7 ')) + '</p>' +
        (sold ? '<p class="eyebrow">Vendido</p>' : '<button class="btn ghost" type="button" data-hold="' + esc(p.id) + '">Apartar</button>') + '</article>';
    }).join('');
  }
  renderPieces();
  var holdFor = null;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-hold]');
    if (!b) return;
    holdFor = PIECES.filter(function (p) { return p.id === b.dataset.hold; })[0];
    if (!holdFor) return;
    $('#holdTitle').textContent = holdFor.title;
    $('#holdOutcome').hidden = true; $('#holdForm').hidden = false; $('#holdBox').hidden = false;
    $('#holdBox').scrollIntoView({ block: 'center' });
    $('#hName').focus();
  });
  $('#holdCancel').addEventListener('click', function () { $('#holdBox').hidden = true; });
  var holdErr = $('#holdErr');
  $('#holdForm').addEventListener('submit', function (e) {
    e.preventDefault();
    holdErr.textContent = '';
    if (!holdFor) return;
    var name = $('#hName').value.trim(), phone = $('#hPhone').value.trim();
    if (!name) { holdErr.textContent = 'Add your name.'; return $('#hName').focus(); }
    if (phone.replace(/\D/g, '').length < 7) { holdErr.textContent = 'Add a phone number we can reach.'; return $('#hPhone').focus(); }
    var doc = { kind: 'hold', code: code(), status: 'new', createdAt: new Date().toISOString(), name: name, phone: phone, note: $('#hNote').value.trim().slice(0, 300), pieceId: holdFor.id, pieceTitle: holdFor.title };
    var btn = $('#holdBtn'); btn.disabled = true; btn.textContent = 'Sending';
    send('holds', doc).then(function (state) {
      btn.disabled = false; btn.textContent = 'Request hold';
      if (state === 'error') { holdErr.textContent = 'That did not go through. Try again in a moment.'; return; }
      renderOutcome($('#holdOutcome'), state, doc, 'hold');
      $('#holdForm').hidden = true; $('#holdOutcome').hidden = false;
      if (state === 'ok') $('#holdForm').reset();
      $('#holdOutcome').querySelector('button:last-child').focus();
    });
  });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-back]');
    if (!b) return;
    var t = b.dataset.back;
    if (t === 'order') { if ($('#cartDone').querySelector('.eyebrow')) closeCart(); $('#cartDone').hidden = true; $('#cartMain').hidden = false; }
    else if (t === 'res') { $('#resOutcome').hidden = true; $('#resForm').hidden = false; $('#rName').focus(); }
    else { if ($('#holdOutcome').querySelector('.eyebrow')) $('#holdBox').hidden = true; $('#holdOutcome').hidden = true; $('#holdForm').hidden = false; }
  });

  /* ---------- Arte ---------- */
  var STATUS = { available: 'Available', nfs: 'Not for sale', sold: 'Sold' };
  function artSrc(a) { return ART_INLINE[a.img] || (/^(https?:|data:|\/)/.test(a.img) ? a.img : ART_FOLDER + a.img); }
  function artLine(a) { return [a.artist, a.year, a.medium].filter(Boolean).join(' \u00b7 '); }
  function artStatus(a) {
    var s = STATUS[a.status] || '';
    if (a.status === 'available') return s + ' \u00b7 ' + (a.price ? money(Number(a.price)) : 'Price on request');
    return s;
  }
  function renderArt() {
    var g = $('#artGrid'), has = ART.length > 0, lede = $('#arteLede');
    $('#arteTitle').textContent = has ? 'Arte' : 'Pronto';
    lede.hidden = !(has && INQUIRY_EMAIL);
    if (has && INQUIRY_EMAIL) {
      lede.innerHTML = 'To ask about a piece, write to <a href="mailto:' + esc(INQUIRY_EMAIL) + '">' + esc(INQUIRY_EMAIL) + '</a>.';
    }
    g.hidden = !has;
    g.className = 'art-grid' + (ART.length && ART.every(function (a) { return a.plain; }) ? ' squares' : '');
    g.innerHTML = ART.map(function (a, i) {
      if (a.plain) {
        var tag = a.href ? 'a class="art-open go" href="' + esc(a.href) + '"' : 'button type="button" class="art-open" data-art="' + i + '"';
        return '<figure class="art"><' + tag + ' aria-label="' + esc(a.href ? a.title : 'View ' + a.title + ' larger') + '">' +
          '<img src="' + esc(artSrc(a)) + '" alt="' + esc(a.title) + '" data-ext="0" data-base="' + esc(a.img.replace(/\.[a-z]+$/i, '')) + '"></' + (a.href ? 'a' : 'button') + '></figure>';
      }
      return '<figure class="art"><button type="button" class="art-open" data-art="' + i + '" aria-label="View ' + esc(a.title) + ' larger">' +
        '<img src="' + esc(artSrc(a)) + '" alt="' + esc(a.title + (a.artist ? ', ' + a.artist : '')) + '" loading="lazy"></button>' +
        '<figcaption><span class="t">' + esc(a.title) + '</span>' + (artLine(a) ? '<span class="m">' + esc(artLine(a)) + '</span>' : '') +
        '<span class="m">' + esc(artStatus(a)) + '</span></figcaption></figure>';
    }).join('');
    // A photo may be saved as .png, .jpg, .jpeg or .webp. A missing one is hidden (shown as a labelled box in the preview).
    $$('#artGrid img[data-base]').forEach(function (img) {
      var exts = ['png', 'jpg', 'jpeg', 'webp'];
      function fail() {
        var n = Number(img.dataset.ext) + 1;
        if (n < exts.length) { img.dataset.ext = n; img.src = ART_FOLDER + img.dataset.base + '.' + exts[n]; return; }
        var fig = img.closest('figure');
        if (ART_PREVIEW) { fig.innerHTML = '<div class="art-ph">' + esc(img.alt) + '</div>'; } else { fig.remove(); }
      }
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
  }
  renderArt();

  var lb = $('#lightbox'), lbFrom = null;
  function openArt(i) {
    var a = ART[i];
    if (!a) return;
    lbFrom = document.activeElement;
    var tile = document.querySelector('[data-art="' + i + '"] img');
    $('#lbImg').src = tile && tile.src ? tile.src : artSrc(a); $('#lbImg').alt = a.title;
    $('#lbCap').innerHTML = a.plain ? '' : '<span class="t">' + esc(a.title) + '</span>' + (artLine(a) ? '<span class="m">' + esc(artLine(a)) + '</span>' : '') +
      '<span class="m">' + esc(artStatus(a)) + '</span>' +
      (INQUIRY_EMAIL && a.status !== 'sold' ? '<a class="btn ghost" href="mailto:' + esc(INQUIRY_EMAIL) + '?subject=' + encodeURIComponent('Inquiry: ' + a.title) + '">Inquire about this piece</a>' : '');
    lb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function closeArt() {
    if (lb.hidden) return;
    lb.hidden = true;
    $('#lbImg').removeAttribute('src');
    document.documentElement.style.overflow = '';
    if (lbFrom && lbFrom.focus) lbFrom.focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-art]');
    if (b) return openArt(Number(b.dataset.art));
    if (e.target === lb || e.target.closest('#lbClose')) closeArt();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeArt(); });

  sync();
})();
