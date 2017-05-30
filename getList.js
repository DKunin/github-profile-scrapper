'use strict';

const request = require('superagent');
const fs = require('fs');

function getUrl(page) {
    return `https://api.github.com/search/users?page=${page}&l=C&q=language%3AC+location%3AMoscow`;
}

function requestPage(page) {
    return new Promise(resolve => {
        request
        .get(getUrl(page))
        .auth('dkunin', process.env.GITHUB_PERS_TOKEN)
        .end((err, result) => {
            resolve(result.body.items);
        });
    });
}

let resultingList = [];
let allPromises = [];

for (var i = 1; i < 20; i++) {
    allPromises.push(requestPage(i));
}

Promise.all(allPromises).then(allResults => {
    resultingList = allResults.reduce((newArray, singleItem) => {
        return newArray.concat(singleItem);
    }, []);
    fs.writeFileSync('./data.json', JSON.stringify(resultingList, null, 4));
});

