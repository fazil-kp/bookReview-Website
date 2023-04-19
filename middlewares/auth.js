const url = require("url");
function auth(req, res, next) {
  let user = req.session.user;
  const path = req.originalUrl;
  if (!user) {
    req.session.from = path;
    return res.redirect("/users/login");
  }
  next();
}
module.exports = auth;
