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
let divClicked = films;



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
});


employee_button.addEventListener('click',(e)=>{
    let oldemp = employee_var_name;
    e.preventDefault();
    user.innerHTML = capitalizeFirstLetter(employee_var_name) + " Sign in";
    employee_var_name = tagname; 

    if(employee_var_name == "customer") employee_button.innerHTML = "Are you a customer?";
    else employee_button.innerHTML = "Are you an " + employee_var_name + "?";
    tagname = oldemp;

});


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


series.addEventListener('click',()=>{
    series.style.backgroundColor = "#4d30d5";
    divClicked.style.backgroundColor = "";
    divClicked = series;
    document.querySelector('.content').innerHTML = "";
    category.innerHTML = "Series";

    if(customer_choice == 'FS'  || customer_choice == 'S'){
        socket.emit('getSeries','');
        
        socket.on('takeSeries',series=>{
            document.querySelector('.content').innerHTML = "";
            createSeries(series);
        });
    }
    else notRegistered();
});


films.addEventListener("click", ()=>{
    films.style.backgroundColor = "#4d30d5";
    divClicked.style.backgroundColor = "";
    
    category.innerHTML = "Movies";
    divClicked = films;
    document.querySelector('.content').innerHTML = "";

    if(customer_choice == 'FS'  || customer_choice == 'F'){
        socket.emit('getFilms','');
        
        socket.on('takeFilms',movies=>{
            
            createMovie(movies);
        });
    }
    else notRegistered();
});


owned.addEventListener('click',()=>{
    owned.style.backgroundColor = "#4d30d5";
    divClicked.style.backgroundColor = "";
    divClicked = owned;
    document.querySelector('.content').innerHTML = "";
    category.innerHTML = "Owned";
    socket.emit('getOwned',id)
    socket.on('Owned',results=>{
        let movies_count = document.createElement("div");
        let amount = results.films.length + results.episodes.length;
        document.querySelector('.content').innerHTML = "";
        movies_count.appendChild(document.createTextNode(amount + " movies"));
        movies_count.className = "movie-count";
        movies_count.style.opacity = "1";
        document.querySelector('.content').appendChild(movies_count);
        for(let result in results){
            createOwned(results[result]);
        }
        
    });
});

account.addEventListener('click',()=>{
    
    account.style.backgroundColor = "#4d30d5";
    divClicked.style.backgroundColor = "";
    divClicked = account;
    document.querySelector('.content').innerHTML = "";
    
    socket.emit('getCustomerInfo',id);

    socket.on('takeCustomerInfo',data=>{
        createAccountInfo(data);
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
            
            if(customer_choice == 'FS' || customer_choice == 'F') createMovie(movies);

            else notRegistered();
            
        });
        
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
        //messageDiv.style.width = "220px";
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


function createMovie(movies){
    document.querySelector(".accountDiv").style.display = "none";
    document.querySelector('.content').innerHTML = "";
    document.querySelector('.movieInfo').style.display = "none";
    document.querySelector('.content').style.animation = "none";
    document.querySelector('.content').style.opacity= "1";
    let movies_count = document.createElement("div");
    
    movies_count.appendChild(document.createTextNode(movies.length + " movies"));
    movies_count.className = "movie-count";
    
    document.querySelector('.content').appendChild(movies_count);
    
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
        
        document.querySelector('.content').appendChild(button);
        

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
        socket.emit('rentFilm',id + "," +  movie.film_id + "," + customer_choice);
        
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

function createSeries(movies){
    document.querySelector(".accountDiv").style.display = "none";
    document.querySelector('.movieInfo').style.display = "none";
    document.querySelector('.content').style.animation = "none";
    document.querySelector('.content').style.opacity= "1";
    let movies_count = document.createElement("div");
    
    movies_count.style.opacity = "1";
    movies_count.appendChild(document.createTextNode(movies.length + " series"));
    movies_count.className = "movie-count";
    document.querySelector('.content').appendChild(movies_count);
    

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
        
        document.querySelector('.content').appendChild(button);

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
            socket.emit('rentEpisode',customer_choice + "," + id + "," + episode.result.episode_id)
            movieInfo.style.animation = "hideMovieInfo .6s forwards ";
        });

        let div = document.createElement('div');
        let text = document.createTextNode("OWNED");

        div.className = "ep_owneDiv";
        div.appendChild(text);
        episodeDiv.appendChild(div);
        
        console.log(episode.owned);
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


function createOwned(movies){
    document.querySelector(".accountDiv").style.display = "none";
    document.querySelector('.movieInfo').style.display = "none";
    document.querySelector('.content').style.animation = "none";
    document.querySelector('.content').style.opacity= "1";
   
    
    ++startCount;
    for(let movie of movies){
        let movieDiv = document.querySelector('.movieInfo');
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
        
        document.querySelector('.content').appendChild(button);
        

        button.addEventListener('click',()=>{
            
            document.querySelector('.movieInfo').style.display = "block";
            
            createStandardMovieInfoHtml(button,movieDiv,movie);
            let datestr = movie.rental_date.toString();
            let date = new Date(datestr);
            let rentalDate = document.createElement('div');
            let rentalDatetxt = document.createTextNode("Rent on: " + date.getDate() + "-" + (date.getUTCMonth() +1) + "-" + date.getUTCFullYear());

            rentalDate.className = "rentalDate";
            rentalDate.appendChild(rentalDatetxt);
            document.querySelector('.movieInfo').appendChild(rentalDate);

        });
    }
}

function createAccountInfo(data){
    
    socket.emit("getCities","");
    let accountDiv = document.querySelector(".accountDiv");
    accountDiv.style.display = "block";
    accountDiv.style.animation = "revealAccount 1s forwards cubic-bezier(0.03, 0.88, 0.76, 1.02)"
    let firstname = document.querySelector("#firstnameArea");
    firstname.innerHTML  = data.first_name
    let choice = document.querySelector("#chosen");
    let choice1 = document.querySelector("#choice1");
    let choice2 = document.querySelector("#choice2");
    let address = document.querySelector("#addressArea");
    let district = document.querySelector("#districtArea");
    let postalCode = document.querySelector("#postalcodeArea");
    let phone = document.querySelector("#phoneArea");

    district.innerHTML = data.district;
    postalCode.innerHTML = data.postal_code;
    phone.innerHTML = data.phone;

    let cityname = document.querySelector("#city_chosen");
    cityname.innerHTML = data.city;
    address.innerHTML = data.address;

    let countryname = document.querySelector("#countryname");
    countryname.innerHTML = data.country;
    let lastname = document.querySelector("#lastnameArea");
    lastname.innerHTML  = data.last_name

    let email = document.querySelector("#emailtxt");
    email.innerHTML = data.email;

    let date = document.querySelector("#datetxt");
    let datestr = data.create_date.toString();
    let dateUtc = new Date(datestr);
    let dateFinal = dateUtc.getDate() + "-" + (dateUtc.getMonth()+1) + "-" + dateUtc.getUTCFullYear();

    date.innerHTML = dateFinal.toString();

    if(customer_choice == 'FS'){
        choice.innerHTML = "Films and Series";
        choice1.innerHTML = "Films"
        choice2.innerHTML = "Series"
    }
    else if(customer_choice == 'S'){
        choice.innerHTML = "Series";
        choice1.innerHTML = "Films"
        choice2.innerHTML = "Films and Series"
    }
    else if(customer_choice == 'F'){
        choice.innerHTML = "Films";
        choice1.innerHTML = "Series"
        choice2.innerHTML = "Films and Series"
    }

    changeInnerHtml(choice1,choice);
    changeInnerHtml(choice2,choice);
    socket.on('cities',cities=>{
        document.querySelector(".city-content").innerHTML = "";
        for(let city of cities){
            let cityButton = document.createElement('button');
            let citytxt = document.createTextNode(city.city);

            cityButton.className = 'cityButton';
            cityButton.appendChild(citytxt);

            document.querySelector(".city-content").appendChild(cityButton);

            cityButton.addEventListener('focus',()=>{
                changeInnerHtml(cityButton,cityname);
                countryname.innerHTML = city.country;
            });
        }
        
    });
    
}

function changeInnerHtml(button,buttonToSwitch){
    button.addEventListener('click',()=>{
        let choiceText = buttonToSwitch.innerHTML;
        buttonToSwitch.innerHTML = button.innerHTML;
        button.innerHTML = choiceText;
    })
}


