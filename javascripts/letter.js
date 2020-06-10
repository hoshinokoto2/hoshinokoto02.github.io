class Letter extends Phaser.Scene {
    constructor(key) {
        super({key: "Letter"});
    }

    // preload() {
    //     this.load.multiatlas('sprites', '../assets/images/sprites.json', '../assets/images');
    //     this.load.audio('letterBgMusic', '../assets/sounds/totoro_letterBgMusic_Yokatane.mp3');
    // }

    create() {
        // Set up camera
        this.cameras.main.setBounds(0, 0, config.width, config.height * 3.3);
        this.cameras.main.fadeIn(800);

        // Play background music
        this.sound.play('letterBgMusic');

        // Show words
        const words = 'CONGRATS!!  You\'ve  found  the  secret  letter!!\n\n' +
                        'Hmm...  what  would  the  secret  message  be......?\n\n' +
                        '\n\n\n\n\n\n\n\n' +
                        'Dear  Mom,\n\n' +
                        'Sorry  for  giving  you  the  gift  this  late!\n\n' +
                        'I  started  preparing  this  game  right  after  brother\'s  birthday,\n\n' +
                        'but  instead  of  making  a  small  game  just  to  make  it  on  time,\n\n' +
                        'I  decided  to  make  it  bigger  and  prettier  so  that  you  could  enjoy  it  more  : )\n\n' +
                        '\n\n' +
                        'The  missions  in  the  game  is  to  show  how  grateful  we  are  for  all  the  things  you\'ve  done  for  us.\n\n' + 
                        'Thank  you  for  taking  care  of  us  when  we  were  running  around  as  kids.\n\n' +
                        'Thank  you  for  riding  us  to  school  and  anywhere  we  want  to  go  without  any  complaints.\n\n' +
                        'Thank  you  for  fighting  over  the  bugs  so  diligently  that  we  never  have  to  worry  about  them.\n\n' +
                        'Thank  you  for  cleaning  up  the  house  so  that  we  could  live  comfortably.\n\n' +
                        'Thank  you  for  making  delicious  meals  and  let  us  grow  up  healthily  and  happily.\n\n'+
                        '\n\n' +
                        'Of  course  there  are  much  more  things  that  we  should  thank  you  for.\n\n' +
                        'It\'s  my  bad  that  I  couldn\'t  make  them  all  into  the  game  >"<\n\n' + 
                        'However,  I\'ve  tried  my  best  to  create  the  game  with  characters  from  Ghibli  Studio,\n\n' +
                        'which  I  know  you  like  very  much  ^ ^\n\n' +
                        'Really  hope  you  would  love  this  special  gift  >///< \n\n' +
                        'And  even  though  it\'s  been  one  month,  I  still  need  to  say  again:\n\n' +
                        '\n\n' +
                        'HAPPY  MOTHER\'S  DAY  <3\n\n' +
                        '\n\n' +
                        'Love,\n\n' +
                        'Your  daughter  Angela\n\n' +
                        '2020.06.10';
        this.add.text(100, 250, words, { fill: '#fff', fontSize: '20px', fontFamily: '"Iceberg", cursive' }).setOrigin(0,0);

        // Totoro fly down
        const totoroFly = this.add.image(800, -100, 'sprites', 'totoro/totoro_fly.png').setScale(.5).setAngle(10);
        this.tweens.add({
            targets: totoroFly,
            angle: 30,
            repeat: -1,
            yoyo: true,
            duration: 1250
        });
        this.tweens.add({
            targets: totoroFly,
            y: config.height * 3.2,
            duration: 75000,
            onComplete: () => {
                this.cameras.main.fade(800,0);
                this.time.addEvent({
                    delay: 800,
                    callback: () => {
                        this.sound.stopAll();
                        this.scene.stop('Letter');
                        this.scene.start('Menu');
                    }
                });
            }
        })
        this.cameras.main.startFollow(totoroFly, true, 0.5, 0.5);
    }
}