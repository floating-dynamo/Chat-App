const socket = io();
const $inputMessage = document.getElementById("input-message");
const $submitMessage = document.getElementById("submit-message");
const $formMessage = document.getElementById("form-message");
const $sendLocationBtn = document.getElementById("send-location");
const $messages = document.getElementById("messages");
const $sidebar = document.getElementById("sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Automatic Scrolling
const autoscroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild; // latest message

  // taking care of the margin
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);

  // Height of the latest message
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Getting the visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight - 1 <= Math.round(scrollOffset)) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Receiving the messages sent for All
socket.on("message", (message) => {
  const { text, createdAt, username } = message;
  // rendering the html
  const html = Mustache.render(messageTemplate, {
    text, // Dynamical render in the html
    timeStamp: moment(createdAt).format("h:mm a"),
    username,
  });
  $messages.insertAdjacentHTML("beforeend", html); // new messages will show up down
  autoscroll();
});

// Receiving the location message
socket.on("locationMessage", (locationMsg) => {
  console.log(locationMsg);
  const { url, createdAt, username } = locationMsg;
  const html = Mustache.render(locationTemplate, {
    url, // Dynamical render in the html
    timeStamp: moment(createdAt).format("h:mm a"),
    username,
  });
  $messages.insertAdjacentHTML("beforeend", html); // location will be displayed
  autoscroll();
});

// Receving the sidebar data back to render in the template
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  $sidebar.innerHTML = html; // Display sidebar
});

// Receving the data to populate the sidebar
socket.on("roomData", ({ room, users }) => {
  console.log("Room: ", room);
  console.log("Users: ", users);
});

// Sending the message from client to server
$formMessage.addEventListener("submit", (e) => {
  e.preventDefault();

  // Don't allow the input to be empty
  if (!$inputMessage.value.trim()) {
    return alert("Please Type in a message");
  }

  // Disabling the button to prevent multiple submits
  $submitMessage.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", $inputMessage.value, (error) => {
    // Enabling the submit button
    $submitMessage.removeAttribute("disabled");
    // Clearing the input for new message
    $inputMessage.value = "";
    // Focusing the cursor to the input
    $inputMessage.focus();

    if (error) {
      return console.log(error); // Will print if bad language is used
    }
    console.log("The message was delivered!"); // Sending Acknowledgement
  });
});

// Fetching users location
$sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  // Disabling the button to prevent multiple submits
  $sendLocationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    // Sending the location to the server
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location shared!"); // Sending the acknowledgement
        // Enabling the send Location button
        $sendLocationBtn.removeAttribute("disabled");
      }
    );
  });
});

// Sending the username and room to the server
socket.emit("join", { username, room }, (error) => {
  // Acknowledgement
  if (error) {
    alert(error);
    location.href = "/";
  }
});
