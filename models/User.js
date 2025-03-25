const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String},
  lastName: { type: String },
  email: { type: String, unique: true, required: true},
  password: { type:String, required: true },
  cloudinaryId: { type: String },
  image: { type: String, default: "" },
});

// Password hash middleware.

UserSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    return next(err);
  }
});

// Helper method for validating user's password.

UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);


