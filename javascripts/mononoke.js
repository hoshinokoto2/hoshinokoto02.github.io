class Mononoke extends Phaser.Scene {
    constructor(key) {
        super({key: "Mononoke"});
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('monoBgMusic', '../assets/sounds/mononoke_bgMusic_YuugureNoTataraJou.mp3');
    //     this.load.audio('gotMeat', '../assets/sounds/mononoke_gotMeat.mp3');
    //     this.load.audio('monoJump', '../assets/sounds/mononoke_jumpSound.mp3');
    //     this.load.audio('monoFail', '../assets/sounds/mononoke_failSound.mp3');
    // }

    create() {
        // Reset game status
        this.anims.resumeAll();
        this.physics.resume();
        gameState.active = true;
        gameState.meat = 0;
        if (!gameState.monoBgMusic) {
            gameState.monoBgMusic = this.sound.add('monoBgMusic');
        }
        if (!gameState.monoBgMusic.isPlaying) {
            gameState.monoBgMusic.play({ loop: true });
        }
        
        // Setup world boundary and camera
        this.cameras.main.setBounds(0, 0, config.width * 20, config.height);
        this.cameras.main.fadeIn(500);
        this.physics.world.setBounds(0, 0, config.width * 20, config.height);

        // Create parallax background
        this.add.tileSprite(0, config.height, config.width * 1, 324, 'sprites', 'mononoke/mononoke_bg_01.png').setScale(1.8).setOrigin(0,1).setTint(0x3d6778).setScrollFactor(0);
        this.add.tileSprite(0, config.height, config.width * 4, 324, 'sprites', 'mononoke/mononoke_bg_02.png').setScale(1.8).setOrigin(0,1).setTint(0x3d6778).setScrollFactor(0.3);
        this.add.tileSprite(0, config.height, config.width * 7, 324, 'sprites', 'mononoke/mononoke_bg_03.png').setScale(1.8).setOrigin(0,1).setTint(0x3d6778).setScrollFactor(0.6);
        this.add.tileSprite(0, config.height, config.width * 13, 100, 'sprites', 'mononoke/mononoke_bg_04.png').setScale(1.5).setOrigin(0,1).setTint(0x3d6778).setScrollFactor(0.9);
        this.add.tileSprite(0, config.height, config.width * 12, 100, 'sprites', 'mononoke/mononoke_bg_05.png').setScale(1.8).setOrigin(0,1).setTint(0x3d6778).setScrollFactor(1);

        // Create mission icon and name
        const icon = this.add.image(30, 20, 'sprites', 'mononoke/mononoke_missionIcon.png').setOrigin(0,0).setScale(.6).setScrollFactor(0);
        const missionName = this.add.text(90, 30, 'Mission  -  Food  Hunting', { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setScrollFactor(0);
        const backToMenu = this.add.text(100, 30, 'Back  To  Menu', { fill: '#469183', fontSize: '28px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setAlpha(0).setScrollFactor(0);
        
        // Create back to menu link
        icon.setInteractive();
        icon.on('pointerover', () => {
            this.sound.play('menuHoverSound');
            icon.setScale(.72); // current scale *= 1.2
            icon.setTint(0x469183);
            missionName.setAlpha(0);
            backToMenu.setAlpha(1);
        });
        icon.on('pointerout', () => {
            icon.setScale(.6);
            backToMenu.setScale(1);
            backToMenu.x = 100;
            icon.clearTint();
            missionName.setAlpha(1);
            backToMenu.setAlpha(0);
        });
        icon.on('pointerdown', () => {
            icon.setScale(.65); // current scale *= 0.9
            backToMenu.setScale(0.9);
            backToMenu.x = 95;
        });
        icon.on('pointerup', (pointer, gameObject) => {
            this.input.enabled = false;
            this.sound.stopAll();
            this.sound.play('menuSelectSound');            
            icon.setScale(.72);
            backToMenu.setScale(1);
            backToMenu.x = 100;
            this.cameras.main.fade(500);
            this.time.addEvent({
                delay: 800,
                callback: () => {
                    gameState.active = false;
                    this.anims.pauseAll();
                    this.physics.pause();            
                    this.scene.stop('Mononoke');
                    this.scene.start('Menu');
                }
            });
        });

        // Create platforms
        this.createTiles();

        // Create animations
        this.createAnims();

        // Create obstacles
        this.createObstacles();

        // Create monsters
        this.createMonsters();

        // Create player
        gameState.mono = this.physics.add.sprite(-250, 400, 'sprites', 'mononoke/mononoke_run_04.png').setScale(.4);
        gameState.mono.body.setAllowGravity(false);
        this.time.addEvent({
            delay: 800,
            callback: () => {
                gameState.mono.body.setAllowGravity(true);
                gameState.mono.setVelocityX(600);
            }
        });
        this.physics.add.collider(gameState.mono, gameState.tile);
        this.cameras.main.startFollow(gameState.mono, true, 0.5, 0.5, -250);
        
        // Player jump
        // * Couldn't fix the bug of using gameState.mono.body.touching.down to control when player could jump
        // * Instead, define the area where player could jump
        this.input.on('pointerdown', () => {
            let positionX = gameState.mono.body.x;
            let positionY = gameState.mono.body.y;
            if ((positionX < 3200 || (positionX > 3776 && positionX < 8512) || (positionX > 10624 && positionX < 16000) || positionX > 16576)
                && positionY > 370 && gameState.active) {
                this.sound.play('monoJump', { volume: 10 });
                gameState.mono.setVelocityY(-650);
            } else if ((positionX > 8896 && positionX < 10304) && positionY > 305 && gameState.active) {
                this.sound.play('monoJump', { volume: 10 });
                gameState.mono.setVelocityY(-650);
            }
        });
        
        // Player hit monsters and obstacles
        this.physics.add.collider(gameState.mono, gameState.boars, () => { this.startOver(); });
        this.physics.add.collider(gameState.mono, gameState.obstacles, () => { this.startOver(); });

        // Create goals
        this.createGoals();
    }

    update() {
        if (gameState.active) {
            // Reset frame size
            gameState.mono.setSize();
            
            // Player jump or run animation
            if (gameState.mono.body.velocity.y < -50) {
                gameState.mono.anims.play('monoJump');
            } else {
                gameState.mono.anims.play('monoRun', true);
            }

            // Player fell off the ground
            if (gameState.mono.body.y > config.height) {
                this.startOver();
            }

            // Player succeed
            if (gameState.mono.body.x > config.width * 20) {
                
                // Stop all actions        
                gameState.active = false;
                this.anims.pauseAll();
                this.physics.pause();

                // Record best score
                if (gameState.meat > gameState.meatBest) {
                    gameState.meatBest = gameState.meat;
                }

                // Change to success scene
                this.cameras.main.fade(800, 0);        
                this.time.addEvent({
                    delay: 800,
                    callback: () => {
                        this.scene.stop('Mononoke');
                        this.scene.start('MononokeSuccess');
                    }
                });
            }
        }
    }

    createAnims() {
        // Mono run
        const monoRunFrame = this.anims.generateFrameNames('sprites', {
            start: 1,
            end: 4,
            zeroPad: 2,
            prefix: 'mononoke/mononoke_run_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'monoRun',
            frames: monoRunFrame,
            frameRate: 10,
            repeat: -1
        })

        // Mono jump
        const monoJumpFrame = this.anims.generateFrameNames('sprites', {
            start: 3,
            end: 3,
            zeroPad: 2,
            prefix: 'mononoke/mononoke_run_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'monoJump',
            frames: monoJumpFrame,
            frameRate: 7,
            repeat: -1
        })

        // Boar Hit
        const boarFrame = this.anims.generateFrameNames('sprites', {
            start: 1,
            end: 8,
            zeroPad: 2,
            prefix: 'mononoke/mononoke_boar_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'boarHit',
            frames: boarFrame,
            frameRate: 7,
            repeat: -1
        })        
    }

    placeTile(tileGroup, tileList, tileKey, scale) {
        for (const [xIndex, yIndex] of tileList.entries()) {
            if (typeof yIndex === 'number') {
                tileGroup.create(xIndex * 64, yIndex * 64, 'sprites', tileKey).setScale(scale).setOrigin(0.5,1).refreshBody();
            }
        }
    }
    
    createTiles() {
        gameState.tile = this.physics.add.staticGroup();
        const tile1List = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 9, '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 8,
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', 9, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 9, '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', ''];
        const tile2List = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, '', '', '', '', '', '', '', '', 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, '', '', '', '', '', '', '',
                            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
                            '', '', '', '', '', 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, '', '', '', '', '', '', '', '', 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
        const tile3List = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', 9, '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', 9, '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            8, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', 9, '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', ''];
        const tile4List = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 9,
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', ''];
        const tile5List = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', ''];
        const tile6List = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            9, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                            '', '', '', '', '', '', '', '', '', '', '', '', ''];
        this.placeTile(gameState.tile, tile1List, 'mononoke/mononoke_tile_01.png', 2);
        this.placeTile(gameState.tile, tile2List, 'mononoke/mononoke_tile_02.png', 2);
        this.placeTile(gameState.tile, tile3List, 'mononoke/mononoke_tile_03.png', 2);
        this.placeTile(gameState.tile, tile4List, 'mononoke/mononoke_tile_04.png', 2);
        this.placeTile(gameState.tile, tile5List, 'mononoke/mononoke_tile_05.png', 2);
        this.placeTile(gameState.tile, tile6List, 'mononoke/mononoke_tile_06.png', 2);
    }

    createObstacles() {
        // Order of obastacels
        gameState.obstacles = this.physics.add.staticGroup();
        const obstacleList = ['mononoke/mononoke_bush_01.png', 'mononoke/mononoke_stone_03.png', 'mononoke/mononoke_bush_02.png', 'mononoke/mononoke_wood_01.png', 'mononoke/mononoke_bush_03.png',
                                'mononoke/mononoke_bush_02.png', 'mononoke/mononoke_wood_06.png', 'mononoke/mononoke_stone_04.png', 'mononoke/mononoke_bush_03.png', 
                                'mononoke/mononoke_stone_03.png', 'mononoke/mononoke_wood_02.png', 'mononoke/mononoke_bush_02.png', 'mononoke/mononoke_wood_05.png',
                                'mononoke/mononoke_stone_02.png', 'mononoke/mononoke_wood_04.png', 'mononoke/mononoke_wood_03.png', 'mononoke/mononoke_bush_03.png',
                                'mononoke/mononoke_bush_02.png', 'mononoke/mononoke_wood_06.png'];

        // Location list (total: 21000)
        const obstaclePlace = [[1300, 512], [1400, 512], [1350, 512], [2600, 512], [2650, 512],
                                [4500, 512], [4550, 512], [6100, 512], [6150, 512],
                                [9600, 450], [9650, 450], [11500, 512], [11550, 512],
                                [14000, 512], [14050, 512], [17700, 512], [17750, 512], [19000, 512], [19050, 512]];

        // set place
        for (const [i, obstacle] of obstacleList.entries()) {
            gameState.obstacles.create(obstaclePlace[i][0], obstaclePlace[i][1], 'sprites', obstacle).setScale(2).setOrigin(0.5,1);
        }
    }

    createMonsters() {
        gameState.boars = this.physics.add.group();
        const monsterPlace = [[2500, 520], [6000, 520], [7200, 520], [9500, 458], [11400, 520], [12600, 520], [15000, 520], [19100, 520]];
        monsterPlace.forEach(location => {
            const boar = gameState.boars.create(location[0], location[1], 'sprites', 'mononoke/mononoke_boar_01.png').setScale(.8).setOrigin(0.5, 1);
            boar.body.moves = false;
            boar.anims.play('boarHit');
        })
    }

    createGoals() {
        const meatPlace = ['', '', '', '', '', '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '',
                            '', '', '', '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '',
                            '', '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '', '', '', '', 9,
                            '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '', 9, '', '', '', 9,
                            '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '', '',
                            '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '', 9, '', '',
                            '', 9, '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '', '',
                            '', '', 8, '', '', '', 8, '', '', '', '', '', '', '', 8, '', '', '', 8, '',
                            '', '', '', '', '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '',
                            '', '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '',
                            '', 9, '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '', '',
                            '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '', 9,
                            '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '', '', '', '', '', '',
                            9, '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '', '', '',
                            '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', 9, '', '', '', '', '',
                            '', '', '', 9, '', '', '', 9, '', '', '', 9, ''];
        gameState.meatGroup = this.physics.add.staticGroup();
        this.add.text(config.width - 150, 30, `Best  Score:  ${gameState.meatBest}`, { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0).setScrollFactor(0);
        const meatGot = this.add.text(config.width - 30, 30, 'Meat:  0', { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0).setScrollFactor(0);
        for (const [xIndex, yIndex] of meatPlace.entries()) {
            if (typeof yIndex === 'number') {
                const meat = gameState.meatGroup.create(xIndex * 64, (yIndex - 1) * 64 - 20, 'sprites', 'mononoke/mononoke_meat.png').setScale(.12).setOrigin(0.5,1).refreshBody();
                this.physics.add.overlap(gameState.mono, meat, (mono, meatKid) => {
                    gameState.meat++;
                    meatGot.setText(`Meat:  ${gameState.meat}`);
                    this.sound.play('gotMeat');
                    meatKid.destroy();
                })
            }
        }
    }

    startOver() {
        // Stop all actions        
        this.sound.play('monoFail');
        gameState.active = false;
        this.cameras.main.shake(500, 0.02);  
        this.anims.pauseAll();
        this.physics.pause();
        this.input.enabled = false;

        // Record best score
        if (gameState.meat > gameState.meatBest) {
            gameState.meatBest = gameState.meat;
        }

        // Player fail and change to fail scene
        this.cameras.main.fade(800, 0);
        this.tweens.add({
            targets: gameState.mono,
            x: '-=300',
            y: '+=100',
            angle: '-=150',
            ease: 'Exponential',
            duration: 800,
            onComplete: () => {
                this.scene.stop('Mononoke');
                this.scene.start('MononokeFail');
            }
        });
    }
}