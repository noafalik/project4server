const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");


let schema = new mongoose.Schema({
  full_name: String,
  email: String,
  birth_date: Date,
  password: String,
  gender: String,
  profile_pic: String,
  CV_link:String,
  request_jobs: {
    type: Array, default: []
  },
  role: {
    type: String, default: "user"
  },
  favs_ar: {
    type: Array, default: []
  }
}, { timestamps: true })
exports.UserModel = mongoose.model("users", schema);

exports.createToken = (user_id, roleUser) => {
  let token = jwt.sign({ _id: user_id, role: roleUser }, config.tokenSecret, { expiresIn: "600mins" });
  return token;
}


exports.validateJoi = (_reqBody) => {
  let joiSchema = Joi.object({
    full_name: Joi.string().min(2).max(200).required(),
    email: Joi.string().min(1).max(300).email().required(),
    birth_date: Joi.date().required(),
    password: Joi.string().min(1).max(100).required(),
    gender:Joi.string().min(1).max(1).allow("",null)
  })
  return joiSchema.validate(_reqBody)
}

exports.validateLogin = (_reqBody) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(1).max(300).email().required(),
    password: Joi.string().min(1).max(100).required(),
  })
  return joiSchema.validate(_reqBody)
}