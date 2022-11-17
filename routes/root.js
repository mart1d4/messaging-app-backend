const express = require('express');
const router = express.Router();

router.get('^/$|/index(.html)?', (req, res) => {
    res.render('index', {
        api: {
            version: '1.0.0',
        },
    });
});

module.exports = router;
