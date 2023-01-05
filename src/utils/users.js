const users = [];

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and Room are required",
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return {
    user,
  };
};

// Removing a user
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index != -1) {
    return users.splice(index, 1)[0]; // Splice returns an array
    // Remove the user from the array and return the deleted user
  }
};

// Getting a user with the id
const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id;
  });

  return user;
};

// Get all users in the room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => {
    return user.room === room;
  });
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
