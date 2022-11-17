require('dotenv').config();

const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const logger = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const favicon = require('serve-favicon');
const compression = require('compression');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/dbConnection');
const corsOptions = require('./config/corsOptions');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');

const fourHandler = (req, res, next) => {
    next(createError(404));
};

const errorHandler = (err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('404', { user: req.user });
};

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

connectDB();
app.use(credentials);

// Built-in middlewares
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, '/public')));

// Routes
app.use('/', require('./routes/apis'));
app.use('/v1', require('./routes/root'));
app.use('/v1/auth', require('./routes/auth'));

// Theses routes are protected by JWT
app.use(verifyJWT);
app.use('/v1/users', require('./routes/api/users'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
    } else if (req.accepts('json')) {
        res.json({ error: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(fourHandler);
app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () =>
        console.log(`Running on port ${process.env.PORT || 3000}`)
    );
});
