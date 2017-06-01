'use strict';

const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const util = require('util');

const promiseFileR = util.promisify(fs.readFile);
const promiseFileW = util.promisify(fs.writeFile);

const RESULT_FILE = './stackoverflow-data.js';

// eslint-disable-next-line
function getTheOriginalData() {
    x(
        'https://stackoverflow.com/users?tab=reputation&filter=all',
        'td .user-info',
        [
            {
                title: '.user-details a',
                href: '.user-details a@href',
                location: '.user-location'
            }
        ]
    )
        .paginate('[rel="next"]@href')
        .limit(1000)(function(err, obj) {
            if (err) {
                // eslint-disable-next-line
                console.log(err);
            }
            const filtered = obj.filter(
                ({ location }) =>
                    location && location.toLowerCase().includes('moscow')
            );
            promiseFileW(RESULT_FILE, JSON.stringify(filtered, null, 4)).then(
                // eslint-disable-next-line
                console.log
            );
        });
}

promiseFileR(RESULT_FILE).then(body => {
    const filtered = JSON.parse(body.toString()).filter(
        ({ location }) => location && location.toLowerCase().includes('moscow')
    );
    promiseFileW(RESULT_FILE, JSON.stringify(filtered, null, 4)).then(
        // eslint-disable-next-line
        console.log
    );
});
