[![Build Status](https://travis-ci.org/Keyang/node-csvtojson.svg?branch=master)](https://travis-ci.org/Keyang/node-csvtojson)
[![Coverage Status](https://coveralls.io/repos/github/Keyang/node-csvtojson/badge.svg?branch=master)](https://coveralls.io/github/Keyang/node-csvtojson?branch=master)
[![OpenCollective](https://opencollective.com/csvtojson/backers/badge.svg)](#backers)
[![OpenCollective](https://opencollective.com/csvtojson/sponsors/badge.svg)](#sponsors)

# CSVTOJSON-TS

`csvtojson` module is a comprehensive nodejs csv parser to convert csv to json or column arrays. Below are some features:

- Strictly follow CSV definition [RFC4180](https://www.loc.gov/preservation/digital/formats/fdd/fdd000323.shtml)
- Work with millions of lines of CSV data
- Provide comprehensive parsing parameters
- Provide out of box CSV parsing tool for Command Line
- Blazing fast
- Give flexibility to developer with 'pre-defined' helpers
- Allow async / streaming parsing
- Provide a csv parser for both Node.JS and browsers
- Easy to use API

```ts
import { csv } from "csvtojson-ts";
```

# Menu

- [Quick Start](#quick-start)
- [API](#api)
- [Browser Usage](#browser-usage)
- [Contribution](#contribution)

## Library

### Installation

```
npm i --save csvtojson-ts
```

## Examples

Example using preRawData and preFileLine callbacks:

```ts
const converter = new Converter()
  .preRawData((csvString) => {
    // Perform some preprocessing on the raw CSV string
    const processedCSV = csvString.trim();
    return processedCSV;
  })
  .preFileLine((line, lineNumber) => {
    // Perform some preprocessing on each line of the CSV file
    const processedLine = line.toUpperCase();
    return processedLine;
  });

converter.fromString("Name, Age\nJohn, 25\nJane, 30").subscribe(
  (data, lineNumber) => {
    console.log(`Line ${lineNumber}:`, data);
  },
  (error) => {
    console.error("Error:", error);
  },
  () => {
    console.log("Parsing completed");
  }
);
```

Example reading from a file:

```ts
const converter = new Converter();

converter.fromFile("data.csv").subscribe(
  (data, lineNumber) => {
    console.log(`Line ${lineNumber}:`, data);
  },
  (error) => {
    console.error("Error:", error);
  },
  () => {
    console.log("Parsing completed");
  }
);
```

Example reading from a readable stream:

```ts
const fs = require("fs");
const readableStream = fs.createReadStream("data.csv");

const converter = new Converter();

converter.fromStream(readableStream).subscribe(
  (data, lineNumber) => {
    console.log(`Line ${lineNumber}:`, data);
  },
  (error) => {
    console.error("Error:", error);
  },
  () => {
    console.log("Parsing completed");
  }
);
```

Example parsing a CSV string directly:

```ts
const converter = new Converter();

converter.fromString("Name, Age\nJohn, 25\nJane, 30").subscribe(
  (data, lineNumber) => {
    console.log(`Line ${lineNumber}:`, data);
  },
  (error) => {
    console.error("Error:", error);
  },
  () => {
    console.log("Parsing completed");
  }
);
```
