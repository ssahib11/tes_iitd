const express = require('express');
const routes = express.Router();
const db = require("../models");

const posts = [
    {
        id: 1,
        author: 'John',
        title: 'TES 1',
        body: 'Blog post 1'
    },
    {
        id: 2,
        author: 'Peter',
        title: 'TES 2',
        body: 'Blog post 2'
    },

    {
        id: 3,
        author: 'Violet',
        title: 'TES 3',
        body: 'Blog post 3'
    },

    {
        id: 4,
        author: 'Condy',
        title: 'TES 4',
        body: 'Blog post 4'
    }

]

routes.get('/', (req, res) => {
    res.render('index');
});

routes.get('/events', async (req, res) => {
    const eventList = [
        {
            title: "Event 1",
            date: "2021-05-15",
            time: "12:03",
            description: "Description 1",
            image_path: "/images/events/image1.jpg"
        },
        {
            title: "Event 2",
            date: "2021-05-15",
            time: "12:03",
            description: "Description 2",
            image_path: "/images/events/image1.jpg"
        },
        {
            title: "Event 3",
            date: "2021-05-15",
            time: "12:03",
            description: "Description 3",
            image_path: "/images/events/image1.jpg"
        }

    ];
    res.render('events', { eventList: events });
});

routes.get('/blog', async (req, res) => {
    res.render('blog');
});

routes.get('/team', async (req, res) => {
    const hod = {
        name: "HOD 1",
        designation: "HOD",
    };
    const genSec = {
        name: "GSEC 1",
        designation: "GSEC",
    };
    const coord = {
        name: "COORD 1",
        designation: "COORD",
    };
    const exes = {
        name: "EXES 1",
        designation: "EXES",
    };
    res.render('tesTeam', { hod: hod, generalSecretary: genSec, coordinators: coord, executives: exes });
});

routes.get('/contact', async (req, res) => {
    const genSec = {
        name: "GSEC 1",
        designation: "GSEC",
    };
    res.render('contactUs', { generalSecretary: genSec });
});

module.exports = routes;
