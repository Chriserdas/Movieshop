const express = require('express');
const path = require('path');
const http = require('http')
const socketio = require('socket.io');


var sql = require('mysql');
let configure = require("./config.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

server.listen(5000);

var connection = sql.createConnection(configure);

connection.connect(function(err) {
    if (err) connection = sql.createConnection(configure);
    console.log("Connected to sql database!");
});

console.log("Server running on port : " + server.address().port);

io.on('connection', socket =>{
    console.log("Connection established");
});