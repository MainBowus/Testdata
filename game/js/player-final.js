document.addEventListener('DOMContentLoaded', () => {
  const state = JSON.parse(sessionStorage.getItem('player_state')) || { name: 'Username', score: 0, rank: 1 };
  
  // HUD
  document.getElementById('display-name').textContent = state.name;
  
  const statsEl = document.getElementById('hud-stats');
  if (statsEl) {
    statsEl.textContent = `#${state.rank || 1} Score ${state.score || 0}`;
  }

  // Final Rank Text
  const rankEl = document.getElementById('final-rank');
  if (rankEl) {
    const rank = state.rank || 1;
    rankEl.textContent = getOrdinal(rank);
  }
});

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}