const {ipcRenderer} = require('electron');

let socket;

//------------------titlebar buttons-----------------

const close = document.getElementById('close-button');
const maximize = document.getElementById('maximize-button');
const minimize = document.getElementById('min-btn');

//----------------login--------------------


const firstname = document.querySelector("#firstname");
const lastname = document.querySelector("#lastname");
const email = document.querySelector("#email");
const signin = document.querySelector(".sign-in-button");
const signInContainer = document.querySelector(".sign-in_container");

const admin_button = document.querySelector("#admin-btn");
const employee_button = document.querySelector("#employee-btn");

let checkAttribute = "M2,19.2C5.9,23.6,9.4,28,9.4,28L23,2";
let xAttribute = "M5.72 5.72a.75.75 0 011.06 0L12 10.94l5.22-5.22a.75.75 0 111.06 1.06L13.06 12l5.22 5.22a.75.75 0 11-1.06 1.06L12 13.06l-5.22 5.22a.75.75 0 01-1.06-1.06L10.94 12 5.72 6.78a.75.75 0 010-1.06z1";


let user = document.querySelector("#login");
let mail;
let tagname = "customer";
let id;
let customer_choice;
let admin_var_name = "admin";
let employee_var_name = "employee";

let startCount = 0;

//--------------------customer--------------------

let films = document.querySelector("#films");
let series = document.querySelector("#series");
let owned = document.querySelector("#owned");
let account = document.querySelector("#account");
let category = document.querySelector("#type-name");
let search = document.querySelector("#search-area");
let divClicked = films;



let customers_employee = document.querySelector(".customers_button");
let rental_employee = document.querySelector(".rental_button");
let info_employee = document.querySelector(".info_button");
let most_viewed_employee = document.querySelector(".most-viewed-button");
let employeedivClicked = customers_employee;

let customers_admin = document.querySelector(".admin .customers_button");
let employees_button = document.querySelector(".admin .rental_button");
let admins = document.querySelector(".admin .info_button");
let info_admin = document.querySelector(".admin .most-viewed-button")
let adminClicked = customers_admin;

close.addEventListener('click', ()=>{
    ipcRenderer.send("close_app",'close_app')
});

maximize.addEventListener('click', ()=>{
    ipcRenderer.send("maximize_app",'');

});

minimize.addEventListener('click', ()=>{
    ipcRenderer.send("minimize_app",'')
});


admin_button.addEventListener('click',(e)=>{
    let oldadmin = admin_var_name;
    e.preventDefault();
    user.innerHTML = capitalizeFirstLetter(admin_var_name) + " Sign in";
    admin_var_name = tagname; 

    if(admin_var_name == "customer") admin_button.innerHTML = "Are you a customer?";
    else admin_button.innerHTML = "Are you an " + admin_var_name + "?";
    tagname = oldadmin;

    if(tagname == "customer"){
        document.querySelector('.customer').style.display = "block";
        document.querySelector('.employee').style.display = "none";
        document.querySelector('.admin').style.display = "none";
    }
    else if(tagname == "employee"){
        document.querySelector('.customer').style.display = "none";
        document.querySelector('.employee').style.display = "block";
        document.querySelector('.admin').style.display = "none";
    }
    else if(tagname == "admin") {
        document.querySelector('.customer').style.display = "none";
        document.querySelector('.employee').style.display = "none";
        document.querySelector('.admin').style.display = "block";
    }
});


employee_button.addEventListener('click',(e)=>{
    let oldemp = employee_var_name;
    e.preventDefault();
    user.innerHTML = capitalizeFirstLetter(employee_var_name) + " Sign in";
    employee_var_name = tagname; 

    if(employee_var_name == "customer") employee_button.innerHTML = "Are you a customer?";
    else employee_button.innerHTML = "Are you an " + employee_var_name + "?";
    tagname = oldemp;
    
    if(tagname == "customer"){
        document.querySelector('.customer').style.display = "block";
        document.querySelector('.employee').style.display = "none";
        document.querySelector('.admin').style.display = "none";
    }
    else if(tagname == "employee"){
        document.querySelector('.customer').style.display = "none";
        document.querySelector('.employee').style.display = "block";
        document.querySelector('.admin').style.display = "none";
    }
    else if(tagname == "admin") {
        document.querySelector('.customer').style.display = "none";
        document.querySelector('.employee').style.display = "none";
        document.querySelector('.admin').style.display = "block";
    }

});


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

search.addEventListener('keyup',(e)=>{
    let searchContent = document.querySelector('.search-content');
    if(search.value != ""){
        socket.emit('search', search.value.toUpperCase());

        socket.on('takeSearch',result=>{
            document.querySelector("#search-movies").innerHTML = "";
            document.querySelector('#search-series').innerHTML = "";
            searchContent.style.display = "block";
            createMovie(result.movies,'#search-movies');

            createSeries(result.series,'#search-series')
        });
    }
    else{
        searchContent.style.display = "none";
    }
});


series.addEventListener('click',()=>{
    series.style.backgroundColor = "#4d30d5";
    if(divClicked != series) divClicked.style.backgroundColor = "";
    divClicked = series;
    search.value = '';
    document.querySelector('.content').innerHTML = "";
    document.querySelector('.search-content').style.display = "none";
    category.innerHTML = "Series";
    document.querySelector('.accountDiv').style.display = "none";
    if(customer_choice == 'FS'  || customer_choice == 'S'){
        socket.emit('getSeries','');
        
        socket.on('takeSeries',series=>{
            document.querySelector('.content').innerHTML = "";
            createSeries(series,'.content');
        });
    }
    else notRegistered();
});


films.addEventListener("click", ()=>{
    films.style.backgroundColor = "#4d30d5";
    if(divClicked != films) divClicked.style.backgroundColor = "";
    document.querySelector('.search-content').style.display = "none";
    document.querySelector('.accountDiv').style.display = "none";
    search.value = '';
    category.innerHTML = "Movies";
    divClicked = films;
    document.querySelector('.content').innerHTML = "";

    if(customer_choice == 'FS'  || customer_choice == 'F'){
        socket.emit('getFilms','');
        
        socket.on('takeFilms',movies=>{
            
            createMovie(movies,'.content');
        });
    }
    else notRegistered();
});


owned.addEventListener('click',()=>{
    owned.style.backgroundColor = "#4d30d5";
    if(divClicked != owned) divClicked.style.backgroundColor = "";
    document.querySelector('.search-content').style.display = "none";
    search.value = '';
    divClicked = owned;
    document.querySelector('.content').innerHTML = "";
    category.innerHTML = "Owned";
    socket.emit('getOwned',id)
    document.querySelector('.accountDiv').style.display = "none";
    socket.on('Owned',results=>{
        let movies_count = document.createElement("div");
        let amount = results.films.length + results.episodes.length;
        document.querySelector('.content').innerHTML = "";
        movies_count.appendChild(document.createTextNode(amount + " movies"));
        movies_count.className = "movie-count";
        movies_count.style.opacity = "1";
        document.querySelector('.content').appendChild(movies_count);
        for(let result in results){
            createOwned(results[result],'.customer','.content');
        }
        
    });
});

account.addEventListener('click',()=>{
    document.querySelector('.search-content').style.display = "none";
    search.value = '';
    account.style.backgroundColor = "#4d30d5";
    if(divClicked != account) divClicked.style.backgroundColor = "";
    divClicked = account;
    document.querySelector('.content').innerHTML = "";
    
    getCustomerInfo().then(data=>{
        createAccountInfo(data,".accountDiv","modify customer");
    })

});


customers_employee.addEventListener('click',()=>{
    customers_employee.style.backgroundColor = "#4d30d5";
    document.querySelector('.address-content').style.display = "none";
    if(employeedivClicked != customers_employee) employeedivClicked.style.backgroundColor = "";
    
    employeedivClicked = customers_employee;
    document.querySelector('.content-employee').innerHTML = "";
    document.querySelector('.rental_content').style.display = "none";
    document.querySelector('.employee .movieInfo').style.display = "none";
    document.querySelector('.employee-accountDiv').style.display = "none";
    socket.emit('getCustomers',"");

    socket.on('takeCustomers',customers=>{
        createCustomers(customers);
    });
});

rental_employee.addEventListener('click',()=>{
    rental_employee.style.backgroundColor = "#4d30d5";
    document.querySelector('.address-content').style.display = "none";
    if(employeedivClicked != rental_employee) employeedivClicked.style.backgroundColor = "";
    
    employeedivClicked = rental_employee;
    document.querySelector('.content-employee').innerHTML = "";
    document.querySelector('.rental_content').style.display = "none";
    document.querySelector('.employee .movieInfo').style.display = "none";
    document.querySelector('.employee-accountDiv').style.display = "none";
    socket.emit('getCustomers',"");

    socket.on('takeCustomers',customers=>{
        createRental(customers);
    });
});

info_employee.addEventListener('click',()=>{
    document.querySelector('.address-content').style.display = "none";
    info_employee.style.backgroundColor = "#4d30d5";
    
    if(employeedivClicked != info_employee) employeedivClicked.style.backgroundColor = "";
    
    employeedivClicked = info_employee;
    document.querySelector('.content-employee').innerHTML = "";
    document.querySelector('.employee-accountDiv').style.display = "none";
    document.querySelector('.rental_content').style.display = "none";
    document.querySelector('.employee .movieInfo').style.display = "none";

    createInfo();
});

most_viewed_employee.addEventListener('click',()=>{
    document.querySelector('.address-content').style.display = "none";
    most_viewed_employee.style.backgroundColor = "#4d30d5";
    
    if(employeedivClicked != most_viewed_employee) employeedivClicked.style.backgroundColor = "";
    
    employeedivClicked = most_viewed_employee;

    document.querySelector('.content-employee').innerHTML = "";
    document.querySelector('.employee-accountDiv').style.display = "none";
    document.querySelector('.rental_content').style.display = "none";
    document.querySelector('.employee .movieInfo').style.display = "none";

    waitToGetFilms('getMostRent','takeMostRent').then(mostRent=>{

        for(let film of mostRent.films){
            createFilms(film,'films',document.querySelector('.content-employee'),mostRent.films.concat(mostRent.series));
        }
        for(let film of mostRent.series){
            createFilms(film,'films',document.querySelector('.content-employee'),mostRent.films.concat(mostRent.series));
        }
        
    })
});


customers_admin.addEventListener('click',()=>{
    document.querySelector('.admin .addAdmin').style.display = 'none';
    let adminContent = document.querySelector('.admin-content');
    document.querySelector('.admin .accountDiv').style.display = "none";
    customers_admin.style.backgroundColor = "#4d30d5";
    
    if(adminClicked != customers_admin) adminClicked.style.backgroundColor = "";

    adminClicked = customers_admin;

    waitToGetFilms('getCustomers','takeCustomers').then(customers=>{
        adminContent.innerHTML ="";
        startCount =2;
            
        for(let customer of customers){
            
            let customerButton = createCustomersAdmin(customer);
            customerButton.style.animation = "none";
            customerButton.style.opacity = '1';
            customerButton.addEventListener('click', () =>{
                let deleteCustomer = document.createElement('button');
                deleteCustomer.className = "deleteDiv";
                deleteCustomer.style.top = "5%";
                deleteCustomer.appendChild(document.createTextNode("delete"));
                adminContent.appendChild(deleteCustomer);

                deleteCustomer.addEventListener('click', () =>{
                    socket.emit("deleteCustomer",mail + "," + customer.customer_id);
                });
            });
        }
        addCustomer(adminContent);
        socket.on('customer deleted',data=>{
            customers_admin.click();
        })
    });
});

employees_button.addEventListener('click', () =>{

    let adminContent = document.querySelector('.admin-content');
    adminContent.innerHTML ="";
    document.querySelector('.admin .accountDiv').style.display = "none";

    employees_button.style.backgroundColor = "#4d30d5";
    
    if(adminClicked != employees_button) adminClicked.style.backgroundColor = "";

    adminClicked = employees_button;

    waitToGetFilms('getEmployees','takeEmployees').then(employees =>{
        document.querySelector('.admin .addAdmin').style.display = 'none';
        adminContent.innerHTML ="";
        for(let employee of employees){
            
            let customerButton = createCustomersAdmin(employee);
            customerButton.style.animation = "none";
            customerButton.style.opacity = '1';
            customerButton.addEventListener('click', () =>{
                let deleteCustomer = document.createElement('button');
                deleteCustomer.className = "deleteDiv";
                deleteCustomer.style.top = "5%";
                deleteCustomer.appendChild(document.createTextNode("delete"));
                adminContent.appendChild(deleteCustomer);
                let changeToAdmin = document.createElement('button');
                changeToAdmin.appendChild(document.createTextNode("change to administrator"));

                changeToAdmin.className = "changeToAdmin";
                adminContent.appendChild(changeToAdmin);
                deleteCustomer.addEventListener('click', () =>{
                    socket.emit("deleteEmployee",mail + "," + employee.employees_id);
                });

                changeToAdmin.addEventListener('click', () =>{
                    
                    socket.emit("changeToAdmin",mail + "," + employee.employees_id);
                })
            });
        }
        addEmployee(adminContent,'employee');
        socket.on('employee deleted',data=>{
            adminContent.innerHTML ="";
            employees_button.click();
        })
    });
    
});

admins.addEventListener('click', () =>{

    let adminContent = document.querySelector('.admin-content');
    adminContent.innerHTML ="";
    document.querySelector('.admin .accountDiv').style.display = "none";

    admins.style.backgroundColor = "#4d30d5";
    
    if(adminClicked != admins) adminClicked.style.backgroundColor = "";

    adminClicked = admins;

    waitToGetFilms('getAdmins','takeAdmins').then(admins =>{
        document.querySelector('.admin .addAdmin').style.display = 'none';
        adminContent.innerHTML ="";

        for(let admin of admins){
            
            let customerButton = createCustomersAdmin(admin);
            customerButton.style.animation = "none";
            customerButton.style.opacity = '1';
            customerButton.addEventListener('click', () =>{
                
                let changeToAdmin = document.createElement('button');
                changeToAdmin.appendChild(document.createTextNode("change to employee"));

                changeToAdmin.className = "changeToAdmin";
                adminContent.appendChild(changeToAdmin);
                
                changeToAdmin.addEventListener('click', () =>{
                    
                    socket.emit("changeToEmployee",mail + "," + admin.admin_id);
                });
            });
        }
    });
    socket.on('admin deleted',data=>{
        adminContent.innerHTML ="";
        admins.click();
    });
});


info_admin.addEventListener('click', () =>{

    let adminContent = document.querySelector('.admin-content');
    adminContent.innerHTML ="";
    document.querySelector('.admin .accountDiv').style.display = "none";

    info_admin.style.backgroundColor = "#4d30d5";
    
    if(adminClicked != info_admin) adminClicked.style.backgroundColor = "";

    adminClicked = info_admin;

    waitToGetFilms('getInfoAdmin','takeInfoAdmin').then(result =>{
        
        const monthNames = ["","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let row = document.createElement("div");
        row.id = "adminRow";

        let month = document.createElement("div");
        month.appendChild(document.createTextNode("Month"));
        month.id = "month";

        let totalIncome = document.createElement("div");
        totalIncome.appendChild(document.createTextNode("Total Income"));
        totalIncome.id = "totalIncome";

        row.appendChild(month);
        row.appendChild(totalIncome);
        adminContent.appendChild(row);

        changePrices(adminContent);

        for(let i =1; i<13; ++i) {
            let monthName = document.createElement('div');
            monthName.appendChild(document.createTextNode(monthNames[i]));
            month.appendChild(monthName);
            let income = document.createElement('div');
            totalIncome.appendChild(income);

            const el = result.filter(element =>{
                if(element.month == i) return element;

                else return 0;
            });

            if(el.length > 0) income.appendChild(document.createTextNode((el[0].incomeFilm + el[0].incomeSerie)));
            
            else income.appendChild(document.createTextNode(0));
        }
    });
});



signin.addEventListener('click',(e)=>{
    
    if(firstname.value.length !=0 && lastname.value.length !=0 && email.value.length !=0){
        e.preventDefault();
        
        socket = io.connect('http://localhost:5000/');

        socket.emit("credentials", tagname + "," + firstname.value + "," + lastname.value + "," + email.value);

        quitLogin(socket).then();
        createCategories(socket).then();
        
        socket.on('getFilms', movies => {
            
            if(customer_choice == 'FS' || customer_choice == 'F') createMovie(movies,".content");

            else notRegistered();
            
        });

        socket.on("getCustomers", customers => {
            document.querySelector('.customers_button').style.backgroundColor = "#4d30d5"
            createCustomers(customers);
        });

        socket.on('getCustomersAdmin', customers =>{
            customers_admin.style.backgroundColor = "#4d30d5";
            
            let adminContent = document.querySelector('.admin-content');
            
            document.querySelector('.admin-content').innerHTML = "";
        
            ++startCount;
                
            for(let customer of customers){
                
                let customerButton = createCustomersAdmin(customer);

                customerButton.addEventListener('click', () =>{
                    let deleteCustomer = document.createElement('button');
                    deleteCustomer.className = "deleteDiv";
                    deleteCustomer.style.top = "5%";
                    deleteCustomer.appendChild(document.createTextNode("delete"));
                    adminContent.appendChild(deleteCustomer);

                    deleteCustomer.addEventListener('click', () =>{
                        socket.emit("deleteCustomer",mail + "," + customer.customer_id);
                    });
                });
            }
            addCustomer(adminContent);
            socket.on('customer deleted',data=>{
                customers_admin.click();
            })
        })
    }
});




function checkCredentials(isAuthenticated){

    signin.classList.add("animating");
    
    
    if(isAuthenticated == true){

        document.getElementById('svg-path').setAttribute('d',checkAttribute);
        document.querySelector(".checkmark-svg").style.animation = "checkmark var(--circle-animation-time) calc(var(--squish-animation-time) + var(--progress-animation-time) + var(--circle-animation-time)) forwards"
        document.querySelector(".sign-in-button.animating + .checkmark-container").style.animation = "circle 300ms 3000ms forwards cubic-bezier(0.26, 0.6, 0.46, 1.7)"
        
        setTimeout(()=>{
            document.querySelector(".checkmark-container").style.opacity ="1";
        },3000)
        

        let messageDiv = document.createElement("div");
        let text = document.createTextNode("Sign in is successful!");
        messageDiv.appendChild(text);
        messageDiv.className = "messageDiv";
        document.querySelector(".user-box").appendChild(messageDiv);

    }
    else{
        
        document.getElementById('svg-path').setAttribute('d',xAttribute);
        document.querySelector(".checkmark-svg").style.animation = "x var(--circle-animation-time) calc(var(--squish-animation-time) + var(--progress-animation-time) + var(--circle-animation-time)) forwards"
        document.querySelector(".sign-in-button.animating + .checkmark-container").style.animation = "circle-x 300ms 3000ms forwards cubic-bezier(0.26, 0.6, 0.46, 1.7)"
        setTimeout(()=>{
            document.querySelector(".checkmark-container").style.opacity ="1";
        },3000)

        let messageDiv = document.createElement("div");
        let text = document.createTextNode("Wrong credentials try again!");

        messageDiv.appendChild(text);
        messageDiv.className = "messageDiv";
        document.querySelector(".user-box").appendChild(messageDiv);
        messageDiv.style.backgroundColor = "red";

        setTimeout(()=>{
            signin.classList.remove('animating')
            document.querySelector(".checkmark-container").style.opacity ="0";
            messageDiv.style.display = "none";

            firstname.value ="";
            lastname.value ="";
            email.value ="";

        },5000);
    }
}

function quitLogin(socket){

    return new Promise((resolve, reject)=>{
        socket.on('handshake', data => {
            if(data == 'Wrong'){
                checkCredentials(false);
            }
            else{
                checkCredentials(true);
                id = data.customer_id;
                mail = data.email;
                customer_choice = data.choice;
                
                setTimeout(()=>{
                    signInContainer.style.opacity = '0' 
                    setTimeout(()=>{
                        signInContainer.style.display = 'none';
                        films.style.backgroundColor = "#4d30d5";
                    },500);
                },5500);
                resolve();   
            }
        });
    })
}

function createCategories(socket){

    return new Promise((resolve, reject)=>{
        socket.on("getCategories",data =>{

            let genre = document.createElement("button");
            let text = document.createTextNode(data.toString());
            genre.appendChild(text);
    
            genre.className = "gottenCategory";
            document.querySelector('.categories').appendChild(genre);
            resolve();
        });
    });
}


function createMovie(movies,content){
    document.querySelector(".accountDiv").style.display = "none";
    document.querySelector('.movieInfo').style.display = "none";
    document.querySelector(content).style.animation = "none";
    document.querySelector(content).style.opacity= "1";
    let movies_count = document.createElement("div");
    
    movies_count.appendChild(document.createTextNode(movies.length + " movies"));
    movies_count.className = "movie-count";
    
    document.querySelector(content).appendChild(movies_count);
    if(startCount !=0) movies_count.style.opacity = "1";
    
    ++startCount;
    for(let movie of movies){
        let movieDiv = document.querySelector('.movieInfo');
        let button = document.createElement("button");
        let img = document.createElement("img");
        if(startCount === 1) {
            button.style.animation = "showContent 0.5s 6100ms forwards"
            movies_count.style.animation = "showContent 0.5s 6100ms forwards"
        }

        else {
            button.style.opacity = "1"
            movies_count.style.opacity = "1";
        };

        img.setAttribute("src", "../icons/film-image.jpg");
        img.setAttribute("width", "200px");
        img.setAttribute('height', "250px");

        
        let title = document.createTextNode(movie.title);
        let year = document.createTextNode(movie.release_year);

        let imgDiv = document.createElement("div");
        let titleDiv = document.createElement("div");
        let yearDiv = document.createElement("div");

        
        imgDiv.className = "imgDiv";
        titleDiv.className = "title";
        yearDiv.className = "year";
        button.className = "movieDiv"

        titleDiv.appendChild(title);
        yearDiv.appendChild(year);
        imgDiv.appendChild(img);

        button.appendChild(titleDiv);
        button.appendChild(yearDiv);
        button.appendChild(imgDiv);
        
        document.querySelector(content).appendChild(button);
        

        button.addEventListener('click',()=>{
            
            socket.emit("getFilmBuyStatus",id + "," + movie.film_id);
            document.querySelector('.movieInfo').style.display = "block";
            
            socket.on('checkedFilm',answer=>{
                createStandardMovieInfoHtml(button,movieDiv,movie);

                if(answer == false){
                    createRentButton(socket,movie);

                }
                else{
                    createOwnedButton();
                }

                
            });

        });
    }
}


function notRegistered() {
    let notRegisterDiv = document.createElement('div');
    let text = document.createTextNode("You have not registered for this feature yet, this can change through the account section!");

    notRegisterDiv.className = "notRegister";
    notRegisterDiv.appendChild(text);
    document.querySelector('.content').appendChild(notRegisterDiv);
}


function createRentButton(socket,movie) {
    let button = document.createElement('button');
    let text = document.createTextNode("RENT");

    button.className = "rentButton";
    button.appendChild(text);

    document.querySelector('.movieInfo').appendChild(button);

    button.addEventListener('click',()=>{
        socket.emit('rentFilm',id + "," +  movie.film_id + "," + customer_choice + "," + mail);
        
    });

    socket.on('rent_done',data=>{
        document.querySelector('.movieInfo').style.animation = "hideMovieInfo 1.6s forwards "
    });
}


function createOwnedButton() {
    let div = document.createElement('div');
    let text = document.createTextNode("OWNED");

    div.className = "owneDiv";
    div.appendChild(text);

    document.querySelector('.movieInfo').appendChild(div);
}

function createStandardMovieInfoHtml(button,movieDiv,movie){

    document.querySelector(".content").scrollTop = button.offsetTop - 20;
    movieDiv.innerHTML = "";
    movieDiv.style.animation = "showMovieInfo .6s forwards "

    let titleInMovieInfoDiv = document.createElement('div');
    let titleInMovieInfo = document.createTextNode(movie.title);

    let yearInMovieInfoDiv = document.createElement('div');
    let yearInMovieInfo = document.createTextNode(movie.release_year);

    let discriprionDiv = document.createElement('div');
    let discriprion = document.createTextNode(movie.description);

    let movieCategoryDiv = document.createElement('div');
    let movieCategory = document.createTextNode(movie.category);

    let languageDiv = document.createElement('div');
    let language = document.createTextNode(movie.language);

    let lengthDiv = document.createElement('div');
    let length = document.createTextNode(movie.length +" min");

    let ratingDiv = document.createElement('div');
    let rating = document.createTextNode(movie.rating);

    
    titleInMovieInfoDiv.className = "titleInMovieInfoDiv";
    yearInMovieInfoDiv.className = "yearInMovieInfoDiv";
    discriprionDiv.className = "discriprionDiv";
    movieCategoryDiv.className = "movieCategoryDiv";
    languageDiv.className = "languageDiv";
    lengthDiv.className = "lengthDiv";
    ratingDiv.className = "ratingDiv";


    titleInMovieInfoDiv.appendChild(titleInMovieInfo);
    yearInMovieInfoDiv.appendChild(yearInMovieInfo);
    discriprionDiv.appendChild(discriprion);
    movieCategoryDiv.appendChild(movieCategory);
    languageDiv.appendChild(language);
    lengthDiv.appendChild(length);
    ratingDiv.appendChild(rating);


    movieDiv.appendChild(titleInMovieInfoDiv);
    movieDiv.appendChild(discriprionDiv);
    movieDiv.appendChild(yearInMovieInfoDiv);
    movieDiv.appendChild(movieCategoryDiv);
    movieDiv.appendChild(languageDiv);
    movieDiv.appendChild(lengthDiv);
    movieDiv.appendChild(ratingDiv);

    let exit_button = document.createElement('button');
    let textButton = document.createTextNode('X');

    exit_button.className = 'exit_button';
    exit_button.appendChild(textButton);

    movieDiv.appendChild(exit_button);
    
    exit_button.addEventListener('click',()=>{
        movieDiv.style.animation = "hideMovieInfo .6s forwards "
    });

}

function createSeries(movies,content){
    document.querySelector(".accountDiv").style.display = "none";
    document.querySelector('.movieInfo').style.display = "none";
    document.querySelector(content).innerHtml = "";
    document.querySelector(content).style.animation = "none";
    document.querySelector(content).style.opacity= "1";
    let movies_count = document.createElement("div");
    
    movies_count.style.opacity = "1";
    movies_count.appendChild(document.createTextNode(movies.length + " series"));
    movies_count.className = "movie-count";
    document.querySelector(content).appendChild(movies_count);
    

    for(let movie of movies){

        let button = document.createElement("button");
        let img = document.createElement("img");
        
        
        img.setAttribute("src", "../icons/film-image.jpg");
        img.setAttribute("width", "200px");
        img.setAttribute('height', "250px");

        
        let title = document.createTextNode(movie.title);
        let year = document.createTextNode(movie.release_year);

        let imgDiv = document.createElement("div");
        let titleDiv = document.createElement("div");
        let yearDiv = document.createElement("div");

        
        imgDiv.className = "imgDiv";
        titleDiv.className = "title";
        yearDiv.className = "year";
        button.className = "movieDiv"

        button.style.animation = "none";
        button.style.opacity = "1";

        titleDiv.appendChild(title);
        yearDiv.appendChild(year);
        imgDiv.appendChild(img);

        button.appendChild(titleDiv);
        button.appendChild(yearDiv);
        button.appendChild(imgDiv);
        
        document.querySelector(content).appendChild(button);

        button.addEventListener('click',()=>{
            
            waitForSocket(movie,button).then(seasons =>{
                document.querySelector('.movieInfo').style.display = "block";
                createSeasons(seasons,movie);
            });
            
        });
    }

}


function createSeasons(seasons,movie) {
    let seasonsDiv = document.createElement('div');
    seasonsDiv.className = "seasonsDiv";
    
    for(let season of seasons) {
    
        let seasonButton = document.createElement('button');
        let textSeason = document.createTextNode("SEASON " + season.season_number);

        seasonButton.className = "seasonButton";

        seasonsDiv.appendChild(seasonButton);
        seasonButton.appendChild(textSeason);
        document.querySelector('.movieInfo').appendChild(seasonsDiv);
        
        seasonButton.addEventListener('click',()=>{
            
            waitForEpisodes(season,movie).then(episodes=>{
                createEpisodes(episodes,season,movie);
            })
            
        });
    }

}

function createEpisodes(episodes,season,movie) {
    document.querySelector(".accountDiv").style.display = "none";
    let seasonDiv = document.createElement("div");
    let seasonNumber = document.createTextNode("SEASON " + season.season_number);
    let movieInfo = document.querySelector(".movieInfo");
    let backButton = document.createElement("button");
    let backButtontxt = document.createTextNode("<");

    backButton.className = "backButton";
    backButton.appendChild(backButtontxt);

    let episodesDiv = document.createElement('div');

    episodesDiv.className = "episodes";

    seasonDiv.appendChild(seasonNumber);
    seasonDiv.className = "season_after_series";
    movieInfo.appendChild(episodesDiv);
    movieInfo.appendChild(seasonDiv);
    movieInfo.appendChild(backButton)

    backButton.addEventListener("click", ()=>{
        socket.emit('getSeasons',movie.serie_id);
        socket.on('takeSeasons',seasons =>{
            
            createStandardMovieInfoHtml(backButton,movieInfo,movie);
            document.querySelector('.lengthDiv').style.display = "none";
            document.querySelector('.ratingDiv').style.marginLeft = "475px";
            createSeasons(seasons,movie);
        });
    });

    for(let episode of episodes){
        
        let episodeDiv = document.createElement("div");


        let episodeNumber = document.createElement("div");
        let episodeNumbertxt = document.createTextNode("EPISODE " + episode.result.episode_number);

        let titleEp = document.createElement("div")
        let titletxt = document.createTextNode(episode.result.title);

        let description_ep = document.createElement("div");
        let descriptiontxt = document.createTextNode(episode.result.description);

        let eplength = document.createElement("div");
        let eplengthtxt = document.createTextNode(episode.result.length + " min")

        episodeDiv.className = "episodeDiv";
        titleEp.className = "titleEp";
        description_ep.className = "descriptionEp";
        eplength.className = "eplength";
        episodeNumber.className = "episodeNumber"; 
        //title
        episodeDiv.appendChild(titleEp);
        titleEp.appendChild(titletxt);

        episodesDiv.appendChild(episodeDiv);

        //length
        episodeDiv.appendChild(eplength);
        eplength.appendChild(eplengthtxt);

        //description
        episodeDiv.appendChild(description_ep);
        description_ep.appendChild(descriptiontxt);

        //episode number
        episodeDiv.appendChild(episodeNumber);
        episodeNumber.appendChild(episodeNumbertxt);

        let exit_button = document.createElement('button');
        let textButton = document.createTextNode('X');

        exit_button.className = 'exit_button';
        exit_button.appendChild(textButton);

        document.querySelector('.movieInfo').appendChild(exit_button);

        exit_button.addEventListener('click',()=>{
            movieInfo.style.animation = "hideMovieInfo .6s forwards "
        });

        let rentbutton = document.createElement('button');
        let rentext = document.createTextNode("RENT");
        rentbutton.className = "ep_rentButton";
        rentbutton.appendChild(rentext);
        episodeDiv.appendChild(rentbutton);
        
        rentbutton.addEventListener('click',()=>{
            socket.emit('rentEpisode',customer_choice + "," + id + "," + episode.result.episode_id + "," + mail)
            movieInfo.style.animation = "hideMovieInfo .6s forwards ";
        });

        let div = document.createElement('div');
        let text = document.createTextNode("OWNED");

        div.className = "ep_owneDiv";
        div.appendChild(text);
        episodeDiv.appendChild(div);
        
        if(episode.owned == true){
            div.style.display = "block";
            
        }
        else rentbutton.style.display = "block";
    
    }
}

function waitForSocket(movie,button){

    return new Promise((resolve, reject)=>{
        socket.emit('getSeasons',movie.serie_id);

            socket.on('takeSeasons',seasons =>{
                
                
                createStandardMovieInfoHtml(button,document.querySelector('.movieInfo'),movie);
                document.querySelector('.lengthDiv').style.display = "none";
                document.querySelector('.ratingDiv').style.marginLeft = "475px";
                resolve(seasons);
            });
    })
}

function waitForEpisodes(season){

    return new Promise((resolve, reject)=>{

        socket.emit("getEpisodes",season.season_id + "," + id);
            
        socket.on("episodes",episodes=>{
            document.querySelector(".movieInfo").innerHTML = "";
            resolve(episodes);
        });
    })
    
}


function createOwned(movies,div,contentDiv){
    document.querySelector(".accountDiv").style.display = "none";
    document.querySelector(div +' .movieInfo').style.display = "none";
    document.querySelector(contentDiv).style.opacity= "1";
   
    
    ++startCount;
    for(let movie of movies){
        let movieDiv = document.querySelector(div + ' .movieInfo');
        let button = document.createElement("button");
        let img = document.createElement("img");
        if(startCount === 1) button.style.animation = "showContent 0.5s 6100ms forwards"

        else button.style.opacity = "1";

        img.setAttribute("src", "../icons/film-image.jpg");
        img.setAttribute("width", "200px");
        img.setAttribute('height', "250px");

        
        let title = document.createTextNode(movie.title);
        let year = document.createTextNode(movie.release_year);

        let imgDiv = document.createElement("div");
        let titleDiv = document.createElement("div");
        let yearDiv = document.createElement("div");

        
        imgDiv.className = "imgDiv";
        titleDiv.className = "title";
        yearDiv.className = "year";
        button.className = "movieDiv"

        titleDiv.appendChild(title);
        yearDiv.appendChild(year);
        imgDiv.appendChild(img);

        button.appendChild(titleDiv);
        button.appendChild(yearDiv);
        button.appendChild(imgDiv);
        
        document.querySelector(contentDiv).appendChild(button);
        

        button.addEventListener('click',()=>{
            
            document.querySelector(div + ' .movieInfo').style.display = "block";
            
            createStandardMovieInfoHtml(button,movieDiv,movie);
            let datestr = movie.rental_date.toString();
            let date = new Date(datestr);
            let rentalDate = document.createElement('div');
            let rentalDatetxt = document.createTextNode("Rent on: " + date.getDate() + "-" + (date.getUTCMonth() +1) + "-" + date.getUTCFullYear());

            rentalDate.className = "rentalDate";
            rentalDate.appendChild(rentalDatetxt);
            document.querySelector(div+' .movieInfo').appendChild(rentalDate);

        });
    }
}

function createAccountInfo(data,div,messageTosocket,button){
    
    socket.emit("getCities","");
    let accountDiv = document.querySelector(div);
    accountDiv.style.display = "block";
    accountDiv.style.animation = "revealAccount 1s forwards cubic-bezier(0.03, 0.88, 0.76, 1.02)"
    let firstname = document.querySelector(div+" #firstnameArea");
    firstname.innerHTML  = data.first_name
    let choice = document.querySelector(div+" #chosen");
    let choice1 = document.querySelector(div+" #choice1");
    let choice2 = document.querySelector(div+" #choice2");
    let choice3 = document.querySelector(div+" #choice3");
    let address = document.querySelector(div+" #addressArea");
    let district = document.querySelector(div+" #districtArea");
    let postalCode = document.querySelector(div+" #postalcodeArea");
    let phone = document.querySelector(div+" #phoneArea");

    district.innerHTML = data.district;
    postalCode.innerHTML = data.postal_code;
    phone.innerHTML = data.phone;

    let cityname = document.querySelector(div+" #city_chosen");
    cityname.innerHTML = data.city;
    address.innerHTML = data.address;

    let countryname = document.querySelector(div+" #countryname");
    countryname.innerHTML = data.country;
    let lastname = document.querySelector(div+" #lastnameArea");
    lastname.innerHTML  = data.last_name

    let email = document.querySelector(div+" #emailtxt");
    email.innerHTML = data.email;

    let date = document.querySelector(div+" #datetxt");
    let datestr = data.create_date.toString();
    let dateUtc = new Date(datestr);
    let dateFinal = dateUtc.getDate() + "-" + (dateUtc.getMonth()+1) + "-" + dateUtc.getUTCFullYear();

    date.innerHTML = dateFinal.toString();

    if(data.choice == 'FS'){
        choice.innerHTML = "Films and Series";
    }
    else if(data.choice == 'S'){
        choice.innerHTML = "Series";
    }
    else if(data.choice == 'F'){
        choice.innerHTML = "Films";
    }
    choice1.innerHTML = "Films and Series"
    choice2.innerHTML = "Films"
    choice3.innerHTML = "Series"

    changeInnerHtml(choice1,choice);
    changeInnerHtml(choice2,choice);
    changeInnerHtml(choice3,choice);
    socket.on('cities',cities=>{
        document.querySelector(div+" .city-content").innerHTML = "";
    
        for(let city of cities){
            let cityButton = document.createElement('button');
            let citytxt = document.createTextNode(city.city);

            cityButton.className = 'cityButton';
            cityButton.appendChild(citytxt);

            document.querySelector(div+" .city-content").appendChild(cityButton);

            cityButton.addEventListener('focus',()=>{
                changeInnerHtml(cityButton,cityname).then(()=>{
                    countryname.innerHTML = city.country;
                });
                
            });
        }
        
    });
    
    document.querySelector(div + ' .save').addEventListener('click',()=>{
        let cityn = cityname.innerHTML;
        let c = choice.innerHTML;

        if(c == "Films and Series"){
            customer_choice = "FS"
        }
        else if(c == "Series") customer_choice = "S "
        else customer_choice = "F";
        

        if(firstname.value != "" && lastname.value != "" && address.value != "" && district.value != "" &&  postalCode.value != "" && phone.value != "" && email.value != "" && cityname.innnerHtml !=""){
            if(messageTosocket == "modify customer"){
               
                socket.emit(messageTosocket,[mail,{
                    id:data.customer_id,
                    firstname:firstname.value,
                    lastname:lastname.value,
                    address_id:data.address_id,
                    address:address.value,
                    district:district.value,
                    postalCode:postalCode.value,
                    phone:phone.value,
                    email:data.email, 
                    choice:c,
                    city:cityn
                }])
            }
            else{
                socket.emit(messageTosocket,[mail,{
                    firstname:firstname.value,
                    lastname:lastname.value,
                    address:address.value,
                    district:district.value,
                    postalCode:postalCode.value,
                    phone:phone.value,
                    email:email.value, 
                    choice:c,
                    city:cityn
                }])
                firstname.value = "" ;
                lastname.value = "" ;
                address.value = "" ;
                district.value = "";
                postalCode.value = "" ;
                phone.value = "" ;
                email.value = "" ;
                cityname.innnerHtml ="";
            }
            
            socket.on(messageTosocket,()=>{
                button.click();
            });
            
        }
    })
    
}

function changeInnerHtml(button,buttonToSwitch){

    return new Promise((resolve, reject) => {
        
        button.addEventListener('click',()=>{
            buttonToSwitch.innerHTML = button.innerHTML;
            resolve();
        })
    })
    
}


function createCustomers(customers) {
    document.querySelector('.content-employee').innerHTML = "";
    let movies_count = document.createElement("div");
    
    movies_count.appendChild(document.createTextNode(customers.length + " customers"));
    movies_count.className = "movie-count";
    
    document.querySelector('.content-employee').appendChild(movies_count);
    let accountDiv = document.querySelector('.employee-accountDiv')
    ++startCount;
    for(let customer of customers){
        
        let button = document.createElement("button");
        let img = document.createElement("img");
        if(startCount === 1) {
            button.style.animation = "showContent 0.5s 6100ms forwards"
            movies_count.style.animation = "showContent 0.5s 6100ms forwards"
        }

        else {
            button.style.opacity = "1"
            movies_count.style.opacity = "1";
        };

        img.setAttribute("src", "../icons/account.png");
        img.setAttribute("width", "200px");
        img.setAttribute('height', "250px");

        
        let title = document.createTextNode(customer.first_name + " " + customer.last_name);
        let year = document.createTextNode(customer.email);

        let imgDiv = document.createElement("div");
        let titleDiv = document.createElement("div");
        let yearDiv = document.createElement("div");

        
        imgDiv.className = "imgDiv";
        titleDiv.className = "title";
        yearDiv.className = "year";
        button.className = "movieDiv"

        titleDiv.appendChild(title);
        yearDiv.appendChild(year);
        imgDiv.appendChild(img);

        button.appendChild(titleDiv);
        button.appendChild(yearDiv);
        button.appendChild(imgDiv);
        
        document.querySelector('.content-employee').appendChild(button);
        

        button.addEventListener('click',()=>{
           
            createAccountInfo(customer,'.employee-accountDiv',"modify customer",customers_employee);
            document.querySelector('.employee-accountDiv .close').addEventListener('click',()=>{
                accountDiv.style.display = "none";
                
            })

        });
    }
}


function createRental(customers){
    document.querySelector('.content-employee').innerHTML = "";
    
    let rental_content = document.querySelector('.rental_content');
    let movies_count = document.createElement("div");
    
    movies_count.appendChild(document.createTextNode(customers.length + " customers"));
    movies_count.className = "movie-count";
    
    document.querySelector('.content-employee').appendChild(movies_count);
    
    ++startCount;
    for(let customer of customers){
        
        let button = document.createElement("button");
        let img = document.createElement("img");
        if(startCount === 1) {
            button.style.animation = "showContent 0.5s 6100ms forwards"
            movies_count.style.animation = "showContent 0.5s 6100ms forwards"
        }

        else {
            button.style.opacity = "1"
            movies_count.style.opacity = "1";
        };

        img.setAttribute("src", "../icons/account.png");
        img.setAttribute("width", "200px");
        img.setAttribute('height', "250px");

        
        let title = document.createTextNode(customer.first_name + " " + customer.last_name);
        let year = document.createTextNode(customer.email);

        let imgDiv = document.createElement("div");
        let titleDiv = document.createElement("div");
        let yearDiv = document.createElement("div");

        
        imgDiv.className = "imgDiv";
        titleDiv.className = "title";
        yearDiv.className = "year";
        button.className = "movieDiv"

        titleDiv.appendChild(title);
        yearDiv.appendChild(year);
        imgDiv.appendChild(img);

        button.appendChild(titleDiv);
        button.appendChild(yearDiv);
        button.appendChild(imgDiv);
        
        document.querySelector('.content-employee').appendChild(button);
        

        button.addEventListener('click',()=>{

            

            socket.emit('getOwned',customer.customer_id)
            socket.on('Owned',results=>{
                rental_content.style.display = "block";
                rental_content.style.animation = "revealAccount 1s forwards cubic-bezier(0.03, 0.88, 0.76, 1.02)"
                
                let movies_count = document.createElement("div");
                let amount = results.films.length + results.episodes.length;
                rental_content.innerHTML = "";
                movies_count.appendChild(document.createTextNode(amount + " movies"));
                movies_count.className = "movie-count";
                movies_count.style.opacity = "1";
                rental_content.appendChild(movies_count);

                for(let result in results){
                    createOwned(results[result],'.employee','.rental_content');

                }
                let rentalof = document.createElement("div");
                let renttxt = document.createTextNode("Rental of customer: " + customer.first_name + " "+ customer.last_name);
                rentalof.className = "rentalof";
                rentalof.appendChild(renttxt);
                rental_content.appendChild(rentalof);
                let close = document.createElement("button");
                let closetxt = document.createTextNode('x');

                close.className ="close";
                close.appendChild(closetxt);
                rental_content.appendChild(close);
                close.addEventListener('click',()=>{
                    document.querySelector(".employee .movieInfo").style.display = "none";
                    rental_content.style.display = "none";
                    
                });
            })
        })
    }
}

function createInfo() {
    document.querySelector('.address-content').style.display = "none";
    let movieInfo = document.querySelector(".employee .movieInfo");
    let buttonsDiv = document.createElement("div");
    let close = document.createElement("button");
    let closetxt = document.createTextNode('x');

    let clicked = buttonsDiv;
    close.className ="close_info_content";
    close.appendChild(closetxt);


    let contentDiv = document.createElement("div");
    contentDiv.className = "info-content";
    let actorButton = document.createElement("button");
    let actortxt = document.createTextNode("Actors")

    actorButton.appendChild(actortxt);
    actorButton.className = 'infoButton';

    let moviesButton = document.createElement("button");
    let moviestxt = document.createTextNode("movies");

    moviesButton.className = "infoButton";
    moviesButton.appendChild(moviestxt);
    
    let seriesButton = document.createElement("button");
    let seriestxt = document.createTextNode("series");

    seriesButton.className = "infoButton";
    seriesButton.appendChild(seriestxt);

    let languageButton = document.createElement("button");
    let languagetxt = document.createTextNode("languages");

    languageButton.className = "infoButton";
    languageButton.appendChild(languagetxt);

    
    let categoryButton = document.createElement("button");
    let categorytxt = document.createTextNode("categories");

    categoryButton.className = "infoButton";
    categoryButton.appendChild(categorytxt);

    let addressButton = document.createElement("button");
    let addresstxt = document.createTextNode("addresses");

    addressButton.className = "infoButton";
    addressButton.appendChild(addresstxt);

    let cityButton = document.createElement("button");
    let citytxt = document.createTextNode("cities");

    cityButton.className = "infoButton";
    cityButton.appendChild(citytxt);

    let countryButton = document.createElement("button");
    let countriestxt = document.createTextNode("countries");

    countryButton.className = "infoButton";
    countryButton.appendChild(countriestxt);

    buttonsDiv.className = "buttonsDiv";

    buttonsDiv.appendChild(actorButton);
    buttonsDiv.appendChild(moviesButton);
    buttonsDiv.appendChild(seriesButton);
    buttonsDiv.appendChild(languageButton);
    buttonsDiv.appendChild(categoryButton);
    buttonsDiv.appendChild(addressButton);
    buttonsDiv.appendChild(cityButton);
    buttonsDiv.appendChild(countryButton);
    document.querySelector('.content-employee').appendChild(buttonsDiv);
    document.querySelector('.content-employee').appendChild(contentDiv);

    contentDiv.appendChild(close);
    close.addEventListener('click',()=>{
        contentDiv.style.display='none'; 
        contentDiv.innerHTML = '';
        movieInfo.style.display='none';
        clicked.style.borderBottom = "";
        clicked.style.letterSpacing = "";
       
    });
    actorButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        movieInfo.style.display='none';
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        contentDiv.innerHTML = "";
        contentDiv.appendChild(close);
        if(clicked != actorButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = actorButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";

        let addActorDiv = document.createElement("div");
        let addActorTitle = document.createElement("div")
        let addActorTitletxt = document.createTextNode("Add new Actor");

        addActorDiv.className = 'addActorDiv';
        addActorTitle.className = "addActorTitle";
        addActorTitle.appendChild(addActorTitletxt);
        addActorDiv.appendChild(addActorTitle);

        contentDiv.appendChild(addActorDiv);
        let firstnameDiv = document.createElement('div');
        let firstnametxt = document.createTextNode('First name:');
        let firstnameArea = document.createElement('textarea');

        firstnameDiv.appendChild(firstnametxt);
        firstnameDiv.appendChild(firstnameArea);

        firstnameDiv.className = 'firstnameDiv';
        
        addActorDiv.appendChild(firstnameDiv)

        let lastnameDiv = document.createElement('div');
        let lastnametxt = document.createTextNode('Last name:');
        let lastnameArea = document.createElement('textarea');

        lastnameDiv.appendChild(lastnametxt);
        lastnameDiv.appendChild(lastnameArea);

        lastnameDiv.className = 'lastnameDiv';
        
        addActorDiv.appendChild(lastnameDiv);
        
        let add = document.createElement('button');
        add.className = 'add';
        add.appendChild(document.createTextNode("add"));
        addActorDiv.appendChild(add);


        add.addEventListener('click',()=>{

            if(firstnameArea.value !="" && lastnameArea.value !=""){
                socket.emit('add actor',firstnameArea.value + "," + lastnameArea.value + "," + mail);
                firstnameArea.value = "";
                lastnameArea.value = "";
            }
            
        });



        let deleteactorDiv = document.createElement("div");
        let deleteTitle = document.createElement("div")
        let deleteActorTitletxt = document.createTextNode("Delete Actor");

        deleteactorDiv.className = 'deleteactorDiv';
        deleteTitle.className = "deleteTitle";
        deleteTitle.appendChild(deleteActorTitletxt);
        deleteactorDiv.appendChild(deleteTitle);

        let deletefirstname = firstnameDiv.cloneNode(true);
        let deletelastname = lastnameDiv.cloneNode(true);
        contentDiv.appendChild(deleteactorDiv);
        deleteactorDiv.appendChild(deletefirstname);
        deleteactorDiv.appendChild(deletelastname);

        let deleteButton = document.createElement('button');
        let fnarea = document.querySelector('.deleteactorDiv .firstnameDiv textarea');
        let lnarea = document.querySelector('.deleteactorDiv .lastnameDiv textarea');
        deleteButton.className = 'delete';
        deleteButton.appendChild(document.createTextNode("delete"));
        deleteactorDiv.appendChild(deleteButton);

        deleteButton.addEventListener("click",()=>{
            if(fnarea.value != "" && lnarea.value != ""){
                socket.emit('delete actor',fnarea.value + "," + lnarea.value + "," + mail);
                fnarea.value = "" ;
                lnarea.value = "";
            }
        });

    });


    moviesButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        movieInfo.style.display='none';
        contentDiv.innerHTML = "";
        contentDiv.appendChild(close);
        if(clicked != moviesButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = moviesButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";

        
        
        waitToGetFilms('getFilms','getFilms').then(films=>{
            contentDiv.innerHTML = "";
            let addmovieButton = document.createElement("button");
            let addmovietxt = document.createTextNode("add film");
            addmovieButton.appendChild(addmovietxt);
            addmovieButton.className = "addmovie";
            contentDiv.appendChild(addmovieButton);

            addmovieButton.addEventListener("click",()=>{
                movieInfo.style.display = "block";
                movieInfo.style.animation = "showMovieInfo .6s forwards ";
                movieInfo.innerHTML = "";
                
                createFilmHtml("","","","Choose language","","Choose rating",'add film','new film',"Choose category","" );
            });

            for(let film of films){
                let filmButton = createFilms(film,"movies",contentDiv,films);
                filmButton.addEventListener('click',()=>{
                    movieInfo.style.display = "block";
                    movieInfo.style.animation = "showMovieInfo .6s forwards ";
                    movieInfo.innerHTML = "";
                    
                    createFilmHtml(film.title,film.description, film.release_year, film.language,film.length,film.rating,"modify/delete film","modify film",film.category,film.film_id);
                    let deleteDiv = document.createElement("button");
                    deleteDiv.className = "deleteDiv";
                    deleteDiv.appendChild(document.createTextNode("Delete"));
                    movieInfo.appendChild(deleteDiv);

                    deleteDiv.addEventListener('click',()=>{
                        movieInfo.style.display = "none";
                        socket.emit("delete film",[film.film_id,mail]);
                    });
                });
            }
            socket.on('film deleted',data=>{
                moviesButton.click();
            })
        });
            
    })

    seriesButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        movieInfo.style.display='none';
        contentDiv.innerHTML = "";
        contentDiv.appendChild(close);
        if(clicked != seriesButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = seriesButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";
        
        waitToGetFilms('getSeries',"takeSeries").then(series=>{
            contentDiv.innerHTML = "";
            let addmovieButton = document.createElement("button");
            let addmovietxt = document.createTextNode("add series");
            addmovieButton.appendChild(addmovietxt);
            addmovieButton.className = "addmovie";
            contentDiv.appendChild(addmovieButton);

            addmovieButton.addEventListener("click",()=>{
                movieInfo.style.display = "block";
                movieInfo.style.animation = "showMovieInfo .6s forwards ";
                movieInfo.innerHTML = "";
                
                createFilmHtml("","","","Choose language","-","Choose rating",'add series','new series',"Choose Category","" );
            });

            for(let film of series){
                let filmButton = createFilms(film,"series",contentDiv,series);
                filmButton.addEventListener('click',()=>{
                    movieInfo.style.display = "block";
                    movieInfo.style.animation = "showMovieInfo .6s forwards ";
                    movieInfo.innerHTML = "";
                    
                    createFilmHtml(film.title,film.description, film.release_year, film.language,"-",film.rating,"modify/delete series","modify series",film.category,film.serie_id);
                    let deleteDiv = document.createElement("button");
                    deleteDiv.className = "deleteDiv";
                    deleteDiv.appendChild(document.createTextNode("Delete"));
                    movieInfo.appendChild(deleteDiv);

                    deleteDiv.addEventListener('click',()=>{     
                        socket.emit("delete series",[film.serie_id,mail]);

                        socket.on("series deleted",data=>{
                            movieInfo.style.display = "none";
                            seriesButton.click();
                        });
                        
                    });
                });
            }
            
        });
    });

    languageButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        movieInfo.style.display='none';
        
        contentDiv.appendChild(close);
        if(clicked != languageButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = languageButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";

        socket.emit('getLanguages','');
        
        socket.on('takeLanguages',languages =>{
            contentDiv.innerHTML = "";
            let addcategoryButton = document.createElement("button");
            addcategoryButton.appendChild(document.createTextNode("add language"));
           
            addcategoryButton.id = "add-content";
            let name = document.createElement("textarea");
            name.id = "add_category_area";
            contentDiv.appendChild(name)
            contentDiv.appendChild(addcategoryButton);
    
            addcategoryButton.addEventListener('click',() => {
                name.style.display = 'block';
            });

            name.addEventListener('keypress',event => {
                if(event.key == "Enter" && name.value!=0 ) {
                    event.preventDefault();
                    if(languages.some(e =>e.name == capitalizeFirstLetter(name.value)) == 0){
                        socket.emit("new language",[capitalizeFirstLetter(name.value),mail]);
                        name.value = "";
                    }
                    else{
                        name.value = "Already exists"
                    }
                    
                }
            })
            
            for(let language of languages){
                createOneRowDivs(language.name,contentDiv, "delete language", language.language_id);
                
                socket.on('deleted language',data =>{
                    contentDiv.innerHTML = "";
                    languageButton.click();
                });
            }
        });
    });

    categoryButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        movieInfo.style.display='none';
        contentDiv.innerHTML = "";
        contentDiv.appendChild(close);
        if(clicked != categoryButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = categoryButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";

       
        
        waitToGetFilms('getCategories',"takeCategories").then(categories=>{
            contentDiv.innerHTML = "";
            let addcategoryButton = document.createElement("button");
            addcategoryButton.appendChild(document.createTextNode("add category"));
           
            addcategoryButton.id = "add-content";
            let name = document.createElement("textarea");
            name.id = "add_category_area";
            contentDiv.appendChild(name)
            contentDiv.appendChild(addcategoryButton);
    
            addcategoryButton.addEventListener('click',() => {
                name.style.display = 'block';
            });

            name.addEventListener('keypress',event => {
                if(event.key == "Enter" && name.value!=0 ) {
                    event.preventDefault();
                    if(categories.some(e =>e.name == capitalizeFirstLetter(name.value)) == 0){
                        socket.emit("new category",[capitalizeFirstLetter(name.value),mail]);
                        name.value = "";
                    }
                    else{
                        name.value = "Already exists"
                    }
                    
                }
            })
            
            for(let category of categories){
                createOneRowDivs(category.name,contentDiv, "delete category", category.category_id);
            }
            socket.on('deleted category',data =>{
                contentDiv.innerHTML = "";
                categoryButton.click();
            });
        });
    });


    countryButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        movieInfo.style.display='none';
        contentDiv.innerHTML = "";
        contentDiv.appendChild(close);
        if(clicked != countryButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = countryButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";

       
        
        waitToGetFilms('getCountries',"takeCountries").then(countries=>{
            contentDiv.innerHTML = "";
            let addcategoryButton = document.createElement("button");
            addcategoryButton.appendChild(document.createTextNode("add country"));
           
            addcategoryButton.id = "add-content";
            let name = document.createElement("textarea");
            name.id = "add_category_area";
            contentDiv.appendChild(name)
            contentDiv.appendChild(addcategoryButton);
    
            addcategoryButton.addEventListener('click',() => {
                name.style.display = 'block';
            });

            name.addEventListener('keypress',event => {
                if(event.key == "Enter" && name.value!=0 ) {
                    event.preventDefault();
                    if(countries.some(e =>e.country == capitalizeFirstLetter(name.value)) == 0){
                        socket.emit("new country",[capitalizeFirstLetter(name.value),mail]);
                        name.value = "";
                    }
                    else{
                        name.value = "Already exists"
                    }
                    
                }
            })
            
            for(let country of countries){
                createOneRowDivs(country.country,contentDiv, "delete country", country.country_id);
            }
            socket.on('deleted country',data =>{
                contentDiv.innerHTML = "";
                countryButton.click();
            });
        });
    });

    cityButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        movieInfo.style.display='none';
        contentDiv.innerHTML = "";
        contentDiv.appendChild(close);
        if(clicked != cityButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = cityButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";

        waitToGetFilms('getCities',"cities").then(cities=>{

            contentDiv.innerHTML = "";
            let addcategoryButton = document.createElement("button");
            addcategoryButton.appendChild(document.createTextNode("add city"));
           
            addcategoryButton.id = "add-content";
            let name = document.createElement("textarea");
            name.id = "add_category_area";
            contentDiv.appendChild(name)
            contentDiv.appendChild(addcategoryButton);
            let countryTitle = document.createElement('button');
            addcategoryButton.addEventListener('click',() => {
                name.style.display = 'block';

                waitToGetFilms('getCountries',"takeCountries").then(countries=>{
                    
                    let countriesDiv = document.createElement('div');
                    countryTitle.appendChild(document.createTextNode("choose country"));
                    countryTitle.style.border = "1px white solid";
                    countriesDiv.className = 'countryChoose'
                    countriesDiv.appendChild(countryTitle);
                    let countriesContent = document.createElement('div');
                    countriesDiv.appendChild(countriesContent);
                    countriesContent.className = 'countryContent';
    
                    contentDiv.appendChild(countriesDiv);

                    for(let country of countries) {
                        let button = document.createElement('button');
                        button.appendChild(document.createTextNode(country.country));
                        countriesContent.appendChild(button);
                        button.addEventListener('focus', () =>{
                            countryTitle.innerHTML = button.innerHTML;
                        });
                    }

                })
            });
            name.addEventListener('keypress',event => {
                if(event.key == "Enter"){
                    event.preventDefault();
                    if(name.value!=0 && countryTitle.innerHTML != "choose country") {
                        if(cities.some(e =>e.city == capitalizeFirstLetter(name.value)) == 0){
                            socket.emit("new city",capitalizeFirstLetter(name.value) + "," + countryTitle.innerHTML + "," + mail);
                            name.value = "";
                        }
                        else{
                            name.value = "Already exists"
                        }
                    }
                    else if(countryTitle.innerHTML == "choose country"){
                        name.value = "choose country first"
                    }
                }                            
            })
            
            
            for(let city of cities){
                createOneRowDivs(city.city,contentDiv, "delete city", city.city_id);
            }
            socket.on('deleted city',data =>{
                contentDiv.innerHTML = "";
                cityButton.click();
            });
        });
    });

    addressButton.addEventListener('click',()=>{
        document.querySelector('.address-content').style.display = "none";
        contentDiv.style.animation = "animateInfoContent .5s forwards cubic-bezier(0.4, 0, 1, 1)"
        contentDiv.style.display='block'; 
        movieInfo.style.display='none';
        contentDiv.innerHTML = "";
        contentDiv.appendChild(close);
        if(clicked != addressButton){
            clicked.style.borderBottom = "";
            clicked.style.letterSpacing = "";
        }
        clicked = addressButton;
        clicked.style.borderBottom = "1px white solid";
        clicked.style.letterSpacing = "3.1px";

        waitToGetFilms("getAddresses",'takeAddresses').then(addresses=>{
            contentDiv.innerHTML = "";
            createAddress(contentDiv,addresses);

            socket.on('deleted address',data=>{
                contentDiv.innerHTML = "";
                addressButton.click();
            });
        })
    });            
}


function createFilms(film,count,contentDiv,films) {
    let movies_count = document.createElement("div");
    
    movies_count.appendChild(document.createTextNode(films.length + " "+ count));
    movies_count.className = "movie-count";
    
    contentDiv.appendChild(movies_count);

    
    movies_count.style.opacity = "1";
    let button = document.createElement("button");
    let img = document.createElement("img");
    

    button.style.opacity = "1"

    img.setAttribute("src", "../icons/film-image.jpg");
    img.setAttribute("width", "200px");
    img.setAttribute('height', "250px");

    
    let title = document.createTextNode(film.title);
    let year = document.createTextNode(film.release_year);

    let imgDiv = document.createElement("div");
    let titleDiv = document.createElement("div");
    let yearDiv = document.createElement("div");

    
    imgDiv.className = "imgDiv";
    titleDiv.className = "title";
    yearDiv.className = "year";
    button.className = "movieDiv"

    titleDiv.appendChild(title);
    yearDiv.appendChild(year);
    imgDiv.appendChild(img);

    button.appendChild(titleDiv);
    button.appendChild(yearDiv);
    button.appendChild(imgDiv);
    
    contentDiv.appendChild(button);
    return button;
}


function createFilmHtml(title,description,release_year,language,length,rating,divtitle,socketmessage,category,film_id){
    let movieInfo = document.querySelector(".employee .movieInfo");
    let titleDiv = document.createElement('div');
    titleDiv.appendChild(document.createTextNode("title:"));
    let titleArea = document.createElement('textarea');
    titleArea.value = title;
    titleDiv.className = "titleDiv";
    titleDiv.appendChild(titleArea);

    let descriptionDiv = document.createElement('div');
    descriptionDiv.appendChild(document.createTextNode("description:"));
    let descriptionArea = document.createElement('textarea');
    descriptionArea.value = description;
    descriptionDiv.className = "description"; 
    descriptionDiv.appendChild(descriptionArea);

    let release_year_div = document.createElement('div');
    release_year_div.appendChild(document.createTextNode("release year:"));
    let release_year_area = document.createElement('textarea');
    release_year_div.className = "release_year"
    release_year_area.value = release_year;
    release_year_div.appendChild(release_year_area);

    let languagename = document.createElement('div');
    languagename.appendChild(document.createTextNode("language:"));
    languagename.className = "language";
    
    let languageTitle = document.createElement('button');
    waitToGetFilms('getLanguages',"takeLanguages").then(languages=>{
                    
        let languagesDiv = document.createElement('div');
        languageTitle.appendChild(document.createTextNode(language));
        languageTitle.style.border = "1px white solid";
        languagesDiv.className = 'languageChoose'
        languagesDiv.appendChild(languageTitle);
        let languageContent = document.createElement('div');
        languagesDiv.appendChild(languageContent);
        languageContent.className = 'languageContent';

        movieInfo.appendChild(languagesDiv);

        for(let language of languages) {
            let button = document.createElement('button');
            button.appendChild(document.createTextNode(language.name));
            languageContent.appendChild(button);
            button.addEventListener('focus', () =>{
                languageTitle.innerHTML = button.innerHTML;
            });
        }

    });

    let categoryTitle = document.createElement('button');
    let categoryname = document.createElement('div');
    categoryname.appendChild(document.createTextNode("category:"));
    categoryname.className = "categoryname";
    waitToGetFilms('getCategories',"takeCategories").then(categories=>{
        
        let categoryDiv = document.createElement('div');
        categoryTitle.appendChild(document.createTextNode(category));
        categoryTitle.style.border = "1px white solid";
        categoryDiv.className = 'categoryChoose'
        categoryDiv.appendChild(categoryTitle);
        let categoryContent = document.createElement('div');
        categoryDiv.appendChild(categoryContent);
        categoryContent.className = 'languageContent';

        movieInfo.appendChild(categoryDiv);

        for(let category of categories) {
            let button = document.createElement('button');
            button.appendChild(document.createTextNode(category.name));
            categoryContent.appendChild(button);
            button.addEventListener('focus', () =>{
                categoryTitle.innerHTML = button.innerHTML;
            });
        }

    });

    let lengthdiv = document.createElement('div');
    lengthdiv.appendChild(document.createTextNode("length:"));
    let lengthdivarea = document.createElement('textarea');
    lengthdiv.className = "length"
    lengthdivarea.value = length;
    lengthdiv.appendChild(lengthdivarea);


    let ratingname = document.createElement('div');
    ratingname.appendChild(document.createTextNode("rating:"));
    ratingname.className = "rating"
    let ratingTitle = document.createElement('button');
    let ratingDiv = document.createElement('div');
    ratingTitle.appendChild(document.createTextNode(rating));
    ratingTitle.style.border = "1px white solid";
    ratingDiv.className = 'ratingChoose'
    ratingDiv.appendChild(ratingTitle);
    let ratingContent = document.createElement('div');
    ratingDiv.appendChild(ratingContent);
    ratingContent.className = 'languageContent';

    movieInfo.appendChild(ratingDiv);    

    for(let rating of ["G",'PG','PG-13','R','NC-17']){
        let button = document.createElement('button');
        button.appendChild(document.createTextNode(rating));
        ratingContent.appendChild(button);
        button.addEventListener('focus', () =>{
            ratingTitle.innerHTML = button.innerHTML;
        });
    }
    

    movieInfo.appendChild(release_year_div);
    movieInfo.appendChild(descriptionDiv);
    movieInfo.appendChild(titleDiv);
    movieInfo.appendChild(categoryname);
    movieInfo.appendChild(lengthdiv);
    movieInfo.appendChild(languagename);
    movieInfo.appendChild(ratingname);
    let close = document.createElement("button");
    let closetxt = document.createTextNode('x');

    close.className ="close_info_content";
    close.appendChild(closetxt);

    movieInfo.appendChild(close);

    close.addEventListener("click",()=>{
        movieInfo.innerHTML = "";
        movieInfo.style.display = "none";
    })

    let save = document.createElement("button");
    save.appendChild(document.createTextNode('save'));
    save.className = "save-employee-info";
    movieInfo.appendChild(save);

    let newFilm = document.createElement("div");
    newFilm.appendChild(document.createTextNode(divtitle));
    newFilm.className = "newFilm";
    movieInfo.appendChild(newFilm);

    save.addEventListener("click",()=>{

        if(titleArea.value != "" && descriptionArea.value != "" 
        && release_year_area.value!="" && languageTitle.innerHTML != "Choose language" 
        && lengthdivarea.value!="" && ratingTitle.innerHTML!="Choose rating" && categoryTitle.innerHTML!="Choose category"){
            movieInfo.style.display = "none";
            socket.emit(socketmessage,
                {
                    title: titleArea.value,
                    description: descriptionArea.value,
                    release_year: release_year_area.value,
                    language: languageTitle.innerHTML,
                    length: lengthdivarea.value,
                    rating: ratingTitle.innerHTML,
                    category: categoryTitle.innerHTML,
                    id:film_id,
                    email:mail
                } 
            );
        }
        
    })
}

function waitToGetFilms(messageToSend,messageToGet){

    return new Promise((resolve, reject)=>{
        socket.emit(messageToSend,"");
        socket.on(messageToGet,films=>{
            resolve(films)
        });
    })
    
}

function createOneRowDivs(title,contentDiv,messageTosocket,divid){
    
    let titleDiv = document.createElement("button")
    titleDiv.appendChild(document.createTextNode(title))
    titleDiv.className = "onerowDiv"
    contentDiv.appendChild(titleDiv);


    titleDiv.addEventListener("click",()=>{
        let btn = document.createElement('button');
        btn.appendChild(document.createTextNode('delete'));
        btn.className = 'deleteFromOnerow';
        contentDiv.appendChild(btn);

        btn.addEventListener('click',()=>{
            socket.emit(messageTosocket,[divid,mail])
        })
    })
}

function createAddress(contentDiv,addresses){
    let row = document.createElement("div");
    row.className = "row_address";

    let addressDiv = document.createElement("div");
    addressDiv.appendChild(document.createTextNode("ADDRESS"));

    let districtDiv = document.createElement("div");
    districtDiv.appendChild(document.createTextNode("DISTRICT"));

    let cityDiv = document.createElement("div");
    cityDiv.appendChild(document.createTextNode("CITY"));

    let postalCodeDiv = document.createElement("div");
    postalCodeDiv.appendChild(document.createTextNode("POSTAL CODE"));

    let phoneDiv = document.createElement("div");
    phoneDiv.appendChild(document.createTextNode("PHONE"));

    row.appendChild(addressDiv);
    row.appendChild(districtDiv);
    row.appendChild(cityDiv);
    row.appendChild(postalCodeDiv);
    row.appendChild(phoneDiv);

    let addAddress = document.createElement("button");
    addAddress.id = "add-content";
    addAddress.appendChild(document.createTextNode("add address"));
    contentDiv.appendChild(addAddress);
    
    addAddress.addEventListener("click",()=>{
        document.querySelector('.address-content').style.display = "block";
        let cityChoice = document.getElementById('city_chose');
        waitToGetFilms('getCities','cities').then(cities=>{
            for(let city of cities){
                waitForButton(city).then(button=>{
                    waitClick(button).then(html=>{
                        cityChoice.innerHTML = html;
                    })
                });

            }
            document.querySelector('.address-content .save').addEventListener('click',()=>{

                if(document.querySelector('.address-content #addressArea').value !='' && document.querySelector('.address-content #districtArea').value != '' && cityChoice.innerHTML !='Choose city' && document.querySelector('.address-content #postalcodeArea').value != ''  && document.querySelector('.address-content #phoneArea').value != ''){
                    socket.emit('new address',[document.querySelector('.address-content #addressArea').value,document.querySelector('.address-content #districtArea').value,cityChoice.innerHTML,document.querySelector('.address-content #postalcodeArea').value, document.querySelector('.address-content #phoneArea').value,mail]);
                }
            });

            document.querySelector('.address-content .close').addEventListener('click',()=>{
                document.querySelector('.address-content').style.display = "none";
            });
        });
        
    });

    contentDiv.appendChild(row);
    for(let address of addresses){
        let addressClone = addressDiv.cloneNode();
        addressClone.appendChild(document.createTextNode(address.address));

        let districtClone = districtDiv.cloneNode();
        districtClone.appendChild(document.createTextNode(address.district));

        let cityClone = cityDiv.cloneNode();
        cityClone.appendChild(document.createTextNode(address.city));

        let postalCodeClone = postalCodeDiv.cloneNode();
        postalCodeClone.appendChild(document.createTextNode(address.postal_code));

        let phoneClone = phoneDiv.cloneNode();
        phoneClone.appendChild(document.createTextNode(address.phone))


        let deleteButton = document.createElement('button');
        deleteButton.appendChild(document.createTextNode('delete'));


        addressDiv.appendChild(addressClone);
        districtDiv.appendChild(districtClone);
        cityDiv.appendChild(cityClone);
        postalCodeDiv.appendChild(postalCodeClone);
        phoneDiv.appendChild(phoneClone);
        phoneDiv.appendChild(deleteButton);

        deleteButton.addEventListener('click',()=>{
            socket.emit('delete address',[address.address_id,mail]);
        });

    }
    
}


function waitForButton(city){
    return new Promise((resolve, reject) =>{
        let button = document.createElement('button');
        let text = document.createTextNode(city.city)
        button.appendChild(text)
        document.querySelector('.city_content').appendChild(button);
        resolve(button);
    })
}


function waitClick(button){

    return new Promise((resolve, reject) => {
        button.addEventListener('mousedown',()=>{
                        
            resolve(button.innerHTML);
     
         });
    })
   
}

function createCustomersAdmin(customer){
    let button = document.createElement("button");
    let img = document.createElement("img");
    if(startCount === 1) {
        button.style.animation = "showContent 0.5s 6100ms forwards"
    }

    else {
        button.style.opacity = "1"
    };

    img.setAttribute("src", "../icons/account.png");
    img.setAttribute("width", "200px");
    img.setAttribute('height', "250px");

    
    let title = document.createTextNode(customer.first_name + " " + customer.last_name);
    let year = document.createTextNode(customer.email);

    let imgDiv = document.createElement("div");
    let titleDiv = document.createElement("div");
    let yearDiv = document.createElement("div");

    
    imgDiv.className = "imgDiv";
    titleDiv.className = "title";
    yearDiv.className = "year";
    button.className = "movieDiv"

    titleDiv.appendChild(title);
    yearDiv.appendChild(year);
    imgDiv.appendChild(img);

    button.appendChild(titleDiv);
    button.appendChild(yearDiv);
    button.appendChild(imgDiv);
    
    document.querySelector('.admin-content').appendChild(button);

    return button;
}

function addCustomer(adminContent){
    let addCustomer = document.createElement('button');
    addButton = addCustomer.appendChild(document.createTextNode("create customer"));
    addCustomer.id = 'add-content'; 

    adminContent.appendChild(addCustomer);

    addCustomer.addEventListener('click', ()=>{
        createAccountInfo(
            {
                first_name:"",
                last_name:"",
                choice:"FS",
                email:"",
                city:"",
                country:"",
                postal_code:"",
                phone:"",
                address:"",
                district:"",
                create_date:new Date(),
            }
        ,'.admin .accountDiv',"new customer",customers_admin);

        document.querySelector('.admin .accountDiv .close').addEventListener('click',()=>{
            document.querySelector('.admin .accountDiv').style.display = "none";
        });
    });
}

function addEmployee(adminContent,createName){
    let addCustomer = document.createElement('button');
    addButton = addCustomer.appendChild(document.createTextNode("create " + createName));
    addCustomer.id = 'add-content'; 

    adminContent.appendChild(addCustomer);

    addCustomer.addEventListener('click',()=>{
        document.querySelector('.admin .addAdmin').style.display = 'block';
        document.querySelector('.admin .addAdmin').style.animation = 'showAdmin 500ms cubic-bezier(0.34, 1.21, 0.74, 1.4) forwards';

        document.querySelector('.addAdmin .close').addEventListener('click',()=>{
            document.querySelector('.admin .addAdmin').style.display = 'none'; 
        });

        document.querySelector('.addAdmin .save').addEventListener('click',()=>{

            if(document.querySelector('.addAdmin #firstnameArea').value != null && document.querySelector('.addAdmin #lastnameArea').value != null && document.querySelector('.addAdmin #emailtxt').value != null){
                socket.emit("new " + createName,[mail,{
                    firstname:document.querySelector('.addAdmin #firstnameArea').value,
                    lastname:document.querySelector('.addAdmin #lastnameArea').value,
                    email:document.querySelector('.addAdmin #emailtxt').value
                }]);

                document.querySelector('.addAdmin #firstnameArea').value = "";
                document.querySelector('.addAdmin #lastnameArea').value = "";
                document.querySelector('.addAdmin #emailtxt').value = "";
            }
        });
    });
}


function changePrices(adminContent){


    let changeAmount = document.createElement("button");
    changeAmount.id = "add-content";
    changeAmount.appendChild(document.createTextNode("Change rent prices"));
    adminContent.appendChild(changeAmount);

    changeAmount.addEventListener('click',()=>{

        waitToGetFilms('getAmount','takeAmount').then(amount =>{
            let chooseType = document.createElement('div');
            let chooser = document.createElement('button');
            chooser.appendChild(document.createTextNode('Choose Type'));
            chooser.style.border = "1px white solid";
            chooseType.appendChild(chooser);
            let chooseContent = document.createElement('div');
    
            chooseContent.className = 'countryContent';
            chooseType.style.left = "20%";
    
            chooseType.appendChild(chooseContent);
            chooseType.className = "countryChoose";
    
            adminContent.appendChild(chooseType);

            let amountDiv = document.createElement('div');
            let amountArea = document.createElement('textarea');
            let amountEpArea = document.createElement('textarea');
            amountDiv.appendChild(document.createTextNode("Price:"));
            amountArea.setAttribute('maxlength',10);
            amountEpArea.setAttribute('maxlength',10);
            amountDiv.id = "amountDiv";

            let save = document.createElement('button');
            save.id = "save";
            save.appendChild(document.createTextNode("Save"));

            amountDiv.appendChild(save);
    
            for(let type of ["Films and Series","Films","Series"]){
                let button = document.createElement('button');
                button.appendChild(document.createTextNode(type));
                chooseContent.appendChild(button);
                
                button.addEventListener('focus', ()=>{
                    chooser.innerHTML = button.innerHTML;
                    save.style.display = 'block';
                    amountDiv.style.display = 'block';

                    if(type == "Films and Series"){
                        amountArea.setAttribute("placeholder","movies: " + amount.films.fs);
                        amountEpArea.setAttribute("placeholder","Series: " + amount.series.fs);
                        amountEpArea.style.display = "inline-flex";
                        amountArea.style.display = "inline-flex";
                    }
                    else if(type == "Films"){
                        amountArea.setAttribute("placeholder","movies: " + amount.films.f);
                        amountEpArea.setAttribute("placeholder","");
                        amountEpArea.style.display = "none";
                        amountArea.style.display = "inline-flex";
                    }
                    else{
                        amountEpArea.style.display = "inline-flex";
                        amountArea.style.display = "none";
                        amountEpArea.setAttribute("placeholder","Series: " + amount.series.s);
                        amountArea.setAttribute("placeholder","");
                    }
                    amountDiv.appendChild(amountArea);
                    amountDiv.appendChild(amountEpArea);
                    adminContent.appendChild(amountDiv);

                    amountArea.addEventListener('keypress', (e)=>{
                        if(e.key == 'Enter'){
                            e.preventDefault();   
                        }
                    });

                    save.addEventListener('click',()=>{
                        if(amountArea.value != "" ){
                            if(parseFloat(amountArea.value) != NaN){
                                socket.emit("changeAmount",[mail,type,amountArea.value,amountEpArea.value]);
                            }
                        }
                    });
                });
            }
        });
    });

}

function getCustomerInfo(){

    return new Promise((resolve, reject)=>{
        socket.emit('getCustomerInfo',id);

        socket.on('takeCustomerInfo',data=>{
            resolve(data);
            
        });
    })
    
}