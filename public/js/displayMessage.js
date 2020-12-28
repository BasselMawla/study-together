
/////////////////////////////////////Displaying message in chat box
function displayMessage(data) {
  let authorClass = "";
  let divClass = ""
  const li = document.createElement("li");
  //verify that the user ID and the message sent ID is similar
  if (data.userID === idd) {
    console.log("This person has sent a message")
    authorClass = "me";
    divClass = "myDiv";
    li.className = "my-message"

    const div = document.createElement("div");
    div.className = divClass;

    div.innerHTML =
    '<span class="timeStamp"> ' + moment().format("hh:mm - MM/DD") + '</span>'
        + '<p class="' + authorClass + '">You</p>'
        + '<p class="message">' + data.value + '</p>';

    li.appendChild(div);
  } else {
    authorClass = "you";
    divClass = "yourDiv";
    li.className = "message-item";

    const div = document.createElement("div");
    div.className = divClass;

    div.innerHTML =
    '<p class="' + authorClass + '">' + data.user
        + '<span class="timeStamp"> ' + moment().format("hh:mm - MM/DD") + '</span>' + '</p>'
        + '<p class="message">' + data.value + '</p>';

    li.appendChild(div);
  }

  //const p = document.createElement("p");
  //p.className = "time";
  //p.innerText = moment().format("MM/DD-hh:mm");

  //div.appendChild(p);


  document.getElementById("messages").appendChild(li);
  //scroll to the bottom
  window.scrollTo(0, document.body.scrollHeight);
}