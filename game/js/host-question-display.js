const quizData = JSON.parse(localStorage.getItem('current_quiz') || 'null')
const questions = quizData ? quizData.questions : []

let currentQ = parseInt(sessionStorage.getItem('current_question') || '0')
let totalQ = questions.length

document.addEventListener('DOMContentLoaded', () => {
  loadQuestionInfo()
  setTimeout(() => {
    window.location.href = 'host-answering.html'
  }, 3000)
})

function loadQuestionInfo() {
  const q = questions[currentQ]
  if (!q) return

  const qType = q.questionType === 'multiple-choice' ? 'Multiple Choice' : 'Open-ended'

  const typeEl = document.getElementById('hud-type')
  if (typeEl) typeEl.textContent = qType

  const progressEl = document.getElementById('hud-progress')
  if (progressEl) progressEl.textContent = `${currentQ + 1} / ${totalQ}`

  const textEl = document.getElementById('q-text')
  if (textEl) textEl.textContent = q.questionText

  const imgEl = document.getElementById('q-image')
  const imgWrap = document.getElementById('q-image-wrap')
  if (q.questionImage?.url) {
    imgEl.src = q.questionImage.url
    imgWrap.style.display = 'flex'
  } else {
    if (imgWrap) imgWrap.style.display = 'none'
  }
}