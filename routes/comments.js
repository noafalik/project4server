const express = require("express");
const router = express.Router();
const { CommentModel, validateComment } = require("../models/commentModel");
const { auth } = require("../middlewares/auth");

router.get("/", async (req, res) => {
  const perPage = req.query.perPage || 5;
  const page = req.query.page - 1 || 0;
  const user_id = req.query.user_id;

  try {
    let filterFind = {}
    // בודק אם קיבלנו קווארי של יוזר ואם כן משנה את הפליטר של הפיינד
    // למציאת פריטים שקשורים ליוזר
    if (user_id) {
      filterFind = { user_id }
    }
    let data = await CommentModel.find(filterFind)
      .populate('user_id')
      .limit(perPage)
      .skip(page * perPage)
      .sort({stars:-1})
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


router.post("/", auth, async (req, res) => {
  let validBody = validateComment(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let comment = new CommentModel(req.body);
    comment.user_id = req.tokenData._id
    await comment.save();
    res.json(comment)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.patch("/inc/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const comment = await CommentModel.findById(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Increment the likes count by 1
    if (!comment.likes.includes(req.tokenData._id)) {
      comment.likes.push(req.tokenData._id);
    }
    else {
      const index = comment.likes.indexOf(req.tokenData._id);
      comment.likes.splice(index, 1);
    }

    // Save the updated comment
    const updatedComment = await comment.save();

    res.json(updatedComment);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});





router.delete("/delete/:id", auth, async (req, res) => {
  try {
    let id = req.params.id;
    let data;
    // נותן אפשרות לאדמין למחוק את כל הרשומות
    if (req.tokenData.role == "admin") {
      data = await CommentModel.deleteOne({ _id: id });
    }
    else {
      data = await CommentModel.deleteOne({ _id: id, user_id: req.tokenData._id });
    }
    res.json(data)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

module.exports = router;