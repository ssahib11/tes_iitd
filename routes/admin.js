const express = require('express');
const router = express.Router();
const db = require("../models");

// db.sequelize.sync();

router.get('/', (req, res) => {
    res.send("Hello Admin, under construction");
});

router.get('/events', async (req, res) => {
    return db.Events.findAll()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => 
            res.status(500).send({
                message: err.message || "Could not process query"
            }));
});

module.exports = router;
