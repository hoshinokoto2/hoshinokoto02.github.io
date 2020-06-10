class MissionFail extends Phaser.Scene {
    constructor(key, music) {
        super({key});
        this.missionKey = key;
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    // }

    create() {
        // Reset all animations
        this.anims.resumeAll();

        // Camera fade in
        this.cameras.main.fadeIn(500);

        // Create instructor
        const instructor = this.add.image(config.width / 2, config.height / 2.5, 'sprites', this.instructorKey).setScale(this.instructorScale);
        
        // Create speech bubble
        const bubble = this.add.image(config.width / 2, 420,  'sprites', 'instruction/instruction_bubble.png');
        
        // Create speech
        const speech = this.add.text(150, 400, this.speech, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);

        // Create options
        const optionYes = this.add.text(150, 460, this.answerYes, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);
        const slash = this.add.text(this.slashCor, 460, '/', { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);
        const optionNo = this.add.text(this.answerNoCor, 460, this.answerNo, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);
        optionYes.setInteractive();
        optionNo.setInteractive();
        
        // Change option color when pointed
        this.input.on('gameobjectover', (pointer, gameObject) => {
            this.sound.play('menuHoverSound');
            gameObject === optionYes ? optionYes.setFill('#1c7ceb') : optionNo.setFill('#1c7ceb');
        });
        this.input.on('gameobjectout', (pointer, gameObject) => {
            gameObject === optionYes ? optionYes.setFill('#000') : optionNo.setFill('#000');
        });

        // Select option
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            this.cameras.main.fade(500,0);
            this.input.enabled = false;
            
            // Play again
            if (gameObject === optionYes) {
                this.sound.play('menuSelectSound');            
                this.time.addEvent({
                    delay: 800,
                    callback: () => {
                        this.scene.stop(this.missionKey);
                        this.scene.start(this.nextMission);
                    }
                });
            } else {
                
                // Show resting scene
                this.sound.stopAll();
                this.sound.play('menuSelectSound');
                this.time.addEvent({
                    delay: 800,
                    callback: () => {
                        instructor.destroy();
                        bubble.destroy();
                        speech.destroy();
                        optionYes.destroy();
                        slash.destroy();
                        optionNo.destroy();
                        this.cameras.main.fadeIn(800);
                        const totoroSleep = this.add.sprite(170, 430, 'sprites', 'totoro/totoro_sleep_01.png').setScale(.8);
                        const totoroSleepFrame = this.anims.generateFrameNames('sprites', {
                            start: 1,
                            end: 6,
                            zeroPad: 2,
                            prefix: 'totoro/totoro_sleep_',
                            suffix: '.png'
                        });
                        this.anims.create({
                            key: 'totoroSleep',
                            frames: totoroSleepFrame,
                            frameRate: 3,
                            repeat: -1
                        });
                        totoroSleep.anims.play('totoroSleep');
                        
                        // Back to menu
                        this.time.addEvent({
                            delay: 7000,
                            callback: () => {
                                this.cameras.main.fade(500,0);
                                this.time.addEvent({
                                    delay: 1000,
                                    callback: () => {
                                        this.scene.stop(this.missionKey);
                                        this.scene.start('Menu');        
                                    }
                                });
                            }
                        });        
                    }
                });
            }
        });
    }
}

// Mission: Food Hunting
class MononokeFail extends MissionFail {
    constructor() {
        super('MononokeFail');
        this.nextMission = 'Mononoke';
        this.instructorKey = 'instruction/instruction_mononoke.png';
        this.instructorScale = 0.5;
        this.speech = 'Looks  like  we  faced  some  challenges.  You  wanna  try  again?';
        this.answerYes = 'Yes,  let\'s  try  again!';
        this.answerNo = 'No,  I  wanna  go  home  now.';
        this.slashCor = 380;
        this.answerNoCor = 415;
    }
}

// Mission: Fighting Bugs
class NausicaaFail extends MissionFail {
    constructor() {
        super('NausicaaFail');
        this.nextMission = 'Nausicaa';
        this.instructorKey = 'instruction/instruction_nausicaa.png';
        this.instructorScale = 0.5;
        this.speech = 'Oh  no!  The  bugs  got  into  the  castle.  You  wanna  try  again?';
        this.answerYes = 'Yes,  let\'s  try  again!';
        this.answerNo = 'No,  I  need  a  rest  now.';
        this.slashCor = 380;
        this.answerNoCor = 415;
    }
}

// Mission: Mail Delivery
class KikiFail extends MissionFail {
    constructor() {
        super('KikiFail');
        this.nextMission = 'Kiki';
        this.instructorKey = 'instruction/instruction_kiki.png';
        this.instructorScale = 0.9;
        this.speech = 'Ouch!  Those  birds  are  really  troublesome.  You\'d  like  to  try  again?';
        this.answerYes = 'Absolutely.  I  won\'t  give  up!';
        this.answerNo = 'Well,  let\'s  take  a  rest  first.';
        this.slashCor = 465;
        this.answerNoCor = 500;
    }
}

// class MissionKey extends MissionFail {
//     constructor() {
//         super('MissionKey');
//         this.nextMission = '';
//         this.instructorKey = ;
//         this.instructorScale = ;
//         this.speech = ;
//         this.answerYes = ;
//         this.answerNo = ;
//         this.slashCor = ;
//         this.answerNoCor = ;
//     }
// }