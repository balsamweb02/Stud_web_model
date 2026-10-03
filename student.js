/* Balsam portal — student views */
(function () {
  'use strict';
  var B = window.BP, $ = B.$, $$ = B.$$, esc = B.esc, db = B.db, put = B.put, svg = B.svg, toast = B.toast, fmtIso = B.fmtIso, inr = B.inr;
  if (B.role !== 'student') return;
  var V = B.views;
  function me() { return B.stu(B.me().registration_number); }
  function refresh() { var v = V[B.page], s = me(); $('.content').innerHTML = v.render(s); if (v.init) v.init(s); }
  function statusBadge(t) { var k = { Pending: 'neutral', Submitted: 'info', 'Under Review': 'warning', 'Revision Required': 'danger', Completed: 'success', Evaluated: 'success', Scheduled: 'warning', Cancelled: 'danger', Verified: 'success', Rejected: 'danger', Approved: 'success', 'Changes Requested': 'danger' }[t]; return B.badge(t, k || 'neutral'); }
  function quick(href, ic, t, d) { return '<a class="qa" href="' + href + '"><span class="qa-ic">' + svg(ic) + '</span><span class="qa-t">' + t + '</span><span class="qa-d">' + d + '</span></a>'; }

  /* ================= dashboard ================= */
  V['student-dashboard.html'] = {
    title: 'Dashboard',
    render: function (s) {
      var f = esc(s.full_name.split(' ')[0]), e = s.enr;
      if (s.stage === 'new') {
        return B.head('Welcome, ' + f, 'Your admission is confirmed.') +
          '<div class="card notice-card"><div class="notice-ic">' + svg('check') + '</div><div><h3>Admission confirmed</h3><p>Your learning tools appear here once your course starts and the admin activates your access.</p>' +
          '<dl class="dmeta"><div><dt>Course</dt><dd>' + esc(e.course_name) + '</dd></div><div><dt>Start date</dt><dd>' + fmtIso(e.course_start_date) + '</dd></div><div><dt>Session</dt><dd>' + esc(e.slot_days) + ', ' + B.slotText(s) + '</dd></div><div><dt>Duration</dt><dd>' + e.duration_months + ' months</dd></div><div><dt>Faculty</dt><dd>' + esc(e.faculty_name) + '</dd></div></dl></div></div>' +
          B.card('Messages from the institute', B.myNotifs(s).slice(0, 5).map(B.nItem).join('') || '<div class="empty">No messages yet.</div>');
      }
      var a = B.attStats(s), bal = B.balance(s), p = e.progress_percent, n = B.myNotifs(s).slice(0, 4), cs = B.completionStatus(s), cert = B.certLabel(s.certificate.status);
      return B.head('Welcome back, ' + f, esc(e.course_name) + ' &middot; ' + s.registration_number) +
        '<div class="ov-strip">' +
          '<div class="ov-chip"><span class="ov-ic att">' + svg('cal') + '</span><div><b>' + (a.t ? a.pct + '%' : '-') + '</b><small>Attendance</small></div></div>' +
          '<div class="ov-chip"><span class="ov-ic prog">' + svg('layers') + '</span><div><b>' + p + '%</b><small>Course progress</small></div></div>' +
          '<div class="ov-chip"><span class="ov-ic fee">' + svg('rupee') + '</span><div><b>' + inr(bal) + '</b><small>Balance due</small></div></div>' +
          '<div class="ov-chip"><span class="ov-ic cert">' + svg('award') + '</span><div><b>' + cert + '</b><small>Certificate</small></div></div>' +
        '</div>' +
        '<div class="sec-h">Quick actions</div><div class="qa-row">' + quick('student-learning.html#attendance', 'cal', 'View Attendance', 'Calendar and monthly log') + quick('student-learning.html#project', 'layers', 'My Project', 'Upload work, see reviews') + quick('student-assessments.html', 'check', 'My Assessments', 'Scheduled, completed, results') + quick('student-fees.html#invoices', 'file', 'View Invoices', 'Receipts and bills') + quick('student-certificate.html', 'award', 'Certificate Status', 'Pending, Ready or Issued') + '</div>' +
        '<div class="dash-2col"><div class="dash-main">' +
          '<div class="card panel"><div class="panel-head"><h3>My Learning</h3><a class="link-blue" href="student-learning.html">Open &rarr;</a></div><div class="panel-body"><div class="mini-row"><span>Course progress</span><b>' + p + '%</b></div><div class="bar"><span style="width:' + p + '%"></span></div>' +
            '<div class="learn-meta"><div><dt>Topics covered</dt><dd>' + esc(e.progress_remarks || 'Not updated yet') + '</dd></div><div><dt>Session</dt><dd>' + esc(e.slot_days) + ', ' + B.slotText(s) + '</dd></div><div><dt>Assigned faculty</dt><dd>' + esc(e.faculty_name) + '</dd></div><div><dt>Completion</dt><dd>' + B.badge(cs[0], cs[1]) + '</dd></div></div></div></div>' +
          '<div class="card panel"><div class="panel-head"><h3>My Fees</h3><a class="link-blue" href="student-fees.html">Open &rarr;</a></div><div class="panel-body fee-inline"><div><dt>Balance amount</dt><dd class="due-amt">' + inr(bal) + '</dd></div><div><dt>Next due date</dt><dd>' + (bal && e.next_due_date ? fmtIso(e.next_due_date) : '&mdash;') + '</dd></div><a class="btn btn-primary" href="student-fees.html">' + (bal ? 'View dues' : 'View invoices') + '</a></div></div>' +
        '</div><div class="dash-side"><div class="card panel"><div class="panel-head"><h3>Notifications</h3><a class="link-blue" href="student-notifications.html">View all &rarr;</a></div><div class="panel-body pad-0">' + (n.map(B.nItem).join('') || '<div class="empty">No notifications yet.</div>') + '</div></div></div></div>';
    }
  };

  /* ================= profile ================= */
  V['student-profile.html'] = {
    title: 'My Profile',
    render: function (s) {
      var e = s.enr; function row(l, v) { return '<div class="item"><div class="l">' + l + '</div><div class="v">' + esc(v || '-') + '</div></div>'; }
      return B.head('My Profile', 'Your personal and course details.') +
        '<div class="card"><div class="card-body"><div class="profile-head"><div class="profile-id"><div class="profile-avatar">' + B.initials(s.full_name) + '</div><div><h2>' + esc(s.full_name) + '</h2><div class="meta">' + s.registration_number + ' &middot; ' + esc(e.course_name) + '</div></div></div>' + B.badge(s.stage === 'new' ? 'Onboarding' : s.overall_status, s.stage === 'new' ? 'info' : 'success') + '</div></div></div>' +
        '<div class="two-col">' + B.card('Personal details', '<div class="info-list">' + row('Registration number', s.registration_number) + row('Admission number', s.admission_number) + row('Full name', s.full_name) + row('Gender', s.gender) + row('Date of birth', s.dob ? fmtIso(s.dob) : '') + row('Admission date', s.admission_date ? fmtIso(s.admission_date) : '') + '</div>') +
        B.card('Course details', '<div class="info-list">' + row('Course enrolled', e.course_name) + row('Assigned faculty', e.faculty_name) + row('Time slot', e.slot_days + ', ' + B.slotText(s)) + row('Course duration', e.duration_months + ' months') + row('Start date', fmtIso(e.course_start_date)) + row('End date', e.course_end_date ? fmtIso(e.course_end_date) : '') + '</div>') + '</div>' +
        B.card('Contact details', '<div class="form-grid">' + B.field('pMob', 'Mobile', 'text', s.mobile) + B.field('pEm', 'Email', 'email', s.email) + B.field('pAd', 'Address', 'text', s.address, '', 'span-2') + '</div><p class="small-note">Your login details are managed by the institute. Contact your admin if you need them changed.</p><div class="form-actions"><button type="button" class="btn btn-primary" id="pSave">Save changes</button></div>');
    },
    init: function () { $('#pSave').onclick = function () { var d = db(), s = B.stu(B.me().registration_number, d); s.mobile = $('#pMob').value.trim(); s.email = $('#pEm').value.trim(); s.address = $('#pAd').value.trim(); put(d); toast('Profile updated'); }; }
  };

  /* ================= learning (tabs) ================= */
  var cal = { y: 0, m: 0 };
  function calendarHtml(s) {
    return '<div class="att-wrap"><div class="pcal"><div class="pcal-head"><button type="button" class="pcal-nav" id="cPrev" aria-label="Previous month">&#8249;</button><div class="pcal-title"><b id="cMon"></b><span id="cYear"></span></div><button type="button" class="pcal-nav" id="cNext" aria-label="Next month">&#8250;</button></div>' +
      '<div class="pcal-body"><div class="pcal-flip" id="cFlip"></div><div class="pcal-foot"><div class="pcal-stats" id="cStats"></div><div class="pcal-legend"><span><i class="lp"></i>Present</span><span><i class="la"></i>Absent</span><span><i class="ll"></i>Leave</span></div></div></div></div>' +
      '<div class="pcal-log"><div class="pcal-log-h" id="cLogH"></div><div id="cLog"></div></div></div>';
  }
  function initCalendar(s) {
    var a = s.attendance, keys = Object.keys(a).sort(), t = new Date(), last = keys.length ? keys[keys.length - 1].split('-') : [t.getFullYear(), B.pad(t.getMonth() + 1)];
    cal.y = +last[0]; cal.m = +last[1] - 1;
    function draw() {
      $('#cMon').textContent = B.MONF[cal.m]; $('#cYear').textContent = cal.y;
      var days = new Date(cal.y, cal.m + 1, 0).getDate(), first = new Date(cal.y, cal.m, 1).getDay(), h = '<div class="dow">' + 'SMTWTFS'.split('').map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div><div class="dgrid">', i, log = '', P = 0, A = 0, L = 0, tn = new Date();
      for (i = 0; i < first; i++) h += '<i></i>';
      for (i = 1; i <= days; i++) {
        var k = cal.y + '-' + B.pad(cal.m + 1) + '-' + B.pad(i), v = a[k], w = new Date(cal.y, cal.m, i).getDay(), now = tn.getFullYear() === cal.y && tn.getMonth() === cal.m && tn.getDate() === i;
        if (v === 'Present') P++; else if (v === 'Absent') A++; else if (v === 'Leave') L++;
        h += '<span class="d' + (v ? ' ' + v.toLowerCase() : '') + (!B.schedDays(s)[w] ? ' we' : '') + (now ? ' now' : '') + '"' + (v ? ' title="' + v + '"' : '') + '>' + i + '</span>';
        if (v) log = '<div class="log-r"><span>' + B.B_pad(i) + ' ' + B.MON[cal.m] + ' &middot; ' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w] + '</span>' + B.badge(v, v === 'Present' ? 'success' : v === 'Absent' ? 'danger' : 'warning') + '</div>' + log;
      }
      var tot = P + A + L; $('#cFlip').innerHTML = h + '</div>';
      $('#cStats').innerHTML = '<div><b>' + (tot ? Math.round(P / tot * 100) + '%' : '-') + '</b><small>This month</small></div><div><b>' + P + '</b><small>Present</small></div><div><b>' + A + '</b><small>Absent</small></div><div><b>' + L + '</b><small>Leave</small></div>';
      $('#cLogH').textContent = B.MONF[cal.m] + ' ' + cal.y + ' record'; $('#cLog').innerHTML = log || '<div class="empty">No attendance recorded this month.</div>';
    }
    function flip(dir) { var w = $('#cFlip'), r = dir < 0 ? 'r' : ''; w.className = 'pcal-flip out' + r;
      setTimeout(function () { cal.m += dir; if (cal.m > 11) { cal.m = 0; cal.y++; } if (cal.m < 0) { cal.m = 11; cal.y--; } draw(); w.className = 'pcal-flip in' + r; setTimeout(function () { w.className = 'pcal-flip'; }, 260); }, 170); }
    $('#cPrev').onclick = function () { flip(-1); }; $('#cNext').onclick = function () { flip(1); }; draw();
  }
  B.B_pad = B.pad;
  function tasksHtml(s) {
    var l = db().tasks.filter(function (t) { return t.registration_number === s.registration_number; });
    return l.length ? l.map(function (t) {
      var canUp = t.status !== 'Completed';
      return '<div class="work-card"><div class="work-top"><div><b>' + esc(t.title) + '</b><span>Due ' + fmtIso(t.due_date) + '</span></div>' + statusBadge(t.status) + '</div>' + (t.description ? '<p class="work-desc">' + esc(t.description) + '</p>' : '') + (t.brief_file ? '<div class="work-row"><span class="muted">Attachment</span>' + B.fileLink(t.brief_file) + '</div>' : '') +
        (t.submission_file ? '<div class="work-row"><span class="muted">Your file</span>' + B.fileLink(t.submission_file) + '</div>' : '') + (t.grade ? '<div class="work-row"><span class="muted">Grade</span><b>' + esc(t.grade) + '</b></div>' : '') + (t.remarks ? '<div class="work-row"><span class="muted">Remarks</span><span>' + esc(t.remarks) + '</span></div>' : '') +
        (canUp ? '<div class="work-up"><input type="file" class="file-in" id="tf' + t.task_id + '"><button type="button" class="btn btn-primary btn-sm" data-upload="' + t.task_id + '">' + svg('up') + (t.submission_file ? 'Replace' : 'Submit') + '</button></div>' : '') + '</div>';
    }).join('') : B.empty('No assignments have been given to you yet.', 'No assignments');
  }
  function materialsHtml(s) {
    var l = db().materials.filter(function (m) { return m.assigned_to.indexOf(s.registration_number) > -1 && m.approval_status === 'Approved'; });
    return l.length ? B.table(['Material', 'Type', 'Added', 'Open'], l.map(function (m) {
      var link = m.data ? '<a class="row-link" href="' + m.data + '" download="' + esc(m.file_path) + '">Download</a>' : /^https?:/i.test(m.file_path) ? '<a class="row-link" target="_blank" rel="noopener" href="' + esc(m.file_path) + '">Open</a>' : '<span class="muted">-</span>';
      return '<tr><td>' + esc(m.title) + '<div class="cell-sub">' + esc(/^https?:/i.test(m.file_path) ? 'Link' : m.file_path || '') + '</div></td><td>' + esc(m.type || 'File') + '</td><td>' + B.fmtTs(m.uploaded_at) + '</td><td>' + link + '</td></tr>'; }).join('')) : B.empty('Your faculty shares materials here when they are ready for you.', 'No materials yet');
  }
  function projectHtml(s) {
    var p = s.project;
    return (p ? '<div class="proj-head"><div><h3>' + esc(p.title || 'My project') + '</h3>' + (p.description ? '<p class="work-desc">' + esc(p.description) + '</p>' : '') + '</div>' + statusBadge(p.status) + '</div>' +
      '<div class="learn-meta"><div><dt>Due date</dt><dd>' + (p.due_date ? fmtIso(p.due_date) : '-') + '</dd></div><div><dt>Evaluation score</dt><dd>' + (p.evaluation_score === '' || p.evaluation_score == null ? 'Not evaluated' : esc(p.evaluation_score) + ' / 100') + '</dd></div><div><dt>Portfolio status</dt><dd>' + statusBadge(p.portfolio_status) + '</dd></div><div><dt>Submitted</dt><dd>' + (p.submitted_at ? fmtIso(p.submitted_at) : '-') + '</dd></div>' + (p.brief_file ? '<div><dt>Project brief</dt><dd>' + B.fileLink(p.brief_file) + '</dd></div>' : '') + '</div>' +
      (p.remarks ? '<div class="inline-note">Admin remarks: ' + esc(p.remarks) + '</div>' : '') : '<div class="inline-note">No project has been assigned yet. You can still upload your work below.</div>') +
      '<div class="form-grid" style="margin-top:16px">' + (p && p.title ? '' : B.field('prTitle', 'Project title', 'text', '', 'e.g. Student Portal', 'span-2')) + B.fileInput('prFile', 'Project file (ZIP or document, max 1.2 MB)' + (p && p.submission_file ? ' - current: ' + esc(p.submission_file.name) : ''), 'span-2') + B.field('prLink', 'Portfolio link', 'text', p ? p.portfolio_link : '', 'https://...', 'span-2') + '</div>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary" id="prSave">' + svg('up') + 'Submit project</button></div></div>';
  }
  V['student-learning.html'] = V['student-attendance.html'] = V['student-project.html'] = {
    title: 'My Learning', tabs: true,
    render: function (s) {
      var e = s.enr, a = B.attStats(s), p = e.progress_percent, pend = db().tasks.filter(function (t) { return t.registration_number === s.registration_number && t.status !== 'Completed'; }).length;
      if (B.page === 'student-attendance.html' && !location.hash) history.replaceState(null, '', '#attendance'); if (B.page === 'student-project.html' && !location.hash) history.replaceState(null, '', '#project');
      var overview = overviewHtml(s, e, a, p, pend) + ovExtra(s);
      return B.head('My Learning', 'Progress, attendance, assignments, materials and your project.') +
        B.tabs('lt', [['overview', 'Overview'], ['attendance', 'Attendance'], ['assignments', 'Assignments'], ['materials', 'Materials'], ['project', 'Project']], [overview, calendarHtml(s), '<div class="work-list" id="taskList">' + tasksHtml(s) + '</div>', materialsHtml(s), projectHtml(s)]);
    },
    init: function (s) {
      B.bindTabs('lt'); initCalendar(s);
      $('#taskList').onclick = function (e) { var b = e.target.closest('[data-upload]'); if (!b) return; var id = b.getAttribute('data-upload'), inp = $('#tf' + id); if (!inp.files.length) return toast('Choose a file first.');
        B.readFile(inp, function (f) { var d = db(), t = d.tasks.filter(function (x) { return String(x.task_id) === id; })[0]; t.submission_file = f; t.submitted_at = B.iso(); t.status = 'Submitted'; put(d); sn('Assignment Submission', 'Assignment submitted', 'You submitted "' + t.title + '".'); toast('Submitted'); refresh(); }); };
      $('#prSave').onclick = function () { var link = $('#prLink').value.trim(), ti = $('#prTitle'), inp = $('#prFile'); if (link && !/^https?:\/\//i.test(link)) return toast('The portfolio link must start with http:// or https://');
        var cur = me().project; if (!inp.files.length && !link && !cur) return toast('Add a file or a portfolio link.');
        function save(f) { var d = db(), st = B.stu(s.registration_number, d); if (!st.project) st.project = { title: ti ? ti.value.trim() || 'My project' : 'My project', description: '', due_date: '', submission_file: null, submitted_at: '', portfolio_link: '', status: 'Pending', evaluation_score: '', portfolio_status: 'Pending', remarks: '' };
          if (f) st.project.submission_file = f; if (link) st.project.portfolio_link = link; if (f || link) { st.project.submitted_at = B.iso(); if (st.project.status === 'Pending') st.project.status = 'Submitted'; } put(d); sn('Assignment Submission', 'Project updated', 'Your project submission was saved.'); toast('Project saved'); refresh(); }
        if (inp.files.length) B.readFile(inp, save); else save(null); };
    }
  };

  /* ================= fees ================= */
  V['student-fees.html'] = {
    title: 'My Fees',
    render: function (s) {
      var bal = B.balance(s), e = s.enr, rows = s.payments.slice().sort(function (a, b) { return a.payment_date < b.payment_date ? 1 : -1; }).map(function (p) {
        return '<tr><td>' + fmtIso(p.payment_date) + '</td><td>' + p.receipt_number + '</td><td>' + inr(p.amount_paid) + '</td><td>' + esc(p.payment_mode) + '</td><td><span class="paid">Paid</span></td><td><button type="button" class="dl-btn" data-rc="' + p.receipt_number + '" aria-label="Download receipt ' + p.receipt_number + '">' + svg('dl') + '</button></td></tr>'; }).join('');
      return B.head('My Fees', 'Your payments, balance and next due date.') +
        '<div class="fee-top"><div class="card fee-card"><h3>Amount Due</h3><div class="fee-hero"><div><div class="fee-big due">' + inr(bal) + '</div><div style="margin-top:10px">' + (bal ? '<span class="pill">Payment pending</span>' : '<span class="pill ok">All paid</span>') + '</div></div><div class="fee-icon">' + svg('rupee') + '</div></div>' +
          '<div class="fee-divider"></div><div class="fee-sub">Next payment due on</div><div class="due-row"><span class="cal-box">' + svg('cal') + '</span>' + (bal && e.next_due_date ? fmtIso(e.next_due_date) : '&mdash;') + '</div><div class="fee-actions"><button type="button" class="btn btn-primary" id="payNow">Pay Now</button><button type="button" class="btn btn-outline" id="viewInvoice">' + svg('dl') + 'Download Invoice</button></div></div>' +
          '<div class="card fee-card"><h3>Amount Paid</h3><div class="fee-hero"><div><div class="fee-big">' + inr(B.paidSum(s)) + '</div><div class="fee-sub">across ' + s.payments.length + ' payment' + (s.payments.length === 1 ? '' : 's') + '</div></div><div class="fee-icon green">' + svg('check') + '</div></div><div class="tip"><i>i</i>Receipts are available for every payment below.</div></div></div>' +
        '<div class="card fee-history" id="invoices"><div class="fee-history-head"><h3>Payment History</h3></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Receipt no.</th><th>Amount</th><th>Payment mode</th><th>Status</th><th>Receipt</th></tr></thead><tbody>' + (rows || B.emptyRow(6, 'No payments recorded yet.')) + '</tbody></table></div></div>' +
        '<div class="fee-note"><span class="info-dot">i</span><div><b>Note</b><span>Please make the payment before the due date to avoid a late fee.</span></div></div>';
    },
    init: function (s) {
      $$('[data-rc]').forEach(function (b) { b.onclick = function () { var p = s.payments.filter(function (x) { return x.receipt_number === b.getAttribute('data-rc'); })[0]; B.download(B.receiptPdf(s, p), 'Receipt-' + p.receipt_number + '.pdf'); sn('Receipt Download', 'Receipt downloaded', 'You downloaded receipt ' + p.receipt_number + ' (' + inr(p.amount_paid) + ').'); toast('Receipt downloaded'); }; });
      $('#viewInvoice').onclick = function () { B.download(B.invoicePdf(s), 'Invoice-' + s.registration_number + '.pdf'); sn('Receipt Download', 'Invoice downloaded', 'You downloaded your fee invoice.'); toast('Invoice downloaded'); };
      $('#payNow').onclick = function () { toast('Online payment is not enabled. Please pay at the institute - the admin will record it.'); };
    }
  };

  /* ================= assessments ================= */
  function perf(pct) { return pct >= 85 ? ['Excellent', 'success'] : pct >= 70 ? ['Good', 'info'] : pct >= 50 ? ['Average', 'warning'] : ['Needs improvement', 'danger']; }
  V['student-assessments.html'] = V['student-assessment-submission.html'] = {
    title: 'My Assessments',
    render: function (s) {
      var l = db().assessments.filter(function (a) { return a.registration_number === s.registration_number; }).sort(function (a, b) { return a.scheduled_date < b.scheduled_date ? -1 : 1; }), up = l.filter(function (a) { return a.status === 'Scheduled'; }), done = l.filter(function (a) { return a.status !== 'Scheduled'; });
      var scored = l.filter(function (a) { return a.marks !== '' && a.marks != null; }), avg = scored.length ? Math.round(scored.reduce(function (t, a) { return t + a.marks / a.max_marks * 100; }, 0) / scored.length) : null, pf = avg == null ? null : perf(avg), p = s.project;
      function card(a) {
        var canUp = a.status !== 'Cancelled';
        return '<div class="work-card"><div class="work-top"><div><b>' + esc(a.title) + '</b><span>' + esc(a.assessment_type) + ' &middot; ' + fmtIso(a.scheduled_date) + ' at ' + B.t12(a.scheduled_time) + ' &middot; ' + a.mode + '</span></div>' + statusBadge(a.status) + '</div>' +
          (a.marks !== '' && a.marks != null ? '<div class="work-row"><span class="muted">Marks</span><b>' + a.marks + ' / ' + a.max_marks + '</b></div>' : '') + (a.remarks ? '<div class="work-row"><span class="muted">Remarks</span><span>' + esc(a.remarks) + '</span></div>' : '') +
          (a.submission_file ? '<div class="work-row"><span class="muted">Your work</span>' + B.fileLink(a.submission_file) + '</div>' : '') +
          (canUp ? '<div class="work-up"><input type="file" class="file-in" id="af' + a.schedule_id + '"><button type="button" class="btn btn-primary btn-sm" data-upload="' + a.schedule_id + '">' + svg('up') + (a.submission_file ? 'Replace work' : 'Upload work') + '</button></div>' : '') + '</div>';
      }
      return B.head('My Assessments', 'Practical assessments, project evaluation and your performance.') +
        '<div class="ov-strip three"><div class="ov-chip"><span class="ov-ic prog">' + svg('clock') + '</span><div><b>' + up.length + '</b><small>Upcoming</small></div></div><div class="ov-chip"><span class="ov-ic att">' + svg('check') + '</span><div><b>' + done.filter(function (a) { return a.status === 'Completed'; }).length + '</b><small>Completed</small></div></div>' +
        '<div class="ov-chip"><span class="ov-ic cert">' + svg('award') + '</span><div><b>' + (pf ? pf[0] : '-') + '</b><small>Performance' + (avg != null ? ' (' + avg + '%)' : '') + '</small></div></div></div>' +
        B.tabs('at', [['upcoming', 'Upcoming'], ['results', 'Completed & results'], ['project', 'Project evaluation']], ['<div class="work-list">' + (up.map(card).join('') || B.empty('No assessments are scheduled for you right now.', 'Nothing upcoming')) + '</div>', '<div class="work-list">' + (done.map(card).join('') || B.empty('Results appear here once an assessment is completed.', 'No results yet')) + '</div>',
          B.card('', p ? '<div class="proj-head"><div><h3>' + esc(p.title || 'My project') + '</h3></div>' + statusBadge(p.status) + '</div><div class="learn-meta"><div><dt>Evaluation score</dt><dd>' + (p.evaluation_score === '' || p.evaluation_score == null ? 'Not evaluated yet' : esc(p.evaluation_score) + ' / 100') + '</dd></div><div><dt>Portfolio status</dt><dd>' + statusBadge(p.portfolio_status) + '</dd></div></div>' + (p.remarks ? '<div class="inline-note">Remarks: ' + esc(p.remarks) + '</div>' : '') + '<div class="form-actions" style="justify-content:flex-start"><a class="btn btn-outline" href="student-learning.html#project">Open my project</a></div>' : B.empty('No project has been assigned yet.', 'No project'))]);
    },
    init: function () {
      B.bindTabs('at');
      $$('[data-upload]').forEach(function (b) { b.onclick = function () { var id = b.getAttribute('data-upload'), inp = $('#af' + id); if (!inp.files.length) return toast('Choose a file first.');
        B.readFile(inp, function (f) { var d = db(), a = d.assessments.filter(function (x) { return String(x.schedule_id) === id; })[0]; a.submission_file = f; a.submitted_at = B.iso(); put(d); sn('Assignment Submission', 'Assessment work uploaded', 'You uploaded work for "' + a.title + '".'); toast('Work uploaded'); refresh(); }); }; });
    }
  };

  /* ================= completion ================= */
  V['student-completion.html'] = {
    title: 'Course Completion',
    render: function (s) {
      var e = s.enr, cs = B.completionStatus(s), a = B.attStats(s), d = db(), tasks = d.tasks.filter(function (t) { return t.registration_number === s.registration_number; }), asm = d.assessments.filter(function (x) { return x.registration_number === s.registration_number && x.status !== 'Cancelled'; });
      function req(l, ok, txt) { return '<div class="req-row"><span class="req-ic ' + (ok ? 'ok' : '') + '">' + svg(ok ? 'check' : 'clock') + '</span><div><b>' + l + '</b><span>' + txt + '</span></div>' + B.badge(ok ? 'Met' : 'Pending', ok ? 'success' : 'warning') + '</div>'; }
      var tOk = tasks.every(function (t) { return t.status === 'Completed'; }), aOk = asm.length > 0 && asm.every(function (x) { return x.status === 'Completed'; });
      return B.head('Course Completion', 'Your completion status and what is still needed.') +
        '<div class="two-col">' + B.card('Status', '<div class="mini-row"><span>Course progress</span><b>' + e.progress_percent + '%</b></div><div class="bar"><span style="width:' + e.progress_percent + '%"></span></div><div class="status-big">' + B.badge(cs[0], cs[1]) + '</div><p class="topics">' + esc(e.progress_remarks || '') + '</p>') +
        B.card('Requirements', req('Attendance', a.t > 0 && a.pct >= 75, a.t ? a.pct + '% (75% needed)' : 'No records yet') + req('Assignments', tasks.length > 0 && tOk, tasks.length ? tasks.filter(function (t) { return t.status === 'Completed'; }).length + ' of ' + tasks.length + ' completed' : 'None assigned') + req('Assessments', aOk, asm.length ? asm.filter(function (x) { return x.status === 'Completed'; }).length + ' of ' + asm.length + ' completed' : 'None scheduled') + req('Fees', B.balance(s) === 0, B.balance(s) ? inr(B.balance(s)) + ' balance' : 'Cleared'), { }) + '</div>';
    }
  };

  /* ================= certificate ================= */
  V['student-certificate.html'] = {
    title: 'Certificate',
    render: function (s) {
      var c = s.certificate, lab = B.certLabel(c.status), n = lab === 'Issued' ? 3 : lab === 'Ready' ? 2 : B.completionStatus(s)[0] === 'Completed' ? 1 : 0;
      var k = lab === 'Issued' ? 'success' : lab === 'Ready' ? 'info' : 'neutral';
      var head = lab === 'Issued' ? 'Certificate issued' : lab === 'Ready' ? 'Ready for collection' : n ? 'Being prepared' : 'Not available yet';
      var msg = lab === 'Issued' ? 'Your certificate has been issued by the institute.' : lab === 'Ready' ? 'Your certificate is ready. The institute will hand it over to you.' : n ? 'Your course is complete. The institute is preparing your certificate.' : 'Your certificate is prepared after you complete the course.';
      var steps = ['Course completed', 'Certificate prepared', 'Certificate issued'];
      function m(l, v) { return '<div><dt>' + l + '</dt><dd>' + esc(v || '-') + '</dd></div>'; }
      return B.head('Certificate', 'Current status of your course certificate.') +
        '<div class="card cs"><div class="cs-top"><span class="cs-ic ' + k + '">' + svg('award') + '</span><div><h2>' + head + '</h2><p>' + msg + '</p></div>' + B.badge(lab, k) + '</div>' +
        '<ol class="cs-steps">' + steps.map(function (t, x) { return '<li class="' + (x < n ? 'done' : x === n ? 'now' : '') + '"><span>' + (x < n ? '&#10003;' : x + 1) + '</span>' + t + '</li>'; }).join('') + '</ol>' +
        '<dl class="cs-meta">' + m('Course', s.enr.course_name) + m('Certificate no.', c.certificate_number) + m('Issue date', c.issued_at ? fmtIso(c.issued_at) : '') + m('Last updated', c.updated_at ? fmtIso(c.updated_at) : '') + '</dl>' +
        '<p class="cs-note">Certificate files are handed over by the institute, so this page shows status only.</p></div>';
    }
  };

  /* ================= placement ================= */
  V['student-placement.html'] = {
    title: 'Placement',
    render: function (s) {
      var p = s.placement;
      return B.head('Placement', 'Resume, portfolio, interviews and placement status.') +
        '<div class="ov-strip three"><div class="ov-chip"><span class="ov-ic prog">' + svg('brief') + '</span><div><b>' + esc(p.placement_status) + '</b><small>Placement status</small></div></div><div class="ov-chip"><span class="ov-ic att">' + svg('file') + '</span><div><b>' + (p.resume_submitted ? esc(p.resume_status) : 'Not uploaded') + '</b><small>Resume</small></div></div><div class="ov-chip"><span class="ov-ic cert">' + svg('user') + '</span><div><b>' + (p.portfolio_submitted ? esc(p.portfolio_status) : 'No link') + '</b><small>Portfolio</small></div></div></div>' +
        '<div class="two-col">' + B.card('Resume', '<p class="small-note" style="margin-bottom:10px">Current: ' + (p.resume_file ? B.fileLink(p.resume_file) + ' ' + statusBadge(p.resume_status) : 'nothing uploaded') + '</p>' + B.fileInput('rsFile', 'Upload or replace resume (PDF, max 1.2 MB)') + '<div class="form-actions"><button type="button" class="btn btn-primary" id="rsSave">' + svg('up') + 'Upload resume</button></div>') +
        B.card('Portfolio', B.field('poLink', 'Portfolio link', 'text', p.portfolio_link_url, 'https://...') + '<p class="small-note" style="margin-top:8px">Status: ' + (p.portfolio_submitted ? statusBadge(p.portfolio_status) : 'not submitted') + '</p><div class="form-actions"><button type="button" class="btn btn-primary" id="poSave">Save link</button></div>') + '</div>' +
        B.card('Interview schedule', B.table(['Company', 'Role', 'Date', 'Round', 'Status'], p.interviews.map(function (i) { return '<tr><td>' + esc(i.company) + '</td><td>' + esc(i.role || '-') + '</td><td>' + fmtIso(i.date) + '</td><td>' + esc(i.round) + '</td><td>' + statusBadge(i.status) + '</td></tr>'; }).join('') || B.emptyRow(5, 'No interviews scheduled yet.')), { flush: 1 });
    },
    init: function (s) {
      $('#rsSave').onclick = function () { var inp = $('#rsFile'); if (!inp.files.length) return toast('Choose a file first.'); B.readFile(inp, function (f) { var d = db(), p = B.stu(s.registration_number, d).placement; p.resume_file = f; p.resume_submitted = true; p.resume_status = 'Pending'; put(d); sn('Placement Notification', 'Resume uploaded', 'Your resume is awaiting verification.'); toast('Resume uploaded'); refresh(); }); };
      $('#poSave').onclick = function () { var v = $('#poLink').value.trim(); if (!/^https?:\/\//i.test(v)) return toast('The link must start with http:// or https://'); var d = db(), p = B.stu(s.registration_number, d).placement; p.portfolio_link_url = v; p.portfolio_submitted = true; p.portfolio_status = 'Pending'; put(d); sn('Placement Notification', 'Portfolio link saved', 'Your portfolio link is awaiting verification.'); toast('Portfolio link saved'); refresh(); };
    }
  };

  /* ================= notifications ================= */
  V['student-notifications.html'] = {
    title: 'Notifications',
    render: function (s) {
      var all = B.myNotifs(s), ann = ['Bulk Message', 'Holiday Notice', 'Class Reminder'], a = all.filter(function (n) { return ann.indexOf(n.notification_type) < 0; }), b = all.filter(function (n) { return ann.indexOf(n.notification_type) > -1; });
      return B.head('Notifications', 'Class schedule, fee reminders, deadlines, exam schedule and institute announcements.') +
        '<div class="two-col">' + B.card('Notifications', a.map(B.nItem).join('') || '<div class="empty">No notifications yet.</div>') + B.card('Announcements', b.map(B.nItem).join('') || '<div class="empty">No announcements yet.</div>') + '</div>';
    }
  };
  /* ================= PHASE 1 upgrades ================= */
  function ring(p, sz) { return '<div class="ring" style="--p:' + p + ';--s:' + (sz || 96) + 'px"><b>' + p + '%</b></div>'; }
  function reqs(s) {
    var d = db(), a = B.attStats(s), bal = B.balance(s), rn = s.registration_number,
      tk = d.tasks.filter(function (t) { return t.registration_number === rn; }), as = d.assessments.filter(function (x) { return x.registration_number === rn && x.status !== 'Cancelled'; }),
      td = tk.filter(function (t) { return t.status === 'Completed'; }).length, ad = as.filter(function (x) { return x.status === 'Completed'; }).length;
    return [['Attendance', a.t > 0 && a.pct >= 75, a.t ? a.pct + '% (75% needed)' : 'No records yet'], ['Assignments', tk.length > 0 && td === tk.length, tk.length ? td + ' of ' + tk.length + ' done' : 'None assigned'],
      ['Assessments', as.length > 0 && ad === as.length, as.length ? ad + ' of ' + as.length + ' done' : 'None scheduled'], ['Fees', bal === 0, bal ? inr(bal) + ' balance' : 'Cleared']];
  }
  function reqList(s) { return '<div class="cc-list">' + reqs(s).map(function (r) { return '<div class="cc-i' + (r[1] ? ' ok' : '') + '"><span>' + svg(r[1] ? 'check' : 'clock') + '</span><div><b>' + r[0] + '</b><small>' + r[2] + '</small></div></div>'; }).join('') + '</div>'; }
  function ql(href, ic, t) { return '<a class="ql" href="' + href + '"><span>' + svg(ic) + '</span>' + t + '</a>'; }

  var dashOld = V['student-dashboard.html'].render;
  V['student-dashboard.html'].render = function (s) {
    if (s.stage === 'new') return dashOld(s);
    var e = s.enr, p = e.progress_percent, bal = B.balance(s), a = B.attStats(s), cs = B.completionStatus(s), n = B.myNotifs(s).slice(0, 4), cert = B.certLabel(s.certificate.status),
      due = bal && e.next_due_date ? Math.ceil((new Date(e.next_due_date) - new Date().setHours(0, 0, 0, 0)) / 864e5) : null,
      dt = due == null ? '' : due < 0 ? 'Overdue by ' + (-due) + (due === -1 ? ' day' : ' days') : due === 0 ? 'Due today' : 'Due in ' + due + (due === 1 ? ' day' : ' days'), tone = due != null && due <= 3 ? ' urgent' : '';
    return '<div class="dash-hero"><div><small>Welcome back</small><h1>' + esc(s.full_name.split(' ')[0]) + '</h1><p>' + esc(e.course_name) + ' &middot; ' + s.registration_number + ' &middot; Faculty ' + esc(e.faculty_name) + '</p><div class="dh-tags">' + B.badge(cs[0], cs[1]) + '<span class="dh-tag">Certificate: ' + cert + '</span></div></div>' + ring(p, 104) + '</div>' +
      '<div class="dash-2col"><div>' +
        '<div class="card panel"><div class="panel-head"><h3>Course completion</h3><a class="link-blue" href="student-completion.html">Details &rarr;</a></div><div class="panel-body"><div class="mini-row"><span>Overall progress</span><b>' + p + '%</b></div><div class="bar"><span style="width:' + p + '%"></span></div>' + reqList(s) + '</div></div>' +
        '<div class="ov-strip three"><div class="ov-chip"><span class="ov-ic att">' + svg('cal') + '</span><div><b>' + (a.t ? a.pct + '%' : '-') + '</b><small>Attendance</small></div></div><div class="ov-chip"><span class="ov-ic prog">' + svg('clip') + '</span><div><b>' + db().tasks.filter(function (t) { return t.registration_number === s.registration_number && t.status !== 'Completed'; }).length + '</b><small>Pending tasks</small></div></div><div class="ov-chip"><span class="ov-ic cert">' + svg('award') + '</span><div><b>' + cert + '</b><small>Certificate</small></div></div></div>' +
      '</div><div>' +
        '<div class="card fee-rem' + (bal ? tone : ' clear') + '"><div class="fr-top"><span class="fr-ic">' + svg('rupee') + '</span><div><small>Fee reminder</small><b class="fr-amt">' + (bal ? inr(bal) : 'All fees paid') + '</b></div></div>' + (bal ? '<div class="fr-due">' + svg('cal') + '<span>' + (e.next_due_date ? fmtIso(e.next_due_date) : 'Date not set') + '</span><em>' + dt + '</em></div><a class="btn btn-primary btn-sm" href="student-fees.html">View dues</a>' : '<div class="fr-due"><span>You have no pending balance.</span></div>') + '</div>' +
        '<div class="card panel"><div class="panel-head"><h3>Notifications</h3><a class="link-blue" href="student-notifications.html">View all &rarr;</a></div><div class="panel-body pad-0">' + (n.map(B.nItem).join('') || '<div class="empty">No notifications yet.</div>') + '</div></div>' +
      '</div></div><div class="sec-h">Quick links</div><div class="ql-row">' + ql('student-learning.html#attendance', 'cal', 'Attendance') + ql('student-learning.html', 'book', 'My Learning') + ql('student-assessments.html', 'check', 'Assessments') + ql('student-fees.html#invoices', 'file', 'Invoices') + ql('student-placement.html', 'brief', 'Placement') + ql('student-certificate.html', 'award', 'Certificate') + '</div>';
  };

  V['student-profile.html'] = {
    title: 'My Profile',
    render: function (s) {
      var e = s.enr; function ro(l, v) { return '<div class="item"><div class="l">' + l + '</div><div class="v">' + esc(v || '-') + '</div></div>'; }
      var gn = ['Male', 'Female', 'Other'].map(function (g) { return '<option' + (s.gender === g ? ' selected' : '') + '>' + g + '</option>'; }).join('');
      var personal = '<div class="form-grid">' + B.field('pNm', 'Full name', 'text', s.full_name) + '<div class="form-group"><label for="pGn">Gender</label><select id="pGn"><option value="">Select</option>' + gn + '</select></div>' + B.field('pDb', 'Date of birth', 'date', s.dob) + B.field('pMob', 'Mobile', 'text', s.mobile) + B.field('pEm', 'Email', 'email', s.email, '', 'span-2') + B.field('pAd', 'Address', 'text', s.address, '', 'span-2') + '</div><div class="form-actions"><button type="button" class="btn btn-outline" id="pReset">Reset</button><button type="button" class="btn btn-primary" id="pSave">Save changes</button></div>';
      var course = '<div class="info-list">' + ro('Registration number', s.registration_number) + ro('Admission number', s.admission_number) + ro('Course', e.course_name) + ro('Faculty', e.faculty_name) + ro('Time slot', e.slot_days + ', ' + B.slotText(s)) + ro('Duration', e.duration_months + ' months') + ro('Start date', fmtIso(e.course_start_date)) + ro('Admission date', s.admission_date ? fmtIso(s.admission_date) : '') + '</div><p class="small-note" style="margin-top:12px">These details are managed by the institute.</p>';
      return B.head('My Profile', 'Keep your personal details up to date.') +
        '<div class="card"><div class="card-body"><div class="profile-head"><div class="profile-id"><div class="profile-avatar">' + B.initials(s.full_name) + '</div><div><h2>' + esc(s.full_name) + '</h2><div class="meta">' + s.registration_number + ' &middot; ' + esc(e.course_name) + '</div></div></div>' + B.badge(s.overall_status || 'Active', 'success') + '</div></div></div>' +
        B.tabs('pf', [['personal', 'Personal details'], ['course', 'Course & identity']], [personal, course]);
    },
    init: function (s) {
      B.bindTabs('pf');
      $('#pReset').onclick = function () { refresh(); };
      $('#pSave').onclick = function () {
        var nm = $('#pNm').value.trim(), mb = $('#pMob').value.trim(), em = $('#pEm').value.trim();
        if (!nm) return toast('Full name is required.'); if (mb && !/^[+\d][\d\s-]{7,15}$/.test(mb)) return toast('Enter a valid mobile number.'); if (em && !/^\S+@\S+\.\S+$/.test(em)) return toast('Enter a valid email address.');
        var d = db(), st = B.stu(s.registration_number, d); st.full_name = nm; st.gender = $('#pGn').value; st.dob = $('#pDb').value; st.mobile = mb; st.email = em; st.address = $('#pAd').value.trim(); put(d);
        var c = $('.avatar-chip .n'); if (c) c.textContent = nm; toast('Profile updated'); refresh();
      };
    }
  };

  function tile(ic, l, v, sub) { return '<div class="lo-tile"><span>' + svg(ic) + '</span><div><small>' + l + '</small><b>' + v + '</b><em>' + sub + '</em></div></div>'; }
  function stat(ic, tone, l, v, sub) { return '<div class="lo-stat"><div class="lo-stat-t"><small>' + l + '</small><b class="' + tone + '">' + v + '</b><em>' + sub + '</em></div><span class="lo-stat-ic ' + tone + '">' + svg(ic) + '</span></div>'; }
  function overviewHtml(s, e, a, p, pend) {
    var tp = (e.progress_remarks || '').split(/[,;\n]+/).map(function (x) { return x.trim(); }).filter(Boolean), cs = B.completionStatus(s);
    return '<div class="lo2-top"><div class="eo-card lo2-prog"><div class="fd-h"><span class="fd-t">Course Progress</span>' + B.badge(cs[0], cs[1]) + '</div>' +
      '<div class="fd-hero"><div><div class="fd-big g">' + p + '%</div><div class="fd-sub">of course completed</div></div><div class="fd-ic g">' + svg('clip') + '</div></div>' +
      '<div class="bar"><span style="width:' + p + '%"></span></div>' +
      '<div class="fd-tip"><i>i</i><span>' + esc(e.course_name) + ' &middot; ' + e.duration_months + ' months &middot; ' + (e.progress_updated_at ? 'Updated ' + fmtIso(e.progress_updated_at) : 'Not updated yet') + '</span></div></div>' +
      '<div class="lo2-stats">' + stat('cal', 'g', 'Attendance', a.t ? a.pct + '%' : '-', a.P + ' present &middot; ' + a.A + ' absent') + stat('clip', 'o', 'Pending tasks', pend, 'Assignments to submit') + stat('user', 'b', 'Faculty', esc(e.faculty_name), 'Assigned mentor') + stat('clock', 'p', 'Session', esc(e.slot_days), B.slotText(s)) + '</div></div>' +
      '<div class="eo-card lo-topics"><div class="eo-head"><span class="em">\uD83E\uDDE0</span>Topics covered</div>' + (tp.length ? '<div class="chips">' + tp.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' : '<p class="small-note">Your faculty has not updated the topics yet.</p>') + '</div>';
  }
  /* ================= PHASE 2 upgrades ================= */
  function sn(type, title, msg) { B.notify({ to: B.me().registration_number, notification_type: type, title: title, message: msg }); }
  function autoFeeReminder(s) {
    var bal = B.balance(s), nd = s.enr.next_due_date; if (!bal || !nd) return;
    var days = Math.ceil((new Date(nd) - new Date().setHours(0, 0, 0, 0)) / 864e5); if (days > 3) return;
    var today = new Date().toDateString(), dup = db().notifications.some(function (n) { return n.to === s.registration_number && n.title === 'Fee reminder' && new Date(n.created_at).toDateString() === today; });
    if (!dup) sn('Fee Due Reminder', 'Fee reminder', 'Your balance of ' + inr(bal) + (days < 0 ? ' is overdue since ' : ' is due on ') + fmtIso(nd) + '.');
  }
  var NI = { 'Holiday Notice': ['cal', 'warning'], 'Bulk Message': ['bell', 'info'], 'Fee Due Reminder': ['rupee', 'warning'], 'Receipt Download': ['file', 'success'], 'Assignment Submission': ['clip', 'success'], 'Assessment Reminder': ['check', 'info'], 'Placement Notification': ['brief', 'info'], 'Certificate Ready Notification': ['award', 'success'], 'Class Reminder': ['clock', 'info'] };
  B.nItem = function (n) {
    var t = n.notification_type, m = NI[t] || ['bell', 'info'];
    return '<div class="n-item"><div class="n-ico nt-' + m[1] + '">' + svg(m[0]) + '</div><div><div class="n-title">' + esc(n.title) + ' <span class="badge ' + m[1] + '">' + esc(t) + '</span></div><div class="n-msg">' + esc(n.message).replace(/\n/g, '<br>') + '</div><div class="n-date">' + B.fmtTs(n.created_at) + '</div></div></div>';
  };
  var dOld = V['student-dashboard.html'].render;
  function arcGauge(pct, tone) {
    var r = 46, cx = 56, cy = 56, circ = Math.PI * r, off = circ * (1 - pct / 100);
    return '<svg viewBox="0 0 112 66"><path class="arc-bg" d="M10 56 A46 46 0 0 1 102 56"></path>' +
      '<path class="arc-fg ' + tone + '" d="M10 56 A46 46 0 0 1 102 56" stroke-dasharray="' + circ + '" stroke-dashoffset="' + off + '"></path>' +
      '<text class="arc-val" x="56" y="50">' + pct + '%</text></svg>';
  }
  function qa3(href, em, t, d) { return '<a class="qa3" href="' + href + '"><span class="em">' + em + '</span><b>' + t + '</b><span>' + d + '</span></a>'; }
  V['student-dashboard.html'].render = function (s) {
    if (s.stage === 'new') return dOld(s);
    autoFeeReminder(s);
    var e = s.enr, f = esc(s.full_name.split(' ')[0]), p = e.progress_percent || 0, bal = B.balance(s), a = B.attStats(s), cert = B.certLabel(s.certificate.status), n = B.myNotifs(s).slice(0, 3);
    var atone = !a.t ? 'warn' : a.pct >= 75 ? '' : a.pct >= 50 ? 'warn' : 'bad', atag = !a.t ? ['No records yet', 'pill'] : a.pct >= 75 ? ['On Track', 'pill ok'] : ['Needs Improvement', 'pill bad'];
    var due = bal && e.next_due_date ? Math.ceil((new Date(e.next_due_date) - new Date().setHours(0, 0, 0, 0)) / 864e5) : null, overdue = due != null && due < 0;
    var ftag = !bal ? ['All Paid', 'pill ok'] : overdue ? ['Overdue', 'pill bad'] : ['Payment Pending', 'pill'];
    var pnote = p >= 100 ? 'All done! Great work completing the course.' : p >= 50 ? 'Keep going! You\'re doing great.' : 'You\'re just getting started - keep it up!';
    var d0 = db(), course = (d0.courses || []).filter(function (c) { return c.course_id === e.course_id; })[0], code = course ? course.course_code : (e.course_name || '').slice(0, 3).toUpperCase();
    var batch = code + '-' + (e.course_start_date ? e.course_start_date.slice(0, 4) : new Date().getFullYear()) + '-A';
    return '<div class="eo-hi"><span class="wave">\uD83D\uDC4B</span>Welcome back, ' + f + '!</div><p class="eo-sub">A detailed course overview, attendance, financial and academic overview.</p>' +
      '<div class="eo-grid">' +
        '<div class="eo-card"><div class="eo-head"><span class="em">\uD83C\uDF93</span>Enrolled Course Details</div><div class="eo-course">' + esc(e.course_name) + '</div>' +
          '<div class="eo-meta">Duration: <b>' + e.duration_months + ' Months</b> &middot; Faculty: <b>' + esc(e.faculty_name) + '</b><br>Batch ID: <b>' + batch + '</b> &middot; Status: <b>' + esc(e.enrollment_status || 'Active') + '</b><br>Time Slot: <b>' + esc(e.slot_days) + ', ' + B.slotText(s) + '</b></div></div>' +
        '<div class="eo-card"><div class="eo-head"><span class="em">\uD83D\uDCC5</span>Attendance Overview</div><div class="arc-wrap">' + arcGauge(a.t ? a.pct : 0, atone) + '<div><div style="font-size:12.5px;color:var(--muted);font-weight:600;">Attendance</div><span class="' + atag[1] + '">' + atag[0] + '</span></div></div><div class="eo-statbox">Total Absences: <b>' + a.A + '</b> Day' + (a.A === 1 ? '' : 's') + '</div></div>' +
        '<div class="eo-card"><div class="eo-head"><span class="em">\uD83D\uDCCA</span>Course Progress</div><div class="eo-big good">' + p + '% <span style="font-size:16px;color:var(--muted);font-weight:600;">Completed</span></div><div class="bar" style="margin-top:12px"><span style="width:' + p + '%"></span></div><div class="eo-note" style="margin-top:0"><div class="tip" style="margin-top:14px">' + pnote + '</div></div></div>' +
        '<div class="eo-card"><div class="eo-head"><span class="em">\uD83D\uDCB3</span>Fee Details</div><div class="eo-big' + (bal ? ' due' : ' good') + '">' + inr(bal) + '</div><div class="eo-tagrow"><span class="' + ftag[1] + '">' + ftag[0] + '</span></div><div style="font-size:13px;color:var(--muted);">' + (bal && e.next_due_date ? 'Next due date: ' + fmtIso(e.next_due_date) : bal ? 'Due date not set' : 'No pending balance') + '</div><div class="eo-actions"><a class="btn btn-primary" href="student-fees.html">' + (bal ? 'Pay Now' : 'View Invoices') + '</a><a class="btn btn-outline" href="student-fees.html">View Details</a></div></div>' +
      '</div>' +
      '<div class="sec-h">Quick Actions</div><div class="qa3-grid">' +
        qa3('student-learning.html#attendance', '\uD83D\uDCC5', 'View Attendance', 'Calendar & monthly log') +
        qa3('student-project.html', '\uD83D\uDCC1', 'My Projects', 'Upload work & view admin reviews') +
        qa3('student-assessments.html', '\uD83D\uDCDD', 'My Assessments', 'Scheduled, Completed, Pending') +
        qa3('student-fees.html#invoices', '\uD83D\uDCC4', 'View Invoices', 'Receipts & bills') +
        qa3('student-certificate.html', '\uD83C\uDF93', 'Certificate Status', 'Status details') +
        qa3('mailto:support@balsamcreative.in', '\u2753', 'Support Center', 'Helpdesk & FAQs') +
      '</div>' +
      '<div class="card panel" style="margin-top:20px"><div class="panel-head"><h3>Notifications</h3><a class="link-blue" href="student-notifications.html">View all &rarr;</a></div><div class="panel-body pad-0">' + (n.map(B.nItem).join('') || '<div class="empty">No notifications yet.</div>') + '</div></div>';
  };
  V['student-notifications.html'] = {
    title: 'Notifications',
    render: function (s) {
      if (s.stage !== 'new') autoFeeReminder(s);
      var all = B.myNotifs(s); function f(ts) { return all.filter(function (n) { return ts.indexOf(n.notification_type) > -1; }); }
      function list(a) { return a.length ? a.map(B.nItem).join('') : B.empty('Nothing here yet.', 'No notifications'); }
      return B.head('Notifications', 'Fee reminders, receipts, assignments, schedules and institute announcements.') +
        '<div class="card"><div class="card-body">' + B.tabs('nt', [['all', 'All (' + all.length + ')'], ['ann', 'Announcements & Holidays'], ['fee', 'Fees'], ['work', 'Work & Exams']],
          [list(all), list(f(['Bulk Message', 'Holiday Notice', 'Class Reminder'])), list(f(['Fee Due Reminder', 'Receipt Download'])), list(f(['Assignment Submission', 'Assessment Reminder']))]) + '</div></div>';
    },
    init: function () { B.bindTabs('nt'); }
  };

  V['student-completion.html'] = {
    title: 'Course Completion',
    render: function (s) {
      var e = s.enr, cs = B.completionStatus(s), p = e.progress_percent, rq = reqs(s), met = rq.filter(function (r) { return r[1]; }).length, cl = B.certLabel(s.certificate.status),
        st = [['Enrolled', true], ['In progress', p > 0], ['Eligible', p >= 90], ['Completed', cs[0] === 'Completed'], ['Certificate', cl === 'Issued']], nx = st.filter(function (x) { return x[1]; }).length;
      return B.head('Course Completion', 'Your progress towards completing the course and earning your certificate.') +
        '<div class="dash-hero"><div><small>' + esc(e.course_name) + '</small><h1>' + cs[0] + '</h1><p>' + met + ' of ' + rq.length + ' requirements met &middot; ' + esc(e.progress_remarks || 'Topics not updated yet') + '</p><div class="dh-tags">' + B.badge('Certificate: ' + cl, cl === 'Issued' ? 'success' : cl === 'Ready' ? 'info' : 'warning') + '</div></div>' + ring(p, 104) + '</div>' +
        '<div class="two-col"><div class="card"><div class="card-head"><h3>Requirements</h3><span class="edit-tag">' + met + '/' + rq.length + '</span></div><div class="card-body">' + reqList(s).replace('cc-list', 'cc-list one') + '<p class="small-note" style="margin-top:12px">Completion is confirmed by your admin once all requirements are met.</p></div></div>' +
        '<div class="card"><div class="card-head"><h3>Course summary</h3></div><div class="card-body"><div class="info-list"><div class="item"><div class="l">Course</div><div class="v">' + esc(e.course_name) + '</div></div><div class="item"><div class="l">Faculty</div><div class="v">' + esc(e.faculty_name) + '</div></div><div class="item"><div class="l">Start date</div><div class="v">' + fmtIso(e.course_start_date) + '</div></div><div class="item"><div class="l">End date</div><div class="v">' + (e.course_end_date ? fmtIso(e.course_end_date) : '-') + '</div></div><div class="item"><div class="l">Duration</div><div class="v">' + e.duration_months + ' months</div></div></div></div></div></div>';
    }
  };

  /* certificate page kept intentionally minimal: status only (see the simple
     V['student-certificate.html'] definition above) */

  function ivCard(i) {
    var dt = i.date ? new Date(i.date + 'T00:00:00') : null;
    return '<div class="iv-card"><div class="iv-date"><b>' + (dt ? dt.getDate() : '-') + '</b><small>' + (dt ? B.MON[dt.getMonth()] + ' ' + dt.getFullYear() : '') + '</small></div><div class="iv-main"><b>' + esc(i.company) + '</b><span>' + esc(i.role || 'Role not specified') + ' &middot; ' + esc(i.round) + ' round</span></div>' + statusBadge(i.status) + '</div>';
  }
  V['student-placement.html'].render = function (s) {
    var p = s.placement, today = B.iso(), up = [], prev = [];
    p.interviews.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (i) { (i.status === 'Scheduled' && i.date >= today ? up : prev).push(i); });
    return B.head('Placement', 'Resume, portfolio, interview schedule and history.') +
      '<div class="ov-strip three"><div class="ov-chip"><span class="ov-ic prog">' + svg('brief') + '</span><div><b>' + esc(p.placement_status) + '</b><small>Placement status</small></div></div><div class="ov-chip"><span class="ov-ic att">' + svg('file') + '</span><div><b>' + (p.resume_submitted ? esc(p.resume_status) : 'Not uploaded') + '</b><small>Resume</small></div></div><div class="ov-chip"><span class="ov-ic cert">' + svg('user') + '</span><div><b>' + (p.portfolio_submitted ? esc(p.portfolio_status) : 'No link') + '</b><small>Portfolio</small></div></div></div>' +
      '<div class="two-col">' + B.card('Resume', '<p class="small-note" style="margin-bottom:10px">Current: ' + (p.resume_file ? B.fileLink(p.resume_file) + ' ' + statusBadge(p.resume_status) : 'nothing uploaded') + '</p><div class="work-up">' + B.fileInput('rsFile', 'Upload or replace resume (PDF, max 1.2 MB)') + '</div><div class="form-actions"><button type="button" class="btn btn-primary" id="rsSave">' + svg('up') + 'Upload resume</button></div>') +
      B.card('Portfolio', B.field('poLink', 'Portfolio link', 'text', p.portfolio_link_url, 'https://...') + '<p class="small-note" style="margin-top:8px">Status: ' + (p.portfolio_submitted ? statusBadge(p.portfolio_status) : 'not submitted') + '</p><div class="form-actions"><button type="button" class="btn btn-primary" id="poSave">Save link</button></div>') + '</div>' +
      '<div class="two-col">' + B.card('Upcoming interviews (' + up.length + ')', up.map(ivCard).join('') || '<div class="empty">No interviews scheduled yet.</div>') + B.card('Previous interviews (' + prev.length + ')', prev.map(ivCard).join('') || '<div class="empty">No previous interviews.</div>') + '</div>';
  };
  /* ================= PHASE 3: learning + global widgets ================= */
  function dueInfo(d) { if (!d) return ['', '']; var n = Math.ceil((new Date(d) - new Date().setHours(0, 0, 0, 0)) / 864e5); return n < 0 ? ['Overdue ' + (-n) + 'd', 'late'] : n === 0 ? ['Due today', 'soon'] : n <= 3 ? ['Due in ' + n + 'd', 'soon'] : ['Due in ' + n + ' days', '']; }
  function tasksHtml(s) {
    var l = db().tasks.filter(function (t) { return t.registration_number === s.registration_number; }).sort(function (a, b) { return a.due_date < b.due_date ? -1 : 1; });
    if (!l.length) return B.empty('No assignments have been given to you yet.', 'No assignments');
    function grp(t) { return t.status === 'Completed' ? 'done' : (t.status === 'Submitted' || t.status === 'Under Review') ? 'sub' : 'todo'; }
    var c = { all: l.length, todo: 0, sub: 0, done: 0 }; l.forEach(function (t) { c[grp(t)]++; });
    return '<div class="lo2-stats four">' + stat('layers', 'b', 'Total', c.all, 'Assignments given') + stat('clock', 'o', 'To do', c.todo, 'Need your work') + stat('up', 'p', 'Submitted', c.sub, 'Awaiting review') + stat('check', 'g', 'Completed', c.done, 'Reviewed by faculty') + '</div>' +
      '<div class="flt">' + [['all', 'All'], ['todo', 'To do'], ['sub', 'Submitted'], ['done', 'Completed']].map(function (x, i) { return '<button type="button" class="flt-b' + (i ? '' : ' on') + '" data-f="' + x[0] + '">' + x[1] + '<em>' + c[x[0]] + '</em></button>'; }).join('') + '</div>' +
      l.map(function (t) {
        var g = grp(t), di = g === 'done' ? ['Completed', 'ok'] : dueInfo(t.due_date), canUp = t.status !== 'Completed';
        return '<div class="tk" data-g="' + g + '"><div class="tk-ic ' + g + '">' + svg(g === 'done' ? 'check' : g === 'sub' ? 'up' : 'clip') + '</div><div class="tk-main"><div class="tk-top"><b>' + esc(t.title) + '</b>' + statusBadge(t.status) + '</div>' +
          '<div class="tk-meta"><span>' + svg('cal') + fmtIso(t.due_date) + '</span>' + (di[0] && g !== 'done' ? '<span class="due ' + di[1] + '">' + di[0] + '</span>' : '') + '</div>' + (t.description ? '<p class="work-desc">' + esc(t.description) + '</p>' : '') +
          ((t.brief_file || t.submission_file) ? '<div class="tk-files">' + (t.brief_file ? '<span>' + svg('file') + 'Brief ' + B.fileLink(t.brief_file) + '</span>' : '') + (t.submission_file ? '<span>' + svg('up') + 'Yours ' + B.fileLink(t.submission_file) + '</span>' : '') + '</div>' : '') +
          ((t.grade || t.remarks) ? '<div class="fb"><b>Faculty feedback' + (t.grade ? ' &middot; Grade ' + esc(t.grade) : '') + '</b>' + (t.remarks ? '<span>' + esc(t.remarks) + '</span>' : '') + '</div>' : '') +
          (canUp ? '<div class="work-up"><input type="file" class="file-in" id="tf' + t.task_id + '"><button type="button" class="btn btn-primary btn-sm" data-upload="' + t.task_id + '">' + svg('up') + (t.submission_file ? 'Replace' : 'Submit') + '</button></div>' : '') + '</div></div>';
      }).join('');
  }
  function materialsHtml(s) {
    var l = db().materials.filter(function (m) { return m.assigned_to.indexOf(s.registration_number) > -1 && m.approval_status === 'Approved'; });
    if (!l.length) return B.empty('Your faculty shares materials here when they are ready for you.', 'No materials yet');
    return '<div class="mt-grid">' + l.map(function (m) {
      var link = /^https?:/i.test(m.file_path), ext = link ? 'LINK' : ((m.file_path || '').split('.').pop() || 'FILE').slice(0, 4).toUpperCase(),
        act = m.data ? '<a class="btn btn-outline btn-sm" href="' + m.data + '" download="' + esc(m.file_path) + '">' + svg('dl') + 'Download</a>' : link ? '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="' + esc(m.file_path) + '">Open</a>' : '<span class="muted">Unavailable</span>';
      return '<div class="mt"><div class="mt-ic ext-' + ext.toLowerCase().replace(/[^a-z]/g, '') + '">' + esc(ext) + '</div><div class="mt-b"><b>' + esc(m.title) + '</b><small>' + esc(m.type || 'File') + ' &middot; ' + B.fmtTs(m.uploaded_at) + '</small></div>' + act + '</div>';
    }).join('') + '</div>';
  }
  function projectHtml(s) {
    var p = s.project, sc = p && p.evaluation_score !== '' && p.evaluation_score != null;
    return (p ? '<div class="proj-head"><div><h3>' + esc(p.title || 'My project') + '</h3>' + (p.description ? '<p class="work-desc">' + esc(p.description) + '</p>' : '') + '</div>' + statusBadge(p.status) + '</div><div class="lo2-stats pj">' +
      tile('cal', 'Due date', p.due_date ? fmtIso(p.due_date) : '-', p.submitted_at ? 'Submitted ' + fmtIso(p.submitted_at) : 'Not submitted') + tile('award', 'Evaluation', sc ? esc(p.evaluation_score) + ' / 100' : 'Pending', 'Faculty score') + tile('user', 'Portfolio', statusBadge(p.portfolio_status), p.portfolio_link ? 'Link added' : 'No link') + (p.brief_file ? tile('file', 'Project brief', B.fileLink(p.brief_file), 'From faculty') : '') + '</div>' + (p.remarks ? '<div class="inline-note">Admin remarks: ' + esc(p.remarks) + '</div>' : '') : '<div class="lo2-stats pj">' + tile('layers', 'Project', 'Not assigned', 'Faculty will assign one') + tile('award', 'Evaluation', 'Pending', 'Faculty score') + tile('user', 'Portfolio', 'No link', 'Add one below') + '</div><div class="inline-note">No project has been assigned yet. You can still upload your work below.</div>') +
      '<div class="eo-card pj-sub"><div class="eo-head"><span class="em">\uD83D\uDCE4</span>Submit your work</div><div class="form-grid">' + (p && p.title ? '' : B.field('prTitle', 'Project title', 'text', '', 'e.g. Student Portal', 'span-2')) + B.fileInput('prFile', 'Project file (ZIP or document, max 1.2 MB)' + (p && p.submission_file ? ' - current: ' + esc(p.submission_file.name) : ''), 'span-2') + B.field('prLink', 'Portfolio link', 'text', p ? p.portfolio_link : '', 'https://...', 'span-2') + '</div>' +
      '<div class="form-actions"><button type="button" class="btn btn-primary" id="prSave">' + svg('up') + 'Submit project</button></div>';
  }
  function ovExtra(s) {
    var rn = s.registration_number, up = db().tasks.filter(function (t) { return t.registration_number === rn && t.status !== 'Completed'; }).sort(function (a, b) { return a.due_date < b.due_date ? -1 : 1; }).slice(0, 4), keys = Object.keys(s.attendance || {}).sort().slice(-14);
    return '<div class="two-col lo2-two">' + B.card('Upcoming deadlines', up.length ? up.map(function (t) { var di = dueInfo(t.due_date); return '<div class="dl-row"><span class="dl-dot ' + di[1] + '"></span><div><b>' + esc(t.title) + '</b><small>' + fmtIso(t.due_date) + '</small></div><em class="due ' + di[1] + '">' + di[0] + '</em></div>'; }).join('') : '<div class="empty">You are all caught up.</div>') +
      B.card('Recent attendance', keys.length ? '<div class="att-dots">' + keys.map(function (k) { var v = s.attendance[k]; return '<span class="ad ' + v.toLowerCase() + '" title="' + fmtIso(k) + ' - ' + v + '"></span>'; }).join('') + '</div><div class="pcal-legend" style="margin-top:12px"><span><i class="lp"></i>Present</span><span><i class="la"></i>Absent</span><span><i class="ll"></i>Leave</span></div>' : '<div class="empty">No attendance recorded yet.</div>') + '</div>';
  }
  function reqTiles(s) {
    var d = db(), rn = s.registration_number, a = B.attStats(s), tk = d.tasks.filter(function (t) { return t.registration_number === rn; }), as = d.assessments.filter(function (x) { return x.registration_number === rn && x.status !== 'Cancelled'; }),
      td = tk.filter(function (t) { return t.status === 'Completed'; }).length, ad = as.filter(function (x) { return x.status === 'Completed'; }).length, fee = Number(s.enr.net_fee || 0), fp = fee ? Math.min(100, Math.round(B.paidSum(s) / fee * 100)) : 100;
    return [['cal', 'Attendance', a.pct, a.t ? a.pct + '%' : '-', 'Minimum 75% needed'], ['clip', 'Assignments', tk.length ? Math.round(td / tk.length * 100) : 0, td + ' / ' + tk.length, 'Completed'], ['check', 'Assessments', as.length ? Math.round(ad / as.length * 100) : 0, ad + ' / ' + as.length, 'Completed'], ['rupee', 'Fees paid', fp, fp + '%', inr(B.balance(s)) + ' balance']].map(function (x) {
      return '<div class="rq"><div class="rq-h"><span>' + svg(x[0]) + '</span><b>' + x[1] + '</b><em>' + x[3] + '</em></div><div class="bar"><span style="width:' + x[2] + '%"></span></div><small>' + x[4] + '</small></div>'; }).join('');
  }
  var lOld = V['student-learning.html'].render;
  V['student-learning.html'].render = function (s) {
    var rn = s.registration_number, pend = db().tasks.filter(function (t) { return t.registration_number === rn && t.status !== 'Completed'; }).length, h = lOld(s);
    [['overview', 'layers', 'Overview', ''], ['attendance', 'cal', 'Attendance', ''], ['assignments', 'clip', 'Assignments', pend ? '<em>' + pend + '</em>' : ''], ['materials', 'folder', 'Materials', ''], ['project', 'award', 'Project', '']].forEach(function (t) { h = h.replace('data-tab="' + t[0] + '">' + t[2] + '</button>', 'data-tab="' + t[0] + '">' + svg(t[1]) + t[2] + t[3] + '</button>'); });
    return h;
  };
  var fOld2 = V['student-fees.html'].render;
  V['student-fees.html'].render = function (s) {
    var tot = Number(s.enr.net_fee || 0), pd = B.paidSum(s), pc = tot ? Math.min(100, Math.round(pd / tot * 100)) : 0;
    return fOld2(s).replace('<div class="fee-top">', '<div class="card fee-strip"><div class="fs-h"><div><small>Total course fee</small><b>' + inr(tot) + '</b></div><div><small>Paid</small><b class="ok">' + inr(pd) + '</b></div><div><small>Balance</small><b class="due">' + inr(B.balance(s)) + '</b></div><div class="fs-pc"><b>' + pc + '%</b><small>paid</small></div></div><div class="bar"><span style="width:' + pc + '%"></span></div></div><div class="fee-top">');
  };
  var pOld = V['student-profile.html'].render;
  V['student-profile.html'].render = function (s) {
    var f = [s.full_name, s.gender, s.dob, s.mobile, s.email, s.address], n = f.filter(Boolean).length, pc = Math.round(n / f.length * 100);
    return pOld(s).replace('<div class="two-col">', '<div class="card"><div class="card-body pc-row"><div><b>Profile completeness</b><small>' + (pc === 100 ? 'All details filled in.' : 'Add your remaining details below.') + '</small></div><div class="pc-bar"><div class="bar"><span style="width:' + pc + '%"></span></div><em>' + pc + '%</em></div></div></div><div class="two-col">');
  };
  function enhance() { emo();
    $$('.file-in').forEach(function (inp) {
      if (inp.getAttribute('data-dz')) return; inp.setAttribute('data-dz', '1');
      var dz = document.createElement('div'); dz.className = 'dz'; dz.tabIndex = 0; dz.innerHTML = svg('up') + '<div><b>Drop a file here or <u>browse</u></b><small>Max 1.2 MB</small></div>';
      inp.parentNode.insertBefore(dz, inp); inp.classList.add('dz-in');
      function show() { var f = inp.files[0]; dz.classList.toggle('has', !!f); dz.querySelector('small').textContent = f ? f.name + ' \u00B7 ' + Math.max(1, Math.round(f.size / 1024)) + ' KB' : 'Max 1.2 MB'; dz.querySelector('b').innerHTML = f ? 'File ready to upload' : 'Drop a file here or <u>browse</u>'; }
      dz.onclick = function () { inp.click(); }; dz.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } }; inp.onchange = show;
      ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); }); });
      dz.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) { inp.files = e.dataTransfer.files; show(); } });
    });
    if (!window.__flt) { window.__flt = 1; document.addEventListener('click', function (e) { var b = e.target.closest('.flt-b'); if (!b) return; var f = b.getAttribute('data-f'); $$('.flt-b', b.parentNode).forEach(function (x) { x.classList.toggle('on', x === b); }); $$('.tk').forEach(function (t) { t.style.display = (f === 'all' || t.getAttribute('data-g') === f) ? '' : 'none'; }); }); }
  }
  Object.keys(V).forEach(function (k) { var v = V[k]; if (v.__w) return; v.__w = 1; var i0 = v.init; v.init = function () { if (i0) i0.apply(this, arguments); enhance(); }; });
  /* ================= PHASE 4: director feedback (fees + dashboard + assessments) ================= */
  function progCard(s) {
    var e = s.enr, p = e.progress_percent, cs = B.completionStatus(s);
    return '<div class="card fd pg"><div class="fd-h"><span class="fd-t">Course Progress</span>' + B.badge(cs[0], cs[1]) + '</div><div class="fd-hero"><div><div class="fd-big g">' + p + '%</div><div class="fd-sub">of course completed</div></div><div class="fd-ic g">' + svg('clip') + '</div></div><div class="bar"><span style="width:' + p + '%"></span></div>' +
      '<div class="fd-tip"><i>i</i><span>' + esc(e.progress_remarks || "Keep going! You're doing great.") + '</span></div><a class="link-blue fd-link" href="student-completion.html">Completion details &rarr;</a></div>';
  }
  function dueCard(s, onFees) {
    var e = s.enr, bal = B.balance(s), di = bal && e.next_due_date ? dueInfo(e.next_due_date) : ['', ''];
    return '<div class="card fd du"><div class="fd-h"><span class="fd-t">Amount Due</span></div><div class="fd-hero"><div><div class="fd-big o">' + inr(bal) + '</div><div style="margin-top:8px">' + (bal ? '<span class="pill">Payment pending</span>' : '<span class="pill ok">All paid</span>') + '</div></div><div class="fd-ic o">' + svg('rupee') + '</div></div><div class="fd-line"></div>' +
      '<div class="fd-sub">Next payment due on</div><div class="due-row2"><span>' + svg('cal') + '</span><b>' + (bal && e.next_due_date ? fmtIso(e.next_due_date) : '&mdash;') + '</b>' + (di[0] ? '<em class="due ' + di[1] + '">' + di[0] + '</em>' : '') + '</div>' +
      '<div class="fd-act">' + (onFees ? (bal ? '<button type="button" class="btn btn-primary btn-sm" id="payNow">Pay Now</button>' : '') + '<button type="button" class="btn btn-outline btn-sm" id="viewInvoice">' + svg('dl') + 'View Invoice</button>' : '<a class="btn btn-primary btn-sm" href="student-fees.html">' + (bal ? 'Pay Now' : 'View fees') + '</a><a class="btn btn-outline btn-sm" href="student-fees.html#invoices">View Invoice</a>') + '</div></div>';
  }
  function invoicesCard(s, limit) {
    var all = s.payments.slice().sort(function (a, b) { return a.payment_date < b.payment_date ? 1 : -1; }), l = limit ? all.slice(0, limit) : all, ts = 0;
    try { ts = Number(localStorage.getItem('bp_sync_' + s.registration_number)) || 0; } catch (e) {}
    var lbl = ts ? 'Synced ' + new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Not synced yet';
    return '<div class="card inv-card" id="invoices"><div class="inv-h"><div><h3>Paid invoices</h3><small>' + lbl + '</small></div><div class="inv-act"><button type="button" class="btn btn-outline btn-sm" id="stmtBtn">' + svg('dl') + 'Statement</button><button type="button" class="btn btn-primary btn-sm" id="syncBtn">' + svg('swap') + 'Sync</button></div></div>' +
      (l.length ? l.map(function (p) { return '<div class="inv"><span class="inv-ic">' + svg('file') + '</span><div class="inv-b"><b>' + p.receipt_number + '</b><small>' + fmtIso(p.payment_date) + ' &middot; ' + esc(p.payment_mode) + '</small></div><div class="inv-r"><b>' + inr(p.amount_paid) + '</b><span class="paid">Paid</span></div><button type="button" class="dl-btn" data-rc="' + p.receipt_number + '" aria-label="Download receipt ' + p.receipt_number + '">' + svg('dl') + '</button></div>'; }).join('') : '<div class="empty">No payments recorded yet.</div>') +
      (limit && all.length > limit ? '<a class="link-blue inv-more" href="student-fees.html#invoices">View all ' + all.length + ' invoices &rarr;</a>' : '') + '</div>';
  }
  function bindInv(s) {
    $$('[data-rc]').forEach(function (b) { b.onclick = function () { var p = s.payments.filter(function (x) { return x.receipt_number === b.getAttribute('data-rc'); })[0]; if (!p) return; B.download(B.receiptPdf(s, p), 'Receipt-' + p.receipt_number + '.pdf'); sn('Receipt Download', 'Receipt downloaded', 'You downloaded receipt ' + p.receipt_number + ' (' + inr(p.amount_paid) + ').'); toast('Receipt downloaded'); }; });
    var sy = $('#syncBtn'); if (sy) sy.onclick = function () { sy.classList.add('spin'); sy.disabled = true; setTimeout(function () { try { localStorage.setItem('bp_sync_' + s.registration_number, String(Date.now())); } catch (e) {} toast('Payments synced'); refresh(); }, 800); };
    var st = $('#stmtBtn'); if (st) st.onclick = function () { B.download(B.invoicePdf(s), 'Statement-' + s.registration_number + '.pdf'); toast('Statement downloaded'); };
  }
  V['student-fees.html'].render = function (s) {
    return B.head('My Fees', 'Your course progress, pending payment and paid invoices.') + '<div class="fd-top">' + progCard(s) + dueCard(s, true) + '</div>' + invoicesCard(s) + '<div class="fee-note"><span class="info-dot">i</span><div><b>Note</b><span>Please make the payment before the due date to avoid a late fee.</span></div></div>';
  };
  var fi0 = V['student-fees.html'].init; V['student-fees.html'].init = function (s) { if (fi0) fi0.apply(this, arguments); bindInv(s); };


  V['student-assessments.html'].render = function (s) {
    var l = db().assessments.filter(function (a) { return a.registration_number === s.registration_number; }).sort(function (a, b) { return a.scheduled_date < b.scheduled_date ? -1 : 1; }), by = function (st) { return l.filter(function (a) { return a.status === st; }); },
      sc = by('Scheduled'), dn = by('Completed'), pn = by('Pending'), p = s.project, scored = l.filter(function (a) { return a.marks !== '' && a.marks != null; }),
      avg = scored.length ? Math.round(scored.reduce(function (t, a) { return t + a.marks / a.max_marks * 100; }, 0) / scored.length) : null, pf = avg == null ? null : perf(avg);
    function card(a) {
      var g = a.status === 'Completed' ? 'done' : a.status === 'Scheduled' ? 'sub' : 'todo', hasM = a.marks !== '' && a.marks != null;
      return '<div class="tk"><div class="tk-ic ' + g + '">' + svg(g === 'done' ? 'award' : g === 'sub' ? 'cal' : 'clock') + '</div><div class="tk-main"><div class="tk-top"><b>' + esc(a.title) + '</b>' + statusBadge(a.status) + '</div><div class="tk-meta"><span>' + svg('cal') + fmtIso(a.scheduled_date) + ' at ' + B.t12(a.scheduled_time) + '</span><span>' + esc(a.assessment_type) + ' &middot; ' + esc(a.mode) + '</span></div>' +
        (hasM ? '<div class="score"><div class="mini-row"><span>Score</span><b>' + a.marks + ' / ' + a.max_marks + '</b></div><div class="bar"><span style="width:' + Math.round(a.marks / a.max_marks * 100) + '%"></span></div></div>' : '') + (a.remarks ? '<div class="fb"><b>Faculty remarks</b><span>' + esc(a.remarks) + '</span></div>' : '') +
        (a.submission_file ? '<div class="tk-files"><span>' + svg('up') + 'Your work ' + B.fileLink(a.submission_file) + '</span></div>' : '') +
        (a.status !== 'Cancelled' ? '<div class="work-up"><input type="file" class="file-in" id="af' + a.schedule_id + '"><button type="button" class="btn btn-primary btn-sm" data-upload="' + a.schedule_id + '">' + svg('up') + (a.submission_file ? 'Replace work' : 'Upload work') + '</button></div>' : '') + '</div></div>';
    }
    function list(x, m, t) { return x.length ? x.map(card).join('') : B.empty(m, t); }
    return B.head('My Assessments', 'Scheduled, completed and pending assessments, plus your project evaluation.') +
      '<div class="ov-strip three"><div class="ov-chip"><span class="ov-ic prog">' + svg('cal') + '</span><div><b>' + sc.length + '</b><small>Scheduled</small></div></div><div class="ov-chip"><span class="ov-ic att">' + svg('check') + '</span><div><b>' + dn.length + '</b><small>Completed</small></div></div><div class="ov-chip"><span class="ov-ic cert">' + svg('clock') + '</span><div><b>' + pn.length + '</b><small>Pending</small></div></div></div>' +
      B.tabs('at', [['scheduled', 'Scheduled (' + sc.length + ')'], ['completed', 'Completed (' + dn.length + ')'], ['pending', 'Pending (' + pn.length + ')'], ['project', 'Project evaluation']],
        [list(sc, 'No assessments are scheduled for you right now.', 'Nothing scheduled'), (pf ? '<div class="perf">Overall performance ' + B.badge(pf[0] + ' (' + avg + '%)', pf[1]) + '</div>' : '') + list(dn, 'Results appear here once an assessment is completed.', 'No results yet'), list(pn, 'Nothing is pending. You are all caught up.', 'No pending assessments'),
          B.card('', p ? '<div class="proj-head"><div><h3>' + esc(p.title || 'My project') + '</h3></div>' + statusBadge(p.status) + '</div><div class="lo-tiles pj">' + tile('award', 'Evaluation score', p.evaluation_score === '' || p.evaluation_score == null ? 'Not evaluated' : esc(p.evaluation_score) + ' / 100', 'Faculty score') + tile('user', 'Portfolio', statusBadge(p.portfolio_status), 'Status') + '</div>' + (p.remarks ? '<div class="inline-note">Remarks: ' + esc(p.remarks) + '</div>' : '') + '<div class="form-actions" style="justify-content:flex-start"><a class="btn btn-outline" href="student-learning.html#project">Open my project</a></div>' : B.empty('No project has been assigned yet.', 'No project'))]);
  };
  /* ===== PHASE 7: emoji headings so every page matches the dashboard vibe ===== */
  var EM = [[/^my profile/i, '\uD83D\uDC64'], [/^my learning/i, '\uD83D\uDCDA'], [/^my fees/i, '\uD83D\uDCB3'], [/^my assessments/i, '\uD83D\uDCDD'], [/^course completion/i, '\uD83C\uDF93'], [/^certificate status/i, '\uD83C\uDFC5'], [/^certificate/i, '\uD83C\uDFC5'], [/^placement/i, '\uD83D\uDCBC'], [/^notifications/i, '\uD83D\uDD14'], [/^attendance/i, '\uD83D\uDCC5'], [/^project/i, '\uD83D\uDCC1'],
    [/^personal details/i, '\uD83D\uDC64'], [/^course & identity|^course &amp; identity/i, '\uD83C\uDF93'], [/^requirements/i, '\u2705'], [/^course summary/i, '\uD83D\uDCCB'], [/^status/i, '\uD83C\uDFF7\uFE0F'], [/^paid invoices/i, '\uD83E\uDDFE'], [/^course progress/i, '\uD83D\uDCCA'], [/^amount due/i, '\uD83D\uDCB3'],
    [/^resume/i, '\uD83D\uDCC4'], [/^portfolio/i, '\uD83C\uDF10'], [/^upcoming interviews/i, '\uD83D\uDCC5'], [/^previous interviews/i, '\uD83D\uDD58'], [/^upcoming deadlines/i, '\u23F0'], [/^recent attendance/i, '\uD83D\uDDD3\uFE0F'], [/^topics covered/i, '\uD83E\uDDE0'], [/^submit your work/i, '\uD83D\uDCE4'], [/^course overview/i, '\uD83D\uDCD8'], [/^profile completeness/i, '\uD83D\uDCC8']];
  function emo() {
    $$('.page-head h1, .card-head h3, .panel-head h3, .inv-h h3, .fd-t, .sec-h, .lo-topics h4, .pc-row b').forEach(function (h) {
      if (h.getAttribute('data-emo')) return; h.setAttribute('data-emo', '1');
      var t = h.textContent.trim(); if (!/^[A-Za-z]/.test(t)) return;
      for (var i = 0; i < EM.length; i++) if (EM[i][0].test(t)) { h.insertAdjacentHTML('afterbegin', '<span class="em-i">' + EM[i][1] + '</span>'); break; }
    });
  }
})();