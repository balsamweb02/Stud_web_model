/* Balsam portal core — data model uses the column names from Student-Portal-Database-Design.xlsx.
   Persistence here is browser localStorage (key bp_db5); swap db()/put() for an API to go multi-user. */
(function () {
  'use strict';
  var BP = window.BP = { views: {} };
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONF = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var PAGE = location.pathname.split('/').pop() || 'index.html';
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return ('0' + n).slice(-2); }
  function iso(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fmtIso(s) { if (!s) return '-'; var p = String(s).slice(0, 10).split('-'); return pad(+p[2]) + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
  function fmtTs(ts) { return fmtIso(iso(new Date(ts))); }
  function inr(n) { return '\u20B9' + Number(n || 0).toLocaleString('en-IN'); }
  function rs(n) { return 'Rs. ' + Number(n || 0).toLocaleString('en-IN'); }
  function t12(v) { if (!v) return ''; var p = v.split(':'), h = +p[0]; return (h % 12 || 12) + ':' + p[1] + ' ' + (h < 12 ? 'AM' : 'PM'); }
  function initials(n) { return String(n).split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function toast(m) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = 0; }, 2800); setTimeout(function () { t.remove(); }, 3300);
  }
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function hash(s) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, i, c; s = String(s);
    for (i = 0; i < s.length; i++) { c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'demo$' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }
  function genPass() { var c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789', p = '', i; for (i = 0; i < 8; i++) p += c[Math.floor(Math.random() * c.length)]; return p; }

  /* ---------- icons ---------- */
  var IC = {
    dash: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    rupee: '<path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h3a4.5 4.5 0 0 0 0-9"/><path d="M9 13l7 8"/>',
    check: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    brief: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    clip: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    up: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  };
  function svg(n, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[n] || '') + '</svg>'; }

  /* ---------- database ---------- */
  var KEY = 'bp_db5';
  function mkStudent(o) {
    var s = {
      student_id: o.id, registration_number: o.reg, admission_number: o.adm, full_name: o.name, mobile: o.mobile || '', email: o.email || '', address: o.address || '', gender: o.gender || '', dob: o.dob || '',
      overall_status: 'Active', placement_enabled: !!o.placement, admission_date: o.admission_date || o.start, created_at: Date.now(),
      username: o.user, password_hash: hash(o.pass), is_active: true, stage: o.stage || 'active', last_login: null,
      enr: {
        course_id: o.course_id, course_name: o.course, faculty_name: o.faculty, slot_days: o.days || 'Mon-Sat', slot_start_time: o.from, slot_end_time: o.to, net_fee: o.fee,
        enrollment_status: 'Ongoing', course_start_date: o.start, duration_months: o.months, course_end_date: o.end || '', completion_approval_status: 'Not Applicable',
        progress_percent: o.progress || 0, progress_updated_at: o.progress ? iso() : '', progress_remarks: o.topics || '', next_due_date: o.due || ''
      },
      attendance: o.att || {}, payments: o.payments || [], project: null, certificate: { status: o.cert || 'Pending', certificate_number: '', issued_at: '', updated_at: iso() },
      placement: { resume_file: null, resume_submitted: false, resume_status: 'Pending', portfolio_link_url: '', portfolio_submitted: false, portfolio_status: 'Pending', eligibility_status: 'Not Eligible', placement_status: 'Not Placed', interviews: [] }
    };
    return s;
  }
  function seed() {
    var a1 = {}, a2 = {}, a3 = {}, d, w, k, n = 0;
    function wk(y, m, d1, d2, fn) { for (var x = d1; x <= d2; x++) { var dt = new Date(y, m, x), g = dt.getDay(); if (g > 0 && g < 6) fn(iso(dt), n++); } }
    wk(2026, 7, 3, 31, function (k2) { a1[k2] = 'Present'; a2[k2] = 'Present'; }); wk(2026, 8, 1, 25, function (k2) { a1[k2] = 'Present'; });
    a1['2026-08-14'] = 'Absent'; a1['2026-09-03'] = 'Absent'; a1['2026-09-04'] = 'Leave';
    n = 0; wk(2026, 7, 3, 28, function (k2, i) { a3[k2] = i % 3 === 1 ? 'Absent' : 'Present'; });
    return {
      v: 5,
      admin: { username: 'admin', password_hash: hash('admin123'), full_name: 'Admin User', email: 'admin@instituteexample.com' },
      courses: [{ course_id: 1, course_name: 'Full Stack Development', course_code: 'FSD', duration_weeks: 26, is_active: true }, { course_id: 2, course_name: 'Data Analysis', course_code: 'DAN', duration_weeks: 17, is_active: true }, { course_id: 3, course_name: 'Digital Marketing', course_code: 'DMK', duration_weeks: 13, is_active: true }],
      faculty: ['Arun', 'Meena', 'Priya'],
      students: [
        mkStudent({ id: 1, reg: 'REG001', adm: 'ADM102', name: 'Anitha Kumar', mobile: '+91 90000 00001', email: 'anitha@example.com', address: 'Puducherry', course_id: 1, course: 'Full Stack Development', faculty: 'Arun', days: 'Mon-Fri', from: '10:00', to: '11:00', fee: 60000, start: '2026-02-01', months: 8, progress: 70, topics: 'HTML, CSS, JavaScript DOM; starting React basics', due: '2026-09-15', user: 'anitha', pass: 'anitha123', att: a1, placement: true, cert: 'Pending',
          payments: [{ receipt_number: 'PAY-00021', payment_date: '2026-02-15', amount_paid: 7000, payment_mode: 'Card', reference: '', remarks: '' }, { receipt_number: 'PAY-00032', payment_date: '2026-04-15', amount_paid: 15000, payment_mode: 'Net Banking', reference: '', remarks: '' }, { receipt_number: 'PAY-00048', payment_date: '2026-06-16', amount_paid: 20000, payment_mode: 'UPI', reference: '', remarks: '' }] }),
        mkStudent({ id: 2, reg: 'REG002', adm: 'ADM103', name: 'Hari Santhoshini', mobile: '+91 90000 00002', email: 'hari@example.com', address: 'Chennai', course_id: 2, course: 'Data Analysis', faculty: 'Meena', days: 'Mon-Sat', from: '14:00', to: '15:00', fee: 48000, start: '2026-05-01', months: 4, progress: 100, topics: 'Excel, SQL, Power BI dashboards - all modules done', due: '', user: 'hari', pass: 'hari123', att: a2, cert: 'Completed',
          payments: [{ receipt_number: 'PAY-00040', payment_date: '2026-05-01', amount_paid: 48000, payment_mode: 'UPI', reference: '', remarks: '' }] }),
        mkStudent({ id: 3, reg: 'REG003', adm: 'ADM104', name: 'Karthika', mobile: '+91 90000 00003', email: 'karthika@example.com', address: 'Villupuram', course_id: 3, course: 'Digital Marketing', faculty: 'Priya', days: 'Mon-Fri', from: '16:00', to: '17:00', fee: 36000, start: '2026-06-01', months: 3, progress: 41, topics: 'SEO basics, social media strategy', due: '2026-09-10', user: 'karthika', pass: 'karthika123', att: a3,
          payments: [{ receipt_number: 'PAY-00044', payment_date: '2026-06-01', amount_paid: 24000, payment_mode: 'Cash', reference: '', remarks: '' }] })
      ],
      materials: [
        { material_id: 1, title: 'HTML Notes', file_path: 'html-notes.txt', data: 'data:text/plain;charset=utf-8,HTML%20Notes%20-%20sample%20file', approval_status: 'Approved', uploaded_at: Date.now(), assigned_to: ['REG001'] },
        { material_id: 2, title: 'JavaScript Basics', file_path: 'js-basics.txt', data: 'data:text/plain;charset=utf-8,JavaScript%20Basics%20-%20sample%20file', approval_status: 'Approved', uploaded_at: Date.now(), assigned_to: ['REG001'] },
        { material_id: 3, title: 'SQL Practice Set', file_path: 'sql-practice.txt', data: 'data:text/plain;charset=utf-8,SQL%20Practice%20Set%20-%20sample%20file', approval_status: 'Approved', uploaded_at: Date.now(), assigned_to: ['REG002'] }
      ],
      tasks: [
        { task_id: 1, registration_number: 'REG001', title: 'HTML Landing Page', description: 'Build a responsive landing page.', due_date: '2026-10-05', status: 'Pending', submission_file: null, submitted_at: '', grade: '', remarks: '' },
        { task_id: 2, registration_number: 'REG001', title: 'JavaScript DOM Task', description: 'Interactive page updating content from user input.', due_date: '2026-09-20', status: 'Completed', submission_file: { name: 'dom-task.zip', data: '' }, submitted_at: '2026-09-18', grade: 'A', remarks: 'Well structured code.' }
      ],
      assessments: [
        { schedule_id: 1, registration_number: 'REG001', title: 'Practical HTML/CSS', assessment_type: 'Practical', scheduled_date: '2026-10-05', scheduled_time: '10:00', mode: 'Offline', status: 'Scheduled', submission_file: null, submitted_at: '', marks: '', max_marks: 100, remarks: '' },
        { schedule_id: 2, registration_number: 'REG001', title: 'JavaScript Practical', assessment_type: 'Practical', scheduled_date: '2026-09-10', scheduled_time: '10:00', mode: 'Offline', status: 'Completed', submission_file: null, submitted_at: '', marks: 82, max_marks: 100, remarks: 'Strong grasp of fundamentals' }
      ],
      notifications: [
        { notification_id: 1, to: 'REG001', notification_type: 'Class Reminder', title: 'Class schedule', message: 'React Basics class tomorrow at 10 AM.', created_at: Date.parse('2026-09-24') },
        { notification_id: 2, to: 'ALL', notification_type: 'Holiday Notice', title: 'Holiday: Gandhi Jayanti', message: '02 Oct 2026\nInstitute closed.', created_at: Date.parse('2026-09-26') }
      ],
      logs: [{ log_id: 1, table_name: 'students', direction: 'Import', file_name: 'students-initial.csv', record_count: 3, performed_by: 'admin', performed_at: Date.now(), status: 'Success' }],
      seq: { student: 3, reg: 3, adm: 104, pay: 48, material: 3, task: 2, schedule: 2, notification: 2, log: 1, course: 3 }
    };
  }
  function db() { var d = LS.get(KEY, null); if (!d || d.v !== 5) { d = seed(); LS.set(KEY, d); } return d; }
  function put(d) { if (!LS.set(KEY, d)) toast('Storage is full - remove some uploaded files.'); }
  function stu(reg, d) { return (d || db()).students.filter(function (x) { return x.registration_number === reg; })[0]; }
  function nid(d, k) { d.seq[k] = (d.seq[k] || 0) + 1; return d.seq[k]; }
  function paidSum(s) { return (s.payments || []).reduce(function (a, p) { return a + Number(p.amount_paid); }, 0); }
  function balance(s) { return Math.max(0, Number(s.enr.net_fee || 0) - paidSum(s)); }
  function attStats(s) {
    var a = s.attendance || {}, P = 0, A = 0, L = 0, k;
    for (k in a) { if (a[k] === 'Present') P++; else if (a[k] === 'Absent') A++; else if (a[k] === 'Leave') L++; }
    var t = P + A + L; return { P: P, A: A, L: L, t: t, pct: t ? Math.round(P / t * 100) : 0 };
  }
  function slotText(s) { return t12(s.enr.slot_start_time) + ' - ' + t12(s.enr.slot_end_time); }
  function certLabel(st) { return st === 'Issued' ? 'Issued' : st === 'Completed' ? 'Ready' : 'Pending'; }
  function completionStatus(s) { var p = s.enr.progress_percent || 0; return s.enr.enrollment_status === 'Completed' || p >= 100 ? ['Completed', 'success'] : p >= 90 ? ['Eligible', 'info'] : ['In Progress', 'warning']; }
  function notify(n) {
    var d = db(); n.notification_id = nid(d, 'notification'); n.created_at = Date.now(); d.notifications.unshift(n); put(d);
  }
  function log(table, direction, file, count, status) {
    var d = db(); d.logs.unshift({ log_id: nid(d, 'log'), table_name: table, direction: direction, file_name: file || '', record_count: count || 1, performed_by: 'admin', performed_at: Date.now(), status: status || 'Success' }); d.logs = d.logs.slice(0, 60); put(d);
  }
  function mine(n, s) { return n.to === 'ALL' || n.to === s.registration_number || n.to === 'COURSE:' + s.enr.course_name; }
  function myNotifs(s) { return db().notifications.filter(function (n) { return mine(n, s); }).sort(function (a, b) { return b.created_at - a.created_at; }); }
  function whoLabel(to) {
    if (to === 'ALL') return 'All students'; if (to.indexOf('COURSE:') === 0) return to.slice(7);
    var s = stu(to); return s ? s.full_name + ' (' + s.registration_number + ')' : to;
  }


  /* ---------- weekly schedule (which weekdays a student has sessions) ---------- */
  var DN = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  function schedDays(s) {
    var t = String((s && s.enr && s.enr.slot_days) || '').toLowerCase(), on = [0, 0, 0, 0, 0, 0, 0];
    function ix(w) { return DN.indexOf(w.slice(0, 3)); }
    if (/daily|all days|every ?day|7 days/.test(t)) return [1, 1, 1, 1, 1, 1, 1];
    var rest = t.replace(/([a-z]{3,})\s*(?:-|\u2013|\u2014|to)\s*([a-z]{3,})/g, function (m, a, b) {
      var i = ix(a), j = ix(b), k;
      if (i < 0 || j < 0) return m;
      for (k = i; ; k = (k + 1) % 7) { on[k] = 1; if (k === j) break; }
      return ' ';
    });
    rest.split(/[^a-z]+/).forEach(function (w) { if (w.length >= 3) { var i = ix(w); if (i > -1) on[i] = 1; } });
    return on.some(Boolean) ? on : [0, 1, 1, 1, 1, 1, 0];
  }
  function isWorkday(s, dateIso) { return !!schedDays(s)[new Date(dateIso + 'T00:00:00').getDay()]; }
  function daysLabel(s) {
    var on = schedDays(s), n = on.filter(Boolean).length, names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (n === 5 && !on[0] && !on[6]) return 'Mon-Fri';
    if (n === 6 && !on[0]) return 'Mon-Sat';
    if (n === 7) return 'Every day';
    return [1, 2, 3, 4, 5, 6, 0].filter(function (i) { return on[i]; }).map(function (i) { return names[i]; }).join(', ');
  }

  /* ---------- PDF ---------- */
  function pdf(items) {
    var clean = function (s) { return String(s).replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, '\\$&'); }, c = '';
    items.forEach(function (l) {
      if (l.raw) { c += l.raw + '\n'; return; }
      c += (l.c || '0.06 0.11 0.3') + ' rg BT /' + (l.b ? 'F2' : 'F1') + ' ' + (l.s || 11) + ' Tf ' + l.x + ' ' + l.y + ' Td (' + clean(l.t) + ') Tj ET\n';
    });
    var objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
      '<< /Length ' + c.length + ' >>\nstream\n' + c + 'endstream', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'];
    var out = '%PDF-1.4\n', off = [];
    objs.forEach(function (o, i) { off.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
    var x = out.length;
    out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + off.map(function (o) { return ('0000000000' + o).slice(-10) + ' 00000 n \n'; }).join('') + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + x + '\n%%EOF';
    return new Blob([out], { type: 'application/pdf' });
  }
  function layout(o) {
    var G = '0.45 0.48 0.58', y, y2;
    var L = [{ raw: '0.06 0.11 0.30 rg 0 782 595 60 re f' }, { t: 'BALSAM', s: 22, x: 40, y: 812, b: 1, c: '1 1 1' }, { t: 'CREATIVE TECHNOLOGY', s: 8, x: 40, y: 798, c: '1 1 1' }, { t: o.title, s: 15, x: 555 - o.title.length * 9, y: 806, b: 1, c: '1 1 1' }];
    y = 735; o.left.forEach(function (r) { L.push({ t: r[0], s: 8, x: 40, y: y, c: G }, { t: r[1], s: 11, x: 40, y: y - 13, b: 1 }); y -= 34; });
    y2 = 735; o.right.forEach(function (r) { L.push({ t: r[0], s: 8, x: 340, y: y2, c: G }, { t: r[1], s: 11, x: 340, y: y2 - 13, b: 1 }); y2 -= 34; });
    y = Math.min(y, y2) - 10;
    L.push({ raw: '0.95 0.96 0.99 rg 40 ' + (y - 7) + ' 515 22 re f' });
    o.cols.forEach(function (c, i) { L.push({ t: c, s: 9, x: o.xs[i], y: y, b: 1 }); }); y -= 28;
    o.rows.forEach(function (r) { r.forEach(function (v, i) { L.push({ t: v, s: 10, x: o.xs[i], y: y }); }); L.push({ raw: '0.9 0.92 0.96 RG 40 ' + (y - 8) + ' m 555 ' + (y - 8) + ' l S' }); y -= 24; });
    y -= 8;
    o.summary.forEach(function (r) { L.push({ t: r[0], s: r[2] ? 12 : 10, x: 340, y: y, b: r[2] }, { t: r[1], s: r[2] ? 12 : 10, x: 460, y: y, b: r[2] }); y -= 20; });
    if (o.note) L.push({ t: o.note, s: 9, x: 40, y: y - 14, c: G });
    L.push({ t: 'This is a computer-generated document and needs no signature.', s: 8, x: 40, y: 40, c: G });
    return pdf(L);
  }
  function receiptPdf(s, p) {
    var d = db(), c = d.courses.filter(function (x) { return x.course_id === s.enr.course_id; })[0], code = c ? c.course_code : '',
      pays = (s.payments || []).slice().sort(function (a, b) { return a.payment_date < b.payment_date ? -1 : a.payment_date > b.payment_date ? 1 : 0; }), cum = 0, i;
    for (i = 0; i < pays.length; i++) { cum += Number(pays[i].amount_paid); if (pays[i].receipt_number === p.receipt_number) break; }
    var tot = Number(s.enr.net_fee || 0), bal = Math.max(0, tot - cum), inst = bal > 0 || pays.length > 1, m = String(p.payment_mode || ''), mk = /cash/i.test(m) ? 0 : /upi/i.test(m) ? 1 : /dd|cheque/i.test(m) ? 2 : -1,
      amt = function (n) { return Number(n).toLocaleString('en-IN') + '/-'; }, dp = String(p.payment_date).split('-'), L = [], K = '0 0 0', y = [646, 626, 607, 588], terms = ['- Cash once paid will not be refunded, if any service or', '  product initiated.', '- Fees once paid will not be refunded under any circumstances', '  irrespective of the duration of the course undertaken by', '  the Student.', '- DD/ Cheques subject to realization. DD/ Cheques should be', '  in Favour of "Balsam Creative Technology"'];
    function T(t, x, yy, sz, b, col) { L.push({ t: t, x: x, y: yy, s: sz || 10, b: b, c: col || K }); }
    function U(x1, x2, yy) { L.push({ raw: '0 0 0 RG 0.6 w ' + x1 + ' ' + yy + ' m ' + x2 + ' ' + yy + ' l S' }); }
    function R(x, yy, w, h, f) { L.push({ raw: f ? '0 0 0 rg ' + x + ' ' + yy + ' ' + w + ' ' + h + ' re f' : '0 0 0 RG 0.8 w ' + x + ' ' + yy + ' ' + w + ' ' + h + ' re S' }); }
    function X(x, yy, on) { R(x, yy - 2, 9, 9); if (on) L.push({ raw: '0 0 0 RG 1.4 w ' + (x + 1.5) + ' ' + (yy + 2.5) + ' m ' + (x + 4) + ' ' + yy + ' l ' + (x + 8) + ' ' + (yy + 7) + ' l S' }); }
    R(30, 428, 535, 388);
    T('Receipt No', 44, 780); T(':', 122, 780); T(p.receipt_number, 132, 780, 10, 1); T('Course Code', 44, 762); T(':', 122, 762); T(code, 132, 762, 10, 1); T('Regn No', 44, 744); T(':', 122, 744); T(s.registration_number, 132, 744, 10, 1);
    R(225, 760, 140, 24, 1); T('CASH RECEIPT', 247, 768, 12, 1, '1 1 1'); T('Balsam', 468, 776, 20, 1); T('Creative Technology', 468, 766, 7); T('Date', 455, 744, 10, 1); T(dp[2] + '.' + dp[1] + '.' + dp[0], 490, 744, 10, 1);
    T('Received with thanks from Mr./Mrs.', 44, 716); T(s.full_name, 236, 716, 10, 1); U(232, 555, 713);
    X(44, 692, 1); T('Course /', 58, 694); X(112, 692, 0); T('Service Details', 126, 694); T(s.enr.course_name, 218, 694, 10, 1); U(214, 555, 691);
    R(44, 662, 511, 18, 1); T('Particulars', 90, 667, 9, 1, '1 1 1'); T('Advance Received', 238, 667, 9, 1, '1 1 1'); T('Amount Received', 424, 667, 9, 1, '1 1 1');
    R(44, 582, 511, 98); L.push({ raw: '0 0 0 RG 0.8 w 190 582 m 190 662 l S 375 582 m 375 662 l S' });
    T('Single Payment', 50, y[0], 9); X(160, y[0], !inst); T('Instalments', 50, y[1], 9); X(160, y[1], inst); T('Total Duration', 50, y[2], 9); T(s.enr.duration_months + ' Months', 120, y[2], 9, 1); T('Actual Amount', 50, y[3], 9); T(amt(tot), 120, y[3], 9, 1);
    T('Registration Fees :', 196, y[0], 9); U(300, 368, y[0] - 2); T('Enrollment Fees :', 196, y[1], 9); U(300, 368, y[1] - 2); T('Instalment Fees :', 196, y[2], 9); T(amt(p.amount_paid), 302, y[2], 9, 1); U(300, 368, y[2] - 2); T('Instalment Fees :', 196, y[3], 9); U(300, 368, y[3] - 2);
    T('Concession @', 381, y[0], 9); U(450, 550, y[0] - 2); T('Service Tax @', 381, y[1], 9); U(450, 550, y[1] - 2); T('Tax @', 381, y[2], 9); U(450, 550, y[2] - 2); T('Amount Paid Rs.', 381, y[3], 9); T(amt(p.amount_paid), 465, y[3], 9, 1); U(462, 550, y[3] - 2);
    T('Total Amount', 44, 556); T(amt(tot), 114, 556, 10, 1); U(110, 192, 553); T('Advance Paid', 205, 556); T(amt(p.amount_paid), 276, 556, 10, 1); U(272, 358, 553); T('Balance Amount', 372, 556); T(amt(bal), 458, 556, 10, 1); U(454, 555, 553);
    T('Paid By', 44, 530); X(88, 528, mk === 0); T('Cash', 101, 530); X(136, 528, mk === 1); T('UPI', 149, 530); X(176, 528, mk === 2); T('DD/Cheque :', 189, 530); U(252, 322, 527); if (mk < 0) T(m, 254, 530, 9, 1);
    T('Next Due', 335, 530); R(385, 520, 170, 22); if (bal > 0 && s.enr.next_due_date) { var nd = String(s.enr.next_due_date).split('-'); T(nd[2] + '/' + nd[1] + '/' + nd[0], 391, 527, 10, 1); T('Rs. ' + amt(bal), 478, 527, 10, 1); } else T('-', 391, 527, 10, 1);
    terms.forEach(function (t, k) { T(t, 44, 500 - k * 9, 6.5); });
    T('Amount Received by', 300, 500, 9); U(300, 395, 462); T('FOR BALSAM CREATIVE TECHNOLOGY', 405, 500, 8, 1); U(425, 555, 462); T('Authorized Signatory', 452, 450, 8);
    T('No. 491, Bharathi St (Near Old Bus Stand), Puducherry - 605001', 120, 436, 8);
    return pdf(L);
  }
  function invoicePdf(s) {
    var t = new Date(), rows = (s.payments || []).map(function (p) { return ['Payment received', fmtIso(p.payment_date), p.receipt_number, rs(p.amount_paid)]; });
    if (!rows.length) rows = [['No payments recorded yet', '-', '-', '-']];
    return layout({ title: 'FEE INVOICE', left: [['BILLED TO', s.full_name], ['REGISTRATION NO.', s.registration_number], ['COURSE', s.enr.course_name]],
      right: [['INVOICE NO.', 'INV-' + s.registration_number + '-' + pad(t.getMonth() + 1) + t.getFullYear()], ['ISSUE DATE', fmtIso(iso(t))], ['NEXT DUE DATE', fmtIso(s.enr.next_due_date)]],
      cols: ['Description', 'Date', 'Reference', 'Amount'], xs: [40, 250, 350, 460], rows: rows, summary: [['Amount paid', rs(paidSum(s))], ['Balance due', rs(balance(s)), 1]], note: 'Please make the payment before the due date to avoid a late fee.' });
  }

  /* ---------- shared UI helpers ---------- */
  function head(h, sub, act) { return '<div class="page-head"><div><h1>' + h + '</h1><div class="sub">' + sub + '</div></div>' + (act ? '<div class="page-head-actions">' + act + '</div>' : '') + '</div><!--ph-end-->'; }
  function card(title, body, o) {
    o = o || {}; return '<div class="card' + (o.cls ? ' ' + o.cls : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + '>' + (title ? '<div class="card-head"><div><h3>' + title + '</h3>' + (o.desc ? '<div class="desc">' + o.desc + '</div>' : '') + '</div>' + (o.actions ? '<div class="page-head-actions">' + o.actions + '</div>' : '') + '</div>' : '') +
      '<div class="card-body' + (o.flush ? ' pad-0' : '') + '">' + body + '</div></div>';
  }
  function table(cols, rows, id) { return '<div class="table-wrap"><table class="data-table"><thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody' + (id ? ' id="' + id + '"' : '') + '>' + rows + '</tbody></table></div>'; }
  function emptyRow(n, msg) { return '<tr><td colspan="' + n + '" class="empty">' + esc(msg) + '</td></tr>'; }
  function field(id, label, type, val, ph, cls, extra) { return '<div class="form-group' + (cls ? ' ' + cls : '') + '"><label for="' + id + '">' + label + '</label><input type="' + (type || 'text') + '" id="' + id + '" value="' + esc(val == null ? '' : val) + '" placeholder="' + esc(ph || '') + '" ' + (extra || '') + '></div>'; }
  function select(id, label, opts, val, cls) {
    return '<div class="form-group' + (cls ? ' ' + cls : '') + '"><label for="' + id + '">' + label + '</label><select id="' + id + '">' + opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>';
  }
  function textarea(id, label, val, ph, cls) { return '<div class="form-group' + (cls ? ' ' + cls : '') + '"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" placeholder="' + esc(ph || '') + '">' + esc(val || '') + '</textarea></div>'; }
  function fileInput(id, label, cls) { return '<div class="form-group' + (cls ? ' ' + cls : '') + '"><label for="' + id + '">' + label + '</label><input type="file" id="' + id + '" class="file-in"></div>'; }
  function badge(t, kind) { return '<span class="badge ' + (kind || 'neutral') + '">' + esc(t) + '</span>'; }
  function fileLink(f) { return f && f.name ? (f.data ? '<a class="row-link" href="' + f.data + '" download="' + esc(f.name) + '">' + esc(f.name) + '</a>' : '<span class="file-chip">' + esc(f.name) + '</span>') : '<span class="muted">-</span>'; }
  function readFile(input, cb) {
    var f = input && input.files && input.files[0]; if (!f) { cb(null); return; }
    if (f.size > 1200000) { toast('File is too large for this demo (max 1.2 MB).'); return; }
    var r = new FileReader(); r.onload = function () { cb({ name: f.name, size: f.size, data: r.result }); }; r.onerror = function () { toast('Could not read the file.'); }; r.readAsDataURL(f);
  }
  function empty(msg, t) { return '<div class="empty-state">' + svg('folder') + '<h3>' + esc(t || 'Nothing here yet') + '</h3><p>' + esc(msg) + '</p></div>'; }
  function tabs(id, items, panels) {
    var h = location.hash.slice(1), cur = items.some(function (i) { return i[0] === h; }) ? h : items[0][0];
    return '<div class="tabs" id="' + id + '"><div class="tab-list" role="tablist">' + items.map(function (i) { return '<button type="button" role="tab" class="tab-b' + (i[0] === cur ? ' on' : '') + '" data-tab="' + i[0] + '">' + i[1] + '</button>'; }).join('') + '</div>' +
      items.map(function (i, k) { return '<div class="tab-p' + (i[0] === cur ? ' on' : '') + '" data-pane="' + i[0] + '">' + panels[k] + '</div>'; }).join('') + '</div>';
  }
  function bindTabs(id) {
    var w = $('#' + id); if (!w) return;
    w.addEventListener('click', function (e) {
      var b = e.target.closest('.tab-b'); if (!b || b.parentNode.parentNode !== w) return;
      $$('.tab-b', w).forEach(function (x) { if (x.parentNode.parentNode === w) x.classList.toggle('on', x === b); });
      $$('.tab-p', w).forEach(function (x) { if (x.parentNode === w) x.classList.toggle('on', x.getAttribute('data-pane') === b.getAttribute('data-tab')); });
      if (history.replaceState) history.replaceState(null, '', '#' + b.getAttribute('data-tab'));
    });
  }
  function multi(id, list, sel, label) {
    return '<div class="form-group span-2"><label>' + (label || 'Students') + '</label><div class="multi" id="' + id + '"><div class="multi-top"><input type="text" class="multi-q" placeholder="Search students"><label class="multi-all"><input type="checkbox" class="multi-allc"> Select all</label></div><div class="multi-list">' +
      (list.length ? list.map(function (s) { return '<label class="multi-i" data-t="' + esc((s.full_name + ' ' + s.registration_number).toLowerCase()) + '"><input type="checkbox" value="' + s.registration_number + '"' + (sel && sel.indexOf(s.registration_number) > -1 ? ' checked' : '') + '><span>' + esc(s.full_name) + '</span><em>' + s.registration_number + '</em></label>'; }).join('') : '<div class="empty">No students yet.</div>') + '</div></div></div>';
  }
  function bindMulti(id) {
    var w = $('#' + id); if (!w) return;
    $('.multi-q', w).oninput = function () { var q = this.value.trim().toLowerCase(); $$('.multi-i', w).forEach(function (r) { r.style.display = r.getAttribute('data-t').indexOf(q) > -1 ? '' : 'none'; }); };
    $('.multi-allc', w).onchange = function () { var c = this.checked; $$('.multi-i', w).forEach(function (r) { if (r.style.display !== 'none') $('input', r).checked = c; }); };
  }
  function multiVals(id) { return $$('#' + id + ' .multi-list input:checked').map(function (i) { return i.value; }); }
  function csv(rows) { return rows.map(function (r) { return r.map(function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n'); }
  function csvParse(text) {
    var rows = [], row = [], v = '', q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { v += '"'; i++; } else q = false; } else v += c; }
      else if (c === '"') q = true; else if (c === ',') { row.push(v); v = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(v); v = ''; if (row.some(function (x) { return x !== ''; })) rows.push(row); row = []; } else v += c;
    }
    row.push(v); if (row.some(function (x) { return x !== ''; })) rows.push(row); return rows;
  }
  function nItem(n) {
    var t = n.notification_type, h = t === 'Holiday Notice';
    return '<div class="n-item"><div class="n-ico' + (h ? ' holiday' : '') + '">' + svg(h ? 'cal' : 'bell') + '</div><div><div class="n-title">' + esc(n.title) + ' <span class="badge ' + (h ? 'warning' : 'info') + '">' + esc(t) + '</span></div><div class="n-msg">' + esc(n.message) + '</div><div class="n-date">' + fmtTs(n.created_at) + '</div></div></div>';
  }

  /* ---------- session, guard, navigation ---------- */
  var SESS = LS.get('bp_session5', null);
  var ROLE = PAGE.indexOf('admin-') === 0 ? 'admin' : PAGE.indexOf('student-') === 0 ? 'student' : null;
  var ME = null;
  if (SESS) ME = SESS.role === 'admin' ? db().admin : stu(SESS.reg);
  var NEW_OK = ['student-dashboard.html', 'student-notifications.html', 'student-profile.html'];
  function logout() { LS.del('bp_session5'); location.href = 'login.html'; }
  if (ROLE) {
    if (!SESS || SESS.role !== ROLE || !ME || (ROLE === 'student' && !ME.is_active)) { LS.del('bp_session5'); location.replace('login.html'); return; }
    if (ROLE === 'student' && ME.stage === 'new' && NEW_OK.indexOf(PAGE) < 0) { location.replace('student-dashboard.html'); return; }
    if (ROLE === 'student' && PAGE === 'student-placement.html' && !ME.placement_enabled) { location.replace('student-dashboard.html'); return; }
  }
  var NAV = {
    student: [['student-dashboard.html', 'Dashboard', 'dash'], ['student-profile.html', 'My Profile', 'user'], ['student-learning.html', 'My Learning', 'book'], ['student-fees.html', 'My Fees', 'rupee'], ['student-assessments.html', 'My Assessments', 'check'],
      ['student-completion.html', 'Course Completion', 'layers'], ['student-certificate.html', 'Certificate', 'award'], ['student-placement.html', 'Placement', 'brief'], ['student-notifications.html', 'Notifications', 'bell']],
    admin: [['admin-dashboard.html', 'Dashboard', 'dash'], ['admin-students.html', 'Students', 'users'], ['admin-courses.html', 'Courses', 'book'],
      ['admin-attendance.html', 'Attendance', 'cal'], ['admin-materials.html', 'Learning Materials', 'folder'], ['admin-assignments.html', 'Assignments & Projects', 'clip'], ['admin-assessments.html', 'Assessments', 'check'],
      ['admin-fees.html', 'Fees', 'rupee'], ['admin-completion.html', 'Completion & Certificates', 'award'], ['admin-placement.html', 'Placement', 'brief'],
      ['admin-notifications.html', 'Notification Center', 'bell'], ['admin-reports.html', 'Reports', 'chart'], ['admin-data-transfer.html', 'Data Transfer', 'swap'], ['admin-settings.html', 'Settings', 'gear']]
  };
  var REL = { 'admin-projects.html': 'admin-assignments.html', 'admin-assignment-details.html': 'admin-assignments.html', 'admin-certificates.html': 'admin-completion.html', 'admin-student-add.html': 'admin-students.html', 'admin-student-details.html': 'admin-students.html',
    'admin-course-details.html': 'admin-courses.html', 'admin-attendance-add.html': 'admin-attendance.html', 'admin-attendance-student.html': 'admin-attendance.html', 'admin-attendance-import.html': 'admin-attendance.html', 'admin-course-add.html': 'admin-courses.html', 'admin-material-add.html': 'admin-materials.html', 'admin-assignment-add.html': 'admin-assignments.html', 'admin-project-add.html': 'admin-assignments.html', 'admin-assessment-add.html': 'admin-assessments.html', 'admin-data-import.html': 'admin-data-transfer.html', 'admin-data-export.html': 'admin-data-transfer.html',
    'student-attendance.html': 'student-learning.html', 'student-project.html': 'student-learning.html', 'student-assessment-submission.html': 'student-assessments.html' };
  var PAIRS = { 'admin-attendance.html': [['admin-attendance.html', 'Daily register'], ['admin-attendance-student.html', 'Student calendar']], 'admin-attendance-student.html': [['admin-attendance.html', 'Daily register'], ['admin-attendance-student.html', 'Student calendar']], 'admin-assignments.html': [['admin-assignments.html', 'Assignments'], ['admin-projects.html', 'Projects']], 'admin-projects.html': [['admin-assignments.html', 'Assignments'], ['admin-projects.html', 'Projects']],
    'admin-completion.html': [['admin-completion.html', 'Course completion'], ['admin-certificates.html', 'Certificates']], 'admin-certificates.html': [['admin-completion.html', 'Course completion'], ['admin-certificates.html', 'Certificates']] };
  function buildShell(title) {
    var cur = REL[PAGE] || PAGE, items = NAV[ROLE];
    if (ROLE === 'student') items = items.filter(function (i) { if (ME.stage === 'new' && NEW_OK.indexOf(i[0]) < 0) return false; if (i[0] === 'student-placement.html' && !ME.placement_enabled) return false; return true; });
    $$('.sidebar > .nav-section-label').forEach(function (e) { e.remove(); });
    var nav = $('.nav'); if (nav) nav.innerHTML = items.map(function (i) {
      return typeof i === 'string' ? '<div class="nav-section-label">' + i + '</div>' : '<a class="nav-item' + (i[0] === cur ? ' active' : '') + '" href="' + i[0] + '">' + svg(i[2]) + '<span>' + i[1] + '</span></a>';
    }).join('');
    var role = $('.brand-text .role'); if (role) role.textContent = ROLE === 'admin' ? 'Admin workspace' : 'Student workspace';
    var foot = $('.sidebar-foot'); if (foot) { foot.innerHTML = '' + '<a class="switch-role" href="#" id="signOut">' + svg('out') + 'Sign out</a>'; $('#signOut').onclick = function (e) { e.preventDefault(); logout(); }; }
    var name = ROLE === 'admin' ? ME.full_name : ME.full_name, chip = $('.avatar-chip');
    if (chip) { $('.avatar', chip).textContent = initials(name); $('.n', chip).textContent = name; $('.r', chip).textContent = ROLE === 'admin' ? 'Administrator' : ME.registration_number; }
    var crumb = $('.crumb'); if (crumb) crumb.innerHTML = (ROLE === 'admin' ? 'Admin' : 'Student') + ' / <b>' + esc(title || '') + '</b>';
    var bell = $('.icon-btn'); if (bell) { bell.style.cursor = 'pointer'; bell.onclick = function () { location.href = ROLE === 'admin' ? 'admin-notifications.html' : 'student-notifications.html'; };
      var dot = $('.dot', bell); if (dot) { var has = ROLE === 'admin' ? (BP.alertCount ? BP.alertCount() : 0) : myNotifs(ME).length; if (!has) dot.style.display = 'none'; } }
    var sb = $('.search-box');
    if (sb) {
      if (ROLE === 'admin') {
        var si = $('input', sb); si.placeholder = 'Search students by name or reg. no.';
        si.addEventListener('keydown', function (e) { if (e.key === 'Enter' && si.value.trim()) location.href = 'admin-students.html?q=' + encodeURIComponent(si.value.trim()); });
      } else sb.style.visibility = 'hidden';
    }
    var pr = PAIRS[PAGE], ph = $('.content .page-head');
    if (pr && ph) ph.insertAdjacentHTML('beforebegin', '<div class="subtabs">' + pr.map(function (p) { return '<a href="' + p[0] + '"' + (p[0] === PAGE ? ' class="on"' : '') + '>' + p[1] + '</a>'; }).join('') + '</div>');
    var tg = $('#navToggle'); $$('.nav-item').forEach(function (a) { a.addEventListener('click', function () { if (tg) tg.checked = false; }); });
  }

  /* ---------- login ---------- */
  function initLogin() {
    var d = db(), go = $('#loginBtn'), err = $('#loginErr');
    function attempt() {
      var u = $('#loginU').value.trim().toLowerCase(), p = $('#loginP').value; if (!u || !p) { err.textContent = 'Enter your username and password.'; err.style.display = 'block'; return; }
      var h = hash(p), dd = db();
      if (u === dd.admin.username && h === dd.admin.password_hash) { LS.set('bp_session5', { role: 'admin' }); location.href = 'admin-dashboard.html'; return; }
      var s = dd.students.filter(function (x) { return (x.username.toLowerCase() === u || x.registration_number.toLowerCase() === u) && x.password_hash === h; })[0];
      if (s && !s.is_active) { err.textContent = 'This account is disabled. Please contact your admin.'; err.style.display = 'block'; return; }
      if (s) { s.last_login = Date.now(); put(dd); LS.set('bp_session5', { role: 'student', reg: s.registration_number }); location.href = 'student-dashboard.html'; return; }
      err.textContent = 'Incorrect username or password. Please contact your admin.'; err.style.display = 'block';
    }
    go.onclick = attempt; document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') attempt(); });
    if (SESS) { var s2 = SESS.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html'; $('#resume').style.display = 'block'; $('#resume a').href = s2; }
  }

  /* ---------- shared decorator: same icon chips, tab icons and empty states on every admin + student page ---------- */
  var HD = [[/needs attention|upcoming|deadline/i, '\u23F0'], [/quick/i, '\u26A1'], [/fee|payment|receipt|invoice|collection/i, '\uD83D\uDCB3'], [/attend/i, '\uD83D\uDCC5'], [/assessment|schedule an/i, '\uD83D\uDCDD'], [/material/i, '\uD83D\uDCDA'],
    [/assign|task|project|submit/i, '\uD83D\uDCCB'], [/certif/i, '\uD83C\uDFC5'], [/complet|progress/i, '\uD83C\uDF93'], [/course/i, '\uD83C\uDF93'], [/placement|resume|interview|portfolio/i, '\uD83D\uDCBC'], [/notif|message|announce|reminder|alert/i, '\uD83D\uDD14'],
    [/report|summary|chart|by /i, '\uD83D\uDCCA'], [/import|export|transfer|demo|log/i, '\uD83D\uDD04'], [/setting|password|security|access|credential|login/i, '\u2699\uFE0F'], [/student|profile|personal|identity|enrolled|faculty/i, '\uD83D\uDC64'], [/status/i, '\uD83C\uDFF7\uFE0F'], [/add|create|new|record/i, '\u2795']];
  var TI = [[/overview|^all/i, 'layers'], [/attend|schedul|calendar/i, 'cal'], [/assign|to do|todo/i, 'clip'], [/material|folder/i, 'folder'], [/project|certif/i, 'award'], [/complet|approved|paid/i, 'check'], [/pend|due|overdue|unpaid/i, 'clock'], [/submit/i, 'up'], [/invoice|receipt/i, 'file']];
  function decorate() {
    $$('.content .page-head h1, .card-head h3, .panel-head h3, .inv-h h3, .alert-card-head h3, .pcal-log-h, .sec-h, .lo-topics .eo-head').forEach(function (h) {
      if (h.getAttribute('data-dec')) return; h.setAttribute('data-dec', '1');
      var t = h.textContent.trim(), e = h.querySelector('.em-i');
      if (!e) { if (h.querySelector('.em')) return; if (/^(welcome|dashboard)/i.test(t)) return; for (var i = 0; i < HD.length; i++) if (HD[i][0].test(t)) { h.insertAdjacentHTML('afterbegin', '<span class="em-i">' + HD[i][1] + '</span>'); e = h.querySelector('.em-i'); break; } }
      if (e && !e.getAttribute('data-t')) { var n = 0, k, q = e.textContent; for (k = 0; k < q.length; k++) n += q.charCodeAt(k); e.setAttribute('data-t', n % 4); }
    });
    $$('.tab-b').forEach(function (b) {
      if (b.getAttribute('data-dec') || b.querySelector('svg')) return; b.setAttribute('data-dec', '1');
      var t = b.textContent.trim(); for (var i = 0; i < TI.length; i++) if (TI[i][0].test(t)) { b.insertAdjacentHTML('afterbegin', svg(TI[i][1])); break; }
    });
  }
  var decTimer = 0;
  function watchDecorate() {
    var c = $('.content'); if (!c) return; decorate();
    if (window.MutationObserver) new MutationObserver(function () { if (decTimer) return; decTimer = setTimeout(function () { decTimer = 0; decorate(); }, 30); }).observe(c, { childList: true, subtree: true });
  }

  /* ---------- boot ---------- */
  function boot() {
    if (/^(login|index)\.html$/.test(PAGE)) { if (PAGE === 'login.html') initLogin(); return; }
    if (!ROLE) return;
    var v = BP.views[PAGE], c = $('.content');
    if (c && v) { c.innerHTML = v.render(ME); }
    else if (c) { c.innerHTML = head('Page not available', 'This page is not part of the current portal.'); }
    buildShell(v && v.title);
    if (v && v.init) v.init(ME);
    watchDecorate();
    if (location.hash && !(v && v.tabs)) { var e = document.getElementById(location.hash.slice(1)); if (e) e.scrollIntoView(); }
  }
  BP.LS = LS; BP.$ = $; BP.$$ = $$; BP.esc = esc; BP.pad = pad; BP.iso = iso; BP.fmtIso = fmtIso; BP.fmtTs = fmtTs; BP.inr = inr; BP.t12 = t12; BP.initials = initials; BP.toast = toast; BP.download = download; BP.hash = hash; BP.genPass = genPass;
  BP.svg = svg; BP.db = db; BP.put = put; BP.stu = stu; BP.nid = nid; BP.paidSum = paidSum; BP.balance = balance; BP.attStats = attStats; BP.slotText = slotText; BP.certLabel = certLabel; BP.completionStatus = completionStatus;
  BP.notify = notify; BP.log = log; BP.mine = mine; BP.myNotifs = myNotifs; BP.whoLabel = whoLabel; BP.receiptPdf = receiptPdf; BP.invoicePdf = invoicePdf; BP.head = head; BP.card = card; BP.table = table; BP.emptyRow = emptyRow;
  BP.field = field; BP.select = select; BP.textarea = textarea; BP.fileInput = fileInput; BP.badge = badge; BP.fileLink = fileLink; BP.readFile = readFile; BP.empty = empty; BP.tabs = tabs; BP.bindTabs = bindTabs;
  BP.multi = multi; BP.bindMulti = bindMulti; BP.multiVals = multiVals; BP.csv = csv; BP.csvParse = csvParse; BP.nItem = nItem; BP.MON = MON; BP.MONF = MONF; BP.me = function () { return ME; }; BP.role = ROLE; BP.page = PAGE;
  BP.schedDays = schedDays; BP.isWorkday = isWorkday; BP.daysLabel = daysLabel; BP.mkStudent = mkStudent; BP.logout = logout; BP.resetDemo = function () { LS.del(KEY); };
  if (document.readyState !== 'loading') setTimeout(boot, 0); else document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); });
})();