const express = require('express');
const router = express.Router();
const db = require("../models");
const passport = require('passport');
const bcrypt = require('bcrypt');
const { ensureAuthenticated } = require('../config/auth.js');

// db.sequelize.sync();

router.get('/', ensureAuthenticated, (req, res) => {
    if (req.user) {
        res.redirect('dashboard');
    } else {
        res.redirect('login');
    }
});
router.get('/login', (req, res) => {
    if (req.user) {
        res.redirect('dashboard');
    } else {
        res.render('admin/login');
    }
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('admin/dashboard');
});

router.get('/blog', ensureAuthenticated, (req, res) => {
    res.render('admin/blog');
});

router.get('/team', ensureAuthenticated, (req, res) => {
    res.render('admin/team');
});

router.get('/logout',  (req, res) => {
    req.logout();
    res.redirect('login');
})

router.get('/events',ensureAuthenticated, async (req, res) => {
    events = await db.Events.findAll();
    return res.render('admin/events', { events : events });
});

router.get('/events/add', ensureAuthenticated, async (req, res) => {
    return res.render('admin/editEvent');
});

router.post('/login', (req, res, next) => {
    console.log(req.body);
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/login',
    })(req, res, next);
});

router.post('/events/add', ensureAuthenticated, async (req, res) => {
    return res.json("Form under construction");
});

module.exports = router;
