class Nausicaa extends Phaser.Scene {
    constructor(key) {
        super({key: "Nausicaa"});
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('nauBgMusic', '../assets/sounds/nausicaa_bgMusic_Harukana.mp3');
    //     this.load.audio('bugSound', '../assets/sounds/nausicaa_bugSound.mp3');
    //     this.load.audio('castleDown', '../assets/sounds/nausicaa_castleDown.mp3');
    // }

    create() {
        // Reset game status
        gameState.active = true;
        gameState.bugCaught = 0;
        gameState.bugSoundCount = 0;

        // Setup world boundary and camera
        this.cameras.main.setBounds(0, 0, config.width, config.height * 2.5);
        this.cameras.main.fadeIn(500);
        this.physics.world.setBounds(0, 0, config.width, config.height * 2.5);

        // Create background and music
        this.add.image(0, 0, 'sprites', 'howl/howl_scenery.png').setScale(1.15).setOrigin(0,0);
        if (!gameState.nauBgMusic) {
            gameState.nauBgMusic = this.sound.add('nauBgMusic');
        }
        if (!gameState.nauBgMusic.isPlaying) {
            gameState.nauBgMusic.play({ loop: true });
        }

        // Create forest
        gameState.forest = this.add.sprite(0, config.height * 2.5, 'sprites', 'howl/howl_forest.png').setScale(1.7).setOrigin(0,1).setTint(0x3d6778);

        // Create castle
        gameState.castle = this.physics.add.sprite(config.width / 2 + 30, 200, 'sprites', 'howl/howl_castle.png').setScale(.5).setOrigin(0.5,0.5);
        gameState.castle.body.setAllowGravity(false);
        gameState.castle.body.collideWorldBounds = true;
        gameState.castleFly = this.tweens.add({
            targets: gameState.castle,
            y: '-=10',
            duration: 1000,
            yoyo: true,
            repeat: -1
        })

        // Create bugs
        gameState.bugSound = this.sound.add('bugSound', { volume: 0.5 });
        gameState.bugs = this.physics.add.group();
        for (let i = 0; i < 20; i++) {
            const xCor = Math.random() * (config.width - 100) + 50;
            const yCor = gameState.forest.y - 250 - Math.random() * config.height;
            const bug = gameState.bugs.create(xCor, yCor, 'sprites', 'nausicaa/nausicaa_ohmu.png').setScale(.2);
            bug.body.setAllowGravity(false);
            bug.angle = 60;
            this.tweens.add({
                targets: bug,
                angle: '+=10',
                duration: 300,
                repeat: -1,
                yoyo: true
            })
        }

        // Create player
        gameState.nau = this.add.sprite(300, 300, 'sprites', 'nausicaa/nausicaa_fly.png').setScale(.18);
        gameState.nau.setInteractive();
        this.input.setDraggable(gameState.nau);
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (dragX > gameObject.x) {
                gameObject.flipX = false;
            } else if (dragX < gameObject.x) {
                gameObject.flipX = true;
            }
            gameObject.x = dragX;
            gameObject.y = dragY;
        })
        this.cameras.main.startFollow(gameState.nau, true, 0.5, 0.5, -100);

        // Create mission icon and name
        const icon = this.add.image(30, 20, 'sprites', 'nausicaa/nausicaa_missionIcon.png').setOrigin(0,0).setScale(.4).setScrollFactor(0);
        const missionName = this.add.text(75, 30, 'Mission  -  Fighting  Bugs', { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setScrollFactor(0);
        const backToMenu = this.add.text(80, 30, 'Back  To  Menu', { fill: '#695101', fontSize: '28px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setAlpha(0).setScrollFactor(0);
        
        // Create back to menu link
        icon.setInteractive();
        icon.on('pointerover', () => {
            this.sound.play('menuHoverSound');
            icon.setScale(.48); // current scale *= 1.2
            icon.setTintFill(0x695101);
            missionName.setAlpha(0);
            backToMenu.setAlpha(1);
        });
        icon.on('pointerout', () => {
            icon.setScale(.4);
            backToMenu.setScale(1);
            backToMenu.x = 80;
            icon.clearTint();
            missionName.setAlpha(1);
            backToMenu.setAlpha(0);
        });
        icon.on('pointerdown', () => {
            icon.setScale(.43); // current scale *= 0.9
            backToMenu.setScale(0.9);
            backToMenu.x = 77;
        });
        icon.on('pointerup', (pointer, gameObject) => {
            this.input.enabled = false;
            this.sound.stopAll();
            this.sound.play('menuSelectSound');            
            icon.setScale(.48);
            backToMenu.setScale(1);
            backToMenu.x = 80;
            this.cameras.main.fade(500);
            this.time.addEvent({
                delay: 800,
                callback: () => {
                    gameState.active = false;
                    this.anims.pauseAll();
                    this.physics.pause();            
                    this.scene.stop('Nausicaa');
                    this.scene.start('Menu');
                }
            });
        });

        // Create timer
        gameState.bugTime = 0;
        const gameTime = this.add.text(config.width - 30, 30, `Time:  ${this.formatTime(gameState.bugTime)}`, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0).setScrollFactor(0);
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (gameState.active) {
                    gameState.bugTime++;
                    gameTime.setText(`Time:  ${this.formatTime(gameState.bugTime)}`);
                }
            },
            loop: true
        })

        // Show best score
        this.add.text(config.width - 180, 30, `Best  Score:  ${this.formatTime(gameState.bugBest)}`, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0).setScrollFactor(0);
    }

    update() {
        // Bug movements
        if (gameState.active) {
            gameState.bugs.getChildren().forEach(bug => {
            
                // Bug flips
                bug.x > gameState.castle.x ? bug.flipY = false : bug.flipY = true;
    
                // Bug being herded            
                if (gameState.nau.y - bug.y > -130 && gameState.nau.y - bug.y < 0
                    && gameState.nau.x - bug.x < 130 && gameState.nau.x - bug.x >= 0) {
                    bug.x -= 10;
                    bug.y += 10;
                    gameState.bugSoundCount++;
                    if (!gameState.bugSound.isPlaying) {
                        gameState.bugSound.play();
                    }
                } else if (gameState.nau.y - bug.y > -130 && gameState.nau.y - bug.y < 0
                    && gameState.nau.x - bug.x > -130 && gameState.nau.x - bug.x < 0) {
                    bug.x += 10;
                    bug.y += 10;
                    gameState.bugSoundCount++;
                    if (!gameState.bugSound.isPlaying) {
                        gameState.bugSound.play();
                    }
                } else if (gameState.nau.y - bug.y < 130 && gameState.nau.y - bug.y >= 0
                    && gameState.nau.x - bug.x < 130 && gameState.nau.x - bug.x >= 0) {
                    bug.x -= 10;
                    bug.y -= 10;
                    gameState.bugSoundCount++;
                    if (!gameState.bugSound.isPlaying) {
                        gameState.bugSound.play();
                    }
                } else if (gameState.nau.y - bug.y < 130 && gameState.nau.y - bug.y >= 0
                    && gameState.nau.x - bug.x > -130 && gameState.nau.x - bug.x < 0) {
                    bug.x += 10;
                    bug.y -= 10;
                    gameState.bugSoundCount++;
                    if (!gameState.bugSound.isPlaying) {
                        gameState.bugSound.play();
                    }
                }
    
                // Bug herded back to forest
                if (bug.y > gameState.forest.y - 250) {
                    bug.destroy();
                    gameState.bugCaught++;
                    
                    // Player succeed (all bugs back to forest)
                    if (gameState.bugCaught === 20) {

                        // Stop all actions
                        gameState.active = false;
                        
                        // Record best score
                        if (gameState.bugBest === 0) {
                            gameState.bugBest = gameState.bugTime;
                        } else if (gameState.bugBest !== 0 && gameState.bugTime < gameState.bugBest) {
                            gameState.bugBest = gameState.bugTime;
                        }

                        // Change to success scene
                        this.cameras.main.fade(800, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.stop('Nausicaa');
                            this.scene.start('NausicaaSuccess');
                        });
                    }
                } else {
                    
                    // Bug moves to castle
                    this.physics.moveToObject(bug, gameState.castle, 30);
                }
    
                // Bug catches castle
                if (bug.x < gameState.castle.x + 20 && bug.x > gameState.castle.x - 20
                    && bug.y < gameState.castle.y + 20 && bug.y > gameState.castle.y - 20) {
                    bug.destroy();
                    if (gameState.active) {
                        gameState.castleFly.remove();
                        this.startOver();
                    }
                }
            });
        }
    }

    formatTime(seconds) {
        // Get minutes
        var minutes = Math.floor(seconds/60);
        
        // Get seconds
        var partInSeconds = seconds%60;
        
        // Add left zeros to seconds
        partInSeconds = partInSeconds.toString().padStart(2,'0');
        // Returns formated time
        return `${minutes}:${partInSeconds}`;
    }

    startOver() {
        // Castle falls
        this.tweens.add({
            targets: gameState.castle,
            angle: '+=50',
            duration: 50,
            yoyo: true,
            repeat: 4,
            onStart: () => {
                gameState.active = false;
                this.sound.play('castleDown');
                this.cameras.main.shake(250, 0.01);
                this.cameras.main.startFollow(gameState.castle, true, 0.5, 0.5);
            },
            onComplete: () => {
                gameState.castle.body.setAllowGravity(true);
                gameState.castle.angle += 50;
            }
        })

        // Camera fade and restart scene
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.cameras.main.fade(800, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.stop('Nausicaa');
                    this.scene.start('NausicaaFail');
                });
            },
            callbackScope: this,
            loop: false
        });
    }
}