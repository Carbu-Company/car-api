const carModel = require('../models/carModel');

exports.getCars = async (req, res, next) => {
  try {
    const { carAgent } = req.query;
    const cars = await carModel.getCars({carAgent});
    res.status(200).json(cars);
  } catch (err) {
    next(err);
  }
};
