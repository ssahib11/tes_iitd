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
        if (req.body.type == "event") {
            cb(null, req.body.title.replace(/\ /g, '') + '-' + file.originalname);
        } else if (req.body.type == "team") {
            cb(null, req.body.name.replace(/\ /g, '') + '-' + file.originalname);
        } else {
            cb(null, req.body.title.replace(/\ /g, '') + '-' + file.originalname);
        }
    }
});

const fileFilter = (req, file, cb) => { 
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        req.fileValidationError = 'Only jpeg and png files supported';
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

const uploadImage = upload.single('image');

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

router.get('/logout',  (req, res) => {
    req.logout();
    res.redirect('login');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('admin/dashboard');
});

router.get('/blog', ensureAuthenticated, (req, res) => {
    res.render('admin/blog');
});

router.get('/team', ensureAuthenticated, async (req, res) => {
    const supervisors = await db.Team.findAll({
        where: {
            designation: "Supervisor"
        }
    });
    const studentHead = await db.Team.findAll({
        where: {
            designation: "Student Head"
        }
    });
    const coordinators = await db.Team.findAll({
        where: {
            designation: "Coordinator"
        }
    });
    const executives = await db.Team.findAll({
        where: {
            designation: "Executive"
        }
    });

    res.render('admin/team',{ supervisors: supervisors, studentHead: studentHead, coordinators: coordinators, executives: executives });
});

router.get('/team/add', (req, res) => {
    const memberObj = {
        id: null,
        name: "",
        designation:"",
        category: "",
        image: ""
    };
    return res.render('admin/addTeamMember', { member: memberObj });
});

router.get('/team/edit/:id', async (req, res) => {
    dbMember = await db.Team.findByPk(req.params.id);
    const memberObj = {
        id: dbMember.id,
        name: dbMember.name,
        designation: dbMember.designation,
        category: dbMember.category,
        image: dbMember.image
    };
    res.render('admin/updateTeamMember', { member: memberObj });
});

router.get('/team/delete/:id', async (req, res) => {
    dbMember = await db.Team.findByPk(req.params.id);
    fs.unlink('public/' + dbMember.image, (err) => {
        if (err) { 
            console.log(err);
        }
        console.log("Profile image deleted");
    });
    await db.Team.destroy({
        where: {
            id: req.params.id
        }
    });
    res.redirect('/admin/team');
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
    const eventObj = {
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
    (req, res, next) => {
        uploadImage(req, res, err => {
            const eventObj = {
                title: req.body.title,
                date: req.body.date,
                time: req.body.time,
                description: req.body.description
            };
            if (req.fileValidationError) {
                return res.render('admin/addEvent', { event: eventObj });
            }  else if (req.file == null) {
                return res.render('admin/addEvent', { event: eventObj });
            } else if (err instanceof multer.MulterError) {
                return res.render('admin/addEvent', { event: eventObj });
            }
            next();
        });
    },
    body('title').trim().isLength({ min: 1 }).escape().withMessage("No title Specified"),
        // .isAlphanumeric().withMessage("Title has non-alphanumeric characters"),
    body('description').trim().isLength({ min: 1 }).escape().withMessage("No Description Provided"),
        // .isAlphanumeric().withMessage("Descripition has non-alphanumeric characters"),
    body('date').isISO8601().withMessage("Date in incorrect format"),
    body('time').matches('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$|^(?![\\s\\S])').withMessage("Time in incorrect format"),
    async (req, res, err) => {
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
    }
);

router.post(
    '/events/edit/:id', 
    (req, res, next) => {
        uploadImage(req, res, err => {
            const eventObj = {
                id: req.params.id,
                title: req.body.title,
                date: req.body.date,
                time: req.body.time,
                description: req.body.description
            };
            if (req.fileValidationError) {
                return res.render('admin/updateEvent', { event: eventObj });
            } else if (err instanceof multer.MulterError) {
                return res.render('admin/updateEvent', { event: eventObj });
            }
            next();
        });
    },
    body('title').trim().isLength({ min: 1 }).escape().withMessage("No Title Specified"),
    body('description').trim().isLength({ min: 1 }).escape().withMessage("No Description Provided"),
    body('date').isISO8601().withMessage("Date in incorrect format"),
    body('time').matches('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$|^(?![\\s\\S])').withMessage("Time in incorrect format"),
    async (req, res) => {
        console.log(req.file);
        console.log(req.body);
        const eventObj = {
            id: req.params.id,
            title: req.body.title,
            date: req.body.date,
            time: req.body.time,
            description: req.body.description
        };
        const errors = validationResult(req);
        if (!errors.isEmpty() && req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error(err);
                }
                console.log("image deleted");
            });
            console.log(errors);
            return res.render('admin/updateEvent', { event : eventObj });
        } else {
            const dateStr = (eventObj.time == '') ? eventObj.date : eventObj.date + 'T' + eventObj.time + ':00+0530';
            console.log(dateStr);
            const date = new Date(dateStr);
            console.log(date);
            const event = await db.Events.findByPk(req.params.id);
            event.title = eventObj.title;
            event.date = date;
            event.description = eventObj.description;
            if (req.file != null) { 
                const newPath = req.file.path.replace('public', '');
                if (newPath != event.image_path) {
                    fs.unlink('public/' + event.image_path, (err) => {
                        if (err) {
                            console.error(err);
                            console.log("couldn't delete image");
                        }
                        console.log("image deleted");
                    });
                    // const path = req.file.path.replace('public', '');
                    console.log(NewPath);
                    event.image_path = newPath;
                }
            }
            await event.save();
            return res.redirect('/admin/events');
        }
    }
);

router.post(
    '/team/add',
    (req, res, next) => {
        uploadImage(req, res, err => {
            const memberObj = {
                name: req.body.name,
                designation: req.body.designation,
                category: req.body.category,
            };
            
            if (req.fileValidationError) {
                return res.render('admin/addTeamMember', { member: memberObj });
            } else if (req.file == null) {
                return res.render('admin/addTeamMember', { member: memberObj });
            } else if (err instanceof multer.MulterError) {
                return res.render('admin/addTeamMember', { member: memberObj });
            }
            
            next();
        });
    },
    body('name').trim().isLength({ min: 1 }).escape().withMessage("No name provided"),
    body('designation').trim().isLength({ min: 1 }).withMessage("No designation provided")
    .isIn(['Supervisor','Student Head','Coordinator','Executive']).escape().withMessage("No designation provided"),
    body('category').trim().isLength({ min: 1 }).escape().withMessage("No category provided"),
    async (req, res, err) => {
        console.log(req.file);
        console.log(req.body);
        const memberObj = {
            name: req.body.name,
            designation: req.body.designation,
            category: req.body.category
        };
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("Image deleted");
            });
            console.log(errors);
            return res.render("admin/addTeamMember", { member: memberObj });
        } else {
            const path = req.file.path.replace('public', '');
            const member = await db.Team.create({
                name: memberObj.name,
                designation: memberObj.designation,
                category: memberObj.category,
                image: path
            });
            return res.redirect("/admin/team");
        }
    }
);

router.post(
    '/team/edit/:id',
    (req, res, next) => {
        uploadImage(req, res, err => {
            const memberObj = {
                id: req.params.id,
                name: req.body.name,
                designation: req.body.designation,
                category: req.body.category
            };
            if (req.fileValidationError) {
                return res.render('admin/updateTeamMember', { member: memberObj });
            } else if (err instanceof multer.MulterError) {
                return res.render('admin/updateTeamMember', { member: memberObj });
            }
            next();
        });
    },
    body('name').trim().isLength({ min: 1 }).escape().withMessage("No name provided"),
    body('designation').trim().isLength({ min: 1 }).withMessage("No designation provided")
    .isIn(['Supervisor','Student Head','Coordinator','Executive']).escape().withMessage("No designation provided"),
    body('category').trim().isLength({ min: 1 }).escape().withMessage("No category provided"),
    async (req, res, err) => {
        console.log(req.file);
        console.log(req.body);
        const memberObj = {
            id: req.params.id,
            name: req.body.name,
            designation: req.body.designation,
            category: req.body.category
        };
        const errors = validationResult(req);
        if (!errors.isEmpty() && req.file != null) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("Image deleted");
            });
            console.log(errors);
            return res.render('admin/updateTeamMember', { member: memberObj });
        } else {
            const member = await db.Team.findByPk(req.params.id);
            member.name = memberObj.name;
            member.designation = memberObj.designation;
            member.category = memberObj.category;
            if (req.file != null) {
                const newPath = req.file.path.replace('public', '');
                if (newPath != member.image) {
                    fs.unlink('public/' + member.image, (err) => {
                        if (err) {
                            console.error(err);
                            console.log("couldn't delete image");
                        }
                        console.log("image deleted");
                    });
                    member.image = newPath;
                }
            }
            await member.save();
            return res.redirect('/admin/team');
        }
    }
);


module.exports = router;
