const mongoose = require('mongoose');

const validator = require('validator');

const bycrpt = require('bcryptjs');

const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  passwordConfirmed: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This Only works on Create & Save.
      // BTS, mongosoe doesnot keep the current object in memory. Dont use update on passwords
      //Also , pre saved middleware doesnot work
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },

  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run the function if password was actually modified
  // if pass  = !true === false || !false ===  true

  if (!this.isModified('password')) return next();

  //  Hash the passsword with cost of 12
  this.password = await bycrpt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirmed = undefined;

  next();
});

//Right before new document is saved
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Instance Methods
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bycrpt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
};

userSchema.methods.createPasswordResetToken = function () {
  //Creating A Token
  const resetToken = crypto.randomBytes(32).toString('hex');

  //Hashing the token before saving in the document and later in the db
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// For Deleting Documents
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
