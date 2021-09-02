const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})


// Подключение к основному серверу
let connectedToServer = false;

// Вызывается из websockets.js, когда приходит сообщение
function receiveMessage(eventName, message) {
    switch(eventName) {
        case "server_connect":
            connectedToServer = true;
            /*Toast.fire({
                icon: 'success',
                title: 'Подключение успешно!'
            })*/
            break;

        case "server_disconnect":
            connectedToServer = false;
            Toast.fire({
                icon: 'error',
                title: 'Отсоединение от сервера'
            })
            var status = document.getElementById("status");
            status.innerText = "Ошибка, Илья не получит сообщение!";
            status.classList.remove("text-primary");
            status.classList.remove("text-success");
            status.classList.add("text-danger");
            break;

        case "ilya_status":
            if (message.data == "connected") {
                var status = document.getElementById("status");
                status.innerText = "Илья на связи!";
                status.classList.add("text-primary");
                status.classList.remove("text-danger");
            }
            else {
                var status = document.getElementById("status");
                status.innerText = "Илья не в сети и не получит сообщение :c";
                status.classList.remove("text-primary");
                status.classList.remove("text-success");
                status.classList.add("text-danger");
            }
            break;

        case "ilya_received_message":
            var status = document.getElementById("status");
            status.innerText = "Илья получил сообщение!";
            status.classList.remove("text-primary");
            status.classList.add("text-danger");
            status.classList.remove("text-success");
            var audio = new Audio('beeper.mp3');
            audio.play();

            document.getElementById("done-button").classList.remove("d-none");
    }
}

function dangerButton() {
    let audio = new Audio('button.mp3');
    audio.play();

    let select = document.getElementById("callselect");
    let selected = select.selectedOptions[0].innerText;
    console.log(selected);

    let callerName = document.getElementById("nameInput").value;
    if (callerName.trim() == "")
        callerName = "Не указано";

    let object = { callerName, buttonPressed: selected };  
    sendData(`to-ilya:${JSON.stringify(object)}`);
}

function doneButton() {
    sendData(`request-done`);

    var status = document.getElementById("status");
    status.innerText = "Илья на связи!";
    status.classList.add("text-primary");
    status.classList.remove("text-danger");
    status.classList.remove("text-success");

    document.getElementById("done-button").classList.add("d-none");
}