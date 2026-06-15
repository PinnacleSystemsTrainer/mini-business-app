const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  register,
};
