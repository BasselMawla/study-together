//Connecting Socket.io and creating the current room if not created -- Check ../mysocket.js file
var socket = io.connect();
socket.emit('create', {Room : room ,username : userName});

$("#m").focus();
//when form is submitted, capture the input value and then send it to server

//////////////////////////////////Triggering sent chat messages
document
  .getElementById("form_chat")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let tima = moment().format("MM/DD-hh:mm");

    socket.emit("chat message", {
      value: document.getElementById("m").value,
      user: userName,
      Room: room,
      userID: idd,
      time: tima
    });

    console.log('A message has been sent from the client');
    document.getElementById("m").value = "";
  });

// listing and desplaying the chat messages coming from server
socket.on("chat message", (data) => {
  //console.log(data.data.user + ": " + data.id);
  document.getElementById("m").value = "";
  displayMessage(data);
});

/////////////////////////////////////////////////////////////Sending image through chat form

$(function () {
  $("#chat_file").on('change', (e) => {
    var file = e.originalEvent.target.files[0];
    var reader = new FileReader();
    reader.onload = (evt) => {
      //socket.emit('user image', evt.target.result, room);
      socket.emit('user image', evt.target.result);
    };
    reader.readAsDataURL(file);
  });
});

socket.on('addimage', function (msg, base64image) {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = '<a target="_blank" href="' + base64image + '"><img src="' + base64image + '" id="shared_image" class="img-fluid"/></a>';
  li.appendChild(div);
  document.getElementById("messages").appendChild(li);
});

////////////////////////////////////////Triggering announcement in the Announcements box

if(isAdmin) {
  document
  .getElementById("announceForm")
  .addEventListener("submit", function (event) {

    event.preventDefault();
    let tima = moment().format("MM/DD-hh:mm");
    console.log("Announcement form has been triggered!!!");
    socket.emit("announcement message", {
      value: document.getElementById("announce_text").value,
      user: userName,
      Room: room,
      userID: idd,
      time: tima
    });

    console.log('Announcement has been sent from the instructor');
    document.getElementById("announce_text").value = "";
  });
}


// listing and desplaying the announcement coming from server
socket.on("announcement message", (data) => {
  //console.log(data.data.user + ": " + data.id);
  displayAnnouncement(data);
});

///////////////////////////////////////////////////////////////////////////////// Displaying the announcements
function displayAnnouncement(data) {
  var temp = "" + data.value;
  const span = document.createElement("SPAN");
  span.style.fontSize = "12px";
  span.style.color = "grey";
  span.innerHTML = "" + data.time;

  const textNode = document.createTextNode(temp)
  const li = document.createElement("li");
  li.style.color = "rgb(150,0,0)";

  li.appendChild(textNode);
  li.appendChild(span);
  document.getElementById("announcement-ul").appendChild(li);
}


///////////////////////////////////////////////////////////////////////////////// Triggering questions

document
.getElementById("questionForm")
.addEventListener("submit", function (event) {

  event.preventDefault();
  let tima = moment().format("MM/DD-hh:mm");
  console.log("Question form has been triggered!!!");
  socket.emit("question message", {
    value: document.getElementById("question_text").value,
    user: userName,
    Room: room,
    userID: idd,
    time: tima
  });

  console.log('Question has been sent from the user:', userName);
  document.getElementById("question_text").value = "";
});



// listing and desplaying the announcement coming from server
socket.on("question message", (data) => {
  //console.log(data.data.user + ": " + data.id);
  displayQuestion(data);
});


///////////////////////////////////////////////////////////////////////////////// Displaying the announcements
function displayQuestion(data) {
  var temp = "NOW " + "-" + data.value;
  const span = document.createElement("SPAN");
  span.style.fontSize = "12px";
  span.style.color = "grey";
  span.innerHTML = " by <strong class=\"color:black;\">" + data.user + "</strong> at " + data.time;

  const textNode = document.createTextNode(temp)
  const li = document.createElement("li");
  li.style.color = "rgb(0,0,0)";

  li.appendChild(textNode);
  li.appendChild(span);
  document.getElementById("question-ul").appendChild(li);

}
