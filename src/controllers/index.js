const path = require('path');

// Controller for the home page
exports.getIndex = (req, res, next) => {
  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
};