const express = require("express");
const { JobModel, validateJob } = require("../models/jobModel");
const router = express.Router();
const { auth } = require("../middlewares/auth");

router.get("/", async (req, res) => {
  const perPage = req.query.perPage || 10;
  const page = req.query.page - 1 || 0;
  const sort = req.query.sort || "_id";
  const reverse = req.query.reverse == "yes" ? 1 : -1;
  const category = req.query.category;
  // const salary = req.query.salary; להוסיף לפי טווח
  const location = req.query.location;
  const user_id = req.query.user_id;
  //?s=
  const search = req.query.s;

  try {
    let filterFind = {}
    if (category) {
      filterFind = { category_code: category }
    }
    else if (user_id) {
      filterFind = { user_id }
    }
    else if (search) {
      const searchExp = new RegExp(search, "i")
      filterFind = { $or: [{ title: searchExp }, { info: searchExp }] }
    }

    // if (salary) {
    //   filterFind.salary = salary; 
    // }

    if (location) {
      filterFind.location = location;
    }

    let data = await JobModel
      .find(filterFind)
      .limit(perPage)
      .skip(page * perPage)
      .sort({ [sort]: reverse })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/single/:id", async (req, res) => {
  try {
    const id = req.params.id
    let data = await JobModel.findOne({ _id: id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


// FOR TESTING IN QUERY IN MONGO
// שאילתא טובה בשביל לשלוף מועדפים של משתמש, בנוסף מאפשר נניח לשלוף
// רשימת וידיאו שאני רוצה לפרסם ביותר קלות ואפשרויות נוספות לשליפה כאשר יש לי צורך 
// בוידיאוים מסויימים
router.post("/group_in", async (req, res) => {
  const favs_ar = req.body.favs_ar
  if (!Array.isArray(favs_ar) || favs_ar.length < 0) {
    return res.status(400).json({ err: "You must send favs_ar prop of array of ids" })
  }
  try {
    // $in -> מאפשר לשלוף לפי מערך של איי דים רשומות שתאומות לאיי די במערך
    // const data = await VideoModel.find({_id:{$in:["6422ae80a27f8047db90e20e","6437bc69f65f5c8de942821c"]}})
    const data = await JobModel.find({ _id: { $in: favs_ar } }).limit(20)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/", auth, async (req, res) => {
  let validBody = validateJob(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  if (req.tokenData.role == "company") {
    try {
      let job = new JobModel(req.body);
      job.user_id = req.tokenData._id
      await job.save();
      res.json(job)
    }
    catch (err) {
      console.log(err);
      res.status(502).json({ err })
    }
  }
  else {
    return res.status(400).json({ err: "You must be company to post a job!" })
  }
})

router.put("/:id", auth, async (req, res) => {
  let validBody = validateJob(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let id = req.params.id;
    let data;
    // בודק אם המשתמש הוא אדמין ונותן לו אפשרות לערוך את
    // כל הרשומות גם כאלו שלא שלו
    if (req.tokenData.role == "admin") {
      data = await VideoModel.updateOne({ _id: id }, req.body);
    }
    else if (req.tokenData.role == "company") {
      data = await VideoModel.updateOne({ _id: id, user_id: req.tokenData._id }, req.body);
    }
    else {
      return res.status(400).json({ err: "You must be admin or company!" })
    }
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    let id = req.params.id;
    let data;
    // נותן אפשרות לאדמין למחוק את כל הרשומות
    if (req.tokenData.role == "admin") {
      data = await JobModel.deleteOne({ _id: id});
    }
    else{
      data = await JobModel.deleteOne({ _id: id, user_id: req.tokenData._id });
    }
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

module.exports = router;