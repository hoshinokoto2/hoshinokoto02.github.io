class MissionBegin extends Phaser.Scene {
    constructor(key) {
        super({key});
        this.missionKey = key;
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('speechClick', '../assets/sounds/instruction_click.mp3');
    // }

    create() {        
        // Camera fade in
        this.cameras.main.fadeIn(500,0);

        // Loading scene
        const catbus = this.add.sprite(800, 430, 'sprites', 'totoro/totoro_catbus_01.png').setScale(.6);
        const catbusFrame = this.anims.generateFrameNames('sprites', {
            start: 1,
            end: 6,
            zeroPad: 2,
            prefix: 'totoro/totoro_catbus_',
            suffix: '.png'
        });
        this.anims.create({
            key: 'catbusRun',
            frames: catbusFrame,
            frameRate: 10,
            repeat: -1
        });
        catbus.anims.play('catbusRun');

        // Camera fade out
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.cameras.main.fade(500,0);
            }
        });

        // Change to instruction scene
        this.time.addEvent({
            delay: 6000,
            callback: () => {

                // Freeze all actions
                catbus.destroy();

                // Camera fade in
                this.cameras.main.fadeIn(500);

                // Create instructor
                this.add.image(config.width / 2, config.height / 2.5, 'sprites', this.instructorKey).setScale(this.instructorScale);
                
                // Create speech bubble
                this.add.image(config.width / 2, 420,  'sprites', 'instruction/instruction_bubble.png');
                
                // Create click next sign
                this.add.text(890, 500, 'CLICK >>>', { fill: '#000', fontSize: '16px', fontFamily: '"Iceberg", cursive' }).setOrigin(1,1);

                // Create speech
                const speech = this.add.text(150, 400, this.speech01, { fill: '#000', fontSize: '24px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);
                let clickCount = 0;
                this.input.on('pointerdown', () => {
                    this.sound.play('speechClick');
                    switch(clickCount) {
                        case 0:
                            speech.setText(this.speech02);
                            clickCount++;
                            break;
                        
                        // Change to mission scene                
                        case 1:
                            this.cameras.main.fade(500);
                            this.input.enabled = false;
                            this.time.addEvent({
                                delay: 800,
                                callback: () => {
                                    this.scene.stop(this.missionKey);
                                    this.scene.start(this.nextMission);
                                }
                            });
                    }
                });
            }
        });

    }
}

// Mission: Food Hunting
class MononokeBegin extends MissionBegin {
    constructor() {
        super('MononokeBegin');
        this.nextMission = 'Mononoke';
        this.instructorKey = 'instruction/instruction_mononoke.png';
        this.instructorScale = 0.5;
        this.speech01 = 'Seems  like  we\'re  running  out  of  food.  Let\'s  go  hunt  for  some  more!';
        this.speech02 = 'Remember  to  watch  out  for  the  wild  boars  and  obstacles!\n\nJust  CLICK  to  jump  over  them.';
    }
}

// Mission: Fighting Bugs
class NausicaaBegin extends MissionBegin {
    constructor() {
        super('NausicaaBegin');
        this.nextMission = 'Nausicaa';
        this.instructorKey = 'instruction/instruction_nausicaa.png';
        this.instructorScale = 0.5;
        this.speech01 = 'Hey,  it  looks  like  Howl\'s  castle  is  having  some  trouble  with  the  bugs.\n\nLet\'s  help  them  out!';
        this.speech02 = 'DRAG  THE  AIRCRAFT  to  herd  the  bugs  back  to  the  forest.\n\nDon\'t  let  them  get  near  the  castle!';
    }
}

// Mission: Cleaning
class HowlBegin extends MissionBegin {
    constructor() {
        super('HowlBegin');
        this.nextMission = 'Howl';
        this.instructorKey = 'instruction/instruction_spirited.png';
        this.instructorScale = 0.9;
        this.speech01 = 'Aw,  Howl  messed  up  the  castle  again!  Let\'s  help  clean  it  up!';
        this.speech02 = 'First,  let\'s  DRAG  THE  ITEMS  back  to  where  they  should  be.\n\nThen,  MOVE  THE  SPONGE  to  wipe  out  all  the  dirt.';
    }
}

// Mission: Catching Runway Kid
class TotoroBegin extends MissionBegin {
    constructor() {
        super('TotoroBegin');
        this.nextMission = 'Totoro';
        this.instructorKey = 'instruction/instruction_totoro.png';
        this.instructorScale = 0.4;
        this.speech01 = 'Uh-oh,  the  kids  run  away  again!  Could  you  help  me  get  them  back?';
        this.speech02 = 'MOVE  THE  BUTTERFLY  NET  above  them  and  CLICK  to  catch  them.\n\nKeep  your  eyes  open  or  they\'ll  slip  away  ~';
    }
}

// Mission: Mail Delivery
class KikiBegin extends MissionBegin {
    constructor() {
        super('KikiBegin');
        this.nextMission = 'Kiki';
        this.instructorKey = 'instruction/instruction_kiki.png';
        this.instructorScale = 0.9;
        this.speech01 = 'Oops!  I  lost  the  mails  in  the  strong  wind  again.\n\nCould  you  help  me  get  them  back?';
        this.speech02 = 'Just  FLY  UP  AND  DOWN  so  that  I  could  reach  the  mails.\n\nRemember  to  watch  out  for  the  birds!';
    }
}

// class MissionKey extends MissionBegin {
//     constructor() {
//         super('');
//         this.nextMission = ;
//         this.instructorKey = 'instruction/instruction_.png';
//         this.instructorScale = ;
//         this.speech01 = ;
//         this.speech02 = ;
//     }
// }