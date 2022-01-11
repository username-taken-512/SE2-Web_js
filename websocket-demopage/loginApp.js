let websocket;
const url = "ws://85.197.159.32:7071/houseauth";
const loginButton = document.getElementById("login");
const uname =  document.getElementById('uname');
const pname = document.getElementById('pname');
const signUpButton = document.getElementById('register');
const forgotPassword = document.getElementById('fpword')
var arrival = sessionStorage.getItem('logged out');


function checkLocalStorage(){
  console.log(localStorage.getItem("someVarKey"))
  if(localStorage.getItem("someVarKey") != "null"){
    console.log("Varför?")
    location.href = "index.html"
  }
}

function nonToken(){
  if(sessionStorage.getItem("invalidToken") == "true"){
    console.log("Kommer vi hit?")
    Swal.fire('Invalid Token!', 'Please login again.', 'info')
    sessionStorage.setItem("invalidToken", false)
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
  
      switch(opcode){
        case 12:
            let obj = jsonmessage.data;
            
            //sessionStorage.setItem('token', obj);
            var someVarName = obj;
            localStorage.setItem("someVarKey", someVarName);
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
   var send = '{"data":"{\\"householdId\\":0,\\"userId\\":0,\\"username\\":\\"' + uname.value + '\\",\\"password\\":\\"' + pname.value + '\\"}","opcode":22}';
   websocket.send(send);
  }

  function alerter() {
    if (arrival == "true") {
      Swal.fire("You have been logged out", "", "info");
      sessionStorage.setItem("logged out", false);
    }
  }

  alerter();
  nonToken(); 
  checkLocalStorage();
  websocketFunction();
  loginButton.addEventListener('click', loginClick);
  signUpButton.addEventListener('click', function(){
    location.href = "register.html"
  })
  forgotPassword.addEventListener('click', function(){
    const emailRegex = new RegExp('^[\\w-_\\.+]+\\@([\\w]+\\.)+[a-z]+[a-z]$')
    Swal.fire({
      title: 'Submit your email',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Send',
    }).then((result) => {
      if (result.isConfirmed) {
        if(emailRegex.test(result.value)){
        console.log(result.value);
        var sendForgotPword = '{"opcode":99,"data":"' +result.value+'"}'
        websocket.send(sendForgotPword)
        Swal.fire("Email sent to "+ result.value, "", "success");
        }else{
          Swal.fire(result.value + " is not a valid email", "", "error");
        }
      }
    })

  })
