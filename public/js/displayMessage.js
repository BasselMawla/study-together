
/////////////////////////////////////Displaying message in chat box
function displayMessage(data) {
  let authorClass = "";
  let divClass = ""
  //verify that the user ID and the message sent ID is similar
  if (data.userID === idd) {
    console.log("This person has sent a message")
    authorClass = "me";
    divClass = "myDiv";
  } else {
    authorClass = "you";
    divClass = "yourDiv";
  }
  const div = document.createElement("div");
  div.className = divClass;
  const li = document.createElement("li");
  li.className = "message-item";
  const p = document.createElement("p");
  p.className = "time";
  p.innerText = moment().format("MM/DD-hh:mm");
  div.innerHTML =
    '<p class="' + authorClass + '">' + data.user + "</p>" + '<p class="message"> ' +
    data.value +
    "</p>";
  div.appendChild(p);
  li.appendChild(div);

  document.getElementById("messages").appendChild(li);
  //scroll to the bottom
  window.scrollTo(0, document.body.scrollHeight);
}