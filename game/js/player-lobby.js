const SOCKET_URL = 'http://localhost:5000'

let socket = null

document.addEventListener('DOMContentLoaded', () => {
  const state = JSON.parse(sessionStorage.getItem('player_state'))
  if (!state) { window.location.href = '../../dashboard/join.html'; return }

  document.getElementById('display-name').textContent = state.name

  socket = io(SOCKET_URL)

  socket.on('connect', () => {
    console.log('Player lobby connected:', socket.id)
    socket.emit('game:join', { pin: state.pin, name: state.name })
  })

  socket.on('game:joined', (data) => {
    document.getElementById('display-quiz-name').textContent = data.quizTitle || 'QUIZ'
    sessionStorage.setItem('total_questions', data.totalQuestions)

    // โหลด quiz data จาก localStorage ถ้ามี
    const quizData = JSON.parse(localStorage.getItem('current_quiz') || 'null')
    if (quizData) {
      document.getElementById('display-quiz-name').textContent = quizData.title
    }
  })

  socket.on('game:started', (data) => {
    sessionStorage.setItem('current_question', '0')
    sessionStorage.setItem('total_questions', data.totalQuestions)
    window.location.href = 'player-question.html'
  })

  socket.on('game:error', (data) => {
    alert(data.message)
    window.location.href = '../../dashboard/join.html'
  })

  socket.on('game:host-disconnected', () => {
    alert('Host has disconnected. Game ended.')
    window.location.href = '../../dashboard/join.html'
  })
})