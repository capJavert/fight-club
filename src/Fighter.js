Fighter = function (index, game/*, player*/) {
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
    this.fighter =  game.add.sprite(32, 'dude');
    //this.player = player;

    this.alive = true;
    this.fighter.id = index;

    this.physics = game.physics.arcade;

    this.physics.enableBody(this.fighter);

    //this.fighter.body.immovable = false;
    this.fighter.body.collideWorldBounds = true;
    this.fighter.body.bounce.setTo(0, 0);

    return this;
};