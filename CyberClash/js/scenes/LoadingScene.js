// Loading Scene
        class LoadingScene extends Phaser.Scene {
            constructor() {
                super('LoadingScene');
            }

            create() {
                const { width, height } = this.cameras.main;

                this.add.rectangle(0, 0, width, height, 0x0a0e27).setOrigin(0);
                this.createCyberGrid();

                const title = this.add.text(width / 2, height / 3, 'CYBERCLASH', {
                    fontFamily: 'Orbitron',
                    fontSize: '80px',
                    fontWeight: '900',
                    color: '#00ff88',
                    stroke: '#003322',
                    strokeThickness: 6
                }).setOrigin(0.5);

                this.add.text(width / 2, height / 3 + 100, 'Cybersecurity Strategy Card Battle', {
                    fontFamily: 'Rajdhani',
                    fontSize: '28px',
                    color: '#44ffaa'
                }).setOrigin(0.5);

                const barWidth = 500;
                const barHeight = 40;
                const barX = width / 2 - barWidth / 2;
                const barY = height / 2 + 100;

                this.add.rectangle(barX, barY, barWidth, barHeight, 0x1a1f3a).setOrigin(0);
                const barFill = this.add.rectangle(barX + 2, barY + 2, 0, barHeight - 4, 0x00ff88).setOrigin(0);

                this.tweens.add({
                    targets: barFill,
                    width: barWidth - 4,
                    duration: 2000,
                    ease: 'Power2',
                    onComplete: () => {
                        this.time.delayedCall(500, () => {
                            this.scene.start('WelcomeScene');
                        });
                    }
                });

                this.tweens.add({
                    targets: title,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            }

            createCyberGrid() {
                const { width, height } = this.cameras.main;
                const graphics = this.add.graphics();
                graphics.lineStyle(1, 0x00ff88, 0.2);

                for (let i = 0; i < width; i += 50) {
                    graphics.lineBetween(i, 0, i, height);
                }
                for (let j = 0; j < height; j += 50) {
                    graphics.lineBetween(0, j, width, j);
                }
            }
        }