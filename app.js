/* Balsam portal — shared behaviour (demo data is kept in the browser's localStorage) */
(function () {
  'use strict';
  var ME = 'REG001', ME_NAME = 'Anitha Kumar', ME_COURSE = 'Full Stack Development';
  var STUDENTS = [
    { reg: 'REG001', name: 'Anitha Kumar', course: 'Full Stack Development' },
    { reg: 'REG002', name: 'Hari Santhoshini', course: 'Data Analysis' },
    { reg: 'REG003', name: 'Karthika', course: 'Digital Marketing' }
  ];
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return ('0' + n).slice(-2); }
  function fmt(ts) { var d = new Date(ts); return pad(d.getDate()) + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtIso(s) { return fmt(Date.parse(s + 'T00:00:00')); }
  function rs(n) { return 'Rs. ' + Number(n).toLocaleString('en-IN'); }
  function toast(m) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = 0; }, 2800); setTimeout(function () { t.remove(); }, 3300);
  }
  function save(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- Minimal PDF writer (A4, Helvetica) ---------- */
  function pdf(items) {
    var clean = function (s) { return String(s).replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, '\\$&'); };
    var c = '';
    items.forEach(function (l) {
      if (l.raw) { c += l.raw + '\n'; return; }
      c += (l.c || '0.06 0.11 0.3') + ' rg BT /' + (l.b ? 'F2' : 'F1') + ' ' + (l.s || 11) + ' Tf ' + l.x + ' ' + l.y + ' Td (' + clean(l.t) + ') Tj ET\n';
    });
    var objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
      '<< /Length ' + c.length + ' >>\nstream\n' + c + 'endstream',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
    ];
    var out = '%PDF-1.4\n', off = [];
    objs.forEach(function (o, i) { off.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
    var x = out.length;
    out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' +
      off.map(function (o) { return ('0000000000' + o).slice(-10) + ' 00000 n \n'; }).join('') +
      'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + x + '\n%%EOF';
    return new Blob([out], { type: 'application/pdf' });
  }
  function layout(o) {
    var G = '0.45 0.48 0.58', y, y2;
    var L = [
      { raw: '0.95 0.42 0.07 rg 0 782 595 60 re f' },
      { t: 'BALSAM', s: 22, x: 40, y: 812, b: 1, c: '1 1 1' },
      { t: 'CREATIVE TECHNOLOGY', s: 8, x: 40, y: 798, c: '1 1 1' },
      { t: o.title, s: 15, x: 555 - o.title.length * 9, y: 806, b: 1, c: '1 1 1' }
    ];
    y = 735; o.left.forEach(function (r) { L.push({ t: r[0], s: 8, x: 40, y: y, c: G }, { t: r[1], s: 11, x: 40, y: y - 13, b: 1 }); y -= 34; });
    y2 = 735; o.right.forEach(function (r) { L.push({ t: r[0], s: 8, x: 340, y: y2, c: G }, { t: r[1], s: 11, x: 340, y: y2 - 13, b: 1 }); y2 -= 34; });
    y = Math.min(y, y2) - 10;
    L.push({ raw: '0.95 0.96 0.99 rg 40 ' + (y - 7) + ' 515 22 re f' });
    o.cols.forEach(function (c, i) { L.push({ t: c, s: 9, x: o.xs[i], y: y, b: 1 }); });
    y -= 28;
    o.rows.forEach(function (r) {
      r.forEach(function (v, i) { L.push({ t: v, s: 10, x: o.xs[i], y: y }); });
      L.push({ raw: '0.9 0.92 0.96 RG 40 ' + (y - 8) + ' m 555 ' + (y - 8) + ' l S' }); y -= 24;
    });
    y -= 8;
    o.summary.forEach(function (r) { L.push({ t: r[0], s: r[2] ? 12 : 10, x: 340, y: y, b: r[2] }, { t: r[1], s: r[2] ? 12 : 10, x: 460, y: y, b: r[2] }); y -= 20; });
    if (o.note) L.push({ t: o.note, s: 9, x: 40, y: y - 14, c: G });
    L.push({ t: 'This is a computer-generated document and needs no signature.', s: 8, x: 40, y: 40, c: G });
    return pdf(L);
  }

  /* ---------- Fee data ---------- */
  var TOTAL = 60000, NEXT_DUE = '15 Sep 2026';
  var PAYMENTS = [
    { id: 'PAY-00048', date: '16 Jun 2026', amt: 20000, mode: 'UPI' },
    { id: 'PAY-00032', date: '15 Apr 2026', amt: 15000, mode: 'Net Banking' },
    { id: 'PAY-00021', date: '15 Feb 2026', amt: 7000, mode: 'Card' }
  ];
  function paid() { return PAYMENTS.reduce(function (a, p) { return a + p.amt; }, 0); }
  function receipt(p) {
    return layout({
      title: 'PAYMENT RECEIPT',
      left: [['RECEIVED FROM', ME_NAME], ['REGISTRATION NO.', ME], ['COURSE', ME_COURSE]],
      right: [['RECEIPT NO.', p.id], ['PAYMENT DATE', p.date], ['PAYMENT MODE', p.mode]],
      cols: ['Description', 'Payment ID', 'Mode', 'Amount'], xs: [40, 250, 350, 460],
      rows: [['Course fee instalment', p.id, p.mode, rs(p.amt)]],
      summary: [['Amount paid', rs(p.amt), 1]], note: 'Status: PAID. Thank you for your payment.'
    });
  }
  function invoice() {
    var pd = paid(), t = new Date();
    var rows = [['Course fee - ' + ME_COURSE, '-', '-', rs(TOTAL)]];
    PAYMENTS.forEach(function (p) { rows.push(['Payment received', p.date, p.id, '- ' + rs(p.amt)]); });
    return layout({
      title: 'FEE INVOICE',
      left: [['BILLED TO', ME_NAME], ['REGISTRATION NO.', ME], ['COURSE', ME_COURSE]],
      right: [['INVOICE NO.', 'INV-' + ME + '-' + pad(t.getMonth() + 1) + t.getFullYear()], ['ISSUE DATE', fmt(t)], ['DUE DATE', NEXT_DUE]],
      cols: ['Description', 'Date', 'Reference', 'Amount'], xs: [40, 250, 350, 460], rows: rows,
      summary: [['Total course fee', rs(TOTAL)], ['Paid so far', rs(pd)], ['Balance due', rs(TOTAL - pd), 1]],
      note: 'Please make the payment before the due date to avoid a late fee.'
    });
  }

  /* ---------- Course progress (admin sets it manually) ---------- */
  var PDEF = { REG001: { v: 70, upd: 'Today' }, REG002: { v: 100, upd: 'Yesterday' }, REG003: { v: 41, upd: '3 days ago' } };
  function progress() { var s = LS.get('bp_progress', {}), o = {}; STUDENTS.forEach(function (x) { o[x.reg] = s[x.reg] || PDEF[x.reg]; }); return o; }
  function pstatus(v) { return v >= 100 ? ['Completed', 'success'] : v >= 90 ? ['Eligible', 'info'] : ['In Progress', 'warning']; }
  function bindProgress() {
    var v = progress()[ME].v, st = pstatus(v);
    $$('[data-progress]').forEach(function (e) { e.textContent = v + '%'; });
    $$('[data-progress-bar]').forEach(function (e) { e.style.width = v + '%'; });
    $$('[data-progress-status]').forEach(function (e) { e.textContent = st[0]; e.className = 'badge ' + st[1]; });
  }
  function initProgressAdmin() {
    var sel = $('#pgStudent'); if (!sel) return;
    sel.innerHTML = STUDENTS.map(function (x) { return '<option value="' + x.reg + '">' + x.name + ' (' + x.reg + ')</option>'; }).join('');
    var rng = $('#pgRange'), num = $('#pgNum'), note = $('#pgNote');
    function load() { var p = progress()[sel.value]; rng.value = num.value = p.v; note.value = p.note || ''; }
    function render() {
      var P = progress();
      $('#progRows').innerHTML = STUDENTS.map(function (s) {
        var p = P[s.reg], st = pstatus(p.v);
        return '<tr><td>' + esc(s.name) + '<div class="cell-sub">' + s.reg + '</div></td><td>' + esc(s.course) + '</td>' +
          '<td><span class="mini-bar"><span style="width:' + p.v + '%"></span></span>' + p.v + '%</td>' +
          '<td><span class="badge ' + st[1] + '">' + st[0] + '</span></td><td>' + esc(p.upd) + '</td>' +
          '<td><button type="button" class="row-link" data-reg="' + s.reg + '">Update</button></td></tr>';
      }).join('');
    }
    rng.oninput = function () { num.value = rng.value; };
    num.oninput = function () { rng.value = num.value; };
    sel.onchange = load;
    $('#pgSave').onclick = function () {
      var v = Math.max(0, Math.min(100, parseInt(num.value, 10) || 0)), s = LS.get('bp_progress', {});
      s[sel.value] = { v: v, upd: fmt(Date.now()), note: note.value.trim() };
      LS.set('bp_progress', s); rng.value = num.value = v; render();
      toast('Progress updated to ' + v + '%');
    };
    $('#progRows').onclick = function (e) {
      var b = e.target.closest('[data-reg]'); if (!b) return;
      sel.value = b.getAttribute('data-reg'); load(); $('#progressCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    load(); render();
  }

  /* ---------- Notifications ---------- */
  var SEED = [
    { kind: 'notice', to: ME, title: 'Class Schedule', message: 'React Basics class tomorrow at 10 AM.', ts: Date.parse('2026-08-31') },
    { kind: 'notice', to: ME, title: 'Fee Due Reminder', message: 'Your next payment of \u20B918,000 is due on 15 Sep 2026.', ts: Date.parse('2026-08-28') },
    { kind: 'notice', to: ME, title: 'Assignment Deadline', message: 'HTML Landing Page is due on 05 Sep 2026.', ts: Date.parse('2026-08-27') },
    { kind: 'announcement', to: 'ALL', title: 'Exam Schedule', message: 'Term-end assessment window opens on 05 Sep.', ts: Date.parse('2026-08-25') },
    { kind: 'announcement', to: 'ALL', title: 'Institute Announcement', message: 'Library hours are extended until 7 PM this month.', ts: Date.parse('2026-08-20') }
  ];
  var ICON_BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  var ICON_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  function mine(n) { return n.to === 'ALL' || n.to === ME || n.to === 'COURSE:' + ME_COURSE; }
  function label(to) {
    if (to === 'ALL') return 'All students';
    if (to.indexOf('COURSE:') === 0) return to.slice(7);
    var s = STUDENTS.filter(function (x) { return x.reg === to; })[0]; return s ? s.name + ' (' + s.reg + ')' : to;
  }
  function initNotifStudent() {
    var a = $('#notifList'), b = $('#annList'); if (!a || !b) return;
    var all = LS.get('bp_notifs', []).concat(SEED).filter(mine).sort(function (x, y) { return y.ts - x.ts; });
    function item(n) {
      var h = n.kind === 'holiday';
      return '<div class="n-item"><div class="n-ico' + (h ? ' holiday' : '') + '">' + (h ? ICON_CAL : ICON_BELL) + '</div><div><div class="n-title">' + esc(n.title) +
        (h ? ' <span class="badge warning">Holiday</span>' : n.kind === 'message' ? ' <span class="badge info">From admin</span>' : '') + '</div>' +
        '<div class="n-msg">' + esc(n.message) + '</div><div class="n-date">' + fmt(n.ts) + '</div></div></div>';
    }
    function fill(el, kinds) {
      var l = all.filter(function (n) { return kinds.indexOf(n.kind) > -1; });
      el.innerHTML = l.length ? l.map(item).join('') : '<div class="empty">Nothing here yet.</div>';
    }
    fill(a, ['message', 'notice']); fill(b, ['holiday', 'broadcast', 'announcement']);
  }
  function initNotifAdmin() {
    var st = $('#nmStudent'); if (!st) return;
    st.innerHTML = STUDENTS.map(function (x) { return '<option value="' + x.reg + '">' + x.name + ' (' + x.reg + ')</option>'; }).join('');
    function render() {
      var l = LS.get('bp_notifs', []), t = $('#sentRows');
      t.innerHTML = l.length ? l.map(function (n) {
        var k = n.kind === 'message' ? ['Message', 'info'] : n.kind === 'holiday' ? ['Holiday', 'warning'] : ['Broadcast', 'neutral'];
        return '<tr><td><span class="badge ' + k[1] + '">' + k[0] + '</span></td><td>' + esc(label(n.to)) + '</td><td>' + esc(n.title) + '</td><td>' + fmt(n.ts) +
          '</td><td><button type="button" class="row-link" data-del="' + n.id + '">Delete</button></td></tr>';
      }).join('') : '<tr><td colspan="5" class="empty">Nothing sent yet.</td></tr>';
    }
    function add(n) { var l = LS.get('bp_notifs', []); n.id = 'n' + Date.now(); n.ts = Date.now(); l.unshift(n); LS.set('bp_notifs', l); render(); }
    function val(id) { return $('#' + id).value.trim(); }
    function clear(ids) { ids.forEach(function (i) { $('#' + i).value = ''; }); }
    $('#nmSend').onclick = function () {
      if (!val('nmTitle') || !val('nmBody')) return toast('Please enter a title and a message.');
      add({ kind: 'message', to: st.value, title: val('nmTitle'), message: val('nmBody') });
      toast('Message sent to ' + label(st.value)); clear(['nmTitle', 'nmBody']);
    };
    $('#hoPublish').onclick = function () {
      var name = val('hoName'), from = $('#hoFrom').value, to = $('#hoTo').value;
      if (!name || !from) return toast('Please enter the holiday name and start date.');
      if (to && to < from) return toast('The end date cannot be before the start date.');
      var when = fmtIso(from) + (to && to !== from ? ' to ' + fmtIso(to) : '');
      add({ kind: 'holiday', to: $('#hoAud').value, title: 'Holiday: ' + name, message: when + (val('hoMsg') ? '\n' + val('hoMsg') : '') });
      toast('Holiday announcement published'); clear(['hoName', 'hoFrom', 'hoTo', 'hoMsg']);
    };
    $('#brPublish').onclick = function () {
      if (!val('brTitle') || !val('brBody')) return toast('Please enter a title and a message.');
      add({ kind: 'broadcast', to: $('#brAud').value, title: val('brTitle'), message: val('brBody') });
      toast('Announcement published'); clear(['brTitle', 'brBody']);
    };
    $('#sentRows').onclick = function (e) {
      var b = e.target.closest('[data-del]'); if (!b) return;
      LS.set('bp_notifs', LS.get('bp_notifs', []).filter(function (n) { return n.id !== b.getAttribute('data-del'); })); render();
    };
    render();
  }

  /* ---------- Fees page ---------- */
  function initFees() {
    $$('[data-receipt]').forEach(function (b) {
      b.onclick = function () {
        var p = PAYMENTS.filter(function (x) { return x.id === b.getAttribute('data-receipt'); })[0];
        save(receipt(p), 'Receipt-' + p.id + '.pdf'); toast('Receipt downloaded');
      };
    });
    var inv = $('#viewInvoice'); if (inv) inv.onclick = function () { save(invoice(), 'Invoice-' + ME + '.pdf'); toast('Invoice downloaded'); };
    var pay = $('#payNow'); if (pay) pay.onclick = function () { toast('Online payment is not connected yet - please pay at the front office.'); };
  }

  window.BP = { receipt: receipt, invoice: invoice, PAYMENTS: PAYMENTS };
  function init() { bindProgress(); initProgressAdmin(); initNotifStudent(); initNotifAdmin(); initFees(); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
