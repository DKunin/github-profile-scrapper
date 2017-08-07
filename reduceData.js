'use strict';

const request = require('superagent');
const fs = require('fs');
const dataFile = JSON.parse(fs.readFileSync('./data.json').toString());

function getUser(login) {
    return new Promise(resolve => {
        request(`https://api.github.com/users/${login}`)
            .auth('dkunin', process.env.GITHUB_PERS_TOKEN)
            .end((err, result) => {
                resolve(result.body);
            });
    });
}

function getLastActionInfo(originalObject) {
    return new Promise(resolve => {
        request(`https://api.github.com/users/${originalObject.login}/events`)
            .auth('dkunin', process.env.GITHUB_PERS_TOKEN)
            .end((err, result) => {
                resolve(Object.assign(originalObject, { lastActivity: result.body[0] }));
            });
    });
}

Promise.all(dataFile.map(({ login }) => getUser(login)))
    .then(results => {
        const filteredResult = results
            .filter(Boolean)
            .filter(singleUser => {
                return singleUser.email && singleUser.hireable;
            });
        Promise.all(filteredResult.map(getLastActionInfo)).then(narrowedResults => {
            fs.writeFileSync('./filteredResult.json', JSON.stringify(narrowedResults, null, 4));
        });
    });
