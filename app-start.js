let express = require('express');
let moment = require('moment');
let io;
let app = express();
let net = require('net');
let socket = require('socket.io');
let isPortReachable = require('is-port-reachable');
let serverNet = net.createServer();
let server;
let mainCounter = 0;
let counter0 = 0;
let counter2 = 1;
let counter3 = 0;
let counter4 = 0;
let counter5 = 0;
let processArray =[];
let ipObjectArray =[];
let msg;//might not need
let dropletTimer = 900;
let downTimeTimer = 1000;


        function startNetServer() {
            serverNet.listen(1234, '159.203.124.198', function () {
                console.log('NetServer Started... ')
                //checkPort();


                serverNet.on('connection', (socket) => {
                    console.log('New Connection..');
                    socket.write(JSON.stringify({type: 'connect'}));


                    socket.on('end', function () {
                        console.log('Closing connection with the client');


                    });
                    socket.on('error', function (err) {
                        console.log(`Error: ${err}`);
                    });
                    socket.on('data', function (data) {
                        try {
                            let msg = JSON.parse(data);

                            switch (msg.type) {

                                case 'cack':
                                    console.log('made it to cack...')
                                    ipObjectArray.push(msg.ip)
                                    console.log('cack, msg.data: ' + JSON.stringify(msg.data))//sends the correct information
                                    io.emit('html', (JSON.stringify({type: 'insertThem', data: msg.data})));//


                                    setInterval(resendFunc, dropletTimer);//keep sending every 2 seconds.

                                    break;
                                case 'updateServer':
                                    counter3 = 0;//might not need
                                    //console.log('update Server info'+JSON.stringify(msg.data))
                                    io.emit('html', (JSON.stringify({type: 'meetup', data: msg.data})));

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
                        socket.write(JSON.stringify({type: 'resend'}));//asks the client for constant updates...
                    }
                });
            });
        };

// function resendFunc(){
//     socket.write(JSON.stringify({type: 'resend'}));//asks the server for constant updates...
// }

        function startIOServer() {
            server = app.listen(2222, function () {
                console.log('Starting Server...');

                app.use(express.static('public')); // to use public folder

                io = socket(server); // same as io = socket.app.listen

                io.on('connection', (socket) => {//start of socket.io

                    console.log('Socket Connected...' + socket.id);

                    io.emit('html', JSON.stringify({type: 'start'}));

                    io.emit('html', JSON.stringify({type: 'status', data: 'newgreen.png'}));

                    //mainCounter = 0;
                    counter2 = 1;
                   // console.log('counter2 ' + counter2 + 'mainCounter ' + mainCounter)
                    //startNetServer();
                    //checkPort();

                    socket.on('makeArray', function (data) {


                        let msg = JSON.parse(data);

                        switch (msg.type) {
                            case 'make': // should fire every three seconds...
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
                            case 'resetCount':
                                counter5 = 0;
                                break;

                            case 'resetCount2':
                                counter2 = 0;
                                break;

                            case 'nameFind':
                                let num = msg.data2
                                DropletDownNameFinder(num);
                                break;

                            case 'resetCells':
                                io.emit('html', JSON.stringify({type: 'insertThem'}));
                                break;

                            case 'timer':
                                DropletDownTimer(msg.number);
                                break;

                            case 'down':

                            function downTimeFunc() {
                                downTime++;
                                io.emit('html', JSON.stringify({
                                    type: 'downTime',
                                    cellData: msg.cell2,
                                    downTime1: downTime
                                }));

                            };
                                setInterval(downTimeFunc, downTimeTimer);
                                break;

                            case 'adjustArray':
                                //used to have object here
                                setInterval(downTimeMaker, 1000, msg.index, msg.data);


                                break;
                            case 'receive':
                                io.emit('html', JSON.stringify({type: 'updatePage', timer: msg.timer}));
                                break;
                            default:
                                break;
                        }
                        ;


                    });
                });


            });//end Server
        };//end func





///functions that I need to take a new look at...


        function createIpObjectArray(ipInfo) {
            ipObjectArray.push(ipInfo)
        };

        function downTimeMaker(data, index) {
            let name = processArray[index]['name']
            let newObj = {
                id: processArray[index]['id'],
                name: name,
                uptime: counter0,
                disk: '',//
                memory: '',
                loader: [0, 0, 0],
                networkIn: {
                    eth0: [{
                        address: 'Droplet Down',
                        mac: '',//
                    }]
                }
            };


            counter0++

            processArray.splice(index, 1, newObj);
            console.log(name)
            console.log('process Array: ' + JSON.stringify(processArray[0].name))
            console.log('process Array: ' + JSON.stringify(processArray[1].name))
            console.log('process Array: ' + JSON.stringify(processArray[2].name))
            console.log('process Array: ' + JSON.stringify(processArray[3].name))
            console.log('splice done')
        };

        function checkPort() {// dynamically works depending on how many ip addresses and ports are added...
            (async () => {
                let x = 0;
                let resultArray = []
                let makeClient = []
                let clientOFF = [];
                console.log('ip array length: ' + ipObjectArray.length)
                console.log(JSON.stringify(ipObjectArray))
                while (x < ipObjectArray.length) {//while x is less then the length if my ip array
                    resultArray[x] = await isPortReachable(ipObjectArray[x].port, {host: ipObjectArray[x].ip});//check if online
                    console.log(JSON.stringify(ipObjectArray[x]) + 'result: ' + JSON.stringify(resultArray[x]))
                    if (resultArray[x] === true) {//result, if true
                        io.emit('html', JSON.stringify({type: 'insertThem'}))
                        x++;//count
                    } else {
                        clientOFF.push(resultArray[x]);
                        x++;
                    }
                    ;


                }
                ;


            })();
        };

        function DropletDownTimer(x) {
            let count = 0;
            while (count < processArray.length) {
                if (ipObjectArray[x].ip === processArray[count].networkIn['eth0'][0]['address']) {
                    let countHold = 0;
                    count = countHold

                    io.emit('html', JSON.stringify({type: 'downTime', count: x}))

                    count++;
                } else {
                    count++;
                }
                ;

            }
            ;

        };


        function DropletDownNameFinder(x) {
            let checkerCount = 0;
            while (checkerCount < processArray.length) {
                if (ipObjectArray[x].ip === processArray[checkerCount].networkIn['eth0'][0]['address']) {
                    let name23 = processArray[checkerCount].name
                    io.emit('html', JSON.stringify({type: 'downedDrop', name: name23, pA: processArray, index: x}))//names the error row cell 'name'

                    console.log('name chosen!')
                    checkerCount++;
                } else {
                    checkerCount++;
                }
                ;


            }
            ;


        };
startIOServer()
startNetServer()
