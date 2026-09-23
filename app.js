(() => {
  "use strict";

  const QUESTIONS_PER_GAME = 10;
  const STARTING_LIVES = 5;

  const questionBanks = window.RAALQuestionBanks || {};

  const modeLabels = {
    gened: "GenEd Hangman",
    profed: "ProfEd Hangman",
    science: "Science Major Hangman"
  };

  const state = {
    mode: null,
    questions: [],
    index: 0,
    lives: STARTING_LIVES,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    answered: false
  };

  const $ = (id) => document.getElementById(id);

  const encouragements = [
    "Every correct answer brings the future teacher closer to graduation.",
    "Keep going. One question at a time.",
    "You are building knowledge and protecting the teacher!",
    "Stay focused. Your next correct answer could extend your streak.",
    "Almost there. Finish strong!"
  ];

  const screens = {
    mode: $("modeScreen"),
    game: $("gameScreen"),
    result: $("resultScreen")
  };

  function showScreen(screen) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getQuestionBank(mode) {
    const bank = questionBanks[mode];
    if (!Array.isArray(bank)) {
      throw new Error(`Question bank not found for mode: ${mode}`);
    }
    if (bank.length < QUESTIONS_PER_GAME) {
      throw new Error(`Question bank for ${mode} needs at least ${QUESTIONS_PER_GAME} questions.`);
    }
    return bank;
  }

  function validateQuestion(question, mode, index) {
    const required = ["question", "choices", "answer", "rationale", "topic", "difficulty"];
    const missing = required.filter(key => !(key in question));

    if (missing.length) {
      throw new Error(`Invalid ${mode} question #${index + 1}: missing ${missing.join(", ")}`);
    }

    if (!Array.isArray(question.choices) || question.choices.length !== 4) {
      throw new Error(`Invalid ${mode} question #${index + 1}: exactly 4 choices are required.`);
    }

    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
      throw new Error(`Invalid ${mode} question #${index + 1}: answer must be 0, 1, 2, or 3.`);
    }
  }

  function prepareQuestionBank(mode) {
    const bank = getQuestionBank(mode);
    bank.forEach((question, index) => validateQuestion(question, mode, index));
    return bank;
  }

  function startGame(mode) {
    const bank = prepareQuestionBank(mode);

    state.mode = mode;
    state.questions = shuffle(bank).slice(0, QUESTIONS_PER_GAME);
    state.index = 0;
    state.lives = STARTING_LIVES;
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.correct = 0;
    state.answered = false;

    $("modeName").textContent = modeLabels[mode];
    showScreen(screens.game);
    renderQuestion();
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    state.answered = false;

    $("questionNo").textContent = String(state.index + 1);
    $("score").textContent = String(state.score);
    $("streak").textContent = String(state.streak);
    $("progressBar").style.width = `${((state.index + 1) / QUESTIONS_PER_GAME) * 100}%`;
    $("encouragement").textContent = encouragements[state.index % encouragements.length];
    $("questionText").textContent = q.question;
    $("difficultyBadge").textContent = q.difficulty;
    $("topicLabel").textContent = q.topic;
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    $("nextBtn").hidden = true;
    $("nextBtn").textContent = state.index === QUESTIONS_PER_GAME - 1 ? "See Results" : "Next Question";

    renderLives();
    renderHangman();

    const choices = $("choices");
    choices.innerHTML = "";

    q.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.dataset.index = String(index);
      button.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> ${escapeHtml(choice)}`;
      button.addEventListener("click", () => handleAnswer(index, button));
      choices.appendChild(button);
    });
  }

  function handleAnswer(selected, selectedButton) {
    if (state.answered) return;
    state.answered = true;

    const q = state.questions[state.index];
    const buttons = [...$("choices").querySelectorAll(".choice")];
    buttons.forEach(button => { button.disabled = true; });

    const isCorrect = selected === q.answer;

    if (isCorrect) {
      const gained = 100 + (state.streak * 25);
      state.score += gained;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.correct += 1;

      selectedButton.classList.add("correct");
      $("feedback").className = "feedback success";
      $("feedback").innerHTML =
        `<strong>✓ Correct! +${gained} points</strong><br>` +
        `<span>${escapeHtml(q.rationale)}</span>`;
    } else {
      state.lives -= 1;
      state.streak = 0;
      selectedButton.classList.add("wrong");
      buttons[q.answer].classList.add("correct");

      $("feedback").className = "feedback error";
      $("feedback").innerHTML =
        `<strong>✗ Not quite.</strong> The correct answer is ` +
        `<strong>${String.fromCharCode(65 + q.answer)}. ${escapeHtml(q.choices[q.answer])}</strong><br>` +
        `<span>${escapeHtml(q.rationale)}</span>`;
    }

    $("score").textContent = String(state.score);
    $("streak").textContent = String(state.streak);
    $("progressBar").style.width = `${((state.index + 1) / QUESTIONS_PER_GAME) * 100}%`;
    renderLives();
    renderHangman();

    if (state.lives <= 0) {
      $("nextBtn").textContent = "See Results";
    }

    $("nextBtn").hidden = false;
  }

  function renderLives() {
    const full = "❤️ ";
    const empty = "🖤 ";
    $("lives").textContent = full.repeat(state.lives) + empty.repeat(STARTING_LIVES - state.lives);
    $("lives").setAttribute("aria-label", `${state.lives} lives remaining`);
    $("safetyText").textContent = `${state.lives} / ${STARTING_LIVES}`;
  }

  function renderHangman() {
    const lost = STARTING_LIVES - state.lives;
    const parts = ["hangHead", "hangBody", "hangLeftArm", "hangRightArm", "hangLeftLeg", "hangRightLeg"];

    parts.forEach((id, i) => {
      $(id).classList.toggle("show", lost >= i + 1);
    });
  }

  function nextQuestion() {
    if (state.index >= QUESTIONS_PER_GAME - 1 || state.lives <= 0) {
      showResults();
      return;
    }
    state.index += 1;
    renderQuestion();
  }

  function showResults() {
    const total = QUESTIONS_PER_GAME;
    const accuracy = Math.round((state.correct / total) * 100);

    $("finalScore").textContent = String(state.score);
    $("finalAccuracy").textContent = `${accuracy}%`;
    $("finalStreak").textContent = String(state.bestStreak);
    $("finalQuestions").textContent = String(total);

    if (state.lives > 0 && accuracy >= 80) {
      $("resultTitle").textContent = "The Future Teacher Is Safe! 🎓";
      $("resultMessage").textContent = "Excellent work. You protected the teacher and strengthened your LET knowledge.";
    } else if (state.lives > 0) {
      $("resultTitle").textContent = "You Reached the Finish Line! 📚";
      $("resultMessage").textContent = "Keep practicing. Every question is another step toward becoming a licensed teacher.";
    } else {
      $("resultTitle").textContent = "The Teacher Needs More Training! 💪";
      $("resultMessage").textContent = "Don't give up. Review the rationales and try again.";
    }

    showScreen(screens.result);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  document.querySelectorAll(".mode-card").forEach(button => {
    button.addEventListener("click", () => startGame(button.dataset.mode));
  });

  $("nextBtn").addEventListener("click", nextQuestion);
  $("restartBtn").addEventListener("click", () => showScreen(screens.mode));
  $("playAgainBtn").addEventListener("click", () => startGame(state.mode));
  $("chooseModeBtn").addEventListener("click", () => showScreen(screens.mode));

  showScreen(screens.mode);
})();
