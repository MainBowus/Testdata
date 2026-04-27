const SOCKET_URL = 'http://localhost:5000'

const quizData = JSON.parse(localStorage.getItem('current_quiz') || 'null')
const totalQ = quizData ? quizData.questions.length : 0
let socket = null
const gamePin = sessionStorage.getItem('socket_pin')

document.addEventListener('DOMContentLoaded', () => {
  const currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
  const progEl = document.getElementById('hud-progress')
  if (progEl) progEl.textContent = (currentQ + 1) + ' / ' + totalQ

  socket = io(SOCKET_URL)

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

  socket.on('game:error', (data) => {
    console.error('Game error:', data.message)
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
    card.innerHTML =
      '<div class="sb-rank-num">' + rank + '</div>' +
      '<div class="sb-username">' + player.name + '</div>' +
      '<div class="sb-score-group">' +
        '<span class="sb-score-label">Score</span>' +
        '<div class="sb-score-val">' + player.score + '</div>' +
      '</div>'
    container.appendChild(card)
  })

  if (top4.length === 0) {
    container.innerHTML = '<div style="text-align:center;font-size:24px;margin-top:50px;">Waiting for players...</div>'
  }
}

function goNext() {
  const currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
  const nextQ = currentQ + 1

  if (nextQ >= totalQ) {
    window.location.href = 'host-final.html'
  } else {
    sessionStorage.setItem('current_question', nextQ)
    window.location.href = 'host-question.html'
  }
}