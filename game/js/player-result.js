const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : 'https://backend-dataquiz.onrender.com';

const state = JSON.parse(sessionStorage.getItem('player_state')) || { name: 'Username', score: 0, rank: 1 }
let currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
const gamePin = state.pin

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('display-name').textContent = state.name

  const quizData = JSON.parse(localStorage.getItem('current_quiz') || 'null')
  const questions = quizData ? quizData.questions : []
  const totalQ = questions.length

  const progEl = document.getElementById('hud-progress')
  if (progEl) progEl.textContent = (currentQ + 1) + ' / ' + totalQ

  const statsEl = document.getElementById('hud-stats')
  if (statsEl) statsEl.textContent = '#' + (state.rank || 1) + ' Score ' + (state.score || 0)

  // ดักฟังข้อถัดไป
  const socket = io(SOCKET_URL, { transports: ['websocket'] })

  socket.on('connect', () => {
    if (gamePin) socket.emit('game:join', { pin: gamePin, name: state.name })
  })

  socket.on('game:question', (data) => {
    if (data.questionIndex > currentQ) {
      sessionStorage.setItem('current_question', data.questionIndex)
      window.location.href = 'player-question.html'
    }
  })

  socket.on('game:answer-result', (data) => {
    state.score = data.totalScore
    sessionStorage.setItem('player_state', JSON.stringify(state))
  })
})