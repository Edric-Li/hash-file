import * as fs from "fs-extra";
import {resolve} from "path";
import {execSync} from "child_process";

const jsFolder = resolve(__dirname, "../js");

const distFolder = resolve(__dirname, "../dist");

fs.ensureDirSync(distFolder);

// 读取 spark-md5.min.js 文件内容
const sparkMd5MinJsString = fs.readFileSync(resolve(jsFolder, "lib", "spark-md5.min.js"))?.toString();

// 剔除 spark-md5.min.js 无效内容，提取有效内容
const newSparkMd5MinJsString = sparkMd5MinJsString.replace(`(function(factory){if(typeof exports==="object"){module.exports=factory()}else if(typeof define==="function"&&define.amd){define(factory)}else{var glob;try{glob=window}catch(e){glob=self}glob.SparkMD5=factory()}})(function(undefined){"use strict";`, "").replace(`return SparkMD5});`, "")

// 读取 calculation-worker.js 文件内容
const workerJsString = fs.readFileSync(resolve(jsFolder, "calculation-worker.ts"))?.toString();

// 替换 calculation-worker.js 文件内容
let newWorkerJsString = workerJsString.replace(`// {F2C4C2B5-2F39-4D3A-18C4-B7652B6ABC01}`, newSparkMd5MinJsString);

// 将 calculation-worker.js 写入 dist 文件夹
fs.writeFileSync(resolve(distFolder, "calculation-worker.js"), newWorkerJsString);

// 执行JS压缩
execSync("uglifyjs  ../dist/calculation-worker.js -m -o ../dist/calculation-worker.min.js")

// 读取压缩后的 calculation-worker.min.js 文件内容
newWorkerJsString = fs.readFileSync(resolve(distFolder, "calculation-worker.min.js"))?.toString();

// 读取 file-hash.js 文件内容
const fileHashJsString = fs.readFileSync(resolve(jsFolder, "file-hash.ts"))?.toString();

// 替换 file-hash.js 文件内容
const finalContent = fileHashJsString.replace("// {45EACAB5-607D-7A92-4D73-22D4AE7BE893}", sparkMd5MinJsString).replace("{6687FE89-0F59-5DC3-3C5B-D5A0FD513B36}", newWorkerJsString);

// 将 file-hash.js 写入 dist 文件夹
fs.writeFileSync(resolve(distFolder, "file-hash.ts"), finalContent);

try {
    execSync("tsc  --allowUnreachableCode  --allowUnusedLabels ../dist/file-hash.ts");
} catch (e) {
    //
}

// 执行JS压缩
execSync("uglifyjs  ../dist/file-hash.js -m -o ../dist/file-hash.min.js")

fs.removeSync("../dist/file-hash.ts");
