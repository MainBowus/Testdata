const SOCKET_URL = 'https://backend-dataquiz.onrender.com'
const API_URL = 'https://backend-dataquiz.onrender.com/api'

let socket = null
let quizData = null
let gamePin = null

document.addEventListener('DOMContentLoaded', async () => {
  // โหลด quiz จาก API
  const params = new URLSearchParams(window.location.search)
  const quizId = params.get('quizId')
  if (quizId) await loadQuiz(quizId)

  // เชื่อม Socket.IO
  socket = io(SOCKET_URL)

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
    // สร้างเกมหลัง connect
    socket.emit('game:create', { quizId })
  })

  socket.on('game:created', (data) => {
    gamePin = data.pin
    document.getElementById('game-pin').textContent = gamePin
    document.getElementById('display-quiz-title').textContent = data.quizTitle.toUpperCase()
    sessionStorage.setItem('game_pin', gamePin)
    generateFunctionalQR(gamePin)
  })

  socket.on('game:player-joined', (data) => {
    updatePlayerList(data.players)
  })

  socket.on('game:player-left', (data) => {
    updatePlayerList(data.players)
  })

  socket.on('game:error', (data) => {
    alert(data.message)
  })
})

async function loadQuiz(quizId) {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/quizzes/${quizId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    if (!res.ok) throw new Error('Quiz not found')
    quizData = await res.json()
    localStorage.setItem('current_quiz', JSON.stringify(quizData))
  } catch (err) {
    console.error(err)
  }
}

function updatePlayerList(players) {
  const grid = document.getElementById('players-grid')
  const waiting = document.getElementById('waiting-section')

  if (players.length > 0) {
    waiting.style.display = 'none'
    grid.style.display = 'grid'
    grid.innerHTML = ''
    players.forEach(name => {
      const card = document.createElement('div')
      card.className = 'player-card'
      card.textContent = name
      grid.appendChild(card)
    })
  } else {
    waiting.style.display = 'block'
    grid.style.display = 'none'
  }
}

function generateFunctionalQR(pin) {
  const qrContainer = document.getElementById('qrcode')
  if (!qrContainer) return
  qrContainer.innerHTML = ''
  const currentUrl = window.location.href
  const baseUrl = currentUrl.split('/game/host/')[0]
  const joinUrl = `${baseUrl}/dashboard/join.html?pin=${pin}`
  new QRCode(qrContainer, {
    text: joinUrl, width: 140, height: 140,
    colorDark: '#000000', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  })
}

function startGame() {
  if (!socket || !gamePin) return
  const btn = document.getElementById('start-btn')
  btn.disabled = true
  btn.textContent = 'Starting...'

  socket.emit('game:start', { pin: gamePin })

  socket.on('game:started', () => {
    sessionStorage.setItem('current_question', '0')
    sessionStorage.setItem('socket_pin', gamePin)
    setTimeout(() => { window.location.href = 'host-question.html' }, 800)
  })

  socket.on('game:error', (data) => {
    alert(data.message)
    btn.disabled = false
    btn.textContent = 'START'
  })
}