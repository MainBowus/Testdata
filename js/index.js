// =====================
// js/index.js
// Landing page logic
// =====================

/* ---- Restore navbar based on login state ---- */
(function () {
  try {
    const user = JSON.parse(localStorage.getItem('mock_user'));
    if (!user) return;

    // ถ้า login แล้ว ให้เปลี่ยนส่วนขวาเป็น user pill
    document.getElementById('nav-right').innerHTML = `
      <div class="user-pill" onclick="showLogoutModal()">
        <div class="ava">${user.name[0].toUpperCase()}</div>
        ${user.name}
      </div>`;
  } catch (e) {}
})();

function showLogoutModal() {
  if (!document.getElementById('logout-modal')) {
    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.style = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity 0.2s;";
    modal.innerHTML = `
      <div style="background:white;border-radius:24px;padding:40px;width:320px;text-align:center;transform:scale(0.9);transition:transform 0.2s;">
        <h3 style="font-family:'Archivo Black';font-size:22px;margin-bottom:15px;color:#333;">Log out?</h3>
        <p style="font-family:'Nunito';font-weight:600;color:#666;margin-bottom:30px;">Are you sure you want to log out of DataQuiz?</p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button onclick="closeLogoutModal()" style="padding:10px 20px;border-radius:50px;border:none;background:#eee;color:#333;font-family:'Archivo Black';cursor:pointer;">Cancel</button>
          <button onclick="confirmLogout()" style="padding:10px 20px;border-radius:50px;border:none;background:#ff3b5c;color:#fff;font-family:'Archivo Black';cursor:pointer;">Log out</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  const modal = document.getElementById('logout-modal');
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'all';
  modal.firstElementChild.style.transform = 'scale(1)';
}

function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
  modal.firstElementChild.style.transform = 'scale(0.9)';
}

function confirmLogout() {
  localStorage.removeItem('mock_user');
  window.location.href = 'index.html';
}

/* ---- Logout ---- */
function logout() {
  showLogoutModal();
}

/* ---- Join game ---- */
function doJoin() {
  const input = document.getElementById('pin-input');
  const pin   = input.value.trim();

  if (pin.length < 4) {
    showToast('Please enter a valid PIN 🎮');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 450);
    return;
  }

  window.location.href = 'dashboard/join.html?pin=' + pin;
}

/* ---- Toast ---- */
function showToast(msg, duration = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}