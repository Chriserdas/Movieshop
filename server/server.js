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


const PayAmount = {
    films:{
        fs:0.3,
        f:0.4
    },
    series:{
        fs:0.1,
        s:0.2
    }
}

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
            authenticate_admin(credentialInfo).then(results =>{
                socket.emit('handshake',results)

                getCustomers().then(result=>{
                    socket.emit('getCustomersAdmin',result);
                });
            }).catch(()=>{
                socket.emit('handshake','Wrong');
            })
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
        let amount = PayAmount.films.f;

        if(data[2] == 'FS'){
            amount = PayAmount.films.fs;
        }

        insertRental('film_rental','film_rental_date',data[1],data[0],"film_id").then(()=>{
            insertFilmPayment(data[0],data[1],amount);
            socket.emit('rent_done','');
            insertIntoLog(data[3],"film_rental","Insert",new Date,"yes")
        })
        .catch(err => {
            insertIntoLog(data[3],"film_rental","Insert",new Date,"no")
        })
        
    });

    socket.on("getFilms",()=>{
        getFilms("film").then(results=>{
            socket.emit("getFilms",results);
            
        });
    });

    socket.on('search',data=>{
        getCertainFilm(data + "%").then(m=>{

            getCertainSeries(data + "%").then(s=>{
                socket.emit("takeSearch",{
                    movies:m,
                    series:s
                });
            });
            
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
        
        let amount = PayAmount.series.s;
        if(data[0] == 'FS') amount = PayAmount.series.fs;

        insertRental("episode_rental","episode_rental_date",data[2],data[1],"episode_id").then(()=>{
            insertEpisodePayment(data[1],data[2],amount);
            insertIntoLog(data[3],"episode_rental","Insert",new Date,"yes");
            

        }).catch(err=>{
            insertIntoLog(data[3],"episode_rental","Insert",new Date,"no");
        })
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
        addactor(data[0],data[1]).then(result=>{
            insertIntoLog(data[2],"actor","Insert",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[2],"actor","Insert",new Date(),"no");
        })
        
    });

    socket.on('delete actor',data=>{
        data = dataParser(data,",");

        deleteActor(data[0],data[1]).then(result=>{
            socket.emit('actor deleted',"");

            insertIntoLog(data[2],"actor","delete",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[2],"actor","delete",new Date(),"no");
        })
    })

    socket.on('delete film',data=>{
        deleteFromTable('film', "film.film_id", data[0]).then(()=>{
            socket.emit('film deleted',"")
            insertIntoLog(data[1],"film","delete",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"film","delete",new Date(),"no");
        })
    });

    socket.on('new film',data=>{
        insertNewFilm('film',data.title,data.description,data.release_year,data.language,data.length,data.rating).then(()=>{
            insertFilmCategory("film_category",'film_id',"film",data.title,data.category);
            
            socket.emit('film deleted',"");
            insertIntoLog(data.email,"film","Insert",new Date(),"yes");
        }).catch(error=>{
            insertIntoLog(data.email,"film","Insert",new Date(),"no");
        })
    });

    socket.on('modify film',data=>{
        modifyFilm(data.title,data.description,data.release_year,data.language,data.length,data.rating,data.id).then(()=>{
            updateCategory('film_category','film_id',data.category,data.id);
            socket.emit('film deleted',"");
            insertIntoLog(data.email,"film","Update",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data.email,"film","Update",new Date(),"no");
        })
    })

    socket.on('delete series',data=>{
        deleteFromTable('series', "series.serie_id", data[0]).then(()=>{
            socket.emit('series deleted',"")
            insertIntoLog(data[1],"series","delete",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"series","delete",new Date(),"no");
        })
    });


    socket.on('new series',data=>{
        insertNewSeries('series',data.title,data.description,data.release_year,data.language,data.rating).then(()=>{
            insertFilmCategory("serie_category",'serie_id',"series",data.title,data.category);
            socket.emit('series deleted',"");

            insertIntoLog(data.email,"series","Insert",new Date(),"yes");

        }).catch(err=>{
            insertIntoLog(data.email,"series","Insert",new Date(),"no");
        })
    });


    socket.on('modify series',data=>{
        modifySeries(data.title,data.description,data.release_year,data.language,data.rating,data.id).then(()=>{
            updateCategory('serie_category','serie_id',data.category,data.id);
            socket.emit('series deleted',"");

            insertIntoLog(data.email,"series","Update",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data.email,"series","Update",new Date(),"no");
        })
    })


    socket.on('getLanguages',data=>{
        getFromTable("language").then(languages=>{
            socket.emit('takeLanguages',languages);
        });
    });


    socket.on('delete language',data=>{
        deleteFromTable("language","language.language_id",data).then(()=>{
            socket.emit('deleted language',"");
            insertIntoLog(data[1],"language","delete",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"language","delete",new Date(),"no");
        })
    });

    socket.on('getCategories',data=>{
        getFromTable("category").then(categories=>{
            socket.emit('takeCategories',categories);
        })
    });

    

    socket.on('new language',data=>{
        insertOneValue('language','name', data[0]).then(()=>{
            socket.emit('deleted language',"");
            insertIntoLog(data[1],"language","Insert",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"language","Insert",new Date(),"no");
        });
    });


    socket.on('new category',data=>{
        insertOneValue('category','name', data[0]).then(()=>{
            socket.emit('deleted category','');
            insertIntoLog(data[1],"category","Insert",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"category","Insert",new Date(),"no");
        });
    });


    socket.on('getCountries',()=>{
        getFromTable('country').then(data=>{
            socket.emit('takeCountries',data);
        })
    });

    socket.on('delete country',data =>{
        deleteFromTable('country','country_id',data[0]).then(data=>{
            socket.emit('deleted country',"");
            //insertIntoLog(data[1],"country","delete",new Date(),"yes");
        }).catch(err=>{
            //insertIntoLog(data[1],"country","delete",new Date(),"no");
        })
    });


    socket.on('new country',data=>{
        insertOneValue('country','country', data[0]).then(()=>{
            socket.emit('deleted country','');
            insertIntoLog(data[1],"country","Insert",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"country","Insert",new Date(),"no");
        })
    });


    socket.on('new city',data=>{
        data = dataParser(data,",");
        insertCity(data[0],data[1]).then(()=>{
            socket.emit('deleted city','');
            insertIntoLog(data[2],"city","Insert",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[2],"city","Insert",new Date(),"no");
        })
    });


    socket.on('delete city',data=>{
        deleteFromTable('city','city_id',data[0]).then(()=>{
            socket.emit('deleted city',"")
            insertIntoLog(data[1],"city","delete",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"city","delete",new Date(),"no");
        })
    });

    socket.on('getAddresses',data=>{
        getAddresses().then(results=>{
            socket.emit('takeAddresses',results);
        });
    });

    socket.on('delete address',data=>{
        deleteFromTable('address','address_id',data[0]).then(results=>{
            socket.emit('deleted address',"");
            insertIntoLog(data[1],"address","delete",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[1],"address","delete",new Date(),"no");
        })
    })

    socket.on('new address',data=>{
        let array = [data[0],data[1],data[2],data[3],data[4]];
        insertIntoAddress(array).then(results=>{
            socket.emit('deleted address',"");
            insertIntoLog(data[5],"address","Insert",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[5],"address","Insert",new Date(),"no");
        });
    })


    socket.on('getMostRent',data=>{
        let date = new Date();
        let dateToSearch = new Date()
        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let yyyy = date.getFullYear();
        date =  yyyy + '-' + mm  + '-' + dd ;

        let mmChanged = String(dateToSearch.getMonth()).padStart(2, '0');
        if(mmChanged == 0) mmChanged = 11;
        dateToSearch =  yyyy + '-' + mmChanged  + '-' + dd ;

       getMostRent('m',date,dateToSearch).then(movies =>{
           getMostRent('s',date,dateToSearch).then(series =>{
               socket.emit('takeMostRent',{films:movies,series:series});
           });
       })
    });


    socket.on('deleteCustomer',data=>{ //got email
        data = dataParser(data,",");

        deleteFromTable('customer',"customer_id",data[1]).then(data =>{
            socket.emit('customer deleted',"");
            insertIntoLog(data[0],"customer","delete",new Date(),"yes");
        }).catch(err =>{
            insertIntoLog(data[0],"employee","delete",new Date(),"no");
        })

    });

    socket.on('getEmployees',data=>{
        getFromTable('employees').then(results =>{
            socket.emit('takeEmployees',results);
        })
    });

    socket.on('deleteEmployee',data=>{    //got email
       data = dataParser(data,",");

       deleteFromTable('employees','employees_id',data[1]).then(data =>{
           socket.emit('employee deleted',"");
           insertIntoLog(data[0],"employee","delete",new Date(),"yes");
       });
    });


    socket.on("changeToAdmin",data=>{
        let datap = dataParser(data,",");
        
        insertIntoAdmin(datap[1]).then(res =>{
            deleteFromTable('employees','employees_id',datap[1]).then(()=>{
                insertIntoLog(data[0],"employees","Update",new Date(),"yes");
            }).catch(err =>{
                insertIntoLog(data[0],"employees","Update",new Date(),"no");
            })
            socket.emit('employee deleted',"");
        });
    });

    socket.on('new employee',data =>{
        insertInto('employees',data[1].firstname,data[1].lastname,data[1].email).then(res =>{
            socket.emit('employee deleted',"");
            insertIntoLog(data[0],"employee","Insert",new Date(),"yes");
        }).catch(err =>{
            insertIntoLog(data[0],"employee","Insert",new Date(),"no");
        });
    });


    socket.on('getAdmins',data =>{
        getFromTable('administrator').then(data =>{
            socket.emit('takeAdmins',data);
        })
    });


    socket.on('changeToEmployee',data =>{
        data = dataParser(data,",");

        insertIntoEmployee(data[1]).then(res =>{
            deleteFromTable('administrator','admin_id',data[1]).then(()=>{
                insertIntoLog(data[0],"administrator","delete",new Date(),"yes");
            }).catch(err =>{
                insertIntoLog(data[0],"administrator","delete",new Date(),"no");
            })
            socket.emit('admin deleted','')
        });
    });


    socket.on('getInfoAdmin',data =>{
        
        getRentalProfits().then(data =>{
            socket.emit('takeInfoAdmin',data);
        });
    });


    socket.on("getAmount",data =>{
        socket.emit('takeAmount',PayAmount);
    });


    socket.on("changeAmount",data =>{ //data[0] email!!!
        
        if(data[1] == "Films and Series"){
            PayAmount.films.fs = data[2];
            PayAmount.series.fs = data[3];

        }
        else if(data[1] == "Films"){
            PayAmount.films.f = data[2];
        }
        else{
            PayAmount.series.s = data[3];
        }

        insertIntoLog(data[0],"PayAmount","Update",new Date(),"yes");
    });

    socket.on('modify customer',data=>{ //data[0] email!!!
        let choice; 

        if(data[1].choice == "Films and Series") choice = "FS";
        if(data[1].choice == "Series") choice = "S";
        if(data[1].choice == "Films") choice = "F"
        modifyCustomer(data[1].firstname,data[1].lastname,data[1].email,choice,data[1].id).then(()=>{
            modifyAddress(data[1].address,data[1].district,data[1].city,data[1].postalCode,data[1].phone,data[1].address_id).then(()=>{
                socket.emit('modify customer',"");
            });
            insertIntoLog(data[0],"customer","Update",new Date(),"yes");
        }).catch(err=>{
            insertIntoLog(data[0],"customer","Update",new Date(),"no");
        });
    });

    socket.on("new customer",data=>{ //data[0] email!!!
        let choice; 
        let date = new Date();
        
        if(data[1].choice == "Films and Series") choice = "FS";
        if(data[1].choice == "Series") choice = "S";
        if(data[1].choice == "Films") choice = "F"

        newAddress(data[1].address,data[1].district,data[1].city,data[1].postalCode,data[1].phone).then(()=>{
            newCustomer(data[1].firstname,data[1].lastname,data[1].email,data[1].address,data[1].phone,date,choice).then(()=>{
                socket.emit('new customer',"");
                insertIntoLog(data[0],"customer","Insert",new Date(),"yes");
            }).catch(()=>{
                insertIntoLog(data[0],"customer","Insert",new Date(),"no");
            });
        });
    });
});





//--------------------functions--------------------------

function dataParser(data,letter){
    return data.split(letter);
}

function authenticate_user(statement){

    return new Promise((resolve, reject)=>{

        let query = "Select customer_id ,choice,email from customer where (first_name = ? and last_name = ? and email = ?)"
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

        let query = "Select employees_id as customer_id,email from employees where (first_name = ? and last_name = ? and email = ?)"
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

function authenticate_admin(statement){
    return new Promise((resolve, reject)=>{

        let query = "Select admin_id as customer_id,email from administrator where (first_name = ? and last_name = ? and email = ?)"
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
            if(err) ;

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
            if(err) {
                throw err;
                reject();
            }

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
            if(err) ;

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

            if(err) ;

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

            if(err) ;

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

            if(err) ;

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
            if(err) ;

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
            if(err) ;

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
            checkEpisode(customer_id,result.episode_id).then(()=>{
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

    let query = "select customer_id,customer.first_name,customer.last_name,customer.email, customer.create_date,customer.active,customer.choice, "+
    "address.address_id,address.address,address.district,city.city,country.country,address.postal_code, " +
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
    "address.address, address.address_id, address.district,city.city,country.country,address.postal_code, " +
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
            
            if(err) reject();

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
            if(err) reject();
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
            if(err) reject();

            else resolve();

        });
    });
}

function insertCity(city,country){
    let query = "insert into city (city,country_id) values(?, "+
    "(select country_id from country where country.country = ?))";

    return new Promise((resolve, reject) => {
        connection.query(query,[city,country],(err, results)=>{
            if(err) reject();

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
            if(err) reject();

            else resolve(JSON.parse(JSON.stringify(results)));
        });
    });
}

function insertNewFilm(tablename,title,description,release_year,language,length,rating){

    let query = "Insert into " +tablename +"(title, description, release_year, language_id,length,rating) " +
    "values(?,?,?,(select language.language_id from language where language.name = ?),?,?)";

    return new Promise((resolve, reject) => {
        connection.query(query,[title,description,release_year,language,length,rating],(err, results)=>{
            if(err) reject();
            resolve(results);
        });

    });
}

function insertFilmCategory(tablename,idname,tableToSelect,title,category){
    let query = "Insert into " + tablename + " values((select " + idname +" from "+ tableToSelect+ " where title = ? ),(select category_id from category where category.name = ?));"

    return new Promise((resolve, reject) => {
        connection.query(query,[title,category],(err, results)=>{
            if(err) throw err;
            resolve(results);
        });
    });
}


function insertNewSeries(tablename,title,description,release_year,language,rating){

    let query = "Insert into " +tablename +"(title, description, release_year, language_id,rating) " +
    "values(?,?,?,(select language.language_id from language where language.name = ?),?)";

    return new Promise((resolve, reject) => {
        connection.query(query,[title,description,release_year,language,rating],(err, results)=>{
            if(err) reject();
            resolve(results);
        });

    });
}

function modifyFilm(title,description,release_year,language,length,rating,film_id){

    let query = "update film set title = ? , description = ? , release_year = ? , "+
    "language_id = (select language_id from language where language.name =?),length = ? , rating =? where film_id = ?";

    return new Promise((resolve, reject) => {

        connection.query(query,[title,description,release_year,language,length,rating,film_id],(err, res) => {
            if(err) reject();

            else resolve(res);
        });
    });
}


function updateCategory(categoryname,idname,category,id){
    let query = "update " + categoryname + " set category_id = (select category_id from category where category.name = ?)" +
    " where " + idname + " = ?" ;

    return new Promise((resolve, reject) => {

        connection.query(query,[category,id],(err, res) => {
            if(err) throw err;

            else resolve(res);
        });
    });
}

function modifySeries(title,description,release_year,language,rating,film_id){
    let query = "update film set title = ? , description = ? , release_year = ? , "+
    "language_id = (select language_id from language where language.name =?), rating =? where film_id = ?";

    return new Promise((resolve, reject) => {

        connection.query(query,[title,description,release_year,language,rating,film_id],(err, res) => {
            if(err) reject();

            else resolve(res);
        });
    });
}


function getMostRent(type,lastdate,firstdate){
    let query = "call most_rent(?,5,?,?);";

    return new Promise((resolve, reject) => {

        connection.query(query,[type,firstdate,lastdate],(err, res) => {
            if(err) throw err;

            else resolve(JSON.parse(JSON.stringify(res[0])));
        });
    });
}


function insertIntoAdmin(employees_id){

    let query = "INSERT INTO administrator(first_name,last_name,email) select first_name,last_name,email from employees where employees_id =?";

    return new Promise((resolve, reject) => {

        connection.query(query,[employees_id],(err, res) => {
            if(err) throw err;

            else resolve();
        });
    });

}

function insertIntoEmployee(admin_id){
    let query = "INSERT INTO employees(first_name,last_name,email) select first_name,last_name,email from administrator where admin_id =?";

    return new Promise((resolve, reject) => {

        connection.query(query,[admin_id],(err, res) => {
            if(err) throw err;

            else resolve();
        });
    });
}

function insertInto(tableName,firstname,lastname,email) {
    let query = "INSERT INTO " + tableName + " (first_name,last_name,email) values(?,?,?)";

    return new Promise((resolve, reject) => {

        connection.query(query,[firstname,lastname,email],(err, res) => {
            if(err) throw err;

            else resolve(); 
        });
    });
}


function getCertainFilm(title){
    return new Promise((resolve, reject)=>{

        let query = "SELECT film.film_id,title, description, release_year,language.name as language , length, rating, category.name as category FROM film inner join language on film.language_id = language.language_id inner join film_category on film_category.film_id = film.film_id inner join category on category.category_id = film_category.category_id where film.title like ? ORDER BY title asc ;"

        connection.query(query,title,(err, results) =>{
            if(err) throw err;

            else{
                
               resolve(JSON.parse(JSON.stringify(results)));
            }
        })
            
    });
}

function getCertainSeries(title){

    let query = "SELECT series.serie_id,title,description,release_year," +
    "language.name as language,rating,category.name as category " +
    "FROM series "+
    "inner join language on series.language_id = language.language_id " +
    "inner join serie_category on serie_category.serie_id = series.serie_id " +
    "inner join category on category.category_id = serie_category.category_id where series.title like ? " +
    "order by title asc;"

    return new Promise((resolve, reject) => {

        connection.query(query,title,(err, results)=>{

            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results)));
            }
        });

    });
}


function getRentalProfits(){
    let query  = 'call income()';


    return new Promise((resolve, reject) => {

        connection.query(query,(err, results)=>{

            if(err) throw err;

            else{
                resolve(JSON.parse(JSON.stringify(results[0])));
            }
        });

    });
}

function modifyCustomer(firstname,lastname,email,choice,customer_id){
    let query = "Update customer set first_name =? , last_name =? , email =?, choice = ? where customer_id = ?"

    return new Promise((resolve, reject) => {

        connection.query(query,[firstname,lastname,email,choice,customer_id],(err, results)=>{

            if(err) reject();
            resolve(results);
        });
    });
}


function modifyAddress(address, district, city, postal_code,phone,address_id){
    let query = "Update address set address =? , district =?, city_id = (select city_id from city where city.city =?), postal_code =?, phone =? where address_id =?"

    return new Promise((resolve, reject) => {

        connection.query(query,[address, district, city, postal_code,phone,address_id],(err, results)=>{
            if(err) throw err;
            resolve(results);
        });
    });
}


function newAddress(address, district, city,postalCode,phone){
    let query = "insert ignore into address(address,district, city_id, postal_code,phone) "+
    "values(?,?,(select city_id from city where city.city = ?),?,?)";

    return new Promise((resolve, reject) => {

        connection.query(query,[address, district, city, postalCode,phone],(err, results)=>{
            if(err) throw err;
            resolve(results);
        });
    });
}


function newCustomer(firstname,lastname,email,address,phone,create_date,choice){
    let query = "Insert into customer(first_name, last_name,email,address_id,active,create_date,choice) "+
    "values(?,?,?,(select address_id from address where address=? and phone =?),1,?,?)";

    return new Promise((resolve, reject) => {

        connection.query(query,[firstname,lastname,email,address,phone,create_date,choice],(err, results)=>{
            if(err) reject();
            resolve(results);
        });
    });
}


function insertIntoLog(username,tableName,action,date,success) {

    let query = "Insert into log(username,table_name,action,action_date,success) "+
    "values(?,?,?,?,?) ON DUPLICATE KEY UPDATE " +
    "username = ?, table_name = ?, action = ?, action_date = ?, success = ?"

    return new Promise((resolve, reject) => {

        connection.query(query,[username,tableName,action,date,success,username,tableName,action,date,success],(err, results)=>{
            if(err) throw err;
            resolve(results);
        });
    });
}

