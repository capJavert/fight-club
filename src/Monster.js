Rhea.Monster = function (game, x, y) {
    // The player and its settings
    //console.log(height);
    Phaser.Sprite.call(this, game, x, y, 'monster');

    //  We need to enable physics on the player

    this.physics = game.physics.arcade;

    this.physics.enable(this);

    //  Monster physics properties. Give the little guy a slight bounce.
    this.body.bounce.y = 0.2;
    this.body.gravity.y = 300;
    this.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    this.animations.add('left', [0, 1], 10, true);
    this.animations.add('right', [2, 3], 10, true);

    return this;
};

Rhea.Monster.prototype = Object.create(Phaser.Sprite.prototype);
Rhea.Monster.prototype.constructor = Rhea.Monster;