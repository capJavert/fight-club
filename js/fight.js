// globals
var myId=0;
var fighter;
var player;
var fightersList;
var cursors;

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

	eurecaClient.exports.setId = function(id)
	{
		//create() is moved here to make sure nothing is created before uniq id assignation
		myId = id;
		create();
		eurecaServer.handshake();
		ready = true;
	}

	eurecaClient.exports.kill = function(id)
	{
		if (fightersList[id]) {
			fightersList[id].kill();
			console.log('killing ', id, fightersList[id]);
		}
	}

	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{

		if (i == myId) return; //this is me

		console.log('SPAWN');
		var tnk = new Fighter(i, game, fighter);
		fightersList[i] = tnk;
	}

	eurecaClient.exports.updateState = function(id, state)
	{
		if (fightersList[id])  {
			fightersList[id].cursor = state;
			fightersList[id].fighter.x = state.x;
			fightersList[id].fighter.y = state.y;
			fightersList[id].update();
		}
	}
}


Fighter = function (index, game, player) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
		fire:false
	}

	this.input = {
		left:false,
		right:false,
		up:false,
		fire:false
	}

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 30;
    this.player = player;

    this.alive = true;

    this.fighter = game.add.sprite(x, y, 'fighter', 4);
    this.fighter.id = index;

    // enable physics on the player
    game.physics.arcade.enable(this.fighter);

    //  Player physics properties. Give the little guy a no bounce.
    this.fighter.body.bounce.y = 0;
    this.fighter.body.gravity.y = 300;
    this.fighter.body.collideWorldBounds = true;

    this.fighter.animations.add('still', [4], 10, true);
    this.fighter.animations.add('left', [3, 2], 10, true);
    this.fighter.animations.add('right', [4, 5], 10, true);
    this.fighter.animations.add('jump-left', [2], 10, true);
    this.fighter.animations.add('jump-right', [5], 10, true);
    this.fighter.animations.add('kick-left', [3, 0], 10, true);
    this.fighter.animations.add('kick-right', [4, 7], 10, true);
    this.fighter.animations.add('jump-kick-left', [3, 2, 1], 10, true);
    this.fighter.animations.add('jump-kick-right', [4, 5, 6], 10, true);
};

Fighter.prototype.update = function() {

	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.fire != this.input.fire
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

    if (this.cursor.left)
    {
        //  Move to the left
        this.fighter.body.velocity.x = -150;

        if(this.fighter.body.velocity.y < 0 || !this.fighter.body.touching.down) this.fighter.animations.play('jump-left');
        else this.fighter.animations.play('left');
    }
    else if (this.cursor.right)
    {
        //  Move to the right
        this.fighter.body.velocity.x = 150;

        if(this.fighter.body.velocity.y < 0 || !this.fighter.body.touching.down) this.fighter.animations.play('jump-right');
        else this.fighter.animations.play('right');
    }
    else
    {
        //  Stand still
        this.fighter.animations.stop();
        this.fighter.frame = 4;
    }

    //  diffrent animation while falling
    if (!this.fighter.body.touching.down) {
        this.fighter.animations.play('jump-right');
    }

    //  Allow the player to jump if they are touching the ground.
    if (this.cursor.up && this.fighter.body.touching.down)
    {
        this.fighter.animations.play('jump-left');

        this.fighter.body.velocity.y = -320;
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

    game.load.image('sky', '../assets/sky.png');
    game.load.image('ground', '../assets/platform.png');
    game.load.spritesheet('fighter', '../assets/fighter.png', 52, 70);
}



function create () {
    //  background
    game.add.sprite(0, 0, 'sky');

    game.add.tileSprite(0, 0, 800, 600, 'sky');

    game.world.setBounds(0, 0, 800, 600);

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(16, 4);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');

    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');

    ledge.body.immovable = true;

    fightersList = {};

	player = new Fighter(myId, game, fighter);
	fightersList[myId] = player;
	fighter = player.fighter;
	fighter.x=40;
	fighter.y=450;

    cursors = game.input.keyboard.createCursorKeys();
}

function update () {
	//do not update if client not ready
	if (!ready) return;

	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	//player.input.fire = game.input.activePointer.isDown;

    game.physics.arcade.collide(fighter, platforms);
    //game.physics.arcade.collide(player, Rhea.player2);
	
    for (var i in fightersList)
    {
		if (!fightersList[i]) continue;
		var curBullets = fightersList[i].bullets;
		var curFighter = fightersList[i].fighter;
		for (var j in fightersList)
		{
			if (!fightersList[j]) continue;
			if (j!=i) 
			{
			
				var targetFighter = fightersList[j].fighter;

                game.physics.arcade.collide(targetFighter, platforms);
			
			}
			if (fightersList[j].alive)
			{
				fightersList[j].update();
			}			
		}
    }
}

function bulletHitPlayer (fighter, bullet) {

    bullet.kill();
}

function render () {}

