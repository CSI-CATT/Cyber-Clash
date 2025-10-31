// ---- Global state (attach to window so scenes can access) ----
window.gameState = {
  isAnonymous: false,
  hasCompletedDemo: false,
  userId: null,
  username: null,
  seenCardTutorials: {}
};

// placeholders so scenes can reference even before data loads
window.CARDS = {};
window.QUIZ_QUESTIONS = [];

// ---- Load external data BEFORE starting Phaser ----
Promise.all([
  fetch('data/cards.json').then(r => r.json()),
  fetch('data/quiz.json').then(r => r.json())
]).then(([cards, quiz]) => {
  window.CARDS = cards;
  window.QUIZ_QUESTIONS = quiz;

  console.log('Cards loaded:', window.CARDS);
  console.log('Quiz loaded:', window.QUIZ_QUESTIONS);

  // ---- Game Configuration ----
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 1200,
    parent: "game-container",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH, // ✅ centers game automatically
      width: 800,
      height: 1200,
      min: {
        width: 320,
        height: 480
      },
      max: {
        width: 1920,
        height: 2880
      },
      autoRound: true
    },
    dom: {
      createContainer: true
    },
    render: {
      pixelArt: false,
      antialias: true,
      roundPixels: true
    },
    scene: [LoadingScene, WelcomeScene, AuthScene, BattleScene, ResultScene]
  };

  // ---- Start Phaser game AFTER data is loaded ----
  const game = new Phaser.Game(config);

  // ✅ Center the game canvas perfectly
  game.canvas.style.display = "block";
  game.canvas.style.margin = "0 auto";
  game.canvas.style.position = "relative";
  game.canvas.style.left = "0";
  game.canvas.style.right = "0";

  // ✅ Make game responsive (fit any screen)
  function resizeGame() {
    const canvas = game.canvas;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const gameRatio = game.config.width / game.config.height;

    if (windowRatio < gameRatio) {
      canvas.style.width = windowWidth + "px";
      canvas.style.height = (windowWidth / gameRatio) + "px";
    } else {
      canvas.style.width = (windowHeight * gameRatio) + "px";
      canvas.style.height = windowHeight + "px";
    }
  }

  window.addEventListener("resize", resizeGame);
  resizeGame(); // call on load
})
.catch(err => console.error("Error loading game data:", err));
