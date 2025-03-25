const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");




exports.getLogin = (req, res) => {
  if(req.user) {
    return res.redirect("/profile");
    } else {
      return res.redirect("/login");
    }
  res.render("login.ejs", { user: req.user || null });
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }

    return new Promise((resolve, reject) => {
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return reject(err);
        }
        req.flash("success", { msg: "Success! You are logged in." });

      // Log session and user info for debugging
      console.log("Logged-in user:", req.user);
      console.log("Session details:", req.session);

      const redirectPath = req.user.userType === "Organization" ? "/organization" : "/profile";
      const finalRedirect = req.session.returnTo || redirectPath;

      req.session.returnTo = null;
      res.redirect(finalRedirect);
      resolve();
    });
  }).catch(next);
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("An error occurred during logout.");
    }

    if (req.session) {
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Error: Failed to destroy the session during logout.", destroyErr);
        }
        req.user = null;
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  });
};

exports.getSignup = (req, res) => {
  
  if (req.user) {
    const redirectPath = req.user.userType === "Volunteer" ? "/profile" : "/organization";
    return res.redirect(redirectPath);
  }
  res.render("signup", {
    title: "Create Account",
  });
};

exports.postSignup = async (req, res, next) => {
  const validationErrors = validateSignupInputs(req.body);

  if(validationErrors.length){
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const isVolunteer = req.body.userType === "Volunteer";
  const userData = isVolunteer ? {
    userType: req.body.userType,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    about: req.body.about,
    image: req.body.image,
  }
  : {
    userType: req.body.userType,
    organization: req.body.organization,
    email: req.body.email,
    password: req.body.password,
    about: req.body.about,
    image: req.body.image,
  };

  const Model = isVolunteer ? User : Organization;
  const redirectPath = isVolunteer ? "/profile" : "/organization";
  console.log("Model:", Model);
  console.log("redirectPath: ", redirectPath);

    try {
      const existingUser = await Model.findOne({ email: req.body.email });
      
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address already exists.",
        });
        return res.redirect("../signup");
      }
      const newUser = new Model(userData);
      await newUser.save();
      
      return new Promise((resolve, reject) => {
        req.logIn(newUser, (err) => {
          if (err) {
            console.log("login error:", err);
            return reject(err);
          }
          res.redirect(redirectPath) ;
          resolve();
        });
      });
    } catch (err) {
      console.error("signup error:", err);
      return next(err);
    }
};

  function validateSignupInputs(body) {
    const errors = [];
    if (!validator.isEmail(body.email))
      errors.push({ msg: "Please enter a valid email address." });
    if (!validator.isLength(body.password, { min: 8 }))
      errors.push({ msg: "Password must be at least 8 characters long" });
    if (body.password !== body.confirmPassword)
      errors.push({ msg: "Passwords do not match." });
    return errors;
  }