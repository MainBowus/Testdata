/* ===========================
   js/quiz-editor.js
   Quiz Editor Logic
   =========================== */

const API_URL = 'http://localhost:5000/api'

// ===== STATE =====
let questions = [
  { text: '', image: null, answers: ['', '', '', ''], correct: null }
];
let currentQ = 0;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const savedTitle = sessionStorage.getItem('setup_quiz_name');
  if (savedTitle) {
    const titleInput = document.getElementById('quiz-title-input');
    if (titleInput) titleInput.value = savedTitle;
  }

  renderTabs();
  loadQuestion(0);
});

// ===== TABS =====
function renderTabs() {
  const container = document.getElementById('question-tabs');
  if (!container) return;
  container.innerHTML = '';

  questions.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'q-tab' + (i === currentQ ? ' active' : '');
    btn.textContent = i + 1;
    btn.onclick = () => switchQuestion(i);
    container.appendChild(btn);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'q-tab-add';
  addBtn.textContent = '+';
  addBtn.title = 'Add question';
  addBtn.onclick = addQuestion;
  container.appendChild(addBtn);
}

function switchQuestion(index) {
  saveCurrentQuestion();
  currentQ = index;
  renderTabs();
  loadQuestion(index);
}

function addQuestion() {
  saveCurrentQuestion();
  questions.push({ text: '', image: null, answers: ['', '', '', ''], correct: null });
  currentQ = questions.length - 1;
  renderTabs();
  loadQuestion(currentQ);
  showToast('Question ' + (currentQ + 1) + ' added', 'success');
}

// ===== LOAD / SAVE QUESTION =====
function loadQuestion(index) {
  const q = questions[index];
  if (!q) return;

  const qInput = document.getElementById('question-text');
  if (qInput) qInput.value = q.text || '';

  const inputs = document.querySelectorAll('.answer-input');
  inputs.forEach((inp, i) => {
    inp.value = (q.answers && q.answers[i]) || '';
  });

  const options = document.querySelectorAll('.answer-option');
  options.forEach((opt, i) => {
    opt.classList.toggle('correct', q.correct === i);
  });

  const previewArea = document.getElementById('media-preview');
  if (!previewArea) return;

  if (q.image) {
    previewArea.innerHTML = `<img src="${q.image}" alt="Question image" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" />`;
  } else {
    previewArea.innerHTML = `
      <div class="upload-icon">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
    `;
  }
}

function saveCurrentQuestion() {
  const q = questions[currentQ];
  if (!q) return;

  const qInput = document.getElementById('question-text');
  if (qInput) q.text = qInput.value.trim();

  const inputs = document.querySelectorAll('.answer-input');
  if (!q.answers) q.answers = ['', '', '', ''];
  inputs.forEach((inp, i) => { q.answers[i] = inp.value.trim(); });
}

// ===== CORRECT ANSWER =====
function toggleCorrect(el) {
  const options = document.querySelectorAll('.answer-option');
  const index = Array.from(options).indexOf(el);

  if (questions[currentQ].correct === index) {
    questions[currentQ].correct = null;
    el.classList.remove('correct');
  } else {
    questions[currentQ].correct = index;
    options.forEach(opt => opt.classList.remove('correct'));
    el.classList.add('correct');
  }
}

// ===== IMAGE UPLOAD =====
function triggerUpload() {
  const fileInput = document.getElementById('media-file-input');
  if (fileInput) fileInput.click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file', 'error');
    return;
  }

  // เก็บ File object ไว้ส่ง API
  questions[currentQ]._imageFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    questions[currentQ].image = e.target.result;
    const previewArea = document.getElementById('media-preview');
    if (previewArea) {
      previewArea.innerHTML = `<img src="${e.target.result}" alt="Question image" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" />`;
    }
  };
  reader.readAsDataURL(file);
}

// ===== SAVE (ยิง API จริง) =====
async function saveQuiz() {
  try {
    saveCurrentQuestion();

    const titleInput = document.getElementById('quiz-title-input');
    const title = titleInput ? titleInput.value.trim() : '';

    if (!title) {
      showToast('Please enter a quiz title', 'error');
      return;
    }

    const quizType = sessionStorage.getItem('setup_quiz_type') || 'multiple';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = i + 1;
      if (quizType === 'multiple') {
        if (!q.text.trim()) {
          alert(`Question ${qNum}: Please enter the question text.`);
          return;
        }
        if (q.answers.some(a => !a.trim())) {
          alert(`Question ${qNum}: Please fill in all four answer options.`);
          return;
        }
        if (q.correct === null) {
          alert(`Question ${qNum}: Please select which answer is correct.`);
          return;
        }
      } else {
        // Open-ended
        if (!q.text.trim()) {
          alert(`Question ${qNum}: Please enter the question text.`);
          return;
        }
        if (!q.answers[0] || !q.answers[0].trim()) {
          alert(`Question ${qNum}: Please enter the correct answer.`);
          return;
        }
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please log in first', 'error');
      window.location.href = '../auth.html';
      return;
    }

    showToast('Saving...', '');

    const formattedQuestions = questions.map(q => {
      if (quizType === 'multiple') {
        return {
          questionText: q.text,
          questionType: 'multiple-choice',
          timeLimit: 20,
          points: 1000,
          options: q.answers.map((ans, i) => ({
            text: ans || `Option ${i + 1}`,
            isCorrect: q.correct === i
          }))
        }
      } else {
        return {
          questionText: q.text,
          questionType: 'open-ended',
          timeLimit: 20,
          points: 1000,
          acceptedAnswers: q.answers.filter(a => a).length > 0
            ? q.answers.filter(a => a)
            : [q.answers[q.correct] || '']
        }
      }
    });

    // สร้าง FormData ส่งพร้อมรูปปก
    const formData = new FormData();
    formData.append('title', title);
    formData.append('isPublic', 'true');
    formData.append('category', 'General');
    formData.append('questions', JSON.stringify(formattedQuestions));




    const res = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Save failed', 'error');
      return;
    }

    // Cleanup
    sessionStorage.removeItem('setup_quiz_name');
    sessionStorage.removeItem('setup_quiz_type');

    window._coverImageFile = null;

    showToast('Quiz saved successfully! ✅', 'success');
    setTimeout(() => { window.location.href = 'explore.html'; }, 1200);

  } catch (err) {
    console.error('Save error:', err);
    showToast('Cannot connect to server', 'error');
  }
}

// ===== EXIT / BACK =====
function confirmExit() {
  if (confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
    window.location.href = '../index.html';
  }
}

function goBack() {
  window.location.href = 'create-quiz.html';
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) { alert(msg); return; }
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 2800);

}
