const {ipcRenderer} = require('electron');

var socket;
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


let user = document.querySelector("#login");

let tagname = "customer";
let admin_var_name = "admin";
let employee_var_name = "employee";
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


signin.addEventListener('click',()=>{
    signInContainer.style.opacity = '0';
    setTimeout(()=>{
        signInContainer.style.display = 'none';
    },1000);

    socket = io.connect('http://localhost:5000/');
});