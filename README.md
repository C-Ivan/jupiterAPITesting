# QA Engineer - Take Home Assignment

## 🔧 Prerequisites

To run the tests, you’ll need:

Node.js (v18 or later recommended)

npm (comes with Node.js)

Newman – Postman’s CLI runner

npm install -g newman


Newman HTML Reporter – for nicer reports

npm install -g newman-reporter-htmlextra


Postman Desktop App (optional) – for manual/exploratory testing

## 🚀 How to Run Tests

You can run the tests in two ways:

1️⃣ Manual Testing

Download the Postman collections and import them into Postman.

Run the Manual Collection to do exploratory testing.

2️⃣ Automated Testing

The Automated Collection uses data files located in the data folder.

Each test case is paired with its corresponding data file:

| Test Case                                                                 | Data File                                  |
|---------------------------------------------------------------------------|--------------------------------------------|
| TC 12 - Quote - Invalid values in inputMint                               | `./data/invalidMints.json`                 |
| TC 13 - Quote - Invalid values in outputMint                              | `./data/invalidMints.json`                 |
| TC 14 - Quote - Invalid values in amount                                  | `./data/invalidAmounts.json`               |
| TC 15 - Quote - Missing required fields                                   | `./data/missingFields.json`                |
| TC 16 - Swap - Invalid values in userPublicKey                            | `./data/invalidUserPublicKey.json`         |
| TC 17 - Swap - Missing required fields                                    | `./data/swapMissingFields.json`            |
| TC 18 - Swap Instructions - Invalid values in userPublicKey               | `./data/invalidUserPublicKey.json`         |
| TC 19 - Swap Instructions - Missing required fields                       | `./data/swapMissingFields.json`            |
| TC 21 - Tokens - Tag with missing/invalid required parameters             | `./data/tokensInvalidTagValues.json`       |
| TC 22 - Tokens - Category with missing/invalid required path parameters   | `./data/tokensInvalidCategoryValues.json`  |
| TC 23 - Tokens - Category invalid values in limit                         | `./data/tokensInvalidLimitForCategory.json`|
| TC 24 - Price - Missing/invalid required query parameter                  | `./data/priceMissingInvalidField.json`     |
| TC 27 - Precision handling for token amounts                              | `./data/precisionHandling.json`            |
| TC 30 - Input sanitisation                                                | `./data/maliciousInput.json`               |

## To run all automated tests with Newman:

node run-tests.js


This will generate:

One HTML report per test case in the reports folder

An index.html file linking to all individual test reports

## ⚙️ Continuous Integration (CI)

The .github/workflows/ci.yml file runs tests automatically:

On every push to main

On pull requests targeting main

The workflow executes all automated tests with Newman and produces the same reports as running locally:

One HTML report per test case

An index page for easy navigation