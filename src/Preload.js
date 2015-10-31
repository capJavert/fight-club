Rhea.Preloader = function (game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

var eurecaClientSetup = function () {
    var eurecaClient = new Eureca.Client();

    eurecaClient.ready(function (proxy) {
        Rhea.eurecaServer = proxy;

        //methods defined under "exports" namespace become available in the server side
        eurecaClient.exports.setId = function(id)
        {
            //create() is moved here to make sure nothing is created before uniq id assignation
            Rhea.myId = id;
            //create();
            //eurecaServer.handshake();
            newPlayer = true;
            //ready = true;
        };

        eurecaClient.exports.kill = function(id)
        {
            if (Rhea.playerList[id]) {
                Rhea.playerList[id].kill();

                //console.log('killing ', id, tanksList[id]);
            }
        };

        eurecaClient.exports.spawnEnemy = function(i)
        {
            //if (i == Rhea.myId) return; //this is me

            console.log(i);
            Rhea.playerList[i] = i;
        };

        eurecaClient.exports.updateState = function(id, state)
        {
            if(Rhea.myId != id) {
                Rhea.newState.x = state.x;
                Rhea.newState.y = state.y;
                Rhea.newState.velocityX = state.velocityX;
                Rhea.newState.velocityY = state.velocityY;
            }
        };

        eurecaClient.exports.clientsNum = function(pnum)
        {

        };
    });
};

Rhea.Preloader.prototype = {

    preload: function () {
        //this.preloadBar = this.add.sprite(0, 100, 'preloaderBar');

        //this.load.setPreloadSprite(this.preloadBar);

        this.load.image('sky', '../assets/sky.png');
        this.load.image('ground', '../assets/platform.png');
        this.load.image('star', '../assets/star.png');
        this.load.spritesheet('dude', '../assets/dude.png', 32, 48);
        this.load.spritesheet('fighter', '../assets/fighter.png', 52, 70);
        this.load.spritesheet('monster', '../assets/baddie.png', 32, 32);

        eurecaClientSetup();
    },

    create: function () {
        this.state.start('Game');
    },

    update: function () {

        // if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
        // {
        // this.ready = true;
        // this.state.start('MainMenu');
        // }
    }

};