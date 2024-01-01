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

Following parameters are supported:

- **output**: The format to be converted to. "json" (default) -- convert csv to json. "csv" -- convert csv to csv row array. "line" -- convert csv to csv line string
- **delimiter**: delimiter used for separating columns. Use "auto" if delimiter is unknown in advance, in this case, delimiter will be auto-detected (by best attempt). Use an array to give a list of potential delimiters e.g. [",","|","$"]. default: ","
- **quote**: If a column contains delimiter, it is able to use quote character to surround the column content. e.g. "hello, world" won't be split into two columns while parsing. Set to "off" will ignore all quotes. default: " (double quote)
- **trim**: Indicate if parser trim off spaces surrounding column content. e.g. " content " will be trimmed to "content". Default: true
- **checkType**: This parameter turns on and off whether check field type. Default is false. (The default is `true` if version < 1.1.4)
- **ignoreEmpty**: Ignore the empty value in CSV columns. If a column value is not given, set this to true to skip them. Default: false.
- **fork (experimental)**: Fork another process to parse the CSV stream. It is effective if many concurrent parsing sessions for large csv files. Default: false
- **noheader**:Indicating csv data has no header row and first row is data row. Default is false. See [header row](#header-row)
- **headers**: An array to specify the headers of CSV data. If --noheader is false, this value will override CSV header row. Default: null. Example: ["my field","name"]. See [header row](#header-row)
- **flatKeys**: Don't interpret dots (.) and square brackets in header fields as nested object or array identifiers at all (treat them like regular characters for JSON field identifiers). Default: false.
- **maxRowLength**: the max character a csv row could have. 0 means infinite. If max number exceeded, parser will emit "error" of "row_exceed". if a possibly corrupted csv data provided, give it a number like 65535 so the parser won't consume memory. default: 0
- **checkColumn**: whether check column number of a row is the same as headers. If column number mismatched headers number, an error of "mismatched_column" will be emitted.. default: false
- **eol**: End of line character. If omitted, parser will attempt to retrieve it from the first chunks of CSV data.
- **escape**: escape character used in quoted column. Default is double quote (") according to RFC4108. Change to back slash (\\) or other chars for your own case.
- **includeColumns**: This parameter instructs the parser to include only those columns as specified by the regular expression. Example: /(name|age)/ will parse and include columns whose header contains "name" or "age"
- **ignoreColumns**: This parameter instructs the parser to ignore columns as specified by the regular expression. Example: /(name|age)/ will ignore columns whose header contains "name" or "age"
- **colParser**: Allows override parsing logic for a specific column. It accepts a JSON object with fields like: `headName: <String | Function | ColParser>` . e.g. {field1:'number'} will use built-in number parser to convert value of the `field1` column to number. For more information See [details below](#column-parser)
- **alwaysSplitAtEOL**: Always interpret each line (as defined by `eol` like `\n`) as a row. This will prevent `eol` characters from being used within a row (even inside a quoted field). Default is false. Change to true if you are confident no inline line breaks (like line break in a cell which has multi line text).
- **nullObject**: How to parse if a csv cell contains "null". Default false will keep "null" as string. Change to true if a null object is needed.
- **downstreamFormat**: Option to set what JSON array format is needed by downstream. "line" is also called ndjson format. This format will write lines of JSON (without square brackets and commas) to downstream. "array" will write complete JSON array string to downstream (suitable for file writable stream etc). Default "line"
