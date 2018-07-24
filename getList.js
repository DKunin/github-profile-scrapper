'use strict';

const superAgent = require('superagent');
const cache = require('memory-cache');
const TEN_MINUTES = 600000;

const USER_TOKEN = process.env.GITHUB_PERS_TOKEN;

function getUrl(request) {
    return `https://api.github.com/search/users${request}`;
}

function requestPage(request) {
    return new Promise(resolve => {
        superAgent
            .get(getUrl(request))
            .auth('dkunin', USER_TOKEN)
            .end((err, result) => {
                if (result.body) {
                    resolve(result.body);
                } else {
                    resolve([]);
                }
            });
    });
}

function getUser(login) {
    return new Promise(resolve => {
        superAgent(`https://api.github.com/users/${login}`)
            .auth('dkunin', USER_TOKEN)
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
            .auth('dkunin', USER_TOKEN)
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
        Promise.all(data.map(({ login }) => getUser(login)))
            .then(results => {
                const filteredResult = results
                    .filter(Boolean)
                    .filter(singleUser => {
                        return singleUser.email || singleUser.html_url;
                    });
                Promise.all(filteredResult.map(getLastActionInfo)).then(
                    resolve
                );
            })
            .catch(reject);
    });
}

function performSearch(request) {
    let resultingList = [];
    return new Promise((resolve, reject) => {
        requestPage(request)
            .then(allResults => {
                resultingList = allResults.items.reduce((newArray, singleItem) => {
                    return newArray.concat(singleItem);
                }, []);
                resolve({ total_count: allResults.total_count, list: resultingList });
            })
            .catch(reject);
    });
}

module.exports = function(query) {
    const cachedResult = cache.get(query);
    if (cachedResult) {
        return cachedResult;
    }
    return performSearch(query).then(async function(result) {
        const list = await processData(result.list);
        const processedData = { list, total_count: result.total_count };
        cache.put(query, processedData, TEN_MINUTES);
        return processedData;
    });
};
