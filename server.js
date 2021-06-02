const express = require('express');
const path = require('path');
const logger = require('morgan');
// const routes = require('./routes');

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

const app = express();

const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/admin', adminRouter);



app.listen(port, () => {
    console.log(`Server listening at ${port}`);
});
