async function loadNotifications() {
  const dropdown = document.getElementById('notifDropdown');
  const badge = document.getElementById('notifBadge');
  if (!dropdown) return;
  try {
    const [notifs, unread] = await Promise.all([api('/notifications'), api('/notifications/unread-count')]);
    if (badge) {
      if (unread.count > 0) { badge.textContent = unread.count; badge.style.display = 'flex'; }
      else { badge.style.display = 'none'; }
    }
    dropdown.innerHTML = '<div class="notif-header"><strong>'+t('notif.title')+'</strong><button class="btn btn-sm btn-outline" id="markAllRead">'+t('notif.mark_read')+'</button></div>';
    if (!notifs.length) { dropdown.innerHTML += '<p style="padding:16px;text-align:center;color:var(--text-lighter)">'+t('notif.empty')+'</p>'; return; }
    notifs.slice(0, 10).forEach(n => {
      const icon = { session_request: 'fa-calendar-plus', session_accepted: 'fa-check-circle', session_rejected: 'fa-times-circle', meet_link: 'fa-video', session_completed: 'fa-flag-checkered', session_cancelled: 'fa-ban', review: 'fa-star' }[n.type] || 'fa-bell';
      dropdown.innerHTML += `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}" data-link="${n.link || ''}">
          <i class="fas ${icon}"></i>
          <div><strong>${n.title}</strong><p>${n.message}</p><span class="notif-time">${timeAgo(n.created_at)}</span></div>
        </div>`;
    });

    document.getElementById('markAllRead')?.addEventListener('click', async () => {
      await api('/notifications/read-all', { method: 'PUT' });
      loadNotifications();
    });

    dropdown.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.id;
        const link = el.dataset.link;
        await api('/notifications/' + id + '/read', { method: 'PUT' });
        if (link) { window.location.href = link; }
        else { loadNotifications(); }
      });
    });
  } catch (err) { console.error(err); }
}

document.getElementById('notifBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const dd = document.getElementById('notifDropdown');
  dd.classList.toggle('active');
  if (dd.classList.contains('active')) loadNotifications();
});
document.addEventListener('click', () => { document.getElementById('notifDropdown')?.classList.remove('active'); });
