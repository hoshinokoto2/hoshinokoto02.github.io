class Menu extends Phaser.Scene {
    constructor(key) {
        super({key: "Menu"});
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('menuBgMusic', '../assets/sounds/menu_bgMusic_GogatsuNoMura.mp3');
    //     this.load.audio('menuHoverSound', '../assets/sounds/menu_hoverSound.mp3');
    //     this.load.audio('menuSelectSound', '../assets/sounds/menu_selectSound.mp3');
    // }

    create() {
        // Reset all animations
        this.anims.resumeAll();
        
        // Camera fade in
        this.cameras.main.fadeIn(1000);

        // Create background and music
        this.add.image(config.width / 2, config.height / 2 + 5, 'sprites', 'menu/menu_island.png').setScale(.79);
        const menuBgMusic = this.sound.add('menuBgMusic');
        menuBgMusic.play({ loop: true });

        // Create background characters
        this.add.image(100, 80, 'sprites', 'menu/menu_skycastle_castle.png'); //.setScale(.65);
        this.add.image(275, 147, 'sprites', 'menu/menu_skycastle_robot.png'); //.setScale(.12);
        this.add.image(360, 55, 'sprites', 'menu/menu_skycastle_fly.png'); //.setScale(.15);
        this.add.image(600, 101, 'sprites', 'menu/menu_howl_castle.png'); //.setScale(.25);
        this.add.image(677, 85, 'sprites', 'menu/menu_howl_airwalk.png'); //.setScale(.12);
        this.add.image(767, 196, 'sprites', 'menu/menu_mononoke_spirit.png').setAlpha(.8); //.setScale(.17);
        this.add.image(865, 220, 'sprites', 'menu/menu_mononoke_ashitaka.png'); //.setScale(.18);
        this.add.image(780, 368, 'sprites', 'menu/menu_tanuki.png'); //.setScale(.25);
        this.add.image(905, 465, 'sprites', 'menu/menu_ponyo.png'); //.setScale(.12);

        // Create title
        this.add.text(520, config.height - 40, 'G H I B L I     I S L A N D',
                    { fill: '#fff', fontSize: '52px', fontFamily: '"Iceberg", cursive', // Iceberg, Mountains of Christmas
                    shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, stroke: true, fill: '#000' } }).setOrigin(0.5,0.5);

        // Create links
        const linkList = [{xCor: 535, yCor: 292, key: 'menu/menu_totoro.png', mission: 'TotoroBegin', title: 'Mission - Catching Runaway Kid', titlexCor: 0.99, titleyCor: 1.04},
                            {xCor: 310, yCor: 345, key: 'menu/menu_kiki.png', mission: 'KikiBegin', title: 'Mission - Mail Delivery', titlexCor: 0.94, titleyCor: 1},
                            {xCor: 820, yCor: 234, key: 'menu/menu_mononoke_san.png', mission: 'MononokeBegin', title: 'Mission - Food Hunting', titlexCor: 1.01, titleyCor: 1},
                            {xCor: 930, yCor: 120, key: 'menu/menu_spirited.png', mission: 'HowlBegin', title: 'Mission - Cleaning', titlexCor: 0.98, titleyCor: 1},
                            {xCor: 500, yCor: 30, key: 'menu/menu_nausicaa.png', mission: 'NausicaaBegin', title: 'Mission - Fighting Bugs', titlexCor: 1, titleyCor: 1.4},
                            {xCor: 250, yCor: 95, key: 'menu/menu_letter.png', mission: 'Letter', title: 'Secret Letter', titlexCor: 1, titleyCor: 1.03}];
        const linkGroup = this.add.group();
        linkList.forEach(listItem => {
            const link = linkGroup.create(listItem.xCor, listItem.yCor, 'sprites', listItem.key);
            const linkTitle = this.add.text(listItem.xCor * listItem.titlexCor, listItem.yCor * listItem.titleyCor, listItem.title,
                                            { fill: '#fff', fontSize: '20px', stroke: '#000', strokeThickness: 2, fontFamily: '"Iceberg", cursive',
                                            shadow: { offsetX: 0, offsetY: 0, color: '#000', blur: 5, stroke: true } }).setOrigin(0.5,0.5).setAlpha(0);
            link.setInteractive();

            // Enlarge link when pointed
            link.on('pointerover', () => {
                this.tweens.add({
                    targets: link,
                    scale: 1.2,
                    duration: 30,
                    onStart: () => {
                        this.sound.play('menuHoverSound');
                        link.setTintFill(0x000).setAlpha(.8);
                        linkTitle.setAlpha(1);
                    }
                })
            });
            
            // Back to normal when not pointed
            link.on('pointerout', () => {
                this.tweens.add({
                    targets: link,
                    scale: 1,
                    duration: 30,
                    onStart: () => {
                        link.setScale(1.2);
                        linkTitle.setScale(1);        
                        link.clearTint().setAlpha(1);
                        linkTitle.setAlpha(0);
                    }
                })
            });
        
            // Linked to game when clicked
            link.on('pointerdown', () => {
                link.setScale(1.1);
                linkTitle.setScale(0.9);
            });
            link.on('pointerup', () => {
                link.setScale(1.2);
                linkTitle.setScale(1);
                menuBgMusic.stop();
                this.sound.play('menuSelectSound');
                this.cameras.main.fade(1000, 0);
                this.input.enabled = false;
                this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        this.scene.stop('Menu');
                        this.scene.start(listItem.mission);        
                    }
                })
            })
        })
    }
}