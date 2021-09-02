const express = require("express");
const app = express();

app.use(express.static("public"));

const server = require("http").createServer(app);
const WebSocket = require("ws");
const ws_server = new WebSocket.Server({server});

server.listen(8080);

console.log("Сервера запущены");

function sendJSON(ws, object) {
    ws.send(JSON.stringify(object));
}

let clients = [];
let ilya = null;
let ilya_status = "disconnected";

function sendToAllClients(object) {
    clients.forEach(client => sendJSON(client, object));
}

function sendIlyaStatusToAllClients() {
    sendToAllClients({eventName: "ilya_status", data: ilya_status});
}

ws_server.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        console.log(`Клиент отправил: '${message}'`);

        if (message == "client") {
            // Добавляем клиента в список клиентов
            console.log("Клиент подключен");
            clients.push(ws);
            // Оповещаем его о статусе ESP
            sendJSON(ws, {eventName: "ilya_status", data: ilya_status});
        }
        else if (message == "ilya") {
            console.log("Илья вышел в сеть");
            ilya = ws;
            ilya_status = "connected";

            sendIlyaStatusToAllClients();
        }
        else if (message == "got_request" && ws == ilya) {
            console.log("Got request");
            sendToAllClients({eventName: "ilya_received_message", data: ""});
        }
        else if (message == "request-done") {
            if (ilya_status != "disconnected") 
                sendJSON(ilya, { eventName: "request_done", data: "" })
        }

        var strMessage = String(message);
        if (strMessage.startsWith("to-ilya:")) {
            const messageToIlya = strMessage.substr(strMessage.indexOf(":") + 1);
            // console.log(`Илью просят: ${messageToIlya}`);
            if (ilya_status != "disconnected") 
                sendJSON(ilya, { eventName: "request", data: messageToIlya });
        }
    });

    ws.on("close", function close() {
        if (ilya == ws) {
            console.log("Илья отключен!");
            ilya = null;
            ilya_status = "disconnected";

            sendIlyaStatusToAllClients();
        }
        else {
            console.log("Клиент был отключен");
            clients = clients.filter(x => x != ws);
        }
    });
});