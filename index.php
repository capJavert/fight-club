<!DOCTYPE HTML>
<html>
<head>
    <title>Project - Rhea</title>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1 maximum-scale=1 user-scalable=0 minimal-ui" />
    <link rel="stylesheet" href="css/main.css" type="text/css" charset="utf-8" />
    <?php
        //$path = '../phaser';
        //require('../phaser/build/config.php');
    ?>

    <script src="js/phaser.min.js"></script>
    <script src="src/Boot.js"></script>
    <script src="src/Preload.js"></script>
    <script src="src/Player.js"></script>
    <script src="src/Monster.js"></script>
    <script src="src/Game.js"></script>
</head>
<body>
    <div id="game"></div>
    <div id="orientation"></div>

    <script type="text/javascript">

    (function () {

        var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

        game.state.add('Boot', Rhea.Boot);
        game.state.add('Preloader', Rhea.Preloader);
        //game.state.add('Player', Rhea.Player);
        game.state.add('Game', Rhea.Game);

        game.state.start('Boot');

    })();
    </script>
</body>
</html>