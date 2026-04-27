// ===== EXPLORE PAGE JS =====

const API_URL = 'https://backend-dataquiz.onrender.com/api'

// ===== FETCH DATA FROM DATABASE =====
async function fetchQuizzes() {
  try {
    const res = await fetch(`${API_URL}/quizzes`);
    if (!res.ok) throw new Error('Failed to fetch quizzes');
    return await res.json();
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    return [];
  }
}

// ===== CAROUSEL (NEW QUIZZES) =====
let carouselQuizzes = [];
let current = 0;

function initCarousel(allQuizzes) {
  // Rename section title to "New Quiz"
  const sectionTitle = document.querySelector('.popular-section .section-title');
  if (sectionTitle) sectionTitle.textContent = 'New Quiz';

  if (!allQuizzes || allQuizzes.length === 0) {
    if (card) {
      card.style.backgroundImage = 'none';
      card.style.backgroundColor = 'rgba(255,255,255,0.05)';
      if (titleEl) titleEl.textContent = 'No quizzes available';
      if (descEl) descEl.textContent = '';
      if (labelEl) labelEl.style.display = 'none';
    }
    return;
  }

  carouselQuizzes = [...allQuizzes].reverse().slice(0, 4);
  updateCard(0);
}

const labelEl = document.querySelector('.quiz-label');
const titleEl = document.querySelector('.quiz-card-inner h3');
const descEl  = document.querySelector('.quiz-card-inner p');
const card    = document.querySelector('.quiz-card-featured');

function updateCard(index) {
  if (!card || carouselQuizzes.length === 0) return;
  card.style.opacity = '0';
  setTimeout(() => {
    const q = carouselQuizzes[index];
    if (labelEl) {
      labelEl.textContent = '✨ New';
      labelEl.style.display = 'inline-block';
    }
    if (titleEl) titleEl.textContent = q.title;
    if (descEl) descEl.textContent  = `${q.questions?.length || 0} questions`;
    
    const imageUrl = q.coverImage?.url || q.image || '';
    if (card) card.style.backgroundImage = `url('${imageUrl}')`;
    card.style.opacity = '1';
  }, 180);
}

// Carousel Controls
document.querySelector('.carousel-btn.prev')?.addEventListener('click', () => {
  if (carouselQuizzes.length <= 1) return;
  current = (current - 1 + carouselQuizzes.length) % carouselQuizzes.length;
  updateCard(current);
});
document.querySelector('.carousel-btn.next')?.addEventListener('click', () => {
  if (carouselQuizzes.length <= 1) return;
  current = (current + 1) % carouselQuizzes.length;
  updateCard(current);
});

// ===== DYNAMIC SECTIONS =====
function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

function loadDynamicSections(allQuizzes) {
  const hasQuizzes = allQuizzes && allQuizzes.length > 0;

  // 1. Explore Section
  const exploreGrid = document.querySelector('.categories-grid');
  if (exploreGrid) {
    exploreGrid.innerHTML = '';
    if (!hasQuizzes) {
      exploreGrid.innerHTML = '<p style="opacity:0.5; grid-column: span 4; text-align:center; padding:20px; width: 100%;">No quizzes available</p>';
    } else {
      const randomExplore = shuffle([...allQuizzes]).slice(0, 4);
      randomExplore.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        const imageUrl = q.coverImage?.url || q.image || '';
        btn.style.backgroundImage = `url('${imageUrl}')`;
        btn.textContent = q.title;
        btn.onclick = () => openQuizModal(q);
        exploreGrid.appendChild(btn);
      });
    }
  }

  // 2. Quiz You Might Like
  const recBlocks = document.querySelectorAll('.rec-block');
  const mightLikeGrid = recBlocks[0]?.querySelector('.rec-grid');
  if (mightLikeGrid) {
    mightLikeGrid.innerHTML = '';
    if (!hasQuizzes) {
      mightLikeGrid.innerHTML = '<p style="opacity:0.5; grid-column: span 4; text-align:center; padding:20px;">No quizzes available</p>';
    } else {
      const randomLike = shuffle([...allQuizzes]).slice(0, 4);
      randomLike.forEach(q => {
        const div = document.createElement('div');
        div.className = 'rec-card';
        const imageUrl = q.coverImage?.url || q.image || '';
        div.style.backgroundImage = `url('${imageUrl}')`;
        div.innerHTML = `<span>${q.title}</span>`;
        div.onclick = () => openQuizModal(q);
        mightLikeGrid.appendChild(div);
      });
    }
  }

  // 3. Play Again
  const playAgainBlock = recBlocks[1];
  if (playAgainBlock) {
    const grid = playAgainBlock.querySelector('.rec-grid');
    if (grid) {
      grid.innerHTML = '';
      if (!hasQuizzes) {
        grid.innerHTML = '<p style="opacity:0.5; grid-column: span 4; text-align:center; padding:20px;">No quizzes available</p>';
      } else {
        const recentlyPlayed = [...allQuizzes].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 4);
        recentlyPlayed.forEach(q => {
          const div = document.createElement('div');
          div.className = 'rec-card';
          const imageUrl = q.coverImage?.url || q.image || '';
          if (imageUrl) div.style.backgroundImage = `url('${imageUrl}')`;
          div.innerHTML = `<span>${q.title}</span>`;
          div.onclick = () => openQuizModal(q);
          grid.appendChild(div);
        });
      }
    }
  }
}

// ===== QUIZ MODAL =====
function openQuizModal(quiz) {
  if (window.innerWidth <= 600) return;

  const modal = document.getElementById('quiz-modal');
  if (!modal) return;
  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = quiz.title || 'Quiz';
  
  const previewEl = document.querySelector('.modal-preview');
  const imageUrl = quiz.coverImage?.url || quiz.image || '';
  if (previewEl) previewEl.style.backgroundImage = `url('${imageUrl}')`;
  
  const qNumEl = document.getElementById('modal-q-num');
  const count = (quiz.questions && Array.isArray(quiz.questions)) ? quiz.questions.length : 0;
  if (qNumEl) qNumEl.textContent = String(count);

  window._selectedQuizId = quiz._id;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuizModal() {
  const modal = document.getElementById('quiz-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== INITIALIZE =====
let globalAllQuizzes = [];

document.addEventListener('DOMContentLoaded', async () => {
  const allQuizzes = await fetchQuizzes();
  globalAllQuizzes = allQuizzes;
  initCarousel(allQuizzes);
  loadDynamicSections(allQuizzes);
  initSearch();
});

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchDropdown = document.getElementById('search-dropdown');
  
  if (!searchInput || !searchDropdown) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    searchDropdown.innerHTML = '';
    
    if (query.length === 0) {
      searchDropdown.classList.remove('show');
      return;
    }

    const filtered = globalAllQuizzes.filter(q => 
      q.title && q.title.toLowerCase().includes(query)
    ).slice(0, 5); // Limit results

    if (filtered.length === 0) {
      searchDropdown.innerHTML = '<div style="padding: 15px 25px; color: #777; font-family: \'Nunito\', sans-serif;">No quizzes found</div>';
      searchDropdown.classList.add('show');
      return;
    }

    filtered.forEach(q => {
      const item = document.createElement('div');
      item.className = 'search-item';
      
      const imageUrl = q.coverImage?.url || q.image || '';
      
      item.innerHTML = `
        <div class="search-item-img" style="background-image: url('${imageUrl}');"></div>
        <div class="search-item-info">
          <span class="search-item-title">${q.title}</span>
          <span class="search-item-desc">${q.questions?.length || 0} questions</span>
        </div>
      `;
      
      item.onclick = () => {
        searchInput.value = '';
        searchDropdown.classList.remove('show');
        openQuizModal(q);
      };
      
      searchDropdown.appendChild(item);
    });
    
    searchDropdown.classList.add('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.remove('show');
    }
  });
}

// Navbar logic
(function () {
  const user = JSON.parse(localStorage.getItem('mock_user'));
  if (!user) return;
  const navRight = document.getElementById('nav-right');
  if (navRight) {
    navRight.innerHTML = `
      <div class="user-pill" id="user-pill" onclick="toggleDropdown(event)">
        <div class="ava">${user.name[0].toUpperCase()}</div>
        ${user.name}
        <span class="dropdown-arrow">▼</span>
        <div class="user-dropdown" id="user-dropdown">
          <div class="dropdown-item" onclick="goToProfile()">👤 Profile</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout" onclick="showLogoutModal()">🚪 Log Out</div>
        </div>
      </div>`;
  }
})();

function toggleDropdown(e) {
  e.stopPropagation();
  document.getElementById('user-dropdown')?.classList.toggle('show');
}
window.addEventListener('click', () => document.getElementById('user-dropdown')?.classList.remove('show'));

function goToProfile() { window.location.href = 'profile.html'; }

function showLogoutModal() {
  if (!document.getElementById('logout-modal')) {
    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.style = "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:none;align-items:center;justify-content:center;backdrop-filter:blur(4px);opacity:0;transition:opacity 0.2s;";
    modal.innerHTML = `
      <div style="background:white;border-radius:24px;padding:40px;width:320px;text-align:center;transform:scale(0.9);transition:transform 0.2s;">
        <h3 style="font-family:'Archivo Black';font-size:22px;margin-bottom:15px;color:#333;">Log out?</h3>
        <p style="font-family:'Nunito';font-weight:600;color:#666;margin-bottom:30px;">Are you sure you want to log out of DataQuiz?</p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button onclick="closeLogoutModal()" style="padding:10px 20px;border-radius:50px;border:none;background:#eee;color:#333;font-family:'Archivo Black';cursor:pointer;">Cancel</button>
          <button onclick="confirmLogout()" style="padding:10px 20px;border-radius:50px;border:none;background:#ff3b5c;color:#fff;font-family:'Archivo Black';cursor:pointer;box-shadow:0 4px 12px rgba(255,59,92,0.3);">Log out</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  const modal = document.getElementById('logout-modal');
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; modal.firstElementChild.style.transform = 'scale(1)'; }, 10);
  document.body.style.overflow = 'hidden';
}

function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.firstElementChild.style.transform = 'scale(0.9)';
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 200);
  }
}
function confirmLogout() {
  localStorage.clear()
  sessionStorage.clear()
  window.location.href = '../index.html';
}
function hostGame(mode) { 
  if (window._selectedQuizId) {
    window.location.href = `../game/host/host-lobby.html?quizId=${window._selectedQuizId}&mode=${mode}`;
  }
}

document.getElementById('quiz-modal')?.addEventListener('click', function(e) { if (e.target === this) closeQuizModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeQuizModal(); });
