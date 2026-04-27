const SOCKET_URL = 'http://localhost:5000'

const quizData = JSON.parse(localStorage.getItem('current_quiz') || 'null')
const questions = quizData ? quizData.questions : []
let currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
let totalQ = questions.length
let socket = null
const gamePin = sessionStorage.getItem('socket_pin')

document.addEventListener('DOMContentLoaded', () => {
  loadRevealData()

  socket = io(SOCKET_URL)

  socket.on('connect', () => {
    console.log('Host reveal connected:', socket.id)
    if (gamePin) {
      socket.emit('game:reconnect-host', { pin: gamePin })
      socket.emit('game:get-reveal', { pin: gamePin })
    }
  })

  socket.on('game:reveal', (data) => {
    data.options && data.options.forEach((opt, i) => {
      const countEl = document.getElementById('count-' + i)
      if (countEl) countEl.textContent = opt.count + ' (' + opt.percentage + '%)'
    })
  })

  socket.on('game:error', (data) => {
    console.error('Game error:', data.message)
  })
})

function loadRevealData() {
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
    const correctAns = (q.acceptedAnswers || []).join(', ') || '-'
    if (grid) {
      grid.innerHTML = '<div class="answer-card correct" style="grid-column:1/-1;width:100%;text-align:center;">Correct Answer: ' + correctAns + '</div>'
      grid.style.display = 'grid'
    }
  } else {
    if (grid) {
      grid.style.display = 'grid'
      q.options.forEach((opt, i) => {
        const card = document.getElementById('ans-' + i)
        if (card) {
          card.textContent = opt.text
          opt.isCorrect ? card.classList.add('correct') : card.classList.remove('correct')
        }
      })
    }
  }
}

function goNext() {
  window.location.href = 'host-scoreboard.html'
}