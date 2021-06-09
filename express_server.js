const express = require("express");
const cookieParser = require('cookie-parser');
//const bodyParser = require("body-parser");
const PORT = 8090;

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + './views'));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.get("/urls", (req, res) => {
  //let username = "";
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
  //res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get('/login',  (req, res) => {
  const templateVar = {
    username: req.cookies.username
  };
  res.render("login", templateVar);

});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  
  res.redirect("/urls");
  const templateVar = {
    username: req.cookies.username
  };
  res.render("_header", templateVar);
  
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
