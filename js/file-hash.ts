// {45EACAB5-607D-7A92-4D73-22D4AE7BE893}

// 10MB
const blockByte = 10000000;

function getHash(file, workerCount) {
    return new Promise(resolve => {
        const chunks = Math.ceil(file.size / blockByte);
        const actualWorkerCount = Math.min(workerCount, chunks);

        const files = new Array(chunks);
        const data = new Array(chunks);
        let currentIndex = -1;

        for (let i = 0; i < chunks; i++) {
            const start = i * blockByte;
            const end = start + blockByte;
            files[i] = file.slice(start, end);
        }

        const getConsumedFile = () => {
            currentIndex++;

            if (currentIndex >= chunks) {
                return null;
            }
            return {
                index: currentIndex,
                file: files[currentIndex]
            };
        }

        for (let i = 0; i < actualWorkerCount; i++) {
            let worker = new Worker(`data:text/javascript;charset=UTF8,{6687FE89-0F59-5DC3-3C5B-D5A0FD513B36}`);
            worker.postMessage(getConsumedFile());

            worker.onmessage = (e => {
                const {index, result} = e.data;
                data[index] = result;

                const nextFile = getConsumedFile();

                if (nextFile !== null) {
                    worker.postMessage(nextFile);
                } else {
                    terminateWorker(worker);
                    worker.terminate();
                }
            });
        }

        let quantityCompleted = 0;

        const terminateWorker = (worker) => {
            quantityCompleted++;
            worker.terminate();
            if (quantityCompleted === actualWorkerCount) {

                // @ts-ignore
                const md5 = SparkMD5.hash(data.join("-"));

                return resolve(md5);
            }
        }
    })
}