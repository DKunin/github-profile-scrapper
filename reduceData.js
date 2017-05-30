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

Promise.all(dataFile.map(({ login }) => getUser(login)))
    .then(results => {
        const filteredResult = results
            .filter(Boolean)
            .filter(singleUser => {
                return singleUser.email && singleUser.hireable;
            });
        fs.writeFileSync('./filteredResult.json', JSON.stringify(filteredResult, null, 4));
    });
