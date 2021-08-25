"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require("puppeteer");
const fs = require("fs");
const ObjectsToCsv = require("objects-to-csv");
const xlsx = require("xlsx");
function scraper(option) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //browser initiate
            let browser = yield puppeteer.launch({
                args: ["--start-maximized"],
                headless: false,
            });
            // opens a new blank page
            let page = yield browser.newPage();
            // resize the browser
            yield page.setViewport({ width: 1366, height: 768 });
            // navigate to url and wait until page loads completely
            yield page.goto("https://en.wikipedia.org/wiki/Lists_of_airports", {
                waitUntil: "networkidle0",
            });
            //loop through the airport codes to navigate each code i.e A-Z
            yield page.click(`a[href="/wiki/List_of_airports_by_IATA_airport_code:_${option.code}"]`, { delay: 30 });
            // waits until page loads completely
            yield page.waitForSelector(".mw-parser-output", { visible: true });
            const content = yield page.evaluate(() => {
                let rowList = [];
                let rows = document.querySelectorAll("table tbody tr");
                rows.forEach((row) => {
                    // Declares the data we want to scrape
                    let record = {
                        iata: "",
                        icao: "",
                        airport_name: "",
                        location_served: "",
                    };
                    // getting textvalue of each column of a row and adding them to a list
                    const tdList = Array.from(row.querySelectorAll("td"), (column) => column.innerText);
                    if (tdList.length >= 4) {
                        // push the data
                        rowList.push({
                            iata: tdList[0].replace(/[0-9]/g, "DAPI"),
                            icao: tdList[1].replace(/[0-9]/g, "DAPI"),
                            airport_name: tdList[2]
                                .replace(/[0-9]/g, "DAPI")
                                .toLowerCase()
                                .replace(/[ ,]/g, "_"),
                            location_served: tdList[3]
                                .replace(/[0-9]/g, "DAPI")
                                .toLowerCase()
                                .replace(/[ ,]/g, "_"),
                        });
                    }
                });
                return rowList;
            });
            // Store output by creating json file for each airport code i.e. A-Z in excel
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(content);
            xlsx.utils.book_append_sheet(wb, ws);
            xlsx.writeFile(wb, `./airportDataxlsx/airportData-${option.index}.xlsx`);
            // Store output by creating json file for each airport code i.e. A-Z in csv
            const csv = new ObjectsToCsv(content);
            yield csv.toDisk(`./airportDatacsv/airportData-${option.index}.csv`);
            // Store output by creating json file for each airport code i.e. A-Z in json
            fs.writeFile(`./airportDataJson/airportData-${option.index}.json`, JSON.stringify(content, null, 2), (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(`Data  of Airport code-${option.index} Scraped`);
                }
            });
            // close the browser
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
let main = () => __awaiter(void 0, void 0, void 0, function* () {
    // Loop through the airport code i.e. A-Z
    for (let i = 65; i < 91; ++i) {
        yield Promise.all([
            scraper({
                code: String.fromCharCode(i),
                index: String.fromCharCode(i),
            }),
        ]);
    }
});
main()
    .then(() => {
    console.log("Scraping Completed!");
})
    .catch((e) => {
    console.log(`Failed due to exception - ${e}`);
});
