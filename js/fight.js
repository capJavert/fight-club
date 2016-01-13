// globals
var myId = 0;
var player_id = 0;
var fighter;
var player;
//var dummy;
var healthBar1;
var healthBar2;
var fightersList;
var cursors;
var kicks;
var unlocked = 0;

var ready = false;
var eurecaServer;
//this function will handle client communication with the server
var eurecaClientSetup = function() {
	//create an instance of eureca.io client
	var eurecaClient = new Eureca.Client();

	eurecaClient.ready(function (proxy) {
		eurecaServer = proxy;
	});


	//methods defined under "exports" namespace become available in the server side

	eurecaClient.exports.setId = function(id, pid)
	{
		//create() is moved here to make sure nothing is created before uniq id assignation
		myId = id;
        eurecaServer.clientsNum();
	}

	eurecaClient.exports.kill = function(id)
	{
		if (fightersList[id]) {
			fightersList[id].kill();
			//console.log('killing ', id, fightersList[id]);
		}
	}

	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
        //console.log((i==myId));
		if (i == myId) return; //this is me

		//console.log('SPAWN');
		if(player_id==1) var tnk = new Fighter(i, game, fighter, 3);
        else var tnk = new Fighter(i, game, fighter, 4);
		fightersList[i] = tnk;
	}

    eurecaClient.exports.clientsNum = function(num)
    {
        if(!player_id) {
            player_id = num;
            create();
            //unlocked = 1;
            //logo.kill();
            eurecaServer.handshake();
            ready = true;
        }

        //unlock game
        if(num==2) {
            logo.kill();
            unlocked = 1;
        }
    }

    eurecaClient.exports.end = function(i)
    {
        if(i == myId) return; //this is me

        //lock game
        unlocked = 0;
        ready = false;
        alert('WASTED');
    }

	eurecaClient.exports.updateState = function(id, state)
	{
		if (fightersList[id])  {
            fightersList[id].fighter.body.velocity.x = 0;
            fightersList[id].cursor = state;
			fightersList[id].fighter.x = state.x;
			fightersList[id].fighter.y = state.y;
			fightersList[id].update();
		}
	}

    eurecaClient.exports.updateHealth = function(id, health)
    {
        if (fightersList[id]) {
            fightersList[id].health = health;
            if(id==myId)
                healthBar1.scale.setTo(fightersList[id].health/100,1);
        }
    }
}


Fighter = function (index, game, player, frame) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		a:false,
        s:false,
        d:false
	}

	this.input = {
		left:false,
		right:false,
		up:false,
        a:false,
        s:false,
        d:false
	}

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 100;
    this.player_id = player_id;
    this.player = player;

    this.alive = true;

    if(frame==4) this.fighter = game.add.sprite(50, 0, 'fighter', frame);
    else this.fighter = game.add.sprite(650, 0, 'fighter_reverse', frame);

    this.fighter.id = index;
    this.fighter.defaultStance = frame;

    // enable physics on the player
    game.physics.arcade.enable(this.fighter);
    //game.physics.startSystem(Phaser.Physics.P2JS);

    //  Player physics properties. Give the little guy a no bounce.
    this.fighter.body.bounce.y = 0;
    this.fighter.body.gravity.y = 300;
    this.fighter.body.collideWorldBounds = true;

    this.fighter.animations.add('still', [4], 16, true);
    this.fighter.animations.add('left', [3, 2], 8, true);
    this.fighter.animations.add('right', [4, 5], 8, true);
    this.fighter.animations.add('jump-left', [2], 16, true);
    this.fighter.animations.add('jump-right', [5], 16, true);
    this.fighter.animations.add('kick-left', [0], 100, true);
    this.fighter.animations.add('kick-right', [7], 100, true);
    this.fighter.animations.add('jump-kick-left', [1], 50, true);
    this.fighter.animations.add('jump-kick-right', [6], 50, true);
    this.fighter.animations.add('block-left', [8], 50, true);
    this.fighter.animations.add('block-right', [9], 50, true);
};

Fighter.prototype.update = function() {
	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
        this.cursor.a != this.input.a ||
        this.cursor.s != this.input.s ||
        this.cursor.d != this.input.d
	);

	if (inputChanged)
	{
		//Handle input change here
		//send new values to the server
		if (this.fighter.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.fighter.x;
			this.input.y = this.fighter.y;

			eurecaServer.handleKeys(this.input);
		}
	}

	//this.cursor value is now updated by eurecaClient.exports.updateState method

    //reset velocity
    this.fighter.body.velocity.x = 0;

    //moving around

    if (this.cursor.left && unlocked)
    {
        //  Move to the left
        this.fighter.body.velocity.x = -150;

        if(this.fighter.body.velocity.y < 0 || !this.fighter.body.touching.down) this.fighter.animations.play('jump-left');
        else this.fighter.animations.play('left');
    }
    else if (this.cursor.right && unlocked)
    {
        //  Move to the right
        this.fighter.body.velocity.x = 150;

        if(this.fighter.body.velocity.y < 0 || !this.fighter.body.touching.down) this.fighter.animations.play('jump-right');
        else this.fighter.animations.play('right');
    }
    else
    {
        if (this.cursor.d && this.fighter.body.touching.down && unlocked)
        {
            // block
            if(this.fighter.defaultStance==4)this.fighter.animations.play('block-right');
            if(this.fighter.defaultStance==3)this.fighter.animations.play('block-left');
        } else {
            //  Stand still
            this.fighter.animations.stop();
            this.fighter.frame = this.fighter.defaultStance;
        }
    }

    //  diffrent animation while falling
    if (!this.fighter.body.touching.down && unlocked) {
        if(this.fighter.defaultStance==4)this.fighter.frame = 5;
        if(this.fighter.defaultStance==3)this.fighter.frame = 2;
    }

    //  Allow the player to jump if they are touching the ground.
    if (this.cursor.up && this.fighter.body.touching.down && unlocked)
    {
        this.fighter.animations.play('jump-left');

        this.fighter.body.velocity.y = -320;
    }

    // fighting

    //  hand kick
    if (this.cursor.a && this.fighter.body.touching.down && unlocked)
    {
        if(this.fighter.body.velocity.x<0) this.fighter.animations.play('kick-left');
        if(this.fighter.body.velocity.x>0) this.fighter.animations.play('kick-right');
        if(this.fighter.body.velocity.x==0) {
            if(this.fighter.defaultStance==4)this.fighter.animations.play('kick-right');
            if(this.fighter.defaultStance==3)this.fighter.animations.play('kick-left');
        }

    }

    // jump kick
    if (this.cursor.s && !this.fighter.body.touching.down && unlocked)
    {
        if(this.fighter.body.velocity.x<0) this.fighter.animations.play('jump-kick-left');
        if(this.fighter.body.velocity.x>0) this.fighter.animations.play('jump-kick-right');
        if(this.fighter.body.velocity.x==0) {
            if(this.fighter.defaultStance==4)this.fighter.animations.play('jump-kick-right');
            if(this.fighter.defaultStance==3)this.fighter.animations.play('jump-kick-left');
        }
    }
};

Fighter.prototype.kill = function() {
	this.alive = false;
	this.fighter.kill();
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'fight-club', { preload: preload, create: eurecaClientSetup, update: update, render: render });


function preload () {
    //scale and responsive
    if (game.device.desktop)
    {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.minWidth = 320;
        game.scale.minHeight = 200;
        game.scale.maxWidth = 800;
        game.scale.maxHeight = 600;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setScreenSize(true);
    }
    else
    {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.minWidth = 480;
        game.scale.minHeight = 260;
        game.scale.maxWidth = 1024;
        game.scale.maxHeight = 768;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.forceOrientation(true, false);
        game.scale.setResizeCallback(this.gameResized, this);
        game.scale.setScreenSize(true);
    }

    game.load.image('forest', '../assets/forest.png');
    game.load.image('loader', '../assets/loader.png');
    game.load.image('fight', '../assets/fight.png');
    game.load.image('win', '../assets/win.png');
    game.load.image('ground', '../assets/platform.png');
    game.load.image('health', '../assets/health.png');
    game.load.spritesheet('fighter', '../assets/fighter.png', 111, 150);
    game.load.spritesheet('fighter_reverse', '../assets/fighter_reverse.png', 111, 150);
    //game.load.physics('physicsData', '../assets/fighter.json');
}

function create () {
    //  background
    game.add.sprite(0, 0, 'forest');

    game.add.tileSprite(0, 0, 800, 600, 'forest');

    game.world.setBounds(0, 0, 800, 600);

    logo = game.add.sprite(0, 0, 'loader');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    // add fighters group
    //fighters = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 25, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(16, 4);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    //ground.scale.setTo(16, 4);

    fightersList = {};

    //choose player side
    if(player_id==1) {
        player = new Fighter(myId, game, fighter, 4);
        //health bars
        healthBar1 = platforms.create(10, 10, 'health');
        healthBar2 = platforms.create(635, 10, 'health');
    } else {
        player = new Fighter(myId, game, fighter, 3);
        //health bars
        healthBar1 = platforms.create(635, 10, 'health');
        healthBar2 = platforms.create(10, 10, 'health');
    }

	fightersList[myId] = player;
	fighter = player.fighter;

    // spawn dummy
    //dummy = new Fighter(-1, game, fighter, 3);
    //dummy.fighter.x = 325;
    //dummy.fighter.y = 0;

    cursors = game.input.keyboard.createCursorKeys();
    kicks = {
        a: game.input.keyboard.addKey(Phaser.Keyboard.A),
        s: game.input.keyboard.addKey(Phaser.Keyboard.S),
        d: game.input.keyboard.addKey(Phaser.Keyboard.D)
    };
}

var c=1;
function update () {
	//do not update if client not ready
	if (!ready) return;
    eurecaServer.clientsNum();

	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
    player.input.a = kicks.a.isDown;
    player.input.s = kicks.s.isDown;
    player.input.d = kicks.d.isDown;

    game.physics.arcade.collide(fighter, platforms);
    //game.physics.arcade.collide(dummy.fighter, platforms);
    //dummy.fighter.body.immovable = true;

    /*if (game.physics.arcade.overlap(fighter, dummy.fighter)) {
        game.physics.arcade.collide(fighter, dummy.fighter);

        if (player.input.a && fighter.body.touching.down && (dummy.fighter.body.velocity.x != 0 || dummy.fighter.body.velocity.y != 0)) {
            dummy.health -= 5;
            console.log(dummy.health);
        }
        if (player.input.s && !fighter.body.touching.down) {
            dummy.health -= 2.5;
            console.log(dummy.health);
        }
    }*/

    //remove ready fight screen if player is touching ground & has set id
    //needs to be added here

    for (var i in fightersList) {
		if (!fightersList[i]) continue;
        var targetFighter = fightersList[i].fighter;
        //collision
        game.physics.arcade.collide(targetFighter, platforms);

        //check if hit happend
        if (game.physics.arcade.overlap(fighter, targetFighter) && i!=myId) {
            if(targetFighter.body.x > fighter.body.x && targetFighter.x < fighter.body.x+110)
                game.physics.arcade.collide(fighter, targetFighter);

            if (player.input.a && fighter.body.touching.down && !fightersList[i].cursor.d) {
                fightersList[i].health -= 1;
                console.log(fightersList[i].health);
            }
            if (player.input.s && !fighter.body.touching.down) {
                if(fightersList[i].cursor.d)
                    fightersList[i].health -= 0.5;
                else
                    fightersList[i].health -= 1.5;
                console.log(fightersList[i].health);
            }

            //resize healthbar
            //healthBar2.scale.setTo(fightersList[i].health/100,1);

            if(fightersList[i].health<=0)
                fightersList[i].alive = 0;
        }

        //send health data

        if(i!=myId) {//console.log(fightersList[i].health);
            healthBar2.scale.setTo(fightersList[i].health/100,1);
            eurecaServer.handleHealth(i, fightersList[i].health);
        }

        if (fightersList[i].alive)
        {
            fightersList[i].update();
        } else {
            //lock game
            win = game.add.sprite(0, 0, 'win');
            unlocked = 0;
            fighter.animations.stop();
            fighter.frame = fighter.defaultStance;
            ready = false;
            eurecaServer.win(myId);
        }
    }
}

function bulletHitPlayer (fighter, bullet) {

    bullet.kill();
}

function render () {}

