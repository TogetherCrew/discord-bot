"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = require("node:fs/promises");
async function loadEvents(client) {
    const foldersPath = path_1.default.join(__dirname, '../../events');
    const eventFolders = await (0, promises_1.readdir)(foldersPath);
    for (const folder of eventFolders) {
        const eventsPath = path_1.default.join(foldersPath, folder);
        const eventFiles = (await (0, promises_1.readdir)(eventsPath)).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        for (const file of eventFiles) {
            const filePath = path_1.default.join(eventsPath, file);
            const event = (await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)))).default;
            if (event.once) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                client.once(event.name, (...args) => event.execute(...args));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}
exports.default = loadEvents;
