const { loadActor } = require("../services/orderStatusService");

module.exports = async (req, res, next) => {
  try {
    const actor = await loadActor(req.user.id, true);
    req.user.role = actor.role;
    next();
  } catch (error) { next(error); }
};
