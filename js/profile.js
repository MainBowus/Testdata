const API_URL = 'http://localhost:5000/api'

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('mock_user'))
  const token = localStorage.getItem('token')
  if (!user || !token) { window.location.href = '../auth.html'; return; }

  document.getElementById('p-name').textContent = user.name;
  document.getElementById('p-email-top').textContent = user.email || '-';
  document.getElementById('p-email').textContent = user.email || '-';
  document.getElementById('p-ava').textContent = user.name[0].toUpperCase();

  const navRight = document.getElementById('nav-right');
  if (navRight) {
    navRight.innerHTML = `
      <div class="user-pill" onclick="toggleDropdown(event)">
        <div class="ava">${user.name[0].toUpperCase()}</div>
        ${user.name} <span style="font-size:10px; margin-left:5px;">▼</span>
        <div class="user-dropdown" id="user-dropdown" style="position:absolute; top:100%; right:0; background:#1c2c43; border:1px solid rgba(255,255,255,0.2); border-radius:15px; display:none; flex-direction:column; min-width:150px; margin-top:10px; overflow:hidden;">
          <div class="dropdown-item" onclick="location.reload()" style="padding:12px 20px; cursor:pointer;">👤 Profile</div>
          <div class="dropdown-item" onclick="showLogoutModal()" style="padding:12px 20px; cursor:pointer; color:#ff4757;">🚪 Log Out</div>
        </div>
      </div>`;
  }

  const grid = document.getElementById('my-quizzes-grid')
  if (!grid) return

  grid.innerHTML = '<p style="opacity:0.5; grid-column: span 4; text-align:center; padding:40px;">Loading...</p>'

  try {
    const res = await fetch(`${API_URL}/my-quizzes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) throw new Error('Failed to fetch')

    const quizzes = await res.json()

    if (quizzes.length === 0) {
      grid.innerHTML = '<p style="opacity:0.5; grid-column: span 4; text-align:center; padding:40px;">You haven\'t created any quizzes yet.</p>'
      return
    }

    grid.innerHTML = ''
    quizzes.forEach(q => {
      const div = document.createElement('div')
      div.className = 'rec-card'
      if (q.coverImage?.url) {
        div.style.backgroundImage = `url('${q.coverImage.url}')`
      }
      div.innerHTML = `
        <span>${q.title}</span>
      `
      div.onclick = () => openQuizModal(q)
      grid.appendChild(div)
    })

  } catch (err) {
    console.error(err)
    grid.innerHTML = '<p style="opacity:0.5; grid-column: span 4; text-align:center; padding:40px;">Failed to load quizzes.</p>'
  }
})

// ===== QUIZ MODAL =====
function openQuizModal(quiz) {
  const modal = document.getElementById('quiz-modal')
  if (!modal) return

  document.getElementById('modal-title').textContent = quiz.title
  document.getElementById('modal-q-num').textContent = quiz.questions.length

  const previewEl = document.querySelector('.modal-preview')
  if (previewEl) {
    previewEl.style.backgroundImage = quiz.coverImage?.url ? `url('${quiz.coverImage.url}')` : ''
  }

  window._selectedQuizId = quiz._id

  modal.classList.add('active')
  document.body.style.overflow = 'hidden'
}

function closeQuizModal() {
  const modal = document.getElementById('quiz-modal')
  if (modal) modal.classList.remove('active')
  document.body.style.overflow = ''
}

function hostGame() {
  if (window._selectedQuizId) {
    window.location.href = `../game/host/host-lobby.html?quizId=${window._selectedQuizId}`
  }
}

// ===== DROPDOWN =====
function toggleDropdown(e) {
  e.stopPropagation();
  const d = document.getElementById('user-dropdown');
  if (d) {
    d.style.display = d.style.display === 'flex' ? 'none' : 'flex';
  }
}
window.onclick = () => {
  const d = document.getElementById('user-dropdown');
  if (d) d.style.display = 'none';
};

// ===== LOGOUT =====
function showLogoutModal() {
  const modal = document.getElementById('logout-modal');
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; }, 10);
  document.body.style.overflow = 'hidden';
}

function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 200);
  }
}

function confirmLogout() {
  localStorage.removeItem('mock_user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../index.html';
}

document.getElementById('quiz-modal')?.addEventListener('click', function(e) { if (e.target === this) closeQuizModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeQuizModal(); });