const socket = io("ws://stephen-websocket-chatapp.vercel.app");

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");
const customRoomInput = document.querySelector("#custom-room");
const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

function sendMessage(e) {
  e.preventDefault();
  e.preventDefault();
  const message = msgInput.value.trim();
  const name = nameInput.value.trim();
  const room = chatRoom.value.trim() || customRoomInput.value.trim();

  if (name && message && room) {
    socket.emit("message", { name, text: message });
    msgInput.value = "";
  }
  msgInput.focus();
}

function enterRoom(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const room =
    chatRoom.value === "custom"
      ? customRoomInput.value.trim()
      : chatRoom.value.trim();

  if (name && room) {
    socket.emit("enterRoom", { name, room });
    customRoomInput.value = ""; // Clear custom room input if used
  }
}

document.querySelector(".form-msg").addEventListener("submit", sendMessage);

document.querySelector(".form-join").addEventListener("submit", enterRoom);

msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});

// Listen for messages
socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";

  if (name === nameInput.value) {
    li.classList.add("post--right", "post--user");
  } else if (name !== "Admin") {
    li.classList.add("post--left", "post--reply");
  }

  li.innerHTML =
    name !== "Admin"
      ? `<div class="post__header ${
          name === nameInput.value
            ? "post__header--user"
            : "post__header--reply"
        }">
     <span class="post__header--name">${name}</span>
     <span class="post__header--time">${time}</span>
   </div>
   <div class="post__text">${text}</div>`
      : `<div class="post__text">${text}</div>`;

  chatDisplay.appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;

  // Clear after 3 seconds
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});

socket.on("userList", ({ users }) => {
  showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

function showUsers(users) {
  usersList.textContent = "";
  if (users) {
    usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    users.forEach((user, i) => {
      usersList.textContent += ` ${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ",";
      }
    });
  }
}

function showRooms(rooms) {
  roomList.textContent = "";
  if (rooms) {
    roomList.innerHTML = "<em>Active Rooms:</em>";
    rooms.forEach((room, i) => {
      roomList.textContent += ` ${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomList.textContent += ",";
      }
    });
  }
}
