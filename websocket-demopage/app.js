const menu = document.querySelector('mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const logoutButton = document.getElementById("Logout");
var sliderOutput;
var websocket;
var onOrOff;
var fanId;
var devArray = [];
const TIMER_MILLIS = 1800000;
var sensorValue, alarmState;
var token = sessionStorage.getItem('token')
const url = "ws://85.197.159.32:7071/house?token="+token;

function checkForToken(){
  console.log(token)
  if(token == null || token == "null"){
    console.log("kommer vi hit?")
    location.href = "login.html"
  }

}

const websocketFunction = () => {
  websocket = new WebSocket(url);

  websocket.onopen = function () {
    console.log("The websocket is now open.");
    console.log(websocket);
  }

  websocket.onmessage = function (event) {
    let message = event.data;
    let jsonmessage = JSON.parse(message);
    let opcode = jsonmessage.opcode;

    switch (opcode) {
      case 10:
        let obj = JSON.parse(jsonmessage.data);

        for (let index = 0; index < devArray.length; index++) {
          let element = devArray[index];

          if (element.deviceId == obj.deviceId) {
            element.value = obj.value;
          }
        }
        displayDev();
        break;
      case 11:
        for (let index = 0; index < jsonmessage.data.length; index++) {
          const element = JSON.parse(jsonmessage.data[index]);
          devArray.push(element);
        }

        const testing = JSON.parse(jsonmessage.household);
        changeHeader(testing.name);
        displayDev();
        break;
    }
  };  
    

  websocket.onclose = function () {
    console.log("The websocket is now closed.");
  }
    
};


function displayDev () {
  document.getElementById("display-array").innerHTML = "";
  console.log(devArray)
  for (var i = 0; i < devArray.length; i++) {
    if(devArray[i].type == "lamp" && devArray[i].type == "element" && devArray[i].type == "timer"){
      if(devArray[i].value == 1){
        onOrOff = "on"
      }else{
       onOrOff = "off"
      }
      document.getElementById("display-array").innerHTML += " <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off name=lamp onClick=reply_click(this) ><a>" + "Off" + "</a></button><button class=main__btn id="+i+" value=on onClick=timerFunction(this)><a>" + "Timer" + "</a></button><br><font class=status__text>Status: "+ onOrOff +"</font><br>";
    }else if(devArray[i].type == "fan"){
      document.getElementById("display-array").innerHTML += "<br> <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<input type=range min=0 max=100 value="+devArray[i].value+" class=slider id=fan name="+i+" onchange=sliderChange(name)><br><font class=status__text>Value: <span id=demo></span></font><br>"
      sliderOutput = document.getElementById("demo");
      sliderOutput.innerHTML = devArray[i].value
    }else if(devArray[i].type == "thermometer"){
      sensorValue = parseFloat(devArray[i].value);
      document.getElementById("display-array").innerHTML += " <br><font class=nameOfDevice>"+devArray[i].name+"</font>"+"<br><font class=status__text>Current temp (inside): "+ (sensorValue/10) +"</font><br>"
    } else if(devArray[i].type == "powersensor"){
      sensorValue = parseFloat(devArray[i].value);
      document.getElementById("display-array").innerHTML += " <br><font class=nameOfDevice>"+devArray[i].name+"</font>"+"<br><font class=status__text>Current Power usage: "+ (sensorValue/10) +"</font><br>"
    } else if(devArray[i].type == "alarm"){
      if(devArray[i].value == 0){
        alarmState = "off"
        document.getElementById("display-array").innerHTML += " <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off onClick=reply_click(this) ><a>" + "Off" + "</a></button><br><font class=status__text>Status: "+ alarmState +"</font><br>";
      }else if(devArray[i].value == 1){
        alarmState = "on"
        document.getElementById("display-array").innerHTML += " <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off onClick=reply_click(this) ><a>" + "Off" + "</a></button><br><font class=status__text>Status: "+ alarmState +"</font><br>";
      }else{
        alarmState = "triggered"
        document.getElementById("display-array").innerHTML += " <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=off onClick=reply_click(this) ><a>" + "Off" + "</a></button><br><font class=status__text>Status: "+ alarmState +"</font><br>";
        Swal.fire('Warning', devArray[i].name+' has been triggered', 'warning')
      }
    }
  }
}



function reply_click(clicked_id){
  if(clicked_id.value == "on"){
    const onValue = 1; 
    devArray[clicked_id.id].value = onValue;
    var lampOn = '{"data":"{\\"deviceId\\" :'+devArray[clicked_id.id].deviceId+',\\"name\\":\\"'+devArray[clicked_id.id].name+'\\",\\"type\\":\\"'+devArray[clicked_id.id].type+'\\",\\"value\\":'+devArray[clicked_id.id].value+',\\"householdId\\":'+devArray[clicked_id.id].householdId+',\\"timer\\":'+0+'}","opcode":20}';
    websocket.send(lampOn);
  }else if (clicked_id.value == "off"){
    const offValue = 0;
    devArray[clicked_id.id].value = offValue;
    var lampOff = '{"data":"{\\"deviceId\\" :'+devArray[clicked_id.id].deviceId+',\\"name\\":\\"'+devArray[clicked_id.id].name+'\\",\\"type\\":\\"'+devArray[clicked_id.id].type+'\\",\\"value\\":'+devArray[clicked_id.id].value+',\\"householdId\\":'+devArray[clicked_id.id].householdId+',\\"timer\\":'+0+'}","opcode":20}';
    websocket.send(lampOff);
  } 

  displayDev();
  
}

const mobileMenu= () => {
  menu.classList.toggle('is-active');
  menuLinks.classList.toggle('active');
}

const changeHeader = (houseHoldName) => {
    const element = document.getElementById("navbar__logo");
    element.innerHTML = houseHoldName;
} 
//menu.addEventListener('click', mobileMenu)

const highlightMenu = () => {
  const elem = document.querySelector(".highlight");
  const homeMenu = document.querySelector("#home-page");
  const deviceMenu = document.querySelector("#device-page");
  let scrollPos = window.scrollY;

  if (window.innerWidth > 960 && scrollPos < 400) {
    homeMenu.classList.add("highlight");
    deviceMenu.classList.remove("highlight");
    return;
  } else if (window.innerWidth > 960 && scrollPos < 1400) {
    deviceMenu.classList.add("highlight");
    homeMenu.classList.remove("highlight");
    return;
  }

  if ((elem && window.innerWIdth < 960 && scrollPos < 600) || elem) {
    elem.classList.remove("highlight");
  }
};

  const logoutClick = () => {
    sessionStorage.setItem('token', null)
    websocket.onclose();
    sessionStorage.setItem('logged out', true);
    location.href = "login.html"
  }

  function sliderChange(sliderValue){
    var slider = document.getElementById("fan");
    sliderOutput.innerHTML = slider.value;
    devArray[sliderValue].value = slider.value;
    var sliderSend = '{"data":"{\\"deviceId\\" :'+devArray[sliderValue].deviceId+',\\"name\\":\\"'+devArray[sliderValue].name+'\\",\\"type\\":\\"'+devArray[sliderValue].type+'\\",\\"value\\":'+devArray[sliderValue].value+',\\"householdId\\":'+devArray[sliderValue].householdId+',\\"timer\\":'+0+'}","opcode":20}';
    websocket.send(sliderSend)
  }

  function timerFunction(timer){
    var d = new Date();
    let time = d.getTime();
    time += TIMER_MILLIS
    console.log(time)
    var sendTimer = '{"data":"{\\"deviceId\\" :'+devArray[timer.id].deviceId+',\\"name\\":\\"'+devArray[timer.id].name+'\\",\\"type\\":\\"'+devArray[timer.id].type+'\\",\\"value\\":'+devArray[timer.id].value+',\\"householdId\\":'+devArray[timer.id].householdId+',\\"timer\\":'+time+'}","opcode":20}';
    websocket.send(sendTimer)
    Swal.fire('Timer started!', '30 min started.', 'success')
  }

  checkForToken();
  websocketFunction();
  logoutButton.addEventListener("click", logoutClick);
  window.addEventListener('scroll', highlightMenu);
  window.addEventListener('click', highlightMenu);
 
  
