// Auth Scene (merged: replaces AuthScene + LoginScene)
class AuthScene extends Phaser.Scene {
  constructor() {
    super('AuthScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // BG
    this.add.rectangle(0, 0, width, height, 0x0f1419).setOrigin(0);

    // Title
    this.add.text(width / 2, 150, 'Choose Your Path', {
      fontFamily: 'Orbitron',
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#00ff88'
    }).setOrigin(0.5);

    this.add.text(width / 2, 220, 'Demo complete! Ready for more battles?', {
      fontFamily: 'Rajdhani',
      fontSize: '22px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // ---------- Buttons ----------
    // 1) Continue Anonymous
    const anonBtn = this.add.rectangle(width / 2, height / 2 - 120, 550, 90, 0x334455)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height / 2 - 145, '🎮 Continue Anonymously', {
      fontFamily: 'Rajdhani',
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 105, 'Quick play, no account needed', {
      fontFamily: 'Rajdhani',
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    anonBtn.on('pointerover', () => anonBtn.setFillStyle(0x445566));
    anonBtn.on('pointerout',  () => anonBtn.setFillStyle(0x334455));
    anonBtn.on('pointerdown', () => this.handleAnonLogin());

    // 2) Google Sign-In
    const googleBtn = this.add.rectangle(width / 2, height / 2 + 20, 550, 90, 0x00ff88)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height / 2 - 5, '🔐 Continue with Google', {
      fontFamily: 'Rajdhani',
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#001111'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 35, 'Save progress & achievements', {
      fontFamily: 'Rajdhani',
      fontSize: '18px',
      color: '#003333'
    }).setOrigin(0.5);
    googleBtn.on('pointerover', () => googleBtn.setFillStyle(0x00dd77));
    googleBtn.on('pointerout',  () => googleBtn.setFillStyle(0x00ff88));
    googleBtn.on('pointerdown', () => this.handleGoogleLogin());

    // 3) Email/Password (panel toggle)
    const emailBtn = this.add.rectangle(width / 2, height / 2 + 160, 550, 70, 0x223344)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height / 2 + 160, '✉️  Sign in with Email', {
      fontFamily: 'Rajdhani',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    emailBtn.on('pointerover', () => emailBtn.setFillStyle(0x2b3e55));
    emailBtn.on('pointerout',  () => emailBtn.setFillStyle(0x223344));
    emailBtn.on('pointerdown', () => this.showEmailPanel());
  }

  // ---------- Handlers ----------
  async handleAnonLogin() {
    const API = window.FirebaseAPI || {};
    try {
      if (API.anonLogin) {
        const user = await API.anonLogin();
        gameState.isAnonymous = true;
        gameState.userId = user.uid;
        gameState.username = 'Anon_' + user.uid.slice(-4);
      } else {
        // Fallback (no Firebase configured)
        gameState.isAnonymous = true;
        gameState.userId = 'user_' + Date.now();
        gameState.username = 'Player_' + Math.floor(Math.random() * 1000);
        this.showFirebaseWarning('Anonymous mode is offline (mocked).');
      }
      gameState.hasCompletedDemo = true;
      this.scene.start('BattleScene', { isDemo: false, duration: 60 });
    } catch (e) {
      console.error(e);
      this.toast('Anonymous login failed.');
    }
  }

  async handleGoogleLogin() {
    const API = window.FirebaseAPI || {};
    if (!API.googleLogin) {
      this.showFirebaseWarning('Google Sign-In needs Firebase configured.');
      return;
    }
    try {
      const user = await API.googleLogin();
      gameState.isAnonymous = false;
      gameState.userId = user.uid;
      gameState.username = user.displayName || ('Player_' + user.uid.slice(-4));
      gameState.hasCompletedDemo = true;
      this.scene.start('BattleScene', { isDemo: false, duration: 60 });
    } catch (e) {
      console.error(e);
      this.toast('Google sign-in cancelled or failed.');
    }
  }

  showEmailPanel() {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0)
      .setInteractive();
    const box = this.add.rectangle(width / 2, height / 2, 700, 380, 0x1a1f2e);
    const title = this.add.text(width / 2, height / 2 - 140, 'Email Sign-In', {
      fontFamily: 'Orbitron', fontSize: '28px', fontWeight: 'bold', color: '#00ff88'
    }).setOrigin(0.5);

    // Simple text inputs using DOM Elements (works fine for Phaser)
    const emailInput = this.add.dom(width / 2, height / 2 - 60, 'input', 'width:460px;height:40px;font-size:18px;padding:6px;border-radius:6px;', '');
    emailInput.node.type = 'email';
    emailInput.node.placeholder = 'Email';

    const passInput = this.add.dom(width / 2, height / 2, 'input', 'width:460px;height:40px;font-size:18px;padding:6px;border-radius:6px;', '');
    passInput.node.type = 'password';
    passInput.node.placeholder = 'Password';

    const submitBtn = this.add.rectangle(width / 2 - 110, height / 2 + 100, 220, 56, 0x00ff88)
      .setInteractive({ useHandCursor: true });
    const cancelBtn = this.add.rectangle(width / 2 + 110, height / 2 + 100, 220, 56, 0x334455)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2 - 110, height / 2 + 100, 'SIGN IN', {
      fontFamily: 'Orbitron', fontSize: '22px', fontWeight: 'bold', color: '#001111'
    }).setOrigin(0.5);
    this.add.text(width / 2 + 110, height / 2 + 100, 'CANCEL', {
      fontFamily: 'Rajdhani', fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5);

    const closePanel = () => {
      overlay.destroy(); box.destroy(); title.destroy();
      emailInput.destroy(); passInput.destroy();
      submitBtn.destroy(); cancelBtn.destroy();
    };

    cancelBtn.on('pointerdown', closePanel);

    submitBtn.on('pointerdown', async () => {
      const API = window.FirebaseAPI || {};
      const email = (emailInput.node.value || '').trim();
      const password = passInput.node.value || '';

      if (!API.emailPasswordLogin) {
        this.showFirebaseWarning('Email/Password needs Firebase configured.');
        return;
      }
      try {
        const user = await API.emailPasswordLogin(email, password);
        gameState.isAnonymous = false;
        gameState.userId = user.uid;
        gameState.username = user.email?.split('@')[0] || ('Player_' + user.uid.slice(-4));
        gameState.hasCompletedDemo = true;
        closePanel();
        this.scene.start('BattleScene', { isDemo: false, duration: 60 });
      } catch (e) {
        console.error(e);
        this.toast('Email sign-in failed. Check credentials.');
      }
    });
  }

  showFirebaseWarning(extraMsg = 'Please set up Firebase to use authentication.\nContinue as anonymous for now.') {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0).setInteractive();
    const box = this.add.rectangle(width / 2, height / 2, 650, 320, 0x1a1f2e);

    const text = this.add.text(width / 2, height / 2 - 60, 'Firebase Not Configured', {
      fontFamily: 'Orbitron', fontSize: '28px', fontWeight: 'bold', color: '#ff4444'
    }).setOrigin(0.5);

    const info = this.add.text(width / 2, height / 2 + 20, extraMsg, {
      fontFamily: 'Rajdhani', fontSize: '20px', color: '#ffffff', align: 'center', lineSpacing: 10
    }).setOrigin(0.5);

    const okBtn = this.add.rectangle(width / 2, height / 2 + 110, 220, 60, 0x00ff88)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height / 2 + 110, 'OK', {
      fontFamily: 'Orbitron', fontSize: '24px', fontWeight: 'bold', color: '#001111'
    }).setOrigin(0.5);

    okBtn.on('pointerdown', () => {
      overlay.destroy(); box.destroy(); text.destroy(); info.destroy(); okBtn.destroy();
    });
  }

  toast(message) {
    const { width } = this.cameras.main;
    const t = this.add.text(width / 2, 70, message, {
      fontFamily: 'Rajdhani', fontSize: '20px', color: '#ffffff', backgroundColor: '#aa3333', padding: { x: 12, y: 8 }
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0, duration: 1800, delay: 800, onComplete: () => t.destroy() });
  }
}
