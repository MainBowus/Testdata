const SOCKET_URL = 'https://backend-dataquiz.onrender.com';

let socket = null
let time = 20
let timerInterval = null
let answered = false
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

  const q = questions[currentQ]
  if (q) {
    document.getElementById('q-text').textContent = q.questionText
    time = q.timeLimit || 20

    const imgWrap = document.getElementById('q-image-wrap')
    if (q.questionImage && q.questionImage.url) {
      document.getElementById('q-image').src = q.questionImage.url
      if (imgWrap) imgWrap.style.display = 'flex'
    } else {
      if (imgWrap) imgWrap.style.display = 'none'
    }

    if (q.questionType === 'open-ended') {
      document.getElementById('multiple-choice-grid').style.display = 'none'
      document.getElementById('open-ended-area').style.display = 'flex'
    } else {
      document.getElementById('multiple-choice-grid').style.display = 'grid'
      document.getElementById('open-ended-area').style.display = 'none'
      q.options.forEach((opt, i) => {
        const btn = document.getElementById('ans-' + i)
        if (btn) btn.textContent = opt.text
      })
    }
  }

  startTimer()

  // บังคับใช้ websocket เพื่อความเสถียรบน Render
  socket = io(SOCKET_URL, { transports: ['websocket'] })

  socket.on('connect', () => {
    console.log('Player connected:', socket.id)
    if (gamePin) {
      socket.emit('game:join', { pin: gamePin, name: state.name })
    }
  })

  socket.on('game:question', (data) => {
    if (data.questionIndex > currentQ) {
      sessionStorage.setItem('current_question', data.questionIndex)
      window.location.href = 'player-question.html'
      return
    }
  })

  socket.on('game:answer-result', (data) => {
    clearInterval(timerInterval)
    sessionStorage.setItem('last_answer_result', data.isCorrect)
    sessionStorage.setItem('earned_points', data.earnedPoints)
    state.score = data.totalScore
    state.streak = data.streak
    sessionStorage.setItem('player_state', JSON.stringify(state))
    window.location.href = 'player-result.html'
  })

  socket.on('game:time-up', () => {
    clearInterval(timerInterval)
    if (!answered) {
      sessionStorage.setItem('last_answer_result', 'false')
      sessionStorage.setItem('earned_points', '0')
    }
    window.location.href = 'player-result.html'
  })
})

function startTimer() {
  const timerEl = document.getElementById('hud-timer')
  timerInterval = setInterval(() => {
    time--
    if (timerEl) timerEl.textContent = 'TIME ' + time
    if (time <= 0) clearInterval(timerInterval)
  }, 1000)
}

function submitAnswer(index) {
  if (answered) return
  answered = true
  if (socket && gamePin) {
    socket.emit('game:answer', { pin: gamePin, answerIndex: index })
  }
}

function submitOpenEnded() {
  if (answered) return
  answered = true
  sessionStorage.setItem('open_answer', document.getElementById('open-ended-input').value)
  if (socket && gamePin) {
    socket.emit('game:answer', { pin: gamePin, answerIndex: 0 })
  }
}