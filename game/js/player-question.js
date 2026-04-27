document.addEventListener('DOMContentLoaded', () => {
  const state = JSON.parse(sessionStorage.getItem('player_state'));
  
  // เช็คก่อนว่า element มีอยู่ไหม
  const nameEl = document.getElementById('display-name');
  if (nameEl && state) nameEl.textContent = state.name;

  const currentQ = parseInt(sessionStorage.getItem('current_question') || '0');
  const qNumEl = document.getElementById('display-q-number');
  if (qNumEl) qNumEl.textContent = `Question ${currentQ + 1}`;

  let count = 3;
  const countEl = document.getElementById('gr-countdown');
  if (!countEl) return;

  countEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(interval);
      window.location.href = 'player-question-display.html';
    } else {
      countEl.textContent = count;
    }
  }, 1000);
});