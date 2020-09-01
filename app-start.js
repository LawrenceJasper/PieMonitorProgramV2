let express = require('express');
let moment = require('moment');
let io;
let app = express();
let net = require('net');
let socket = require('socket.io');
let serverNet = net.createServer();
let server;
let holder = [];
let hold;
let myIndex;
let counter0 = 0;
let counter2 = 1;
let counter3 = 0;
let processArray =[];
let ipObjectArray =[];
let boolean = false;
let dropletTimer = 900;


        function startNetServer() {
            serverNet.listen(1234, '159.203.124.198', function () {
                console.log('NetServer Started... ')



                serverNet.on('connection', (socket) => {
                    console.log('New Connection..');
                    socket.write(JSON.stringify({type: 'connect', data:socket.remotePort}));


                    socket.on('end', function () {
                        console.log('Closing connection with the client');
                        io.emit('html', JSON.stringify({type: 'status', data: 'newred.png'}))
                        checkPort(socket.remotePort);
                        io.emit('html', JSON.stringify({type: 'counterAdjust'}))


                    });

                    socket.on('error', function (err) {
                        //console.log(`Error: ${err}`);

                    });
                    socket.on('data', function (data) {
                        try {
                            let msg = JSON.parse(data);

                            switch (msg.type) {

                                case 'cack':
                                    console.log('msg.data ' + msg.data.name)
                                    console.log('hold ' + hold)
                                    if(msg.data.name === hold){
                                        console.log('right before')
                                        clearInterval(holder[myIndex])
                                        clearInterval(holder[myIndex])
                                        console.log('right after')
                                        boolean = false
                                        console.log('interval cleared')
                                        io.emit('html', JSON.stringify({type: 'status', data: 'newgreen.png'}))
                                    }
                                    ipObjectArray.push(msg.ip)

                                    io.emit('html', (JSON.stringify({type: 'insertThem', data: msg.data})));//


                                    setInterval(resendFunc, dropletTimer);//keep sending every 2 seconds.

                                    break;

                                case 'updateServer':

                                    io.emit('html', (JSON.stringify({type: 'meetup', data: msg.data})));
                                    counter3++
                                    if(counter3 > 3){
                                        io.emit('html', JSON.stringify({type: 'status', data: 'syellow.png'}))
                                    }else if(counter3 > 6){
                                        io.emit('html', JSON.stringify({type: 'status', data: 'newred.png'}))
                                    }

                                    break;
                                default:
                                    break;
                            }
                            ;
                        } catch (ex) {
                            console.log(ex.message);
                        }
                        ;


                    });

                    function resendFunc() {
                        socket.write(JSON.stringify({type: 'resend', data: socket.remotePort}));//asks the client for constant updates...
                    }
                });
            });
        };

        function startIOServer() {
            server = app.listen(2222, function () {
                console.log('Starting Server...');

                app.use(express.static('public')); // to use public folder

                io = socket(server); // same as io = socket.app.listen

                io.on('connection', (socket) => {//start of socket.io

                    console.log('Socket Connected...' + socket.id);

                    io.emit('html', JSON.stringify({type: 'start'}));

                    io.emit('html', JSON.stringify({type: 'status', data: 'newgreen.png'}));

                    counter2 = 1;

                    socket.on('makeArray', function (data) {


                        let msg = JSON.parse(data);

                        switch (msg.type) {
                            case 'make': // should fire every three seconds...
                                counter3 = 0;
                                let check = processArray.findIndex(element => element.name === msg.data.name);

                                if(counter2 === msg.htmlCounter && check === -1){
                                    processArray.push(msg.data)
                                    counter2++
                                    io.emit('html', JSON.stringify({type: 'updatePage', data: processArray}));
                                }else{
                                     let foundIndex = processArray.findIndex(element => element.name === msg.data.name);//this is saying that if an element in the array equals the msg.data object, then update
                                     processArray[foundIndex] = msg.data;
                                     io.emit('html', JSON.stringify({type: 'updatePage', data: processArray}));
                                };

                                break;
                            case 'here':
                                console.log('name, msg.data: ' + msg.data)

                                hold = msg.data;
                                myIndex = msg.index
                                console.log('name, hold ' + hold)
                                break;
                            default:
                                break;
                        }
                        ;


                    });
                });


            });//end Server
        };//end func


        function downTimeMaker(index) {

            let name = processArray[index]['name']
            let newObj = {
                name: name,
                uptime: counter0,
                disk: '',
                memory: '',
                loader: [0, 0, 0],
                networkIn: {
                    eth0: [{
                        address: 'Droplet Down',
                        mac: '',
                    }]
                }
            };


            counter0++

            processArray.splice(index, 1, newObj);
            console.log(name)
            console.log('splice done')
            if(boolean === false){
                console.log('name: ' + name)
                io.emit('html', JSON.stringify({type: 'reRoute', data: name, index: index}))
                boolean = true
            }

        };

        function checkPort(socket) {// dynamically works depending on how many ip addresses and ports are added...
            let x = 0;
            while(x < processArray.length){
                if(processArray[x].socketID === socket){
                   holder[x]= setInterval(downTimeMaker, 1000, x)
                    x++;
                }else{
                    x++;
                };

            };

        };


startIOServer()
startNetServer()
