
const generateRandomString = function() {
  let result = "";

  for (let i = 0; i < 6; i++) {
    let letterByCode = Math.floor(Math.random() * 26 + 97);
    let randomLetter = String.fromCharCode(letterByCode);
    result += randomLetter;
  }
  return result;
};

const getUserByEmail = (users, email) => {
  for (let user in users) {
    if (email === users[user].email)
      return users[user];
  }
};

//if id exists, return its email or set email as null
const getEmailBySessionID = (users, id) => {
  return id ? users[id].email : null;
};

const getShortURLByUserID = (urlDatabase, userID) => {
  let shortURLs = [];

  for (let key in urlDatabase) {
    if (userID === urlDatabase[key].userID) {
      shortURLs.push(key);
    }
  }
  return shortURLs;
};

//check if userID matches with any id in Users. If so, returns its own URLs
const urlsForUser = (urlDatabase, id) => {
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = (urlDatabase[key]);
    }
  }
  return userUrls;
};
module.exports = { generateRandomString, getUserByEmail, getEmailBySessionID, getShortURLByUserID, urlsForUser };