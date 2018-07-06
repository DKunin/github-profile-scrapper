'use strict';

const request = require('superagent');
const fs = require('fs');

function getUrl(page) {
    return `https://api.github.com/search/users?page=${page}&q=language:javascript+location:${escape(
        'rostov-na-donu'
    )}`;
}

function requestPage(page) {
    return new Promise(resolve => {
        request
            .get(getUrl(page))
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

let resultingList = [];
let allPromises = [];

for (var i = 1; i < 50; i++) {
    allPromises.push(requestPage(i));
}

Promise.all(allPromises).then(allResults => {
    resultingList = allResults.reduce((newArray, singleItem) => {
        return newArray.concat(singleItem);
    }, []);
    fs.writeFileSync('./data.json', JSON.stringify(resultingList, null, 4));
});
