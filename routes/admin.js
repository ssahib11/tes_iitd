const express = require('express');
const router = express.Router();
const db = require("../models");
const passport = require('passport');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated } = require('../config/auth.js');
const {body, validationResult } = require('express-validator');

db.sequelize.sync();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (req.body.type == "event") {
            cb(null, path.join('public', 'images', 'events'));
        } else if (req.body.type == "team") {
            cb(null, path.join('public', 'images', 'team'));
        } else {
            cb(null, path.join('public', 'images'));
        }
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, req.body.title.replace(/\ /g, '') + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => { 
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

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
});

router.get('/events',ensureAuthenticated, async (req, res) => {
    events = await db.Events.findAll({
        order: [
            ['date', 'DESC']
        ]
    });
    return res.render('admin/events', { events : events });
});

router.get('/events/add', async (req, res) => {
    eventObj = {
        id: null,
        title : "",
        date: "",
        time: "",
        image_path: "",
        description: ""
    };
    return res.render('admin/addEvent', { event : eventObj });
});

router.get('/events/delete/:id', async (req, res) => {
    dbEvent = await db.Events.findByPk(req.params.id);
    fs.unlink('public/' + dbEvent.image_path, (err) => {
        if (err) {
            console.error(err);
        }
        console.log("Image Deleted");
    });
    await db.Events.destroy({
        where: {
            id: req.params.id
        }
    });
    res.redirect('/admin/events');
});

router.get('/events/edit/:id', async (req, res) => {
    dbEvent = await db.Events.findByPk(req.params.id);
    const datetime = new Date(dbEvent.date);
    const date = datetime.toISOString().split('T')[0];
    const timeFull = datetime.toISOString().split('T')[1];
    const time = timeFull.split(':')[0] + ':' + timeFull.split(':')[1];

    eventObj = {
        id: dbEvent.id,
        title: dbEvent.title,
        date: date,
        time: time,
        description: dbEvent.description,
        image_path: dbEvent.image_path
    };
    return res.render('admin/updateEvent', { event : eventObj });
});

router.post('/login', (req, res, next) => {
    console.log(req.body);
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/login',
    })(req, res, next);
});

router.post(
    '/events/add', 
    upload.single('image'), 
    body('title').trim().isLength({ min: 1 }).escape().withMessage("No title Specified"),
        // .isAlphanumeric().withMessage("Title has non-alphanumeric characters"),
    body('description').isLength({ min: 1}).escape().withMessage("No Description Provided"),
        // .isAlphanumeric().withMessage("Descripition has non-alphanumeric characters"),
    body('date').isISO8601().withMessage("Date in incorrect format"),
    body('time').matches('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$|^(?![\\s\\S])').withMessage("Time in incorrect format"),
    async (req, res) => {
        console.log(req.file);
        console.log(req.body);
        const eventObj = {
            title: req.body.title,
            date: req.body.date,
            time: req.body.time,
            description: req.body.description
        };
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error(err);
                }
                console.log("Image Deleted");
            });
            console.log(errors);
            return res.render('admin/addEvent', { event : eventObj });
        } else {
            const dateStr = (eventObj.time == '') ? eventObj.date : eventObj.date + 'T' + eventObj.time + ':00+0530';
            console.log(dateStr);
            const date = new Date(dateStr);
            console.log(date);
            const path = req.file.path.replace('public', '');
            const event = await db.Events.create({
                title: eventObj.title,
                date: date,
                description: eventObj.description,
                image_path: path
            });
            return res.redirect('/admin/events');
        }
});

router.post('/events/update/:id', upload.single('image'), async (req, res) => {
    const event = await db.Events.findByPk(req.params.id);
    return res.json(event);
});

module.exports = router;
