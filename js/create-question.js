// =====================
// js/create-question.js
// Create Question page logic
// =====================

window.addEventListener('DOMContentLoaded', () => {
  // โหลดชื่อ quiz จาก sessionStorage
  const setupName = sessionStorage.getItem('setup_quiz_name');
  if (setupName) {
    const titleInput = document.getElementById('quiz-title-input');
    if (titleInput) titleInput.value = setupName;
  }

  renderAnswerUI();
});

function renderAnswerUI() {
  const type = sessionStorage.getItem('setup_quiz_type') || 'multiple';
  const container = document.getElementById('answers-container');
  if (!container) return;

  if (type === 'multiple') {
    container.innerHTML = `
      <div class="answer-option">
        <div class="radio-marker" onclick="toggleCorrect(this.parentElement)"></div>
        <input type="text" placeholder="Type answer option here" class="answer-input" data-index="0" />
      </div>
      <div class="answer-option">
        <div class="radio-marker" onclick="toggleCorrect(this.parentElement)"></div>
        <input type="text" placeholder="Type answer option here" class="answer-input" data-index="1" />
      </div>
      <div class="answer-option">
        <div class="radio-marker" onclick="toggleCorrect(this.parentElement)"></div>
        <input type="text" placeholder="Type answer option here" class="answer-input" data-index="2" />
      </div>
      <div class="answer-option">
        <div class="radio-marker" onclick="toggleCorrect(this.parentElement)"></div>
        <input type="text" placeholder="Type answer option here" class="answer-input" data-index="3" />
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="grid-column: span 2; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.3); padding: 30px; border-radius: 20px;">
        <label style="display:block; color:#fff; margin-bottom:15px; font-family:'Archivo Black'; font-size: 20px;">Correct Answer</label>
        <input type="text" placeholder="Type the correct answer here..." class="answer-input" data-index="0"
          style="width:100%; background:none; border:none; font-size:24px; color:#888;" />
      </div>
    `;
  }
}

function toggleCorrect(el) {
  // el คือ .answer-option
  const options = document.querySelectorAll('.answer-option')
  const index = Array.from(options).indexOf(el)
  
  // อัปเดต questions state ด้วย
  questions[currentQ].correct = index
  
  // UI
  options.forEach(opt => opt.classList.remove('correct'))
  el.classList.add('correct')
}

function goBack() {
  window.location.href = 'create-quiz.html';
}