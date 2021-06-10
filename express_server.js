const express = require("express");
const cookieParser = require('cookie-parser');
//const bodyParser = require("body-parser");
const PORT = 8090;

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + './views'));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "abcabc" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "abcabc" }
};

const users = {
  "abcabc" : {
    id: "abcabc",
    email: "abc@163.com",
    password: "123"
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
  if (Object.keys(users).includes(id)) {
    return urlDatabase[id];
  } else {
    return "Please login first.";
  }
};

app.get("/urls", (req, res) => {
  if(urlsForUser(req.cookies.user_id)){

  }
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id].email
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
  //res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id].email
  };
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id].email
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

app.get('/login',  (req, res) => {
  const templateVar = {
    user_id: req.cookies.user_id,
    //email: 'users[req.cookies.user_id].email'
  };

  res.render("login", templateVar);

});

app.post("/login", (req, res) => {
  //res.cookie('username', req.body.username);
  const email = req.body.email;
  const password = req.body.password;
  let user = emailLookup(users, email);
  
  if (!password || !email || !user) {
    return res.status(403).send();
  }

  if (user.password === req.body.password) {
    res.cookie('user_id', user.id);

    const templateVar = {
    //username: req.cookies.username
      user_id: req.cookies.user_id,
      //user: users,
      email: email,
    };
    res.redirect("/urls");
  }

});

app.get("/register", (req, res) => {
  const templateVar = {
    username: "",
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id].email
  };
  res.render("register",templateVar);
});

const emailLookup = (users, email) => {
  for (let user in users) {
    if (email === users[user].email)
      return users[user];
  }
};

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!password || !email || emailLookup(users, email)) {
    return res.status(400).send();
  } else {
    users[id] = {
      id: id,
      email: email,
      password: password
    };
    console.log(users);
    res.redirect("/login");
  }
});
console.log(users);

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
