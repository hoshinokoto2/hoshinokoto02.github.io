class MissionSuccess extends Phaser.Scene {
    constructor(key) {
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
        const speech = this.add.text(this.speechCor, 400, this.speech,
                        { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);

        // Create options
        const optionYes = this.add.text(this.answerYesCor, 460, this.answerYes, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);
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
class MononokeSuccess extends MissionSuccess {
    constructor() {
        super('MononokeSuccess');
        this.nextMission = 'Mononoke';
        this.instructorKey = 'instruction/instruction_mononoke.png';
        this.instructorScale = 0.5;
        this.speech = 'Great  job!  You\'ve  got  a  lot  of  meat  this  time!  You  wanna  hunt  for  more?';
        this.answerYes = 'Yes,  let\'s  get  more  meat!';
        this.answerNo = 'No,  that\'s  enough  for  now.';
        this.speechCor = 150;
        this.answerYesCor = 150;
        this.slashCor = 435;
        this.answerNoCor = 470;
    }
}

// Mission: Fighting Bugs
class NausicaaSuccess extends MissionSuccess {
    constructor() {
        super('NausicaaSuccess');
        this.nextMission = 'Nausicaa';
        this.instructorKey = 'instruction/instruction_nausicaa.png';
        this.instructorScale = 0.5;
        this.speech = 'Nice  work!  All  these  bugs  are  back  into  the  forest.  You  wanna  keep  working?';
        this.answerYes = 'Yes,  I\'m  ready  for  the  other  bugs!';
        this.answerNo = 'No,  let\'s  call  it  a  day.';
        this.speechCor = 100;
        this.answerYesCor = 100;
        this.slashCor = 480;
        this.answerNoCor = 515;
    }
}

// Mission: Cleaning
class HowlSuccess extends MissionSuccess {
    constructor() {
        super('HowlSuccess');
        this.nextMission = 'Howl';
        this.instructorKey = 'instruction/instruction_howl.png';
        this.instructorScale = 0.9;
        this.speech = 'Wow,  thanks!  You  guys  are  amazing!  You  wanna  keep  cleaning?';
        this.answerYes = 'Sure,  let\'s  clean  it  again!';
        this.answerNo = 'No, sorry.  I\'ll  come  back  next  time.';
        this.speechCor = 150;
        this.answerYesCor = 150;
        this.slashCor = 435;
        this.answerNoCor = 470;
    }
}

// Mission: Catching Runaway Kid
class TotoroSuccess extends MissionSuccess {
    constructor() {
        super('TotoroSuccess');
        this.nextMission = 'Totoro';
        this.instructorKey = 'instruction/instruction_totoro.png';
        this.instructorScale = 0.4;
        this.speech = 'Thanks  a  lot!!  These  kids  are  so  hyperactive.  Would  you  mind  finding  another  one?';
        this.answerYes = 'No  problem,  I\'ll  help  as  long  as  I  could.';
        this.answerNo = 'Sorry,  I  also  need  to  get  back  now.';
        this.speechCor = 80;
        this.answerYesCor = 80;
        this.slashCor = 510;
        this.answerNoCor = 540;
    }
}

// Mission: Mail Delivery
class KikiSuccess extends MissionSuccess {
    constructor() {
        super('KikiSuccess');
        this.nextMission = 'Kiki';
        this.instructorKey = 'instruction/instruction_kiki.png';
        this.instructorScale = 0.9;
        this.speech = 'Hooray!  So  glad  to  get  some  mails  back!  You  wanna  help  me  collect  more?';
        this.answerYes = 'Of  course,  glad  to  help!';
        this.answerNo = 'Well,  maybe  some  other  time.';
        this.speechCor = 120;
        this.answerYesCor = 120;
        this.slashCor = 395;
        this.answerNoCor = 430;
    }
}

// class MissionKey extends MissionSuccess {
//     constructor() {
//         super('MissionKey');
//         this.nextMission = 'NextMission';
//         this.instructorKey = ;
//         this.instructorScale = ;
//         this.speech = ;
//         this.answerYes = ;
//         this.answerNo = ;
//         this.speechCor = 150;
//         this.answerYesCor = 150;
//         this.slashCor = ;
//         this.answerNoCor = ;
//     }
// }