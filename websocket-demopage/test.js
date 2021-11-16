// Webpage for demo page to interact with websocket server in group project

(function () {
    "use strict";

    let websocket;
    let status = document.getElementById("status");
    let output = document.getElementById("output");
    let on = document.getElementById("on");
    let off = document.getElementById("off");
    let connect = document.getElementById("connect");
    // let url = "ws://85.197.159.131:1337/house?token=123";    // Bogges IP
    let url = "ws://localhost:7071/house?token=user@mail.com$123";            // Test Server

    function outputLog(message) {
        let now = new Date();
        let timestamp = now.toLocaleTimeString();

        output.innerHTML += `${timestamp} ${message}<br>`;
        output.scrollTop = output.scrollHeight;
    }

    /**
     * What to do when user clicks Connect
     */
    connect.addEventListener("click", function (/*event*/) {
        console.log("Connecting to: " + url);
        websocket = new WebSocket(url);

        websocket.onopen = function () {
            console.log("The websocket is now open.");
            console.log(websocket);
            outputLog("The websocket is now open.");
        };

        websocket.onmessage = function (event) {
            console.log("------ Receiving message: " + event.data);
            console.log(event);
            console.log(websocket);
            let message = event.data;
            outputLog("Server said: " + message);
            let jsonmessage = JSON.parse(message);
            let opcode = jsonmessage.opcode;

            outputLog("opcode: " + jsonmessage.opcode);

            switch (opcode) {
                case 10:
                    let obj = JSON.parse(jsonmessage.data);
                    outputLog("A lamp has changed");
                    outputLog(typeof obj);
                    outputLog(obj.name + " is now " + (obj.value > 0 ? "On" : "Off"));
                    break;
                case 11:
                    outputLog("All the lamps: ");
                    for (var i = 0; i < jsonmessage.data.length; i++) {
                        let obj = JSON.parse(jsonmessage.data[i]);
                        outputLog(obj.deviceId + ". " + obj.name + ": " + (obj.value > 0 ? "On" : "Off"));
                    }
                    break;
            }

            outputLog("--------------");
        };

        websocket.onclose = function () {
            console.log("The websocket is now closed.");
            console.log(websocket);
            outputLog("Websocket is now closed.");
        };
    }, false);


    on.addEventListener("click", function(/*event*/) {
        // const lampOn = `{"data":"{\\"deviceId\\":0,\\"name\\":\\"kitchen lamp\\",\\"type\\":\\"lamp\\",\\"value\\":0,\\"householdId\\":0}","opcode":10}`;
        const lampOn = '{"data":"{\\"deviceId\\":1,\\"name\\":\\"Outdoor lightning\\",\\"type\\":\\"lamp\\",\\"value\\":1,\\"householdId\\":0}","opcode":20}';
        // const json = JSON.parse(lampOn);
        outputLog("Turning on lamp");
        // outputLog(json.opcode);
        outputLog("Sending: " + lampOn);
        websocket.send(lampOn);
    });

    off.addEventListener("click", function(/*event*/) {
        const lampOff = '{"data":"{\\"deviceId\\":1,\\"name\\":\\"Outdoor lightning\\",\\"type\\":\\"lamp\\",\\"value\\":0,\\"householdId\\":0}","opcode":20}';
        outputLog("Turning off lamp");
        outputLog("Sending: " + lampOff);
        outputLog(typeof lampOff);
        let j = JSON.parse(lampOff);
        outputLog(typeof j);
        outputLog(j.opcode);
        websocket.send(lampOff);
    });
})();