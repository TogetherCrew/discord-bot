"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printMemoryUsage = void 0;
const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
function printMemoryUsage(str) {
    const memoryData = process.memoryUsage();
    const memoryUsage = {
        type: str,
        heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
    };
    console.log('****************');
    console.log(memoryUsage);
    console.log('****************');
}
exports.printMemoryUsage = printMemoryUsage;
