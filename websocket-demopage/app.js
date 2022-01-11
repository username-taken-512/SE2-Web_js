const menu = document.querySelector('mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const logoutButton = document.getElementById("Logout");
const addButton = document.getElementById("addButton")
const creatHousholdButton = document.getElementById("createHousehold")
const joinHousholdButton = document.getElementById("joinHousehold")
var sliderOutput;
var websocket;
var onOrOff;
var fanId;
var alertValue;
var devArray = [];
var myHouseId;
var newHvalue;
var check = true;
var forTimer = false;
const TIMER_MILLIS = 1800000;
var sensorValue, alarmState;
var token = localStorage.getItem("someVarKey")
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
    console.log(jsonmessage)
    var checkDev = true;

    switch (opcode) {
      case 10:
        let obj = JSON.parse(jsonmessage.data);
        console.log(obj)
        console.log("timer value " + forTimer)

       
        
        for (let index = 0; index < devArray.length; index++) {
          let element = devArray[index];

          if (element.deviceId == obj.deviceId) {
            element.value = obj.value;
            if(element.value == 0 && element.type == "lamp"){
              if(element.timer != 0){
                element.timer = 0;
                Swal.fire('Timer for ' + element.name, 'has been stopped', 'info')
              }
            }
            checkDev = false;
            if (element.name != obj.name) {
              element.name = obj.name;
              checkDev = false;
            }
            if (element.type != obj.type) {
              element.type = obj.type;
              checkDev = false;
            }
            if (element.householdId != obj.householdId) {
              devArray.splice(index, 1);
              checkDev = false;
            }
           
            if(element.timer != obj.timer){
              element.timer = obj.timer
              checkDev = false;
              if(forTimer == false){
              Swal.fire('Timer started for ' + element.name, ' ', 'info')
              }
            }
          }
        }
        console.log(myHouseId)
        if (myHouseId == obj.householdId) {
          if (checkDev) {
            devArray.push(obj);
            console.log(obj);
          }
        }

        displayDev();
        break;
      case 11:
        devArray.splice(0)
        for (let index = 0; index < jsonmessage.data.length; index++) {
          const element = JSON.parse(jsonmessage.data[index]);
          devArray.push(element);
          if(element.timer != 0){
            Swal.fire('Timer for ' + element.name, 'Is ongoing.', 'info')
          }
        }

       var nameOfUser = jsonmessage.nameOfUser

        var household = JSON.parse(jsonmessage.household);
        myHouseId = household.householdId
        console.log(myHouseId)
        console.log(nameOfUser)
        changeHeader(household.name, nameOfUser);
        displayDev();
        break;
      case 45:
        check = false;
        break
      case 14:
        let obje = JSON.parse(jsonmessage.data);
  
          console.log("Household created")
          console.log(obje)
         

          var infoSend = '{"opcode":25,"data":"' +obje.householdId+'"}'
          websocket.send(infoSend)
        break
        case 49:
          localStorage.setItem("someVarKey", null);
          sessionStorage.setItem("invalidToken", true)
          
          location.href = "login.html"
          break

    }
  };  
    

  websocket.onclose = function () {
    console.log("The websocket is now closed.");
  }
    
};


function displayDev () {
  document.getElementById("display-array").innerHTML = "";
  forTimer = false;
  console.log("for timer i dev " + forTimer)
  console.log(devArray)
  for (var i = 0; i < devArray.length; i++) {
    if(devArray[i].type == "lamp" || devArray[i].type == "element"){
      if(devArray[i].value == 1){
        onOrOff = "on"
      }else{
       onOrOff = "off"
      }
      if (devArray[i].timer != 0) {
        var date1 = new Date(devArray[i].timer);

        var leftOnTimer = date1.toLocaleString("en-US", {
          weekday: "short", 
          day: "numeric", 
          year: "numeric", 
          month: "numeric", 
          hour: "numeric", 
          minute: "numeric", 
          second: "numeric", 
        });
        document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button><font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off name=lamp onClick=reply_click(this) ><a>" + "Off" + "</a></button><button class=main__btn id="+i+" value=on onClick=timerFunction(this)><a>" + "Timer" + "</a></button><br><font class=status__text>Status: "+ onOrOff +", Timer ends in: "+leftOnTimer+"</font><br>";
      }else{
        document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off name=lamp onClick=reply_click(this) ><a>" + "Off" + "</a></button><button class=main__btn id="+i+" value=on onClick=timerFunction(this)><a>" + "Timer" + "</a></button><br><font class=status__text>Status: "+ onOrOff +"</font><br>";
      }
    }else if(devArray[i].type == "fan"){
      document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<input type=range min=0 max=100 value="+devArray[i].value+" class=slider id=fan name="+i+" onchange=sliderChange(name)><br><font class=status__text>Value: <span id=demo></span></font><br>"
      sliderOutput = document.getElementById("demo");
      sliderOutput.innerHTML = devArray[i].value
    }else if(devArray[i].type == "thermometer"){
      sensorValue = parseFloat(devArray[i].value);
      document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+"<br><font class=status__text>Current temp (inside): "+ (sensorValue/10) +"°C</font><br>"
    } else if(devArray[i].type == "powersensor"){
      sensorValue = parseFloat(devArray[i].value);
      document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+"<br><font class=status__text>Current Power usage: "+ (sensorValue/10) +"W</font><br>"
    } else if(devArray[i].type == "alarm"){
      if(devArray[i].value == 0){
        alarmState = "off"
        document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off onClick=reply_click(this) ><a>" + "Off" + "</a></button><br><font class=status__text>Status: "+ alarmState +"</font><br>";
      }else if(devArray[i].value == 1){
        alarmState = "on"
        document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off onClick=reply_click(this) ><a>" + "Off" + "</a></button><br><font class=status__text>Status: "+ alarmState +"</font><br>";
      }else{
        alarmState = "triggered"
        document.getElementById("display-array").innerHTML += "<font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=off onClick=reply_click(this) ><a>" + "Off" + "</a></button><br><font class=status__text>Status: "+ alarmState +"</font><br>";
        Swal.fire('Warning', devArray[i].name+' has been triggered', 'warning')
      }
    }else if(devArray[i].type == "autotoggle"){
      if(devArray[i].value == 1){
        onOrOff = "on"
      }else{
       onOrOff = "off"
      }
      document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=reply_click(this)><a>" + "On" + "</a></button>" + "<button class=main__btn id="+i+" value=off name=lamp onClick=reply_click(this) ><a>" + "Off" + "</a></button><br><font class=status__text>Status: "+ onOrOff +"</font><br>";
    } else if(devArray[i].type == "autosettings"){
      document.getElementById("display-array").innerHTML += "<button id="+i+" onClick=editDev(this) class=main__btn><a>Edit</a></button> <font class=nameOfDevice>"+devArray[i].name+"</font>"+" "+"<button class=main__btn id="+i+" value=on onClick=setOwnValue(this)><a>" + "Set Value" + "</a></button>" + "<br><font class=status__text>Current temperature: "+ (devArray[i].value/10) +"°C</font><br>";
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

const changeHeader = (houseHoldName, nameOfUser) => {
    const element = document.getElementById("navbar__logo");
    element.innerHTML = houseHoldName;
    if(check){
    Swal.fire('Welcome ' + nameOfUser +"!", '', 'info')
    } else{
      Swal.fire('Error joining Household', 'No Household with id - ' + newHvalue, 'error')
    }
    check = true;

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
  } else if (window.innerWidth > 960 && scrollPos < 2800) {
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
    localStorage.setItem("someVarKey", null);
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
    forTimer = true;
    console.log("hello?" + devArray[timer.id].value)
    var sendTimer = '{"data":"{\\"deviceId\\" :'+devArray[timer.id].deviceId+',\\"name\\":\\"'+devArray[timer.id].name+'\\",\\"type\\":\\"'+devArray[timer.id].type+'\\",\\"value\\":'+devArray[timer.id].value+',\\"householdId\\":'+devArray[timer.id].householdId+',\\"timer\\":'+time+'}","opcode":20}';
    websocket.send(sendTimer)
    Swal.fire('Timer started!', '30 min started.', 'success')
  }

  function setOwnValue(valueToSet){
    Swal.fire({
      title: 'Select field validation',
      input: 'select',
      inputOptions: {
        'Temperature': {
          150: '15°C',
          160: '16°C',
          170: '17°C',
          180: '18°C',
          190: '19°C',
          200: '20°C',
          210: '21°C',
          220: '22°C',
          230: '23°C',
          240: '24°C',
          250: '25°C',
          260: '26°C',
          270: '27°C',
          280: '28°C',
          290: '29°C',
          300: '30°C'
        },
      },
      inputPlaceholder: 'Select a Temperature',
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value != "") {
            var sendValue = '{"data":"{\\"deviceId\\" :'+devArray[valueToSet.id].deviceId+',\\"name\\":\\"'+devArray[valueToSet.id].name+'\\",\\"type\\":\\"'+devArray[valueToSet.id].type+'\\",\\"value\\":'+value+',\\"householdId\\":'+devArray[valueToSet.id].householdId+',\\"timer\\":'+devArray[valueToSet.id].timer+'}","opcode":20}';
            websocket.send(sendValue)
            resolve()
          } else {
            resolve('You need to select a Temperature or cancel')
          }
        })
      }
    })
    displayDev();
  }

  function editDev(device){
    console.log(device.id)
    Swal.fire({
      title: "Edit Device",
      html:
        '<input id="swal-input1" placeholder="'+devArray[device.id].deviceId+'"class="swal2-input" readonly>' +
        '<input id="swal-input2" placeholder="'+devArray[device.id].name+'" class="swal2-input"><br>',
      input: "select",
      inputOptions: {
        Type: {
          "lamp": "Lamp",
          "element": "Element",
          "alarm": "Alarm",
          "thermometer": "Thermometer",
          "fan": "Fan",
          "autotoggle": "Autotoggle",
          "autosettings": "Autosettings",
          "powersensor": "Powersensor",
        },
      },
      inputPlaceholder: 'Select a type',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Update",
      denyButtonText: `Delete`,
      inputValidator: (type) => {
        return new Promise((resolve) => {
          if (type != "") {
            var id = devArray[device.id].deviceId
            var name = document.getElementById('swal-input2').value
            var editedText = '{"data":"{\\"deviceId\\":'+id+',\\"name\\":\\"'+name+'\\",\\"type\\":\\"'+type+'\\",\\"value\\":'+devArray[device.id].value+',\\"householdId\\":'+devArray[device.id].householdId+',\\"timer\\":'+0+'}","opcode":21}';
            websocket.send(editedText)
            resolve()
          } else {
            resolve('You need to select a type and name or cancel')
          }
        })
      }
    }).then((result) => {
      if(result.isDenied) {
        var deleteR = '{"opcode":21,"data":"{\\"deviceId\\":'+devArray[device.id].deviceId+',\\"householdId\\":'+0+',\\"name\\":\\"'+devArray[device.id].name+'\\",\\"timer\\":0,\\"type\\":\\"'+devArray[device.id].type+'\\",\\"value\\":'+devArray[device.id].value+'}"}'
        websocket.send(deleteR)
      }
    });

  }


  checkForToken();
  websocketFunction();
  logoutButton.addEventListener("click", logoutClick);
  window.addEventListener('scroll', highlightMenu);
  window.addEventListener('click', highlightMenu);

  creatHousholdButton.addEventListener("click", function(){
    Swal.fire({
      title: 'Submit your Household name',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Create',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(result.value);
        var sendHouseInfo = '{"opcode":24,"data":"{\\"householdId\\":0,\\"name\\":\\"'+result.value+'\\"}"}'
        websocket.send(sendHouseInfo)
      }
    })
  })

  joinHousholdButton.addEventListener("click", function(){
    const reg = new RegExp('^[0-9]+$');
    Swal.fire({
      title: "Submit the ID of the Household you are joining",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Join",
    }).then((result) => {
      if (result.isConfirmed) {
        if (reg.test(result.value)) {
          console.log(result.value)
          newHvalue = result.value;
          var infoSend = '{"opcode":25,"data":"' +result.value+'"}'
          websocket.send(infoSend)
        } else {
          Swal.fire({
            icon: "error",
            title: "The input can only include numbers",
            confirmButtonText: "Ok",
          });
        }
      }
    });
  })

  addButton.addEventListener("click", function(){
    const reg = new RegExp('^[0-9]+$');
    Swal.fire({
      title: "Edit Device",
      html:
        '<input id="swal-input1" placeholder=ID class="swal2-input" >' +
        '<input id="swal-input2" placeholder=Name class="swal2-input"><br>',
      input: "select",
      inputOptions: {
        Type: {
          "lamp": "Lamp",
          "element": "Element",
          "alarm": "Alarm",
          "thermometer": "Thermometer",
          "fan": "Fan",
          "autotoggle": "Autotoggle",
          "autosettings": "Autosettings",
          "powersensor": "Powersensor",
        },
      },
      inputPlaceholder: 'Select a type',
      showCancelButton: true,
      confirmButtonText: "Add",
      inputValidator: (type) => {
        return new Promise((resolve) => {
          if (type != "") {
            if(reg.test(document.getElementById('swal-input1').value)){
              var id = document.getElementById('swal-input1').value
              var name = document.getElementById('swal-input2').value
              var addDev = '{"data":"{\\"deviceId\\":'+id+',\\"name\\":\\"'+name+'\\",\\"type\\":\\"'+type+'\\",\\"householdId\\":'+myHouseId+'}","opcode":21}';
              websocket.send(addDev)
            }else{
              resolve('ID can only contain a number')
            }
            resolve()
          } else {
            resolve('You need to select a type or cancel')
          }
        })
      }
    })
  })
 
  
