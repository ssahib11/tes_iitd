const express = require('express');
const path = require('path');
const routes = require(path.join(__dirname, 'routes'));
// const routes = require('./routes');

const app = express();

const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', routes);
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server listening a ${port}`);
});
