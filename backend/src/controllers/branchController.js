const Branch = require("../models/Branch");

// ➕ CREATE BRANCH
exports.createBranch = async (req, res) => {
  try {
    const { name, location } = req.body;

    const branch = await Branch.create({
      name,
      location,
      userId: req.user.id,
    });

    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 GET ALL BRANCHES
exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({
      userId: req.user.id,
    });

    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};