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
            authenticate_employee(credentialInfo).then(result=>{
                socket.emit('handshake',result)

                getCustomers().then(result=>{
                    socket.emit('getCustomers',result);
                });

            }).catch(()=>{
                socket.emit('handshake','Wrong');
            })
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

    socket.on("getFilms",()=>{
        getFilms("film").then(results=>{
            socket.emit("getFilms",results);
            
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
            
            
            
            getOwnedStatus(results,data[1]).then(array=>{
                socket.emit("episodes",array);
            })
            
            
        })
    });


    socket.on('rentEpisode',data=>{
        data = dataParser(data,",");
        
        let amount = 0.2;
        console.log(data);
        if(data[0] == 'FS') amount = 0.1;

        insertRental("episode_rental","episode_rental_date",data[2],data[1],"episode_id").then(()=>{
            insertEpisodePayment(data[1],data[2],amount);
        });
    })

    //----------------Owned------------------


    socket.on("getOwned",customer_id=>{
        getOwnedFilms(customer_id).then(films => {
            getOwnedEpisodes(customer_id).then(episodes => {
                socket.emit("Owned",{films,episodes});
            });
        });

    });

    //-----------------Account---------------------

    socket.on('getCustomerInfo',customer_id=>{
        console.log(customer_id);
        getAccountInfo(customer_id).then(result =>{
            socket.emit('takeCustomerInfo',result[0]);
        });
    });

    socket.on("getCities",data=>{
        getCities().then(result=>{
            socket.emit("cities",result);
        });
    });

    socket.on('getCustomers',data=>{
        getCustomers().then(result=>{
            socket.emit('takeCustomers',result);
        });
    });



    //---------------employees------------------------

    socket.on('add actor',data=>{
        data = dataParser(data,",");
        addactor(data[0],data[1]);
    });

    socket.on('delete actor',data=>{
        data = dataParser(data,",");

        deleteActor(data[0],data[1]).then(result=>{
            socket.emit('actor deleted',"");
        })
    })

    socket.on('delete film',data=>{
        deleteFromTable('film', "film.film_id", data).then(()=>{
            socket.emit('film deleted',"")
        })
    });

    socket.on('new film',data=>{
        insertNewFilm(data.title,data.description,data.release_year,data.language,data.length,data.rating).then(()=>{
            socket.emit('deleted film',"");
        })
    });

    socket.on('modify film',data=>{
        console.log(data)
    })

    socket.on('delete series',data=>{
        deleteFromTable('series', "series.serie_id", data).then(()=>{
            socket.emit('series deleted',"")
        })
    });

    socket.on('new series',data=>{
        console.log(data);
    });

    socket.on('modify series',data=>{
        console.log(data)
    })

    socket.on('getLanguages',data=>{
        getFromTable("language").then(languages=>{
            socket.emit('takeLanguages',languages);
        });
    });

    socket.on('delete language',data=>{
        deleteFromTable("language","language.language_id",data).then(()=>{
            socket.emit('deleted language',"");
        })
    });

    socket.on('getCategories',data=>{
        getFromTable("category").then(categories=>{
            socket.emit('takeCategories',categories);
        })
    });

    socket.on('delete category',data=>{
        deleteFromTable("category","category.category_id",data).then(()=>{
            socket.emit('deleted category',"");
        })
    })

    socket.on('new language',data=>{
        insertOneValue('language','name', data).then(()=>{
            socket.emit('deleted language',"");
        });
    });

    socket.on('new category',data=>{
        insertOneValue('category','name', data).then(()=>{
            socket.emit('deleted category','');
        });
    });

    socket.on('getCountries',()=>{
        getFromTable('country').then(data=>{
            socket.emit('takeCountries',data);
        })
    });

    socket.on('delete country',data =>{
        deleteFromTable('country','country_id',data).then(data=>{
            socket.emit('deleted country',"");
        })
    });

    socket.on('new country',data=>{
        insertOneValue('country','country', data).then(()=>{
            socket.emit('deleted country','');
        })
    });

    socket.on('new city',data=>{
        data = dataParser(data,",");
        insertCity(data[0],data[1]).then(()=>{
            socket.emit('deleted city','');
        })
    })

    socket.on('delete city',data=>{
        deleteFromTable('city','city_id',data).then(()=>{
            socket.emit('deleted city',"")
        })
    });

    socket.on('getAddresses',data=>{
        getAddresses().then(results=>{
            socket.emit('takeAddresses',results);
        });
    });

    socket.on('delete address',data=>{
        deleteFromTable('address','address_id',data).then(results=>{
            socket.emit('deleted address',"");
        })
    })

    socket.on('new address',data=>{
        insertIntoAddress(data).then(results=>{
            socket.emit('deleted address',"");
        })
    })
});





//--------------------functions--------------------------

function dataParser(data,letter){
    return data.split(letter);
}

function authenticate_user(statement){

    return new Promise((resolve, reject)=>{

        let query = "Select customer_id ,choice from customer where (first_name = ? and last_name = ? and email = ?)"
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

function authenticate_employee(statement){

    return new Promise((resolve, reject)=>{

        let query = "Select employees_id as customer_id from employees where (first_name = ? and last_name = ? and email = ?)"
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

        let query = "SELECT film_id,title, description, release_year,language.name as language , length, rating, category.name as category FROM film inner join language on film.language_id = language.language_id inner join film_category on film_category.film_id = film.film_id inner join category on category.category_id = film_category.category_id ORDER BY title asc;"

        connection.query(query,(err, results) =>{
            if(err) throw err;

            else{
                console.log(results);
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
                episodesChecked.push({result,owned:false});
                array.shift();
                if(array.length == 0) resolve(episodesChecked);
            });
            
        }
        
    })
}

function getOwnedFilms(customer_id){
    
    let query = "SELECT title, description, release_year,language.name as language, "+
    "length, rating, category.name as category,film_rental.film_rental_date as rental_date FROM film " +
    "inner join language on film.language_id = language.language_id " + 
    "inner join film_category on film_category.film_id = film.film_id " +
    "inner join category on category.category_id = film_category.category_id " +
    "inner join film_rental on film_rental.film_id = film.film_id " +
    "where film_rental.customer_id = ?"
    
    return new Promise((resolve, reject) => {

        connection.query(query,customer_id,(err, results)=>{
            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });
    })
}

function getOwnedEpisodes(customer_id){

    let query = "SELECT episodes.title, episodes.description, series.release_year,language.name as language, " +
    "length, rating, category.name as category,episode_rental.episode_rental_date as rental_date FROM episodes " +
    "inner join seasons on seasons.season_id = episodes.season_id " +
    "inner join series on seasons.serie_id = series.serie_id " +
    "inner join language on series.language_id = series.language_id " +
    "inner join serie_category on serie_category.serie_id = series.serie_id " +
    "inner join category on category.category_id = serie_category.category_id " +
    "inner join episode_rental on episode_rental.episode_id = episodes.episode_id " +
    "where episode_rental.customer_id = ? " +
    "GROUP BY episodes.title;"

    return new Promise((resolve, reject) => {

        connection.query(query,customer_id,(err, results)=>{
            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });
    })
}

function getAccountInfo(customer_id){

    let query = "select customer.first_name,customer.last_name,customer.email, customer.create_date,customer.active,customer.choice, "+
    "address.address,address.district,city.city,country.country,address.postal_code, " +
    "address.phone from customer " +
    "inner join address on address.address_id = customer.address_id " +
    "inner join city on address.city_id = city.city_id " +
    "inner join country on city.country_id = country.country_id " +
    "where customer.customer_id = ?"

    return new Promise((resolve, reject) => {

        connection.query(query,customer_id,(err, results)=>{
            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });
    })
}

function getCities() {
    let query = "SELECT city.city_id, city.city,country.country FROM city " +
    "inner join country on country.country_id = city.country_id order by city.city ASC";

    return new Promise((resolve, reject) => {

        connection.query(query,(err, results)=>{
            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });
    })
}

function getCustomers(){
    let query = "select customer.customer_id,customer.first_name,customer.last_name,customer.email, customer.create_date,customer.active,customer.choice, "+
    "address.address,address.district,city.city,country.country,address.postal_code, " +
    "address.phone from customer " +
    "inner join address on address.address_id = customer.address_id " +
    "inner join city on address.city_id = city.city_id " +
    "inner join country on city.country_id = country.country_id order by first_name";
    

    return new Promise((resolve, reject) => {

        connection.query(query,(err, results)=>{
            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });
    })
}

function addactor(firstname,lastname) {
    let query = " Insert into actor (first_name,last_name) values (?,?) ";
    

    return new Promise((resolve, reject) => {

        connection.query(query,[firstname,lastname],(err, results)=>{
            

            resolve(results);
            
        });
    })
}


function deleteActor(firstname,lastname) {
    
    let query = "delete from actor where first_name = ? and last_name = ?"

    return new Promise((resolve, reject) => {

        connection.query(query,[firstname,lastname],(err, results)=>{
            
            resolve(results);
            
        });
    })

}


function deleteFromTable(tableName,idname,id){
    let query = "delete from " + tableName + " where " + idname + " = ?";

    return new Promise((resolve, reject) => {

        connection.query(query,id,(err, results)=>{
            
            resolve(results);
            
        });
    })
}

function getFromTable(tableName) {

    let query = "select * from " + tableName;

    return new Promise((resolve, reject) => {
        connection.query(query,(err, results)=>{
            if(err) throw err;
    
            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });
    })
}

function insertOneValue(tableName, valuename, value) {
    let query = "Insert into " + tableName + " (" + valuename + ") values (?)";

    return new Promise((resolve, reject)=>{
        connection.query(query,value,(err, results)=>{
            if(err) throw err;

            else resolve();

        });
    });
}

function insertCity(city,country){
    let query = "insert into city (city,country_id) values(?, "+
    "(select country_id from country where country.country = ?))";

    return new Promise((resolve, reject) => {
        connection.query(query,[city,country],(err, results)=>{
            if(err) throw err;

            else resolve();
        });
    });
}


function getAddresses(){

    let query = "select address.address_id,address.address,address.district,city.city,address.postal_code,address.phone "+
    "from address "+
    "inner join city on city.city_id = address.city_id order by address asc";

    return new Promise((resolve, reject) => {
        connection.query(query,(err, results)=>{
            if(err) throw err;

            else resolve(JSON.parse(JSON.stringify(results)));
        });
    });
}

function insertIntoAddress(array){
    let query = "INSERT INTO address(address,district,city_id,postal_code,phone) "+
    "values(?,?,(select city_id from city where city.city = ?),?,?);";

    return new Promise((resolve, reject) => {
        connection.query(query,array,(err, results)=>{
            if(err) throw err;

            else resolve(JSON.parse(JSON.stringify(results)));
        });
    });
}

function insertNewFilm(title,description,release_year,language,length,rating){

    let query = "Insert into film(title, description, release_year, language_id,length,rating) " +
    "values(?,?,?,(select language.language_id from language where language.name = ?),?,?)";

    return new Promise((resolve, reject) => {
        connection.query(query,[title,description,release_year,language,length,rating],(err, results)=>{
            if(err) throw err;
            resolve(results);
        });
    });
}
