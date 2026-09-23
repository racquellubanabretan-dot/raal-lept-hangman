(() => {
  "use strict";

  const QUESTIONS_PER_GAME = 10;
  const STARTING_LIVES = 5;

  const questionBanks = {
    gened: [
      {
        question: "Which branch of philosophy is primarily concerned with the nature, sources, and limits of knowledge?",
        choices: ["Ethics", "Epistemology", "Aesthetics", "Logic"],
        answer: 1,
        rationale: "Epistemology is the branch of philosophy that studies knowledge, including its sources, justification, and limits.",
        topic: "Philosophy",
        difficulty: "Moderate"
      },
      {
        question: "What is 15% of 200?",
        choices: ["15", "20", "30", "35"],
        answer: 2,
        rationale: "15% is 0.15. Multiplying 0.15 by 200 gives 30.",
        topic: "Mathematics",
        difficulty: "Easy"
      },
      {
        question: "Which organelle is known as the powerhouse of the cell?",
        choices: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"],
        answer: 2,
        rationale: "Mitochondria produce most of the ATP used by cells for energy-requiring processes.",
        topic: "Biology",
        difficulty: "Easy"
      },
      {
        question: "Which figure of speech compares two unlike things using 'like' or 'as'?",
        choices: ["Metaphor", "Simile", "Personification", "Hyperbole"],
        answer: 1,
        rationale: "A simile makes a comparison using words such as 'like' or 'as.'",
        topic: "English",
        difficulty: "Easy"
      },
      {
        question: "Which economic principle states that, other things being equal, quantity demanded generally decreases as price increases?",
        choices: ["Law of supply", "Law of demand", "Law of scarcity", "Law of utility"],
        answer: 1,
        rationale: "The law of demand describes an inverse relationship between price and quantity demanded, ceteris paribus.",
        topic: "Economics",
        difficulty: "Moderate"
      },
      {
        question: "Which layer of Earth's atmosphere contains most of the ozone layer?",
        choices: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
        answer: 1,
        rationale: "Most atmospheric ozone is concentrated in the stratosphere, forming the ozone layer.",
        topic: "Earth Science",
        difficulty: "Easy"
      },
      {
        question: "If a triangle has angles of 40° and 60°, what is the measure of its third angle?",
        choices: ["70°", "80°", "90°", "100°"],
        answer: 1,
        rationale: "The interior angles of a triangle total 180°. Thus, 180° − 40° − 60° = 80°.",
        topic: "Mathematics",
        difficulty: "Easy"
      },
      {
        question: "Which process involves the movement of water from Earth's surface into the atmosphere through evaporation and transpiration?",
        choices: ["Condensation", "Precipitation", "Evapotranspiration", "Infiltration"],
        answer: 2,
        rationale: "Evapotranspiration combines evaporation from surfaces with transpiration from plants.",
        topic: "Earth Science",
        difficulty: "Moderate"
      },
      {
        question: "Which statement best describes a primary source in historical research?",
        choices: ["A later textbook summary", "An original document or firsthand account", "A study guide", "A review article"],
        answer: 1,
        rationale: "Primary sources provide direct or firsthand evidence from the period or event being studied.",
        topic: "Social Science",
        difficulty: "Moderate"
      },
      {
        question: "What is the main purpose of a thesis statement in an academic essay?",
        choices: ["To list every source", "To present the central claim or controlling idea", "To provide the conclusion only", "To define every technical term"],
        answer: 1,
        rationale: "A thesis statement communicates the essay's central claim or controlling idea and guides the discussion.",
        topic: "English",
        difficulty: "Easy"
      }
    ],

    profed: [
      {
        question: "Which learning theory emphasizes learning through observation, imitation, and modeling?",
        choices: ["Behaviorism", "Constructivism", "Social Learning Theory", "Cognitivism"],
        answer: 2,
        rationale: "Social Learning Theory explains that people can learn by observing others and modeling their behavior.",
        topic: "Learning Theories",
        difficulty: "Easy"
      },
      {
        question: "Which type of assessment is administered during instruction to monitor learning and provide feedback?",
        choices: ["Summative", "Formative", "Placement", "Norm-referenced"],
        answer: 1,
        rationale: "Formative assessment is used during instruction to monitor progress and guide teaching and learning.",
        topic: "Assessment",
        difficulty: "Easy"
      },
      {
        question: "Which approach views learners as active participants who construct meaning from experiences?",
        choices: ["Constructivism", "Essentialism", "Perennialism", "Classical conditioning"],
        answer: 0,
        rationale: "Constructivism holds that learners actively construct knowledge through experiences and interaction with their environment.",
        topic: "Learning Theories",
        difficulty: "Easy"
      },
      {
        question: "What is the primary purpose of a Table of Specifications?",
        choices: ["To record attendance", "To align test items with content and cognitive objectives", "To rank students", "To calculate grades automatically"],
        answer: 1,
        rationale: "A Table of Specifications helps ensure that assessment items represent the intended content areas and cognitive levels.",
        topic: "Assessment",
        difficulty: "Moderate"
      },
      {
        question: "Which classroom management approach emphasizes establishing clear expectations and consistently reinforcing appropriate behavior?",
        choices: ["Preventive management", "Random management", "Unstructured management", "Passive management"],
        answer: 0,
        rationale: "Preventive classroom management aims to reduce problems by establishing expectations, routines, and supportive conditions before issues occur.",
        topic: "Classroom Management",
        difficulty: "Moderate"
      },
      {
        question: "In Bloom's revised taxonomy, which cognitive process generally represents the highest level?",
        choices: ["Remember", "Understand", "Evaluate", "Create"],
        answer: 3,
        rationale: "The revised taxonomy places Create at the highest level, following Remember, Understand, Apply, Analyze, and Evaluate.",
        topic: "Educational Objectives",
        difficulty: "Easy"
      },
      {
        question: "Which principle of learning emphasizes that learners are more likely to remember information that is meaningful and connected to prior knowledge?",
        choices: ["Meaningfulness", "Isolation", "Randomness", "Inconsistency"],
        answer: 0,
        rationale: "Meaningful learning is strengthened when new information is connected to what learners already know.",
        topic: "Learning Principles",
        difficulty: "Moderate"
      },
      {
        question: "A teacher gives immediate feedback while students are practicing a new skill. What instructional purpose does this primarily serve?",
        choices: ["Correcting misconceptions and guiding performance", "Assigning final grades", "Replacing instruction", "Determining class rank"],
        answer: 0,
        rationale: "Immediate feedback helps learners identify errors and adjust their performance while learning is still occurring.",
        topic: "Instruction",
        difficulty: "Easy"
      },
      {
        question: "Which curriculum principle refers to the logical arrangement of learning experiences from simpler to more complex?",
        choices: ["Sequence", "Balance", "Integration", "Articulation"],
        answer: 0,
        rationale: "Sequence concerns the order in which learning experiences are arranged, often progressing from simple to complex.",
        topic: "Curriculum",
        difficulty: "Moderate"
      },
      {
        question: "Which teacher action best demonstrates differentiated instruction?",
        choices: ["Giving every learner exactly the same task regardless of readiness", "Varying learning activities or supports based on learner needs", "Using only one assessment method", "Removing all challenging tasks"],
        answer: 1,
        rationale: "Differentiated instruction adapts content, process, product, or learning environment to respond to learner readiness, interests, and needs.",
        topic: "Differentiated Instruction",
        difficulty: "Moderate"
      }
    ],

    science: [
      {
        question: "What is the basic structural and functional unit of life?",
        choices: ["Tissue", "Organ", "Cell", "Organ system"],
        answer: 2,
        rationale: "The cell is the basic structural and functional unit of living organisms.",
        topic: "Biology",
        difficulty: "Easy"
      },
      {
        question: "Which process converts glucose into usable cellular energy through a series of metabolic reactions?",
        choices: ["Photosynthesis", "Cellular respiration", "Transpiration", "Translation"],
        answer: 1,
        rationale: "Cellular respiration breaks down organic molecules such as glucose to generate ATP.",
        topic: "Biology",
        difficulty: "Easy"
      },
      {
        question: "Which organelle contains the genetic material in most eukaryotic cells?",
        choices: ["Nucleus", "Lysosome", "Vacuole", "Centrosome"],
        answer: 0,
        rationale: "In eukaryotic cells, most DNA is contained within the nucleus.",
        topic: "Cell Biology",
        difficulty: "Easy"
      },
      {
        question: "What is the SI unit of force?",
        choices: ["Joule", "Watt", "Newton", "Pascal"],
        answer: 2,
        rationale: "The newton (N) is the SI derived unit of force.",
        topic: "Physics",
        difficulty: "Easy"
      },
      {
        question: "Which law states that, at constant temperature, pressure and volume of a fixed amount of gas are inversely related?",
        choices: ["Charles's law", "Boyle's law", "Avogadro's law", "Ohm's law"],
        answer: 1,
        rationale: "Boyle's law states that pressure is inversely proportional to volume when temperature and amount of gas are constant.",
        topic: "Chemistry",
        difficulty: "Moderate"
      },
      {
        question: "Which type of plate boundary occurs when two tectonic plates move away from each other?",
        choices: ["Convergent", "Divergent", "Transform", "Collision-only"],
        answer: 1,
        rationale: "At divergent boundaries, tectonic plates move apart and new crust can form.",
        topic: "Earth Science",
        difficulty: "Easy"
      },
      {
        question: "Which molecule carries genetic information in most living organisms?",
        choices: ["ATP", "DNA", "Glucose", "Cholesterol"],
        answer: 1,
        rationale: "DNA stores hereditary genetic information in most organisms.",
        topic: "Genetics",
        difficulty: "Easy"
      },
      {
        question: "A solution with a pH of 3 is best described as:",
        choices: ["Strongly acidic", "Neutral", "Weakly basic", "Strongly basic"],
        answer: 0,
        rationale: "A pH below 7 is acidic; a pH of 3 indicates an acidic solution.",
        topic: "Chemistry",
        difficulty: "Easy"
      },
      {
        question: "Which phenomenon explains the apparent change in frequency of a wave due to relative motion between the source and observer?",
        choices: ["Doppler effect", "Photoelectric effect", "Greenhouse effect", "Compton effect"],
        answer: 0,
        rationale: "The Doppler effect is the observed change in frequency caused by relative motion between source and observer.",
        topic: "Physics",
        difficulty: "Moderate"
      },
      {
        question: "Which level of ecological organization includes all living organisms and the nonliving environment in a defined area?",
        choices: ["Population", "Community", "Ecosystem", "Species"],
        answer: 2,
        rationale: "An ecosystem includes living communities together with their physical and chemical environment.",
        topic: "Ecology",
        difficulty: "Easy"
      }
    ]
  };

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

  function startGame(mode) {
    state.mode = mode;
    state.questions = shuffle(questionBanks[mode]).slice(0, QUESTIONS_PER_GAME);
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
