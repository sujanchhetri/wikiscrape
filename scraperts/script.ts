const puppeteer = require("puppeteer");
const fs = require("fs");

async function scraper(option: any) {
  try {
    //browser initiate
    let browser = await puppeteer.launch({
      args: ["--start-maximized"],
      headless: false,
    });
    // opens a new blank page
    let page = await browser.newPage();

    // resize the browser
    await page.setViewport({ width: 1366, height: 768 });

    // navigate to url and wait until page loads completely
    await page.goto("https://en.wikipedia.org/wiki/Lists_of_airports", {
      waitUntil: "networkidle0",
    });

    //loop through the airport codes to navigate each code i.e A-Z
    await page.click(
      `a[href="/wiki/List_of_airports_by_IATA_airport_code:_${option.code}"]`,
      { delay: 30 },
    );

    // waits until page loads completely
    await page.waitForSelector(".mw-parser-output", { visible: true });

    const content = await page.evaluate(() => {
      let rowList: any[] = [];

      let rows = document.querySelectorAll("table tbody tr");
      rows.forEach((row) => {
        // Declares the data we want to scrape
        let record: {
          iata: string;
          icao: string;
          airport_name: string;
          location_served: string;
        } = {
          iata: "",
          icao: "",
          airport_name: "",
          location_served: "",
        };
        // getting textvalue of each column of a row and adding them to a list
        const tdList = Array.from(
          row.querySelectorAll("td"),
          (column) => column.innerText,
        );

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
    // Store output by creating json file for each airport code i.e. A-Z
    fs.writeFile(
      `./airportData/airportData-${option.index}.json`,
      JSON.stringify(content, null, 2),
      (err: any) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Data  of Airport code-${option.index} Scraped`);
        }
      },
    );
    // close the browser
    await browser.close();
  } catch (e) {
    console.log(e);
  }
}

let main = async () => {
  // Loop through the airport code i.e. A-Z
  for (let i = 65; i < 91; ++i) {
    await Promise.all([
      scraper({
        code: String.fromCharCode(i),
        index: String.fromCharCode(i),
      }),
    ]);
  }
};

main()
  .then(() => {
    console.log("Scraping Completed!");
  })
  .catch((e) => {
    console.log(`Failed due to exception - ${e}`);
  });
