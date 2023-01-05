const generateMessage = (text, username = "admin") => {
  return {
    text,
    createdAt: new Date().getTime(),
    username,
  };
};

const generateLocationMessage = (username, location) => {
  return {
    url: `https://google.com/maps?q=${location.latitude},${location.longitude}`,
    createdAt: new Date().getTime(),
    username,
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
};
