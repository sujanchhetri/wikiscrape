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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const ObjectsToCsv = require("objects-to-csv");
const xlsx_1 = __importDefault(require("xlsx"));
// Function to scrape data based on the provided airport code option
function scraper(option) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize the browser instance
            const browser = yield puppeteer_1.default.launch({
                args: ["--start-maximized"],
                headless: false, // Set to true for headless mode (no browser UI)
            });
            // Open a new blank page
            const page = yield browser.newPage();
            // Set the viewport size for the browser
            yield page.setViewport({ width: 1366, height: 768 });
            // Navigate to the Wikipedia page for lists of airports
            yield page.goto("https://en.wikipedia.org/wiki/Lists_of_airports", {
                waitUntil: "networkidle0", // Wait until the network is idle (all requests have completed)
            });
            // Click on the link corresponding to the current airport code (A-Z)
            yield page.click(`a[href="/wiki/List_of_airports_by_IATA_airport_code:_${option.code}"]`, { delay: 30 });
            // Wait until the page content is fully loaded and visible
            yield page.waitForSelector(".mw-parser-output", { visible: true });
            // Extract data from the page
            const content = yield page.evaluate(() => {
                const rowList = [];
                // Select all table rows within the tbody element
                const rows = document.querySelectorAll("table tbody tr");
                // Iterate over each row to extract and format the required data
                rows.forEach((row) => {
                    const record = {
                        iata: "",
                        icao: "",
                        airport_name: "",
                        location_served: "",
                    };
                    // Get the text content of each column in the row
                    const tdList = Array.from(row.querySelectorAll("td"), (column) => column.innerText);
                    // Ensure the row has the expected number of columns before processing
                    if (tdList.length >= 4) {
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
            // Save the scraped data to a JSON file for the current airport code
            const jsonFilePath = `./airportDataJson/airportData-${option.index}.json`;
            fs_1.default.writeFile(jsonFilePath, JSON.stringify(content, null, 2), (err) => {
                if (err) {
                    console.error(`Failed to write JSON file for Airport code-${option.index}: ${err}`);
                }
                else {
                    console.log(`JSON Data for Airport code-${option.index} scraped successfully`);
                }
            });
            // Save the data to a CSV file
            const csvFilePath = `./airportDataCsv/airportData-${option.index}.csv`;
            const csv = new ObjectsToCsv(content);
            yield csv.toDisk(csvFilePath);
            console.log(`CSV Data for Airport code-${option.index} saved successfully`);
            // Save the data to an XLSX file
            const xlsxFilePath = `./airportDataXlsx/airportData-${option.index}.xlsx`;
            const worksheet = xlsx_1.default.utils.json_to_sheet(content);
            const workbook = xlsx_1.default.utils.book_new();
            xlsx_1.default.utils.book_append_sheet(workbook, worksheet, "Airports");
            xlsx_1.default.writeFile(workbook, xlsxFilePath);
            console.log(`XLSX Data for Airport code-${option.index} saved successfully`);
            // Close the browser
            yield browser.close();
        }
        catch (error) {
            console.error(`Error during scraping for Airport code-${option.index}:`, error);
        }
    });
}
// Main function to loop through airport codes A-Z and trigger the scraper
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Loop through the ASCII codes for A-Z (65-90)
            for (let i = 65; i <= 90; ++i) {
                yield scraper({
                    code: String.fromCharCode(i),
                    index: String.fromCharCode(i),
                });
            }
            console.log("Scraping Completed Successfully!");
        }
        catch (error) {
            console.error("Scraping failed due to an exception:", error);
        }
    });
}
// Start the main function
main();
