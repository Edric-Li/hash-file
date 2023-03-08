import * as fs from "fs-extra";
import {resolve} from "path";
import {execSync} from "child_process";

const jsFolder = resolve(__dirname, "../src");

const distFolder = resolve(__dirname, "../dist");

fs.removeSync(distFolder);

fs.ensureDirSync(distFolder);

// Read the contents of the spark-md5.min.js file
const sparkMd5MinJsString = fs.readFileSync(resolve(__dirname, "lib","spark-md5.min.js"))?.toString();

// Remove invalid content from spark-md5.min.js and extract valid content
const newSparkMd5MinJsString = sparkMd5MinJsString.replace(`(function(factory){if(typeof exports==="object"){module.exports=factory()}else if(typeof define==="function"&&define.amd){define(factory)}else{var glob;try{glob=window}catch(e){glob=self}glob.SparkMD5=factory()}})(function(undefined){"use strict";`, "").replace(`return SparkMD5});`, "")

// Read the contents of the worker.js file
const workerJsString = fs.readFileSync(resolve(jsFolder, "worker.ts"))?.toString();

// Replace the contents of the worker.js file
let newWorkerJsString = workerJsString.replace(`// {F2C4C2B5-2F39-4D3A-18C4-B7652B6ABC01}`, newSparkMd5MinJsString);

// Write worker.js to the dist folder
fs.writeFileSync(resolve(distFolder, "worker.js"), newWorkerJsString);

// Execute JS compression
execSync("uglifyjs  ../dist/worker.js -m -o ../dist/worker.min.js")

// Read the contents of the compressed worker.min.js file
newWorkerJsString = fs.readFileSync(resolve(distFolder, "worker.min.js"))?.toString();

// Read the contents of the index.js file
const fileHashJsString = fs.readFileSync(resolve(jsFolder, "index.ts"))?.toString();

// Replace the contents of the index.js file
const finalContent = fileHashJsString.replace("// {45EACAB5-607D-7A92-4D73-22D4AE7BE893}", sparkMd5MinJsString).replace("{6687FE89-0F59-5DC3-3C5B-D5A0FD513B36}", newWorkerJsString);

// Write index.js to the dist folder
fs.writeFileSync(resolve(distFolder, "index.ts"), finalContent);

try {
    execSync("tsc  --allowUnreachableCode  --allowUnusedLabels ../dist/index.ts");
} catch (e) {
    //
}

// Execute JS compression
execSync("uglifyjs  ../dist/index.js -m -o ../dist/hash-file.min.js")

// Clean up useless files
fs.removeSync("../dist/index.ts");
fs.removeSync("../dist/index.js");
fs.removeSync("../dist/worker.js");
fs.removeSync("../dist/worker.min.js");
