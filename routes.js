const routes = require('express').Router();

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
    res.render('index', {title: 'TES | IITD', posts: posts});
});

routes.get('/first', (req, res) => {
    res.send('Hello From Index');
});

module.exports = routes;
