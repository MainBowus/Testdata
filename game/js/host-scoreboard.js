const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : 'https://backend-dataquiz.onrender.com';

const quizData = JSON.parse(localStorage.getItem('current_quiz') || 'null')
const totalQ = quizData ? quizData.questions.length : 0
let socket = null
const gamePin = sessionStorage.getItem('socket_pin')

document.addEventListener('DOMContentLoaded', () => {
  const currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
  const progEl = document.getElementById('hud-progress')
  if (progEl) progEl.textContent = (currentQ + 1) + ' / ' + totalQ

  socket = io(SOCKET_URL, { transports: ['websocket'] })

  socket.on('connect', () => {
    console.log('Host scoreboard connected:', socket.id)
    if (gamePin) {
      socket.emit('game:reconnect-host', { pin: gamePin })
      socket.emit('game:get-scoreboard', { pin: gamePin })
    }
  })

  socket.on('game:scoreboard', (data) => {
    buildScoreboard(data.scoreboard)
  })
})

function buildScoreboard(scoreboard) {
  const container = document.getElementById('sb-list')
  if (!container) return
  const top4 = scoreboard.slice(0, 4)
  container.innerHTML = ''
  top4.forEach((player, index) => {
    const rank = index + 1
    const card = document.createElement('div')
    card.className = 'sb-card ' + (rank === 1 ? 'first' : '')
    card.innerHTML = `<div class="sb-rank-num">${rank}</div><div class="sb-username">${player.name}</div><div class="sb-score-group"><span class="sb-score-label">Score</span><div class="sb-score-val">${player.score}</div></div>`
    container.appendChild(card)
  })
}

function goNext() {
  const currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
  const nextQ = currentQ + 1
  if (nextQ >= totalQ) {
    window.location.href = 'host-final.html'
  } else {
    if (socket && gamePin) {
      socket.emit('game:next-question', { pin: gamePin })
    }
    sessionStorage.setItem('current_question', nextQ)
    window.location.href = 'host-question.html'
  }
}