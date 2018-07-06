'use strict';

const superAgent = require('superagent');

function getUrl(page, request) {
    return `https://api.github.com/search/users?page=${page}${request}`;
}

function requestPage(page, request) {
    return new Promise(resolve => {
        superAgent
            .get(getUrl(page, request))
            .auth('dkunin', process.env.GITHUB_PERS_TOKEN)
            .end((err, result) => {
                if (result.body.items) {
                    resolve(result.body.items);
                } else {
                    resolve([]);
                }
            });
    });
}

function getUser(login) {
    return new Promise(resolve => {
        superAgent(`https://api.github.com/users/${login}`)
            .auth('dkunin', process.env.GITHUB_PERS_TOKEN)
            .end((err, result) => {
                resolve(result.body);
            });
    });
}

function getLastActionInfo(originalObject) {
    return new Promise((resolve, reject) => {
        superAgent(
            `https://api.github.com/users/${originalObject.login}/events`
        )
            .auth('dkunin', process.env.GITHUB_PERS_TOKEN)
            .end((err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(
                    Object.assign(originalObject, {
                        lastActivity: result.body[0]
                    })
                );
            });
    });
}

function processData(data) {
    return new Promise((resolve, reject) => {
        Promise.all(data.map(({ login }) => getUser(login))).then(results => {
            const filteredResult = results
                .filter(Boolean)
                .filter(singleUser => {
                    return singleUser.email || singleUser.html_url;
                });
            Promise.all(filteredResult.map(getLastActionInfo)).then(resolve);
        }).catch(reject);
    });
}

function performSearch(request) {
    let resultingList = [];
    let allPromises = [];

    for (var i = 1; i < 2; i++) {
        allPromises.push(requestPage(i, request));
    }

    return new Promise((resolve, reject) => {
        Promise.all(allPromises)
            .then(allResults => {
                resultingList = allResults.reduce((newArray, singleItem) => {
                    return newArray.concat(singleItem);
                }, []);
                resolve(resultingList);
            })
            .catch(reject);
    });
}

module.exports = function(query) {
    return performSearch(query).then(processData);
};
