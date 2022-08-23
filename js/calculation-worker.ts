onmessage = function (e) {
    const {index, file} = e.data;
    const fileReader = new FileReader();

    // {F2C4C2B5-2F39-4D3A-18C4-B7652B6ABC01}

    fileReader.onload = (e) => {
        const data = e.target.result;

        // @ts-ignore
        const spark = new SparkMD5.ArrayBuffer();
        spark.append(data);
        const result = spark.end();

        postMessage({index, result});
    };

    fileReader.readAsArrayBuffer(file);
}