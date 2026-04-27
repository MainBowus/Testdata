/* ===========================
   js/host-question.js
   Host Countdown Screen Logic
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  // Load progress
  const currentQ = parseInt(sessionStorage.getItem('current_question') || '0');
  const displayNum = currentQ + 1;
  
  const qLabel = document.getElementById('display-q-number');
  if (qLabel) qLabel.textContent = `Question ${displayNum}`;

  startCountdown();
});

function startCountdown() {
  let count = 3;
  const countEl = document.getElementById('gr-countdown');
  if (!countEl) return;

  countEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(interval);
      // Move to display page
      window.location.href = 'host-question-display.html';
    } else {
      countEl.textContent = count;
      // Re-trigger animation
      countEl.style.animation = 'none';
      void countEl.offsetWidth;
      countEl.style.animation = 'bounceTick 1s infinite';
    }
  }, 1000);
}