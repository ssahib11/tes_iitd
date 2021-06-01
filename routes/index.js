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

routes.get('/first', (req, res) => {
    res.send('Hello From Index');
});

routes.get('/events', async (req, res) => {
    const events = await db.Events.findAll(); 
    res.send(events);
});

module.exports = routes;
