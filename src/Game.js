var ready = false;
var cursors;
var player1;
var player2;

Rhea.Game = function (game) {
    this.platforms;
    this.game = game;
};

Rhea.Game.prototype = {
    create: function (game) {
        //  A simple background for our game
        this.add.sprite(0, 0, 'sky');

        this.add.tileSprite(0, 0, 800, 600, 'sky');

        this.world.setBounds(0, 0, 800, 600);

        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = this.add.group();

        //  We will enable physics for any object that is created in this group
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, this.world.height - 64, 'ground');

        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        ground.scale.setTo(16, 4);

        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;

        //  Now let's create two ledges
        var ledge = platforms.create(400, 400, 'ground');

        ledge.body.immovable = true;

        ledge = platforms.create(-150, 250, 'ground');

        ledge.body.immovable = true;

        Rhea.eurecaServer.clientsNum(Rhea.myId).onReady(function(r){ Rhea.playersNum = r;
        console.log(Rhea.playersNum);

        //create player
        if (Rhea.playersNum == 1) {
            player1 = new Rhea.Player(game, 150, 450);
            game.add.existing(player1);

            player2 = new Rhea.Player(game, 600, 450);
            game.add.existing(player2);

            Rhea.newInput.x = 150;
            Rhea.newInput.y = 450;
        } else {
            player1 = new Rhea.Player(game, 600, 450);
            game.add.existing(player1);

            player2 = new Rhea.Player(game, 150, 450);
            game.add.existing(player2);

            Rhea.newInput.x = 600;
            Rhea.newInput.y = 450;
        }

        ready = true;
        });

        cursors = this.input.keyboard.createCursorKeys();
        //this.camera.follow(player);
    },

    update: function (game) {
        //do not update if client not ready
        if(!ready) return;

        //console.log(Rhea.playerList.length);

        /*for (var i in playerList) {
                if (!playerList[i].alive)
                {
                    playerList[i].kill();
                }
        };*/

        /*var inputChanged = (
        cursors.left != this.input.left ||
        cursors.right != this.input.right ||
        cursors.up != this.input.up
        );*/


        //if (player1.x != Rhea.newInput.x || Math.round(player1.y) != Rhea.newInput.y)
        //{
            //console.log(player1.y+'|'+Rhea.newInput.y);
            //Handle input change here
            //send new values to the server
            Rhea.newInput.x = player1.x;
            Rhea.newInput.y = player1.y;
            Rhea.newInput.velocityX = player1.body.velocity.x;
            Rhea.newInput.velocityY = player1.body.velocity.y;

            Rhea.eurecaServer.handleKeys(Rhea.newInput);
        //

        //  Collision rules
        this.physics.arcade.collide(player1, platforms);
        this.physics.arcade.collide(player2, platforms);

        //  Reset the players velocity (movement)
        player1.body.velocity.x = 0;
        player2.body.velocity.x = 0;

        if(Rhea.newState.x != -1 || Rhea.newState.y != -1) {
            //if(Rhea.newState.x != player2.x || Rhea.newState.y != player2.y) {
                player2.x = Rhea.newState.x;
                player2.y = Rhea.newState.y;
                player2.body.velocity.x = Rhea.newState.velocityX;
                player2.body.velocity.y = Rhea.newState.velocityY;

                if(Rhea.newState.velocityX > 0) player2.animations.play('right');
                else if(Rhea.newState.velocityX < 0) player2.animations.play('left');

                //player2.animations.stop();
        }

        if (cursors.left.isDown)
        {
            //  Move to the left
            player1.body.velocity.x = -150;

            player1.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player1.body.velocity.x = 150;

            player1.animations.play('right');
        }
        else
        {
            //  Stand still
            player1.animations.stop();
            player2.animations.stop();

            player1.frame = 4;
            player2.frame = 4;
        }

        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player1.body.touching.down)
        {
            player1.body.velocity.y = -320;
        }
    }
};