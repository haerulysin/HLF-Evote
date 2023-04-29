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
exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const cors = __importStar(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("./util/logger");
const config = __importStar(require("./util/config"));
const http_status_codes_1 = require("http-status-codes");
const transaction_router_1 = require("./transaction.router");
const { OK, SERVICE_UNAVAILABLE } = http_status_codes_1.StatusCodes;
async function createServer() {
    const app = (0, express_1.default)();
    if (process.env.NODE_ENV === 'development') {
        app.use(cors());
    }
    if (process.env.NODE_ENV === 'production') {
        app.use((0, helmet_1.default)());
    }
    app.get('/', (req, res) => {
        res.status(OK).json({
            status: (0, http_status_codes_1.getReasonPhrase)(OK),
            params: req.params,
            timestamp: new Date().toISOString
        });
    });
    app.use('/api/transaction', transaction_router_1.txRouter);
    logger_1.logger.info("Starting RestAPI");
    app.listen(config.port, () => {
        logger_1.logger.info(`RestAPI server started on port http://localhost:${config.port}`);
    });
}
exports.createServer = createServer;
//# sourceMappingURL=server.js.map