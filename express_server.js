const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcrypt");
const { generateRandomString, urlsForUser, getUserByEmail, getEmailBySessionID, getShortURLByUserID} = require('./helpers');

const PORT = 8080;

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
  "aaan2": { longURL: "http://www.light.ca", userID: "abcabc" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "cccddd" }
};

const users = {
  "abcabc" : {
    id: "abcabc",
    email: "abc@163.com",
    password: bcrypt.hashSync("123", 10)
  }
};

//when connecting localhost:8080, show urls or login page depends on session
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//if logged in, return email; otherwise, return null and ask for login page
app.get("/urls", (req, res) => {
  const id = req.session.user_id;

  if (id) {
    const templateVars = {
      user_id: id,
      email: getEmailBySessionID(users, id),
      urls: urlsForUser(urlDatabase, id),
      shortURL: getShortURLByUserID(urlDatabase, id)
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//create a new URL record
app.post("/urls", (req, res) => {
  const newUrl = generateRandomString();

  if (!req.session.user_id) {
    return res.status(404).send();
  }
  urlDatabase[newUrl] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls`);
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

// display a current URL record
app.get("/urls/:shortURL", (req, res) => {
  //check if shortURL exists
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send();
    return;
  }

  const id = req.session.user_id;

  if (id) {
    const urls = urlsForUser(urlDatabase, id);
    const shortURL = req.params.shortURL;
    const longURL = urls[shortURL].longURL;

    const templateVars = {
      user_id: id,
      email: getEmailBySessionID(users, id),
      shortURL,
      longURL
    };

    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

//redirect page to longURL(full address)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//update a current URL record
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

//delet a current URL record
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
  const user = getUserByEmail(users, email);

  if (!req.body.password || !req.body.email) {
    return res.status(403).send();
  }

  //if user exists and password matches, create a session
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send();
  }
});

app.get("/register", (req, res) => {
  const templateVar = {
    user_id: null,
  };
  res.render("register",templateVar);
});

//if email, password and new user are legit, save it to users, create a session and redirect to /urls
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
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

//clear out session info then return to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
