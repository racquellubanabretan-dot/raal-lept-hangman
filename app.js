(() => {
  "use strict";

  const QUESTIONS_PER_GAME = 10;
  const STARTING_LIVES = 5;

  const config = window.RAALSupabaseConfig || {};
  const SUPABASE_URL = String(config.url || "").replace(/\/$/, "");
  const SUPABASE_PUBLISHABLE_KEY = String(config.publishableKey || "");

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
    answered: false,
    loading: false
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

  function showModeStatus(message, isError = false) {
    const heroText = screens.mode.querySelector(".hero-card > p");
    if (!heroText) return;
    heroText.textContent = message;
    heroText.style.color = isError ? "#b42318" : "";
  }

  function setModeButtonsDisabled(disabled) {
    document.querySelectorAll(".mode-card").forEach(button => {
      button.disabled = disabled;
      button.setAttribute("aria-disabled", String(disabled));
    });
  }

  function assertSupabaseConfig() {
    if (!SUPABASE_URL || SUPABASE_URL.includes("PASTE_YOUR_SUPABASE")) {
      throw new Error("Supabase Project URL is not configured yet.");
    }
    if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.includes("PASTE_YOUR_SUPABASE")) {
      throw new Error("Supabase Publishable Key is not configured yet.");
    }
  }

  async function callSupabaseFunction(functionName, body) {
    assertSupabaseConfig();

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify(body)
    });

    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!response.ok) {
      const message = typeof data === "object" && data !== null
        ? (data.message || data.error_description || data.hint || JSON.stringify(data))
        : String(data || response.statusText);
      throw new Error(`Supabase request failed (${response.status}): ${message}`);
    }

    return data;
  }

  async function fetchQuestionsFromSupabase(mode) {
    const rows = await callSupabaseFunction("get_hangman_questions", {
      p_mode: mode,
      p_limit: 50
    });

    if (!Array.isArray(rows)) {
      throw new Error("Supabase returned an unexpected question response.");
    }

    if (rows.length < QUESTIONS_PER_GAME) {
      throw new Error(`Only ${rows.length} playable questions were returned for ${modeLabels[mode]}. At least ${QUESTIONS_PER_GAME} are required.`);
    }

    return shuffle(rows).slice(0, QUESTIONS_PER_GAME).map(normalizeQuestion);
  }

  function normalizeQuestion(row) {
    const choices = [row.choice_a, row.choice_b, row.choice_c, row.choice_d].map(value => String(value ?? ""));
    if (choices.some(choice => !choice.trim())) {
      throw new Error(`Question ${row.question_id || "(unknown ID)"} has an incomplete choice set.`);
    }

    return {
      id: String(row.question_id),
      question: String(row.question ?? ""),
      choices,
      topic: String(row.topic || "General LET Review"),
      difficulty: String(row.difficulty || "Mixed"),
      rationale: String(row.rationale || "Review the question and choices carefully, then try again.")
    };
  }

  async function checkAnswerOnSupabase(questionId, selectedIndex) {
    const answerLetter = String.fromCharCode(65 + selectedIndex);
    const rows = await callSupabaseFunction("check_hangman_answer", {
      p_question_id: questionId,
      p_answer: answerLetter
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("Supabase could not verify this question.");
    }

    const result = rows[0];
    return {
      isCorrect: Boolean(result.is_correct),
      correctAnswer: String(result.correct_answer || "").toUpperCase(),
      rationale: String(result.rationale || "Review the question and choices carefully, then try again.")
    };
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  async function startGame(mode) {
    if (state.loading) return;

    state.loading = true;
    setModeButtonsDisabled(true);
    showModeStatus(`Loading ${modeLabels[mode]} questions…`);

    try {
      const questions = await fetchQuestionsFromSupabase(mode);

      state.mode = mode;
      state.questions = questions;
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
    } catch (error) {
      console.error(error);
      showModeStatus(`We couldn't load the questions. ${error.message}`, true);
    } finally {
      state.loading = false;
      setModeButtonsDisabled(false);
    }
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

  async function handleAnswer(selected, selectedButton) {
    if (state.answered || state.loading) return;
    state.answered = true;
    state.loading = true;

    const buttons = [...$("choices").querySelectorAll(".choice")];
    buttons.forEach(button => { button.disabled = true; });
    selectedButton.classList.add("selected");
    $("feedback").className = "feedback";
    $("feedback").textContent = "Checking your answer…";

    const q = state.questions[state.index];

    try {
      const result = await checkAnswerOnSupabase(q.id, selected);
      const correctIndex = result.correctAnswer.charCodeAt(0) - 65;

      if (result.isCorrect) {
        const gained = 100 + (state.streak * 25);
        state.score += gained;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        state.correct += 1;

        selectedButton.classList.remove("selected");
        selectedButton.classList.add("correct");
        $("feedback").className = "feedback success";
        $("feedback").innerHTML =
          `<strong>✓ Correct! +${gained} points</strong><br>` +
          `<span>${escapeHtml(result.rationale)}</span>`;
      } else {
        state.lives -= 1;
        state.streak = 0;

        selectedButton.classList.remove("selected");
        selectedButton.classList.add("wrong");
        if (correctIndex >= 0 && correctIndex < buttons.length) {
          buttons[correctIndex].classList.add("correct");
        }

        const correctChoiceText = correctIndex >= 0 && correctIndex < q.choices.length
          ? q.choices[correctIndex]
          : `Option ${result.correctAnswer || "unknown"}`;

        $("feedback").className = "feedback error";
        $("feedback").innerHTML =
          `<strong>✗ Not quite.</strong> The correct answer is ` +
          `<strong>${escapeHtml(result.correctAnswer)}. ${escapeHtml(correctChoiceText)}</strong><br>` +
          `<span>${escapeHtml(result.rationale)}</span>`;
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
    } catch (error) {
      console.error(error);
      state.answered = false;
      buttons.forEach(button => { button.disabled = false; });
      selectedButton.classList.remove("selected");
      $("feedback").className = "feedback error";
      $("feedback").innerHTML =
        `<strong>We couldn't check that answer.</strong><br>` +
        `<span>${escapeHtml(error.message)}</span>`;
    } finally {
      state.loading = false;
    }
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
