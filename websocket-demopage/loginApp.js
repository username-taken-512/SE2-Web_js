let websocket;
const url = "ws://85.197.159.32:7071/houseauth";
const loginButton = document.getElementById("login");
const uname =  document.getElementById('uname');
const pname = document.getElementById('pname');
var arrival = sessionStorage.getItem('logged out');



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
  
      switch(opcode){
        case 12:
            let obj = jsonmessage.data;
            
            sessionStorage.setItem('token', obj);
            console.log(sessionStorage.getItem('token'))
            location.href = "index.html"
            break
        case 42:
            Swal.fire('Invalid credentials!', 'Please try again.', 'error')
            break
      }
        
    }
  
    websocket.onclose = function () {
      console.log("The websocket is now closed.");
      
  };
  }

  function loginClick(){
   const send = '{"data":"{\\"householdId\\":0,\\"userId\\":0,\\"username\\":\\"' + uname.value + '\\",\\"password\\":\\"' + pname.value + '\\"}","opcode":22}';
   websocket.send(send);
  }

  function alerter() {
    if (arrival == "true") {
      Swal.fire("You have been logged out", "", "info");
      sessionStorage.setItem("logged out", false);
    }
  }

  alerter();
  websocketFunction();
  loginButton.addEventListener("click", loginClick);