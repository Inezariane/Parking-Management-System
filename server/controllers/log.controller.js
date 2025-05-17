const { Log } = require('../models');
const logger = require('../utils/logger.util');

const listLogs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Log.findAndCountAll({
      offset,
      limit,
    });
    res.json({
      logs: rows,
      totalItems: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      itemsPerPage: parseInt(limit),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { listLogs };