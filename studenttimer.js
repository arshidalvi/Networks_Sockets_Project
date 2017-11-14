var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');
var app = express();

// Socket.io server listens to our app
var ioProm = require('express-socket.io');
var server = ioProm.init(app);


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));
app.all('/*', function (req, res, next) {
    console.log("URL:: " + req.path);
    console.log("Method:: " + req.method);
    next();
});

app.get('/*', function (req, res, next) {
    res.sendFile(__dirname + '/public/index.html');
});

var port = 2333;
server.listen(port, function () {
    console.log('server listening on port ' + port);
});


// Send current time to all connected clients
function sendTime() {
    io.emit('time', {
        time: new Date()
            .toJSON()
    });
}

// Send current time every 10 secs
//setInterval(sendTime, 10000);

ioProm.then(function (io) {
    var teachid = null;
    var studid = null;
    var teachlogin = null;
    var studonline = {};
    // Emit welcome message on connection
    io.on('connection', function (socket) {
        // Use socket to communicate with this particular client only,
        // sending it it's own id
        socket.on('studlogin', function (msg) {
            socket.on('studid', function (msg) {
                console.log("got studid" + msg.studid);
                studid = msg.studid;
            });
        });

        socket.on('studverify', function (msg) {
            socket.on('studonline', function (msg) {
                var teachlogin = msg.teachlogin;
                if (!studonline[teachlogin]) {
                    studonline[teachlogin] = [];

                }
                studonline[teachlogin].push({
                    id: msg.id,
                    checkin: msg.checkin
                });
            });
            socket.emit('teachid', {
                teachid: teachid,
                studid: studid,
                teachlogin: teachlogin
            });
        });

        socket.on('teachlogin', function (msg) {
            socket.on('teachid', function (msg) {
                console.log("got Message on teachid chan");
                console.log(msg.teachid);
                teachid = msg.teachid;
                teachlogin = msg.teachlogin;
            });
            socket.on('liststudents', function (msg) {
                var str = "";
                var studlist = studonline[msg.teachlogin];
                if (studlist) {
                    for (j = 0; j < studlist.length; j++) {
                        str += studlist[j].id + "," + studlist[j].checkin + "%";
                    }
                    console.log("studonline " + str);
                    socket.emit('studonline', {
                        list: str
                    });
                }

            });
        });
    });
});
