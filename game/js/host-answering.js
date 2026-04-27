const SOCKET_URL = 'http://localhost:5000'

const quizData = JSON.parse(localStorage.getItem('current_quiz') || 'null')
const questions = quizData ? quizData.questions : []
let currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
let totalQ = questions.length
let timeLeft = questions[currentQ]?.timeLimit || 20
let timerInterval = null
let socket = null
const gamePin = sessionStorage.getItem('socket_pin')

document.addEventListener('DOMContentLoaded', () => {
  loadQuestionData()
  startCountdown()

  socket = io(SOCKET_URL)

  socket.on('connect', () => {
    console.log('Host answering connected:', socket.id)
    if (gamePin) {
      socket.emit('game:reconnect-host', { pin: gamePin })
      // socket.emit('game:next-question', { pin: gamePin }) // ออกไปเพื่อให้ server คุมจังหวะเอง
    }
  })

  socket.on('game:answer-count', (data) => {
    const countEl = document.getElementById('answer-count')
    if (countEl) countEl.textContent = data.answeredCount + ' / ' + data.totalPlayers + ' answered'
  })

  socket.on('game:time-up', () => {
    clearInterval(timerInterval)
    moveToReveal()
  })

  socket.on('game:error', (data) => {
    console.error('Game error:', data.message)
  })
})

function loadQuestionData() {
  const q = questions[currentQ]
  if (!q) return

  const qType = q.questionType === 'multiple-choice' ? 'Multiple Choice' : 'Open-ended'
  document.getElementById('hud-type').textContent = qType
  document.getElementById('hud-progress').textContent = (currentQ + 1) + ' / ' + totalQ
  document.getElementById('q-text').textContent = q.questionText

  const imgEl = document.getElementById('q-image')
  const imgWrap = document.getElementById('q-image-wrap')
  if (q.questionImage && q.questionImage.url) {
    imgEl.src = q.questionImage.url
    imgWrap.style.display = 'flex'
  } else {
    imgWrap.style.display = 'none'
  }

  const grid = document.getElementById('answers-grid')
  if (q.questionType === 'open-ended') {
    if (grid) grid.style.display = 'none'
  } else {
    if (grid) {
      grid.style.display = 'grid'
      q.options.forEach((opt, i) => {
        const card = document.getElementById('ans-' + i)
        if (card) card.textContent = opt.text
      })
    }
  }
}

function startCountdown() {
  const timerEl = document.getElementById('hud-timer')
  timerInterval = setInterval(() => {
    timeLeft--
    if (timerEl) timerEl.textContent = 'TIME ' + timeLeft
    if (timeLeft <= 0) {
      clearInterval(timerInterval)
      moveToReveal()
    }
  }, 1000)
}

function moveToReveal() {
  window.location.href = 'host-reveal.html'
}