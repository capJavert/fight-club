Rhea = {
    /* Here we've just got some global level vars that persist regardless of State swaps */
    score: 0,

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
    music: null,

    /* Your game can check Rhea.orientated in internal loops to know if it should pause or not */
    orientated: false,

    playerList: [],

    myId: 0,

    newPlayer: false,

    newInput: {x:-1, y:-1, velocityX: 0, velocityY: 0},

    newState: {x:-1, y:-1, velocityX: 0, velocityY: 0},

    playersNum: -1,

    eurecaServer: null
};

Rhea.Boot = function (game) {
};

Rhea.Boot.prototype = {

    preload: function () {

        //this.load.image('preloaderBar', 'images/preload.png');

    },

    create: function () {
        // this.stage.smoothed = false;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.input.maxPointers = 1;

        // this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 320;
            this.scale.minHeight = 200;
            this.scale.maxWidth = 800;
            this.scale.maxHeight = 600;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.setScreenSize(true);
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 480;
            this.scale.minHeight = 260;
            this.scale.maxWidth = 1024;
            this.scale.maxHeight = 768;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            this.scale.setScreenSize(true);
        }

        this.state.start('Preloader');

    },

    gameResized: function (width, height) {
    },

    enterIncorrectOrientation: function () {

        Rhea.orientated = false;

        document.getElementById('orientation').style.display = 'block';

    },

    leaveIncorrectOrientation: function () {

        Rhea.orientated = true;

        document.getElementById('orientation').style.display = 'none';

    }

};
