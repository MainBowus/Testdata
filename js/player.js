// =====================
// js/player.js
// Player game logic
// =====================

// Load session state
const state = JSON.parse(sessionStorage.getItem('player_state') || '{}');
const playerName = state.name || 'Username';
const playerPin  = state.pin  || '0000000';
let   score      = 0;

// Fill footer info on all screens
document.querySelectorAll('[id^="footer-name"]').forEach(el => el.textContent = playerName);
document.querySelectorAll('[id^="footer-pin"]').forEach(el  => el.textContent = 'PIN : ' + playerPin);
document.querySelectorAll('[id^="footer-score"]').forEach(el => el.textContent = 'Score ' + score);

/* ---- Screen switcher ---- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ---- Answer selected ---- */
function selectAnswer(idx) {
  // mock: just show waiting again after short delay
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
  setTimeout(() => showScreen('screen-waiting'), 1000);
}