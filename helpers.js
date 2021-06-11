
const getUserByEmail = (users, email) => {
  for (let user in users) {
    if (email === users[user].email)
      return users[user];
  }
};

module.exports = getUserByEmail;