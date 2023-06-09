const express = require("express");
const router = express.Router();
const { auth, authAdmin } = require("../middlewares/auth");
const { CompanyModel, validateCompany } = require("../models/companyModel");

router.get("/", async(req,res) => {
  res.json({msg:"companies work"});
})

router.get("/companyInfo", auth, async (req, res) => {
  try {
    let company = await CompanyModel.findOne({ user_id: req.tokenData._id })
    res.json(company)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/companiesList", authAdmin, async (req, res) => {
  try {
    let perPage = req.query.perPage || 5;
    let page = req.query.page - 1 || 0;
    let data = await CompanyModel
      .find({})
      .limit(perPage)
      .skip(page * perPage)
      .sort({ _id: -1 })
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
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
    res.status(502).json({ err })
  }
})

router.post("/",auth, async (req, res) => {
  let validBody = validateCompany(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let company = new CompanyModel(req.body);
    company.user_id=req.tokenData._id;
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
    res.status(502).json({ err })
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
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.delete("/:id", authAdmin, async (req, res) => {
  try {
    let id = req.params.id;
    if (id == req.tokenData._id || id == "66666") {
      return res.status(401).json({ err: "You cant delete yourself or the super admin" });
    }
    let data = await CompanyModel.deleteOne({ _id: id });
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

module.exports = router;