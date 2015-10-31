Rhea.Player = function (game, x, y, start) {
    // The player and its settings
    //console.log(height);
    Phaser.Sprite.call(this, game, x, y, 'fighter', start);

    //  We need to enable physics on the player

    this.physics = game.physics.arcade;

    this.physics.enable(this);

    //  Player physics properties
    this.body.bounce.y = 0;
    this.body.gravity.y = 300;
    this.body.collideWorldBounds = true;

    this.alive = true;

    //  Our two animations, walking left and right.
    //this.animations.add('left', [0, 1, 2, 3], 10, true);
    //this.animations.add('right', [5, 6, 7, 8], 10, true);

    this.animations.add('left', [3, 2], 10, true);
    this.animations.add('right', [4, 5], 10, true);
    this.animations.add('jump-left', [2], 10, true);
    this.animations.add('jump-right', [5], 10, true);
    this.animations.add('kick-left', [3, 0], 10, true);
    this.animations.add('kick-right', [4, 7], 10, true);
    this.animations.add('jump-kick-left', [3, 2, 1], 10, true);
    this.animations.add('jump-kick-right', [4, 5, 6], 10, true);

    return this;
};

Rhea.Player.prototype = Object.create(Phaser.Sprite.prototype);
Rhea.Player.prototype.constructor = Rhea.Player;