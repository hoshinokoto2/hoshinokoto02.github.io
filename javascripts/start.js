class Start extends Phaser.Scene {
    constructor(key) {
        super({key: "Start"});
    }

    preload() {
        // Show progress
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(config.width / 2 - 150, config.height / 2 - 20, 320, 50);
        const loadingText = this.add.text(config.width / 2 + 20, config.height / 2 + 60, 'Loading...', { fill: '#fff', fontSize: '20px' }).setOrigin(0.5,0.5);
        const percentText = this.add.text(config.width / 2 + 10, config.height / 2 + 5, '0%', { fill: '#fff', fontSize: '18px' }).setOrigin(0.5,0.5);
        this.load.on('progress', value => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(config.width / 2 - 140, config.height / 2 - 10, 300 * value, 30);
        });

        // Load all images
        this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
        
        // Menu sounds
        this.load.audio('menuBgMusic', '../assets/sounds/menu_bgMusic_GogatsuNoMura.mp3');
        this.load.audio('menuHoverSound', '../assets/sounds/menu_hoverSound.mp3');
        this.load.audio('menuSelectSound', '../assets/sounds/menu_selectSound.mp3');
        
        // Begin sounds
        this.load.audio('speechClick', '../assets/sounds/instruction_click.mp3');
        
        // Mononoke sounds
        this.load.audio('monoBgMusic', '../assets/sounds/mononoke_bgMusic_YuugureNoTataraJou.mp3');
        this.load.audio('gotMeat', '../assets/sounds/mononoke_gotMeat.mp3');
        this.load.audio('monoJump', '../assets/sounds/mononoke_jumpSound.mp3');
        this.load.audio('monoFail', '../assets/sounds/mononoke_failSound.mp3');

        // Nausicaa sounds
        this.load.audio('nauBgMusic', '../assets/sounds/nausicaa_bgMusic_Harukana.mp3');
        this.load.audio('bugSound', '../assets/sounds/nausicaa_bugSound.mp3');
        this.load.audio('castleDown', '../assets/sounds/nausicaa_castleDown.mp3');

        // Howl sounds
        this.load.audio('howlBgMusic', '../assets/sounds/howl_bgMusic_SpringCleaning.mp3');
        this.load.audio('howlClick', '../assets/sounds/howl_click.mp3');
        this.load.audio('correctSound', '../assets/sounds/howl_correctSound.mp3');
        this.load.audio('incorrectSound', '../assets/sounds/howl_incorrectSound.mp3');
        this.load.audio('cleaningSound', '../assets/sounds/howl_cleaningSound.mp3');

        // Totoro sounds
        this.load.audio('totoroBgMusic', '../assets/sounds/totoro_bgMusic_OmimaiNiIkou.mp3');
        this.load.audio('catchedSound', '../assets/sounds/totoro_catchedSound.mp3');

        // Kiki sounds
        this.load.audio('kikiBgMusic', '../assets/sounds/kiki_bgMusic_VeryBusyKiki.mp3');
        this.load.audio('birdSound', '../assets/sounds/kiki_birdSound.mp3');
        this.load.audio('mailSound', '../assets/sounds/kiki_mailSound.mp3');

        // Letter sounds
        this.load.audio('letterBgMusic', '../assets/sounds/totoro_letterBgMusic_Yokatane.mp3');

        // Change to welcome page
        this.load.on('complete', () => {
            this.cameras.main.fade(500,0);
            this.time.addEvent({
                delay: 500,
                callback: () => {
                    progressBar.destroy();
                    progressBox.destroy();
                    loadingText.destroy();
                    percentText.destroy();        
                    this.cameras.main.fadeIn(500);
                    this.add.image(490, 230, 'sprites', 'menu/menu_totoroStart.png');
                    this.add.text(350, 380, 'Welcome to Ghibli Island!', { fill: '#fff', fontSize: '21px' });
                    this.add.text(310, 430, 'CLICK to start your adventures :)', { fill: '#fff', fontSize: '21px' });
                    this.input.on('pointerdown', () => {
                        this.cameras.main.fade(500,0);
                        this.input.enabled = false;
                        this.time.addEvent({
                            delay: 800,
                            callback: () => {
                                this.scene.stop('Start');
                                this.scene.start('Menu');
                            }
                        });
                    })    
                }
            });
        });        
    }
}