let selectedType = 'multiple';

// Restore login state + dropdown
(function () {
  try {
    const user = JSON.parse(localStorage.getItem('mock_user'));
    if (!user) return;
    const navRight = document.getElementById('nav-right');
    if (navRight) {
      navRight.innerHTML = `
        <div class="user-pill" id="user-pill" onclick="toggleDropdown(event)" style="position:relative;display:flex;align-items:center;gap:8px;padding:5px 14px 5px 5px;border-radius:50px;background:rgba(255,255,255,0.1);cursor:pointer;font-size:14px;font-weight:800;color:#fff;">
          <div class="ava" style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00d2ff,#0072ff);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;">${user.name[0].toUpperCase()}</div>
          ${user.name}
          <span class="dropdown-arrow">▼</span>

          <div id="user-dropdown" style="display:none;position:absolute;top:110%;right:0;background:#1c2c43;border:1px solid rgba(255,255,255,0.15);border-radius:14px;min-width:150px;overflow:hidden;z-index:999;">
            <div onclick="window.location.href='profile.html'" style="padding:12px 20px;cursor:pointer;font-size:13px;color:#fff;">👤 Profile</div>
            <div onclick="showLogoutModal()" style="padding:12px 20px;cursor:pointer;font-size:13px;color:#ff4757;">🚪 Log Out</div>
          </div>
        </div>`;
    }
  } catch (e) {}
})();

function toggleDropdown(e) {
  e.stopPropagation();
  const d = document.getElementById('user-dropdown');
  if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
}
window.addEventListener('click', () => {
  const d = document.getElementById('user-dropdown');
  if (d) d.style.display = 'none';
});

function showLogoutModal() {
  const modal = document.getElementById('logout-modal');
  modal.style.display = 'flex';
  setTimeout(() => modal.style.opacity = '1', 10);
}
function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  modal.style.opacity = '0';
  setTimeout(() => modal.style.display = 'none', 200);
}
function confirmLogout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '../index.html';
}

function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    sessionStorage.setItem('setup_quiz_image_b64', event.target.result);
    sessionStorage.setItem('setup_quiz_image_type', file.type);
    document.getElementById('image-preview').src = event.target.result;
    document.getElementById('image-preview').style.display = 'block';
    document.getElementById('image-preview-text').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function setType(type) {
  selectedType = type;
  document.getElementById('type-multiple').classList.toggle('active', type === 'multiple');
  document.getElementById('type-open').classList.toggle('active', type === 'open');
}

function startCreating() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in first to create a quiz!');
    window.location.href = '../auth.html';
    return;
  }

  const name = document.getElementById('quiz-name').value.trim();
  if (!name) { alert('Please enter a quiz name'); return; }
  if (!sessionStorage.getItem('setup_quiz_image_b64')) { alert('Please upload a quiz image'); return; }
  if (!selectedType) { alert('Please select a quiz type'); return; }

  sessionStorage.setItem('setup_quiz_name', name);
  sessionStorage.setItem('setup_quiz_type', selectedType);

  window.location.href = 'create-question.html';
}