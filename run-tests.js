const newman = require('newman');
const fs = require('fs');
const path = require('path');

// Map test case names to their data files
const dataFiles = {
    'TC 12 - Quote - Invalid values in inputMint': './data/invalidMints.json',
    'TC 13 - Quote - Invalid values in outputMint': './data/invalidMints.json',
    'TC 14 - Quote - Invalid values in amount': './data/invalidAmounts.json',
    'TC 15 - Quote - Missing required fields': './data/missingFields.json',
    'TC 16 - Swap - Invalid values in userPublicKey': './data/invalidUserPublicKey.json',
    'TC 17 - Swap - Missing required fields': './data/swapMissingFields.json',
    'TC 18 - Swap Instructions - Invalid values in userPublicKey': './data/invalidUserPublicKey.json',
    'TC 19 - Swap Instructions - Missing required fields': './data/swapMissingFields.json',
    'TC 21 - Tokens - Tag with missing/invalid required parameters': './data/tokensInvalidTagValues.json',
    'TC 22 - Tokens - Category with missing/invalid required path parameters': './data/tokensInvalidCategoryValues.json',
    'TC 23 - Tokens - Category invalid values in limit': './data/tokensInvalidLimitForCategory.json',
    'TC 24 - Price - Missing/invalid required query parameter': './data/priceMissingInvalidField.json',
    'TC 27 - Precision handling for token amounts': './data/precisionHandling.json',
    'TC 30 - Input sanitisation': './data/maliciousInput.json'
};

const collectionPath = './collections/jupiterAutomatedCollection.json';
const collection = require(collectionPath);

// Helper to create a collection with only one request
function createSingleRequestCollection(originalCollection, requestName) {
    const clone = JSON.parse(JSON.stringify(originalCollection));

    const findRequest = (items) => {
        for (const item of items) {
            if (item.item) {
                const found = findRequest(item.item);
                if (found) return found;
            } else if (item.name === requestName) {
                return item;
            }
        }
    };

    const reqItem = findRequest(clone.item);
    if (!reqItem) throw new Error(`Request "${requestName}" not found`);
    clone.item = [reqItem];
    return clone;
}

// Sanitize a test case name into a filename-friendly string
function safeFileName(name) {
    return name.replace(/[^a-z0-9_\-]+/gi, '_');
}

// Run a single test case
async function runTestCase(testCaseName) {
    const dataFile = dataFiles[testCaseName];
    const iterationData = dataFile ? require(path.resolve(dataFile)) : undefined;
    const singleCollection = createSingleRequestCollection(collection, testCaseName);
    const safeName = safeFileName(testCaseName);
    const reportFile = `test-report-${safeName}.html`; // relative to reports folder

    return new Promise((resolve, reject) => {
        console.log(`\nRunning test case "${testCaseName}"${dataFile ? ' with data file' : ''}...`);
        newman.run({
            collection: singleCollection,
            iterationData,
            reporters: ['cli', 'htmlextra'],
            reporter: {
                htmlextra: {
                    export: `./reports/${reportFile}`,
                    title: 'Jupiter API Test Report',
                    browserTitle: 'Jupiter API Test Report',
                    skipHeaders: true,
                    logs: true,
                    timezone: 'UTC'
                }
            },
            globals: { values: [] },
        }, (err) => {
            if (err) return reject(err);
            console.log(`Test case "${testCaseName}" completed. Report saved: ./reports/${reportFile}`);
            resolve({ reportFile, testCaseName });
        });
    });
}

// Create an index HTML linking all reports with styling
function generateIndex(reports) {
    let links = reports
        .map(
            r => `<li><a href="${r.reportFile}" target="_blank">${r.testCaseName}</a></li>`
        )
        .join('\n');

    const html = `
    <html>
      <head>
        <title>Jupiter API Test Reports Index</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f7f9fc;
            color: #333;
            margin: 40px;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #2980b9;
            padding-bottom: 10px;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            margin: 10px 0;
          }
          a {
            text-decoration: none;
            color: #2980b9;
            font-weight: bold;
            transition: color 0.3s;
          }
          a:hover {
            color: #e74c3c;
          }
          hr {
            margin: 20px 0;
            border: 0;
            border-top: 1px solid #ccc;
          }
        </style>
      </head>
      <body>
        <h1>Jupiter API Test Reports</h1>
        <ul>${links}</ul>
      </body>
    </html>`;
    fs.writeFileSync('./reports/index.html', html, 'utf-8');
}


// Recursively collect all leaf request names from the collection
function collectRequestNames(items) {
    let names = [];
    for (const item of items) {
        if (item.item) {
            names = names.concat(collectRequestNames(item.item));
        } else if (item.name) {
            names.push(item.name);
        }
    }
    return names;
}

(async () => {
    try {
        const leafRequests = collectRequestNames(collection.item);

        const reportFiles = [];
        for (const testCaseName of leafRequests) {
            const reportInfo = await runTestCase(testCaseName);
            reportFiles.push(reportInfo);
        }

        console.log('\n🎉 All test cases completed!');
        generateIndex(reportFiles);
        console.log('Index page created at ./reports/index.html');
    } catch (err) {
        console.error('Error running test cases:', err);
    }
})();
