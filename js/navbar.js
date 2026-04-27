// =====================
// js/navbar.js
// Shared navbar — inject into every page
// =====================

(function () {
  // หาว่าไฟล์นี้อยู่ระดับไหน (root / dashboard / game/host / game/player)
  const path = window.location.pathname;
  let root = '';
  if (path.includes('/game/host/') || path.includes('/game/player/')) root = '../../';
  else if (path.includes('/dashboard/')) root = '../';

  // Active page highlight
  const page = path.split('/').pop();

  function isActive(href) {
    return page === href.split('/').pop() ? 'active' : '';
  }

  // Auth state
  let rightHTML = '';
  try {
    const user = JSON.parse(localStorage.getItem('mock_user'));
    if (user) {
      rightHTML = `
        <div class="nav-user-pill" onclick="navLogout()">
          <div class="nav-ava">${user.name[0].toUpperCase()}</div>
          <span>${user.name}</span>
        </div>`;
    } else {
      rightHTML = `<a href="${root}auth.html" class="nav-login">Log in</a>`;
    }
  } catch (e) {
    rightHTML = `<a href="${root}auth.html" class="nav-login">Log in</a>`;
  }

  const html = `
    <nav class="navbar" id="main-navbar">
      <a class="navbar-logo" href="${root}index.html">QuizDATA</a>

      <div class="nav-btns">
        <a href="${root}dashboard/explore.html"        class="nav-btn nav-btn-explore ${isActive('explore.html')}">Explore</a>
        <a href="${root}dashboard/explore-create.html" class="nav-btn nav-btn-create  ${isActive('explore-create.html')}">Create</a>
        <a href="${root}dashboard/join.html"           class="nav-btn nav-btn-join    ${isActive('join.html')}">Join</a>
      </div>

      <div class="nav-right">${rightHTML}</div>
    </nav>
  `;

  // Inject
  const target = document.getElementById('navbar');
  if (target) {
    target.innerHTML = html;
  } else {
    document.body.insertAdjacentHTML('afterbegin', html);
  }
})();

function navLogout() {
  localStorage.removeItem('mock_user');
  location.reload();
}