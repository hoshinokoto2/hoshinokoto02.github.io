class Totoro extends Phaser.Scene {
    constructor(key) {
        super({key: "Totoro"});
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('totoroBgMusic', '../assets/sounds/totoro_bgMusic_OmimaiNiIkou.mp3');
    //     this.load.audio('catchedSound', '../assets/sounds/totoro_catchedSound.mp3');
    // }

    create() {
        // Create background music
        if (!gameState.totoroBgMusic) {
            gameState.totoroBgMusic = this.sound.add('totoroBgMusic');
        }
        if (!gameState.totoroBgMusic.isPlaying) {
            gameState.totoroBgMusic.play({ loop: true });
        }

        // Create count down
        const countDown = this.add.text(config.width / 2, config.height / 2 - 50, '3', { fill: '#fff', fontSize: '54px', fontFamily: '"Iceberg", cursive' });
        let count = 3;
        const countTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (count > 0) {
                    count--;
                    countDown.setText(`${count}`);
                } else {
                    countDown.setText('');
                    countTimer.remove();
                }
            },
            loop: true
        });

        // Reset timer
        gameState.totoroTime = 0;
        const timer = this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.time.addEvent({
                    delay: 1000,
                    callback: () => { gameState.totoroTime++; },
                    loop: true
                });
            }
        });

        // Create different sceneries
        const viewList = [{ bgX: 0, bgY: -50, bgKey01: 'totoro/totoro_bgHouse_01.png', bgKey02: 'totoro/totoro_bgHouse_02.png', originX: 0, originY: 0, scale: 0.55, totoroY: 470 },
                            { bgX: config.width + 10, bgY: config.height, bgKey01: 'totoro/totoro_bgGrass_01.png', bgKey02: 'totoro/totoro_bgGrass_02.png', originX: 1, originY: 1, scale: 2.1, totoroY: 225},
                            { bgX: 0, bgY: config.height, bgKey01: 'totoro/totoro_bgTunnel_01.png', bgKey02: 'totoro/totoro_bgTunnel_02.png', originX: 0, originY: 1, scale: 0.9, totoroY: 475 },
                            { bgX: 0, bgY: config.height, bgKey01: 'totoro/totoro_bgTree_01.png', bgKey02: 'totoro/totoro_bgTree_02.png', originX: 0, originY: 1, scale: 0.8, totoroY: 455 },
                            { bgX: 0, bgY: config.height, bgKey01: 'totoro/totoro_bgCave_01.png', bgKey02: 'totoro/totoro_bgCave_02.png', originX: 0, originY: 1, scale: 1, totoroY: 495 }];
        
        // White totoro runs through different sceneries
        let viewCount = 0;
        this.createAnims();
        const viewChanging = this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                
                // Loop through viewList
                const view = viewList[viewCount % 5];
                
                // Decide white totoro's direction
                const direction = Math.round(Math.random());
                const totoroX = direction === 0 ? -100 : config.width + 100;
                const totoroToX = direction === 0 ? config.width + 100 : -100;
                
                // Create scenery and white totoro
                const bg01 = this.add.image(view.bgX, view.bgY, 'sprites', view.bgKey01).setOrigin(view.originX, view.originY).setScale(view.scale);
                const whitetotoro = this.add.sprite(totoroX, view.totoroY, 'sprites', 'totoro/totoro_whiteTotoro_01.png').setScale(.3);
                const bg02 = this.add.image(view.bgX, view.bgY, 'sprites', view.bgKey02).setOrigin(view.originX, view.originY).setScale(view.scale);
                whitetotoro.flipX = direction === 0 ? false : true;
                whitetotoro.anims.play('wtWalk');

                // Show Timer
                const gameTime = this.add.text(config.width - 30, 30, `Time:  ${this.formatTime(gameState.totoroTime)}`, { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0);
                const gameTimer = this.time.addEvent({
                    delay: 100,
                    callback: () => {gameTime.setText(`Time:  ${this.formatTime(gameState.totoroTime)}`); },
                    loop: true
                });

                // Show best score
                const bestTime = this.add.text(config.width - 180, 30, `Best  Score:  ${this.formatTime(gameState.totoroBest)}`, { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0);
                
                // Create mission icon and name
                const icon = this.add.image(30, 20, 'sprites', 'totoro/totoro_missionIcon.png').setOrigin(0,0).setScale(.5);
                const missionName = this.add.text(85, 30, 'Mission  -  Catching  Runaway  Kid', { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);
                const backToMenu = this.add.text(95, 30, 'Back  To  Menu', { fill: '#c1d1e0', fontSize: '28px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setAlpha(0);
        
                // Create back to menu link
                icon.setInteractive();
                icon.on('pointerover', () => {
                    this.sound.play('menuHoverSound');
                    icon.setScale(.6); // current scale *= 1.2
                    icon.setTint(0xc1d1e0);
                    missionName.setAlpha(0);
                    backToMenu.setAlpha(1);
                });
                icon.on('pointerout', () => {
                    icon.setScale(.5);
                    backToMenu.setScale(1);
                    backToMenu.x = 95;
                    icon.clearTint();
                    missionName.setAlpha(1);
                    backToMenu.setAlpha(0);
                });
                icon.on('pointerdown', () => {
                    icon.setScale(.54); // current scale *= 0.9
                    backToMenu.setScale(0.9);
                    backToMenu.x = 90;
                });
                icon.on('pointerup', (pointer, gameObject) => {
                    this.input.enabled = false;
                    this.sound.stopAll();
                    this.sound.play('menuSelectSound');            
                    icon.setScale(.6);
                    backToMenu.setScale(1);
                    backToMenu.x = 95;
                    this.cameras.main.fade(500);
                    this.time.addEvent({
                        delay: 800,
                        callback: () => {
                            gameState.active = false;
                            this.scene.stop('Totoro');
                            this.scene.start('Menu');
                        }
                    });
                });

                // White totoro runs through scenery
                const totoroRun = this.tweens.add({
                    delay: 1000,
                    targets: whitetotoro,
                    x: totoroToX,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => {
                        bg01.destroy();
                        whitetotoro.destroy();
                        bg02.destroy();
                        icon.destroy();
                        missionName.destroy();
                        backToMenu.destroy();
                        gameTime.destroy();
                        gameTimer.remove();
                        bestTime.destroy();
                        net.destroy();
                    }
                });
                
                // Catch white totoro
                whitetotoro.setInteractive();
                whitetotoro.on('pointerdown', () => {
                    this.sound.play('catchedSound');
                    
                    // Freeze all actions
                    viewChanging.paused = true;
                    gameTimer.paused = true;
                    totoroRun.pause();
                    this.input.enabled = false;

                    // Record best score
                    if (gameState.totoroTime <= gameState.totoroBest) {
                        gameState.totoroBest = gameState.totoroTime;
                    } else if (gameState.totoroBest === 0) {
                        gameState.totoroBest = gameState.totoroTime;
                    }

                    // Change to success scene
                    this.time.addEvent({
                        delay: 1000,
                        callback: () => {
                            this.cameras.main.fade(800,0);
                            this.time.addEvent({
                                delay: 800,
                                callback: () => {
                                    this.scene.stop('Totoro');
                                    this.scene.start('TotoroSuccess');
                                }
                            });
                        }
                    });
                });

                // Create net
                const netX = this.input.mousePointer.x;
                const netY = this.input.mousePointer.y;
                const net = this.add.sprite(netX, netY, 'sprites', 'totoro/totoro_net.png').setScale(.2);
                net.angle = -30;
                this.input.on('pointermove', pointer => {
                    net.x = pointer.x;
                    net.y = pointer.y;
                });
                this.input.on('pointerdown', () => {
                    net.angle = -90;
                });
                this.input.on('pointerup', () => {
                    net.angle = -30;
                })
                
                // Change to next scenery
                viewCount++;
            }
        })
    }
    
    createAnims() {
        // White totoro walks
        const wtWalkFrame = this.anims.generateFrameNames('sprites', {
            start: 1,
            end: 4,
            zeroPad: 2,
            prefix: 'totoro/totoro_whiteTotoro_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'wtWalk',
            frames: wtWalkFrame,
            frameRate: 12,
            repeat: -1
        })
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
}