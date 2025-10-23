// Battle Scene with Tutorial
        class BattleScene extends Phaser.Scene {
            constructor() {
                super('BattleScene');
            }

            init(data) {
                this.isDemo = data.isDemo || false;
                this.battleDuration = data.duration || 60;
            }

            create() {
                const { width, height } = this.cameras.main;

                this.playerCPU = 5;
                this.maxCPU = 10;
                this.cpuRegenRate = 1000;
                this.playerHP = 100;
                this.enemyHP = 100;
                this.timeRemaining = this.battleDuration;
                this.elixirBoostActive = false;
                this.isPaused = this.isDemo;
                this.tutorialCardIndex = 0;
                
                this.playerDeck = ['firewall', 'antivirus', 'ids', 'encryption', 'honeypot', 'phishing', 'ddos', 'sql'];
                this.playerHand = [];
                this.units = [];
                this.tooltipActive = null;
                
                this.createArena();
                this.createUI();
                this.createCardHand();
                
                this.cpuTimer = this.time.addEvent({
                    delay: this.cpuRegenRate,
                    callback: this.regenerateCPU,
                    callbackScope: this,
                    loop: true,
                    paused: this.isPaused
                });

                this.battleTimer = this.time.addEvent({
                    delay: 1000,
                    callback: this.updateTimer,
                    callbackScope: this,
                    loop: true,
                    paused: this.isPaused
                });

                this.aiTimer = this.time.addEvent({
                    delay: this.isDemo ? 3000 : 4000,
                    callback: this.aiPlay,
                    callbackScope: this,
                    loop: true,
                    paused: this.isPaused
                });

                for (let i = 0; i < 4; i++) {
                    this.drawCard();
                }

                if (this.isDemo) {
                    this.time.delayedCall(500, () => this.startTutorial());
                }
            }

            startTutorial() {
                const { width, height } = this.cameras.main;

                this.tutorialOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
                    .setOrigin(0)
                    .setInteractive();

                const charY = height / 2 - 100;
                this.tutorialChar = this.add.circle(width / 2, charY, 140, 0x4488ff).setDepth(1000);
                this.tutorialCharIcon = this.add.text(width / 2, charY, '🤖', { fontSize: '140px' })
                    .setOrigin(0.5)
                    .setDepth(1000);

                this.showCardTutorial();
            }

            showCardTutorial() {
                if (this.tutorialCardIndex >= this.playerHand.length) {
                    this.endTutorial();
                    return;
                }

                const { width, height } = this.cameras.main;
                const cardId = this.playerHand[this.tutorialCardIndex];
                const cardData = CARDS[cardId];

                if (this.tutorialBubble) {
                    this.tutorialBubble.destroy();
                    this.tutorialTexts.forEach(t => t.destroy());
                }

                const bubbleWidth = 600;
                const bubbleHeight = 260;
                const bubbleX = width / 2 - bubbleWidth / 2;
                const bubbleY = height / 2 + 50;

                this.tutorialBubble = this.add.graphics().setDepth(1000);
                this.tutorialBubble.fillStyle(0xffffff, 1);
                this.tutorialBubble.fillRoundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 20);
                this.tutorialBubble.fillTriangle(
                    width / 2 - 20, bubbleY,
                    width / 2 + 20, bubbleY,
                    width / 2, bubbleY - 30
                );

                this.tutorialTexts = [];
                
                this.tutorialTexts.push(this.add.text(width / 2, bubbleY + 40, `${cardData.icon} ${cardData.name}`, {
                    fontFamily: 'Orbitron',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#2c3e50'
                }).setOrigin(0.5).setDepth(1000));

                this.tutorialTexts.push(this.add.text(width / 2, bubbleY + 90, cardData.description, {
                    fontFamily: 'Rajdhani',
                    fontSize: '20px',
                    color: '#34495e',
                    align: 'center',
                    wordWrap: { width: 550 }
                }).setOrigin(0.5).setDepth(1000));

                this.tutorialTexts.push(this.add.text(width / 2, bubbleY + 140, `When to use: ${cardData.when}`, {
                    fontFamily: 'Rajdhani',
                    fontSize: '18px',
                    color: '#7f8c8d',
                    align: 'center',
                    wordWrap: { width: 550 },
                    fontStyle: 'italic'
                }).setOrigin(0.5).setDepth(1000));

                const nextBtn = this.add.rectangle(width / 2, bubbleY + 210, 200, 50, 0x00ff88)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(1000);
                
                const nextText = this.add.text(width / 2, bubbleY + 210, 'NEXT', {
                    fontFamily: 'Orbitron',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#001111'
                }).setOrigin(0.5).setDepth(1000);

                this.tutorialTexts.push(nextText);

                nextBtn.on('pointerdown', () => {
                    nextBtn.destroy();
                    this.tutorialCardIndex++;
                    this.showCardTutorial();
                });
            }

            endTutorial() {
                if (this.tutorialOverlay) this.tutorialOverlay.destroy();
                if (this.tutorialChar) this.tutorialChar.destroy();
                if (this.tutorialCharIcon) this.tutorialCharIcon.destroy();
                if (this.tutorialBubble) this.tutorialBubble.destroy();
                if (this.tutorialTexts) this.tutorialTexts.forEach(t => t.destroy());

                const { width, height } = this.cameras.main;
                const startText = this.add.text(width / 2, height / 2, 'BATTLE START!', {
                    fontFamily: 'Orbitron',
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#00ff88',
                    stroke: '#000000',
                    strokeThickness: 6
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: startText,
                    alpha: 0,
                    scale: 1.5,
                    duration: 1500,
                    onComplete: () => {
                        startText.destroy();
                        this.isPaused = false;
                        this.cpuTimer.paused = false;
                        this.battleTimer.paused = false;
                        this.aiTimer.paused = false;
                    }
                });
            }

            createArena() {
                const { width, height } = this.cameras.main;

                this.add.rectangle(0, 0, width, height, 0x556644).setOrigin(0);

                const zoneHeight = height - 300;
                
                this.add.rectangle(0, 0, width, zoneHeight / 2, 0xff6666, 0.2).setOrigin(0);
                this.add.rectangle(0, zoneHeight / 2, width, 60, 0x3366aa, 0.5).setOrigin(0);
                this.add.rectangle(0, zoneHeight / 2 + 60, width, zoneHeight / 2, 0x6666ff, 0.2).setOrigin(0);

                const graphics = this.add.graphics();
                graphics.lineStyle(2, 0xffffff, 0.2);
                graphics.lineBetween(width / 3, 0, width / 3, zoneHeight);
                graphics.lineBetween(2 * width / 3, 0, 2 * width / 3, zoneHeight);

                this.playerBase = this.add.rectangle(width / 2, height - 350, 140, 120, 0x4488ff);
                this.add.text(width / 2, height - 350, '🏰', { fontSize: '80px' }).setOrigin(0.5);
                
                this.enemyBase = this.add.rectangle(width / 2, 100, 140, 120, 0xff4444);
                this.add.text(width / 2, 100, '🏰', { fontSize: '80px' }).setOrigin(0.5);

                this.particles = this.add.particles(null);
            }

            createUI() {
                const { width, height } = this.cameras.main;

                this.add.rectangle(0, 0, width, 100, 0x1a1f2e, 0.95).setOrigin(0);

                this.add.text(30, 30, 'PLAYER', {
                    fontFamily: 'Orbitron',
                    fontSize: '30px',
                    fontWeight: 'bold',
                    color: '#ffffff'
                });

                this.enemyHPText = this.add.text(width - 30, 30, '👻 100', {
                    fontFamily: 'Rajdhani',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#ff4444'
                }).setOrigin(1, 0);

                this.timerText = this.add.text(width / 2, 25, `⏱️ ${this.battleDuration}s`, {
                    fontFamily: 'Orbitron',
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: '#ffdd44'
                }).setOrigin(0.5, 0);

                this.cpuText = this.add.text(width / 2, 70, '⚡ 5/10', {
                    fontFamily: 'Rajdhani',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#44ddff'
                }).setOrigin(0.5, 0);

                this.playerHPText = this.add.text(30, height - 220, '🏰 100', {
                    fontFamily: 'Rajdhani',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#4488ff'
                });
            }

            createCardHand() {
                const { width, height } = this.cameras.main;
                
                this.cardSlots = [];
                const cardWidth = 180;
                const cardHeight = 240;
                const spacing = 25;
                const startX = (width - (4 * cardWidth + 3 * spacing)) / 2;
                const startY = height - cardHeight / 2 - 15;

                for (let i = 0; i < 4; i++) {
                    const x = startX + i * (cardWidth + spacing) + cardWidth / 2;
                    const slot = {
                        x: x,
                        y: startY,
                        card: null
                    };
                    this.cardSlots.push(slot);
                }

                this.handContainer = this.add.container(0, 0);
            }

            drawCard() {
                if (this.playerDeck.length === 0) return;

                const emptySlot = this.cardSlots.find(slot => slot.card === null);
                if (!emptySlot) return;

                const cardId = Phaser.Utils.Array.GetRandom(this.playerDeck);
                const cardData = CARDS[cardId];

                const card = this.add.container(emptySlot.x, emptySlot.y);
                
                const bg = this.add.rectangle(0, 0, 170, 230, cardData.color)
                    .setInteractive({ useHandCursor: true });
                
                const icon = this.add.text(0, -60, cardData.icon, {
                    fontSize: '60px'
                }).setOrigin(0.5);

                const name = this.add.text(0, 10, cardData.name, {
                    fontFamily: 'Rajdhani',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 150 }
                }).setOrigin(0.5);

                const stats = this.add.text(0, 60, `⚔️${cardData.damage}  ❤️${cardData.hp}`, {
                    fontFamily: 'Rajdhani',
                    fontSize: '16px',
                    color: '#ffffff'
                }).setOrigin(0.5);

                const cost = this.add.text(0, 95, `⚡ ${cardData.cost}`, {
                    fontFamily: 'Orbitron',
                    fontSize: '26px',
                    fontWeight: 'bold',
                    color: '#ffff00'
                }).setOrigin(0.5);

                card.add([bg, icon, name, stats, cost]);
                card.setData('cardId', cardId);
                card.setData('cardData', cardData);

                bg.on('pointerdown', () => {
                    if (!this.isPaused && this.playerCPU >= cardData.cost) {
                        this.playCard(cardId, emptySlot);
                        this.showCardLearnPopup(cardId);
                    }
                });

                bg.on('pointerover', () => {
                    if (!this.isPaused) {
                        this.showTooltip(cardData, emptySlot.x, emptySlot.y - 150);
                        card.setScale(1.05);
                    }
                });

                bg.on('pointerout', () => {
                    this.hideTooltip();
                    card.setScale(1);
                });

                emptySlot.card = card;
                this.playerHand.push(cardId);
                this.handContainer.add(card);
            }

            showTooltip(cardData, x, y) {
                this.hideTooltip();

                const tooltipWidth = 300;
                const tooltipHeight = 140;

                this.tooltipActive = this.add.container(x, y).setDepth(500);

                const bg = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x1a1f2e, 0.95);
                bg.setStrokeStyle(3, cardData.color);

                const desc = this.add.text(0, -30, cardData.description, {
                    fontFamily: 'Rajdhani',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: tooltipWidth - 20 }
                }).setOrigin(0.5);

                const when = this.add.text(0, 30, cardData.when, {
                    fontFamily: 'Rajdhani',
                    fontSize: '14px',
                    color: '#aaaaaa',
                    align: 'center',
                    fontStyle: 'italic',
                    wordWrap: { width: tooltipWidth - 20 }
                }).setOrigin(0.5);

                this.tooltipActive.add([bg, desc, when]);
            }

            hideTooltip() {
                if (this.tooltipActive) {
                    this.tooltipActive.destroy();
                    this.tooltipActive = null;
                }
            }

            showCardLearnPopup(cardId) {
                if (gameState.seenCardTutorials[cardId]) return;

                gameState.seenCardTutorials[cardId] = true;

                const { width, height } = this.cameras.main;
                const cardData = CARDS[cardId];

                const popup = this.add.container(width / 2, height / 2).setDepth(600);

                const overlay = this.add.rectangle(-width/2, -height/2, width, height, 0x000000, 0.5)
                    .setOrigin(0)
                    .setInteractive();

                const bg = this.add.rectangle(0, 0, 500, 280, 0x2c3e50);
                bg.setStrokeStyle(4, cardData.color);

                const icon = this.add.text(0, -90, '🧠', { fontSize: '48px' }).setOrigin(0.5);

                const title = this.add.text(0, -40, `You learned: ${cardData.name}!`, {
                    fontFamily: 'Orbitron',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#00ff88'
                }).setOrigin(0.5);

                const desc = this.add.text(0, 20, cardData.description, {
                    fontFamily: 'Rajdhani',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 450 }
                }).setOrigin(0.5);

                const okBtn = this.add.rectangle(0, 100, 180, 50, 0x00ff88)
                    .setInteractive({ useHandCursor: true });

                const okText = this.add.text(0, 100, 'GOT IT!', {
                    fontFamily: 'Orbitron',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#001111'
                }).setOrigin(0.5);

                popup.add([overlay, bg, icon, title, desc, okBtn, okText]);

                okBtn.on('pointerdown', () => popup.destroy());

                this.time.delayedCall(4000, () => {
                    if (popup && popup.active) popup.destroy();
                });
            }

            playCard(cardId, slot) {
                const cardData = CARDS[cardId];
                
                this.playerCPU -= cardData.cost;
                this.updateCPU();

                const cardIndex = this.playerHand.indexOf(cardId);
                if (cardIndex > -1) {
                    this.playerHand.splice(cardIndex, 1);
                }

                slot.card.destroy();
                slot.card = null;

                const { width } = this.cameras.main;
                const lane = Phaser.Math.Between(1, 2);
                const x = lane === 1 ? width / 3 : 2 * width / 3;
                
                this.spawnUnit(cardId, x, 800, true);
                this.createParticleBurst(x, 800, cardData.color);

                this.time.delayedCall(300, () => this.drawCard());
            }

            createParticleBurst(x, y, color) {
                const emitter = this.particles.createEmitter({
                    x: x,
                    y: y,
                    speed: { min: 100, max: 300 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 600,
                    quantity: 12,
                    tint: color
                });

                this.time.delayedCall(100, () => emitter.stop());
            }

            spawnUnit(cardId, x, y, isPlayer) {
                const cardData = CARDS[cardId];
                
                const unit = this.add.container(x, y);
                
                const body = this.add.circle(0, 0, 35, cardData.color);
                const icon = this.add.text(0, 0, cardData.icon, {
                    fontSize: '40px'
                }).setOrigin(0.5);

                const hpBar = this.add.rectangle(0, -50, 60, 8, 0x00ff00);
                const hpBg = this.add.rectangle(0, -50, 60, 8, 0x333333).setDepth(-1);

                unit.add([hpBg, hpBar, body, icon]);
                unit.setData('hp', cardData.hp);
                unit.setData('maxHP', cardData.hp);
                unit.setData('damage', cardData.damage);
                unit.setData('speed', cardData.speed);
                unit.setData('isPlayer', isPlayer);
                unit.setData('cardId', cardId);
                unit.setData('behavior', cardData.behavior);
                unit.setData('hpBar', hpBar);
                unit.setData('isMoving', true);
                unit.setData('attackCooldown', 0);

                this.units.push(unit);

                if (cardData.behavior === 'blocks' || cardData.behavior === 'buff') {
                    unit.setData('isMoving', false);
                    if (cardData.behavior === 'buff') {
                        this.createBuffAura(unit, cardData.color);
                    }
                } else {
                    const targetY = isPlayer ? 150 : 850;
                    const distance = Math.abs(targetY - y);
                    const duration = (distance / cardData.speed) * 1000;

                    unit.setData('moveTween', this.tweens.add({
                        targets: unit,
                        y: targetY,
                        duration: duration,
                        onComplete: () => {
                            if (isPlayer) {
                                this.damageEnemyBase(cardData.damage);
                            } else {
                                this.damagePlayerBase(cardData.damage);
                            }
                            this.destroyUnit(unit);
                        }
                    }));
                }
            }

            createBuffAura(unit, color) {
                const aura = this.add.circle(0, 0, 50, color, 0.3);
                unit.add(aura);
                unit.setData('aura', aura);

                this.tweens.add({
                    targets: aura,
                    scale: 1.2,
                    alpha: 0.1,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            }

            damageEnemyBase(damage) {
                this.enemyHP -= damage;
                this.enemyHP = Math.max(0, this.enemyHP);
                this.enemyHPText.setText(`👻 ${this.enemyHP}`);

                this.cameras.main.shake(200, 0.005);
                this.createParticleBurst(this.enemyBase.x, this.enemyBase.y, 0xff4444);

                if (this.enemyHP <= 0) {
                    this.gameOver(true);
                }
            }

            damagePlayerBase(damage) {
                this.playerHP -= damage;
                this.playerHP = Math.max(0, this.playerHP);
                this.playerHPText.setText(`🏰 ${this.playerHP}`);

                this.cameras.main.shake(200, 0.005);
                this.createParticleBurst(this.playerBase.x, this.playerBase.y, 0x4488ff);

                if (this.playerHP <= 0) {
                    this.gameOver(false);
                }
            }

            destroyUnit(unit) {
                const index = this.units.indexOf(unit);
                if (index > -1) {
                    this.units.splice(index, 1);
                }
                
                const moveTween = unit.getData('moveTween');
                if (moveTween) moveTween.stop();

                this.createParticleBurst(unit.x, unit.y, 0xffffff);
                unit.destroy();
            }

            regenerateCPU() {
                if (this.isPaused) return;
                
                const regenAmount = this.elixirBoostActive ? 2 : 1;
                if (this.playerCPU < this.maxCPU) {
                    this.playerCPU = Math.min(this.maxCPU, this.playerCPU + regenAmount);
                    this.updateCPU();
                }
            }

            updateCPU() {
                const color = this.elixirBoostActive ? '#ff44ff' : '#44ddff';
                this.cpuText.setText(`⚡ ${this.playerCPU}/${this.maxCPU}`);
                this.cpuText.setColor(color);
            }

            updateTimer() {
                if (this.isPaused) return;
                
                this.timeRemaining--;
                this.timerText.setText(`⏱️ ${this.timeRemaining}s`);

                if (this.timeRemaining === 10 && !this.elixirBoostActive) {
                    this.elixirBoostActive = true;
                    this.cpuRegenRate = 500;
                    this.updateCPU();
                    
                    const { width } = this.cameras.main;
                    const boostText = this.add.text(width / 2, 400, '⚡ ELIXIR BOOST! ⚡', {
                        fontFamily: 'Orbitron',
                        fontSize: '44px',
                        fontWeight: 'bold',
                        color: '#ff44ff',
                        stroke: '#000000',
                        strokeThickness: 6
                    }).setOrigin(0.5);

                    this.tweens.add({
                        targets: boostText,
                        alpha: 0,
                        y: 350,
                        duration: 2000,
                        onComplete: () => boostText.destroy()
                    });
                }

                if (this.timeRemaining <= 0) {
                    this.determineWinner();
                }

                if (this.timeRemaining <= 10) {
                    this.timerText.setColor('#ff4444');
                }
            }

            determineWinner() {
                if (this.playerHP > this.enemyHP) {
                    this.gameOver(true);
                } else if (this.enemyHP > this.playerHP) {
                    this.gameOver(false);
                } else {
                    this.gameOver(null);
                }
            }

            aiPlay() {
                if (this.isPaused) return;
                
                const affordableCards = Object.keys(CARDS).filter(id => CARDS[id].cost <= 5);
                if (affordableCards.length === 0) return;

                const cardId = Phaser.Utils.Array.GetRandom(affordableCards);
                const { width } = this.cameras.main;
                const x = Phaser.Math.Between(width / 3, 2 * width / 3);
                
                this.spawnUnit(cardId, x, 200, false);
            }

            gameOver(playerWon) {
                if (this.isDemo) {
                    this.scene.start('AuthScene');
                } else {
                    this.scene.start('ResultScene', { playerWon: playerWon });
                }
            }

            update() {
                if (this.isPaused) return;

                for (let i = 0; i < this.units.length; i++) {
                    const unit1 = this.units[i];
                    if (!unit1 || !unit1.active) continue;

                    const hp = unit1.getData('hp');
                    const maxHP = unit1.getData('maxHP');
                    const hpBar = unit1.getData('hpBar');
                    if (hpBar) {
                        const hpPercent = hp / maxHP;
                        hpBar.setScale(hpPercent, 1);
                        
                        if (hpPercent > 0.5) hpBar.setFillStyle(0x00ff00);
                        else if (hpPercent > 0.25) hpBar.setFillStyle(0xffaa00);
                        else hpBar.setFillStyle(0xff0000);
                    }

                    for (let j = i + 1; j < this.units.length; j++) {
                        const unit2 = this.units[j];
                        if (!unit2 || !unit2.active) continue;

                        const isPlayer1 = unit1.getData('isPlayer');
                        const isPlayer2 = unit2.getData('isPlayer');

                        if (isPlayer1 !== isPlayer2) {
                            const dist = Phaser.Math.Distance.Between(unit1.x, unit1.y, unit2.x, unit2.y);
                            
                            if (dist < 90) {
                                const moveTween1 = unit1.getData('moveTween');
                                const moveTween2 = unit2.getData('moveTween');
                                
                                if (moveTween1 && unit1.getData('isMoving')) {
                                    moveTween1.pause();
                                    unit1.setData('isMoving', false);
                                }
                                if (moveTween2 && unit2.getData('isMoving')) {
                                    moveTween2.pause();
                                    unit2.setData('isMoving', false);
                                }

                                const cooldown1 = unit1.getData('attackCooldown') || 0;
                                const cooldown2 = unit2.getData('attackCooldown') || 0;

                                if (cooldown1 <= 0) {
                                    const damage1 = unit1.getData('damage');
                                    unit2.setData('hp', unit2.getData('hp') - damage1 / 10);
                                    unit1.setData('attackCooldown', 5);
                                    
                                    this.createParticleBurst(unit2.x, unit2.y, 0xff6644);
                                } else {
                                    unit1.setData('attackCooldown', cooldown1 - 1);
                                }

                                if (cooldown2 <= 0) {
                                    const damage2 = unit2.getData('damage');
                                    unit1.setData('hp', unit1.getData('hp') - damage2 / 10);
                                    unit2.setData('attackCooldown', 5);
                                    
                                    this.createParticleBurst(unit1.x, unit1.y, 0xff6644);
                                } else {
                                    unit2.setData('attackCooldown', cooldown2 - 1);
                                }

                                if (unit1.getData('hp') <= 0) {
                                    this.destroyUnit(unit1);
                                }
                                if (unit2.getData('hp') <= 0) {
                                    this.destroyUnit(unit2);
                                }
                            }
                        }
                    }
                }
            }
        }