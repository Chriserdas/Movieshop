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

    //------------login--------------------

    socket.on('credentials',data => {
        let credentialInfo = dataParser(data,','); 
        let categories;

        if(credentialInfo[0] == 'customer'){

            authenticate_user(credentialInfo).then( data => {
                socket.emit('handshake',data);
                getCategories().then( results => {

                    for(let result of results){
                        socket.emit('getCategories',result.name);
                    }
                });
                getFilms("film").then(results=>{

                    
                    socket.emit("getFilms",results);
                    
                });


            }).catch(()=>{
                socket.emit('handshake','Wrong');
            });
        }
        else if(credentialInfo[0] == 'admin'){

        }
        else{

        }

    });

    socket.on('getFilmBuyStatus',customerData=>{
        let customerInfo = dataParser(customerData,",");

        checkFilm(customerInfo).then(()=>{
            socket.emit('checkedFilm',true);
        }).catch(()=>{
            socket.emit('checkedFilm',false);
        })
    });

    socket.on('rentFilm', data=>{
        data = dataParser(data,",");

        console.log(data);
        if(data[3] == 'FS'){

        }
    });

    //-------------------------------------------------
});


function dataParser(data,letter){
    return data.split(letter);
}

function authenticate_user(statement){

    return new Promise((resolve, reject)=>{

        let query = "Select customer_id,choice from customer where (first_name = ? and last_name = ? and email = ?)"
        connection.query(query,[statement[1],statement[2],statement[3]],(err, results)=>{
            if (err) throw err;

            else {
                if(results.length === 0) reject();

                else{
                    resolve(JSON.parse(JSON.stringify(results[0])));
                }
            }
        });
    });
}

function getCategories() {
     return new Promise((resolve, reject) =>{
        connection.query("Select name from category",(err, results) =>{
            if(err) reject(err);

            else {
            resolve(results)
            }
        })
    });
}

function getFilms(tableName){

    return new Promise((resolve, reject)=>{

        let query = "SELECT film.film_id,title, description, release_year,language.name as language , length, rating, category.name as category FROM film inner join language on film.language_id = language.language_id inner join film_category on film_category.film_id = film.film_id inner join category on category.category_id = film_category.category_id ORDER BY title asc;"

        connection.query(query,(err, results) =>{
            if(err) throw err;

            else{
               resolve(JSON.parse(JSON.stringify(results)));
            }
        })
            
    });
}

function checkFilm(values) {

    let query = 
    "select film_rental.customer_id, film_inventory.film_id  from film_rental" +
    " inner join film_inventory on film_inventory.film_inventory_id = film_rental.film_inventory_id" +
    " where film_rental.customer_id = ? and film_inventory.film_id = ?"
    return new Promise((resolve, reject) =>{

        connection.query(query, [values[0],values[1]], (err, results) =>{
            if(err) throw err;

            else {
                if(results.length>0){
                   resolve();
                }
                else reject();
            }
        });

    });
}

function insertFilmPayment(){

}