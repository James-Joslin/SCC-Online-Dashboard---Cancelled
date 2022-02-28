// App node modules
const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');

// Launch Web App
const app = express();
app.disable('x-powered-by');
app.use(express.static('public'));
app.listen(3000, () => console.log('Listening at 3000'))

// Library Imports
const { getCompData_nationalLTLA, mergeCSV_nationalLTLA } = require('./serverFunctions_Library/compLTLA_lib');
const { getDeaths_Surrey, getDeaths_LTLA, mergeCSV_deathsLTLA } = require('./serverFunctions_Library/deathsLib');
const { getHosp_trusts, mergeCSV_hospTrusts } = require('./serverFunctions_Library/hospLib');
const { getRates_Surrey, getRates_msoa, mergeCSV_ratesMSOA } = require('./serverFunctions_Library/ratesLib');
const { getVac_Surrey, getVac_LTLAs, mergeCSV_vacLTLA } = require('./serverFunctions_Library/vacLib');
const { getVent_trusts, mergeCSV_ventTrusts } = require('./serverFunctions_Library/ventLib');

function getBackendData() {
    getVent_trusts();
    getCompData_nationalLTLA();
    getVac_Surrey();
    getVac_LTLAs();
    getDeaths_Surrey();
    getDeaths_LTLA();
    getHosp_trusts();
    getRates_Surrey();
    // Pause to make sure data is collected
    setTimeout(() => {
        // Then combine the neccassary seperated CSVs into one large file
        mergeCSV_ventTrusts();
        mergeCSV_nationalLTLA();
        mergeCSV_vacLTLA();
        mergeCSV_deathsLTLA();
        mergeCSV_hospTrusts();
        // Begin collecting MSOA rates
        getRates_msoa();
    }, 35000);
    setTimeout(() => {
        mergeCSV_ratesMSOA();
    }, 400000);
}

// Call functions to output data to local space
getBackendData();
setInterval(getBackendData,(1000 * 60 * 60 * 12));