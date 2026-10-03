/* Balsam portal - admin views */
(function () {
  'use strict';
  (function () { var st = document.createElement('style'); st.textContent = "/* admin: match student-side look */\na.ov-chip{color:inherit;transition:transform .15s,border-color .15s}a.ov-chip:hover{transform:translateY(-2px);border-color:#BFD0FA}\n.ov-chip small+small{display:block;color:#9AA3BC}\n.qa-lbl{font-weight:600;color:var(--navy);font-size:13px}\n.qa-row{grid-template-columns:repeat(4,minmax(0,1fr))}\n@media(max-width:1000px){.qa-row{grid-template-columns:repeat(2,minmax(0,1fr))}}\n.tab-b .cnt{display:inline-block;min-width:22px;padding:1px 7px;margin-left:6px;border-radius:99px;background:#EEF2FB;color:var(--muted);font-size:11.5px;text-align:center}\n.tab-b.on .cnt{background:rgba(255,255,255,.25);color:#fff}\n.cell-sub.od{color:#B4332B;font-weight:600}\n.att-tools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}\n.att-tools .multi-q{flex:1;min-width:150px;height:34px}\n.att-sum{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}\n.att-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)}\n.att-row:last-of-type{border-bottom:0}\n.att-who{flex:1;min-width:0}.att-who b{display:block;font-size:13.5px;color:var(--navy)}.att-who span{font-size:12px;color:var(--muted)}\n.pcal button.d{border:0;background:transparent;font:inherit;font-size:12px;cursor:pointer;color:var(--ink)}\n.pcal button.d:hover{background:#EEF3FF}\n.pcal .dgrid .d.full{background:#DCF3E6;color:#146C43;font-weight:600}\n.pcal .dgrid .d.part{background:#FDF0DA;color:#9A5B06;font-weight:600}\n.pcal .dgrid .d.sel,.pcal .dgrid button.d.sel:hover{background:var(--blue);color:#fff;font-weight:600}\n.pcal .dgrid button.d.present,.pcal .dgrid button.d.absent,.pcal .dgrid button.d.leave{color:#fff}\n.pcal-legend i.lw{background:#F59E0B}\n.att-edit{margin-top:12px;padding:12px;border:1px solid #DCE6FF;border-radius:12px;background:#F5F8FF;text-align:center}\n.att-edit b{display:block;font-size:13px;color:var(--navy);margin-bottom:8px}\n.att-edit-b{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}\n.tabs .tab-p .att-wrap{grid-template-columns:340px minmax(0,1fr)}\n@media(max-width:760px){.tabs .tab-p .att-wrap{grid-template-columns:minmax(0,1fr)}.att-row{flex-wrap:wrap}.att-row .seg{width:100%}.seg-o{flex:1;text-align:center}}\n"; document.head.appendChild(st); })();
  var B = window.BP, $ = B.$, $$ = B.$$, esc = B.esc, db = B.db, put = B.put, svg = B.svg, toast = B.toast, fmtIso = B.fmtIso, inr = B.inr;
  if (B.role !== 'admin') return;
  var V = B.views;
  var STATUS = ['Pending', 'Submitted', 'Under Review', 'Revision Required', 'Completed'];
  function q(k) { return new URLSearchParams(location.search).get(k); }
  function val(id) { var e = $('#' + id); return e ? e.value.trim() : ''; }
  function students() { return db().students; }
  function activeStudents() { return students().filter(function (s) { return s.stage === 'active' && s.is_active && s.overall_status === 'Active'; }); }
  function sLink(s) { return 'admin-student-details.html?reg=' + s.registration_number; }
  function sCell(s) { return '<a class="cell-link" href="' + sLink(s) + '">' + esc(s.full_name) + '</a><div class="cell-sub">' + s.registration_number + '</div>'; }
  var TONE = { Pending: 'neutral', Submitted: 'info', 'Under Review': 'warning', 'Revision Required': 'danger', Completed: 'success', Evaluated: 'success', Scheduled: 'warning', Cancelled: 'danger', Issued: 'success', Started: 'info' };
  function stBadge(t) { return B.badge(t, TONE[t] || 'neutral'); }
  function toneOf(t) { return TONE[t] || 'neutral'; }
  function rcIcon(tone) { return { success: '\u2705', warning: '\u23F3', danger: '\u26A0\uFE0F', info: '\uD83D\uDCC4', neutral: '\uD83D\uDCC4' }[tone] || '\uD83D\uDCC4'; }
  function endDate(start, months) { if (!start || !months) return ''; var d = new Date(start + 'T00:00:00'); d.setMonth(d.getMonth() + Number(months)); return B.iso(d); }
  function ensureCourse(d, name) {
    var c = d.courses.filter(function (x) { return x.course_name.toLowerCase() === name.toLowerCase(); })[0];
    if (!c) { c = { course_id: B.nid(d, 'course'), course_name: name, course_code: name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'CRS', duration_weeks: 12, is_active: true }; d.courses.push(c); }
    return c;
  }
  function gate(mid, bid) {
    var box = $('#' + mid), btn = $('#' + bid), form = box && box.closest('.form-grid'); if (!box || !form || !btn) return;
    function upd() { var on = B.multiVals(mid).length > 0; $$('.form-group', form).forEach(function (g) { if (g !== box && !box.contains(g) && !g.contains(box)) { g.style.opacity = on ? '' : '.45'; g.style.pointerEvents = on ? '' : 'none'; } }); btn.disabled = !on; btn.title = on ? '' : 'Choose at least one student first'; }
    box.addEventListener('change', upd); box.addEventListener('click', function () { setTimeout(upd, 0); }); btn.addEventListener('click', function () { setTimeout(upd, 50); }); upd();
  }
  function ensureFaculty(d, name) { if (name && d.faculty.indexOf(name) < 0) d.faculty.push(name); }

  /* ================= shared UI helpers (v2) ================= */
  try { var flashMsg = sessionStorage.getItem('bp_flash'); if (flashMsg) { sessionStorage.removeItem('bp_flash'); setTimeout(function () { toast(flashMsg); }, 350); } } catch (e) { }
  function go(url, msg) { try { if (msg) sessionStorage.setItem('bp_flash', msg); } catch (e) { } location.href = url; }
  function ic(p, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var I = {
    ok: '<polyline points="20 6 9 17 4 12"/>',
    no: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    left: '<polyline points="15 18 9 12 15 6"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    up: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  };
  var DOW3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], FULLD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function backBtn(href, label) { return '<a class="btn btn-outline" href="' + href + '">' + ic(I.back) + label + '</a>'; }

  /* weekly session-day picker (replaces the free-text "Mon-Fri" box) */
  function dayPicker(id, value) {
    var fake = { enr: { slot_days: value } }, on = B.schedDays(fake), order = [1, 2, 3, 4, 5, 6, 0];
    return '<div class="form-group span-2"><label>Session days *</label><div class="daypick"><div class="dp-chips">' +
      order.map(function (i) { return '<button type="button" class="dp-chip' + (on[i] ? ' on' : '') + '" data-day="' + i + '" aria-pressed="' + !!on[i] + '">' + DOW3[i] + '</button>'; }).join('') +
      '</div><div class="dp-pre"><span>Quick set</span><button type="button" class="dp-p" data-preset="1,2,3,4,5">Mon-Fri</button><button type="button" class="dp-p" data-preset="1,2,3,4,5,6">Mon-Sat</button></div>' +
      '<input type="hidden" id="' + id + '" value="' + esc(B.daysLabel(fake)) + '"></div><span class="small-note">Attendance is expected only on these days. Include Saturday or Sunday, or pick any custom pattern per student.</span></div>';
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest ? e.target.closest('.dp-chip,.dp-p') : null; if (!c) return;
    var w = c.closest('.daypick'), chips = $$('.dp-chip', w);
    if (c.classList.contains('dp-p')) { var set = c.getAttribute('data-preset').split(','); chips.forEach(function (x) { x.classList.toggle('on', set.indexOf(x.getAttribute('data-day')) > -1); }); }
    else c.classList.toggle('on');
    var names = chips.filter(function (x) { return x.classList.contains('on'); }).map(function (x) { return DOW3[+x.getAttribute('data-day')]; }).join(', ');
    chips.forEach(function (x) { x.setAttribute('aria-pressed', x.classList.contains('on')); });
    $('input[type=hidden]', w).value = names ? B.daysLabel({ enr: { slot_days: names } }) : '';
  });

  /* full-page form layout (main column + sticky summary) */
  function fpShell(title, sub, back, main, aside) {
    return B.head(title, sub, backBtn(back[0], back[1])) + '<div class="fp"><div class="fp-main">' + main + '</div><aside class="fp-side">' + aside + '</aside></div>';
  }
  function fpSummary(rows, btnId, btnLabel, cancelHref) {
    return '<div class="card fp-card"><div class="card-body"><div class="fp-sh">Summary</div><dl class="fp-sum">' +
      rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd id="' + r[1] + '">' + r[2] + '</dd></div>'; }).join('') +
      '</dl><button type="button" class="btn btn-primary fp-btn" id="' + btnId + '" disabled>' + btnLabel + '</button><a class="btn btn-ghost fp-btn" href="' + cancelHref + '">Cancel</a></div></div>';
  }
  function recipCard(mid, list, sel, title, desc) {
    var seen = {}, courses = [];
    list.forEach(function (s) { var c = s.enr.course_name; if (c && !seen[c]) { seen[c] = 1; courses.push(c); } });
    return B.card(title, (courses.length ? '<div class="rc-chips"><span>Quick select</span>' + courses.map(function (c) { return '<button type="button" class="rc-chip" data-course="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="form-grid">' + B.multi(mid, list, sel, 'Students') + '</div>', { desc: desc });
  }
  function bindRecip(mid, list, onChange) {
    var map = {}; list.forEach(function (s) { map[s.registration_number] = s.enr.course_name; });
    B.bindMulti(mid);
    var box = $('#' + mid);
    function fire() { box.dispatchEvent(new Event('change', { bubbles: true })); }
    $$('.rc-chip').forEach(function (b) {
      b.onclick = function () {
        var c = b.getAttribute('data-course'), boxes = $$('.multi-i input', box).filter(function (i) { return map[i.value] === c; }), all = boxes.every(function (i) { return i.checked; });
        boxes.forEach(function (i) { i.checked = !all; }); b.classList.toggle('on', !all); fire();
      };
    });
    box.addEventListener('change', onChange); box.addEventListener('click', function () { setTimeout(onChange, 0); });
  }
  function nStu(n) { return n ? n + ' student' + (n > 1 ? 's' : '') : 'None selected'; }
  function dlCsv(rows, name) { B.download(new Blob([B.csv(rows)], { type: 'text/csv' }), name); }

  /* ================= alerts (computed from real data) ================= */
  function alerts() {
    var d = db(), ti = B.iso(), wk = new Date().getDay(), in7 = B.iso(new Date(Date.now() + 7 * 864e5)), act = [], rem = [], inf = [], noMark = [], submitted = 0;
    d.students.forEach(function (s) {
      if (!s.is_active || s.overall_status !== 'Active') return;
      var nm = ' (' + s.registration_number + ')';
      if (s.stage === 'new') { if (s.enr.course_start_date && s.enr.course_start_date <= ti) act.push({ t: 'Student not activated', d: s.full_name + nm + ' has reached the joining date but is still onboarding', link: sLink(s) }); return; }
      var b = B.balance(s);
      if (b > 0 && s.enr.next_due_date && s.enr.next_due_date < ti) act.push({ t: 'Student fee overdue', d: s.full_name + nm + ' - ' + inr(b) + ' due since ' + fmtIso(s.enr.next_due_date), link: 'admin-fees.html' });
      else if (b > 0 && s.enr.next_due_date && s.enr.next_due_date <= in7) rem.push({ t: 'Fee due soon', d: s.full_name + nm + ' - ' + inr(b) + ' on ' + fmtIso(s.enr.next_due_date), link: 'admin-fees.html' });
      if (B.isWorkday(s, ti) && (!s.enr.course_start_date || s.enr.course_start_date <= ti) && !s.attendance[ti]) noMark.push(s);
      var a = B.attStats(s); if (a.t >= 5 && a.pct < 75) inf.push({ t: 'Low student attendance', d: s.full_name + nm + ' is at ' + a.pct + '%', link: 'admin-attendance.html' });
      if ((s.enr.progress_percent >= 100 || s.enr.enrollment_status === 'Completed') && s.certificate.status !== 'Issued') act.push({ t: 'Certificate is pending issue', d: s.full_name + nm + ' has completed the course', link: 'admin-certificates.html' });
      if (s.project && s.project.status === 'Submitted') submitted++;
    });
    if (noMark.length) act.unshift({ t: 'Student attendance is not marked', d: noMark.length + ' student' + (noMark.length > 1 ? 's have' : ' has') + ' no entry for today', link: 'admin-attendance.html' });
    d.tasks.forEach(function (t) { if (t.status === 'Submitted') submitted++; });
    if (submitted) act.push({ t: 'Submissions awaiting review', d: submitted + ' assignment/project submission' + (submitted > 1 ? 's' : '') + ' to review', link: 'admin-assignments.html' });
    d.assessments.forEach(function (a) {
      var s = B.stu(a.registration_number, d); if (!s) return;
      if (a.status === 'Scheduled' && a.scheduled_date < ti) act.push({ t: 'Assessment is pending', d: a.title + ' - ' + s.full_name + ' (' + fmtIso(a.scheduled_date) + ') has no result yet', link: 'admin-assessments.html' });
      else if (a.status === 'Scheduled' && a.scheduled_date <= in7) rem.push({ t: 'Assessment due', d: a.title + ' - ' + s.full_name + ' on ' + fmtIso(a.scheduled_date) + ' ' + B.t12(a.scheduled_time), link: 'admin-assessments.html' });
    });
    d.tasks.forEach(function (t) { var s = B.stu(t.registration_number, d); if (!s || t.status !== 'Pending') return; var nm = t.title + ' - ' + s.full_name;
      if (t.due_date < ti) act.push({ t: 'Assignment overdue', d: nm + ' was due ' + fmtIso(t.due_date), link: 'admin-assignments.html' }); else if (t.due_date <= in7) rem.push({ t: 'Assignment due soon', d: nm + ' is due ' + fmtIso(t.due_date), link: 'admin-assignments.html' }); });
    d.students.forEach(function (s) { if (!s.is_active || s.overall_status !== 'Active') return; var nm = s.full_name + ' (' + s.registration_number + ')', p = s.project;
      if (s.stage === 'new' && s.enr.course_start_date && s.enr.course_start_date > ti && s.enr.course_start_date <= in7) rem.push({ t: 'Student joining soon', d: nm + ' joins on ' + fmtIso(s.enr.course_start_date), link: sLink(s) });
      if (p && p.status === 'Pending' && p.due_date) { if (p.due_date < ti) act.push({ t: 'Project overdue', d: nm + ' - ' + (p.title || 'Project') + ' was due ' + fmtIso(p.due_date), link: 'admin-projects.html' }); else if (p.due_date <= in7) rem.push({ t: 'Project due soon', d: nm + ' - ' + (p.title || 'Project') + ' on ' + fmtIso(p.due_date), link: 'admin-projects.html' }); }
      var ks = Object.keys(s.attendance || {}).sort().slice(-3); if (ks.length === 3 && ks.every(function (k) { return s.attendance[k] === 'Absent'; })) inf.push({ t: 'Repeated absence', d: nm + ' was absent for the last 3 marked sessions', link: 'admin-attendance.html' }); });
    d.assessments.forEach(function (a) { var s = B.stu(a.registration_number, d); if (!s) return;
      if (a.status === 'Completed' && a.marks === '') act.push({ t: 'Marks not entered', d: a.title + ' - ' + s.full_name + ' is completed without marks', link: 'admin-assessments.html' });
      if (a.status === 'Completed' && a.marks !== '' && a.marks / (a.max_marks || 100) < 0.4) inf.push({ t: 'Low assessment score', d: a.title + ' - ' + s.full_name + ' scored ' + a.marks + '/' + a.max_marks, link: 'admin-assessments.html' }); });
    return { action: act, remind: rem, alert: inf };
  }
  B.alertCount = function () { return alerts().action.length; };

  /* ================= dashboard ================= */
  function monthBars(d) {
    var now = new Date(), m = [], i, k; for (i = 5; i >= 0; i--) { var x = new Date(now.getFullYear(), now.getMonth() - i, 1); m.push({ key: x.getFullYear() + '-' + B.pad(x.getMonth() + 1), lab: B.MON[x.getMonth()], v: 0 }); }
    d.students.forEach(function (s) { s.payments.forEach(function (p) { k = String(p.payment_date).slice(0, 7); m.forEach(function (b) { if (b.key === k) b.v += Number(p.amount_paid); }); }); });
    var max = Math.max.apply(null, m.map(function (b) { return b.v; }).concat([1]));
    return '<svg class="bars" viewBox="0 0 300 130" role="img" aria-label="Fee collection, last 6 months">' + m.map(function (b, i) {
      var h = Math.round(b.v / max * 80), x = 12 + i * 47;
      return '<rect x="' + x + '" y="' + (94 - h) + '" width="30" height="' + Math.max(h, 2) + '" rx="5" class="' + (i === 5 ? 'bar-now' : 'bar-old') + '"/><text x="' + (x + 15) + '" y="112" text-anchor="middle" class="bar-lab">' + b.lab + '</text>' + (b.v ? '<text x="' + (x + 15) + '" y="' + (88 - h) + '" text-anchor="middle" class="bar-val">' + (b.v >= 1000 ? Math.round(b.v / 1000) + 'k' : b.v) + '</text>' : '');
    }).join('') + '</svg>';
  }
  function arcGauge(pct, tone) {
    var circ = Math.PI * 46, off = circ * (1 - pct / 100);
    return '<svg viewBox="0 0 112 66"><path class="arc-bg" d="M10 56 A46 46 0 0 1 102 56"></path><path class="arc-fg ' + tone + '" d="M10 56 A46 46 0 0 1 102 56" stroke-dasharray="' + circ + '" stroke-dashoffset="' + off + '"></path><text class="arc-val" x="56" y="50">' + pct + '%</text></svg>';
  }
  function qt(em, t, d, href) { return '<a class="qa3" href="' + href + '"><span class="em">' + em + '</span><b>' + t + '</b><span>' + d + '</span></a>'; }
  function eoHead(em, t, link) { return '<div class="eo-head"><span class="em">' + em + '</span>' + t + (link ? '<a class="eo-more" href="' + link[1] + '">' + link[0] + '</a>' : '') + '</div>'; }
  function adRow(l, v, href) { return '<a class="ad-row" href="' + href + '"><span>' + l + '</span><b>' + v + '</b></a>'; }
  V['admin-dashboard.html'] = {
    title: 'Dashboard',
    render: function () {
      var d = db(), ti = B.iso(), all = students(), act = all.filter(function (s) { return s.stage === 'active'; }).length, nw = all.filter(function (s) { return s.stage === 'new'; }).length, done = all.filter(function (s) { return s.overall_status === 'Completed'; }).length;
      var collected = all.reduce(function (a, s) { return a + B.paidSum(s); }, 0), out = all.reduce(function (a, s) { return a + B.balance(s); }, 0), od = all.filter(function (s) { return B.balance(s) > 0 && s.enr.next_due_date && s.enr.next_due_date < ti; }).length;
      var a2 = activeStudents(), marked = a2.filter(function (s) { return s.attendance[ti]; }).length, A = alerts(), todo = A.action.concat(A.alert).slice(0, 6);
      var present = a2.filter(function (s) { return s.attendance[ti] === 'Present'; }).length, mp = a2.length ? Math.round(marked / a2.length * 100) : 0;
      var review = d.tasks.filter(function (t) { return t.status === 'Submitted'; }).length + all.filter(function (s) { return s.project && s.project.status === 'Submitted'; }).length;
      var sched = d.assessments.filter(function (a) { return a.status === 'Scheduled'; }).length, upcoming = [];
      d.assessments.forEach(function (a) { if (a.status === 'Scheduled' && a.scheduled_date >= ti) { var s = B.stu(a.registration_number, d); if (s) upcoming.push({ dt: a.scheduled_date, t: a.title, s: s.full_name, k: 'Assessment' }); } });
      all.forEach(function (s) { if (B.balance(s) > 0 && s.enr.next_due_date && s.enr.next_due_date >= ti) upcoming.push({ dt: s.enr.next_due_date, t: 'Fee due - ' + inr(B.balance(s)), s: s.full_name, k: 'Fee' }); });
      upcoming.sort(function (a, b) { return a.dt < b.dt ? -1 : 1; });
      var tot = collected + out, cp = tot ? Math.round(collected / tot * 100) : 0, tone = !a2.length ? 'warn' : mp === 100 ? '' : mp >= 50 ? 'warn' : 'bad';
      var f = esc((B.me().full_name || 'Admin').split(' ')[0]);
      return '<div class="eo-hi"><span class="wave">👋</span>Welcome back, ' + f + '!</div><p class="eo-sub">Students, attendance, fees and academic activity for ' + fmtIso(ti) + '.</p>' +
        '<div class="eo-grid four">' +
          '<div class="eo-card">' + eoHead('🎓', 'Students', ['View all', 'admin-students.html']) + '<div class="eo-big">' + all.length + '</div><div class="eo-meta"><b>' + act + '</b> active &middot; <b>' + nw + '</b> onboarding &middot; <b>' + done + '</b> completed<br>' + d.courses.length + ' courses in catalog</div><div class="eo-actions"><a class="btn btn-primary" href="admin-student-add.html">Add student</a></div></div>' +
          '<div class="eo-card">' + eoHead('📅', 'Attendance today', ['Open', 'admin-attendance.html']) + '<div class="arc-wrap">' + arcGauge(mp, tone) + '<div><div style="font-size:12.5px;color:var(--muted);font-weight:600;">Marked</div><span class="' + (!a2.length ? 'pill' : mp === 100 ? 'pill ok' : 'pill') + '">' + (!a2.length ? 'No active students' : mp === 100 ? 'All marked' : (a2.length - marked) + ' pending') + '</span></div></div><div class="eo-statbox">Present: <b>' + present + '</b> of ' + a2.length + '</div></div>' +
          '<div class="eo-card">' + eoHead('💳', 'Fee collection', ['Details', 'admin-fees.html']) + '<div class="eo-big good">' + inr(collected) + '</div><div class="eo-meta" style="margin-bottom:10px">collected &middot; <b>' + inr(out) + '</b> outstanding</div><div class="bar"><span style="width:' + cp + '%"></span></div><div class="eo-tagrow"><span class="' + (od ? 'pill bad' : 'pill ok') + '">' + (od ? od + ' overdue' : 'No overdue payments') + '</span></div></div>' +
          '<div class="eo-card">' + eoHead('📚', 'Academic activity') + '<div class="ad-rows">' + adRow('Awaiting review', review, 'admin-assignments.html') + adRow('Assessments scheduled', sched, 'admin-assessments.html') + adRow('Action required', A.action.length, 'admin-notifications.html') + adRow('Reminders &amp; alerts', A.remind.length + A.alert.length, 'admin-notifications.html') + '</div></div>' +
        '</div>' +
        '<div class="sec-h">Quick Actions</div><div class="qa3-grid four">' +
          qt('📅', 'Mark Attendance', 'Daily marking & bulk upload', 'admin-attendance.html') + qt('📋', 'Assign Task', 'Give assignments to students', 'admin-assignment-add.html') + qt('📁', 'Assign Project', 'Project work & reviews', 'admin-project-add.html') + qt('📝', 'Schedule Assessment', 'Tests & evaluations', 'admin-assessment-add.html') +
          qt('📖', 'Add Material', 'Share study resources', 'admin-material-add.html') + qt('💰', 'Record Payment', 'Fees & receipts', 'admin-fees.html') + qt('🔔', 'Send Notification', 'Announce to students', 'admin-notifications.html') + qt('🔄', 'Import / Export', 'CSV data transfer', 'admin-data-transfer.html') +
        '</div>' +
        '<div class="split"><div>' + B.card('Needs attention', todo.length ? todo.map(function (a) { return '<div class="list-row"><span class="dot-s"></span><div><b>' + esc(a.t) + '</b><span>' + esc(a.d) + '</span></div><a class="row-link" href="' + a.link + '">Open</a></div>'; }).join('') : '<div class="empty">Nothing needs attention right now.</div>', { flush: 1, actions: '<a class="link-blue" href="admin-notifications.html">Notification Center &rarr;</a>' }) + '</div><div>' +
        B.card('Fee collection', monthBars(d), { desc: 'Last 6 months' }) + B.card('Upcoming', upcoming.slice(0, 5).map(function (u) { return '<div class="list-row"><div class="date-chip"><b>' + fmtIso(u.dt).slice(0, 2) + '</b><small>' + fmtIso(u.dt).slice(3, 6) + '</small></div><div><b>' + esc(u.t) + '</b><span>' + esc(u.s) + '</span></div>' + B.badge(u.k, u.k === 'Fee' ? 'warning' : 'info') + '</div>'; }).join('') || '<div class="empty">No upcoming items.</div>', { flush: 1 }) + '</div></div>';
    }
  };


  /* ================= students ================= */
  V['admin-students.html'] = {
    title: 'Students',
    render: function () {
      return B.head('Students', 'Manage student records, portal access and status.', '<a class="btn btn-primary" href="admin-student-add.html">' + svg('plus') + 'Add student</a>') +
        B.card('', '<div class="toolbar"><div class="filters"><label class="field">' + svg('user') + '<input type="text" id="sq" placeholder="Search name, reg. no. or username"></label>' +
          '<select id="sf" class="sel-inline"><option value="">All status</option><option>Onboarding</option><option>Active</option><option>Completed</option><option>Dropped</option></select></div></div>' +
          B.table(['Reg. No.', 'Student', 'Course / Faculty', 'Session', 'Status', 'Actions'], '', 'stuRows') + '<div class="table-foot"><span id="stuCount"></span></div>', { flush: 1 });
    },
    init: function () {
      function st(s) { return s.stage === 'new' ? 'Onboarding' : s.overall_status; }
      function draw() {
        var qv = val('sq').toLowerCase(), f = $('#sf').value, l = students().filter(function (s) { return (!qv || (s.full_name + s.registration_number + s.username).toLowerCase().indexOf(qv) > -1) && (!f || st(s) === f); });
        $('#stuRows').innerHTML = l.map(function (s) {
          var k = st(s); return '<tr><td><div class="cell-primary">' + s.registration_number + '</div><div class="cell-sub">' + esc(s.admission_number) + '</div></td><td>' + sCell(s) + '</td><td>' + esc(s.enr.course_name) + '<div class="cell-sub">' + esc(s.enr.faculty_name) + '</div></td>' +
            '<td>' + esc(s.enr.slot_days) + '<div class="cell-sub">' + B.slotText(s) + '</div></td><td>' + B.badge(k, k === 'Active' ? 'success' : k === 'Onboarding' ? 'info' : k === 'Completed' ? 'neutral' : 'danger') + (s.is_active ? '' : ' ' + B.badge('Login off', 'danger')) + '</td>' +
            '<td><div class="row-actions">' + (s.stage === 'new' ? '<button type="button" class="row-link" data-act="' + s.registration_number + '">Activate</button>' : '') + '<a class="row-link" href="' + sLink(s) + '">Edit</a></div></td></tr>';
        }).join('') || B.emptyRow(6, 'No students found.');
        $('#stuCount').textContent = l.length + ' of ' + students().length + ' students';
      }
      if (q('q')) $('#sq').value = q('q');
      $('#sq').oninput = draw; $('#sf').onchange = draw;
      $('#stuRows').onclick = function (e) { var a = e.target.closest('[data-act]'); if (!a) return; var d = db(), s = B.stu(a.getAttribute('data-act'), d); s.stage = 'active'; put(d);
        B.notify({ to: s.registration_number, notification_type: 'Individual Message', title: 'Your student access is active', message: 'Course progress, attendance, fees and assessments are now available on your dashboard.' }); toast(s.full_name + ' is now active'); draw(); };
      draw();
    }
  };
  function studentPersonal(s) {
    var e = s.enr;
    return B.card('Personal details', '<div class="form-grid">' + B.field('fName', 'Full name *', 'text', s.full_name, 'Anitha Kumar') + B.field('fMobile', 'Mobile', 'text', s.mobile, '+91 90000 00000') + B.field('fEmail', 'Email', 'email', s.email, 'student@example.com') +
      B.select('fGender', 'Gender', ['', 'Female', 'Male', 'Other'], s.gender) + B.field('fDob', 'Date of birth', 'date', s.dob) + B.field('fAddr', 'Address', 'text', s.address, 'City, State') +
      B.field('fReg', 'Registration number *', 'text', s.registration_number) + B.field('fAdm', 'Admission number', 'text', s.admission_number) + B.field('fAdmDate', 'Admission date', 'date', s.admission_date) + '</div>');
  }
  function studentCourse(s) {
    var d = db(), e = s.enr;
    return B.card('Course & one-to-one session', '<div class="form-grid"><div class="form-group"><label for="fCourse">Course *</label><input type="text" id="fCourse" list="cList" value="' + esc(e.course_name) + '" placeholder="Select or type a course"><datalist id="cList">' + d.courses.filter(function (c) { return c.is_active; }).map(function (c) { return '<option value="' + esc(c.course_name) + '">'; }).join('') + '</datalist></div>' +
        '<div class="form-group"><label for="fFac">Assigned faculty *</label><input type="text" id="fFac" list="fList" value="' + esc(e.faculty_name) + '" placeholder="Faculty name"><datalist id="fList">' + d.faculty.map(function (f) { return '<option value="' + esc(f) + '">'; }).join('') + '</datalist></div>' +
        B.field('fStart', 'Course start date *', 'date', e.course_start_date) + B.field('fMonths', 'Course duration (months) *', 'number', e.duration_months, '6', '', 'min="1"') + dayPicker('fDays', e.slot_days) +
        B.field('fFrom', 'Session start time *', 'time', e.slot_start_time) + B.field('fTo', 'Session end time *', 'time', e.slot_end_time) + B.field('fFee', 'Net course fee (\u20B9) *', 'number', e.net_fee, '60000', '', 'min="0"') + B.field('fDue', 'Next due date', 'date', e.next_due_date) + '</div>' +
        '<p class="small-note">Timing, duration and fee are set per student - there are no fixed batches.</p>');
  }
  function studentFields(s) { return studentPersonal(s) + studentCourse(s); }
  function readStudent(d, s) {
    var need = { fName: 'full name', fReg: 'registration number', fCourse: 'course', fFac: 'faculty', fStart: 'start date', fMonths: 'duration', fFrom: 'session start time', fTo: 'session end time', fFee: 'net fee' }, k;
    for (k in need) if (!val(k)) { toast('Please enter ' + need[k] + '.'); return false; }
    if (!val('fDays')) { toast('Choose at least one session day.'); return false; }
    if (val('fTo') <= val('fFrom')) { toast('Session end time must be after the start time.'); return false; }
    if (d.students.some(function (x) { return x !== s && x.registration_number.toLowerCase() === val('fReg').toLowerCase(); })) { toast('That registration number already exists.'); return false; }
    var c = ensureCourse(d, val('fCourse')); ensureFaculty(d, val('fFac'));
    s.full_name = val('fName'); s.mobile = val('fMobile'); s.email = val('fEmail'); s.gender = val('fGender'); s.dob = val('fDob'); s.address = val('fAddr'); s.registration_number = val('fReg'); s.admission_number = val('fAdm'); s.admission_date = val('fAdmDate');
    Object.assign(s.enr, { course_id: c.course_id, course_name: c.course_name, faculty_name: val('fFac'), course_start_date: val('fStart'), duration_months: Number(val('fMonths')), course_end_date: endDate(val('fStart'), val('fMonths')), slot_days: val('fDays') || 'Mon-Sat', slot_start_time: val('fFrom'), slot_end_time: val('fTo'), net_fee: Number(val('fFee')), next_due_date: val('fDue') });
    return true;
  }
  V['admin-student-add.html'] = {
    title: 'Add student',
    render: function () {
      var d = db(), n = d.seq.reg + 1, a = d.seq.adm + 1, blank = B.mkStudent({ id: 0, reg: 'REG' + ('00' + n).slice(-3), adm: 'ADM' + a, name: '', course_id: 0, course: '', faculty: '', from: '', to: '', fee: '', start: B.iso(), months: '', user: '', pass: 'x' });
      blank.admission_date = B.iso(); blank.enr.duration_months = ''; blank.enr.net_fee = '';
      return B.head('Add student', 'Create the student record and login. You will hand the credentials to the student.', '<a class="btn btn-outline" href="admin-students.html">Back to students</a>') + '<div id="addWrap">' + studentFields(blank, true) +
        B.card('Login credentials', '<div class="form-grid">' + B.field('fUser', 'Username *', 'text', '', 'auto from name') + '<div class="form-group"><label for="fPass">Password *</label><input type="text" id="fPass" placeholder="Type a password" autocomplete="off"></div>' +
          B.select('fStage', 'Dashboard mode', [['new', 'Onboarding - confirmation only until joining'], ['active', 'Active - full dashboard now']], 'new', 'span-2') + '</div><p class="small-note">The student signs in with these exactly as you set them and cannot change them. You can reset them later from the student record.</p>' +
          '<div class="form-actions"><a class="btn btn-ghost" href="admin-students.html">Cancel</a><button type="button" class="btn btn-primary" id="saveStu">Create student</button></div>') + '</div>';
    },
    init: function () {
      function suggest() { var n = val('fName').toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/)[0]; if (n && !$('#fUser').dataset.touched) $('#fUser').value = n; }
      $('#fName').oninput = suggest; $('#fUser').oninput = function () { this.dataset.touched = 1; };
      $('#saveStu').onclick = function () {
        var d = db(), s = B.mkStudent({ id: B.nid(d, 'student'), reg: 'x', adm: '', name: '', course_id: 0, course: '', faculty: '', from: '00:00', to: '00:00', fee: 0, start: '', months: 0, user: '', pass: 'x' });
        if (!readStudent(d, s)) return;
        var u = val('fUser').toLowerCase().replace(/\s+/g, ''), p = val('fPass'); if (!u || p.length < 4) return toast('Enter a username and a password of at least 4 characters.');
        if (u === d.admin.username || d.students.some(function (x) { return x.username.toLowerCase() === u; })) return toast('That username is already taken.');
        s.username = u; s.password_hash = B.hash(p); s.stage = val('fStage'); s.created_at = Date.now();
        var n = parseInt(s.registration_number.replace(/\D/g, ''), 10); if (n > d.seq.reg) d.seq.reg = n; else d.seq.reg++; var an = parseInt(s.admission_number.replace(/\D/g, ''), 10); if (an > d.seq.adm) d.seq.adm = an;
        d.students.push(s); put(d);
        B.notify({ to: s.registration_number, notification_type: 'Admission Confirmation', title: 'Welcome to Balsam Creative Technology', message: 'Your admission is confirmed.\nCourse: ' + s.enr.course_name + '\nStarts: ' + fmtIso(s.enr.course_start_date) + '\nSession: ' + s.enr.slot_days + ', ' + B.slotText(s) + '\nDuration: ' + s.enr.duration_months + ' months' });
        B.log('students', 'Manual', '', 1);
        $('#addWrap').innerHTML = B.card('Student created', '<p class="small-note" style="margin-bottom:14px">An admission confirmation was sent to the student. Share these login details with them:</p><dl class="cred"><div><dt>Registration number</dt><dd>' + esc(s.registration_number) + '</dd></div><div><dt>Username</dt><dd id="cU">' + esc(u) + '</dd></div><div><dt>Password</dt><dd id="cP">' + esc(p) + '</dd></div><div><dt>Sign-in page</dt><dd>login.html</dd></div></dl>' +
          '<div class="form-actions" style="justify-content:flex-start"><button type="button" class="btn btn-primary" id="copyCred">Copy login details</button><a class="btn btn-outline" href="admin-student-add.html">Add another</a><a class="btn btn-ghost" href="admin-students.html">View students</a></div>');
        $('#copyCred').onclick = function () { var t = 'Balsam Portal login\nUsername: ' + u + '\nPassword: ' + p; if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('Copied'); }, function () { toast('Copy failed - select and copy manually.'); }); else toast('Copy not supported - select and copy manually.'); };
      };
    }
  };
  V['admin-student-details.html'] = {
    title: 'Student record',
    render: function () {
      var s = B.stu(q('reg') || ''); if (!s) return B.head('Student not found', 'No student matches this link.', '<a class="btn btn-outline" href="admin-students.html">Back to students</a>');
      var e = s.enr, a = B.attStats(s), p = e.progress_percent || 0, cs = B.completionStatus(s), bal = B.balance(s), st = s.stage === 'new' ? 'Onboarding' : s.overall_status;
      function st4(ic, tone, l, v, sub) { return '<div class="lo-stat"><div class="lo-stat-t"><small>' + l + '</small><b class="' + tone + '">' + v + '</b><em>' + sub + '</em></div><span class="lo-stat-ic ' + tone + '">' + svg(ic) + '</span></div>'; }
      function ir(l, v) { return '<div class="item"><div class="l">' + l + '</div><div class="v">' + esc(v || '-') + '</div></div>'; }
      var days = Object.keys(s.attendance || {}).sort().slice(-14);
      var dots = days.length ? '<div class="rc-dots">' + days.map(function (k) { var v = s.attendance[k]; return '<span class="rc-dot ' + (v === 'Present' ? 'p' : v === 'Absent' ? 'a' : 'l') + '" title="' + fmtIso(k) + ' - ' + v + '"></span>'; }).join('') + '</div>' : '<p class="small-note">No attendance recorded yet.</p>';
      var overview = '<div class="lo2-top"><div class="eo-card lo2-prog"><div class="fd-h"><span class="fd-t">Course Progress</span>' + B.badge(cs[0], cs[1]) + '</div><div class="fd-hero"><div><div class="fd-big g">' + p + '%</div><div class="fd-sub">of course completed</div></div></div><div class="bar"><span style="width:' + p + '%"></span></div>' +
        '<div class="fd-tip"><i>i</i><span>' + esc(e.course_name) + ' &middot; ' + e.duration_months + ' months</span></div></div>' +
        '<div class="lo2-stats">' + st4('cal', 'g', 'Attendance', a.t ? a.pct + '%' : '-', a.P + ' present &middot; ' + a.A + ' absent') + st4('rupee', bal ? 'o' : 'g', 'Fee balance', inr(bal), bal ? 'Outstanding' : 'Fully paid') + st4('user', 'b', 'Faculty', esc(e.faculty_name), 'Assigned mentor') + st4('clock', 'p', 'Session', esc(e.slot_days), B.slotText(s)) + '</div></div>' +
        '<div class="two-col lo2-two">' + B.card('Course & session', '<div class="info-list">' + ir('Course', e.course_name) + ir('Faculty', e.faculty_name) + ir('Session', e.slot_days + ', ' + B.slotText(s)) + ir('Start date', e.course_start_date ? fmtIso(e.course_start_date) : '') + ir('End date', e.course_end_date ? fmtIso(e.course_end_date) : '') + ir('Next fee due', e.next_due_date ? fmtIso(e.next_due_date) : '') + '</div>') +
        B.card('Recent attendance', dots + '<p style="margin-top:14px"><a class="link-blue" href="admin-attendance-student.html?reg=' + s.registration_number + '">Open attendance calendar &rarr;</a></p>') + '</div>';
      var status = '<div class="form-grid">' + B.select('fStatus', 'Overall status', ['Active', 'Completed', 'Dropped'], s.overall_status) + B.select('fPlace', 'Placement access', [['0', 'Disabled'], ['1', 'Enabled']], s.placement_enabled ? '1' : '0') + '</div>';
      var save = '<div class="form-actions"><button type="button" class="btn btn-danger-o" id="delStu">Delete student</button><button type="button" class="btn btn-primary js-save">Save changes</button></div>';
      var access = '<div class="form-grid">' + B.field('aUser', 'Username', 'text', s.username) + B.select('aStage', 'Dashboard mode', [['new', 'Onboarding'], ['active', 'Active']], s.stage) + B.select('aOn', 'Login', [['1', 'Enabled'], ['0', 'Disabled']], s.is_active ? '1' : '0') +
        '<div class="form-group"><label for="aPass">Set new password</label><input type="text" id="aPass" placeholder="Leave empty to keep current" autocomplete="off"></div></div><p class="small-note">Last sign-in: ' + (s.last_login ? B.fmtTs(s.last_login) : 'never') + '. Passwords are stored hashed and cannot be viewed - set a new one to share with the student.</p><div class="form-actions"><button type="button" class="btn btn-primary" id="saveAcc">Save login access</button></div>';
      return B.head('Student record', 'View and manage this student.', '<a class="btn btn-outline" href="admin-students.html">Back to students</a>') +
        '<div class="card"><div class="card-body"><div class="profile-head"><div class="profile-id"><div class="profile-avatar">' + B.initials(s.full_name) + '</div><div><h2>' + esc(s.full_name) + '</h2><div class="meta">' + s.registration_number + ' &middot; ' + esc(e.course_name) + '</div></div></div>' + B.badge(st, st === 'Active' ? 'success' : st === 'Onboarding' ? 'info' : st === 'Completed' ? 'neutral' : 'danger') + '</div></div></div>' +
        B.tabs('sr', [['overview', 'Overview'], ['profile', 'Profile'], ['course', 'Course & fees'], ['access', 'Login access']], [overview, studentPersonal(s) + '<div class="form-actions"><button type="button" class="btn btn-primary js-save">Save changes</button></div>', studentCourse(s) + B.card('Status', status + save), B.card('Login access', access)]);
    },
    init: function () {
      var reg = q('reg'), s0 = B.stu(reg || ''); if (!s0) return;
      B.bindTabs('sr');
      $$('.js-save').forEach(function (b) { b.onclick = saveStudent; });
      function saveStudent() { var d = db(), s = B.stu(reg, d); if (!readStudent(d, s)) return; s.overall_status = val('fStatus'); s.placement_enabled = val('fPlace') === '1';
        if (s.overall_status === 'Completed') s.enr.enrollment_status = 'Completed'; else if (s.overall_status === 'Dropped') s.enr.enrollment_status = 'Dropped'; else s.enr.enrollment_status = 'Ongoing';
        put(d); B.log('students', 'Manual', '', 1); toast('Saved'); if (s.registration_number !== reg) location.href = 'admin-student-details.html?reg=' + s.registration_number; else setTimeout(function () { location.reload(); }, 350); };
      $('#saveAcc').onclick = function () { var d = db(), s = B.stu(reg, d), u = val('aUser').toLowerCase().replace(/\s+/g, ''), p = val('aPass'); if (!u) return toast('Username is required.');
        if (u === d.admin.username || d.students.some(function (x) { return x !== s && x.username.toLowerCase() === u; })) return toast('That username is already taken.'); if (p && p.length < 4) return toast('Password must be at least 4 characters.');
        s.username = u; s.stage = val('aStage'); s.is_active = val('aOn') === '1'; if (p) s.password_hash = B.hash(p); put(d);
        if (p) { $('#aPass').value = ''; toast('Saved. New password: ' + p + ' (share it with the student)'); } else toast('Login access saved'); };
      $('#delStu').onclick = function () { if (!confirm('Delete ' + s0.full_name + ' and all their records? This cannot be undone.')) return; var d = db();
        d.students = d.students.filter(function (x) { return x.registration_number !== reg; }); d.tasks = d.tasks.filter(function (x) { return x.registration_number !== reg; }); d.assessments = d.assessments.filter(function (x) { return x.registration_number !== reg; });
        d.materials.forEach(function (m) { m.assigned_to = m.assigned_to.filter(function (r) { return r !== reg; }); }); put(d); B.log('students', 'Manual', '', 1); location.href = 'admin-students.html'; };
    }
  };

  /* ================= courses ================= */
  V['admin-courses.html'] = {
    title: 'Courses',
    render: function () {
      return B.head('Courses', 'Course catalogue. Duration, timing and fee are set per student, so these are just defaults.',
        '<a class="btn btn-primary" href="admin-course-add.html">' + svg('plus') + 'Add course</a>') +
        B.card('', '<div class="toolbar"><div class="filters"><label class="field">' + svg('book') + '<input type="text" id="cq" placeholder="Search course name or code"></label>' +
          '<select id="cf" class="sel-inline"><option value="">All status</option><option value="1">Active</option><option value="0">Inactive</option></select></div></div>' +
          B.table(['Code', 'Course', 'Typical duration', 'Students', 'Status', 'Actions'], '', 'cRows') + '<div class="table-foot"><span id="cCount"></span></div>', { flush: 1 });
    },
    init: function () {
      function draw() {
        var d = db(), qv = val('cq').toLowerCase(), f = $('#cf').value;
        var l = d.courses.filter(function (c) { return (!qv || (c.course_name + ' ' + c.course_code).toLowerCase().indexOf(qv) > -1) && (!f || String(+c.is_active) === f); });
        $('#cRows').innerHTML = l.map(function (c) {
          var n = d.students.filter(function (s) { return s.enr.course_id === c.course_id; }).length;
          return '<tr><td><span class="code-chip">' + esc(c.course_code) + '</span></td><td><a class="cell-link" href="admin-course-details.html?id=' + c.course_id + '">' + esc(c.course_name) + '</a>' + (c.description ? '<div class="cell-sub">' + esc(c.description).slice(0, 70) + '</div>' : '') + '</td><td>' + c.duration_weeks + ' weeks</td><td>' + n + '</td><td>' + B.badge(c.is_active ? 'Active' : 'Inactive', c.is_active ? 'success' : 'neutral') +
            '</td><td><div class="row-actions"><a class="row-link" href="admin-course-add.html?id=' + c.course_id + '">Edit</a><button type="button" class="row-link" data-tg="' + c.course_id + '">' + (c.is_active ? 'Deactivate' : 'Activate') + '</button></div></td></tr>';
        }).join('') || B.emptyRow(6, 'No courses found.');
        $('#cCount').textContent = l.length + ' of ' + d.courses.length + ' courses';
      }
      $('#cq').oninput = draw; $('#cf').onchange = draw;
      $('#cRows').onclick = function (e) { var b = e.target.closest('[data-tg]'); if (!b) return; var d = db(), c = d.courses.filter(function (x) { return String(x.course_id) === b.getAttribute('data-tg'); })[0]; c.is_active = !c.is_active; put(d); toast(c.course_name + (c.is_active ? ' activated' : ' deactivated')); draw(); };
      draw();
    }
  };

  V['admin-course-details.html'] = {
    title: 'Course',
    render: function () {
      var d = db(), c = d.courses.filter(function (x) { return String(x.course_id) === q('id'); })[0]; if (!c) return B.head('Course not found', '', '<a class="btn btn-outline" href="admin-courses.html">Back</a>');
      var l = d.students.filter(function (s) { return s.enr.course_id === c.course_id; });
      return B.head(esc(c.course_name), c.course_code + ' &middot; ' + l.length + ' enrolled', '<a class="btn btn-outline" href="admin-courses.html">Back to courses</a>') +
        B.card('Enrolled students', B.table(['Student', 'Faculty', 'Session', 'Progress', 'Status'], l.map(function (s) { return '<tr><td>' + sCell(s) + '</td><td>' + esc(s.enr.faculty_name) + '</td><td>' + esc(s.enr.slot_days) + '<div class="cell-sub">' + B.slotText(s) + '</div></td><td>' + s.enr.progress_percent + '%</td><td>' + B.badge(s.stage === 'new' ? 'Onboarding' : s.overall_status, s.stage === 'new' ? 'info' : 'success') + '</td></tr>'; }).join('') || B.emptyRow(5, 'Nobody is enrolled yet.')), { flush: 1 });
    }
  };

  /* ================= shared helpers for list screens ================= */
  var ALL = function () { return true; };
  var TD = [['All', ALL], ['Pending', function (s) { return s === 'Pending' || s === 'Revision Required'; }], ['Awaiting review', function (s) { return s === 'Submitted' || s === 'Under Review'; }], ['Completed', function (s) { return s === 'Completed'; }]];
  var PD = [['All', ALL], ['Pending', function (s) { return s === 'Pending'; }], ['Awaiting review', function (s) { return s === 'Submitted' || s === 'Under Review'; }], ['Evaluated', function (s) { return s === 'Evaluated'; }]];
  var AD = [['All', ALL], ['Scheduled', function (s) { return s === 'Scheduled'; }], ['Pending', function (s) { return s === 'Pending'; }], ['Completed', function (s) { return s === 'Completed'; }]];
  function ftabs(id, defs) { return '<div class="tabs list-tabs"><div class="tab-list" id="' + id + '">' + defs.map(function (g, k) { return '<button type="button" class="tab-b' + (k ? '' : ' on') + '" data-f="' + k + '">' + g[0] + ' <span class="cnt">0</span></button>'; }).join('') + '</div></div>'; }
  function fbind(id, cb) { var w = $('#' + id); w.onclick = function (e) { var b = e.target.closest('.tab-b'); if (!b) return; $$('.tab-b', w).forEach(function (x) { x.classList.toggle('on', x === b); }); cb(); }; }
  function fcur(id, defs) { var b = $('#' + id + ' .tab-b.on'); return defs[b ? +b.getAttribute('data-f') : 0][1]; }
  function fcount(id, defs, list, get) { $$('#' + id + ' .tab-b').forEach(function (b, k) { $('.cnt', b).textContent = list.filter(function (x) { return defs[k][1](get(x)); }).length; }); }
  function toList(wrap) { var b = $('#' + wrap + ' [data-tab="list"]'); if (b) b.click(); }
  function clearMulti(id) { $$('#' + id + ' input').forEach(function (i) { i.checked = false; }); }
  function longD(dt) { return new Date(dt + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function attBadge(v) { return B.badge(v, v === 'Present' ? 'success' : v === 'Absent' ? 'danger' : 'warning'); }

  /* ================= attendance (v2): daily register + student calendar + bulk upload ================= */
  var AST = {
    Present: { cls: 'p', short: 'P', label: 'Present', ic: ic(I.ok) },
    Absent: { cls: 'a', short: 'A', label: 'Absent', ic: ic(I.no) },
    Leave: { cls: 'l', short: 'L', label: 'Leave / Holiday', ic: ic(I.sun) }
  };
  var STS = ['Present', 'Absent', 'Leave'];
  function isoAdd(iso, n) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return B.iso(d); }
  function weekStart(iso) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return B.iso(d); }
  function dm(iso) { var p = iso.split('-'); return p[2] + ' ' + B.MON[+p[1] - 1]; }
  function lastOfMonth(y, mo) { return y + '-' + B.pad(mo + 1) + '-' + B.pad(new Date(y, mo + 1, 0).getDate()); }
  function normStatus(v) {
    v = String(v || '').trim().toLowerCase();
    if (/^(p|present|yes|y|1)$/.test(v)) return 'Present';
    if (/^(a|absent|no|n|0)$/.test(v)) return 'Absent';
    if (/^(l|lv|leave|h|holiday|hol)$/.test(v)) return 'Leave';
    return '';
  }
  function parseDate(str) {
    str = String(str || '').trim(); var m, y, mo, d;
    if ((m = str.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = str.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/))) { d = +m[1]; mo = +m[2]; y = +m[3]; }
    else return '';
    var dt = new Date(y, mo - 1, d); if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
    return y + '-' + B.pad(mo) + '-' + B.pad(d);
  }
  function started(s, date) { return !s.enr.course_start_date || s.enr.course_start_date <= date; }
  function scheduled(s, date) { return B.isWorkday(s, date) && started(s, date); }
  function pctOf(n, t) { return t ? Math.round(n / t * 100) : 0; }
  function tone(p, t) { return !t ? 'none' : p >= 85 ? 'good' : p >= 75 ? 'ok' : 'low'; }
  function statsFor(s, from, to) {
    var a = s.attendance || {}, P = 0, A = 0, L = 0, k;
    for (k in a) { if ((!from || k >= from) && (!to || k <= to)) { if (a[k] === 'Present') P++; else if (a[k] === 'Absent') A++; else if (a[k] === 'Leave') L++; } }
    return { P: P, A: A, L: L, t: P + A + L, pct: pctOf(P, P + A + L) };
  }
  function missingDays(s, from, to) {
    var out = [], ti = B.iso(), d, n = 0; if (to > ti) to = ti; if (s.enr.course_start_date && from < s.enr.course_start_date) from = s.enr.course_start_date;
    for (d = from; d <= to && n < 400; d = isoAdd(d, 1), n++) if (B.isWorkday(s, d) && !s.attendance[d]) out.push(d);
    return out;
  }
  function recent(s, before, n) { return Object.keys(s.attendance || {}).filter(function (k) { return k < before; }).sort().slice(-n); }
  function attRows() { var r = [['registration_number', 'attendance_date', 'status']]; db().students.forEach(function (s) { Object.keys(s.attendance || {}).sort().forEach(function (k) { r.push([s.registration_number, k, s.attendance[k]]); }); }); return r; }
  function exportAtt() { var rows = attRows(), name = 'attendance-' + B.iso() + '.csv'; dlCsv(rows, name); B.log('daily_attendance', 'Export', name, rows.length - 1); toast('Exported ' + (rows.length - 1) + ' records'); }
  function ring(p, t, size) {
    var c = 2 * Math.PI * 34, off = c * (1 - (t ? p : 0) / 100);
    return '<svg class="ring ' + tone(p, t) + '" viewBox="0 0 80 80" width="' + (size || 96) + '" height="' + (size || 96) + '" role="img" aria-label="Overall attendance ' + (t ? p + ' percent' : 'no records') + '"><circle class="ring-bg" cx="40" cy="40" r="34"/><circle class="ring-fg" cx="40" cy="40" r="34" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 40 40)"/><text x="40" y="45" text-anchor="middle">' + (t ? p + '%' : '-') + '</text></svg>';
  }

  /* ---------- 1. daily register ---------- */
  V['admin-attendance.html'] = V['admin-attendance-add.html'] = {
    title: 'Attendance',
    render: function () {
      return B.head('Attendance', 'Mark the daily register in a few clicks. Sessions follow each student\'s own weekly schedule.',
        '<a class="btn btn-outline" href="admin-attendance-import.html">' + ic(I.up) + 'Bulk upload</a><button type="button" class="btn btn-outline" id="rExp">' + ic(I.dl) + 'Export</button>') +
        '<div id="rKpi"></div><div class="att-grid"><div class="card reg att-main"><div id="rWeek"></div><div class="reg-tools"><label class="field">' + svg('user') + '<input type="text" id="rQ" placeholder="Search by name, reg. no. or course"></label>' +
        '<div class="reg-acts"><button type="button" class="btn btn-outline btn-sm" id="rAll" title="Mark every scheduled student who is still unmarked as present">' + ic(I.ok) + 'All present</button>' +
        '<button type="button" class="btn btn-outline btn-sm" id="rHol" title="Mark every scheduled student as leave / holiday">' + ic(I.sun) + 'Holiday for all</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="rClr">Clear</button></div></div>' +
        '<div class="reg-head"><span>Student</span><span>Session</span><span>Status</span><span>Last 5 days</span></div><div id="rRows"></div>' +
        '<div class="reg-foot">' + ic(I.warn) + '<span>Tip: click a row, then press <kbd>P</kbd> <kbd>A</kbd> or <kbd>L</kbd> to mark, <kbd>&uarr;</kbd> <kbd>&darr;</kbd> to move, <kbd>Ctrl</kbd>+<kbd>S</kbd> to save.</span></div></div><aside class="att-side"><div id="rMonth"></div><div id="rFollow"></div></aside></div><div id="rBar"></div>';
    },
    init: function () {
      var ti = B.iso(), R = { date: (q('date') && q('date') <= ti) ? q('date') : ti, draft: {}, base: {}, f: 'all', q: '', off: false }; R.my = +R.date.slice(0, 4); R.mm = +R.date.slice(5, 7) - 1;
      function act() { return activeStudents(); }
      function split() { var a = act(); return { on: a.filter(function (s) { return scheduled(s, R.date); }), off: a.filter(function (s) { return !scheduled(s, R.date); }) }; }
      function load() { var o = {}; act().forEach(function (s) { if (s.attendance[R.date]) o[s.registration_number] = s.attendance[R.date]; }); R.draft = o; R.base = Object.assign({}, o); }
      function dirty() { var n = 0; act().forEach(function (s) { var r = s.registration_number; if ((R.draft[r] || '') !== (R.base[r] || '')) n++; }); return n; }
      function guard() { return !dirty() || confirm('You have unsaved attendance changes. Discard them?'); }

      function drawWeek() {
        var ws = weekStart(R.date), a = act(), i, days = '', sp = split();
        for (i = 0; i < 7; i++) {
          var dt = isoAdd(ws, i), on = a.filter(function (s) { return scheduled(s, dt); }), n = on.filter(function (s) { return s.attendance[dt]; }).length, g = new Date(dt + 'T00:00:00').getDay(),
            st = !on.length ? 'wd-none' : n === on.length ? 'wd-full' : n ? 'wd-part' : 'wd-empty';
          days += '<button type="button" class="wk-d' + (dt === R.date ? ' on' : '') + (dt === ti ? ' today' : '') + (!on.length ? ' off' : '') + '" data-d="' + dt + '"' + (dt > ti ? ' disabled' : '') + ' title="' + (on.length ? n + ' of ' + on.length + ' marked' : 'No sessions scheduled') + '"><small>' + DOW3[g] + '</small><b>' + (+dt.slice(8)) + '</b><i class="wk-dot ' + st + '"></i></button>';
        }
        $('#rWeek').innerHTML = '<div class="wk"><div class="wk-top"><div><div class="wk-ttl">' + longD(R.date) + (R.date === ti ? ' <span class="wk-now">Today</span>' : '') + '</div><div class="wk-sub">' + sp.on.length + ' session' + (sp.on.length === 1 ? '' : 's') + ' scheduled' + (sp.off.length ? ' &middot; ' + sp.off.length + ' not scheduled' : '') + '</div></div>' +
          '<div class="wk-tools"><label class="wk-pick" title="Jump to any date">' + ic(I.cal) + '<input type="date" id="rDate" value="' + R.date + '" max="' + ti + '"></label><button type="button" class="btn btn-outline btn-sm" id="rToday"' + (R.date === ti ? ' disabled' : '') + '>Today</button></div></div>' +
          '<div class="wk-row"><button type="button" class="wk-nav" data-wk="-1" aria-label="Previous week">' + ic(I.left) + '</button><div class="wk-days">' + days + '</div><button type="button" class="wk-nav" data-wk="1" aria-label="Next week"' + (isoAdd(ws, 7) > ti ? ' disabled' : '') + '>' + ic(I.right) + '</button></div>' +
          '<div class="wk-leg"><span><i class="wk-dot wd-full"></i>All marked</span><span><i class="wk-dot wd-part"></i>Partly marked</span><span><i class="wk-dot wd-empty"></i>Not marked</span><span><i class="wk-dot wd-none"></i>No sessions</span></div></div>';
      }
      function tally() {
        var sp = split(), c = { Present: 0, Absent: 0, Leave: 0 }, un = 0;
        act().forEach(function (s) { var v = R.draft[s.registration_number]; if (v) c[v]++; });
        sp.on.forEach(function (s) { if (!R.draft[s.registration_number]) un++; });
        return { sch: sp.on.length, P: c.Present, A: c.Absent, L: c.Leave, un: un };
      }
      function drawKpi() {
        var t = tally(), tot = t.P + t.A + t.L;
        function tile(f, tn, lab, n, sub, icon) { return '<button type="button" class="lo-stat kpb' + (R.f === f ? ' on' : '') + '" data-f="' + f + '"><div class="lo-stat-t"><small>' + lab + '</small><b class="' + tn + '">' + n + '</b><em>' + sub + '</em></div><span class="lo-stat-ic ' + tn + '">' + icon + '</span></button>'; }
        $('#rKpi').innerHTML = '<div class="lo2-stats four att-kpi">' + tile('Present', 'g', 'Present', t.P, tot ? pctOf(t.P, tot) + '% of marked' : 'Nothing marked yet', ic(I.ok)) + tile('Absent', 'r', 'Absent', t.A, tot ? pctOf(t.A, tot) + '% of marked' : 'Nothing marked yet', ic(I.no)) + tile('Leave', 'o', 'Leave / Holiday', t.L, tot ? pctOf(t.L, tot) + '% of marked' : 'Nothing marked yet', ic(I.sun)) + tile('none', 'p', 'Not marked', t.un, t.sch + ' session' + (t.sch === 1 ? '' : 's') + ' scheduled', svg('clock')) + '</div>';
      }
      function drawMonth() {
        var y = R.my, mo = R.mm, pre = y + '-' + B.pad(mo + 1), lead = (new Date(y, mo, 1).getDay() + 6) % 7, dn = new Date(y, mo + 1, 0).getDate(), a = act(), cells = '', i;
        for (i = 0; i < lead; i++) cells += '<i></i>';
        for (i = 1; i <= dn; i++) {
          var dt = pre + '-' + B.pad(i), on = a.filter(function (s) { return scheduled(s, dt); }), n = on.filter(function (s) { return s.attendance[dt]; }).length, st = !on.length ? 'md-none' : n === on.length ? 'md-full' : n ? 'md-part' : 'md-empty';
          cells += '<button type="button" class="md ' + st + (dt === R.date ? ' sel' : '') + (dt === ti ? ' today' : '') + '" data-d="' + dt + '"' + (dt > ti ? ' disabled' : '') + ' title="' + (on.length ? n + ' of ' + on.length + ' marked' : 'No sessions') + '">' + i + '</button>';
        }
        var nextOk = (mo === 11 ? (y + 1) + '-01' : y + '-' + B.pad(mo + 2)) <= ti.slice(0, 7);
        $('#rMonth').innerHTML = '<div class="card att-cal"><div class="att-cal-h"><b>' + B.MONF[mo] + ' <span>' + y + '</span></b><div><button type="button" data-mn="-1" aria-label="Previous month">' + ic(I.left) + '</button><button type="button" data-mn="1" aria-label="Next month"' + (nextOk ? '' : ' disabled') + '>' + ic(I.right) + '</button></div></div>' +
          '<div class="md-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><div class="md-grid">' + cells + '</div>' +
          '<div class="md-leg"><span><i class="md-full"></i>Complete</span><span><i class="md-part"></i>Partial</span><span><i class="md-empty"></i>Pending</span></div></div>';
      }
      function drawFollow() {
        var l = act().map(function (s) { return { s: s, st: B.attStats(s) }; }).filter(function (x) { return x.st.t && x.st.pct < 75; }).sort(function (a, b) { return a.st.pct - b.st.pct; }).slice(0, 5);
        $('#rFollow').innerHTML = B.card('Needs follow-up', l.length ? l.map(function (x) { return '<a class="fu-row" href="admin-attendance-student.html?reg=' + x.s.registration_number + '"><span class="mini-av">' + B.initials(x.s.full_name) + '</span><span><b>' + esc(x.s.full_name) + '</b><small>' + x.st.A + ' absent &middot; ' + x.st.t + ' recorded</small></span><span class="pill bad">' + x.st.pct + '%</span></a>'; }).join('') : '<div class="fu-ok">' + ic(I.ok) + 'Everyone is at 75% or above.</div>', { flush: 1, desc: 'Below 75% overall' });
      }
      function offWhy(s) { return !started(s, R.date) ? 'Starts ' + dm(s.enr.course_start_date) : 'Off day &middot; ' + B.daysLabel(s); }
      function rowHtml(s, off) {
        var r = s.registration_number, v = R.draft[r] || '', h = recent(s, R.date, 5), dots = '', i;
        for (i = 0; i < 5 - h.length; i++) dots += '<i class="hd"></i>';
        h.forEach(function (k) { var x = s.attendance[k]; dots += '<i class="hd ' + AST[x].cls + '" title="' + dm(k) + ' - ' + x + '"></i>'; });
        return '<div class="rg-row' + (off ? ' off' : '') + '" data-r="' + r + '" data-v="' + v + '" tabindex="0"><div class="mini-av">' + B.initials(s.full_name) + '</div>' +
          '<div class="rg-who"><b>' + esc(s.full_name) + '</b><span>' + r + ' &middot; ' + esc(s.enr.course_name) + '</span></div>' +
          '<div class="rg-time"><b>' + B.slotText(s) + '</b><span>' + (off ? offWhy(s) : B.daysLabel(s)) + '</span></div>' +
          '<div class="rg-ctl" role="group" aria-label="Status for ' + esc(s.full_name) + '">' + STS.map(function (x) { return '<button type="button" class="st ' + AST[x].cls + (v === x ? ' on' : '') + '" data-set="' + x + '" aria-pressed="' + (v === x) + '" title="' + AST[x].label + '">' + AST[x].ic + '<span>' + (x === 'Leave' ? 'Leave' : x) + '</span></button>'; }).join('') + '</div>' +
          '<div class="rg-hist">' + dots + '</div></div>';
      }
      function pass(s) {
        var v = R.draft[s.registration_number] || '';
        if (R.f === 'none' && v) return false; if (R.f !== 'all' && R.f !== 'none' && v !== R.f) return false;
        return !R.q || (s.full_name + ' ' + s.registration_number + ' ' + s.enr.course_name).toLowerCase().indexOf(R.q) > -1;
      }
      function drawRows() {
        var sp = split(), a = act(), on = sp.on.filter(pass), off = sp.off.filter(pass), h = '';
        if (!a.length) { $('#rRows').innerHTML = B.empty('Activate a student first - only active students appear in the register.', 'No active students'); return; }
        if (!sp.on.length) h += '<div class="rg-note">' + ic(I.sun) + '<div><b>No sessions are scheduled for ' + DOW3[new Date(R.date + 'T00:00:00').getDay()] + '</b><span>Nobody\'s weekly schedule includes this day. You can still record a make-up class below.</span></div></div>';
        h += on.map(function (s) { return rowHtml(s, false); }).join('');
        if (!on.length && sp.on.length) h += '<div class="empty" style="padding:26px">No students match this filter.</div>';
        if (off.length) {
          h += '<button type="button" class="rg-off" id="rOffT" aria-expanded="' + R.off + '">' + ic(R.off ? I.right : I.right, R.off ? 'open' : '') + '<b>Not scheduled on this day</b><span>' + off.length + ' student' + (off.length > 1 ? 's' : '') + ' &middot; optional (make-up or extra class)</span></button>';
          if (R.off) h += off.map(function (s) { return rowHtml(s, true); }).join('');
        }
        $('#rRows').innerHTML = h;
      }
      function drawBar() {
        var d = dirty(), t = tally();
        $('#rBar').innerHTML = '<div class="savebar' + (d ? ' dirty' : '') + '"><div class="sb-msg">' + (d ? '<i class="sb-dot"></i><b>' + d + '</b> unsaved change' + (d > 1 ? 's' : '') : (t.un ? '<b>' + t.un + '</b> student' + (t.un > 1 ? 's' : '') + ' still to mark' : ic(I.ok) + 'Register is complete and saved')) + '</div>' +
          '<div class="sb-act"><button type="button" class="btn btn-ghost" id="rDisc"' + (d ? '' : ' disabled') + '>Discard</button><button type="button" class="btn btn-primary" id="rSave"' + (d ? '' : ' disabled') + '>Save attendance</button></div></div>';
      }
      function refresh() { drawKpi(); drawBar(); }
      function paint(r) {
        var row = $('.rg-row[data-r="' + r + '"]'), v = R.draft[r] || ''; if (!row) return; row.setAttribute('data-v', v);
        $$('.st', row).forEach(function (b) { var on = b.getAttribute('data-set') === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      }
      function setStatus(r, v) { if (R.date > ti) return toast('Future dates cannot be marked yet.'); if (v) R.draft[r] = v; else delete R.draft[r]; paint(r); refresh(); }
      function gotoDate(dt) { if (dt > ti) return; if (dt === R.date) return; if (!guard()) return; R.date = dt; R.my = +dt.slice(0, 4); R.mm = +dt.slice(5, 7) - 1; R.f = 'all'; load(); history.replaceState(null, '', '?date=' + dt); drawWeek(); drawMonth(); drawFollow(); refresh(); drawRows(); }
      function save() {
        if (!dirty()) return; var d = db(), k = 0, c = 0;
        d.students.forEach(function (s) {
          if (!(s.stage === 'active' && s.is_active && s.overall_status === 'Active')) return; var r = s.registration_number, v = R.draft[r];
          if (v) { s.attendance[R.date] = v; k++; } else if (s.attendance[R.date]) { delete s.attendance[R.date]; c++; }
        });
        put(d); B.log('daily_attendance', 'Manual', '', k); load(); drawWeek(); drawMonth(); drawFollow(); refresh(); drawRows();
        toast('Attendance saved for ' + fmtIso(R.date) + ' (' + k + ' marked' + (c ? ', ' + c + ' cleared' : '') + ')');
      }

      $('#rWeek').onclick = function (e) {
        var d = e.target.closest('[data-d]'), n = e.target.closest('[data-wk]');
        if (d && !d.disabled) gotoDate(d.getAttribute('data-d'));
        if (n && !n.disabled) { var t = isoAdd(R.date, 7 * +n.getAttribute('data-wk')); gotoDate(t > ti ? ti : t); }
        if (e.target.closest('#rToday')) gotoDate(ti);
      };
      $('#rWeek').onchange = function (e) { if (e.target.id === 'rDate' && e.target.value) gotoDate(e.target.value > ti ? ti : e.target.value); };
      $('#rMonth').onclick = function (e) {
        var d = e.target.closest('[data-d]'), n = e.target.closest('[data-mn]');
        if (d && !d.disabled) gotoDate(d.getAttribute('data-d'));
        if (n && !n.disabled) { R.mm += +n.getAttribute('data-mn'); if (R.mm < 0) { R.mm = 11; R.my--; } if (R.mm > 11) { R.mm = 0; R.my++; } drawMonth(); }
      };
      $('#rKpi').onclick = function (e) { var b = e.target.closest('[data-f]'); if (!b) return; R.f = R.f === b.getAttribute('data-f') ? 'all' : b.getAttribute('data-f'); drawKpi(); drawRows(); };
      $('#rQ').oninput = function () { R.q = this.value.trim().toLowerCase(); drawRows(); };
      $('#rRows').onclick = function (e) {
        var b = e.target.closest('[data-set]'), row = e.target.closest('.rg-row');
        if (b && row) { var r = row.getAttribute('data-r'), v = b.getAttribute('data-set'); setStatus(r, R.draft[r] === v ? '' : v); return; }
        if (e.target.closest('#rOffT')) { R.off = !R.off; drawRows(); }
      };
      $('#rRows').onkeydown = function (e) {
        var row = e.target.closest ? e.target.closest('.rg-row') : null; if (!row || e.ctrlKey || e.metaKey || e.altKey) return; var k = e.key.toLowerCase(), r = row.getAttribute('data-r'), map = { p: 'Present', a: 'Absent', l: 'Leave' };
        if (map[k]) { e.preventDefault(); setStatus(r, R.draft[r] === map[k] ? '' : map[k]); }
        else if (k === 'backspace' || k === 'delete') { e.preventDefault(); setStatus(r, ''); }
        else if (k === 'arrowdown' || k === 'arrowup') { e.preventDefault(); var rows = $$('#rRows .rg-row'), i = rows.indexOf(row) + (k === 'arrowdown' ? 1 : -1); if (rows[i]) rows[i].focus(); }
      };
      $('#rAll').onclick = function () { if (R.date > ti) return toast('Future dates cannot be marked yet.'); split().on.forEach(function (s) { if (!R.draft[s.registration_number]) R.draft[s.registration_number] = 'Present'; }); refresh(); drawRows(); };
      $('#rHol').onclick = function () {
        if (R.date > ti) return toast('Future dates cannot be marked yet.'); var on = split().on; if (!on.length) return toast('Nobody is scheduled on this day.');
        if (on.some(function (s) { var v = R.draft[s.registration_number]; return v && v !== 'Leave'; }) && !confirm('Some students are already marked. Replace them with Leave / Holiday?')) return;
        on.forEach(function (s) { R.draft[s.registration_number] = 'Leave'; }); refresh(); drawRows();
      };
      $('#rClr').onclick = function () { R.draft = {}; refresh(); drawRows(); };
      $('#rBar').onclick = function (e) { if (e.target.closest('#rSave')) save(); if (e.target.closest('#rDisc')) { load(); refresh(); drawRows(); } };
      document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && $('#rSave')) { e.preventDefault(); save(); } });
      window.addEventListener('beforeunload', function (e) { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
      $('#rExp').onclick = exportAtt;
      load(); drawWeek(); drawMonth(); drawFollow(); refresh(); drawRows();
    }
  };

  /* ---------- 2. student calendar + overall percentages ---------- */
  V['admin-attendance-student.html'] = {
    title: 'Attendance',
    render: function () {
      return B.head('Student attendance', 'Open a student to see their calendar, overall percentages, and to correct any day.',
        '<a class="btn btn-outline" href="admin-attendance-import.html">' + ic(I.up) + 'Bulk upload</a><button type="button" class="btn btn-outline" id="sExp">' + ic(I.dl) + 'Export</button>') +
        '<div class="ms"><aside class="card ms-side"><div class="ms-top"><label class="field">' + svg('user') + '<input type="text" id="msQ" placeholder="Search student"></label>' +
        '<div class="seg2" id="msSort"><button type="button" class="on" data-sort="name">A-Z</button><button type="button" data-sort="low">Lowest first</button></div></div><div class="ms-sum" id="msSum"></div><div class="ms-list" id="msList"></div></aside><section class="ms-main" id="msMain"></section></div>';
    },
    init: function () {
      var now = new Date(), ti = B.iso(), first = activeStudents()[0], S = { reg: q('reg') || (first ? first.registration_number : ''), y: now.getFullYear(), mo: now.getMonth(), edit: '', per: 'month', q: '', sort: 'name' };
      function classStats() { return activeStudents().map(function (s) { return { s: s, st: B.attStats(s) }; }); }
      function drawList() {
        var all = classStats(), rec = all.filter(function (x) { return x.st.t; }), avg = rec.length ? Math.round(rec.reduce(function (a, x) { return a + x.st.pct; }, 0) / rec.length) : 0, low = rec.filter(function (x) { return x.st.pct < 75; }).length;
        $('#msSum').innerHTML = rec.length ? 'Class average <b>' + avg + '%</b><span class="' + (low ? 'bad' : 'good') + '">' + (low ? low + ' below 75%' : 'All above 75%') + '</span>' : 'No attendance recorded yet';
        var l = all.filter(function (x) { return !S.q || (x.s.full_name + ' ' + x.s.registration_number + ' ' + x.s.enr.course_name).toLowerCase().indexOf(S.q) > -1; });
        l.sort(function (a, b) { return S.sort === 'low' ? ((a.st.t ? a.st.pct : 101) - (b.st.t ? b.st.pct : 101)) || a.s.full_name.localeCompare(b.s.full_name) : a.s.full_name.localeCompare(b.s.full_name); });
        $('#msList').innerHTML = l.map(function (x) {
          return '<button type="button" class="ms-i' + (x.s.registration_number === S.reg ? ' on' : '') + '" data-r="' + x.s.registration_number + '"><span class="mini-av">' + B.initials(x.s.full_name) + '</span><span class="ms-n"><b>' + esc(x.s.full_name) + '</b><small>' + x.s.registration_number + ' &middot; ' + esc(x.s.enr.course_name) + '</small></span><span class="pill ' + tone(x.st.pct, x.st.t) + '">' + (x.st.t ? x.st.pct + '%' : '-') + '</span></button>';
        }).join('') || '<div class="empty" style="padding:24px">No students found.</div>';
      }
      function tile(cls, lab, n, p, sub, icon) { return '<div class="ss ' + cls + '"><div class="ss-top"><span>' + lab + '</span><i>' + icon + '</i></div><b>' + n + '</b><div class="ss-bar"><span style="width:' + p + '%"></span></div><small>' + sub + '</small></div>'; }
      function drawMain() {
        var s = S.reg ? B.stu(S.reg) : null, host = $('#msMain');
        if (!s) { host.innerHTML = '<div class="card">' + B.empty('Choose a student from the list to see their attendance.', 'No student selected') + '</div>'; return; }
        var y = S.y, mo = S.mo, pre = y + '-' + B.pad(mo + 1), from = pre + '-01', to = lastOfMonth(y, mo), all = B.attStats(s), st = S.per === 'month' ? statsFor(s, from, to) : statsFor(s), miss = missingDays(s, from, to), sched = B.schedDays(s);
        var dayset = [1, 2, 3, 4, 5, 6, 0].map(function (i) { return '<span class="' + (sched[i] ? 'on' : '') + '" title="' + DOW3[i] + (sched[i] ? ' - session day' : ' - off') + '">' + DOW3[i][0] + '</span>'; }).join('');
        var h = '<div class="card sp"><div class="sp-l"><span class="mini-av lg">' + B.initials(s.full_name) + '</span><div><h2><a href="' + sLink(s) + '">' + esc(s.full_name) + '</a></h2><p>' + s.registration_number + ' &middot; ' + esc(s.enr.course_name) + ' &middot; ' + esc(s.enr.faculty_name) + '</p>' +
          '<div class="dayset">' + dayset + '<em>' + B.daysLabel(s) + ' &middot; ' + B.slotText(s) + '</em></div></div></div><div class="sp-r">' + ring(all.pct, all.t, 92) + '<div><b>Overall attendance</b><small>' + (all.t ? all.P + ' present of ' + all.t + ' recorded' : 'No records yet') + '</small>' + (all.t ? B.badge(all.pct >= 75 ? 'Above 75%' : 'Below 75%', all.pct >= 75 ? 'success' : 'danger') : '') + '</div></div></div>';
        h += '<div class="ss-h"><h3>Attendance summary</h3><div class="seg2" id="msPer"><button type="button" data-per="month" class="' + (S.per === 'month' ? 'on' : '') + '">' + B.MONF[mo] + ' ' + y + '</button><button type="button" data-per="all" class="' + (S.per === 'all' ? 'on' : '') + '">All time</button></div></div>';
        var sub = function (p) { return st.t ? p + '% of ' + st.t + ' recorded' : 'Nothing recorded'; };
        h += '<div class="ss-row">' + tile('p', 'Present', st.P, pctOf(st.P, st.t), sub(pctOf(st.P, st.t)), ic(I.ok)) + tile('a', 'Absent', st.A, pctOf(st.A, st.t), sub(pctOf(st.A, st.t)), ic(I.no)) + tile('l', 'Leave / Holiday', st.L, pctOf(st.L, st.t), sub(pctOf(st.L, st.t)), ic(I.sun)) +
          (S.per === 'month' ? tile('n', 'Not marked', miss.length, 0, miss.length ? 'Scheduled days with no entry' : 'Every scheduled day is marked', svg('clock')) : tile('n', 'Recorded', st.t, 0, 'Sessions on record', svg('clock'))) + '</div>';

        /* calendar */
        var lead = (new Date(y, mo, 1).getDay() + 6) % 7, dn = new Date(y, mo + 1, 0).getDate(), cells = '', i;
        for (i = 0; i < lead; i++) cells += '<i></i>';
        for (i = 1; i <= dn; i++) {
          var dt = pre + '-' + B.pad(i), v = s.attendance[dt] || '', sc = scheduled(s, dt), fut = dt > ti;
          cells += '<button type="button" class="cd' + (v ? ' ' + AST[v].cls : '') + (!sc ? ' nosch' : '') + (dt === ti ? ' today' : '') + (dt === S.edit ? ' sel' : '') + (!v && sc && !fut ? ' miss' : '') + (fut ? ' fut' : '') + '" data-d="' + dt + '"' + (fut ? ' disabled' : '') + ' title="' + longD(dt) + (v ? ' - ' + AST[v].label : sc ? (fut ? '' : ' - not marked') : ' - not a session day') + '"><span class="cd-n">' + i + '</span>' + (v ? '<span class="cd-s">' + AST[v].short + '</span>' : '') + '</button>';
        }
        var ed = '';
        if (S.edit) {
          var cur = s.attendance[S.edit] || '';
          ed = '<div class="cal2-ed"><div><b>' + longD(S.edit) + '</b><small>' + (scheduled(s, S.edit) ? 'Scheduled session' : 'Not a scheduled day for this student - marking it records an extra session.') + '</small></div><div class="cal2-eb">' +
            STS.map(function (x) { return '<button type="button" class="st ' + AST[x].cls + (cur === x ? ' on' : '') + '" data-set="' + x + '">' + AST[x].ic + '<span>' + x + '</span></button>'; }).join('') +
            '<button type="button" class="btn btn-ghost btn-sm" data-set="">Clear</button><button type="button" class="btn btn-ghost btn-sm" data-set="__close">Close</button></div></div>';
        }
        h += '<div class="card cal2"><div class="cal2-h"><div class="cal2-t"><b>' + B.MONF[mo] + '</b><span>' + y + '</span></div><div class="cal2-n"><button type="button" data-nav="-1" aria-label="Previous month">' + ic(I.left) + '</button><button type="button" class="tdy" data-today="1">Today</button><button type="button" data-nav="1" aria-label="Next month">' + ic(I.right) + '</button></div></div>' +
          '<div class="cal2-dow"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div class="cal2-grid">' + cells + '</div>' +
          '<div class="cal2-leg"><span><i class="p"></i>Present</span><span><i class="a"></i>Absent</span><span><i class="l"></i>Leave / Holiday</span><span><i class="m"></i>Not marked</span><span><i class="x"></i>Not a session day</span></div>' + ed + '</div>';

        /* trend + records */
        var bars = '', k;
        for (k = 5; k >= 0; k--) { var dd = new Date(y, mo - k, 1), pf = dd.getFullYear() + '-' + B.pad(dd.getMonth() + 1), ms = statsFor(s, pf + '-01', pf + '-31'); bars += '<div class="tr' + (k === 0 ? ' on' : '') + '"><div class="tr-c"><span class="' + tone(ms.pct, ms.t) + '" style="height:' + (ms.t ? Math.max(ms.pct, 4) : 0) + '%"></span></div><b>' + (ms.t ? ms.pct + '%' : '-') + '</b><small>' + B.MON[dd.getMonth()] + '</small></div>'; }
        var recs = Object.keys(s.attendance).filter(function (x) { return x.indexOf(pre) === 0; }).sort().reverse();
        h += '<div class="ms-two"><div class="card"><div class="card-head"><div><h3>Monthly trend</h3><div class="desc">Present share of recorded sessions, last 6 months</div></div></div><div class="card-body"><div class="tr-row">' + bars + '</div></div></div>' +
          '<div class="card"><div class="card-head"><div><h3>' + B.MONF[mo] + ' record</h3><div class="desc">' + recs.length + ' entr' + (recs.length === 1 ? 'y' : 'ies') + '</div></div></div><div class="card-body pad-0"><div class="log2">' +
          (recs.map(function (x) { var w = new Date(x + 'T00:00:00').getDay(); return '<button type="button" class="log2-r" data-d="' + x + '"><span class="log2-d"><b>' + x.slice(8) + '</b>' + DOW3[w] + '</span><span class="log2-l">' + FULLD[w] + '</span>' + B.badge(AST[s.attendance[x]].label, s.attendance[x] === 'Present' ? 'success' : s.attendance[x] === 'Absent' ? 'danger' : 'warning') + '</button>'; }).join('') || '<div class="empty" style="padding:26px">No attendance recorded this month.</div>') + '</div></div></div></div>';
        if (miss.length) h += '<div class="card miss"><div class="card-body"><div class="miss-h"><div><b>' + miss.length + ' scheduled day' + (miss.length > 1 ? 's' : '') + ' not marked in ' + B.MONF[mo] + '</b><small>Tap a date to fill it in, or mark them all in one go.</small></div><button type="button" class="btn btn-outline btn-sm" id="msFill">Mark all present</button></div><div class="miss-chips">' + miss.map(function (x) { return '<button type="button" data-d="' + x + '">' + DOW3[new Date(x + 'T00:00:00').getDay()] + ' ' + x.slice(8) + '</button>'; }).join('') + '</div></div></div>';
        host.innerHTML = h;
      }
      function pick(r) { S.reg = r; S.edit = ''; history.replaceState(null, '', '?reg=' + r); drawList(); drawMain(); }
      $('#msList').onclick = function (e) { var b = e.target.closest('[data-r]'); if (b) pick(b.getAttribute('data-r')); };
      $('#msQ').oninput = function () { S.q = this.value.trim().toLowerCase(); drawList(); };
      $('#msSort').onclick = function (e) { var b = e.target.closest('[data-sort]'); if (!b) return; S.sort = b.getAttribute('data-sort'); $$('#msSort button').forEach(function (x) { x.classList.toggle('on', x === b); }); drawList(); };
      $('#msMain').onclick = function (e) {
        var n = e.target.closest('[data-nav]'), t = e.target.closest('[data-today]'), d = e.target.closest('[data-d]'), set = e.target.closest('[data-set]'), per = e.target.closest('[data-per]');
        if (n) { S.mo += +n.getAttribute('data-nav'); if (S.mo < 0) { S.mo = 11; S.y--; } if (S.mo > 11) { S.mo = 0; S.y++; } S.edit = ''; drawMain(); }
        else if (t) { S.y = now.getFullYear(); S.mo = now.getMonth(); S.edit = ''; drawMain(); }
        else if (per) { S.per = per.getAttribute('data-per'); drawMain(); }
        else if (set) {
          var v = set.getAttribute('data-set'); if (v === '__close') { S.edit = ''; drawMain(); return; }
          var dd = db(), s = B.stu(S.reg, dd); if (v) s.attendance[S.edit] = v; else delete s.attendance[S.edit];
          put(dd); B.log('daily_attendance', 'Manual', '', 1); toast(v ? fmtIso(S.edit) + ' marked ' + v : 'Entry cleared for ' + fmtIso(S.edit)); S.edit = ''; drawList(); drawMain();
        }
        else if (e.target.closest('#msFill')) {
          var ds = db(), st2 = B.stu(S.reg, ds), pre2 = S.y + '-' + B.pad(S.mo + 1), ms2 = missingDays(st2, pre2 + '-01', lastOfMonth(S.y, S.mo));
          if (!ms2.length || !confirm('Mark ' + ms2.length + ' day' + (ms2.length > 1 ? 's' : '') + ' as Present for ' + st2.full_name + '?')) return;
          ms2.forEach(function (x) { st2.attendance[x] = 'Present'; }); put(ds); B.log('daily_attendance', 'Manual', '', ms2.length); toast(ms2.length + ' days marked present'); drawList(); drawMain();
        }
        else if (d && !d.disabled) { var dt2 = d.getAttribute('data-d'); if (dt2.slice(0, 7) !== S.y + '-' + B.pad(S.mo + 1)) return; S.edit = S.edit === dt2 ? '' : dt2; drawMain(); var ed = $('.cal2-ed'); if (ed && ed.scrollIntoView) ed.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      };
      $('#sExp').onclick = exportAtt;
      drawList(); drawMain();
    }
  };

  /* ---------- 3. bulk upload ---------- */
  V['admin-attendance-import.html'] = {
    title: 'Bulk upload',
    render: function () {
      var nowM = B.iso().slice(0, 7);
      var main =
        B.card('1. Download a template', '<div class="fmt" id="fmtPick"><label class="fmt-o on"><input type="radio" name="fmt" value="sheet" checked><span class="fmt-t"><b>Monthly sheet</b><small>One row per student, one column per date. Fastest for a whole month.</small></span></label>' +
          '<label class="fmt-o"><input type="radio" name="fmt" value="list"><span class="fmt-t"><b>Daily list</b><small>One row per student per date. Best for exports from other systems.</small></span></label></div>' +
          '<div class="form-grid" style="margin-top:16px">' + B.field('tplMonth', 'Month', 'month', nowM, '', '', 'max="' + nowM + '"') + '<div class="form-group"><label>&nbsp;</label><button type="button" class="btn btn-outline" id="tplBtn" style="width:100%;justify-content:center">' + ic(I.dl) + 'Download template</button></div></div>' +
          '<p class="small-note" style="margin-top:10px">The template is pre-filled with the current month\'s existing marks, so you can correct and re-upload safely.</p>', { desc: 'Only active students are included.' }) +
        B.card('2. Upload your file', '<label class="drop" id="drop"><input type="file" id="impFile" accept=".csv,text/csv" hidden>' + ic(I.up) + '<b>Drop your CSV here, or click to browse</b><small>Excel users: File &rsaquo; Save As &rsaquo; CSV (UTF-8)</small></label><div id="impFileInfo"></div>') +
        '<div id="impPreview"></div>';
      var aside = '<div class="card fp-card"><div class="card-body"><div class="fp-sh">Accepted values</div><div class="acc"><div><span class="pill good">P</span><span>Present, P, Yes</span></div><div><span class="pill low">A</span><span>Absent, A, No</span></div><div><span class="pill ok">L</span><span>Leave, L, Holiday, H</span></div></div>' +
        '<ul class="tips"><li>Blank cells are ignored - existing marks stay as they are.</li><li>Dates can be <code>2026-09-30</code> or <code>30-09-2026</code>.</li><li>Future dates are rejected.</li><li>Off-schedule days are allowed (make-up classes) and flagged for review.</li></ul></div></div>' +
        '<div class="card fp-card" id="impHist"></div>';
      return fpShell('Bulk upload attendance', 'Fill a month at once from a spreadsheet. You will review everything before it is saved.', ['admin-attendance.html', 'Back to register'], main, aside);
    },
    init: function () {
      var ti = B.iso(), P = null, lastName = '';
      function activeMap() { var m = {}; activeStudents().forEach(function (s) { m[s.registration_number.toLowerCase()] = s; }); return m; }
      function fmt() { var r = $('input[name=fmt]:checked'); return r ? r.value : 'sheet'; }
      $('#fmtPick').onchange = function () { $$('.fmt-o').forEach(function (l) { l.classList.toggle('on', $('input', l).checked); }); };
      function histDraw() {
        var l = db().logs.filter(function (x) { return x.table_name === 'daily_attendance' && x.direction === 'Import'; }).slice(0, 3);
        $('#impHist').innerHTML = '<div class="card-body"><div class="fp-sh">Recent uploads</div>' + (l.length ? l.map(function (x) { return '<div class="hist"><b>' + esc(x.file_name || 'file') + '</b><span>' + x.record_count + ' records &middot; ' + B.fmtTs(x.performed_at) + '</span></div>'; }).join('') : '<p class="small-note">No bulk uploads yet.</p>') + '</div>';
      }
      $('#tplBtn').onclick = function () {
        var m = val('tplMonth') || ti.slice(0, 7), y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1, n = new Date(y, mo + 1, 0).getDate(), a = activeStudents(), rows, d, i;
        if (!a.length) return toast('There are no active students yet.');
        if (fmt() === 'sheet') {
          var head = ['registration_number', 'full_name']; for (i = 1; i <= n; i++) head.push(m + '-' + B.pad(i)); rows = [head];
          a.forEach(function (s) { var r = [s.registration_number, s.full_name]; for (i = 1; i <= n; i++) { d = m + '-' + B.pad(i); r.push(s.attendance[d] || ''); } rows.push(r); });
        } else {
          rows = [['registration_number', 'full_name', 'attendance_date', 'status']];
          a.forEach(function (s) { for (i = 1; i <= n; i++) { d = m + '-' + B.pad(i); if (d <= ti && (scheduled(s, d) || s.attendance[d])) rows.push([s.registration_number, s.full_name, d, s.attendance[d] || '']); } });
        }
        dlCsv(rows, 'attendance-' + fmt() + '-' + m + '.csv'); toast('Template downloaded');
      };

      function parse(text) {
        var rows = B.csvParse(String(text).replace(/^\uFEFF/, '')), map = activeMap(), out = { recs: [], issues: [], read: 0, mode: '' };
        if (!rows.length) { out.err = 'The file is empty.'; return out; }
        var raw = rows.shift().map(function (x) { return String(x).trim(); }), hdr = raw.map(function (x) { return x.toLowerCase().replace(/\s+/g, '_'); }), iReg = -1;
        ['registration_number', 'reg_no', 'regno', 'reg', 'registration'].forEach(function (k) { if (iReg < 0) iReg = hdr.indexOf(k); });
        if (iReg < 0) { out.err = 'Could not find a "registration_number" column in the first row.'; return out; }
        var iDate = hdr.indexOf('attendance_date'), iSt = hdr.indexOf('status'), seen = {};
        function add(rn, reg, dateRaw, stRaw, blankOk) {
          var s = map[String(reg || '').toLowerCase()], dt = parseDate(dateRaw), v = normStatus(stRaw);
          if (!String(stRaw || '').trim() && blankOk) return; out.read++;
          if (!reg) return out.issues.push({ row: rn, msg: 'Missing registration number' });
          if (!s) return out.issues.push({ row: rn, msg: reg + ' is not an active student' });
          if (!dt) return out.issues.push({ row: rn, msg: 'Invalid date "' + dateRaw + '"' });
          if (dt > ti) return out.issues.push({ row: rn, msg: reg + ': ' + fmtIso(dt) + ' is in the future' });
          if (!v) return out.issues.push({ row: rn, msg: reg + ' ' + fmtIso(dt) + ': unknown status "' + stRaw + '"' });
          var key = s.registration_number + '|' + dt; if (seen[key] !== undefined) out.recs[seen[key]] = null; seen[key] = out.recs.length;
          out.recs.push({ s: s, date: dt, v: v, row: rn, off: !scheduled(s, dt), cur: s.attendance[dt] || '' });
        }
        if (iDate > -1 && iSt > -1) { out.mode = 'Daily list'; rows.forEach(function (r, n) { add(n + 2, String(r[iReg] || '').trim(), r[iDate], r[iSt], true); }); }
        else {
          var cols = []; raw.forEach(function (h, i) { var d = parseDate(h); if (d) cols.push([i, d]); });
          if (!cols.length) { out.err = 'No date columns found. Use the downloaded template, or a file with attendance_date and status columns.'; return out; }
          out.mode = 'Monthly sheet'; rows.forEach(function (r, n) { var reg = String(r[iReg] || '').trim(); if (!reg && !r.join('').trim()) return; cols.forEach(function (c) { add(n + 2, reg, c[1], r[c[0]], true); }); });
        }
        out.recs = out.recs.filter(Boolean); return out;
      }
      function plan() {
        var rep = $('#optRep') ? $('#optRep').checked : true, off = $('#optOff') ? $('#optOff').checked : true, c = { add: 0, chg: 0, same: 0, off: 0, skip: 0 }, go2 = [];
        P.recs.forEach(function (r) {
          if (r.off && !off) { c.skip++; return; }
          if (!r.cur) { c.add++; go2.push(r); } else if (r.cur === r.v) { c.same++; } else if (rep) { c.chg++; go2.push(r); } else c.skip++;
          if (r.off) c.off++;
        });
        P.go = go2; P.c = c;
      }
      function drawPreview() {
        plan(); var c = P.c, n = P.go.length;
        var iss = P.issues.slice(0, 8).map(function (x) { return '<tr><td>Row ' + x.row + '</td><td>' + esc(x.msg) + '</td></tr>'; }).join('');
        $('#impPreview').innerHTML = B.card('3. Review and import', '<div class="pv-row"><div class="pv good"><b>' + c.add + '</b><small>New entries</small></div><div class="pv ok"><b>' + c.chg + '</b><small>Will overwrite</small></div><div class="pv"><b>' + c.same + '</b><small>Unchanged</small></div><div class="pv ' + (P.issues.length ? 'low' : '') + '"><b>' + P.issues.length + '</b><small>Rows with problems</small></div></div>' +
          '<div class="opts"><label><input type="checkbox" id="optRep" ' + (P.rep === false ? '' : 'checked') + '> Replace existing entries when the file differs</label><label><input type="checkbox" id="optOff" ' + (P.off === false ? '' : 'checked') + '> Allow entries on days outside a student\'s schedule' + (c.off ? ' <em>(' + c.off + ' in this file)</em>' : '') + '</label></div>' +
          (P.issues.length ? '<div class="iss"><div class="iss-h">' + ic(I.warn) + '<b>' + P.issues.length + ' row' + (P.issues.length > 1 ? 's' : '') + ' will be skipped</b></div><table class="data-table"><tbody>' + iss + '</tbody></table>' + (P.issues.length > 8 ? '<small>and ' + (P.issues.length - 8) + ' more</small>' : '') + '</div>' : '') +
          '<div class="form-actions"><a class="btn btn-ghost" href="admin-attendance.html">Cancel</a><button type="button" class="btn btn-primary" id="impGo"' + (n ? '' : ' disabled') + '>Import ' + n + ' record' + (n === 1 ? '' : 's') + '</button></div>', { desc: P.mode + ' &middot; ' + P.read + ' cell' + (P.read === 1 ? '' : 's') + ' read from ' + esc(lastName) });
        $('#optRep').checked = P.rep !== false; $('#optOff').checked = P.off !== false;
      }
      function handle(f) {
        if (!f) return; lastName = f.name;
        var rd = new FileReader(); rd.onload = function () {
          P = parse(rd.result); $('#impFileInfo').innerHTML = '<div class="fileinfo">' + ic(I.file) + '<div><b>' + esc(f.name) + '</b><small>' + Math.max(1, Math.round(f.size / 1024)) + ' KB</small></div></div>';
          if (P.err) { $('#impPreview').innerHTML = '<div class="card"><div class="card-body"><div class="iss"><div class="iss-h">' + ic(I.warn) + '<b>' + esc(P.err) + '</b></div></div></div></div>'; P = null; return; }
          P.rep = true; P.off = true; drawPreview();
        }; rd.readAsText(f);
      }
      $('#impFile').onchange = function () { handle(this.files[0]); this.value = ''; };
      var dz = $('#drop'); ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); }); });
      dz.addEventListener('drop', function (e) { handle(e.dataTransfer.files[0]); });
      $('#impPreview').onchange = function (e) { if (!P) return; if (e.target.id === 'optRep') P.rep = e.target.checked; if (e.target.id === 'optOff') P.off = e.target.checked; drawPreview(); };
      $('#impPreview').onclick = function (e) {
        if (!e.target.closest('#impGo') || !P) return; var d = db(), k = 0;
        P.go.forEach(function (r) { var s = B.stu(r.s.registration_number, d); if (s) { s.attendance[r.date] = r.v; k++; } });
        put(d); B.log('daily_attendance', 'Import', lastName, k, P.issues.length ? 'Partial' : 'Success');
        $('#impPreview').innerHTML = '<div class="card done"><div class="card-body">' + ic(I.ok) + '<h3>' + k + ' attendance record' + (k === 1 ? '' : 's') + ' imported</h3><p>' + (P.issues.length ? P.issues.length + ' row' + (P.issues.length > 1 ? 's were' : ' was') + ' skipped because of problems.' : 'Everything in the file was valid.') + '</p><div class="form-actions" style="justify-content:center;border:0"><a class="btn btn-outline" href="admin-attendance-import.html">Upload another</a><a class="btn btn-primary" href="admin-attendance-student.html">View student calendars</a></div></div></div>';
        P = null; histDraw(); toast(k + ' records imported');
      };
      histDraw();
    }
  };

  /* ================= learning materials ================= */
  V['admin-materials.html'] = {
    title: 'Learning Materials',
    render: function () {
      var list = B.card('', '<div class="rc-list" id="mRows"></div>', { flush: 1 }) + '<div id="accessPanel"></div>';
      return B.head('Learning materials', 'Share notes, files and links with the students who need them.', '<a class="btn btn-primary" href="admin-material-add.html">' + svg('plus') + 'Add material</a>') + list;
    },
    init: function () {
      
      function who(m) { var d = db(), n = m.assigned_to.map(function (r) { var s = B.stu(r, d); return s ? s.full_name : r; }); return n.length ? esc(n.slice(0, 2).join(', ')) + (n.length > 2 ? ' <span class="muted">+' + (n.length - 2) + ' more</span>' : '') : '<span class="muted">Nobody yet</span>'; }
      function draw() { var l = db().materials; $('#mRows').innerHTML = l.map(function (m) {
        return '<div class="rc" data-tone="info"><div class="rc-ic info">\uD83D\uDCC4</div><div class="rc-main"><div class="rc-top"><b>' + esc(m.title) + '</b>' + B.badge(m.type || 'PDF', 'info') + '</div>' +
          '<div class="rc-meta"><span>\uD83D\uDC65 ' + who(m) + '</span><span>\uD83D\uDCC5 ' + (m.uploaded_at ? B.fmtTs(m.uploaded_at) : 'Just added') + '</span></div>' +
          '<div class="rc-meta">' + (m.data ? B.fileLink({ name: m.file_path, data: m.data }) : esc(m.file_path || 'No file attached')) + '</div></div>' +
          '<div class="rc-actions"><div class="row-actions"><button type="button" class="row-link" data-ac="' + m.material_id + '">Manage access</button><button type="button" class="row-link danger" data-del="' + m.material_id + '">Delete</button></div></div></div>';
        }).join('') || B.empty('Use "Add material" to share your first file or link.', 'No materials yet'); }
      $('#mRows').onclick = function (e) {
        var a = e.target.closest('[data-ac]'), x = e.target.closest('[data-del]'), d = db();
        if (x) { if (!confirm('Delete this material?')) return; d.materials = d.materials.filter(function (m) { return String(m.material_id) !== x.getAttribute('data-del'); }); put(d); draw(); $('#accessPanel').innerHTML = ''; }
        if (a) { var m = d.materials.filter(function (k) { return String(k.material_id) === a.getAttribute('data-ac'); })[0];
          $('#accessPanel').innerHTML = B.card('Access - ' + esc(m.title), '<div class="form-grid">' + B.multi('acStu', students(), m.assigned_to, 'Students who can see this material') + '</div><div class="form-actions"><button type="button" class="btn btn-ghost" id="acCancel">Close</button><button type="button" class="btn btn-primary" id="acSave">Save access</button></div>', { cls: 'panel-in', id: 'acCard' });
          B.bindMulti('acStu'); $('#acCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#acCancel').onclick = function () { $('#accessPanel').innerHTML = ''; };
          $('#acSave').onclick = function () { var dd = db(), mm = dd.materials.filter(function (k) { return k.material_id === m.material_id; })[0]; mm.assigned_to = B.multiVals('acStu'); put(dd); draw(); toast('Access updated'); $('#accessPanel').innerHTML = ''; }; }
      };
      draw();
    }
  };

  /* ================= assignments ================= */
  V['admin-assignments.html'] = V['admin-assignment-details.html'] = {
    title: 'Assignments',
    render: function () {
      var list = B.card('', ftabs('tf', TD) + '<div class="rc-list" id="tRows"></div>', { flush: 1 }) + '<div id="revPanel"></div>';
      return B.head('Assignments & tasks', 'Assign work to one or many students, then review what they upload.', '<a class="btn btn-primary" href="admin-assignment-add.html">' + svg('plus') + 'Assign task</a>') + list;
    },
    init: function () {
      
      function draw() { var pred = fcur('tf', TD), d = db(), ti = B.iso(); fcount('tf', TD, d.tasks, function (t) { return t.status; });
        $('#tRows').innerHTML = d.tasks.filter(function (t) { return pred(t.status); }).map(function (t) { var s = B.stu(t.registration_number, d); if (!s) return ''; var od = t.status === 'Pending' && t.due_date && t.due_date < ti, tone = toneOf(t.status);
          return '<div class="rc" data-tone="' + tone + '"><div class="rc-ic ' + tone + '">' + rcIcon(tone) + '</div><div class="rc-main"><div class="rc-top"><b>' + esc(t.title) + '</b>' + stBadge(t.status) + '</div><div class="rc-sub">' + esc(s.full_name) + ' <span class="reg">&middot; ' + s.registration_number + '</span></div>' +
            '<div class="rc-meta"><span>\uD83D\uDCC5 Due ' + fmtIso(t.due_date) + '</span>' + (od ? '<span class="od">\u26A0\uFE0F Overdue</span>' : '') + (t.brief_file ? '<span>\uD83D\uDCCE Brief ' + B.fileLink(t.brief_file) + '</span>' : '') + (t.submission_file ? '<span>\u2B06\uFE0F Submitted ' + B.fileLink(t.submission_file) + '</span>' : '<span class="muted">Not submitted yet</span>') + (t.grade ? '<span>\uD83C\uDFC6 Grade ' + esc(t.grade) + '</span>' : '') + '</div></div>' +
            '<div class="rc-actions"><div class="row-actions"><button type="button" class="row-link" data-rv="' + t.task_id + '">Review</button><button type="button" class="row-link danger" data-del="' + t.task_id + '">Delete</button></div></div></div>'; }).join('') || B.empty('Assign work with "Assign task".', 'Nothing here yet'); }
      fbind('tf', draw);
      $('#tRows').onclick = function (e) {
        var r = e.target.closest('[data-rv]'), x = e.target.closest('[data-del]'), d = db();
        if (x) { if (!confirm('Delete this task?')) return; d.tasks = d.tasks.filter(function (t) { return String(t.task_id) !== x.getAttribute('data-del'); }); put(d); draw(); }
        if (r) { var t = d.tasks.filter(function (k) { return String(k.task_id) === r.getAttribute('data-rv'); })[0], s = B.stu(t.registration_number, d);
          $('#revPanel').innerHTML = B.card('Review - ' + esc(t.title) + ' (' + esc(s.full_name) + ')', '<p class="small-note">' + esc(t.description || '') + '</p><div class="form-grid"><div class="form-group span-2"><label>Student submission</label><div>' + B.fileLink(t.submission_file) + (t.submitted_at ? ' <span class="muted">submitted ' + fmtIso(t.submitted_at) + '</span>' : '') + '</div></div>' + B.select('rStatus', 'Status', STATUS, t.status) + B.field('rGrade', 'Grade', 'text', t.grade, 'A / B / marks') + B.textarea('rRem', 'Remarks (visible to student)', t.remarks, '', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-ghost" id="rCancel">Close</button><button type="button" class="btn btn-primary" id="rSave">Save review</button></div>', { cls: 'panel-in', id: 'rvCard' });
          $('#rvCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#rCancel').onclick = function () { $('#revPanel').innerHTML = ''; };
          $('#rSave').onclick = function () { var dd = db(), tt = dd.tasks.filter(function (k) { return k.task_id === t.task_id; })[0]; tt.status = val('rStatus'); tt.grade = val('rGrade'); tt.remarks = val('rRem'); put(dd); draw(); $('#revPanel').innerHTML = ''; toast('Review saved'); }; }
      };
      draw();
    }
  };

  /* ================= projects (admin can upload the brief) ================= */
  var PSTAT = ['Pending', 'Submitted', 'Under Review', 'Evaluated'], PORT = ['Pending', 'Approved', 'Changes Requested'];
  V['admin-projects.html'] = {
    title: 'Projects',
    render: function () {
      var list = B.card('', ftabs('pf', PD) + '<div class="rc-list" id="pRows"></div>', { flush: 1 }) + '<div id="prPanel"></div>';
      return B.head('Projects', 'Upload a project brief, assign it to students, then review their work and portfolio links.', '<a class="btn btn-primary" href="admin-project-add.html">' + svg('plus') + 'Assign project</a>') + list;
    },
    init: function () {
      
      function draw() { var pred = fcur('pf', PD), d = db(), all = d.students.filter(function (s) { return s.project; }); fcount('pf', PD, all, function (s) { return s.project.status; });
        $('#pRows').innerHTML = all.filter(function (s) { return pred(s.project.status); }).map(function (s) { var p = s.project, tone = toneOf(p.status);
          return '<div class="rc" data-tone="' + tone + '"><div class="rc-ic ' + tone + '">\uD83D\uDCC1</div><div class="rc-main"><div class="rc-top"><b>' + esc(p.title || 'Untitled') + '</b>' + stBadge(p.status) + '</div><div class="rc-sub">' + esc(s.full_name) + ' <span class="reg">&middot; ' + s.registration_number + '</span></div>' +
            '<div class="rc-meta"><span>\uD83D\uDCC5 Due ' + fmtIso(p.due_date) + '</span><span>\uD83D\uDCCE Brief ' + B.fileLink(p.brief_file) + '</span><span>\u2B06\uFE0F ' + B.fileLink(p.submission_file) + '</span>' + (p.portfolio_link ? '<span>\uD83D\uDD17 <a class="row-link" target="_blank" rel="noopener" href="' + esc(p.portfolio_link) + '">Portfolio link</a></span>' : '') + (p.evaluation_score === '' || p.evaluation_score == null ? '' : '<span>\uD83C\uDFC6 Score ' + esc(p.evaluation_score) + '</span>') + '</div></div>' +
            '<div class="rc-actions"><button type="button" class="row-link" data-rv="' + s.registration_number + '">Review</button></div></div>'; }).join('') || B.empty('Use Assign project to give a student a project.', 'No projects yet'); }
      fbind('pf', draw);
      $('#pRows').onclick = function (e) { var r = e.target.closest('[data-rv]'); if (!r) return; var s = B.stu(r.getAttribute('data-rv')), p = s.project;
        $('#prPanel').innerHTML = B.card('Review - ' + esc(p.title || 'Untitled') + ' (' + esc(s.full_name) + ')', '<div class="form-grid"><div class="form-group span-2"><label>Student submission</label><div>' + B.fileLink(p.submission_file) + (p.submitted_at ? ' <span class="muted">submitted ' + fmtIso(p.submitted_at) + '</span>' : '') + '</div></div><div class="form-group span-2"><label>Project brief</label><div>' + B.fileLink(p.brief_file) + '</div></div>' + B.fileInput('vBrief', 'Upload / replace brief (optional)', 'span-2') + B.fileInput('vSub', 'Upload student work on their behalf (optional)', 'span-2') + B.select('vStatus', 'Status', PSTAT, p.status) + B.field('vScore', 'Evaluation score', 'number', p.evaluation_score, '0-100', '', 'min="0" max="100"') + B.select('vPort', 'Portfolio status', PORT, p.portfolio_status) + B.textarea('vRem', 'Remarks (visible to student)', p.remarks, '', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-ghost" id="vCancel">Close</button><button type="button" class="btn btn-primary" id="vSave">Save review</button></div>', { cls: 'panel-in', id: 'vCard' });
        $('#vCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#vCancel').onclick = function () { $('#prPanel').innerHTML = ''; };
        $('#vSave').onclick = function () { B.readFile($('#vBrief'), function (f) { B.readFile($('#vSub'), function (g) { var d = db(), pp = B.stu(s.registration_number, d).project; pp.status = val('vStatus'); pp.evaluation_score = val('vScore'); pp.portfolio_status = val('vPort'); pp.remarks = val('vRem'); if (f) pp.brief_file = f; if (g) { pp.submission_file = g; pp.submitted_at = B.iso(); if (pp.status === 'Pending') pp.status = 'Submitted'; B.notify({ to: s.registration_number, notification_type: 'Individual Message', title: 'Project work uploaded', message: 'Your admin uploaded project work on your behalf.' }); } put(d); draw(); $('#prPanel').innerHTML = ''; toast('Review saved'); }); }); }; };
      draw();
    }
  };

  /* ================= assessments: Scheduled / Pending / Completed ================= */
  V['admin-assessments.html'] = {
    title: 'Assessments',
    render: function () {
      var list = B.card('', ftabs('sf', AD) + '<div class="rc-list" id="sRows"></div>', { flush: 1 }) + '<div id="asPanel"></div>';
      return B.head('Assessments', 'Schedule practical assessments and project evaluations, then record marks and remarks.', '<a class="btn btn-primary" href="admin-assessment-add.html">' + svg('plus') + 'Schedule assessment</a>') + list;
    },
    init: function () {
      
      function draw() { var pred = fcur('sf', AD), d = db(); fcount('sf', AD, d.assessments, function (a) { return a.status; });
        $('#sRows').innerHTML = d.assessments.filter(function (a) { return pred(a.status); }).map(function (a) { var s = B.stu(a.registration_number, d); if (!s) return ''; var tone = toneOf(a.status);
          return '<div class="rc" data-tone="' + tone + '"><div class="rc-ic ' + tone + '">\uD83D\uDCDD</div><div class="rc-main"><div class="rc-top"><b>' + esc(a.title) + '</b>' + stBadge(a.status) + '</div><div class="rc-sub">' + esc(s.full_name) + ' <span class="reg">&middot; ' + s.registration_number + '</span> &middot; ' + esc(a.assessment_type) + '</div>' +
            '<div class="rc-meta"><span>\uD83D\uDCC5 ' + fmtIso(a.scheduled_date) + ' at ' + B.t12(a.scheduled_time) + '</span><span>\uD83D\uDCCD ' + a.mode + '</span><span>\uD83C\uDFC6 ' + (a.marks === '' ? 'Not marked yet' : a.marks + ' / ' + a.max_marks) + '</span>' + (a.submission_file ? '<span>\u2B06\uFE0F ' + B.fileLink(a.submission_file) + '</span>' : '') + '</div></div>' +
            '<div class="rc-actions"><div class="row-actions"><button type="button" class="row-link" data-up="' + a.schedule_id + '">Update</button><button type="button" class="row-link danger" data-del="' + a.schedule_id + '">Delete</button></div></div></div>'; }).join('') || B.empty('Schedule an assessment from the "Schedule assessment" tab.', 'Nothing here yet'); }
      fbind('sf', draw);
      $('#sRows').onclick = function (e) { var u = e.target.closest('[data-up]'), x = e.target.closest('[data-del]'), d = db();
        if (x) { if (!confirm('Delete this assessment?')) return; d.assessments = d.assessments.filter(function (a) { return String(a.schedule_id) !== x.getAttribute('data-del'); }); put(d); draw(); }
        if (u) { var a = d.assessments.filter(function (k) { return String(k.schedule_id) === u.getAttribute('data-up'); })[0], s = B.stu(a.registration_number, d);
          $('#asPanel').innerHTML = B.card('Update - ' + esc(a.title) + ' (' + esc(s.full_name) + ')', '<div class="form-grid"><div class="form-group span-2"><label>Student work</label><div>' + B.fileLink(a.submission_file) + '</div></div>' + B.fileInput('uFile', 'Upload / replace student work (optional)', 'span-2') + B.select('uStatus', 'Status', ['Scheduled', 'Pending', 'Completed', 'Cancelled'], a.status) + B.field('uMarks', 'Marks', 'number', a.marks, '', '', 'min="0"') + B.field('uMax', 'Maximum marks', 'number', a.max_marks, '', '', 'min="1"') + B.textarea('uRem', 'Remarks (visible to student)', a.remarks, '', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-ghost" id="uCancel">Close</button><button type="button" class="btn btn-primary" id="uSave">Save</button></div>', { cls: 'panel-in', id: 'uCard' });
          $('#uCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#uCancel').onclick = function () { $('#asPanel').innerHTML = ''; };
          $('#uSave').onclick = function () { B.readFile($('#uFile'), function (g) { var dd = db(), aa = dd.assessments.filter(function (k) { return k.schedule_id === a.schedule_id; })[0]; aa.status = val('uStatus'); aa.marks = val('uMarks') === '' ? '' : Number(val('uMarks')); aa.max_marks = Number(val('uMax')) || 100; aa.remarks = val('uRem'); if (g) { aa.submission_file = g; aa.submitted_at = B.iso(); B.notify({ to: a.registration_number, notification_type: 'Assessment Reminder', title: 'Assessment work uploaded', message: 'Your admin uploaded work for "' + a.title + '".' }); } put(dd); draw(); $('#asPanel').innerHTML = ''; toast('Saved'); }); }; } };
      draw();
    }
  };

  /* ================= dedicated add / edit pages ================= */
  V['admin-course-add.html'] = {
    title: 'Course',
    render: function () {
      var d = db(), id = q('id'), c = id ? d.courses.filter(function (x) { return String(x.course_id) === id; })[0] : null, edit = !!c, n = edit ? d.students.filter(function (s) { return s.enr.course_id === c.course_id; }).length : 0;
      c = c || { course_name: '', course_code: '', duration_weeks: 12, description: '', is_active: true };
      var main = B.card('Course details', '<div class="form-grid">' + B.field('cName', 'Course name *', 'text', c.course_name, 'e.g. UI/UX Design', 'span-2') + B.field('cCode', 'Course code', 'text', c.course_code, 'Auto from name', '', 'maxlength="6"') +
        B.field('cWeeks', 'Typical duration (weeks)', 'number', c.duration_weeks, '', '', 'min="1"') + B.select('cStatus', 'Status', [['1', 'Active - available when adding students'], ['0', 'Inactive - hidden from new admissions']], c.is_active ? '1' : '0', 'span-2') + '</div>', { desc: 'Duration, timing and fee can still be set individually for each student.' }) +
        B.card('About this course', '<div class="form-grid">' + B.textarea('cDesc', 'Description (optional)', c.description || '', 'What students learn, tools covered, who it is for', 'span-2') + '</div>');
      var aside = '<div class="card fp-card"><div class="card-body"><div class="fp-sh">Preview</div><div class="prev"><span class="code-chip lg" id="pvCode">' + esc(c.course_code || 'CRS') + '</span><b id="pvName">' + esc(c.course_name || 'Course name') + '</b><small id="pvMeta">' + (c.duration_weeks || 12) + ' weeks &middot; ' + (c.is_active ? 'Active' : 'Inactive') + '</small></div>' +
        (edit ? '<div class="prev-n"><b>' + n + '</b><small>student' + (n === 1 ? '' : 's') + ' enrolled</small></div>' : '') +
        '<button type="button" class="btn btn-primary fp-btn" id="cSave">' + (edit ? 'Save changes' : 'Create course') + '</button><a class="btn btn-ghost fp-btn" href="admin-courses.html">Cancel</a></div></div>';
      return fpShell(edit ? 'Edit course' : 'Add course', edit ? 'Update the course details. Enrolled students keep their own duration, timing and fee.' : 'Create a course to make it available when admitting students.', ['admin-courses.html', 'Back to courses'], main, aside);
    },
    init: function () {
      var id = q('id');
      function auto() { return val('cName').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase(); }
      function pv() { $('#pvName').textContent = val('cName') || 'Course name'; $('#pvCode').textContent = (val('cCode') || auto() || 'CRS').toUpperCase(); $('#pvMeta').textContent = (val('cWeeks') || 12) + ' weeks \u00B7 ' + ($('#cStatus').value === '1' ? 'Active' : 'Inactive'); }
      ['cName', 'cCode', 'cWeeks'].forEach(function (k) { $('#' + k).addEventListener('input', pv); }); $('#cStatus').addEventListener('change', pv);
      $('#cSave').onclick = function () {
        var d = db(), n = val('cName'); if (!n) return toast('Enter a course name.');
        var clash = d.courses.some(function (c) { return c.course_name.toLowerCase() === n.toLowerCase() && String(c.course_id) !== String(id); }); if (clash) return toast('That course already exists.');
        var w = Number(val('cWeeks')); if (!(w > 0)) return toast('Enter a duration in weeks.');
        var code = (val('cCode') || auto() || 'CRS').toUpperCase();
        if (id) {
          var c = d.courses.filter(function (x) { return String(x.course_id) === id; })[0]; if (!c) return toast('Course not found.');
          c.course_name = n; c.course_code = code; c.duration_weeks = w; c.description = val('cDesc'); c.is_active = $('#cStatus').value === '1';
          d.students.forEach(function (s) { if (s.enr.course_id === c.course_id) s.enr.course_name = n; });
          put(d); B.log('courses', 'Manual', ''); go('admin-courses.html', n + ' updated');
        } else {
          d.courses.push({ course_id: B.nid(d, 'course'), course_name: n, course_code: code, duration_weeks: w, description: val('cDesc'), is_active: $('#cStatus').value === '1' });
          put(d); B.log('courses', 'Manual', ''); go('admin-courses.html', n + ' added');
        }
      };
    }
  };

  V['admin-material-add.html'] = {
    title: 'Add material',
    render: function () {
      var main = recipCard('mStu', students(), [], 'Who can see this?', 'Only the students you choose will see this material. Tap a course to select everyone enrolled in it.') +
        B.card('Material details', '<div class="form-grid">' + B.field('mTitle', 'Title *', 'text', '', 'e.g. Bootstrap Notes', 'span-2') + B.select('mType', 'Type', ['PDF', 'ZIP', 'Video', 'Link', 'Other']) + B.fileInput('mFile', 'File (optional, max 1.2 MB)') + B.field('mLink', 'Link (optional)', 'text', '', 'https://...', 'span-2') + '</div>');
      return fpShell('Add learning material', 'Share notes, files and links with the students who need them.', ['admin-materials.html', 'Back to materials'], main, fpSummary([['Shared with', 'sumWho', 'None selected'], ['Type', 'sumType', 'PDF']], 'mAdd', 'Add &amp; give access', 'admin-materials.html'));
    },
    init: function () {
      var list = students();
      function refresh() { var n = B.multiVals('mStu').length; $('#sumWho').textContent = nStu(n); $('#sumType').textContent = val('mType'); $('#mAdd').disabled = !(n && val('mTitle')); }
      bindRecip('mStu', list, refresh); ['mTitle', 'mType', 'mLink'].forEach(function (k) { $('#' + k).addEventListener('input', refresh); $('#' + k).addEventListener('change', refresh); }); refresh();
      $('#mAdd').onclick = function () {
        var t = val('mTitle'), who = B.multiVals('mStu'); if (!t) return toast('Enter a title.'); if (!who.length) return toast('Select at least one student.');
        this.disabled = true;
        B.readFile($('#mFile'), function (f) {
          var d = db(), link = val('mLink'); d.materials.push({ material_id: B.nid(d, 'material'), title: t, type: val('mType'), file_path: f ? f.name : link || '', data: f ? f.data : '', approval_status: 'Approved', uploaded_at: Date.now(), assigned_to: who });
          put(d); B.log('learning_materials', 'Manual', '', 1); go('admin-materials.html', 'Material added for ' + who.length + ' student' + (who.length > 1 ? 's' : ''));
        });
      };
    }
  };

  V['admin-assignment-add.html'] = {
    title: 'Assign task',
    render: function () {
      var main = recipCard('tStu', activeStudents(), [], 'Who is this for?', 'Each selected student gets their own copy and a notification. Tap a course to select everyone enrolled in it.') +
        B.card('Task details', '<div class="form-grid">' + B.field('tTitle', 'Title *', 'text', '', 'e.g. HTML Landing Page', 'span-2') + B.field('tDue', 'Due date *', 'date', '', '', '', 'min="' + B.iso() + '"') + '<div class="form-group"></div>' +
          B.textarea('tDesc', 'Instructions', '', 'What should the student do?', 'span-2') + B.fileInput('tFile', 'Attachment (optional, max 1.2 MB)', 'span-2') + '</div>');
      return fpShell('Assign task', 'Give one or many students a task with a due date, then review what they upload.', ['admin-assignments.html', 'Back to assignments'], main, fpSummary([['Assigned to', 'sumWho', 'None selected'], ['Due date', 'sumDue', 'Not set']], 'tAdd', 'Assign task', 'admin-assignments.html'));
    },
    init: function () {
      function refresh() { var n = B.multiVals('tStu').length; $('#sumWho').textContent = nStu(n); $('#sumDue').textContent = val('tDue') ? fmtIso(val('tDue')) : 'Not set'; $('#tAdd').disabled = !(n && val('tTitle') && val('tDue')); }
      bindRecip('tStu', activeStudents(), refresh); ['tTitle', 'tDue'].forEach(function (k) { $('#' + k).addEventListener('input', refresh); $('#' + k).addEventListener('change', refresh); }); refresh();
      $('#tAdd').onclick = function () {
        var l = B.multiVals('tStu'), t = val('tTitle'), due = val('tDue'); if (!t || !due) return toast('Enter a title and due date.'); if (!l.length) return toast('Select at least one student.');
        this.disabled = true;
        B.readFile($('#tFile'), function (f) {
          var d = db(); l.forEach(function (r) { d.tasks.push({ task_id: B.nid(d, 'task'), registration_number: r, title: t, description: val('tDesc'), due_date: due, status: 'Pending', brief_file: f, submission_file: null, submitted_at: '', grade: '', remarks: '' }); });
          put(d); B.log('student_tasks', 'Manual', '', l.length);
          l.forEach(function (r) { B.notify({ to: r, notification_type: 'Individual Message', title: 'New assignment: ' + t, message: 'Due ' + fmtIso(due) + '. Open My Learning to view and upload your work.' }); });
          go('admin-assignments.html', 'Assigned to ' + l.length + ' student' + (l.length > 1 ? 's' : ''));
        });
      };
    }
  };

  V['admin-project-add.html'] = {
    title: 'Assign project',
    render: function () {
      var main = recipCard('pStu', activeStudents(), [], 'Who is this for?', 'Students see the brief on My Learning. Assigning again updates a student\'s current project.') +
        B.card('Project details', '<div class="form-grid">' + B.field('pTitle', 'Project title *', 'text', '', 'e.g. Student Portal Build', 'span-2') + B.field('pDue', 'Due date', 'date', '', '', '', 'min="' + B.iso() + '"') + '<div class="form-group"></div>' +
          B.textarea('pDesc', 'Description', '', 'Scope and expectations', 'span-2') + B.fileInput('pFile', 'Project brief / starter files (optional, max 1.2 MB)', 'span-2') + '</div>');
      return fpShell('Assign project', 'Upload a project brief and assign it to students, then review their work and portfolio links.', ['admin-projects.html', 'Back to projects'], main, fpSummary([['Assigned to', 'sumWho', 'None selected'], ['Due date', 'sumDue', 'Not set']], 'pAdd', 'Assign project', 'admin-projects.html'));
    },
    init: function () {
      function refresh() { var n = B.multiVals('pStu').length; $('#sumWho').textContent = nStu(n); $('#sumDue').textContent = val('pDue') ? fmtIso(val('pDue')) : 'Not set'; $('#pAdd').disabled = !(n && val('pTitle')); }
      bindRecip('pStu', activeStudents(), refresh); ['pTitle', 'pDue'].forEach(function (k) { $('#' + k).addEventListener('input', refresh); $('#' + k).addEventListener('change', refresh); }); refresh();
      $('#pAdd').onclick = function () {
        var l = B.multiVals('pStu'), t = val('pTitle'); if (!t) return toast('Enter a project title.'); if (!l.length) return toast('Select at least one student.');
        this.disabled = true;
        B.readFile($('#pFile'), function (f) {
          var d = db(); l.forEach(function (r) {
            var s = B.stu(r, d);
            if (s.project) { s.project.title = t; s.project.description = val('pDesc'); s.project.due_date = val('pDue'); if (f) s.project.brief_file = f; }
            else s.project = { title: t, description: val('pDesc'), due_date: val('pDue'), brief_file: f, submission_file: null, submitted_at: '', portfolio_link: '', status: 'Pending', evaluation_score: '', portfolio_status: 'Pending', remarks: '' };
          });
          put(d); B.log('projects', 'Manual', '', l.length);
          l.forEach(function (r) { B.notify({ to: r, notification_type: 'Individual Message', title: 'Project assigned: ' + t, message: 'Open My Learning > Project to see the brief and upload your work.' }); });
          go('admin-projects.html', 'Project assigned to ' + l.length + ' student' + (l.length > 1 ? 's' : ''));
        });
      };
    }
  };

  V['admin-assessment-add.html'] = {
    title: 'Schedule assessment',
    render: function () {
      var main = recipCard('sStu', activeStudents(), [], 'Who is being assessed?', 'Each student gets their own assessment record and a reminder. Tap a course to select everyone enrolled in it.') +
        B.card('Assessment details', '<div class="form-grid">' + B.field('sTitle', 'Title *', 'text', '', 'e.g. Practical HTML/CSS', 'span-2') + B.select('sType', 'Type', ['Practical', 'Project Evaluation']) + B.select('sMode', 'Mode', ['Offline', 'Online']) +
          B.field('sDate', 'Date *', 'date', '', '', '', 'min="' + B.iso() + '"') + B.field('sTime', 'Time *', 'time') + B.field('sMax', 'Maximum marks', 'number', 100, '', '', 'min="1"') + '</div>', { desc: 'New assessments start as Scheduled. Mark them Pending once taken and Completed when marks are recorded.' });
      return fpShell('Schedule assessment', 'Schedule practical assessments and project evaluations, then record marks and remarks.', ['admin-assessments.html', 'Back to assessments'], main, fpSummary([['Students', 'sumWho', 'None selected'], ['When', 'sumWhen', 'Not set'], ['Mode', 'sumMode', 'Offline']], 'sAdd', 'Schedule', 'admin-assessments.html'));
    },
    init: function () {
      function refresh() {
        var n = B.multiVals('sStu').length; $('#sumWho').textContent = nStu(n); $('#sumWhen').textContent = val('sDate') ? fmtIso(val('sDate')) + (val('sTime') ? ' \u00B7 ' + B.t12(val('sTime')) : '') : 'Not set'; $('#sumMode').textContent = val('sMode');
        $('#sAdd').disabled = !(n && val('sTitle') && val('sDate') && val('sTime'));
      }
      bindRecip('sStu', activeStudents(), refresh); ['sTitle', 'sDate', 'sTime', 'sMode', 'sType', 'sMax'].forEach(function (k) { $('#' + k).addEventListener('input', refresh); $('#' + k).addEventListener('change', refresh); }); refresh();
      $('#sAdd').onclick = function () {
        var l = B.multiVals('sStu'), t = val('sTitle'); if (!t || !val('sDate') || !val('sTime')) return toast('Enter a title, date and time.'); if (!l.length) return toast('Select at least one student.'); var d = db();
        l.forEach(function (r) { d.assessments.push({ schedule_id: B.nid(d, 'schedule'), registration_number: r, title: t, assessment_type: val('sType'), scheduled_date: val('sDate'), scheduled_time: val('sTime'), mode: val('sMode'), status: 'Scheduled', submission_file: null, submitted_at: '', marks: '', max_marks: Number(val('sMax')) || 100, remarks: '' }); });
        put(d); B.log('assessment_schedules', 'Manual', '', l.length);
        l.forEach(function (r) { B.notify({ to: r, notification_type: 'Assessment Reminder', title: t + ' scheduled', message: fmtIso(val('sDate')) + ' at ' + B.t12(val('sTime')) + ' (' + val('sMode') + ')' }); });
        go('admin-assessments.html', 'Scheduled for ' + l.length + ' student' + (l.length > 1 ? 's' : ''));
      };
    }
  };

  /* ================= fees ================= */
  V['admin-fees.html'] = {
    title: 'Fees',
    render: function () {
      var d = db(), ti = B.iso(), col = d.students.reduce(function (a, s) { return a + B.paidSum(s); }, 0), out = d.students.reduce(function (a, s) { return a + B.balance(s); }, 0), od = d.students.filter(function (s) { return B.balance(s) > 0 && s.enr.next_due_date && s.enr.next_due_date < ti; }).length, np = d.students.reduce(function (a, s) { return a + s.payments.length; }, 0);
      function kp(ic, cls, v, l) { return '<div class="kp"><span class="kp-ic ' + cls + '">' + svg(ic) + '</span><div><b>' + v + '</b><small>' + l + '</small></div></div>'; }
      return B.head('Fees', 'Record payments and track balances. Students see their balance, next due date and receipts.') +
        '<div class="kp-row">' + kp('rupee', 'b', inr(col), 'Total collected') + kp('warn', 'c', inr(out), 'Outstanding') + kp('clock', 'd', od, 'Overdue students') + kp('file', 'a', np, 'Payments recorded') + '</div>' +
        B.card('Record payment', '<div class="form-grid">' + B.select('fStu', 'Student *', d.students.map(function (s) { return [s.registration_number, s.full_name + ' (' + s.registration_number + ')']; })) + B.field('fAmt', 'Amount (\u20B9) *', 'number', '', '0', '', 'min="1"') + B.field('fDate', 'Payment date *', 'date', ti) + B.select('fMode', 'Payment mode', ['Cash', 'UPI', 'Net Banking', 'Card', 'DD', 'Cheque']) + B.field('fRef', 'Transaction / reference ID', 'text', '', 'optional') + B.field('fNext', 'Next due date', 'date') + B.textarea('fRem', 'Remarks', '', '', 'span-2') + '</div><div class="small-note" id="fInfo"></div><div class="form-actions"><button type="button" class="btn btn-primary" id="fSave">Record payment</button></div>') +
        B.card('Student fee status', B.table(['Student', 'Net fee', 'Paid', 'Balance', 'Next due'], '', 'fRows'), { flush: 1 }) +
        B.card('Recent payments', B.table(['Receipt', 'Student', 'Date', 'Amount', 'Mode', 'Receipt PDF'], '', 'pRows'), { flush: 1 });
    },
    init: function () {
      function info() { var s = B.stu($('#fStu').value); if (!s) return; $('#fInfo').textContent = 'Balance: ' + inr(B.balance(s)) + ' of ' + inr(s.enr.net_fee) + '. Current next due date: ' + fmtIso(s.enr.next_due_date) + '.'; $('#fNext').value = s.enr.next_due_date || ''; }
      function draw() { var d = db(), ti = B.iso(), all = [];
        $('#fRows').innerHTML = d.students.map(function (s) { var b = B.balance(s), late = b > 0 && s.enr.next_due_date && s.enr.next_due_date < ti; s.payments.forEach(function (p) { all.push({ s: s, p: p }); });
          return '<tr><td>' + sCell(s) + '</td><td>' + inr(s.enr.net_fee) + '</td><td>' + inr(B.paidSum(s)) + '</td><td>' + (b ? '<b>' + inr(b) + '</b>' : B.badge('Paid', 'success')) + '</td><td>' + (b ? fmtIso(s.enr.next_due_date) + (late ? ' ' + B.badge('Overdue', 'danger') : '') : '-') + '</td></tr>'; }).join('') || B.emptyRow(5, 'No students.');
        all.sort(function (a, b) { return a.p.payment_date < b.p.payment_date ? 1 : -1; });
        $('#pRows').innerHTML = all.slice(0, 15).map(function (x) { return '<tr><td>' + x.p.receipt_number + '</td><td>' + sCell(x.s) + '</td><td>' + fmtIso(x.p.payment_date) + '</td><td>' + inr(x.p.amount_paid) + '</td><td>' + esc(x.p.payment_mode) + '</td><td><button type="button" class="dl-btn" data-rc="' + x.s.registration_number + '|' + x.p.receipt_number + '" aria-label="Download receipt">' + svg('dl') + '</button></td></tr>'; }).join('') || B.emptyRow(6, 'No payments yet.'); }
      $('#fStu').onchange = info;
      $('#fSave').onclick = function () { var amt = Number(val('fAmt')); if (!amt || amt <= 0) return toast('Enter a valid amount.'); if (!val('fDate')) return toast('Choose the payment date.'); var d = db(), s = B.stu($('#fStu').value, d);
        if (amt > B.balance(s)) { if (!confirm('This payment is more than the balance (' + inr(B.balance(s)) + '). Record it anyway?')) return; }
        var no = 'PAY-' + ('00000' + B.nid(d, 'pay')).slice(-5); s.payments.push({ receipt_number: no, payment_date: val('fDate'), amount_paid: amt, payment_mode: val('fMode'), reference: val('fRef'), remarks: val('fRem') }); s.enr.next_due_date = B.balance(s) > 0 ? val('fNext') : ''; put(d); B.log('fee_payments', 'Manual', '', 1);
        $('#fAmt').value = ''; $('#fRef').value = ''; $('#fRem').value = ''; draw(); info(); toast('Payment ' + no + ' recorded'); };
      $('#pRows').onclick = function (e) { var b = e.target.closest('[data-rc]'); if (!b) return; var p = b.getAttribute('data-rc').split('|'), s = B.stu(p[0]), pay = s.payments.filter(function (x) { return x.receipt_number === p[1]; })[0]; B.download(B.receiptPdf(s, pay), 'Receipt-' + pay.receipt_number + '.pdf'); };
      draw(); info();
    }
  };

  /* ================= completion & certificates ================= */
  V['admin-completion.html'] = {
    title: 'Course Completion',
    render: function () {
      return B.head('Course completion', 'Update each student\'s progress manually and mark the course completed.') +
        B.card('Update progress', '<div class="form-grid">' + B.select('gStu', 'Student', students().map(function (s) { return [s.registration_number, s.full_name + ' (' + s.registration_number + ')']; })) + '<div class="form-group"><label for="gNum">Progress (%)</label><div class="range-row"><input type="range" id="gRange" min="0" max="100"><input type="number" id="gNum" min="0" max="100"></div></div>' +
          B.textarea('gTop', 'Topics covered (visible to student)', '', 'e.g. HTML, CSS, JavaScript DOM', 'span-2') + '<label class="check span-2"><input type="checkbox" id="gDone"> Mark course as completed</label></div><div class="form-actions"><button type="button" class="btn btn-primary" id="gSave">Save progress</button></div>', { id: 'progressCard' }) +
        B.card('All students', B.table(['Student', 'Course', 'Progress', 'Status', 'Updated', 'Action'], '', 'gRows'), { flush: 1 });
    },
    init: function () {
      var sel = $('#gStu');
      function load() { var s = B.stu(sel.value); if (!s) return; $('#gRange').value = $('#gNum').value = s.enr.progress_percent; $('#gTop').value = s.enr.progress_remarks; $('#gDone').checked = s.enr.enrollment_status === 'Completed'; }
      function draw() { $('#gRows').innerHTML = students().map(function (s) { var c = B.completionStatus(s); return '<tr><td>' + sCell(s) + '</td><td>' + esc(s.enr.course_name) + '</td><td><span class="mini-bar"><span style="width:' + s.enr.progress_percent + '%"></span></span>' + s.enr.progress_percent + '%</td><td>' + B.badge(c[0], c[1]) + '</td><td>' + (s.enr.progress_updated_at ? fmtIso(s.enr.progress_updated_at) : '-') + '</td><td><button type="button" class="row-link" data-g="' + s.registration_number + '">Update</button></td></tr>'; }).join('') || B.emptyRow(6, 'No students.'); }
      $('#gRange').oninput = function () { $('#gNum').value = this.value; }; $('#gNum').oninput = function () { $('#gRange').value = this.value; }; sel.onchange = load;
      $('#gSave').onclick = function () { var d = db(), s = B.stu(sel.value, d), v = Math.max(0, Math.min(100, parseInt($('#gNum').value, 10) || 0)), done = $('#gDone').checked;
        s.enr.progress_percent = v; s.enr.progress_remarks = val('gTop'); s.enr.progress_updated_at = B.iso(); if (done) { s.enr.enrollment_status = 'Completed'; s.enr.completion_approval_status = 'Approved'; s.overall_status = 'Completed'; if (s.certificate.status === 'Pending') s.certificate.status = 'Started'; } else if (s.enr.enrollment_status === 'Completed') { s.enr.enrollment_status = 'Ongoing'; s.enr.completion_approval_status = 'Not Applicable'; s.overall_status = 'Active'; }
        put(d); B.log('student_course_enrollments', 'Manual', '', 1); $('#gRange').value = $('#gNum').value = v; draw(); toast('Progress saved: ' + v + '%'); };
      $('#gRows').onclick = function (e) { var b = e.target.closest('[data-g]'); if (!b) return; sel.value = b.getAttribute('data-g'); load(); $('#progressCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      load(); draw();
    }
  };
  V['admin-certificates.html'] = {
    title: 'Certificates',
    render: function () {
      return B.head('Certificates', 'Track certificate status only. Pending &rarr; Started &rarr; Completed (shown to the student as Ready) &rarr; Issued.') +
        B.card('All certificates', B.table(['Student', 'Course', 'Status', 'Certificate no.', 'Issued', 'Update'], '', 'cRows'), { flush: 1 });
    },
    init: function () {
      var ST = ['Pending', 'Started', 'Completed', 'Issued'];
      function draw() { $('#cRows').innerHTML = students().map(function (s) { var c = s.certificate;
        return '<tr><td>' + sCell(s) + '</td><td>' + esc(s.enr.course_name) + '</td><td>' + stBadge(c.status) + '<div class="cell-sub">Student sees: ' + B.certLabel(c.status) + '</div></td><td>' + esc(c.certificate_number || '-') + '</td><td>' + (c.issued_at ? fmtIso(c.issued_at) : '-') + '</td><td><div class="inline-btn"><select data-s="' + s.registration_number + '">' + ST.map(function (o) { return '<option' + (o === c.status ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select><button type="button" class="btn btn-outline btn-sm" data-u="' + s.registration_number + '">Save</button></div></td></tr>'; }).join('') || B.emptyRow(6, 'No students.'); }
      $('#cRows').onclick = function (e) { var b = e.target.closest('[data-u]'); if (!b) return; var reg = b.getAttribute('data-u'), d = db(), s = B.stu(reg, d), v = $('select[data-s="' + reg + '"]').value, prev = s.certificate.status;
        s.certificate.status = v; s.certificate.updated_at = B.iso(); if (v === 'Issued' && !s.certificate.certificate_number) { s.certificate.certificate_number = 'BCT-' + new Date().getFullYear() + '-' + ('000' + s.student_id).slice(-3); s.certificate.issued_at = B.iso(); } if (v !== 'Issued') { s.certificate.certificate_number = ''; s.certificate.issued_at = ''; } put(d); B.log('certificates', 'Manual', '', 1);
        if (v === 'Completed' && prev !== 'Completed') B.notify({ to: reg, notification_type: 'Certificate Ready Notification', title: 'Your certificate is ready', message: 'Your certificate for ' + s.enr.course_name + ' is ready. The institute will hand it over soon.' }); draw(); toast('Certificate status updated'); };
      draw();
    }
  };

  /* ================= placement ================= */
  V['admin-placement.html'] = {
    title: 'Placement',
    render: function () {
      return B.head('Placement', 'Enable placement access per student, verify resume and portfolio, and schedule interviews.') + B.card('Students', B.table(['Student', 'Placement access', 'Resume', 'Portfolio', 'Eligibility', 'Status', 'Actions'], '', 'plRows'), { flush: 1 }) + '<div id="plPanel"></div>';
    },
    init: function () {
      function draw() { $('#plRows').innerHTML = students().map(function (s) { var p = s.placement;
        return '<tr><td>' + sCell(s) + '</td><td>' + B.badge(s.placement_enabled ? 'Enabled' : 'Disabled', s.placement_enabled ? 'success' : 'neutral') + '</td><td>' + (p.resume_submitted ? stBadge(p.resume_status) : '<span class="muted">Not uploaded</span>') + '</td><td>' + (p.portfolio_submitted ? stBadge(p.portfolio_status) : '<span class="muted">No link</span>') + '</td><td>' + esc(p.eligibility_status) + '</td><td>' + B.badge(p.placement_status, p.placement_status === 'Placed' ? 'success' : 'neutral') + '</td>' +
          '<td><div class="row-actions"><button type="button" class="row-link" data-tg="' + s.registration_number + '">' + (s.placement_enabled ? 'Disable' : 'Enable') + '</button>' + (s.placement_enabled ? '<button type="button" class="row-link" data-mg="' + s.registration_number + '">Manage</button>' : '') + '</div></td></tr>'; }).join('') || B.emptyRow(7, 'No students.'); }
      function panel(reg) {
        var s = B.stu(reg), p = s.placement;
        $('#plPanel').innerHTML = B.card('Manage - ' + esc(s.full_name), '<div class="form-grid"><div class="form-group"><label>Resume</label><div>' + B.fileLink(p.resume_file) + '</div></div><div class="form-group"><label>Portfolio link</label><div>' + (p.portfolio_link_url ? '<a class="row-link" target="_blank" rel="noopener" href="' + esc(p.portfolio_link_url) + '">' + esc(p.portfolio_link_url) + '</a>' : '<span class="muted">-</span>') + '</div></div>' +
          B.select('mRes', 'Resume status', ['Pending', 'Verified', 'Rejected'], p.resume_status) + B.select('mPort', 'Portfolio status', ['Pending', 'Verified', 'Rejected'], p.portfolio_status) + B.select('mElig', 'Eligibility', ['Not Eligible', 'Eligible'], p.eligibility_status) + B.select('mPl', 'Placement status', ['Not Placed', 'Placed'], p.placement_status) + '</div>' +
          '<div class="sec-h">Interviews</div>' + B.table(['Company', 'Role', 'Date', 'Round', 'Status', ''], p.interviews.map(function (i, k) { return '<tr><td>' + esc(i.company) + '</td><td>' + esc(i.role) + '</td><td>' + fmtIso(i.date) + '</td><td>' + esc(i.round) + '</td><td>' + stBadge(i.status) + '</td><td><button type="button" class="row-link danger" data-ri="' + k + '">Remove</button></td></tr>'; }).join('') || B.emptyRow(6, 'No interviews scheduled.')) +
          '<div class="form-grid" style="margin-top:14px">' + B.field('iCo', 'Company', 'text', '', '') + B.field('iRole', 'Role', 'text', '', '') + B.field('iDate', 'Interview date', 'date') + B.select('iRound', 'Round', ['Technical', 'HR', 'Aptitude', 'Final']) + '</div><div class="form-actions"><button type="button" class="btn btn-outline" id="iAdd">Add interview</button><button type="button" class="btn btn-ghost" id="mClose">Close</button><button type="button" class="btn btn-primary" id="mSave">Save</button></div>', { cls: 'panel-in', id: 'mgCard' });
        $('#mgCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#mClose').onclick = function () { $('#plPanel').innerHTML = ''; };
        $('#mSave').onclick = function () { var d = db(), pp = B.stu(reg, d).placement; pp.resume_status = val('mRes'); pp.portfolio_status = val('mPort'); pp.eligibility_status = val('mElig'); var was = pp.placement_status; pp.placement_status = val('mPl'); put(d); B.log('placement_registrations', 'Manual', '', 1);
          if (pp.placement_status === 'Placed' && was !== 'Placed') B.notify({ to: reg, notification_type: 'Placement Notification', title: 'Placement update', message: 'Congratulations - your placement status is now Placed.' }); draw(); toast('Saved'); };
        $('#iAdd').onclick = function () { if (!val('iCo') || !val('iDate')) return toast('Enter the company and date.'); var d = db(), pp = B.stu(reg, d).placement; pp.interviews.push({ company: val('iCo'), role: val('iRole'), date: val('iDate'), round: val('iRound'), status: 'Scheduled' }); put(d);
          B.notify({ to: reg, notification_type: 'Placement Notification', title: 'Interview scheduled: ' + val('iCo'), message: fmtIso(val('iDate')) + ' - ' + val('iRound') + ' round' + (val('iRole') ? ' for ' + val('iRole') : '') }); toast('Interview added'); panel(reg); };
        $('#plPanel').onclick = function (e) { var r = e.target.closest('[data-ri]'); if (!r) return; var d = db(); B.stu(reg, d).placement.interviews.splice(Number(r.getAttribute('data-ri')), 1); put(d); panel(reg); };
      }
      $('#plRows').onclick = function (e) { var t = e.target.closest('[data-tg]'), m = e.target.closest('[data-mg]');
        if (t) { var d = db(), s = B.stu(t.getAttribute('data-tg'), d); s.placement_enabled = !s.placement_enabled; if (s.placement_enabled) s.placement.eligibility_status = s.placement.eligibility_status === 'Not Eligible' ? 'Eligible' : s.placement.eligibility_status; put(d); draw(); $('#plPanel').innerHTML = ''; toast('Placement ' + (s.placement_enabled ? 'enabled' : 'disabled') + ' for ' + s.full_name); }
        if (m) panel(m.getAttribute('data-mg')); };
      draw();
    }
  };

  /* ================= notification center ================= */
  var NT = [['Individual Message', 1], ['Bulk Message', 0], ['Admission Confirmation', 1], ['Fee Due Reminder', 1], ['Assessment Reminder', 1], ['Class Reminder', 1], ['Holiday Notice', 0], ['Placement Notification', 1], ['Certificate Ready Notification', 1]];
  function alertRow(a) { return '<div class="alert-row"><span class="alert-dot"></span><div><b>' + esc(a.t) + '</b><span>' + esc(a.d) + '</span></div><a class="row-link" href="' + a.link + '">Open</a></div>'; }
  V['admin-notifications.html'] = {
    title: 'Notification Center',
    render: function () {
      var A = alerts(), d = db(), aud = '<option value="ALL">All students</option>' + d.courses.map(function (c) { return '<option value="COURSE:' + esc(c.course_name) + '">' + esc(c.course_name) + '</option>'; }).join('');
      function col(t, l) { return '<div class="card alert-card"><div class="alert-card-head"><h3>' + t + '</h3><span class="chip-count">' + l.length + '</span></div>' + (l.map(alertRow).join('') || '<div class="empty">All clear.</div>') + '</div>'; }
      return B.head('Notification Center', 'What needs your attention, and messages to students.') + '<div class="alert-grid">' + col('Action required', A.action) + col('Reminders', A.remind) + col('Alerts', A.alert) + '</div>' +
        B.card('Send a message', '<div class="form-grid">' + B.select('ntType', 'Type', NT.map(function (t) { return t[0]; })) + '<div class="form-group" id="ntStuWrap"><label for="ntStu">Student</label><select id="ntStu">' + d.students.map(function (s) { return '<option value="' + s.registration_number + '">' + esc(s.full_name) + ' (' + s.registration_number + ')</option>'; }).join('') + '</select></div><div class="form-group" id="ntAudWrap" style="display:none"><label for="ntAud">Send to</label><select id="ntAud">' + aud + '</select></div>' +
          '<div class="form-group" id="ntFromWrap" style="display:none"><label for="ntFrom">Holiday from</label><input type="date" id="ntFrom"></div><div class="form-group" id="ntToWrap" style="display:none"><label for="ntTo">Holiday to (optional)</label><input type="date" id="ntTo"></div>' + B.field('ntTitle', 'Title *', 'text', '', 'e.g. Fee due on 15 Sep', 'span-2') + B.textarea('ntBody', 'Message *', '', 'Write the message...', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-primary" id="ntSend">Send</button></div>') +
        B.card('Message history', B.table(['Type', 'Sent to', 'Title', 'Date', 'Action'], '', 'sentRows'), { flush: 1 });
    },
    init: function () {
      var ty = $('#ntType'), tmpl = {
        'Fee Due Reminder': function (s) { return ['Fee due reminder', 'Your balance of ' + inr(B.balance(s)) + ' is due' + (s.enr.next_due_date ? ' on ' + fmtIso(s.enr.next_due_date) : '') + '. Please pay at the institute.']; },
        'Class Reminder': function (s) { return ['Class reminder', 'Your next session is at ' + B.slotText(s) + ' (' + s.enr.slot_days + ').']; },
        'Assessment Reminder': function () { return ['Assessment reminder', 'You have an upcoming assessment. Please be prepared and on time.']; },
        'Certificate Ready Notification': function (s) { return ['Your certificate is ready', 'Your certificate for ' + s.enr.course_name + ' is ready.']; }
      };
      function sync() { var t = ty.value, bulk = t === 'Bulk Message' || t === 'Holiday Notice'; $('#ntStuWrap').style.display = bulk ? 'none' : ''; $('#ntAudWrap').style.display = bulk ? '' : 'none'; $('#ntFromWrap').style.display = $('#ntToWrap').style.display = t === 'Holiday Notice' ? '' : 'none';
        var f = tmpl[t], s = B.stu($('#ntStu').value); if (f && s && !bulk) { var x = f(s); $('#ntTitle').value = x[0]; $('#ntBody').value = x[1]; } }
      ty.onchange = sync; $('#ntStu').onchange = sync;
      function draw() { var l = db().notifications; $('#sentRows').innerHTML = l.map(function (n) { return '<tr><td>' + B.badge(n.notification_type, n.notification_type === 'Holiday Notice' ? 'warning' : 'info') + '</td><td>' + esc(B.whoLabel(n.to)) + '</td><td>' + esc(n.title) + '</td><td>' + B.fmtTs(n.created_at) + '</td><td><button type="button" class="row-link danger" data-del="' + n.notification_id + '">Delete</button></td></tr>'; }).join('') || B.emptyRow(5, 'Nothing sent yet.'); }
      $('#ntSend').onclick = function () { var t = ty.value, bulk = t === 'Bulk Message' || t === 'Holiday Notice', title = val('ntTitle'), body = val('ntBody'), msg = body; if (!title || (!body && t !== 'Holiday Notice')) return toast('Please enter a title and a message.');
        if (t === 'Holiday Notice') { var f = $('#ntFrom').value, to = $('#ntTo').value; if (!f) return toast('Enter the holiday start date.'); if (to && to < f) return toast('End date cannot be before the start date.'); msg = fmtIso(f) + (to && to !== f ? ' to ' + fmtIso(to) : '') + (body ? '\n' + body : ''); }
        var dest = bulk ? $('#ntAud').value : $('#ntStu').value; B.notify({ to: dest, notification_type: t, title: title, message: msg }); draw(); toast('Sent to ' + B.whoLabel(dest)); $('#ntTitle').value = ''; $('#ntBody').value = ''; $('#ntFrom').value = ''; $('#ntTo').value = ''; };
      $('#sentRows').onclick = function (e) { var b = e.target.closest('[data-del]'); if (!b) return; var d = db(); d.notifications = d.notifications.filter(function (n) { return String(n.notification_id) !== b.getAttribute('data-del'); }); put(d); draw(); };
      draw();
    }
  };

  /* ================= reports ================= */
  function reportRows() { return students().map(function (s) { var a = B.attStats(s), c = B.completionStatus(s); return { s: s, a: a, c: c, paid: B.paidSum(s), bal: B.balance(s) }; }); }
  V['admin-reports.html'] = {
    title: 'Reports',
    render: function () {
      var r = reportRows(), d = db(), act = r.filter(function (x) { return x.s.stage === 'active'; }), avgA = act.filter(function (x) { return x.a.t; }), avgAtt = avgA.length ? Math.round(avgA.reduce(function (a, x) { return a + x.a.pct; }, 0) / avgA.length) : 0, avgP = act.length ? Math.round(act.reduce(function (a, x) { return a + x.s.enr.progress_percent; }, 0) / act.length) : 0;
      function kp(ic, cls, v, l) { return '<div class="kp"><span class="kp-ic ' + cls + '">' + svg(ic) + '</span><div><b>' + v + '</b><small>' + l + '</small></div></div>'; }
      var perCourse = d.courses.map(function (c) { var l = r.filter(function (x) { return x.s.enr.course_id === c.course_id; }); if (!l.length) return ''; var att = l.filter(function (x) { return x.a.t; });
        return '<tr><td>' + esc(c.course_name) + '</td><td>' + l.length + '</td><td>' + (att.length ? Math.round(att.reduce(function (a, x) { return a + x.a.pct; }, 0) / att.length) + '%' : '-') + '</td><td>' + Math.round(l.reduce(function (a, x) { return a + x.s.enr.progress_percent; }, 0) / l.length) + '%</td><td>' + inr(l.reduce(function (a, x) { return a + x.paid; }, 0)) + '</td><td>' + inr(l.reduce(function (a, x) { return a + x.bal; }, 0)) + '</td></tr>'; }).join('');
      return B.head('Reports', 'Attendance, progress and fee summary. Export any table as CSV.', '<button type="button" class="btn btn-outline" id="rExp">' + svg('dl') + 'Export student report (CSV)</button>') +
        '<div class="kp-row">' + kp('users', 'a', act.length, 'Active students') + kp('cal', 'd', avgAtt + '%', 'Average attendance') + kp('layers', 'b', avgP + '%', 'Average progress') + kp('rupee', 'c', inr(r.reduce(function (a, x) { return a + x.bal; }, 0)), 'Outstanding fees') + '</div>' +
        B.card('By course', B.table(['Course', 'Students', 'Avg attendance', 'Avg progress', 'Collected', 'Outstanding'], perCourse || B.emptyRow(6, 'No data.')), { flush: 1 }) +
        B.card('By student', B.table(['Student', 'Course', 'Attendance', 'Progress', 'Completion', 'Paid', 'Balance', 'Certificate'], r.map(function (x) { return '<tr><td>' + sCell(x.s) + '</td><td>' + esc(x.s.enr.course_name) + '</td><td>' + (x.a.t ? x.a.pct + '%' : '-') + '</td><td>' + x.s.enr.progress_percent + '%</td><td>' + B.badge(x.c[0], x.c[1]) + '</td><td>' + inr(x.paid) + '</td><td>' + inr(x.bal) + '</td><td>' + stBadge(x.s.certificate.status) + '</td></tr>'; }).join('') || B.emptyRow(8, 'No students.')), { flush: 1 });
    },
    init: function () { $('#rExp').onclick = function () { var rows = [['registration_number', 'full_name', 'course_name', 'attendance_percent', 'progress_percent', 'completion', 'amount_paid', 'balance', 'certificate_status']]; reportRows().forEach(function (x) { rows.push([x.s.registration_number, x.s.full_name, x.s.enr.course_name, x.a.pct, x.s.enr.progress_percent, x.c[0], x.paid, x.bal, x.s.certificate.status]); }); B.download(new Blob([B.csv(rows)], { type: 'text/csv' }), 'student-report.csv'); B.log('students', 'Export', 'student-report.csv', rows.length - 1); }; }
  };

  /* ================= data transfer ================= */
  var EXPORTS = {
    'students': function (d) { var r = [['registration_number', 'admission_number', 'full_name', 'mobile', 'email', 'address', 'gender', 'dob', 'overall_status', 'placement_enabled', 'admission_date', 'username']]; d.students.forEach(function (s) { r.push([s.registration_number, s.admission_number, s.full_name, s.mobile, s.email, s.address, s.gender, s.dob, s.overall_status, s.placement_enabled, s.admission_date, s.username]); }); return r; },
    'student_course_enrollments': function (d) { var r = [['registration_number', 'course_name', 'faculty_name', 'slot_days', 'slot_start_time', 'slot_end_time', 'net_fee', 'enrollment_status', 'course_start_date', 'course_end_date', 'duration_months', 'progress_percent', 'no_of_present', 'no_of_absent', 'completion_approval_status', 'next_due_date']]; d.students.forEach(function (s) { var a = B.attStats(s), e = s.enr; r.push([s.registration_number, e.course_name, e.faculty_name, e.slot_days, e.slot_start_time, e.slot_end_time, e.net_fee, e.enrollment_status, e.course_start_date, e.course_end_date, e.duration_months, e.progress_percent, a.P, a.A, e.completion_approval_status, e.next_due_date]); }); return r; },
    'daily_attendance': function (d) { var r = [['registration_number', 'attendance_date', 'status']]; d.students.forEach(function (s) { Object.keys(s.attendance).sort().forEach(function (k) { r.push([s.registration_number, k, s.attendance[k]]); }); }); return r; },
    'fee_payments': function (d) { var r = [['registration_number', 'receipt_number', 'payment_date', 'amount_paid', 'payment_mode', 'reference', 'remarks']]; d.students.forEach(function (s) { s.payments.forEach(function (p) { r.push([s.registration_number, p.receipt_number, p.payment_date, p.amount_paid, p.payment_mode, p.reference, p.remarks]); }); }); return r; },
    'assessment_schedules': function (d) { var r = [['registration_number', 'title', 'assessment_type', 'scheduled_date', 'scheduled_time', 'mode', 'status', 'marks', 'max_marks', 'remarks']]; d.assessments.forEach(function (a) { r.push([a.registration_number, a.title, a.assessment_type, a.scheduled_date, a.scheduled_time, a.mode, a.status, a.marks, a.max_marks, a.remarks]); }); return r; },
    'student_tasks': function (d) { var r = [['registration_number', 'title', 'due_date', 'status', 'submitted_at', 'grade', 'remarks']]; d.tasks.forEach(function (t) { r.push([t.registration_number, t.title, t.due_date, t.status, t.submitted_at, t.grade, t.remarks]); }); return r; },
    'certificates': function (d) { var r = [['registration_number', 'status', 'certificate_number', 'issued_at']]; d.students.forEach(function (s) { r.push([s.registration_number, s.certificate.status, s.certificate.certificate_number, s.certificate.issued_at]); }); return r; }
  };
  var TEMPLATE = ['registration_number', 'full_name', 'mobile', 'email', 'course_name', 'faculty_name', 'slot_start_time', 'slot_end_time', 'net_fee', 'course_start_date', 'duration_months', 'username', 'password'];
  var dt = {
    title: 'Data Transfer',
    render: function () {
      return B.head('Data transfer', 'Export records to CSV, or import students in bulk. Every action is written to the import/export log.') +
        '<div class="two-col">' + B.card('Export', '<div class="form-grid">' + B.select('xTable', 'Table', Object.keys(EXPORTS), 'students', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-primary" id="xGo">' + svg('dl') + 'Download CSV</button></div>') +
        B.card('Import students', '<p class="small-note" style="margin-bottom:12px">Upload a CSV using the template columns. Missing usernames and passwords are generated and returned in a credentials file.</p>' + B.fileInput('iFile', 'CSV file', '') + '<div class="form-actions" style="justify-content:flex-start"><button type="button" class="btn btn-outline" id="iTpl">Download template</button><button type="button" class="btn btn-primary" id="iGo">' + svg('up') + 'Import</button></div><div id="iOut"></div>') + '</div>' +
        B.card('Import / export log', B.table(['When', 'Table', 'Direction', 'File', 'Records', 'By', 'Status'], '', 'lRows'), { flush: 1 });
    },
    init: function () {
      function draw() { $('#lRows').innerHTML = db().logs.map(function (l) { return '<tr><td>' + B.fmtTs(l.performed_at) + '</td><td>' + esc(l.table_name) + '</td><td>' + B.badge(l.direction, l.direction === 'Manual' ? 'neutral' : 'info') + '</td><td>' + esc(l.file_name || '-') + '</td><td>' + l.record_count + '</td><td>' + esc(l.performed_by) + '</td><td>' + B.badge(l.status, l.status === 'Success' ? 'success' : 'warning') + '</td></tr>'; }).join('') || B.emptyRow(7, 'No activity yet.'); }
      $('#xGo').onclick = function () { var t = val('xTable'), rows = EXPORTS[t](db()), name = t + '-' + B.iso() + '.csv'; B.download(new Blob([B.csv(rows)], { type: 'text/csv' }), name); B.log(t, 'Export', name, rows.length - 1); draw(); toast('Exported ' + (rows.length - 1) + ' records'); };
      $('#iTpl').onclick = function () { B.download(new Blob([B.csv([TEMPLATE, ['REG050', 'Sample Student', '+91 90000 00000', 'sample@example.com', 'Data Analysis', 'Meena', '10:00', '11:00', '48000', B.iso(), '4', '', '']])], { type: 'text/csv' }), 'students-template.csv'); };
      $('#iGo').onclick = function () {
        var f = $('#iFile').files[0]; if (!f) return toast('Choose a CSV file first.'); var rd = new FileReader();
        rd.onload = function () {
          var rows = B.csvParse(String(rd.result)), h = (rows.shift() || []).map(function (x) { return x.trim().toLowerCase(); }), d = db(), ok = 0, skip = [], cred = [['registration_number', 'full_name', 'username', 'password']];
          function g(r, k) { var i = h.indexOf(k); return i > -1 ? String(r[i] || '').trim() : ''; }
          if (h.indexOf('full_name') < 0 || h.indexOf('course_name') < 0) { toast('The CSV needs at least full_name and course_name columns.'); return; }
          rows.forEach(function (r, i) {
            var name = g(r, 'full_name'), course = g(r, 'course_name'), reg = g(r, 'registration_number'); if (!name || !course) { skip.push('Row ' + (i + 2) + ': missing name or course'); return; }
            if (!reg) { reg = 'REG' + ('00' + (d.seq.reg + 1)).slice(-3); } if (d.students.some(function (s) { return s.registration_number.toLowerCase() === reg.toLowerCase(); })) { skip.push('Row ' + (i + 2) + ': ' + reg + ' already exists'); return; }
            var n = parseInt(reg.replace(/\D/g, ''), 10); if (n > d.seq.reg) d.seq.reg = n; else if (!g(r, 'registration_number')) d.seq.reg++;
            var c = ensureCourse(d, course), fac = g(r, 'faculty_name') || 'Unassigned'; ensureFaculty(d, fac); var base = name.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/)[0] || 'student', u = (g(r, 'username') || base).toLowerCase(), k = 1;
            while (u === d.admin.username || d.students.some(function (s) { return s.username.toLowerCase() === u; })) { u = base + (100 + k++); } var pw = g(r, 'password') || B.genPass(); d.seq.adm++;
            var s = B.mkStudent({ id: B.nid(d, 'student'), reg: reg, adm: 'ADM' + d.seq.adm, name: name, mobile: g(r, 'mobile'), email: g(r, 'email'), course_id: c.course_id, course: c.course_name, faculty: fac, from: g(r, 'slot_start_time') || '10:00', to: g(r, 'slot_end_time') || '11:00', fee: Number(g(r, 'net_fee')) || 0, start: g(r, 'course_start_date') || B.iso(), months: Number(g(r, 'duration_months')) || 3, user: u, pass: pw, stage: 'new' });
            s.enr.course_end_date = endDate(s.enr.course_start_date, s.enr.duration_months); d.students.push(s); cred.push([reg, name, u, pw]); ok++;
          });
          put(d); B.log('students', 'Import', f.name, ok, skip.length && !ok ? 'Failed' : skip.length ? 'Partial' : 'Success'); draw();
          $('#iOut').innerHTML = '<div class="inline-note ok">' + ok + ' student' + (ok === 1 ? '' : 's') + ' imported' + (skip.length ? ', ' + skip.length + ' skipped' : '') + '.</div>' + (skip.length ? '<ul class="skip-list">' + skip.slice(0, 6).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + (ok ? '<button type="button" class="btn btn-outline" id="iCred">Download credentials CSV</button>' : '');
          if (ok) $('#iCred').onclick = function () { B.download(new Blob([B.csv(cred)], { type: 'text/csv' }), 'new-student-credentials.csv'); };
        };
        rd.readAsText(f);
      };
      draw();
    }
  };
  V['admin-data-transfer.html'] = V['admin-data-import.html'] = V['admin-data-export.html'] = dt;


  /* ================= bulk import / export on every page ================= */
  var BULK = {
    'admin-students.html': 'students', 'admin-courses.html': 'courses', 'admin-course-details.html': 'student_course_enrollments', 
    'admin-materials.html': 'materials', 'admin-assignments.html': 'student_tasks', 'admin-assignment-details.html': 'student_tasks', 'admin-projects.html': 'projects', 'admin-assessments.html': 'assessment_schedules',
    'admin-fees.html': 'fee_payments', 'admin-completion.html': 'student_course_enrollments', 'admin-certificates.html': 'certificates', 'admin-placement.html': 'students', 'admin-notifications.html': 'notifications', 'admin-reports.html': 'students'
  };
  EXPORTS.courses = function (d) { var r = [['course_name', 'course_code', 'duration_weeks']]; d.courses.forEach(function (c) { r.push([c.course_name, c.course_code, c.duration_weeks]); }); return r; };
  EXPORTS.materials = function (d) { var r = [['title', 'type', 'link_or_file', 'assigned_to']]; d.materials.forEach(function (m) { r.push([m.title, m.type, m.file_path, m.assigned_to.join(';')]); }); return r; };
  EXPORTS.projects = function (d) { var r = [['registration_number', 'title', 'due_date', 'status', 'evaluation_score', 'portfolio_link']]; d.students.forEach(function (s) { if (s.project) r.push([s.registration_number, s.project.title, s.project.due_date, s.project.status, s.project.evaluation_score, s.project.portfolio_link]); }); return r; };
  EXPORTS.notifications = function (d) { var r = [['type', 'to', 'title', 'message', 'created_at']]; d.notifications.forEach(function (n) { r.push([n.notification_type, n.to, n.title, n.message, n.created_at]); }); return r; };
  var IMPORTS = {
    courses: function (d, g) { var n = g('course_name'); if (!n) return 'missing course_name'; ensureCourse(d, n); },
    daily_attendance: function (d, g) { var s = B.stu(g('registration_number'), d), st = g('status'); if (!s) return 'unknown student'; if (['Present', 'Absent', 'Leave'].indexOf(st) < 0 || !g('attendance_date')) return 'bad status or date'; s.attendance[g('attendance_date')] = st; },
    fee_payments: function (d, g) { var s = B.stu(g('registration_number'), d), a = Number(g('amount_paid')); if (!s || !(a > 0)) return 'unknown student or amount'; s.payments.push({ receipt_number: g('receipt_number') || 'PAY-' + ('00000' + B.nid(d, 'pay')).slice(-5), payment_date: g('payment_date') || B.iso(), amount_paid: a, payment_mode: g('payment_mode') || 'Cash', reference: g('reference'), remarks: g('remarks') }); },
    assessment_schedules: function (d, g) { var s = B.stu(g('registration_number'), d); if (!s || !g('title') || !g('scheduled_date')) return 'unknown student or missing title/date'; d.assessments.push({ schedule_id: B.nid(d, 'schedule'), registration_number: s.registration_number, title: g('title'), assessment_type: g('assessment_type') || 'Practical', scheduled_date: g('scheduled_date'), scheduled_time: g('scheduled_time') || '10:00', mode: g('mode') || 'Offline', status: g('status') || 'Scheduled', submission_file: null, submitted_at: '', marks: g('marks') === '' ? '' : Number(g('marks')), max_marks: Number(g('max_marks')) || 100, remarks: g('remarks') }); },
    student_tasks: function (d, g) { var s = B.stu(g('registration_number'), d); if (!s || !g('title') || !g('due_date')) return 'unknown student or missing title/due_date'; d.tasks.push({ task_id: B.nid(d, 'task'), registration_number: s.registration_number, title: g('title'), description: g('description'), due_date: g('due_date'), status: g('status') || 'Pending', submission_file: null, submitted_at: '', grade: g('grade'), remarks: g('remarks') }); },
    projects: function (d, g) { var s = B.stu(g('registration_number'), d); if (!s || !g('title')) return 'unknown student or missing title'; s.project = { title: g('title'), description: g('description'), due_date: g('due_date'), submission_file: null, submitted_at: '', portfolio_link: g('portfolio_link'), status: g('status') || 'Pending', evaluation_score: g('evaluation_score'), portfolio_status: 'Pending', remarks: '' }; },
    materials: function (d, g) { if (!g('title')) return 'missing title'; d.materials.push({ material_id: B.nid(d, 'material'), title: g('title'), type: g('type') || 'PDF', file_path: g('link_or_file'), data: '', approval_status: 'Approved', uploaded_at: Date.now(), assigned_to: g('assigned_to').split(/[;|]/).map(function (x) { return x.trim(); }).filter(function (x) { return B.stu(x, d); }) }); }
  };
  function bulkUI(t) {
    var host = $('.page-head-actions'); if (!host) { var ph = $('.content .page-head'); if (!ph) return; host = document.createElement('div'); host.className = 'page-head-actions'; ph.appendChild(host); }
    host.insertAdjacentHTML('afterbegin', '<span class="bulk-bar"><button type="button" class="btn btn-outline" id="bkTpl">' + svg('dl') + 'Template</button><label class="btn btn-outline" style="cursor:pointer">' + svg('up') + 'Import<input type="file" id="bkFile" accept=".csv" hidden></label><button type="button" class="btn btn-outline" id="bkExp">' + svg('dl') + 'Export</button></span>');
    var ex = EXPORTS[t];
    $('#bkExp').onclick = function () { if (!ex) return toast('Export is not available for this page.'); var rows = ex(db()), name = t + '-' + B.iso() + '.csv'; B.download(new Blob([B.csv(rows)], { type: 'text/csv' }), name); B.log(t, 'Export', name, rows.length - 1); toast('Exported ' + (rows.length - 1) + ' records'); };
    $('#bkTpl').onclick = function () { if (!ex) return toast('No template for this page.'); var h = ex(db())[0]; B.download(new Blob([B.csv([h])], { type: 'text/csv' }), t + '-template.csv'); };
    $('#bkFile').onchange = function () {
      var f = this.files[0]; this.value = ''; if (!f) return;
      if (t === 'students' || t === 'student_course_enrollments') { toast('Student imports use the Data Transfer page.'); return void (location.href = 'admin-data-import.html'); }
      if (!IMPORTS[t]) return toast('Import is not available for this page.');
      var rd = new FileReader(); rd.onload = function () {
        var rows = B.csvParse(String(rd.result)), h = (rows.shift() || []).map(function (x) { return x.trim().toLowerCase(); }), d = db(), ok = 0, bad = [];
        rows.forEach(function (r, i) { if (!r.join('').trim()) return; var e = IMPORTS[t](d, function (k) { var x = h.indexOf(k); return x > -1 ? String(r[x] || '').trim() : ''; }); if (e) bad.push('Row ' + (i + 2) + ': ' + e); else ok++; });
        put(d); B.log(t, 'Import', f.name, ok, bad.length && !ok ? 'Failed' : bad.length ? 'Partial' : 'Success');
        toast(ok + ' imported' + (bad.length ? ', ' + bad.length + ' skipped (' + bad[0] + ')' : '')); setTimeout(function () { location.reload(); }, 1200);
      }; rd.readAsText(f);
    };
  }
  var wrapped = [];
  Object.keys(BULK).forEach(function (p) { var v = V[p]; if (!v || wrapped.indexOf(v) > -1) return; wrapped.push(v); var oi = v.init, t = BULK[p]; v.init = function (me) { if (oi) oi.call(v, me); bulkUI(t); }; });

  /* ================= settings ================= */
  V['admin-settings.html'] = {
    title: 'Settings',
    render: function (me) {
      return B.head('Settings', 'Your admin account. Student passwords are managed by you from each student record.') +
        '<div class="two-col">' + B.card('Profile', '<div class="form-grid">' + B.field('sName', 'Full name', 'text', me.full_name, '', 'span-2') + B.field('sEmail', 'Email', 'email', me.email, '', 'span-2') + B.field('sUser', 'Username', 'text', me.username, '', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-primary" id="sProf">Save profile</button></div>') +
        B.card('Change password', '<div class="form-grid">' + B.field('pOld', 'Current password', 'password', '', '', 'span-2') + B.field('pNew', 'New password', 'password', '', 'min. 6 characters', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-primary" id="sPass">Update password</button></div>') + '</div>' +
        B.card('Demo data', '<p class="small-note" style="margin-bottom:12px">This demo stores data in this browser only. Resetting restores the sample students and signs you out.</p><button type="button" class="btn btn-danger-o" id="sReset">Reset demo data</button>');
    },
    init: function () {
      $('#sProf').onclick = function () { var d = db(), u = val('sUser').toLowerCase().replace(/\s+/g, ''); if (!val('sName') || !u) return toast('Name and username are required.'); if (d.students.some(function (s) { return s.username.toLowerCase() === u; })) return toast('That username belongs to a student.'); d.admin.full_name = val('sName'); d.admin.email = val('sEmail'); d.admin.username = u; put(d); toast('Profile saved'); setTimeout(function () { location.reload(); }, 400); };
      $('#sPass').onclick = function () { var d = db(); if (B.hash($('#pOld').value) !== d.admin.password_hash) return toast('Current password is incorrect.'); if ($('#pNew').value.length < 6) return toast('New password must be at least 6 characters.'); d.admin.password_hash = B.hash($('#pNew').value); put(d); $('#pOld').value = ''; $('#pNew').value = ''; toast('Password updated'); };
      $('#sReset').onclick = function () { if (!confirm('Reset all demo data? This removes students you added.')) return; B.resetDemo(); B.logout(); };
    }
  };
  /* ================= stat strips on list pages (match student My Learning) ================= */
  function lst(icn, tn, l, v, sub) { return '<div class="lo-stat"><div class="lo-stat-t"><small>' + l + '</small><b class="' + tn + '">' + v + '</b><em>' + sub + '</em></div><span class="lo-stat-ic ' + tn + '">' + svg(icn) + '</span></div>'; }
  function strip(a) { return '<div class="lo2-stats four list-strip">' + a.join('') + '</div>'; }
  function withStrip(page, fn) {
    var o = V[page].render;
    V[page].render = function () { var h = o.apply(this, arguments), s = ''; try { s = fn(db()); } catch (e) { s = ''; } return h.replace('<!--ph-end-->', s); };
  }
  function cnt(l, f) { return l.filter(f).length; }
  withStrip('admin-students.html', function (d) { var l = d.students; return strip([lst('users', 'b', 'Total students', l.length, 'On record'), lst('check', 'g', 'Active', cnt(l, function (s) { return s.stage === 'active' && s.overall_status === 'Active'; }), 'Attending now'), lst('clock', 'o', 'Onboarding', cnt(l, function (s) { return s.stage === 'new'; }), 'Awaiting activation'), lst('award', 'p', 'Completed', cnt(l, function (s) { return s.overall_status === 'Completed'; }), 'Finished the course')]); });
  withStrip('admin-courses.html', function (d) { var l = d.courses, n = d.students.length; return strip([lst('book', 'b', 'Courses', l.length, 'In catalogue'), lst('check', 'g', 'Active', cnt(l, function (c) { return c.is_active; }), 'Open for admission'), lst('users', 'o', 'Enrolled students', n, 'Across all courses'), lst('clock', 'p', 'Avg. duration', l.length ? Math.round(l.reduce(function (a, c) { return a + (c.duration_weeks || 0); }, 0) / l.length) + ' wks' : '-', 'Typical length')]); });
  withStrip('admin-assignments.html', function (d) { var l = d.tasks; return strip([lst('layers', 'b', 'Total tasks', l.length, 'Assigned so far'), lst('clock', 'o', 'Pending', cnt(l, function (t) { return t.status === 'Pending'; }), 'Not yet submitted'), lst('clip', 'p', 'Awaiting review', cnt(l, function (t) { return t.status === 'Submitted' || t.status === 'Under Review'; }), 'Need your review'), lst('check', 'g', 'Completed', cnt(l, function (t) { return t.status === 'Completed'; }), 'Reviewed and closed')]); });
  withStrip('admin-projects.html', function (d) { var l = d.students.filter(function (s) { return s.project; }).map(function (s) { return s.project.status; }); return strip([lst('layers', 'b', 'Projects', l.length, 'Assigned'), lst('clock', 'o', 'Pending', cnt(l, function (x) { return x === 'Pending'; }), 'Not yet submitted'), lst('clip', 'p', 'Awaiting review', cnt(l, function (x) { return x === 'Submitted' || x === 'Under Review'; }), 'Need your review'), lst('check', 'g', 'Evaluated', cnt(l, function (x) { return x === 'Evaluated'; }), 'Scored')]); });
  withStrip('admin-assessments.html', function (d) { var l = d.assessments; return strip([lst('check', 'b', 'Assessments', l.length, 'Total'), lst('cal', 'o', 'Scheduled', cnt(l, function (a) { return a.status === 'Scheduled'; }), 'Upcoming'), lst('clock', 'p', 'Pending', cnt(l, function (a) { return a.status === 'Pending'; }), 'Awaiting marks'), lst('award', 'g', 'Completed', cnt(l, function (a) { return a.status === 'Completed'; }), 'Marks recorded')]); });
  withStrip('admin-materials.html', function (d) { var l = d.materials, seen = {}; l.forEach(function (m) { (m.assigned_to || []).forEach(function (r) { seen[r] = 1; }); }); return strip([lst('folder', 'b', 'Materials', l.length, 'Shared'), lst('users', 'g', 'Students with access', Object.keys(seen).length, 'Can open materials'), lst('file', 'o', 'Files', cnt(l, function (m) { return !/^https?:/i.test(m.file_path || ''); }), 'Uploaded documents'), lst('swap', 'p', 'Links', cnt(l, function (m) { return /^https?:/i.test(m.file_path || ''); }), 'External resources')]); });
  withStrip('admin-certificates.html', function (d) { var l = d.students.map(function (s) { return B.certLabel(s.certificate.status); }); return strip([lst('users', 'b', 'Students', l.length, 'Tracked'), lst('clock', 'o', 'Pending', cnt(l, function (x) { return x === 'Pending'; }), 'Not yet prepared'), lst('award', 'p', 'Ready', cnt(l, function (x) { return x === 'Ready'; }), 'Awaiting hand-over'), lst('check', 'g', 'Issued', cnt(l, function (x) { return x === 'Issued'; }), 'Handed over')]); });
  withStrip('admin-completion.html', function (d) { var l = d.students, avg = l.length ? Math.round(l.reduce(function (a, s) { return a + (s.enr.progress_percent || 0); }, 0) / l.length) : 0; return strip([lst('users', 'b', 'Students', l.length, 'Enrolled'), lst('clock', 'o', 'In progress', cnt(l, function (s) { return B.completionStatus(s)[0] !== 'Completed'; }), 'Still learning'), lst('award', 'g', 'Completed', cnt(l, function (s) { return B.completionStatus(s)[0] === 'Completed'; }), 'Course finished'), lst('layers', 'p', 'Avg. progress', avg + '%', 'Across students')]); });
  withStrip('admin-placement.html', function (d) { var l = d.students; return strip([lst('brief', 'b', 'Access enabled', cnt(l, function (s) { return s.placement_enabled; }), 'Students'), lst('file', 'o', 'Resumes', cnt(l, function (s) { return s.placement && s.placement.resume_submitted; }), 'Submitted'), lst('user', 'p', 'Interviews', l.reduce(function (a, s) { return a + (s.placement ? s.placement.interviews.filter(function (i) { return i.status === 'Scheduled'; }).length : 0); }, 0), 'Scheduled'), lst('award', 'g', 'Placed', cnt(l, function (s) { return s.placement && /placed$/i.test(s.placement.placement_status || '') && !/not/i.test(s.placement.placement_status); }), 'Got an offer')]); });

})();