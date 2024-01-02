"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("@togethercrew.dev/db");
class DatabaseManager {
    constructor() {
        this.modelCache = {};
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    getTenantDb(tenantId) {
        const dbName = tenantId;
        const db = mongoose_1.default.connection.useDb(dbName, { useCache: true });
        this.setupModels(db);
        return db;
    }
    setupModels(db) {
        if (!this.modelCache[db.name]) {
            db.model('HeatMap', db_1.heatMapSchema);
            db.model('RawInfo', db_1.rawInfoSchema);
            db.model('MemberActivity', db_1.MemberActivitySchema);
            db.model('GuildMember', db_1.guildMemberSchema);
            db.model('Channel', db_1.channelSchema);
            db.model('Role', db_1.roleSchema);
            this.modelCache[db.name] = true;
        }
    }
}
exports.default = DatabaseManager;
