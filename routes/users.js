const express = require("express");
const router = express.Router();
const User = require("../models/user");
const md5 = require("md5");

router.get("/register", (req, res) => {
  let user = req.session.user;
  res.render("users/register", { user: user });
});

router.post("/register", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).render("users/register", {
      errorMessage: "User already registered",
      user: null,
    });
  }
  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
  });
  try {
    const newUser = await user.save();
    req.session.loggedIn = true;
    req.session.user = newUser;
    res.redirect("/books");
  } catch {
    res.render("users/register", {
      errorMessage: "Error creating user",
      user: null,
    });
  }
});

router.get("/login", (req, res) => {
  let user = req.session.user;
  res.render("users/login", { user: user });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: md5(req.body.password),
  });
  if (!user) {
    return res.status(400).render("users/login", {
      errorMessage: "No user found",
      user: user,
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  if (req.session.from) {
    res.redirect(req.session.from);
  } else {
    res.redirect("/books");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/books");
});

module.exports = router;
