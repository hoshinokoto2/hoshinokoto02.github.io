class Howl extends Phaser.Scene {
    constructor(key) {
        super({key: "Howl"});
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('howlBgMusic', '../assets/sounds/howl_bgMusic_SpringCleaning.mp3');
    //     this.load.audio('howlClick', '../assets/sounds/howl_click.mp3');
    //     this.load.audio('correctSound', '../assets/sounds/howl_correctSound.mp3');
    //     this.load.audio('incorrectSound', '../assets/sounds/howl_incorrectSound.mp3');
    //     this.load.audio('cleaningSound', '../assets/sounds/howl_cleaningSound.mp3');
    // }

    create() {
        // Camera fade in
        this.cameras.main.fadeIn(800);
        
        // Create background and music
        this.add.image(0, 0, 'sprites', 'howl/howl_background.png').setScale(.7).setOrigin(0.03,0);
        gameState.cleaningSound = this.sound.add('cleaningSound');
        if (!gameState.howlBgMusic) {
            gameState.howlBgMusic = this.sound.add('howlBgMusic');
        }
        if (!gameState.howlBgMusic.isPlaying) {
            gameState.howlBgMusic.play({ loop: true });
        }

        // Create calcifer
        this.createAnims();
        const calcifer = this.add.sprite(926, 323, 'sprites', 'howl/howl_calcifer_01.png').setScale(.19);
        calcifer.anims.play('calciferMove');

        // Create books in the background
        this.createBgBooks();

        // Create stuffs at correct places
        this.createCorrect();

        // Create correct areas
        this.createAreas();

        // Create stuffs at random places
        this.createRandom();

        // Create mission icon and name
        const icon = this.add.image(30, 20, 'sprites', 'howl/howl_missionIcon.png').setOrigin(0,0).setScale(.35);
        const missionName = this.add.text(75, 30, 'Mission  -  Cleaning', { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);
        const backToMenu = this.add.text(80, 30, 'Back  To  Menu', { fill: '#336fb0', fontSize: '28px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0).setAlpha(0);
        
        // Create back to menu link
        icon.setInteractive();
        icon.on('pointerover', () => {
            this.sound.play('menuHoverSound');
            icon.setScale(.42); // current scale *= 1.2
            icon.setTint(0x336fb0);
            missionName.setAlpha(0);
            backToMenu.setAlpha(1);
        });
        icon.on('pointerout', () => {
            icon.setScale(.35);
            backToMenu.setScale(1);
            backToMenu.x = 80;
            icon.clearTint();
            missionName.setAlpha(1);
            backToMenu.setAlpha(0);
        });
        icon.on('pointerdown', () => {
            icon.setScale(.38); // current scale *= 0.9
            backToMenu.setScale(0.9);
            backToMenu.x = 77;
        });
        icon.on('pointerup', (pointer, gameObject) => {
            this.input.enabled = false;
            this.sound.stopAll();
            this.sound.play('menuSelectSound');            
            icon.setScale(.42);
            backToMenu.setScale(1);
            backToMenu.x = 80;
            this.cameras.main.fade(500);
            this.time.addEvent({
                delay: 800,
                callback: () => {
                    gameState.active = false;
                    this.scene.stop('Howl');
                    this.scene.start('Menu');
                }
            });
        });

        // Reset item numbers
        gameState.itemTotal = 26;
        gameState.itemCleaned = 0;        
        gameState.totalLeft = this.add.text(config.width - 170, 30, `Total  Left:  ${gameState.itemTotal}`, { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0);
        gameState.totalCleaned = this.add.text(config.width - 30, 30, `Items:  ${gameState.itemCleaned}`, { fill: '#fff', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,0);

        // Set drag behaviors
        this.input.on('dragstart', (pointer, gameObject) => this.children.bringToTop(gameObject));
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        gameState.dragToArea = this.input.on('dragenter', (pointer, gameObject, target) => {
            this.sound.play('howlClick');
            target.area.setAlpha(.7);
        })
        this.input.on('dragleave', (pointer, gameObject, target) => target.area.setAlpha(0));
    }

    update() {
        // Player succeed: all dirts cleaned
        if (gameState.active) {
            if (gameState.dirts.getChildren().length === 0) {
                gameState.sponge.setAlpha(0);
                gameState.createBubbles.stop();
                
                // Room sparkling
                const sparkles = this.add.particles('sprites', 'howl/howl_sparkle.png');
                let sparkleCount = 0;
                const sparkleEmitter = sparkles.createEmitter({
                    x: { min: 0, max: config.width },
                    y: { min: 0, max: config.height },
                    scale: {start: 0.1, end: 0.2 },
                    lifespan: 300,
                    frequency: 35,
                    emitCallback: () => {
                        
                        // Change to success scene
                        if (sparkleCount > 50) {
                            sparkleEmitter.stop();
                            this.cameras.main.fade(800,0);
                            this.time.addEvent({
                                delay: 800,
                                callback: () => {
                                    this.scene.stop('Howl');
                                    this.scene.start('HowlSuccess');
                                }
                            });
                        } else {
                            sparkleCount++;
                        }
                    }
                });
                gameState.active = false;
            }
        }
    }

    createAnims() {
        // Calcifer moving fire
        const calciferFrame = this.anims.generateFrameNames('sprites', {
            start: 1,
            end: 15,
            zeroPad: 2,
            prefix: 'howl/howl_calcifer_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'calciferMove',
            frames: calciferFrame,
            frameRate: 7,
            repeat: -1
        })
    }

    createBgBooks() {
        // Create background books on bookshelf
        this.add.image(496, 218, 'sprites', 'howl/howl_book_cleaned_01.png').setScale(.05).setTint(0xba9865);
        this.add.image(472, 219, 'sprites', 'howl/howl_book_cleaned_01.png').setScale(.05).setTint(0xba9865);
        this.add.image(495, 190, 'sprites', 'howl/howl_book_cleaned_01.png').setScale(.05).setTint(0xba9865);
        this.add.image(473, 192, 'sprites', 'howl/howl_book_cleaned_02.png').setScale(.06).setTint(0xba9865);
    }

    createCorrect() {
        // Create correct items at correct places
        gameState.woodCorrect = this.add.image(844, 356, 'sprites', 'howl/howl_wood.png').setScale(.21).setTint(0x705c3e, 0xa3865a, 0x705c3e, 0xa3865a).setAlpha(0);
        gameState.pan1Correct = this.add.image(730, 225, 'sprites', 'howl/howl_pan_01.png').setScale(.25).setAngle(-50).setTint(0x7a6e5c, 0xa69986, 0x7a6e5c, 0x7a6e5c).setAlpha(0);
        gameState.pan2Correct = this.add.image(750, 225, 'sprites', 'howl/howl_pan_02.png').setScale(.13).setAngle(-50).setTint(0xa69986, 0xa69986, 0x7a6e5c, 0x7a6e5c).setAlpha(0);
        gameState.mug1Correct = this.add.image(628, 256.5, 'sprites', 'howl/howl_mug_01.png').setScale(.05).setFlip(true).setTint(0x7a7874, 0xcfcbc4, 0x807d78, 0xcfcbc4).setAlpha(0);
        gameState.mug2Correct = this.add.image(639, 256, 'sprites', 'howl/howl_mug_02.png').setScale(.05).setFlip(true).setTint(0x7a7874, 0xcfcbc4, 0x807d78, 0xcfcbc4).setAlpha(0);
        gameState.mug3Correct = this.add.image(649, 256.5, 'sprites', 'howl/howl_mug_03.png').setScale(.05).setFlip(true).setTint(0x7a7874, 0xcfcbc4, 0x807d78, 0xcfcbc4).setAlpha(0);
        gameState.mug4Correct = this.add.image(660, 257, 'sprites', 'howl/howl_mug_04.png').setScale(.05).setFlip(true).setTint(0x7a7874, 0xcfcbc4, 0x807d78, 0xcfcbc4).setAlpha(0);
        gameState.mug5Correct = this.add.image(671, 257.5, 'sprites', 'howl/howl_mug_05.png').setScale(.05).setFlip(true).setTint(0x7a7874, 0xcfcbc4, 0x807d78, 0xcfcbc4).setAlpha(0);
        gameState.mug6Correct = this.add.image(682, 258, 'sprites', 'howl/howl_mug_06.png').setScale(.05).setFlip(true).setTint(0x7a7874, 0xcfcbc4, 0x807d78, 0xcfcbc4).setAlpha(0);
        gameState.pitcherCorrect = this.add.image(614, 269, 'sprites', 'howl/howl_pitcher.png').setScale(.12).setFlip(true).setTint(0xcfcbc4, 0xcfcbc4, 0x807d78, 0xcfcbc4).setAlpha(0);
        gameState.plateCorrect = this.add.image(643, 281, 'sprites', 'howl/howl_plate_cleaned.png').setScale(.05).setTint(0xcfcbc4, 0xcfcbc4, 0xcfcbc4, 0x807d78).setAlpha(0);
        gameState.bowlCorrect = this.add.image(666, 279, 'sprites', 'howl/howl_bowl_cleaned.png').setScale(.05).setTint(0xcfcbc4, 0xcfcbc4, 0xcfcbc4, 0x807d78).setAlpha(0);
        gameState.dishsoapCorrect = this.add.image(569, 274, 'sprites', 'howl/howl_dishsoap.png').setScale(.08).setTint(0xcfcbc4, 0xcfcbc4, 0x807d78, 0x807d78).setAlpha(0);
        gameState.spongeCorrect = this.add.image(560, 283, 'sprites', 'howl/howl_sponge_cleaned.png').setScale(.04).setAngle(1).setTint(0xf5f5ce, 0xf5f5ce, 0x807d78, 0x807d78).setAlpha(0);
        gameState.book2Correct = this.add.image(497, 251, 'sprites', 'howl/howl_book_cleaned_02.png').setScale(.06).setAngle(-3).setTint(0xba9865).setAlpha(0);
        gameState.book1Correct = this.add.image(472, 252, 'sprites', 'howl/howl_book_cleaned_01.png').setScale(.05).setTint(0xba9865).setAlpha(0);
        gameState.highheelCorrect = this.add.image(180, 330, 'sprites', 'howl/howl_highheel_cleaned.png').setScale(.08).setFlip(true).setTint(0xd1cfc9).setAlpha(0);
        gameState.shoeCorrect = this.add.image(148, 334, 'sprites', 'howl/howl_shoes_cleaned.png').setScale(.09).setFlip(true).setTint(0xd1cfc9).setAlpha(0);
        gameState.coatCorrect = this.add.image(109, 288, 'sprites', 'howl/howl_coat.png').setScale(.3).setTint(0xd9d8d4, 0xd9d8d4, 0xd9d8d4, 0x3b3b3a).setAngle(2).setAlpha(0);
        gameState.coatrack = this.add.image(93, 321, 'sprites', 'howl/howl_coatrack.png').setScale(.7).setTint(0xba9865, 0x3b3b3a, 0xba9865, 0xba9865);
        gameState.hatCorrect = this.add.image(79, 258, 'sprites', 'howl/howl_hat.png').setScale(.1).setFlip(true).setAngle(-60).setTint(0xfaf8e8, 0xfaf8e8, 0xb0ad97, 0xb0ad97).setAlpha(0);
    }
    
    createAreas() {
        // Create area drop zones
        const areaList = [{name: 'fireplace', xCor: 900, yCor: 267, fileKey: 'howl/howl_background_fireplace.png'},
                            {name: 'potrack', xCor: 760, yCor: 235, fileKey: 'howl/howl_background_potrack.png'},
                            {name: 'cupboard', xCor: 651, yCor: 250, fileKey: 'howl/howl_background_cupboard.png'},
                            {name: 'sink', xCor: 574, yCor: 227, fileKey: 'howl/howl_background_sink.png'},
                            {name: 'bookshelf', xCor: 479, yCor: 220, fileKey: 'howl/howl_background_bookshelf.png'},
                            {name: 'shoerack', xCor: 165, yCor: 355, fileKey: 'howl/howl_background_shoerack.png'},
                            {name: 'coatrack', xCor: 93, yCor: 321, fileKey: 'howl/howl_background_coatrack.png'},];
        areaList.forEach(area => {
            const areaAdded = this.add.image(area.xCor, area.yCor, 'sprites', area.fileKey).setScale(.7).setAlpha(0);
            const zoneWidth = areaAdded.displayWidth * 0.6;
            const zoneHeight = areaAdded.displayHeight * 0.7;
            const zone = this.add.zone(area.xCor, area.yCor, zoneWidth, zoneHeight).setRectangleDropZone(zoneWidth, zoneHeight);
            zone.name = area.name;
            zone.area = areaAdded;
            // // show zone size
            // const graphics = this.add.graphics();
            // graphics.lineStyle(2, 0xffff00);
            // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);    
        })        
    }

    cleaningTime() {
        // Create dirts
        gameState.dirts = this.physics.add.group();
        for (let i = 0; i <  100; i++) {
            const xCor = Math.random() * config.width;
            const yCor = Math.random() * config.height;
            const angle = Math.random() * 360;
            const dirt = gameState.dirts.create(xCor, yCor, 'sprites', 'howl/howl_dirt.png').setAngle(angle);
            dirt.body.setAllowGravity(false);
            this.tweens.add({
                targets: dirt,
                angle: `+=10`,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }

        // Create bubbles
        const spongeX = this.input.mousePointer.x;
        const spongeY = this.input.mousePointer.y;
        const bubbles = this.add.particles('sprites', 'howl/howl_bubble.png');
        gameState.createBubbles = bubbles.createEmitter({
            x: { min: spongeX - 80, max: spongeX + 80 },
            y: { min: spongeY - 80, max: spongeY + 80 },
            alpha: 0.8,
            scale: {start: 0.1, end: 1 },
            quantity: 5,
            lifespan: 300
        });
        gameState.createBubbles.stop();
        
        // Create sponge
        gameState.sponge = this.physics.add.sprite(spongeX, spongeY, 'sprites', 'howl/howl_sponge_cleaning.png').setOrigin(0.5,0.5);
        gameState.sponge.body.setAllowGravity(false);
        
        // Reset game status
        gameState.active = true;
        
        // Move sponge and bubbles
        this.input.on('pointermove', pointer => {
            gameState.sponge.x = pointer.x;
            gameState.sponge.y = pointer.y;
            gameState.createBubbles.setPosition({ min: gameState.sponge.x - 50, max: gameState.sponge.x + 50 }, { min: gameState.sponge.y - 50, max: gameState.sponge.y + 50 });
            if (gameState.active) {
                gameState.createBubbles.start();
                this.time.addEvent({
                    delay: 300,
                    callback: () => { gameState.createBubbles.stop(); }
                });
            }
        });

        // Show cleaning status
        let cleaningProcess = 0;
        gameState.totalLeft.setText('');
        gameState.totalCleaned.setText(`Area  Cleaned:  ${cleaningProcess}  %`);

        // Sponge cleaning dirts
        gameState.dirts.getChildren().forEach(dirt => {
            let overlapDirt = 0;
            this.physics.add.overlap(dirt, gameState.sponge, () => {
                if (overlapDirt > 50) {
                    this.tweens.add({
                        targets: dirt,
                        alpha: 0,
                        duration: 300,
                        delay: 100,
                        onComplete: () => {
                            dirt.destroy();
                            gameState.createBubbles.stop();
                            cleaningProcess = 100 - gameState.dirts.getChildren().length;
                            gameState.totalCleaned.setText(`Area  Cleaned:  ${cleaningProcess}  %`);
                        }
                    });
                } else {
                    overlapDirt++;
                    gameState.createBubbles.start();
                    if (!gameState.cleaningSound.isPlaying) {
                        gameState.cleaningSound.play({ volume: 0.3 });
                    }
                }
            });
        });
    }

    createRandom() {
        // Create list of random places
        const randomPlace = [[815, 380], [950, 395], [820, 490], [920, 500], [740, 470], [660, 480], [700, 505], [780, 510],    // right corner: 0 - 7
                            [90, 450], [50, 480], [120, 480], [100, 510],                                                       // left corner: 8 - 11
                            [250, 365], [160, 380], [350, 370], [250, 400], [310, 405], [210, 410], [440, 385], [400, 400],     // table back: 12 - 19
                            [480, 405], [330, 440], [400, 435], [230, 430], [285, 460], [520, 420]];                            // table front: 20 - 25
        
        // // Show order of random places
        // randomPlace.forEach((place, index) => {
        //     let xCor = place[0];
        //     let yCor = place[1];
        //     this.add.text(xCor, yCor, `${index}`, { fill: '#fff', fontSize: '18px' }).setOrigin(0.5,1);
        // })

        // Create list of random stuffs
        const ranList = [{filename: 'howl/howl_wood.png', scale: 0.36, angle: 0, correctStuff: gameState.woodCorrect, correctArea: 'fireplace'},
                        {filename: 'howl/howl_pan_01.png', scale: 0.6, angle: 30, correctStuff: gameState.pan1Correct, correctArea: 'potrack'},
                        {filename: 'howl/howl_pan_02.png', scale: 0.3, angle: 50, correctStuff: gameState.pan2Correct, correctArea: 'potrack'},
                        {filename: 'howl/howl_mug_01.png', scale: 0.16, angle: 0, correctStuff: gameState.mug1Correct, correctArea: 'cupboard'},
                        {filename: 'howl/howl_mug_02.png', scale: 0.16, angle: 60, correctStuff: gameState.mug2Correct, correctArea: 'cupboard'},
                        {filename: 'howl/howl_mug_03.png', scale: 0.16, angle: -60, correctStuff: gameState.mug3Correct, correctArea: 'cupboard'},
                        {filename: 'howl/howl_mug_04.png', scale: 0.16, angle: 180, correctStuff: gameState.mug4Correct, correctArea: 'cupboard'},
                        {filename: 'howl/howl_mug_05.png', scale: 0.16, angle: 0, correctStuff: gameState.mug5Correct, correctArea: 'cupboard'},
                        {filename: 'howl/howl_mug_06.png', scale: 0.16, angle: 180, correctStuff: gameState.mug6Correct, correctArea: 'cupboard'},
                        {filename: 'howl/howl_pitcher.png', scale: 0.24, angle: 70, correctStuff: gameState.pitcherCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_plate_uncleaned.png', scale: 0.12, angle: 0, correctStuff: gameState.plateCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_plate_uncleaned.png', scale: 0.12, angle: -10, correctStuff: gameState.plateCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_plate_uncleaned.png', scale: 0.12, angle: 180, correctStuff: gameState.plateCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_plate_uncleaned.png', scale: 0.12, angle: 190, correctStuff: gameState.plateCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_bowl_uncleaned.png', scale: 0.084, angle: 0, correctStuff: gameState.bowlCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_bowl_uncleaned.png', scale: 0.084, angle: 30, correctStuff: gameState.bowlCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_bowl_uncleaned.png', scale: 0.084, angle: -20, correctStuff: gameState.bowlCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_bowl_uncleaned.png', scale: 0.084, angle: 160, correctStuff: gameState.bowlCorrect, correctArea: 'cupboard'},
                        {filename: 'howl/howl_dishsoap.png', scale: 0.24, angle: 80, correctStuff: gameState.dishsoapCorrect, correctArea: 'sink'},
                        {filename: 'howl/howl_sponge_cleaned.png', scale: 0.22, angle: 0, correctStuff: gameState.spongeCorrect, correctArea: 'sink'},
                        {filename: 'howl/howl_book_uncleaned_01.png', scale: 0.18, angle: 20, correctStuff: gameState.book1Correct, correctArea: 'bookshelf'},
                        {filename: 'howl/howl_book_uncleaned_02.png', scale: 0.36, angle: 0, correctStuff: gameState.book2Correct, correctArea: 'bookshelf'},
                        {filename: 'howl/howl_highheel_uncleaned.png', scale: 0.24, angle: -40, correctStuff: gameState.highheelCorrect, correctArea: 'shoerack'},
                        {filename: 'howl/howl_shoes_uncleaned.png', scale: 0.24, angle: 0, correctStuff: gameState.shoeCorrect, correctArea: 'shoerack'},
                        {filename: 'howl/howl_coat.png', scale: 0.48, angle: 90, correctStuff: gameState.coatCorrect, correctArea: 'coatrack'},
                        {filename: 'howl/howl_hat.png', scale: 0.3, angle: 0, correctStuff: gameState.hatCorrect, correctArea: 'coatrack'}];

        // Loop through random places
        randomPlace.forEach(place => {
            let xCor = place[0];
            let yCor = place[1];            
            if (ranList.length > 0) {
                
                // Randomly choose stuff at current place
                let i = Math.floor(Math.random() * ranList.length);
                const stuff = this.add.sprite(xCor, yCor, 'sprites', ranList[i]['filename']).setScale(ranList[i]['scale']).setAngle(ranList[i]['angle']).setOrigin(0.5,0.5);
                const correctStuff = ranList[i]['correctStuff'];
                const correctArea = ranList[i]['correctArea'];
                
                // Make stuff draggable
                stuff.setInteractive();
                this.input.setDraggable(stuff);
                stuff.on('drop', (pointer, target) => {
                    
                    // Put stuff at correct area
                    if (target.name === correctArea) {                        
                        this.sound.play('correctSound', { volume: 0.3 });
                        stuff.input.enabled = false;
                        stuff.setAlpha(0);
                        correctStuff.setAlpha(1);
                        target.area.setAlpha(0);
                        
                        // Show updated numbers
                        gameState.itemCleaned++;
                        gameState.itemTotal--;
                        gameState.totalCleaned.setText(`Items:  ${gameState.itemCleaned}`);
                        gameState.totalLeft.setText(`Total  Left:  ${gameState.itemTotal}`);

                        // Show dirts and sponge
                        if (gameState.itemTotal === 0) {
                            this.cleaningTime();
                        }
                    } else {
                        
                        // Put stuff at wrong area
                        this.sound.play('incorrectSound', { volume: 0.3 });
                        stuff.x = xCor;
                        stuff.y = yCor;
                        target.area.setAlpha(0);
                    }
                });
                
                // Put stuff outside areas
                stuff.on('dragend', (pointer, dragX, dragY, dropped) => {
                    if (!dropped) {
                        this.sound.play('incorrectSound', { volume: 0.3 });
                        stuff.x = xCor;
                        stuff.y = yCor;
                    }
                });

                // Delete stuff from ranList
                ranList.splice(i, 1);
            }
        })
    }    
}