const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
  user_id: String,
  job_id: String,
  notes: String,
  starting: Date,
  cv_link: String,
}, { timestamps: true });

exports.ContenderModel = mongoose.model("contenders", schema);

exports.validateContender = (_reqBody) => {
  return Joi.object({
    user_id: Joi.string().required(),
    job_id: Joi.string().required(),
    notes: Joi.string().min(2).max(500).required(),
    starting: Joi.date().required(),
    cv_link: Joi.string().allow(null,""), // Add validation for cv_link
  }).validate(_reqBody);
};