"use strict";

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Blogpost } = require('./models');

const app = express();
app.use(express.json());
app.use(morgan('common'));

app.get('/posts', (req, res) => {
    Blogpost
        .find()
        .then(posts => {
            res.json(posts.map(post => post.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'something went wrong' });
        });
});

app.get('posts/:id', (req, res) => {
    Blogpost
        .findById(req.params.id)
        .then(post => res.json(post.serialize()))
        .catch(err => {
            console.error(err);
                res.status(500).json({message: 'Internal server error'})
        });
});

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'author', 'content'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Blogpost
        .create({
            title: req.body.title,
            author: req.body.author,
            content: req.body.content
        })
        .then(
            post => res.status(201).json(post.serialize())
        )
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

app.put('/posts/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const updated = {};
    const updateableFields = ['title', 'content', 'author'];
    updateableFields.forEach(field => {
        if(field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Blogpost
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/posts/:id', (req, res) => {
    Blogpost
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

app.use('*', function(req, res) {
    res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, { useNewUrlParser: true}, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if(require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports= {runServer, app, closeServer};