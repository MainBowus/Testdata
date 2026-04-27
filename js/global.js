// =====================
// js/global.js
// Utility ที่ใช้ทุกหน้า
// =====================

const API = 'https://backend-dataquiz.onrender.com/api'

/* ---- Token Helpers ---- */
function getToken() {
  return localStorage.getItem('token')
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function isLoggedIn() {
  return !!getToken()
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = getRootPath() + 'auth.html'
}

/* ---- API Helper (ยิง request พร้อม token อัตโนมัติ) ---- */
async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    ...options.headers
  }

  // ถ้าไม่ใช่ FormData ให้ใส่ Content-Type เป็น JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API}${path}`, { ...options, headers })

  // Token หมดอายุ → logout
  if (res.status === 401) {
    logout()
    return null
  }

  return res
}

/* ---- Root Path (ปรับตาม folder ที่อยู่) ---- */
function getRootPath() {
  const path = window.location.pathname
  if (path.includes('/game/host/') || path.includes('/game/player/')) return '../../'
  if (path.includes('/dashboard/') || path.includes('/creator/')) return '../'
  return ''
}

/* ---- Inject Navbar User State ---- */
function injectNavUser(navRightId = 'nav-right') {
  const user = getUser()
  const navRight = document.getElementById(navRightId)
  if (!navRight) return

  if (user) {
    navRight.innerHTML = `
      <div class="user-pill" onclick="toggleNavDropdown(event)" style="position:relative;display:flex;align-items:center;gap:8px;padding:5px 14px 5px 5px;border-radius:50px;background:rgba(255,255,255,0.1);cursor:pointer;font-size:14px;font-weight:800;color:#fff;">
        <div class="ava" style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00d2ff,#0072ff);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;">${user.username[0].toUpperCase()}</div>
        ${user.username}
        <div id="nav-dropdown" style="display:none;position:absolute;top:110%;right:0;background:#1c2c43;border:1px solid rgba(255,255,255,0.15);border-radius:14px;min-width:150px;overflow:hidden;z-index:999;">
          <div onclick="window.location.href='${getRootPath()}dashboard/profile.html'" style="padding:12px 20px;cursor:pointer;font-size:13px;color:#fff;">👤 Profile</div>
          <div onclick="logout()" style="padding:12px 20px;cursor:pointer;font-size:13px;color:#ff4757;">🚪 Log Out</div>
        </div>
      </div>`
  } else {
    navRight.innerHTML = `<a href="${getRootPath()}auth.html" class="nav-login">Log in</a>`
  }
}

function toggleNavDropdown(e) {
  e.stopPropagation()
  const d = document.getElementById('nav-dropdown')
  if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none'
}

window.addEventListener('click', () => {
  const d = document.getElementById('nav-dropdown')
  if (d) d.style.display = 'none'
})