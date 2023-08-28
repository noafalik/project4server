const express = require("express");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const { auth, authAdmin } = require("../middlewares/auth");
const { validateJoi, UserModel, validateLogin, createToken, validateUser } = require("../models/userModel");
const { CompanyModel } = require("../models/companyModel");
const { ContenderModel } = require("../models/contenderModel");
const { JobModel } = require("../models/jobModel");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ msg: "Users endpoint" });
})

// ראוט שבודק את הטוקן בלי להפעיל את המסד
router.get("/checkToken", auth, async (req, res) => {
  res.json({ _id: req.tokenData._id, role: req.tokenData.role })
})


router.get("/userInfo", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 })
    res.json(user)
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.get("/single/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    let data = await UserModel.findOne({ _id: id }, { email: 1, full_name: 1, linkedIn_url: 1, CV_link: 1, _id: 0 });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

// authAdmin -> רק אדמין יוכל להגיע לראוט הנל
router.get("/usersList", authAdmin, async (req, res) => {
  try {
    let perPage = req.query.perPage || 5;
    let page = req.query.page - 1 || 0;
    let data = await UserModel
      .find({}, { password: 0 })
      .limit(perPage)
      .skip(page * perPage)
      .sort({ _id: -1 })
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
    const count = await UserModel.countDocuments()
    res.json({ count, pages: Math.ceil(count / perPage) })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})


router.post("/", async (req, res) => {
  let validBody = validateJoi(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    // הצפנה של הסיסמא
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    // דואג שהצד לקוח לא ידע כלל איך אנחנו מצפינים את הסיסמא במסד
    user.password = "******"
    res.status(201).json(user);
  }
  catch (err) {
    // בודק אם השגיאה היא שהמייל כבר קיים 11000
    if (err.code == 11000) {
      return res.status(400).json({ msg: "Email already in system", code: 11000 })
    }
    console.log(err);
    res.status(500).json({ err })
  }
})

router.post("/login", async (req, res) => {
  let validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    // בודק אם קיים אימייל במערכת שנשלח בבאדי
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: "Email not found" });
    }
    // בדיקה שהסיסמא ברשומה המוצפנת תואמת לסיסמא בבאדי
    let passwordValid = await bcrypt.compare(req.body.password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ err: "Password wrong" });
    }
    let token = createToken(user._id, user.role)
    // {token} -> {token:token } אם השם של המאפיין ומשתנה/פרמטר זהה אין צורך בנקודתיים
    // shotcut prop value
    res.cookie('token', token, { httpOnly: true, sameSite: "lax", secure: true });
    return res.status(200).json({ message: "Logged in", login: true });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.post("/logout", async (req, res) => {

  try {
    res.clearCookie('token');
    res.json({ logout: true });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
})

router.put("/:id", auth, async (req, res) => {
  let validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let id = req.params.id;
    let data;
    // בודק אם המשתמש הוא אדמין ונותן לו אפשרות לערוך את
    // כל הרשומות גם כאלו שלא שלו
    if (req.tokenData.role == "admin") {
      data = await UserModel.updateOne({ _id: id }, req.body);
    }
    else {
      data = await UserModel.updateOne({ _id: id }, req.body);
    }
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})


// patch -> עדכון מאפיין אחד ברשומה אחת
router.patch("/changeRole/:id", authAdmin, async (req, res) => {
  const id = req.params.id;
  let newRole;
  try {
    if (id == req.tokenData._id || id == "646b4d98c88bd4fd41edbaf0") {
      return res.status(401).json({ err: "You cant change your role! U are the super admin" })
    }
    const user = await UserModel.findOne({ _id: id });
    if (user.role != "admin") newRole = "admin";
    else if (await CompanyModel.findOne({ user_id: id })) newRole = "company";
    else newRole = "user";
    const data = await UserModel.updateOne({ _id: id }, { role: newRole })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }

})


router.patch("/changeRoleToCompany", auth, async (req, res) => {
  const id = req.tokenData._id;
  try {
    if (id == "646b4d98c88bd4fd41edbaf0") {
      return res.status(401).json({ err: "You cant change your role! U are the super admin" })
    }
    const data = await UserModel.updateOne({ _id: id }, { role: "company" })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }

})


router.patch("/updateFav", auth, async (req, res) => {
  try {
    const favs_ar = req.body.favs_ar;
    if (!Array.isArray(favs_ar)) {
      return res.status(400).json({ err: "You must send favs_ar prop of array of ids" })
    }
    const data = await UserModel.updateOne({ _id: req.tokenData._id }, { favs_ar })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})

router.patch("/updateMatch", auth, async (req, res) => {
  try {
    const newMatchUrl = req.body.match_url; // Assuming the new match URL is sent in the request body

    if (typeof newMatchUrl !== "string") {
      return res.status(400).json({ err: "newMatchUrl must be a string" });
    }

    const data = await UserModel.updateOne({ _id: req.tokenData._id }, { match_url: newMatchUrl });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
});

router.delete("/:id", authAdmin, async (req, res) => {
  try {
    let id = req.params.id;
    if (id == req.tokenData._id || id == "646b5121c88bd4fd41edbaf8") {
      return res.status(401).json({ err: "You cant delete yourself or the super admin" });
    }
    let data = await UserModel.deleteOne({ _id: id });
    const company = await CompanyModel.findOne({ user_id: id });
    if (company) {
      const jobs = await JobModel.find({ company_id: company._id });
      const jobsIds = jobs.map((job) => job._id.toString());
      data.jobs = await JobModel.deleteMany({ company_id: (company._id.toString()) });
      data.myContenders = await ContenderModel.deleteMany({ job_id: { $in: jobsIds } });
      data.company = await CompanyModel.deleteOne({ user_id: id });
    }
    else data.contenders = await ContenderModel.deleteMany({ user_id: id });
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
})


module.exports = router;