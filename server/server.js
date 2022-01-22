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

    //-------------------FILMS-----------------------

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
        let amount = 0.4;

        if(data[2] == 'FS'){
            amount = 0.3;
        }

        insertRental('film_rental','film_rental_date',data[1],data[0],"film_id").then(()=>{
            insertFilmPayment(data[0],data[1],amount);
            socket.emit('rent_done','');
        });
        
    });

    //------------------SERIES----------------------------

    socket.on('getSeries',data=>{
        getSeries().then(result=>{
            socket.emit('takeSeries',result)
        });
    });

    socket.on('getSeasons',data=>{
        getSeasons(parseInt(data)).then(result=>{

            socket.emit('takeSeasons',result);
        });
    });

    socket.on('getEpisodes',data=>{
        data = dataParser(data,",");
        getEpisodes(parseInt(data[0])).then(results=>{
            
            //socket.emit("episodes",result);
            
            getOwnedStatus(results,data[1]).then(array=>{
                socket.emit("episodes",array);
            })
                //socket.emit("episodes",result);
            
        })
    });

    /*socket.on('epRentStatus',data=>{
        data = dataParser(data,",");
        
        checkEpisode(data[0],data[1]).then(result=>{
            console.log(true+ data[1]);
            socket.emit('checkedEpisode',true + data[1]);
        }).catch(()=>{
            console.log(false+ data[1]);
            socket.emit('checkedEpisode',false + data[1]);
        });
    });*/

    socket.on('rentEpisode',data=>{
        data = dataParser(data,",");
        
        let amount = 0.2;
        console.log(data);
        if(data[0] == 'FS') amount = 0.1;

        insertRental("episode_rental","episode_rental_date",data[2],data[1],"episode_id").then(()=>{
            insertEpisodePayment(data[1],data[2],amount);
        });
    })

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
    "select film_rental.customer_id, film_rental.film_id  from film_rental" +
    " where film_rental.customer_id = ? and film_rental.film_id = ?"
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

function insertRental(tableName,date_var,value1,value2,id){

    let query = "INSERT INTO " + tableName + " ( "+ date_var +", " + id +" ,customer_id)"+
    " VALUES(now(),?,?)"
    return new Promise((resolve, reject) =>{

        connection.query(query,[value1,value2],(err, results)=>{
            if(err) throw err;

            else{
                resolve();
            }
        });
    });
}

function insertFilmPayment(value1,film_id,amount){

    let query = "INSERT INTO film_payment(customer_id,film_rental_id,film_payment_date,film_amount)" +
    " VALUES (?, (Select film_rental_id from film_rental where customer_id = ? and film_id = ?), now(),?)";
    return new Promise((resolve, reject) =>{

        connection.query(query,[value1,value1,film_id,amount],(err, results)=>{
            if(err) throw err;

            else{
                resolve();
            }
        });
    });
}


function getSeries(){

    let query = "SELECT series.serie_id,title,description,release_year," +
    "language.name as language,rating,category.name as category " +
    "FROM series "+
    "inner join language on series.language_id = language.language_id " +
    "inner join serie_category on serie_category.serie_id = series.serie_id " +
    "inner join category on category.category_id = serie_category.category_id " +
    "order by title asc;"

    return new Promise((resolve, reject) => {

        connection.query(query,(err, results)=>{

            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });

    });
}

function getSeasons(serie_id){

    let query = "Select seasons.season_id,seasons.season_number " + 
    "from seasons where seasons.serie_id = ? order by seasons.season_number asc";

    return new Promise((resolve, reject) => {

        connection.query(query,serie_id,(err, results)=>{

            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });

    });
}


function getEpisodes(season_id) {
    let query = "SELECT episode_id,episodes.season_id,episode_number, title,description,length" +
    " from episodes where episodes.season_id = ?";

    return new Promise((resolve, reject) => {
        connection.query(query,season_id,(err, results)=>{

            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });
    });
}

function checkEpisode(customer_id,episode_id){

    let query = 
    "select episode_rental.customer_id, episode_rental.episode_id  from episode_rental" +
    " where episode_rental.customer_id = ? and episode_rental.episode_id = ?"
    return new Promise((resolve, reject) =>{

        connection.query(query, [customer_id,episode_id], (err, results) =>{
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

function insertEpisodePayment(customer_id,episode_id,amount){

    let query = "INSERT INTO episode_payment(customer_id,episode_rental_id,episode_payment_date,episode_amount)" +
    " VALUES (?, (Select episode_rental_id from episode_rental where customer_id = ? and episode_id = ?), now(),?)";

    return new Promise((resolve, reject) =>{

        connection.query(query,[customer_id,customer_id,episode_id,amount],(err, results)=>{
            if(err) throw err;

            else{
                resolve();
            }
        });
    });
}

function getOwnedStatus(results,customer_id){
    return new Promise((resolve, reject) =>{
        const episodesChecked = [];
        const array = results;
        for(let result of results){
            //console.log(result.episode_id);
            checkEpisode(customer_id,result.episode_id).then(()=>{
                //console.log("enter first");
                episodesChecked.push({result,owned:true});
                array.shift();
                if(array.length == 0) resolve(episodesChecked);
            }).catch(()=>{
                //console.log(array);
                episodesChecked.push({result,owned:false});
                array.shift();
                if(array.length == 0) resolve(episodesChecked);
            });
            
        }
        
    })
}