// creator.js

let questions = [];
let currentQIdx = -1;

const ANSWER_DEFAULTS = [
  { text: '', correct: false },
  { text: '', correct: false },
  { text: '', correct: false },
  { text: '', correct: false }
];

function init() {
  if (!Auth.isLoggedIn()) { navigateTo('../auth.html'); return; }

  // Load quiz title
  const title = sessionStorage.getItem('new_quiz_title') || 'Untitled Quiz';
  document.getElementById('quiz-title-field').value = title;

  // Load existing quiz if editing
  const editId = sessionStorage.getItem('edit_quiz_id');
  if (editId) {
    const quiz = GameState.getQuizById(parseInt(editId));
    if (quiz) {
      document.getElementById('quiz-title-field').value = quiz.title;
      questions = quiz.questions_data.map(q => ({ ...q, answers: q.answers.map(a => ({ ...a })) }));
      renderSidebar();
      if (questions.length) selectQuestion(0);
    }
  } else {
    // Start with one blank question
    addQuestion('multiple');
  }
}

function renderSidebar() {
  const list = document.getElementById('question-list');
  const badge = document.getElementById('q-count-badge');
  badge.textContent = questions.length;

  list.innerHTML = '';
  questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'q-item' + (i === currentQIdx ? ' active' : '');
    div.innerHTML = `
      <div class="q-item-num">${i + 1}</div>
      <div>
        <div class="q-item-label">${q.text || 'Untitled question'}</div>
        <div class="q-item-type">${q.type === 'multiple' ? '☑️ Multiple Choice' : '✏️ Open-ended'}</div>
      </div>`;
    div.onclick = () => selectQuestion(i);
    list.appendChild(div);
  });
}

function selectQuestion(idx) {
  currentQIdx = idx;
  const q = questions[idx];

  // Show editor
  document.getElementById('editor-empty').style.display = 'none';
  document.getElementById('editor-panel').style.display = 'block';
  document.getElementById('btn-dup').disabled = false;
  document.getElementById('btn-del').disabled = false;
  document.getElementById('toolbar-info').textContent = `Question ${idx + 1} of ${questions.length}`;

  // Fill fields
  document.getElementById('q-text-input').value = q.text || '';
  document.getElementById('q-time-select').value = q.time || 20;
  document.getElementById('q-points-select').value = q.points || 1000;

  setQType(q.type, false);
  renderAnswers();
  renderSidebar();
}

function setQType(type, updateQ = true) {
  const isMC = type === 'multiple';
  document.getElementById('mc-section').style.display = isMC ? 'block' : 'none';
  document.getElementById('oe-section').style.display = isMC ? 'none' : 'block';
  document.getElementById('tab-mc').classList.toggle('active', isMC);
  document.getElementById('tab-oe').classList.toggle('active', !isMC);

  if (updateQ && currentQIdx >= 0) {
    questions[currentQIdx].type = type;
    if (type === 'multiple' && !questions[currentQIdx].answers) {
      questions[currentQIdx].answers = ANSWER_DEFAULTS.map(a => ({ ...a }));
    }
    renderAnswers();
  }

  if (!isMC && currentQIdx >= 0) {
    const ans = questions[currentQIdx].answers;
    const correctAns = ans ? ans.find(a => a.correct) : null;
    document.getElementById('oe-answer-input').value = correctAns ? correctAns.text : '';
  }
}

function renderAnswers() {
  const grid = document.getElementById('answers-grid');
  if (currentQIdx < 0) return;
  const q = questions[currentQIdx];
  if (!q.answers) q.answers = ANSWER_DEFAULTS.map(a => ({ ...a }));

  grid.innerHTML = '';
  q.answers.forEach((ans, i) => {
    const color = ANSWER_COLORS[i];
    const div = document.createElement('div');
    div.className = 'answer-option' + (ans.correct ? ' correct' : '');
    div.innerHTML = `
      <div class="answer-color-bar" style="background:${color.bg}"></div>
      <div class="answer-body" style="background:${color.light}">
        <div class="answer-shape" style="background:${color.bg}">${color.shape}</div>
        <input type="text" placeholder="Answer ${color.label}" value="${ans.text}"
          oninput="updateAnswer(${i}, 'text', this.value)" />
        <button class="answer-correct-btn ${ans.correct ? 'active' : ''}"
          onclick="toggleCorrect(${i})" title="Mark as correct">✓</button>
      </div>`;
    grid.appendChild(div);
  });
}

function updateAnswer(i, key, val) {
  if (currentQIdx < 0) return;
  questions[currentQIdx].answers[i][key] = val;
}

function toggleCorrect(i) {
  if (currentQIdx < 0) return;
  const answers = questions[currentQIdx].answers;
  // For multiple choice, allow multiple correct or toggle
  answers[i].correct = !answers[i].correct;
  renderAnswers();
  syncCurrentQ();
}

function syncCurrentQ() {
  if (currentQIdx < 0) return;
  const q = questions[currentQIdx];
  q.text = document.getElementById('q-text-input').value;
  q.time = parseInt(document.getElementById('q-time-select').value);
  q.points = parseInt(document.getElementById('q-points-select').value);

  if (q.type === 'open') {
    const oeVal = document.getElementById('oe-answer-input').value;
    q.answers = oeVal.split(',').map(t => ({ text: t.trim(), correct: true })).filter(a => a.text);
  }

  renderSidebar();
}

function addQuestion(type) {
  document.getElementById('add-menu').style.display = 'none';
  const q = {
    id: Date.now(),
    type,
    text: '',
    time: 20,
    points: 1000,
    answers: type === 'multiple' ? ANSWER_DEFAULTS.map(a => ({ ...a })) : []
  };
  questions.push(q);
  renderSidebar();
  selectQuestion(questions.length - 1);
  showToast(type === 'multiple' ? 'Multiple choice added' : 'Open-ended added', 'success');
}

function showAddMenu() {
  const menu = document.getElementById('add-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function duplicateQ() {
  if (currentQIdx < 0) return;
  const copy = JSON.parse(JSON.stringify(questions[currentQIdx]));
  copy.id = Date.now();
  questions.splice(currentQIdx + 1, 0, copy);
  renderSidebar();
  selectQuestion(currentQIdx + 1);
  showToast('Question duplicated', 'success');
}

function deleteQ() {
  if (currentQIdx < 0) return;
  questions.splice(currentQIdx, 1);
  currentQIdx = Math.min(currentQIdx, questions.length - 1);
  if (questions.length === 0) {
    currentQIdx = -1;
    document.getElementById('editor-empty').style.display = 'flex';
    document.getElementById('editor-panel').style.display = 'none';
    document.getElementById('btn-dup').disabled = true;
    document.getElementById('btn-del').disabled = true;
  }
  renderSidebar();
  if (questions.length > 0) selectQuestion(currentQIdx);
  showToast('Question deleted', 'success');
}

function saveQuiz() {
  const title = document.getElementById('quiz-title-field').value.trim() || 'Untitled Quiz';
  const editId = sessionStorage.getItem('edit_quiz_id');

  if (editId) {
    const quiz = MockDB.quizzes.find(q => q.id === parseInt(editId));
    if (quiz) {
      quiz.title = title;
      quiz.questions = questions.length;
      quiz.questions_data = questions;
      showToast('Quiz saved! ✅', 'success');
    }
  } else {
    const emoji = sessionStorage.getItem('new_quiz_emoji') || '📝';
    const colors = [
      'linear-gradient(135deg,#8B5CF6,#EC4899)',
      'linear-gradient(135deg,#06B6D4,#10B981)',
      'linear-gradient(135deg,#F59E0B,#EF4444)',
      'linear-gradient(135deg,#3B82F6,#8B5CF6)'
    ];
    const newQuiz = {
      id: Date.now(),
      title,
      emoji,
      color: colors[Math.floor(Math.random() * colors.length)],
      questions: questions.length,
      plays: 0,
      createdBy: Auth.currentUser.id,
      questions_data: questions
    };
    MockDB.quizzes.unshift(newQuiz);
    sessionStorage.setItem('edit_quiz_id', newQuiz.id);
    showToast('Quiz created! ✅', 'success');
  }
}

function hostCurrentQuiz() {
  saveQuiz();
  const editId = sessionStorage.getItem('edit_quiz_id');
  if (editId) {
    sessionStorage.setItem('host_quiz_id', editId);
    navigateTo('../game/host/host.html');
  }
}

// Click outside to close add menu
document.addEventListener('click', e => {
  const menu = document.getElementById('add-menu');
  if (!e.target.closest('.add-question-btn') && !e.target.closest('#add-menu')) {
    menu.style.display = 'none';
  }
});

init();