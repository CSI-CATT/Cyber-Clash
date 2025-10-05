// Welcome Scene
        class WelcomeScene extends Phaser.Scene {
            constructor() {
                super('WelcomeScene');
            }

            create() {
                const { width, height } = this.cameras.main;

                this.createArenaBackground();

                const charY = height - 400;
                const character = this.add.circle(width / 2, charY, 140, 0x4488ff);
                this.add.text(width / 2, charY, '🤖', { fontSize: '140px' }).setOrigin(0.5);

                const bubbleX = width / 2 - 250;
                const bubbleY = charY - 280;
                const bubble = this.add.graphics();
                bubble.fillStyle(0xffffff, 1);
                bubble.fillRoundedRect(bubbleX, bubbleY, 500, 160, 20);
                
                bubble.fillTriangle(
                    width / 2 - 20, bubbleY + 160,
                    width / 2 + 20, bubbleY + 160,
                    width / 2, bubbleY + 200
                );

                this.add.text(width / 2, bubbleY + 80, 'Welcome to\nCyberClash!', {
                    fontFamily: 'Orbitron',
                    fontSize: '38px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    align: 'center',
                    lineSpacing: 10
                }).setOrigin(0.5);

                const btnY = height - 120;
                const continueBtn = this.add.rectangle(width / 2, btnY, 350, 70, 0x00ff88)
                    .setInteractive({ useHandCursor: true });
                
                this.add.text(width / 2, btnY, 'START DEMO', {
                    fontFamily: 'Orbitron',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#001111'
                }).setOrigin(0.5);

                continueBtn.on('pointerdown', () => {
                    this.scene.start('BattleScene', { isDemo: true, duration: 30 });
                });

                continueBtn.on('pointerover', () => {
                    continueBtn.setFillStyle(0x00dd77);
                });

                continueBtn.on('pointerout', () => {
                    continueBtn.setFillStyle(0x00ff88);
                });

                this.tweens.add({
                    targets: character,
                    y: charY - 10,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            createArenaBackground() {
                const { width, height } = this.cameras.main;
                
                this.add.rectangle(0, 0, width, height, 0x6b8e23).setOrigin(0);
                this.add.rectangle(0, height / 2 - 30, width, 60, 0x4682b4).setOrigin(0);
                
                const graphics = this.add.graphics();
                graphics.lineStyle(4, 0x00ff88, 0.3);
                graphics.strokeRect(50, 100, width - 100, height - 200);
            }
        }