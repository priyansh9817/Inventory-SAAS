const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createBranch,
  getBranches,
} = require("../controllers/branchController");

router.post("/", auth, createBranch);
router.get("/", auth, getBranches);

module.exports = router;