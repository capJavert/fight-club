var express = require('express')
    , app = express(app)
    , server = require('http').createServer(app);

// serve static files from the current directory
app.use(express.static(__dirname));

var clientsNum = 0;

//we'll keep clients data here
var clients = {};

//get EurecaServer class
var Eureca = require('eureca.io');

//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setId', 'spawnEnemy', 'updateState', 'handshake', 'updatedClient', 'clientsNum']});

//attach eureca.io to our http server
eurecaServer.attach(server);

//eureca.io provides events to detect clients connect/disconnect

//detect client connection
eurecaServer.onConnect(function (conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);

    //register the client
    clients[conn.id] = {id:conn.id, remote:remote}

    clientsNum++;

    //here we call setId (defined in the client side)
    remote.setId(conn.id);
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {
    console.log('Client disconnected ', conn.id);

    //var removeId = clients[conn.id].id;

    var remote = clients[conn.id].remote;

    //remote.kill(conn.id);

    delete clients[conn.id];
    if(clientsNum > 0) clientsNum--;
});

eurecaServer.exports.clientsNum = function(id)
{
    return clientsNum;
};

eurecaServer.exports.handshake = function()
{
    //var conn = this.connection;
    for (var c in clients)
    {
        var remote = clients[c].remote;
        for (var cc in clients)
        {
            remote.spawnEnemy(clients[cc].id);
        }
    }
};

eurecaServer.exports.handleKeys = function (keys) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients)
    {
        var remote = clients[c].remote;
        remote.updateState(updatedClient.id, keys);

        //keep last known state so we can send it to new connected clients
        clients[c].laststate = keys;
    }
}

server.listen(8000);