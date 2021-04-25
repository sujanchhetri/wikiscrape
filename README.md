# wikiscrape

# Steps to run:

- clone the repository
- Do `npm i` to install all the required modules
- `npm start` to run the scraper.

# Modules Used:

- [@types/node](https://www.npmjs.com/package/@types/node)
- [@types/puppeteer](https://www.npmjs.com/package/@types/puppeteer)
- [typescript](https://www.npmjs.com/package/typescript)
- [puppeteer](https://www.npmjs.com/package/puppeteer)

# TODOs

- [x] Go through each collection of airports by clicking A Z letters You have to click through the buttons on the page and not manipulate URLs + use page.goto().
- [x] After navigating to a collection of airports, scrape IATA, ICAO, Airport Name and Location Served columns for
      each of the airport.
- [x] Convert Airport Name and Location Served to lower case, replace whitespaces and commas with ‘\_’
      (underscore). For all columns substitute numbers with string ‘DAPI’. Example of input-output: “Ana1 Airport, Set” →
      “anadapi_airport\_\_set”
- [x] Save all scraped information into a JSON file.
