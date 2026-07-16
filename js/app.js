const API = window.location.origin + '/api';

// ========================
// HELPERS
// ========================
function getToken() { return localStorage.getItem('aya_token'); }
function getUser() { const u = localStorage.getItem('aya_user'); return u ? JSON.parse(u) : null; }
function saveAuth(user, token) { localStorage.setItem('aya_token', token); localStorage.setItem('aya_user', JSON.stringify(user)); }
function logout() { localStorage.removeItem('aya_token'); localStorage.removeItem('aya_user'); window.location.href = 'login.html'; }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }
async function api(path, options = {}) {
  const res = await fetch(API + path, { ...options, headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function redirectByRole(role) {
  if (role === 'admin') window.location.href = 'admin-dashboard.html';
  else if (role === 'teacher') window.location.href = 'teacher-dashboard.html';
  else window.location.href = 'student-dashboard.html';
}
function requireAuth() {
  const user = getUser();
  if (!user || !getToken()) { window.location.href = 'login.html'; return null; }
  return user;
}
function showModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModalById(id) { document.getElementById(id)?.classList.remove('active'); }
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('common.time_just_now');
  if (m < 60) return t('common.time_min_ago', m);
  const h = Math.floor(m / 60);
  if (h < 24) return t('common.time_hour_ago', h);
  const d = Math.floor(h / 24);
  if (d < 7) return t('common.time_day_ago', d);
  return new Date(dateStr).toLocaleDateString(getLang() === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
}
function formatDate(d) { return d ? new Date(d).toLocaleDateString(getLang() === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''; }
function formatDateTime(d) { return d ? new Date(d).toLocaleString(getLang() === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''; }
function starsHtml(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) html += `<i class="fas fa-star" style="color:${i <= rating ? '#eab308' : '#e2e8f0'}"></i>`;
  return html;
}
function sessionStatusBadge(status) {
  const map = { pending: 'badge-yellow', accepted: 'badge-green', ongoing: 'badge-blue', completed: 'badge-green', rejected: 'badge-red', cancelled: 'badge-red' };
  const labelKey = 'sessions.status_' + status;
  const label = t(labelKey) !== labelKey ? t(labelKey) : status;
  return `<span class="badge ${map[status] || 'badge-yellow'}">${label}</span>`;
}

const JUZ_NAMES = ['Al-Fatiha','Al-Baqarah','Al-Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Taha','Al-Anbiya','Al-Hajj','Al-Muminun','An-Nur','Al-Furqan','Ash-Shuara','An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum'];


// ========================
// DOMContentLoaded
// ========================
document.addEventListener('DOMContentLoaded', async () => {
  const isDashboard = document.body.classList.contains('dashboard-page');
  if (isDashboard) {
    const user = requireAuth();
    if (!user) return;
    updateSidebar(user);
    loadNotifications();
    setInterval(loadNotifications, 30000);
  }

  function updateSidebar(user) {
    const a = document.querySelector('.sidebar .user-avatar');
    const n = document.querySelector('.sidebar .user-name');
    const r = document.querySelector('.sidebar .user-role');
    const t = document.querySelector('.topbar .user-avatar-sm');
    if (a) a.textContent = user.name[0].toUpperCase();
    if (n) n.textContent = user.name;
    if (r) r.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (t) t.textContent = user.name[0].toUpperCase();
  }

  document.querySelector('.nav-item.logout')?.addEventListener('click', (e) => { e.preventDefault(); logout(); });

  // SIDEBAR TOGGLE
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle')?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  document.getElementById('sidebarClose')?.addEventListener('click', () => sidebar?.classList.remove('open'));

  // USER DROPDOWN
  const userBtn = document.getElementById('userDropdownBtn');
  const userMenu = document.getElementById('userDropdownMenu');
  if (userBtn && userMenu) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('active');
    });
    document.addEventListener('click', () => userMenu.classList.remove('active'), { capture: true });
    userMenu.addEventListener('click', (e) => e.stopPropagation());
  }
  document.getElementById('dropdownLogout')?.addEventListener('click', (e) => { e.preventDefault(); logout(); });
  document.getElementById('dropdownSettings')?.addEventListener('click', (e) => {
    e.preventDefault();
    const user = getUser();
    if (user?.role === 'admin') document.querySelector('[data-tab="settings"]')?.click();
    else if (user?.role === 'teacher') document.querySelector('[data-tab="settings"]')?.click();
    else if (user?.role === 'student') document.querySelector('[data-tab="settings"]')?.click();
  });

  // TAB NAVIGATION
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('pageTitle');
  const pageTitles = { overview: t('nav.overview'), students: t('nav.students'), scores: t('nav.scores'), classes: t('nav.classes'), settings: t('nav.settings'), profile: t('nav.profile'), progress: t('student.memorized'), portions: t('student.portions'), users: t('nav.users'), reports: t('nav.reports'), 'pending-teachers': t('nav.pending_teachers'), pending: t('nav.pending'), upcoming: t('nav.upcoming'), completed: t('nav.completed') };
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      tabContents.forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + tab)?.classList.add('active');
      if (pageTitle && pageTitles[tab]) pageTitle.textContent = pageTitles[tab];
      sidebar?.classList.remove('open');
    });
  });

  // LOGIN / SIGNUP
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    btn.textContent = t('common.loading'); btn.disabled = true;
    try { const d = await api('/auth/login', { method:'POST', body: JSON.stringify({ email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value }) }); saveAuth(d.user, d.token); redirectByRole(d.user.role); }
    catch (err) { alert(err.message); btn.textContent = t('login.submit'); btn.disabled = false; }
  });

  const signupForm = document.getElementById('signupForm');
  if (signupForm) signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = signupForm.querySelector('button[type="submit"]');
    btn.textContent = t('common.loading'); btn.disabled = true;
    try { const d = await api('/auth/register', { method:'POST', body: JSON.stringify({ name: document.getElementById('signupName').value, email: document.getElementById('signupEmail').value, password: document.getElementById('signupPassword').value, role: document.getElementById('signupRole').value }) }); if (d.token) { saveAuth(d.user, d.token); redirectByRole(d.user.role); } else { alert(d.message || t('pending.register_success')); signupForm.reset(); btn.textContent = t('signup.submit'); btn.disabled = false; } }
    catch (err) { alert(err.message); btn.textContent = t('signup.submit'); btn.disabled = false; }
  });

  window.togglePassword = function(id, btn) { const i = document.getElementById(id); const ic = btn.querySelector('i'); if (i.type==='password') { i.type='text'; ic.classList.replace('fa-eye','fa-eye-slash'); } else { i.type='password'; ic.classList.replace('fa-eye-slash','fa-eye'); } };



  // ========================
  // TEACHER STUDENTS TABLE
  // ========================
  async function loadTeacherStudents() {
    const table = document.getElementById('studentsTable');
    if (!table) return;
    try {
      const [users, scores, classes] = await Promise.all([api('/users?role=student'), api('/scores'), api('/classes')]);
      const cd = {}; for (const c of classes) { try { cd[c.id] = await api('/classes/'+c.id); } catch(e){} }
      const tbody = table.querySelector('tbody'); tbody.innerHTML = '';
      users.forEach(s => {
        const ss = scores.filter(x => x.student_id === s.id);
        const avg = ss.length ? Math.round(ss.reduce((a,x) => a+x.overall,0)/ss.length) : 0;
        let cn = 'N/A'; for (const c of classes) { if (cd[c.id]?.students?.find(x => x.id===s.id)) { cn=c.name; break; } }
        const sb = avg>=85?'badge-green':avg>=60?'badge-yellow':'badge-red';
        tbody.innerHTML += `<tr><td><div class="user-cell"><div class="user-avatar-sm">${s.name[0]}</div> ${s.name}</div></td><td>${cn}</td><td><div class="progress-bar"><div class="progress-fill" style="width:${avg}%"></div></div><span>${avg}%</span></td><td>${avg}%</td><td><span class="badge ${sb}">${avg>=85?'Good':avg>=60?'Average':'Needs Work'}</span></td></tr>`;
      });
    } catch(e) { console.error(e); }
  }
  loadTeacherStudents();

  // ========================
  // TEACHER CLASSES GRID
  // ========================
  async function loadTeacherClasses() {
    const grid = document.getElementById('teacherClassesGrid');
    if (!grid) return;
    try {
      const classes = await api('/classes'); grid.innerHTML = '';
      const colors = ['blue','green','yellow','purple'];
      classes.forEach((c,i) => {
        grid.innerHTML += `<div class="class-card"><div class="class-header ${colors[i%colors.length]}"><i class="fas fa-book-open"></i><h4>${c.name}</h4></div><div class="class-body"><p><i class="fas fa-users"></i> ${c.student_count||0} Students</p><p><i class="fas fa-calendar"></i> ${c.schedule||'Not set'}</p><p><i class="fas fa-clock"></i> ${c.time||'Not set'}</p></div><div class="class-footer" style="display:flex;gap:8px;align-items:center"><span class="badge badge-green">${c.status}</span><button class="btn btn-sm btn-outline" onclick="editClass(${c.id})"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteClass(${c.id})"><i class="fas fa-trash"></i></button><button class="btn btn-sm btn-outline" onclick="showEnrollModal(${c.id},'${c.name.replace(/'/g,"\\'")}')"><i class="fas fa-user-plus"></i></button></div></div>`;
      });
    } catch(e) { console.error(e); }
  }
  loadTeacherClasses();

  // TEACHER OVERVIEW
  async function loadTeacherOverview() {
    const grid = document.querySelector('#tab-overview .stats-grid');
    if (grid) { try { const s = await api('/progress/stats/overview'); const c = grid.querySelectorAll('.stat-info h3'); if(c[0])c[0].textContent=s.total_students||0; if(c[1])c[1].textContent=s.total_classes||0; if(c[2])c[2].textContent=(s.avg_score||0)+'%'; if(c[3])c[3].textContent=s.recent_scores?.length||0; } catch(e){} }
    const al = document.querySelector('#tab-overview .activity-list');
    if (al) { try { const s = await api('/progress/stats/overview'); al.innerHTML=''; if(s.recent_scores?.length) s.recent_scores.forEach(x => al.innerHTML+=`<div class="activity-item"><div class="activity-dot green"></div><div><p><strong>${x.student_name}</strong> scored ${x.overall}% on ${x.portion}</p><span class="activity-time">${timeAgo(x.created_at)}</span></div></div>`); else al.innerHTML='<p style="color:var(--text-lighter)">'+t('dashboard.no_activity')+'</p>'; } catch(e){} }
    const ul = document.querySelector('#tab-overview .upcoming-list');
    if (ul) { try { const cls = await api('/classes'); ul.innerHTML=''; cls.forEach(c => { if(c.schedule) ul.innerHTML+=`<div class="upcoming-item"><i class="fas fa-calendar"></i><div><p>${c.name}</p><span>${c.schedule}${c.time?', '+c.time:''}</span></div></div>`; }); if(!ul.innerHTML) ul.innerHTML='<p style="color:var(--text-lighter)">No upcoming.</p>'; } catch(e){} }
  }
  loadTeacherOverview();

  // ========================
  // TEACHER PROFILE FORM
  // ========================
  const tpForm = document.getElementById('teacherProfileForm');
  if (tpForm) {
    try { const p = await api('/teachers/profile/me'); if(p.price_per_session!=null)document.getElementById('tpPrice').value=p.price_per_session; if(p.specializations)document.getElementById('tpSpec').value=p.specializations; if(p.years_experience)document.getElementById('tpExp').value=p.years_experience; if(p.languages)document.getElementById('tpLang').value=p.languages; if(p.is_available!=null)document.getElementById('tpAvail').value=p.is_available; } catch(e){}
    tpForm.addEventListener('submit', async e => {
      e.preventDefault();
      try { await api('/teachers/profile', { method:'PUT', body: JSON.stringify({ price_per_session:parseFloat(document.getElementById('tpPrice').value)||0, specializations:document.getElementById('tpSpec').value, years_experience:parseInt(document.getElementById('tpExp').value)||0, languages:document.getElementById('tpLang').value, is_available:parseInt(document.getElementById('tpAvail').value) }) }); alert(t('teacher.saved_alert')); } catch(err) { alert(t('common.error')+err.message); }
    });
  }

  // TEACHER AVAILABILITY SLOTS
  const availForm = document.getElementById('availForm');
  async function loadAvailSlots() {
    const list = document.getElementById('availSlotsList'); if(!list) return;
    try {
      const slots = await api('/availability/my');
      list.innerHTML = '';
      if (!slots.length) { list.innerHTML = '<p style="color:var(--text-lighter);text-align:center;padding:16px">No slots added yet.</p>'; return; }
      const days = [t('avail.sunday'),t('avail.monday'),t('avail.tuesday'),t('avail.wednesday'),t('avail.thursday'),t('avail.friday'),t('avail.saturday')];
      slots.forEach(s => {
        list.innerHTML += `<div class="session-card" style="margin-bottom:8px"><div class="session-info"><h4>${days[s.day_of_week]}</h4><p><i class="fas fa-clock"></i> ${s.start_time} - ${s.end_time}</p></div><div class="session-actions"><button class="btn btn-sm btn-danger" onclick="deleteAvailSlot(${s.id})">${t('sessions.remove')}</button></div></div>`;
      });
    } catch(e) { console.error(e); }
  }
  loadAvailSlots();
  if (availForm) availForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await api('/availability', { method:'POST', body: JSON.stringify({ day_of_week:parseInt(document.getElementById('availDay').value), start_time:document.getElementById('availStart').value, end_time:document.getElementById('availEnd').value }) });
      availForm.reset();
      loadAvailSlots();
    } catch(err) { alert(t('common.error')+err.message); }
  });
  window.deleteAvailSlot = async function(id) { if(!confirm(t('common.confirm_remove_slot')))return; try{await api('/availability/'+id,{method:'DELETE'});loadAvailSlots();}catch(e){alert(e.message);} };

  // ========================
  // STUDENT OVERVIEW
  // ========================
  async function loadStudentOverview() {
    const user = getUser(); if (!user || user.role!=='student') return;
    const grid = document.querySelector('#tab-overview .stats-grid');
    if (grid) { try { const s = await api('/scores/stats/'+user.id); const c = grid.querySelectorAll('.stat-info h3'); if(c[0])c[0].textContent=s.juz_memorized||0; if(c[1])c[1].textContent=(s.averages?.avg_overall||0)+'%'; if(c[2])c[2].textContent=s.active_days||0; if(c[3])c[3].textContent=s.total_scores||0; } catch(e){} }
    try { const p = await api('/progress/'+user.id); const mem=p.filter(x=>x.status==='memorized').length; const inp=p.filter(x=>x.status==='in_progress'); const pct=Math.round((mem/30)*100); const circ=2*Math.PI*54; const off=circ-(pct/100)*circ; const rp=document.querySelector('.ring-percent'); const rf=document.querySelector('.ring-fill'); if(rp)rp.textContent=pct+'%'; if(rf)rf.style.strokeDashoffset=off; const dv=document.querySelectorAll('.detail-value'); if(dv[0])dv[0].textContent=mem+' / 30'; if(dv[1])dv[1].textContent=inp.length?'Juz '+inp.map(x=>x.juz_number).join(', '):'None'; } catch(e){}
    const rl = document.querySelector('#tab-overview .activity-list');
    if (rl) { try { const sc = await api('/scores'); rl.innerHTML=''; sc.slice(0,5).forEach(s => rl.innerHTML+=`<div class="activity-item"><div class="activity-dot ${s.overall>=85?'green':s.overall>=60?'blue':'yellow'}"></div><div><p><strong>${s.portion}</strong> - ${s.overall}% (${s.comments||t('common.no_comments')})</p><span class="activity-time">${timeAgo(s.created_at)}</span></div></div>`); if(!sc.length)rl.innerHTML='<p style="color:var(--text-lighter)">'+t('student.no_scores')+'</p>'; } catch(e){} }
  }
  loadStudentOverview();

  // JUZ PROGRESS GRID
  const juzGrid = document.getElementById('juzGrid');
  if (juzGrid) { const user=getUser(); if(user) { try { const p=await api('/progress/'+user.id); juzGrid.innerHTML=''; p.forEach(x => { const nm=JUZ_NAMES[x.juz_number-1]; const cl=x.status==='memorized'?'memorized':x.status==='in_progress'?'in-progress':''; juzGrid.innerHTML+=`<div class="juz-item ${cl}" onclick="toggleJuz(${x.juz_number},'${x.status}')" style="cursor:pointer" title="Click to cycle"><h4>Juz ${x.juz_number}</h4><p>${nm}</p></div>`; }); } catch(e){} } }
  window.toggleJuz = async function(n,cs) { const u=getUser(); if(!u)return; const nx={not_started:'in_progress',in_progress:'memorized',memorized:'not_started'}; try { await api('/progress/'+u.id+'/'+n,{method:'PUT',body:JSON.stringify({status:nx[cs]})}); juzGrid.querySelectorAll('.juz-item').forEach(el=>{ const h=el.querySelector('h4'); if(h?.textContent==='Juz '+n){const ns=nx[cs]; el.className='juz-item '+(ns==='memorized'?'memorized':ns==='in_progress'?'in-progress':''); el.setAttribute('onclick',`toggleJuz(${n},'${ns}')`);}}); } catch(e){alert('Error: '+e.message);} };

  // STUDENT SCORES TABLE
  const scoresTable = document.getElementById('scoresTable');
  if (scoresTable) { const user=getUser(); if(user) { try { const sc=await api('/scores'); const tb=scoresTable.querySelector('tbody'); tb.innerHTML=''; sc.forEach(s => tb.innerHTML+=`<tr><td>${formatDate(s.created_at)}</td><td>${s.portion}</td><td>${s.tajweed}%</td><td>${s.memorization}%</td><td>${s.fluency}%</td><td><strong>${s.overall}%</strong></td></tr>`); if(!sc.length)tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--text-lighter)">'+t('student.no_scores')+'</td></tr>'; } catch(e){} } }

  // STUDENT PORTIONS
  const portionsList = document.querySelector('.portions-list');
  if (portionsList) { const user=getUser(); if(user&&user.role==='student') { try { const p=await api('/progress/portions'); portionsList.innerHTML=''; if(!p.length){portionsList.innerHTML='<p style="color:var(--text-lighter);text-align:center;padding:32px">'+t('student.no_portions')+'</p>';return;} p.forEach(x=>portionsList.innerHTML+=`<div class="portion-item"><div class="portion-status ${x.status}"></div><div class="portion-info"><h4>${x.title}</h4><p>${x.class_name}${x.due_date?' - '+t('student.due')+' '+formatDate(x.due_date):''}</p></div><span class="badge ${x.status==='completed'?'badge-green':'badge-yellow'}">${x.status==='completed'?t('student.completed'):t('student.pending')}</span></div>`); } catch(e){} } }

  // ========================
  // ADMIN
  // ========================
  async function loadAdminOverview() {
    const grid = document.querySelector('#tab-overview .stats-grid');
    if(grid){try{const s=await api('/progress/stats/overview');const c=grid.querySelectorAll('.stat-info h3');if(c[0])c[0].textContent=s.total_users||0;if(c[1])c[1].textContent=s.total_teachers||0;if(c[2])c[2].textContent=s.total_students||0;if(c[3])c[3].textContent=s.total_classes||0;}catch(e){}}
    const rl=document.querySelector('#tab-overview .activity-list');
    if(rl){try{const s=await api('/progress/stats/overview');rl.innerHTML='';if(s.recent_users?.length)s.recent_users.forEach(u=>rl.innerHTML+=`<div class="activity-item"><div class="user-avatar-sm">${u.name[0]}</div><div><p><strong>${u.name}</strong> registered as ${u.role}</p><span class="activity-time">${timeAgo(u.created_at)}</span></div></div>`);else rl.innerHTML='<p style="color:var(--text-lighter)">'+t('dashboard.no_registrations')+'</p>';}catch(e){}}
  }
  loadAdminOverview();

  async function loadAdminUsers() {
    const t=document.getElementById('usersTable'); if(!t)return;
    try{const u=await api('/users');const tb=t.querySelector('tbody');tb.innerHTML='';u.forEach(x=>{const rb=x.role==='teacher'?'badge-blue':'badge-purple';const st=x.status&&x.status!=='active'?`<span class="badge badge-yellow">${x.status}</span>`:'<span class="badge badge-green">Active</span>';tb.innerHTML+=`<tr><td><div class="user-cell"><div class="user-avatar-sm">${x.name[0]}</div> ${x.name}</div></td><td><span class="badge ${rb}">${x.role}</span></td><td>${x.email}</td><td>${formatDate(x.created_at)}</td><td>${st}</td><td><button class="btn btn-sm btn-outline" onclick="showEditUserModal(${x.id})"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteUser(${x.id})"><i class="fas fa-trash"></i></button></td></tr>`;});}catch(e){console.error(e);}
  }
  loadAdminUsers();

  async function loadPendingTeachers() {
    const t=document.getElementById('pendingTeachersList'); if(!t)return;
    try{const u=await api('/auth/pending-teachers');t.innerHTML='';if(!u.length){t.innerHTML='<p style="text-align:center;color:var(--text-lighter);padding:32px">No pending teacher registrations.</p>';return;}u.forEach(x=>{t.innerHTML+=`<div class="session-card"><div class="session-info"><h4>${x.name}</h4><p><i class="fas fa-envelope"></i> ${x.email}</p>${x.phone?`<p><i class="fas fa-phone"></i> ${x.phone}</p>`:''}${x.bio?`<p><i class="fas fa-info-circle"></i> ${x.bio}</p>`:''}<p><i class="fas fa-calendar"></i> Registered ${formatDate(x.created_at)}</p></div><div class="session-actions"><button class="btn btn-sm btn-primary" onclick="approveTeacher(${x.id})">Approve</button><button class="btn btn-sm btn-danger" onclick="rejectTeacher(${x.id})">Reject</button></div></div>`;});}catch(e){console.error(e);}
  }
  loadPendingTeachers();

  window.approveTeacher = async function(id) { try{await api('/auth/approve/'+id,{method:'PUT'});alert(t('teacher.approve_alert'));loadPendingTeachers();}catch(e){alert(e.message);} };
  window.rejectTeacher = async function(id) { if(!confirm(t('common.confirm_reject')))return; try{await api('/auth/reject/'+id,{method:'PUT'});loadPendingTeachers();}catch(e){alert(e.message);} };

  async function loadAdminClasses() {
    const t=document.getElementById('classesTable'); if(!t)return;
    try{const c=await api('/classes');const tb=t.querySelector('tbody');tb.innerHTML='';c.forEach(x=>tb.innerHTML+=`<tr><td><strong>${x.name}</strong></td><td>${x.teacher_name||'N/A'}</td><td>${x.student_count||0}</td><td>${x.schedule||'N/A'}</td><td><span class="badge badge-green">${x.status}</span></td><td><button class="btn btn-sm btn-outline" onclick="showEditClassModal(${x.id})"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteClass(${x.id})"><i class="fas fa-trash"></i></button></td></tr>`);}catch(e){console.error(e);}
  }
  loadAdminClasses();

  async function loadAdminReports() {
    const rs=document.querySelector('#tab-reports .stats-grid');
    if(rs){try{const sc=await api('/scores');const avg=sc.length?Math.round(sc.reduce((a,s)=>a+s.overall,0)/sc.length):0;const c=rs.querySelectorAll('.stat-info h3');if(c[0])c[0].textContent=avg+'%';if(c[1])c[1].textContent=sc.length+' total';}catch(e){}}
    const tt=document.querySelector('#tab-reports .content-grid .data-table');
    if(tt){try{const u=await api('/users?role=student');const sc=await api('/scores');const tb=tt.querySelector('tbody');tb.innerHTML='';const r=u.map(x=>{const ss=sc.filter(s=>s.student_id===x.id);return{name:x.name,avg:ss.length?Math.round(ss.reduce((a,s)=>a+s.overall,0)/ss.length):0,cnt:ss.length};}).sort((a,b)=>b.avg-a.avg).slice(0,5);r.forEach((x,i)=>tb.innerHTML+=`<tr><td>${i+1}</td><td>${x.name}</td><td>${x.avg}%</td><td>${x.cnt} scores</td></tr>`);}catch(e){}}
    const tp=document.querySelector('.teacher-stats');
    if(tp){try{const t=await api('/users?role=teacher');const sc=await api('/scores');tp.innerHTML='';t.forEach(x=>{const ts=sc.filter(s=>s.teacher_id===x.id);const avg=ts.length?Math.round(ts.reduce((a,s)=>a+s.overall,0)/ts.length):0;tp.innerHTML+=`<div class="teacher-stat"><div class="user-cell"><div class="user-avatar-sm">${x.name[0]}</div> ${x.name}</div><div class="stat-bar-container"><div class="stat-bar" style="width:${avg}%"></div><span>${avg}%</span></div></div>`;});}catch(e){}}
  }
  loadAdminReports();

  // EDIT/DELETE USER
  window.showEditUserModal = async function(id) { try{const u=await api('/users/'+id);document.getElementById('editUserId').value=u.id;document.getElementById('editUserName').value=u.name;document.getElementById('editUserEmail').value=u.email;document.getElementById('editUserRole').value=u.role;showModal('editUserModal');}catch(e){alert(e.message);} };
  const euf=document.getElementById('editUserForm');
  if(euf) euf.addEventListener('submit', async e=>{e.preventDefault();const id=document.getElementById('editUserId').value;try{await api('/users/'+id,{method:'PUT',body:JSON.stringify({name:document.getElementById('editUserName').value,email:document.getElementById('editUserEmail').value,role:document.getElementById('editUserRole').value})});closeModalById('editUserModal');loadAdminUsers();}catch(e){alert(e.message);}});
  window.deleteUser = async function(id) { if(!confirm(t('common.confirm_delete')))return; try{await api('/users/'+id,{method:'DELETE'});loadAdminUsers();}catch(e){alert(e.message);} };

  // EDIT/DELETE CLASS
  window.showEditClassModal = async function(id) { try{const c=await api('/classes/'+id);document.getElementById('editClassId').value=c.id;document.getElementById('editClassName').value=c.name;document.getElementById('editClassSchedule').value=c.schedule||'';document.getElementById('editClassTime').value=c.time||'';document.getElementById('editClassMax').value=c.max_students||30;showModal('editClassModal');}catch(e){alert(e.message);} };
  window.editClass = showEditClassModal;
  const ecf=document.getElementById('editClassForm');
  if(ecf) ecf.addEventListener('submit', async e=>{e.preventDefault();const id=document.getElementById('editClassId').value;try{await api('/classes/'+id,{method:'PUT',body:JSON.stringify({name:document.getElementById('editClassName').value,schedule:document.getElementById('editClassSchedule').value,time:document.getElementById('editClassTime').value,max_students:parseInt(document.getElementById('editClassMax').value)})});closeModalById('editClassModal');loadTeacherClasses();loadAdminClasses();}catch(e){alert(e.message);}});
  window.deleteClass = async function(id) { if(!confirm(t('common.confirm_delete_class')))return; try{await api('/classes/'+id,{method:'DELETE'});loadTeacherClasses();loadAdminClasses();}catch(e){alert(t('common.error')+e.message);} };

  // ADD CLASS
  document.getElementById('addClassBtn')?.addEventListener('click', () => showModal('addClassModal'));
  const acf=document.getElementById('addClassForm');
  if(acf) acf.addEventListener('submit', async e=>{e.preventDefault();try{await api('/classes',{method:'POST',body:JSON.stringify({name:document.getElementById('newClassName').value,schedule:document.getElementById('newClassSchedule').value,time:document.getElementById('newClassTime').value})});acf.reset();closeModalById('addClassModal');loadTeacherClasses();loadAdminClasses();}catch(e){alert(e.message);}});

  // ENROLL
  window.showEnrollModal = async function(cid,cn) { document.getElementById('enrollClassName').textContent=cn; document.getElementById('enrollModal').dataset.classId=cid; const sel=document.getElementById('enrollStudentSelect'); try{const u=await api('/users?role=student');sel.innerHTML='<option value="" disabled selected>'+t('scores.choose_student')+'</option>';u.forEach(x=>sel.innerHTML+=`<option value="${x.id}">${x.name}</option>`);}catch(e){} showModal('enrollModal'); };
  const enf=document.getElementById('enrollForm');
  if(enf) enf.addEventListener('submit', async e=>{e.preventDefault();const cid=document.getElementById('enrollModal').dataset.classId;try{await api('/classes/'+cid+'/enroll',{method:'POST',body:JSON.stringify({student_id:parseInt(document.getElementById('enrollStudentSelect').value)})});alert(t('common.submit'));closeModalById('enrollModal');loadTeacherClasses();}catch(e){alert(e.message);}});

  // SETTINGS
  const sf=document.getElementById('settingsForm');
  if(sf){const u=getUser();if(u){try{const p=await api('/auth/me');const inp=sf.querySelectorAll('input,textarea');if(inp[0])inp[0].value=p.name||'';if(inp[1])inp[1].value=p.email||'';if(inp[2])inp[2].value=p.phone||'';if(inp[3])inp[3].value=p.bio||'';}catch(e){}} sf.addEventListener('submit',async e=>{e.preventDefault();const inp=sf.querySelectorAll('input,textarea');try{await api('/auth/me',{method:'PUT',body:JSON.stringify({name:inp[0].value,phone:inp[2]?.value,bio:inp[3]?.value})});const u=getUser();if(u){u.name=inp[0].value;localStorage.setItem('aya_user',JSON.stringify(u));updateSidebar(u);}alert(t('settings.saved_alert'));}catch(e){alert(e.message);}});}

  // SEARCH
  document.getElementById('studentSearch')?.addEventListener('input',function(){const q=this.value.toLowerCase();document.querySelectorAll('#studentsTable tbody tr').forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?'':'none');});
  document.getElementById('userSearch')?.addEventListener('input',function(){const q=this.value.toLowerCase();document.querySelectorAll('#usersTable tbody tr').forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?'':'none');});
  document.getElementById('roleFilter')?.addEventListener('change',async function(){const v=this.value;try{const u=await api('/users'+(v!=='all'?'?role='+v:''));const tb=document.querySelector('#usersTable tbody');tb.innerHTML='';u.forEach(x=>{const rb=x.role==='teacher'?'badge-blue':'badge-purple';tb.innerHTML+=`<tr><td><div class="user-cell"><div class="user-avatar-sm">${x.name[0]}</div> ${x.name}</div></td><td><span class="badge ${rb}">${x.role}</span></td><td>${x.email}</td><td>${formatDate(x.created_at)}</td><td><span class="badge badge-green">Active</span></td><td><button class="btn btn-sm btn-outline" onclick="showEditUserModal(${x.id})"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteUser(${x.id})"><i class="fas fa-trash"></i></button></td></tr>`;});}catch(e){}});
  document.getElementById('scoreFilter')?.addEventListener('change',function(){const v=this.value;document.querySelectorAll('#scoresTable tbody tr').forEach(r=>{if(v==='all'){r.style.display='';return;}const c=r.querySelectorAll('td');const m={tajweed:2,memorization:3,fluency:4};r.style.display=(parseInt(c[m[v]]?.textContent)||0)>0?'':'none';});});

  document.getElementById('contactForm')?.addEventListener('submit',e=>{e.preventDefault();alert(t('common.submit'));e.target.reset();});
  document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('active');}));

  // ========================
  // TEACHERS BROWSE PAGE
  // ========================
  const teachersGrid = document.getElementById('teachersGrid');
  if (teachersGrid) {
    async function loadTeachers(spec, maxPrice) {
      try {
        let url = '/teachers';
        const params = [];
        if (spec) params.push('specialization=' + encodeURIComponent(spec));
        if (maxPrice) params.push('max_price=' + maxPrice);
        if (params.length) url += '?' + params.join('&');

        const teachers = await api(url);
        teachersGrid.innerHTML = '';
        if (!teachers.length) { teachersGrid.innerHTML = '<p style="text-align:center;color:var(--text-lighter);padding:48px">No teachers found.</p>'; return; }
        teachers.forEach(t => {
          teachersGrid.innerHTML += `
            <div class="teacher-card" onclick="showTeacherProfile(${t.id})">
              <div class="teacher-card-header">
                <div class="user-avatar" style="width:56px;height:56px;font-size:1.4rem">${t.name[0]}</div>
                <div class="teacher-card-info">
                  <h3>${t.name}</h3>
                  <div class="teacher-rating">${starsHtml(Math.round(t.avg_rating))} <span>${t.avg_rating || t('teacher.new_label')}</span> <span style="color:var(--text-lighter)">(${t.review_count})</span></div>
                </div>
              </div>
              <div class="teacher-card-body">
                <p class="teacher-price">$${t.price_per_session} <span>${t('common.per_session')}</span></p>
                <p class="teacher-specs">${t.specializations || t('teacher.general')}</p>
                <p class="teacher-exp"><i class="fas fa-briefcase"></i> ${t('common.years_experience', t.years_experience || 0)}</p>
              </div>
              <div class="teacher-card-footer">
                <span class="badge badge-green">${t('common.available')}</span>
                <button class="btn btn-sm btn-primary">${t('common.book_now')}</button>
              </div>
            </div>`;
        });
      } catch (e) { console.error(e); }
    }
    loadTeachers();

    document.getElementById('specFilter')?.addEventListener('change', function() { loadTeachers(this.value, document.getElementById('priceFilter').value); });
    document.getElementById('priceFilter')?.addEventListener('change', function() { loadTeachers(document.getElementById('specFilter').value, this.value); });
    document.getElementById('teacherSearch')?.addEventListener('input', async function() {
      const q = this.value.toLowerCase();
      if (!q) { loadTeachers(); return; }
      try {
        const teachers = await api('/teachers');
        const filtered = teachers.filter(t => t.name.toLowerCase().includes(q) || (t.specializations||'').toLowerCase().includes(q));
        teachersGrid.innerHTML = '';
        filtered.forEach(t => {
          teachersGrid.innerHTML += `<div class="teacher-card" onclick="showTeacherProfile(${t.id})"><div class="teacher-card-header"><div class="user-avatar" style="width:56px;height:56px;font-size:1.4rem">${t.name[0]}</div><div class="teacher-card-info"><h3>${t.name}</h3><div class="teacher-rating">${starsHtml(Math.round(t.avg_rating))} <span>${t.avg_rating||t('teacher.new_label')}</span></div></div></div><div class="teacher-card-body"><p class="teacher-price">$${t.price_per_session} <span>${t('common.per_session')}</span></p><p class="teacher-specs">${t.specializations||t('teacher.general')}</p></div><div class="teacher-card-footer"><span class="badge badge-green">${t('common.available')}</span><button class="btn btn-sm btn-primary">${t('common.book_now')}</button></div></div>`;
        });
      } catch(e) {}
    });
  }

  // TEACHER PROFILE MODAL
  window.showTeacherProfile = async function(id) {
    try {
      const [t, slots] = await Promise.all([api('/teachers/' + id), api('/availability/' + id)]);
      document.getElementById('teacherModalName').textContent = t.name;
      const body = document.getElementById('teacherModalBody');
      const days = [t('avail.sunday'),t('avail.monday'),t('avail.tuesday'),t('avail.wednesday'),t('avail.thursday'),t('avail.friday'),t('avail.saturday')];
      const today = new Date();

      body.innerHTML = `
        <div class="teacher-profile">
          <div class="teacher-profile-header">
            <div class="user-avatar" style="width:72px;height:72px;font-size:1.8rem">${t.name[0]}</div>
            <div>
              <h2>${t.name}</h2>
              <div class="teacher-rating" style="font-size:1.1rem">${starsHtml(Math.round(t.avg_rating))} ${t.avg_rating||t('teacher.new_label')} (${t.review_count} ${t('teacher.reviews')})</div>
              <p style="color:var(--text-light)">${t.bio || t('teacher.quran_teacher')}</p>
            </div>
          </div>
          <div class="teacher-profile-details">
            <div><strong>${t('teacher.price_label')}</strong> $${t.price_per_session}/${t('nav.sessions').toLowerCase()}</div>
            <div><strong>${t('teacher.experience_label')}</strong> ${t('common.years_experience', t.years_experience||0)}</div>
            <div><strong>${t('teacher.languages_label')}</strong> ${t.languages||t('teacher.english')}</div>
            <div><strong>${t('teacher.specializations_label')}</strong> ${t.specializations||t('teacher.general')}</div>
          </div>
          <h3 style="margin:20px 0 12px">${t('sessions.available_slots')}</h3>
          <div class="avail-slots" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
            ${slots.length ? slots.map(s => {
              const nextDate = new Date(today);
              const daysUntil = (s.day_of_week - today.getDay() + 7) % 7 || 7;
              nextDate.setDate(today.getDate() + daysUntil);
              const dateStr = nextDate.toISOString().slice(0,10) + 'T' + s.start_time;
              return `<button class="btn btn-sm btn-outline" onclick="quickBookSlot(${id},'${dateStr}','${t.name.replace(/'/g,"\\'")}',${t.price_per_session})" style="padding:8px 12px;text-align:left">
                <strong>${days[s.day_of_week]}</strong><br><small>${s.start_time} - ${s.end_time}</small>
              </button>`;
            }).join('') : '<p style="color:var(--text-lighter)">'+t('sessions.no_slots')+'</p>'}
          </div>
          <h3 style="margin:20px 0 12px">${t('teacher.reviews')}</h3>
          <div class="reviews-list">
            ${t.reviews?.length ? t.reviews.map(r => `
              <div class="review-item">
                <div class="review-header"><strong>${r.student_name}</strong> ${starsHtml(r.rating)} <span style="color:var(--text-lighter)">${formatDate(r.created_at)}</span></div>
                <p>${r.comment || t('common.no_comment')}</p>
              </div>
            `).join('') : '<p style="color:var(--text-lighter)">'+t('teacher.no_reviews')+'</p>'}
          </div>
          <button class="btn btn-outline" style="margin-top:16px;width:100%" onclick="openBooking(${t.id},'${t.name.replace(/'/g,"\\'")}',${t.price_per_session})">${t('sessions.suggest_time')}</button>
        </div>`;
      showModal('teacherModal');
    } catch (e) { alert(e.message); }
  };

  // QUICK BOOK FROM SLOT
  window.quickBookSlot = async function(tid, dateStr, tname, price) {
    if (!confirm(t('common.confirm_book') + ' ' + tname + '?')) return;
    try {
      const user = getUser();
      await api('/sessions', {
        method: 'POST',
        body: JSON.stringify({ teacher_id: tid, scheduled_at: dateStr, duration_minutes: 30, student_notes: '' })
      });
      alert(t('sessions.booked_alert'));
      closeModalById('teacherModal');
    } catch (e) { alert(t('common.error') + ' ' + e.message); }
  };

  // BOOKING MODAL
  window.openBooking = function(tid, tname, price) {
    document.getElementById('bookingTeacherId').value = tid;
    document.getElementById('bookingTeacherName').textContent = tname;
    document.getElementById('bookingPrice').textContent = '$' + price;
    const minDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
    document.getElementById('bookingDate').min = minDate;
    closeModalById('teacherModal');
    showModal('bookingModal');
  };

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await api('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          teacher_id: parseInt(document.getElementById('bookingTeacherId').value),
          scheduled_at: document.getElementById('bookingDate').value,
          duration_minutes: parseInt(document.getElementById('bookingDuration').value),
          student_notes: document.getElementById('bookingNotes').value
        })
      });
      alert(t('sessions.booked_alert'));
      bookingForm.reset();
      closeModalById('bookingModal');
    } catch (e) { alert(t('common.error') + ' ' + e.message); }
  });

  // ========================
  // SESSIONS PAGE
  // ========================
  const pendingList = document.getElementById('pendingList');
  const upcomingList = document.getElementById('upcomingList');
  const completedList = document.getElementById('completedList');

  if (pendingList || upcomingList || completedList) {
    const user = getUser();
    if (!user) return;

    // Set sidebar nav based on role
    const snav = document.getElementById('sidebarNav');
    if (snav) {
      if (user.role === 'teacher') {
        snav.innerHTML = `
          <a href="#" class="nav-item active" data-tab="pending"><i class="fas fa-clock"></i> ${t('nav.requests')}</a>
          <a href="#" class="nav-item" data-tab="upcoming"><i class="fas fa-calendar"></i> ${t('nav.upcoming')}</a>
          <a href="#" class="nav-item" data-tab="completed"><i class="fas fa-check-circle"></i> ${t('nav.completed')}</a>
          <a href="teacher-dashboard.html" class="nav-item"><i class="fas fa-home"></i> ${t('nav.dashboard')}</a>`;
        document.getElementById('pendingTitle').textContent = t('dashboard.session_requests');
      } else {
        snav.innerHTML = `
          <a href="#" class="nav-item active" data-tab="pending"><i class="fas fa-clock"></i> ${t('nav.pending')}</a>
          <a href="#" class="nav-item" data-tab="upcoming"><i class="fas fa-calendar"></i> ${t('nav.upcoming')}</a>
          <a href="#" class="nav-item" data-tab="completed"><i class="fas fa-check-circle"></i> ${t('nav.completed')}</a>
          <a href="teachers.html" class="nav-item"><i class="fas fa-search"></i> ${t('nav.browse_teachers')}</a>
          <a href="student-dashboard.html" class="nav-item"><i class="fas fa-home"></i> ${t('nav.dashboard')}</a>`;
      }
      // Re-bind tab nav
      snav.querySelectorAll('.nav-item[data-tab]').forEach(item => {
        item.addEventListener('click', e => {
          e.preventDefault();
          snav.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
          item.classList.add('active');
          document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
          document.getElementById('tab-' + item.dataset.tab)?.classList.add('active');
        });
      });
    }

    async function loadSessions() {
      try {
        const sessions = await api('/sessions');
        const pending = sessions.filter(s => s.status === 'pending');
        const upcoming = sessions.filter(s => ['accepted', 'ongoing'].includes(s.status));
        const completed = sessions.filter(s => s.status === 'completed');

        if (pendingList) {
          pendingList.innerHTML = '';
          if (!pending.length) { pendingList.innerHTML = '<p style="text-align:center;color:var(--text-lighter);padding:32px">'+t('dashboard.no_pending')+'</p>'; }
          pending.forEach(s => {
            const isTeacher = user.role === 'teacher';
            pendingList.innerHTML += `
              <div class="session-card">
                <div class="session-info">
                  <h4>${isTeacher ? s.student_name : s.teacher_name}</h4>
                  <p><i class="fas fa-calendar"></i> ${formatDateTime(s.scheduled_at)} (${s.duration_minutes}min)</p>
                  <p><i class="fas fa-dollar-sign"></i> $${s.price}</p>
                  ${s.student_notes ? `<p><i class="fas fa-sticky-note"></i> ${s.student_notes}</p>` : ''}
                </div>
                <div class="session-actions">
                  ${sessionStatusBadge(s.status)}
                  ${isTeacher ? `
                    <button class="btn btn-sm btn-primary" onclick="acceptSession(${s.id})">${t('sessions.accept')}</button>
                    <button class="btn btn-sm btn-danger" onclick="rejectSession(${s.id})">${t('sessions.decline')}</button>
                  ` : `
                    <button class="btn btn-sm btn-outline" onclick="cancelSession(${s.id})">${t('sessions.cancel')}</button>
                  `}
                </div>
              </div>`;
          });
        }

        if (upcomingList) {
          upcomingList.innerHTML = '';
          if (!upcoming.length) { upcomingList.innerHTML = '<p style="text-align:center;color:var(--text-lighter);padding:32px">'+t('dashboard.no_upcoming')+'</p>'; }
          upcoming.forEach(s => {
            const isTeacher = user.role === 'teacher';
            upcomingList.innerHTML += `
              <div class="session-card">
                <div class="session-info">
                  <h4>${isTeacher ? s.student_name : s.teacher_name}</h4>
                  <p><i class="fas fa-calendar"></i> ${formatDateTime(s.scheduled_at)} (${s.duration_minutes}min)</p>
                  ${s.meet_link ? `<p><a href="${s.meet_link}" target="_blank" class="btn btn-sm btn-primary"><i class="fas fa-video"></i> ${t('sessions.join_meeting')}</a></p>` : ''}
                </div>
                <div class="session-actions">
                  ${sessionStatusBadge(s.status)}
                  ${isTeacher && !s.meet_link ? `<button class="btn btn-sm btn-primary" onclick="openMeetLinkModal(${s.id})"><i class="fas fa-link"></i> ${t('sessions.add_meet_link')}</button>` : ''}
                  ${isTeacher ? `<button class="btn btn-sm btn-outline" onclick="completeSession(${s.id})">${t('sessions.complete')}</button>` : ''}
                  <button class="btn btn-sm btn-outline" onclick="cancelSession(${s.id})">${t('sessions.cancel')}</button>
                </div>
              </div>`;
          });
        }

        if (completedList) {
          completedList.innerHTML = '';
          if (!completed.length) { completedList.innerHTML = '<p style="text-align:center;color:var(--text-lighter);padding:32px">'+t('dashboard.no_completed')+'</p>'; }
          completed.forEach(s => {
            const isTeacher = user.role === 'teacher';
            const hasScore = s.score_id;
            completedList.innerHTML += `
              <div class="session-card">
                <div class="session-info">
                  <h4>${isTeacher ? s.student_name : s.teacher_name}</h4>
                  <p><i class="fas fa-calendar"></i> ${formatDateTime(s.scheduled_at)}</p>
                  ${s.meet_link ? `<p><a href="${s.meet_link}" target="_blank"><i class="fas fa-video"></i> Meeting link</a></p>` : ''}
                  ${hasScore ? `
                    <div class="score-display" style="margin-top:10px;padding:10px;background:var(--bg-secondary);border-radius:8px">
                      <p><strong>${s.score_portion}</strong></p>
                      <div style="display:flex;gap:16px;margin-top:6px;flex-wrap:wrap">
                        <span><strong>Tajweed:</strong> ${s.score_tajweed}%</span>
                        <span><strong>Memorization:</strong> ${s.score_memorization}%</span>
                        <span><strong>Fluency:</strong> ${s.score_fluency}%</span>
                        <span><strong>Overall:</strong> ${s.score_overall}%</span>
                      </div>
                      ${s.score_comments ? `<p style="margin-top:6px;color:var(--text-light)"><i class="fas fa-comment"></i> ${s.score_comments}</p>` : ''}
                    </div>
                  ` : ''}
                </div>
                <div class="session-actions">
                  ${sessionStatusBadge(s.status)}
                  ${!isTeacher && !s.my_rating ? `<button class="btn btn-sm btn-primary" onclick="openReviewModal(${s.id})">${t('sessions.leave_review')}</button>` : ''}
                  ${!isTeacher && s.my_rating ? `<span>${starsHtml(s.my_rating)}</span>` : ''}
                  ${isTeacher && hasScore ? `<span class="badge badge-green">Scored: ${s.score_overall}%</span>` : ''}
                </div>
              </div>`;
          });
        }
      } catch (e) { console.error(e); }
    }
    loadSessions();

    window.acceptSession = async function(id) { try { await api('/sessions/' + id + '/accept', { method: 'PUT' }); alert(t('sessions.accepted_alert')); loadSessions(); } catch(e) { alert(e.message); } };
    window.rejectSession = async function(id) { const r = prompt(t('sessions.reject_reason')); try { await api('/sessions/' + id + '/reject', { method: 'PUT', body: JSON.stringify({ reason: r || '' }) }); loadSessions(); } catch(e) { alert(t('common.error')+e.message); } };
    window.completeSession = function(id) {
      document.getElementById('scoreSessionId').value = id;
      document.getElementById('ssPortion').value = '';
      document.getElementById('ssTajweed').value = '';
      document.getElementById('ssMemorization').value = '';
      document.getElementById('ssFluency').value = '';
      document.getElementById('ssComments').value = '';
      showModal('sessionScoreModal');
    };
    window.completeWithoutScore = async function() {
      const id = document.getElementById('scoreSessionId').value;
      closeModalById('sessionScoreModal');
      try { await api('/sessions/' + id + '/complete', { method: 'PUT' }); alert(t('sessions.completed_alert')); loadSessions(); } catch(e) { alert(e.message); }
    };
    window.closeSessionScoreModal = function() { closeModalById('sessionScoreModal'); };
    const ssForm = document.getElementById('sessionScoreForm');
    if (ssForm) ssForm.addEventListener('submit', async e => {
      e.preventDefault();
      const id = document.getElementById('scoreSessionId').value;
      const payload = {
        portion: document.getElementById('ssPortion').value,
        tajweed: parseInt(document.getElementById('ssTajweed').value),
        memorization: parseInt(document.getElementById('ssMemorization').value),
        fluency: parseInt(document.getElementById('ssFluency').value),
        comments: document.getElementById('ssComments').value
      };
      try {
        await api('/sessions/' + id + '/complete', { method: 'PUT', body: JSON.stringify(payload) });
        alert(t('sessions.completed_alert'));
        closeModalById('sessionScoreModal');
        loadSessions();
      } catch(e) { alert(e.message); }
    });
    window.cancelSession = async function(id) { if(!confirm(t('common.confirm_cancel'))) return; try { await api('/sessions/' + id + '/cancel', { method: 'POST' }); loadSessions(); } catch(e) { alert(e.message); } };

    window.openMeetLinkModal = function(id) { document.getElementById('meetSessionId').value = id; showModal('meetLinkModal'); };
    const mlForm = document.getElementById('meetLinkForm');
    if (mlForm) mlForm.addEventListener('submit', async e => {
      e.preventDefault();
      const id = document.getElementById('meetSessionId').value;
      try { await api('/sessions/' + id + '/link', { method: 'PUT', body: JSON.stringify({ meet_link: document.getElementById('meetLinkInput').value }) }); alert(t('sessions.link_shared')); mlForm.reset(); closeModalById('meetLinkModal'); loadSessions(); } catch(e) { alert(e.message); }
    });

    window.openReviewModal = function(id) { document.getElementById('reviewSessionId').value = id; document.getElementById('reviewRating').value = 0; document.querySelectorAll('#starRating i').forEach(s => s.style.color = '#e2e8f0'); showModal('reviewModal'); };
    document.querySelectorAll('#starRating i').forEach(star => {
      star.addEventListener('click', function() { const r = parseInt(this.dataset.star); document.getElementById('reviewRating').value = r; document.querySelectorAll('#starRating i').forEach(s => s.style.color = parseInt(s.dataset.star) <= r ? '#eab308' : '#e2e8f0'); });
    });
    const rvForm = document.getElementById('reviewForm');
    if (rvForm) rvForm.addEventListener('submit', async e => {
      e.preventDefault();
      const id = document.getElementById('reviewSessionId').value;
      const rating = parseInt(document.getElementById('reviewRating').value);
      if (!rating) { alert(t('review.select_rating')); return; }
      try { await api('/sessions/' + id + '/review', { method: 'POST', body: JSON.stringify({ rating, comment: document.getElementById('reviewComment').value }) }); alert(t('review.submit')); rvForm.reset(); closeModalById('reviewModal'); loadSessions(); } catch(e) { alert(e.message); }
    });
  }
});
