const express = require("express");
const { JobModel, validateJob } = require("../models/jobModel");
const router = express.Router();
const { auth, authAdmin } = require("../middlewares/auth");
const { CompanyModel } = require("../models/companyModel");

const matchLevel = (params, job) => {
  let matchCounter = 0;
  for (const key in params) {
    if (key == "salary") {
      if (job["salary"] >= params["salary"]) matchCounter++;
    }
    else {
      if (params[key] == job[key]) {
        matchCounter++;
      }
    }
  }
  return matchCounter;
}

router.get("/match", async (req, res) => {
  const category = req.query.category;
  const location = req.query.location;
  const visa = req.query.visa;
  const salary = req.query.salary;
  const continent = req.query.continent;
  try {
    let params = {};
    if (category) params.category = category;
    if (location) {
      params.location = location;
    }
    if (visa) {
      if (visa == "true") params.visa = true;
      else params.visa = false;
    }
    if (salary) params.salary = salary;
    if (continent) params.continent = continent;
    const jobs = await JobModel.find({});
    const jobsFive = jobs.filter(a => matchLevel(params, a) == 5);
    const jobsFour = jobs.filter(a => matchLevel(params, a) == 4);
    const jobsThree = jobs.filter(a => matchLevel(params, a) == 3);
    res.json({ jobsFive, jobsFour, jobsThree });
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/", async (req, res) => {
  const sort = req.query.sort || "_id";
  const reverse = req.query.reverse == "yes" ? 1 : -1;
  const category = req.query.category;
  const location = req.query.location;
  const continent = req.query.continent;
  const visa = req.query.visa;
  const minSalary = req.query.minSalary;
  const maxSalary = req.query.maxSalary;
  const approved = req.query.approved;
  const company_id = req.query.company_id;
  const search = req.query.s;
  const id = req.query.id;

  try {
    const page = req.query.page - 1 || 0;
    const perPage = req.query.perPage || 5 ;
    const searchExp = new RegExp(search, "i");
    const filter = [];
    if (category) filter.push({ category });
    if (location) {
      const locationExp = new RegExp(location, "i");
      filter.push({ location: locationExp })
    }
    if (visa) {
      const visaExp = new RegExp(visa, "i");
      filter.push({ visa: visaExp });
    }
    if (company_id) filter.push({ company_id });
    if (search) {
      filter.push({ $or: [{ job_title: searchExp }, { info: searchExp }] });
    }
    if (approved) filter.push({ approved });
    if (id) filter.push({ _id: id });
    if (minSalary) filter.push({ salary: { $gte: minSalary } });
    if (maxSalary) filter.push({ salary: { $lte: maxSalary } });
    if (continent) filter.push({ continent })
    const filterFind = { $and: filter };
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

router.get("/locations", auth, async (req, res) => {
  try {
    // let perPage = req.query.perPage || 5;
    const jobs = await JobModel.find({});
    const locations = [];
    jobs.forEach(item => locations.push(item.location));
    res.json(locations);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/myJobs", auth, async (req, res) => {
  const sort = req.query.sort || "_id";
  const reverse = req.query.reverse == "yes" ? 1 : -1;
  const category = req.query.category;
  const location = req.query.location;
  const visa = req.query.visa;
  const minSalary = req.query.minSalary;
  const maxSalary = req.query.maxSalary;
  const approved = req.query.approved;
  const search = req.query.s;
  const id = req.query.id;
  const continent = req.query.continent;
  try {
    const company = await CompanyModel.findOne({ user_id: req.tokenData._id });
    const company_id = company._id;
    const page = req.query.page - 1 || 0;
    const perPage = req.query.perPage || 5;
    const searchExp = new RegExp(search, "i");
    const filter = [];
    filter.push({ company_id });
    if (category) filter.push({ category });
    if (location) {
      const locationExp = new RegExp(location, "i");
      filter.push({ location: locationExp })
    }
    if (visa) {
      const visaExp = new RegExp(visa, "i");
      filter.push({ visa: visaExp });
    }
    if (search) {
      filter.push({ $or: [{ job_title: searchExp }, { info: searchExp }] });
    }
    if (approved) filter.push({ approved });
    if (id) filter.push({ _id: id });
    if (minSalary) filter.push({ salary: { $gte: minSalary } });
    if (maxSalary) filter.push({ salary: { $lte: maxSalary } });
    if (continent) filter.push({ continent });
    const filterFind = { $and: filter };
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

router.get("/count", async (req, res) => {
  try {
    const category = req.query.category;
    const location = req.query.location;
    const visa = req.query.visa;
    const minSalary = req.query.minSalary;
    const maxSalary = req.query.maxSalary;
    const approved = req.query.approved;
    const company_id = req.query.company_id;
    const search = req.query.s;
    const id = req.query.id;
    const perPage = req.query.perPage || 5;
    const continent = req.query.continent;
    const searchExp = new RegExp(search, "i");
    const filter = [];
    if (category) filter.push({ category });
    if (location) {
      const locationExp = new RegExp(location, "i");
      filter.push({ location: locationExp })
    }
    if (visa) {
      const visaExp = new RegExp(visa, "i");
      filter.push({ visa: visaExp });
    }
    if (company_id) filter.push({ company_id });
    if (search) {
      filter.push({ $or: [{ job_title: searchExp }, { info: searchExp }] });
    }
    if (approved) filter.push({ approved });
    if (id) filter.push({ _id: id });
    if (minSalary) filter.push({ salary: { $gte: minSalary } });
    if (maxSalary) filter.push({ salary: { $lte: maxSalary } });
    if (continent) filter.push({ continent });
    const filterFind = { $and: filter };
    // יקבל רק את כמות הרשומות בקולקשן
    const count = await JobModel.countDocuments(filterFind)
    res.json({ count, pages: Math.ceil(count / perPage) })
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
      const company = await CompanyModel.findOne({ user_id: req.tokenData._id });
      job.company_id = company._id;
      job.approved = false;
      if(!job.img_url)job.img_url="https://images.pexels.com/photos/5256816/pexels-photo-5256816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
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
    if (req.tokenData.role == "company") {
      data = await JobModel.updateOne({ _id: id }, req.body);
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

router.patch("/changeApproval/:id/:approved", authAdmin, async (req, res) => {
  const id = req.params.id;
  const approved = req.params.approved;
  try {
    // 642297fa073568668885db3a -> איי די של הסופר אדמין
    const data = await JobModel.updateOne({ _id: id }, { approved: approved })
    res.json(data);

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
      data = await JobModel.deleteOne({ _id: id });
    }
    else {
      const job = await JobModel.findOne({ _id: id }).populate('company_id');
      if (job.company_id.user_id = req.tokenData._id)
        data = await JobModel.deleteOne({ _id: id });
    }
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

module.exports = router;