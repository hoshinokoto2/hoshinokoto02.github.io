class Kiki extends Phaser.Scene {
    constructor(key) {
        super({key: "Kiki"});
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('kikiBgMusic', '../assets/sounds/kiki_bgMusic_VeryBusyKiki.mp3');
    //     this.load.audio('birdSound', '../assets/sounds/kiki_birdSound.mp3');
    //     this.load.audio('mailSound', '../assets/sounds/kiki_mailSound.mp3');
    // }

    create() {
        // Reset game status
        gameState.active = true;

        // Set up world and camera bounds
        gameState.worldWidth = config.width * 20;
        this.cameras.main.setBounds(0, 0, gameState.worldWidth, config.height);
        this.cameras.main.fadeIn(800);
        this.physics.world.setBounds(0, 0, gameState.worldWidth, config.height);
        
        // Create background
        this.add.image(-10, -10, 'sprites', 'kiki/kiki_background.png').setOrigin(0,0).setScale(1.3).setScrollFactor(.08); // config.width * 20: 0.055

        // Create sounds
        const birdSound = this.sound.add('birdSound');
        const mailSound = this.sound.add('mailSound');
        if (!gameState.kikiBgMusic) {
            gameState.kikiBgMusic = this.sound.add('kikiBgMusic');
        }
        if (!gameState.kikiBgMusic.isPlaying) {
            gameState.kikiBgMusic.play({ loop: true });
        }

        // Create player
        gameState.kiki = this.physics.add.sprite(-100, 250, 'sprites', 'kiki/kiki_fly.png').setScale(.2);
        gameState.kiki.body.setAllowGravity(false);
        gameState.kiki.setInteractive();
        this.cameras.main.startFollow(gameState.kiki, true, 0.5, 0.5, -300);
        
        // Player control
        this.input.on('pointermove', pointer => { gameState.kiki.y = pointer.y; });
        
        // Player moving
        this.tweens.add({
            targets: gameState.kiki,
            x: gameState.worldWidth + config.width / 2,
            delay: 1200,
            duration: 70000,
            
            // Let player fly into scene
            onStart: () => {                
                this.time.addEvent({
                    delay: 800,
                    callback: () => { gameState.kiki.setCollideWorldBounds(true); }
                });
            },

            // Player succeed (reach the end)
            onComplete: () => {
                
                // Record best score
                if (gameState.mailCount > gameState.mailBest) {
                    gameState.mailBest = gameState.mailCount;
                }

                // Change to success scene
                this.cameras.main.fade(800,0);
                this.time.addEvent({
                    delay: 800,
                    callback: () => {
                        this.scene.stop('Kiki');
                        this.scene.start('KikiSuccess');        
                    }
                });
            }
        });

        // Create animations
        this.createAnims();

        // Create birds and mails
        gameState.birds = this.physics.add.group();
        gameState.mails = this.physics.add.group();
        gameState.mailCount = 0;
        let hitCount = 0;
        for (let width = config.width + 100; width < gameState.worldWidth - config.width + 100; width += 500) {
            let height = 50;
            let birdCount = 0;
            while (height < config.height) {
                
                // No more than 3 birds per column
                if (birdCount < 3) {
                    let random = Math.round(Math.random());
                    if (random === 1) {
                        birdCount++;
                        
                        // Create crow or seagull
                        const species = Math.round(Math.random()) === 1 ? 'kiki/kiki_crow_01.png' : 'kiki/kiki_seagull_01.png';
                        const speciesScale = species === 'kiki/kiki_crow_01.png' ? 0.4 : 0.5;
                        const speciesFly = species === 'kiki/kiki_crow_01.png' ? 'crowFly' : 'seagullFly';
                        const bird = gameState.birds.create(width, height, 'sprites', species).setScale(speciesScale);
                        this.time.addEvent({
                            delay: Math.floor(Math.random() * 20) * 30,
                            callback: () => { bird.anims.play(speciesFly); }
                        });
                        bird.body.setAllowGravity(false);
                        
                        // Kiki hit birds
                        const kikiHit = this.physics.add.collider(gameState.kiki, bird, () => {
                            kikiHit.active = false;
                            if (!birdSound.isPlaying) {
                                birdSound.play();
                            }
                            this.cameras.main.shake(500, 0.02);                            
                            this.time.addEvent({
                                delay: 1000,
                                callback: () => { kikiHit.active = true; }
                            })
                            hitCount++;
                            
                            // Show hearts left
                            switch(hitCount) {
                                case 1:
                                    hearts.setText(`Life:  \u2665  \u2665`);
                                    break;
                                case 2:
                                    hearts.setText(`Life:  \u2665`);
                                    break;
                                case 3:
                                    hearts.setText(`Life:  `);
                                    break;
                            }
                            
                            // Player fails (got hit 3 times)
                            if (hitCount > 2) {
                                
                                // Freeze all actions
                                gameState.active = false;
                                this.input.enabled = false;
                                this.physics.pause();
                                gameState.kiki.setCollideWorldBounds(false);
                                
                                // Record best score
                                if (gameState.mailCount > gameState.mailBest) {
                                    gameState.mailBest = gameState.mailCount;
                                }

                                // Player felling
                                this.tweens.add({
                                    targets: gameState.kiki,
                                    x: '-=500',
                                    y: '+=300',
                                    angle: -360,
                                    duration: 1400,
                                    ease: 'Quadratic'
                                });

                                // Change to fail scene
                                this.time.addEvent({
                                    delay: 500,
                                    callback: () => {
                                        this.cameras.main.fade(800,0);
                                        this.time.addEvent({
                                            delay: 800,
                                            callback: () => {
                                                this.scene.stop('Kiki');
                                                this.scene.start('KikiFail');        
                                            }
                                        });
                                    }
                                });
                            }
                        });                        
                    } else {

                        // Create mails
                        if (Math.round(Math.random()) === 0) {
                            const mail = gameState.mails.create(width, height, 'sprites', 'kiki/kiki_mail.png').setScale(.08);
                            mail.body.setAllowGravity(false);
                            this.tweens.add({
                                targets: mail,
                                y: '-=20',
                                delay: Math.floor(Math.random() * 20) * 30,
                                yoyo: true,
                                repeat: -1
                            });
                            this.physics.add.collider(gameState.kiki, mail, () => {
                                mail.destroy();
                                mailSound.play();
                                gameState.mailCount++;
                                showMailCount.setText(`Mail:  ${gameState.mailCount}`);
                            })
                        }
                    }
                } else {
                    if (Math.round(Math.random()) === 0) {
                        const mail = gameState.mails.create(width, height, 'sprites', 'kiki/kiki_mail.png').setScale(.08);
                        mail.body.setAllowGravity(false);
                        this.tweens.add({
                            targets: mail,
                            y: '-=20',
                            delay: Math.floor(Math.random() * 20) * 30,
                            yoyo: true,
                            repeat: -1
                        });
                        this.physics.add.collider(gameState.kiki, mail, () => {
                            mail.destroy();
                            mailSound.play();
                            gameState.mailCount++;
                            showMailCount.setText(`Mail:  ${gameState.mailCount}`);
                        })
                    }
                }
                
                // Change to next row
                height += 150;
            }
        }

        // Create mission icon and name
        const icon = this.add.image(30, 20, 'sprites', 'kiki/kiki_missionIcon.png').setOrigin(0,0).setScale(.6).setScrollFactor(0);
        const missionName = this.add.text(100, 30, 'Mission  -  Mail  Delivery', { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setScrollFactor(0);
        const backToMenu = this.add.text(110, 30, 'Back  To  Menu', { fill: '#c2305a', fontSize: '28px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setAlpha(0).setScrollFactor(0);
        
        // Create back to menu link
        icon.setInteractive();
        icon.on('pointerover', () => {
            this.sound.play('menuHoverSound');
            icon.setScale(.72); // current scale *= 1.2
            icon.setTintFill(0xc2305a);
            missionName.setAlpha(0);
            backToMenu.setAlpha(1);
        });
        icon.on('pointerout', () => {
            icon.setScale(.6);
            backToMenu.setScale(1);
            backToMenu.x = 110;
            icon.clearTint();
            missionName.setAlpha(1);
            backToMenu.setAlpha(0);
        });
        icon.on('pointerdown', () => {
            icon.setScale(.65); // current scale *= 0.9
            backToMenu.setScale(0.9);
            backToMenu.x = 105;
        });
        icon.on('pointerup', (pointer, gameObject) => {
            this.input.enabled = false;
            this.sound.stopAll();
            this.sound.play('menuSelectSound');            
            icon.setScale(.72);
            backToMenu.setScale(1);
            backToMenu.x = 110;
            this.cameras.main.fade(500);
            this.time.addEvent({
                delay: 800,
                callback: () => {
                    gameState.active = false;
                    this.anims.pauseAll();
                    this.physics.pause();            
                    this.scene.stop('Kiki');
                    this.scene.start('Menu');
                }
            });
        });

        // Show scores
        this.add.text(config.width - 150, 30, `Best  Score:  ${gameState.mailBest}`, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0).setScrollFactor(0);
        const showMailCount = this.add.text(config.width - 30, 30, 'Mail:  0', { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0).setScrollFactor(0);                        

        // Show hearts
        const hearts = this.add.text(config.width - 360, 30, `Life:  \u2665  \u2665  \u2665`, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0).setScrollFactor(0);
    }

    update() {
        if (gameState.active) {
            // Reset bird frame size
            gameState.birds.getChildren().forEach(bird => { bird.setSize(); });

            // Let kiki fly out of scene at the end
            if (gameState.kiki.x > gameState.worldWidth - config.width / 2) {
                gameState.kiki.setCollideWorldBounds(false);
                gameState.active = false;
            }
        }
    }

    createAnims() {
        // Crow fly
        const crowFlyFrame = this.anims.generateFrameNames('sprites', {
            start: 1,
            end: 8,
            zeroPad: 2,
            prefix: 'kiki/kiki_crow_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'crowFly',
            frames: crowFlyFrame,
            frameRate: 30,
            repeat: -1
        })

        // Seagull fly
        const seagullFlyFrame = this.anims.generateFrameNames('sprites', {
            start: 1,
            end: 9,
            zeroPad: 2,
            prefix: 'kiki/kiki_seagull_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'seagullFly',
            frames: seagullFlyFrame,
            frameRate: 5,
            repeat: -1
        })
    }
}