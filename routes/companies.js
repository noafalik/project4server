const express = require("express");
const router = express.Router();
const { auth, authAdmin } = require("../middlewares/auth");
const { CompanyModel, validateCompany } = require("../models/companyModel");
const { UserModel } = require("../models/userModel");
const { JobModel } = require("../models/jobModel");
const { ContenderModel } = require("../models/contenderModel");

router.get("/", async (req, res) => {
  res.json({ msg: "companies work" });
})

router.get("/companyInfo", auth, async (req, res) => {
  try {
    let company = await CompanyModel.findOne({ user_id: req.tokenData._id })
    res.json(company)
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.get("/companiesList", auth, async (req, res) => {
  try {
    let perPage = req.query.perPage || 5;
    let page = req.query.page - 1 || 0;
    let company_id = req.query.id;
    let filter = {};
    if (company_id) filter = { _id: company_id };
    let data = await CompanyModel
      .find(filter)
      .limit(perPage)
      .skip(page * perPage)
      .sort({ user_id: -1 })
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.get("/count", async (req, res) => {
  try {
    let perPage = req.query.perPage || 5;
    // יקבל רק את כמות הרשומות בקולקשן
    const count = await CompanyModel.countDocuments()
    res.json({ count, pages: Math.ceil(count / perPage) })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.post("/", auth, async (req, res) => {
  let validBody = validateCompany(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let company = new CompanyModel(req.body);
    company.user_id = req.tokenData._id;
    // הצפנה של הסיסמא
    await company.save();
    // דואג שהצד לקוח לא ידע כלל איך אנחנו מצפינים את הסיסמא במסד
    res.status(201).json(company);
  }
  catch (err) {
    // בודק אם השגיאה היא שהמייל כבר קיים 11000
    if (err.code == 11000) {
      return res.status(400).json({ msg: "User_id already in the system", code: 11000 })
    }
    console.log(err);
    res.status(500).json({ err })
  }
})

router.put("/:id", auth, async (req, res) => {
  let validBody = validateCompany(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let id = req.params.id;
    let data;
    // בודק אם המשתמש הוא אדמין ונותן לו אפשרות לערוך את
    // כל הרשומות גם כאלו שלא שלו
    if (req.tokenData.role == "admin") {
      data = await CompanyModel.updateOne({ _id: id }, req.body);
    }
    else {
      data = await CompanyModel.updateOne({ _id: id, user_id: req.tokenData._id }, req.body);
    }
    let company = await CompanyModel.findOne({_id:id});
    res.json({data, company})
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.delete("/:id", authAdmin, async (req, res) => {
  try {
    let id = req.params.id;
    let company = await CompanyModel.findOne({ _id: id }).populate('user_id');
    if (company.user_id == req.tokenData._id || company.user_id == "646b5121c88bd4fd41edbaf8") {
      return res.status(401).json({ err: "You cant delete yourself or the super admin" });
    }
    let data = await CompanyModel.deleteOne({ _id: id });
    data.user = await UserModel.deleteOne({ _id: company.user_id });
    data.jobs = await JobModel.deleteMany({ company_id: id });
    const jobs = await JobModel.find({ company_id: id });
    const jobsIds = jobs.map((job) => job._id.toString());
    data.myContenders = await ContenderModel.deleteMany({ job_id: { $in: jobsIds } });
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

module.exports = router;