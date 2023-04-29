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
Object.defineProperty(exports, "__esModule", { value: true });
exports.chaincodeName = exports.channelName = exports.asLocalhost = exports.port = exports.loglevel = exports.ORG = void 0;
const env = __importStar(require("env-var"));
exports.ORG = 'SampleOrg';
exports.loglevel = env
    .get("LOG_LEVEL")
    .default('info')
    .asEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);
exports.port = env
    .get('PORT')
    .default('3000')
    .example('3000')
    .asPortNumber();
exports.asLocalhost = env
    .get('AS_LOCAL_HOST')
    .default('true')
    .example('true')
    .asBoolStrict();
exports.channelName = env
    .get('HLF_CONNECTION_PROFILE_ORG1')
    .asString();
exports.chaincodeName = env
    .get('HLF_CHAINCODE_NAME')
    .default('mycc')
    .example('evote')
    .asString();
//# sourceMappingURL=config.js.map