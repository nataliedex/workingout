module.exports = {
  ensureAuth: function (req, res, next) {
    console.log("ensureAuth middleware triggered");
    if (req.isAuthenticated()) {
        return res.redirect("/profile");
    } else {
      res.redirect("/");
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  },
};
