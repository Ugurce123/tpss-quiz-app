const auth = require('./auth');

module.exports = async (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin yetkisi gerekli' 
      });
    }
    next();
  });
};