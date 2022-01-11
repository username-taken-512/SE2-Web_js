
const url ="ws://85.197.159.32:7071/houseauth"
const uname =  document.getElementById('uname');
const pname = document.getElementById('pword');
const rname = document.getElementById('name')
const checkOne = document.getElementById('cHouse');
const checkTwo = document.getElementById('joinH')
const singInButton = document.getElementById('login')
const signUpButton = document.getElementById('register')
var newHouseID = 0;

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
        case 14:
          let obj = JSON.parse(jsonmessage.data);
  
          console.log("Household created")
          console.log(obj)

          newHouseID = obj.householdId
         

          var fullInfo = '{"opcode":23,"data":"{\\"householdId\\":'+obj.householdId+',\\"name\\":\\"'+rname.value+'\\",\\"password\\":\\"'+pname.value+'\\",\\"userId\\":0,\\"username\\":\\"'+uname.value+'\\"}"}'
          websocket.send(fullInfo);
          break;
        case 13:
            Swal.fire({
                icon: 'success',
                title: 'Account has been created',
                text: 'Household has been joined/created',
                confirmButtonText: 'Ok',

            }).then((result) => {
                if (result.isConfirmed) {
                  location.href = "login.html"
                }
            })

  
          break;
        case 43:
          console.log("Fail creating user & household")
          Swal.fire('Error creating user or joining household!', 'Please try again.', 'error')

          break;
            
      }
    };  
      
  
    websocket.onclose = function () {
      console.log("The websocket is now closed.");
    }
      
  };

  

  
  checkOne.addEventListener('change', function() {
    if (checkOne.checked) {
        checkTwo.checked = false;
    } else if(!checkOne.checked && !checkTwo.checked){
      checkTwo.checked = true;
    }
  });

  checkTwo.addEventListener('change', function(){
      if(checkTwo.checked){
          checkOne.checked = false
      }else if(!checkTwo.checked && !checkOne.checked){
        checkOne.checked = true;
      }
  });


  singInButton.addEventListener('click', function(){
      location.href = "login.html"
  });

  signUpButton.addEventListener('click', function(){
    const reg = new RegExp('^[0-9]+$');
      if(checkOne.checked == true){
        if(newHouseID == 0){
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
        }else {
          var joinHouse = '{"opcode":23,"data":"{\\"householdId\\":'+newHouseID+',\\"name\\":\\"'+rname.value+'\\",\\"password\\":\\"'+pname.value+'\\",\\"userId\\":0,\\"username\\":\\"'+uname.value+'\\"}"}'
          websocket.send(joinHouse)
          newHouseID = 0;
        }
      }else if(checkTwo.checked == true){
        Swal.fire({
            title: 'Submit the ID of the Household you are joining',
            input: 'text',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Create',
          }).then((result) => {
            if (result.isConfirmed) {
                if(reg.test(result.value)){
                    var joinHouse = '{"opcode":23,"data":"{\\"householdId\\":'+result.value+',\\"name\\":\\"'+rname.value+'\\",\\"password\\":\\"'+pname.value+'\\",\\"userId\\":0,\\"username\\":\\"'+uname.value+'\\"}"}'
                    websocket.send(joinHouse)
                }else{
                Swal.fire({
                    icon: 'error',
                    title: 'The input can only include numbers',
                    confirmButtonText: 'Ok',
    
                })
               }
            }
          })
      }

  });
  websocketFunction();