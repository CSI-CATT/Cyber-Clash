// Result Scene with Quiz
        class ResultScene extends Phaser.Scene {
            constructor() {
                super('ResultScene');
            }

            init(data) {
                this.playerWon = data.playerWon;
            }

            create() {
                const { width, height } = this.cameras.main;

                this.add.rectangle(0, 0, width, height, 0x0a0e27, 0.95).setOrigin(0);

                let resultText, resultColor, message;

                if (this.playerWon === null) {
                    resultText = 'DRAW';
                    resultColor = '#ffdd44';
                    message = 'Evenly matched!\n\n+25 XP  |  +5 💎';
                } else if (this.playerWon) {
                    resultText = 'VICTORY!';
                    resultColor = '#00ff88';
                    message = 'You defended against cyber threats!\n\n+50 XP  |  +10 💎';
                } else {
                    resultText = 'DEFEAT';
                    resultColor = '#ff4444';
                    message = 'Your defenses were breached.\n\n+10 XP';
                }

                this.add.text(width / 2, height / 4, resultText, {
                    fontFamily: 'Orbitron',
                    fontSize: '84px',
                    fontWeight: 'bold',
                    color: resultColor,
                    stroke: '#000000',
                    strokeThickness: 8
                }).setOrigin(0.5);

                this.add.text(width / 2, height / 4 + 120, message, {
                    fontFamily: 'Rajdhani',
                    fontSize: '28px',
                    color: '#ffffff',
                    align: 'center',
                    lineSpacing: 12
                }).setOrigin(0.5);

                this.time.delayedCall(1500, () => this.showQuiz());
            }

            showQuiz() {
                const { width, height } = this.cameras.main;
                
                const quiz = Phaser.Utils.Array.GetRandom(QUIZ_QUESTIONS);

                const quizBox = this.add.rectangle(width / 2, height / 2 + 50, 700, 400, 0x1a1f2e);
                quizBox.setStrokeStyle(4, 0x00ff88);

                this.add.text(width / 2, height / 2 - 120, '🧠 KNOWLEDGE CHECK', {
                    fontFamily: 'Orbitron',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#00ff88'
                }).setOrigin(0.5);

                this.add.text(width / 2, height / 2 - 60, quiz.question, {
                    fontFamily: 'Rajdhani',
                    fontSize: '22px',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 650 }
                }).setOrigin(0.5);

                const btnWidth = 320;
                const btnHeight = 50;
                const spacing = 15;

                quiz.options.forEach((option, index) => {
                    const row = Math.floor(index / 2);
                    const col = index % 2;
                    const x = width / 2 - btnWidth / 2 - spacing / 2 + col * (btnWidth + spacing);
                    const y = height / 2 + 30 + row * (btnHeight + spacing);

                    const btn = this.add.rectangle(x, y, btnWidth, btnHeight, 0x334455)
                        .setInteractive({ useHandCursor: true });

                    const text = this.add.text(x, y, option, {
                        fontFamily: 'Rajdhani',
                        fontSize: '20px',
                        color: '#ffffff'
                    }).setOrigin(0.5);

                    btn.on('pointerdown', () => {
                        if (index === quiz.correct) {
                            btn.setFillStyle(0x00ff88);
                            text.setColor('#001111');
                            this.showExplanation(quiz.explanation, true);
                        } else {
                            btn.setFillStyle(0xff4444);
                            this.showExplanation(quiz.explanation, false);
                        }
                    });

                    btn.on('pointerover', () => {
                        if (btn.fillColor === 0x334455) btn.setFillStyle(0x445566);
                    });

                    btn.on('pointerout', () => {
                        if (btn.fillColor === 0x445566) btn.setFillStyle(0x334455);
                    });
                });
            }

            showExplanation(explanation, correct) {
                const { width, height } = this.cameras.main;

                const explainBox = this.add.rectangle(width / 2, height - 250, 650, 120, correct ? 0x00ff88 : 0xff6644);
                
                this.add.text(width / 2, height - 280, correct ? '✓ Correct!' : '✗ Incorrect', {
                    fontFamily: 'Orbitron',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#001111'
                }).setOrigin(0.5);

                this.add.text(width / 2, height - 240, explanation, {
                    fontFamily: 'Rajdhani',
                    fontSize: '18px',
                    color: '#001111',
                    align: 'center',
                    wordWrap: { width: 620 }
                }).setOrigin(0.5);

                this.time.delayedCall(3000, () => this.showButtons());
            }

            showButtons() {
                const { width, height } = this.cameras.main;

                const playAgainBtn = this.add.rectangle(width / 2, height - 130, 350, 70, 0x00ff88)
                    .setInteractive({ useHandCursor: true });
                
                this.add.text(width / 2, height - 130, 'PLAY AGAIN', {
                    fontFamily: 'Orbitron',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#001111'
                }).setOrigin(0.5);

                playAgainBtn.on('pointerdown', () => {
                    this.scene.start('BattleScene', { isDemo: false, duration: 60 });
                });

                const homeBtn = this.add.rectangle(width / 2, height - 50, 350, 70, 0x334455)
                    .setInteractive({ useHandCursor: true });
                
                this.add.text(width / 2, height - 50, 'HOME', {
                    fontFamily: 'Rajdhani',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#ffffff'
                }).setOrigin(0.5);

                homeBtn.on('pointerdown', () => {
                    this.scene.start('LoadingScene');
                });
            }
        }