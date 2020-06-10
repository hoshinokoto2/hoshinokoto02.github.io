const gameState = {
    active: false,
    meat: 0,
    meatBest: 0,
    bugCaught: 0,
    bugTime: 0,
    bugBest: 0,
    bugSoundCount: 0,
    totoroTime: 0,
    totoroBest: 0,
    mailCount: 0,
    mailBest: 0
};

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 550,
    backgroundColor: "#000",
    parent: "theGame",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    // Scene Order:
    scene: [
        Start,
        Menu, 
        MononokeBegin, Mononoke, MononokeFail, MononokeSuccess,
        NausicaaBegin, Nausicaa, NausicaaFail, NausicaaSuccess,
        HowlBegin, Howl, HowlSuccess,
        TotoroBegin, Totoro, TotoroSuccess,
        KikiBegin, Kiki, KikiFail, KikiSuccess,
        Letter
    ]
};

const game = new Phaser.Game(config);