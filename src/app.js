const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const path = require('path');

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));
// Routes
app.use('/', indexRouter);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));

module.exports = app;