const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  let user = req.session.user;
  if (user) {
    res.redirect("/books");
  } else {
    res.render("index", { user: user });
  }
});

module.exports = router;
