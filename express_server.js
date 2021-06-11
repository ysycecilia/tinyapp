const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
const getUserByEmail = require('./helpers');

const PORT = 8090;

const app = express();

app.use(cookieSession({
  name: 'session',
  secret: 'secret'
}));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + './views'));

//for test use
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "abcabc" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "cccddd" }
};

const users = {
  "abcabc" : {
    id: "abcabc",
    email: "abc@163.com",
    password: bcrypt.hashSync("123", 10)
  }
};

const generateRandomString = function() {
  let result = "";

  for (let i = 0; i < 6; i++) {
    let letterByCode = Math.floor(Math.random() * 26 + 97);
    let randomLetter = String.fromCharCode(letterByCode);
    result += randomLetter;
  }
  return result;
};

//check if userID matches with any id in Users. If so, returns its own URLs
const urlsForUser = (id) => {
  let userUrls = [];
  Object.keys(urlDatabase).forEach(elem => {
    if (urlDatabase[elem].userID === id) {
      userUrls.push(urlDatabase[elem]);
    }
  });
  return userUrls;
};

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {
    user_id: id,
    email: users[id].email,
    urls: urlsForUser(id)
  };

  if (templateVars.urls) {
    res.render("urls_index", templateVars);
  } else {
    return res.status(403).send();
  }
});

app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();
  if (!req.session.user_id) {
    return res.status(404).send();
  }
  urlDatabase[newUrl] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${newUrl}`);
  
});

// url CRUD operations
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    email: users[req.session.user_id].email
  };
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id,
    email: users[req.session.user_id].email
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// login, register and encryption/session
app.get('/login',  (req, res) => {
  const templateVars = {
    user_id: ""
  };

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = getUserByEmail(users, email);

  if (!req.body.password || !req.body.email) {
    return res.status(403).send();
  }

  //if user exists and password matches, create a session
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;

    const templateVar = {
      user_id: req.session.user_id,
      email: email
    };
    res.redirect("/urls");
  } else {
    return res.status(403).send();
  }

});

app.get("/register", (req, res) => {
  const templateVar = {
    user_id: "",
    //email: users[req.session.user_id].email
  };
  res.render("register",templateVar);
});

//if email, password and new user is legit, save it to users
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!password || !email || getUserByEmail(users, email)) {
    return res.status(400).send();
  } else {
    users[id] = {
      id,
      email,
      password
    };
    res.redirect("/login");
  }
});

//clear out session info then return to login page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
