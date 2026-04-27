// =====================
// js/auth.js
// Auth page logic
// =====================

const API_URL = 'https://backend-dataquiz.onrender.com/api'

/* ---- Switch Tabs ---- */
function switchTab(tab) {
  document.getElementById('tab-signup').classList.remove('active');
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-' + tab).classList.add('active');

  if (tab === 'signup') {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-signup').style.display = 'block';
  } else {
    document.getElementById('form-signup').style.display = 'none';
    document.getElementById('form-login').style.display = 'block';
  }
}

/* ---- Toggle Password Visibility ---- */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<s>👁</s>';
  } else {
    input.type = 'password';
    btn.innerHTML = '👁';
  }
}

/* ---- Handle Login ---- */
async function handleLogin() {
  const username = document.getElementById('login-email').value.trim();
  const pass     = document.getElementById('login-password').value.trim();

  if (!username || !pass) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect') || 'dashboard/explore.html';

  try {
    showToast('Logging in...', '');

    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pass })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Login failed', 'error');
      return;
    }

    // เก็บ token + user จริง
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    // เก็บ mock_user ไว้ด้วยเพื่อให้หน้าอื่นที่ยังใช้ mock_user ทำงานได้ระหว่างทาง
    localStorage.setItem('mock_user', JSON.stringify({ name: data.user.username, email: data.user.email || '' }));

    showToast('Login successful! Redirecting...', 'success');
    setTimeout(() => { window.location.href = redirectTo; }, 1000);

  } catch (err) {
    console.error(err);
    showToast('Cannot connect to server', 'error');
  }
}

/* ---- Handle Signup ---- */
async function handleSignup() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-password').value.trim();

  if (!name || !pass) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect') || 'dashboard/explore.html';

  try {
    showToast('Creating account...', '');

    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, email, password: pass })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Register failed', 'error');
      return;
    }

    showToast('Account created! Logging in...', 'success');

    // Auto-login หลัง register สำเร็จ
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, password: pass })
    });

    const loginData = await loginRes.json();

    if (loginRes.ok) {
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      localStorage.setItem('mock_user', JSON.stringify({ name: loginData.user.username, email: loginData.user.email || '' }));
      setTimeout(() => { window.location.href = redirectTo; }, 1000);
    } else {
      setTimeout(() => switchTab('login'), 1200);
    }

  } catch (err) {
    console.error(err);
    showToast('Cannot connect to server', 'error');
  }
}

/* ---- Handle Google Auth (ยังเป็น simulation เหมือนเดิม) ---- */
function handleGoogle() {
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get('redirect') || 'dashboard/explore.html';

  const overlay = document.createElement('div');
  overlay.style = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;";

  const popup = document.createElement('div');
  popup.style = "background:white;width:360px;padding:30px;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.3);text-align:center;animation:cardIn 0.3s ease-out;";

  popup.innerHTML = `
    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" width="40" style="margin-bottom:15px;">
    <h2 style="font-size:20px;margin-bottom:5px;color:#333;">Sign in with Google</h2>
    <p style="font-size:14px;color:#666;margin-bottom:20px;">to continue to QuizDATA</p>
    <div style="text-align:left;border:1px solid #ddd;border-radius:4px;overflow:hidden;margin-bottom:20px;">
      <div id="mock-acc" style="padding:12px;display:flex;align-items:center;gap:12px;cursor:pointer;background:#fff;transition:background 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#fff'">
        <div style="width:32px;height:32px;background:#4285F4;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">G</div>
        <div>
          <div style="font-size:14px;font-weight:bold;color:#333;">Google User</div>
          <div style="font-size:12px;color:#666;">user@gmail.com</div>
        </div>
      </div>
      <div style="padding:12px;border-top:1px solid #ddd;font-size:14px;color:#4285F4;cursor:pointer;font-weight:600;">Use another account</div>
    </div>
    <p style="font-size:12px;color:#888;line-height:1.4;">To continue, Google will share your name, email address, language preference, and profile picture with QuizDATA.</p>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  document.getElementById('mock-acc').onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(overlay);
      localStorage.setItem('mock_user', JSON.stringify({ name: 'Google User', email: 'user@gmail.com' }));
      showToast('Successfully signed in with Google!', 'success');
      setTimeout(() => { window.location.href = redirectTo; }, 800);
    }, 200);
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  };
}

/* ---- Toast Notification ---- */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ถ้า login แล้ว redirect ออกเลย
window.onload = function() {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'dashboard/explore.html';
  }
};