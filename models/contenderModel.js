const mongoose = require("mongoose");
const Joi = require("joi");
const { UserModel } = require("./userModel");
const { JobModel } = require("./jobModel");

let schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'jobs' },
  notes: String,
  starting: Date
}, { timestamps: true });

exports.ContenderModel = mongoose.model("contenders", schema);

exports.validateContender = (_reqBody) => {
  return Joi.object({
    user_id: Joi.string().required(),
    job_id: Joi.string().required(),
    notes: Joi.string().min(2).max(500).required(),
    starting: Joi.date().required() // Add validation for cv_link
  }).validate(_reqBody);
};