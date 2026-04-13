let Sound = {
  win: new Audio("./win.mp3"),
  fail: new Audio("./fail.mp3"),
  click: new Audio("./click.mp3"),

  play(type) {
    if (!this[type]) return;
    this[type].currentTime = 0;
    this[type].play();
  }
};

let player = localStorage.getItem("player") || prompt("Enter your name 👀");
localStorage.setItem("player", player);

let Utils = {
  getRandom(max) {
    return Math.floor(Math.random() * max) + 1;
  },
  save(key, value) {
    localStorage.setItem(key, value);
  },
  load(key) {
    return Number(localStorage.getItem(key)) || 0;
  }
};

let Tabs = {
  tabs: document.querySelectorAll(".tab"),
  games: document.querySelectorAll(".game"),
  indicator: document.querySelector(".indicator"),

  init() {
    this.tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        Sound.play("click");

        this.tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        this.games.forEach(g => g.classList.remove("active"));
        document.getElementById(tab.dataset.game).classList.add("active");

        this.indicator.style.transform = `translateX(${i * 100}%)`;
      });
    });
  }
};

let GuessGame = {
  number: 0,
  max: 10,
  score: Utils.load("guessScore"),
  attempts: 0,
  maxAttempts: 5,

  taunts: [
    "😅 Try again bro",
    "🤔 Think harder",
    "🔥 Almost there",
    "😂 Too easy?"
  ],

  elements: {
    input: document.getElementById("guessInput"),
    result: document.getElementById("gResult"),
    score: document.getElementById("gScore"),
    difficulty: document.getElementById("difficulty"),
    checkBtn: document.getElementById("checkBtn"),
    resetBtn: document.getElementById("resetBtn")
  },

  init() {
    this.max = Number(this.elements.difficulty.value);
    this.number = Utils.getRandom(this.max);
    this.attempts = 0;

    this.elements.input.value = "";
    this.elements.input.disabled = false;
    this.elements.result.innerText = "";

    this.updateUI();
  },

  check() {
    let val = Number(this.elements.input.value);

    if (!val || val < 1 || val > this.max) {
      this.showMsg("⚠️ Enter valid number", "fail");
      return;
    }

    this.attempts++;

    if (val === this.number) {
      this.score++;
      Utils.save("guessScore", this.score);

      this.showMsg("🎉 Correct " + player + "!", "win");

      document.body.style.background = "linear-gradient(45deg, green, black)";
      setTimeout(() => {
        document.body.style.background = "";
      }, 500);

      this.endGame();
    }
    else if (this.attempts >= this.maxAttempts) {
      this.showMsg("❌ Game Over (" + this.number + ")", "fail");
      this.endGame();
    }
    else {
      let randomTaunt = this.taunts[Math.floor(Math.random() * this.taunts.length)];

      this.showMsg(
        (val > this.number ? "📉 Too High" : "📈 Too Low") + " - " + randomTaunt,
        "fail"
      );
    }

    this.updateUI();
  },

  showMsg(msg, type) {
    this.elements.result.innerText = msg;
    this.elements.result.classList.add("win");

    setTimeout(() => this.elements.result.classList.remove("win"), 400);

    Sound.play(type);
  },

  updateUI() {
    this.elements.score.innerText =
      "Score: " + this.score + " | Attempts: " + this.attempts + "/" + this.maxAttempts;
  },

  endGame() {
    this.elements.input.disabled = true;
  },

  bindEvents() {
    this.elements.checkBtn.onclick = () => this.check();
    this.elements.resetBtn.onclick = () => this.init();
    this.elements.difficulty.onchange = () => this.init();

    this.elements.input.addEventListener("keydown", e => {
      if (e.key === "Enter") this.check();
    });
  }
};

let RPSGame = {
  score: Utils.load("rpsScore"),
  buttons: document.querySelectorAll(".rps button"),
  result: document.getElementById("rpsResult"),
  scoreEl: document.getElementById("rpsScore"),

  play(user) {
    let choices = ["rock", "paper", "scissors"];
    let comp = choices[Math.floor(Math.random() * 3)];

    let msg = "";

    if (user === comp) {
      msg = "Draw 🤝";
    }
    else if (
      (user === "rock" && comp === "scissors") ||
      (user === "paper" && comp === "rock") ||
      (user === "scissors" && comp === "paper")
    ) {
      msg = "🎉 You Win " + player + "!";
      this.score++;
      Utils.save("rpsScore", this.score);
      Sound.play("win");
    }
    else {
      msg = "❌ You Lose! AI Win";
      Sound.play("fail");
    }

    this.result.innerText = msg + " (You: " + user + " | AI: " + comp + ")";

    this.result.classList.add("win");
    setTimeout(() => this.result.classList.remove("win"), 400);

    this.updateUI();
  },

  updateUI() {
    this.scoreEl.innerText = "Score: " + this.score;
  },

  bindEvents() {
    this.buttons.forEach(btn => {
      btn.onclick = () => {
        Sound.play("click");
        this.play(btn.dataset.choice);
      };
    });

    this.updateUI();
  }
};

let MemoryGame = {
  symbols: ['🍎','🍌','🍇','🍓','🍉','🍍','🍒','🥝'],
  grid: document.getElementById("grid"),
  first: null,
  lock: false,

  init() {
    this.grid.innerHTML = "";
    this.first = null;
    this.lock = false;

    let items = [...this.symbols, ...this.symbols]
      .sort(() => 0.5 - Math.random());

    items.forEach(sym => {
      let card = document.createElement("div");
      card.className = "card hide";
      card.innerText = sym;

      card.onclick = () => this.flip(card);

      this.grid.appendChild(card);
    });
  },

  flip(card) {
    if (this.lock || !card.classList.contains("hide")) return;

    card.classList.remove("hide");

    if (!this.first) {
      this.first = card;
      return;
    }

    if (this.first.innerText === card.innerText) {
      Sound.play("win");
      this.first = null;
    } else {
      this.lock = true;
      Sound.play("fail");

      setTimeout(() => {
        this.first.classList.add("hide");
        card.classList.add("hide");
        this.first = null;
        this.lock = false;
      }, 600);
    }

    if (document.querySelectorAll(".hide").length === 0) {
      setTimeout(() => {
        alert("🎉 " + player + " you completed the game!");
        Sound.play("win");
      }, 300);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Tabs.init();

  GuessGame.init();
  GuessGame.bindEvents();

  RPSGame.bindEvents();

  MemoryGame.init();

  let restartBtn = document.getElementById("restartMemory");
  if (restartBtn) {
    restartBtn.onclick = () => {
      Sound.play("click");
      MemoryGame.init();
    };
  }
});