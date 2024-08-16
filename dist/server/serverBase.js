"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.stopClient = exports.handleModelRepoPostRequest = exports.handleEventHubStopPostRequest = exports.handleEventHubMonitorPostRequest = exports.handleDataPlanePostRequest = exports.handleGetDirectoriesRequest = exports.handleReadFileNaiveRequest = exports.handleReadFileRequest = exports.ServerBase = exports.SUCCESS = exports.SERVER_ERROR = void 0;
/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
// this file is the legacy controller for local development, until we move server side code to use electron's IPC pattern and enable electron hot reloading
var fs = require("fs");
var http = require("http");
var WebSocket = require("ws");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var node_fetch_1 = require("node-fetch");
var event_hubs_1 = require("@azure/event-hubs");
var dataPlaneHelper_1 = require("./dataPlaneHelper");
var eventHubHelper_1 = require("./eventHubHelper");
var utils_1 = require("./utils");
exports.SERVER_ERROR = 500;
exports.SUCCESS = 200;
var BAD_REQUEST = 400;
var NOT_FOUND = 404;
var NO_CONTENT_SUCCESS = 204;
var messages = [];
var wss;
var ws;
var timerId;
var ServerBase = /** @class */ (function () {
    function ServerBase(port) {
        this.port = port;
    }
    ServerBase.prototype.init = function () {
        var _this = this;
        var app = express();
        app.use(bodyParser.json());
        app.use(cors({
            credentials: true,
            origin: 'http://127.0.0.1:3000'
        }));
        app.post(dataPlaneUri, exports.handleDataPlanePostRequest);
        app.post(eventHubMonitorUri, exports.handleEventHubMonitorPostRequest);
        app.post(eventHubStopUri, exports.handleEventHubStopPostRequest);
        app.post(modelRepoUri, exports.handleModelRepoPostRequest);
        app.get(readFileUri, exports.handleReadFileRequest);
        app.get(readFileNaiveUri, exports.handleReadFileNaiveRequest);
        app.get(getDirectoriesUri, exports.handleGetDirectoriesRequest);
        //initialize a simple http server
        var server = http.createServer(app);
        //start the server
        server.listen(this.port).on('error', function () {
            throw new Error("Failed to start the app on port ".concat(_this.port, " as it is in use.\n            You can still view static pages, but requests cannot be made to the services if the port is still occupied.\n            To get around with the issue, configure a custom port by setting the system environment variable 'AZURE_IOT_EXPLORER_PORT' to an available port number.\n            To learn more, please visit https://github.com/Azure/azure-iot-explorer/wiki/FAQ"));
        });
        //initialize the WebSocket server instance
        wss = new WebSocket.Server({ server: server });
        wss.on('connection', function (_ws) {
            if (_ws && _ws.readyState === WebSocket.OPEN) {
                ws = _ws;
            }
            else {
                ws = null;
            }
        });
    };
    return ServerBase;
}());
exports.ServerBase = ServerBase;
var readFileUri = '/api/ReadFile/:path/:file';
// tslint:disable-next-line:cyclomatic-complexity
var handleReadFileRequest = function (req, res) {
    try {
        var filePath = req.params.path;
        var expectedFileName = req.params.file;
        if (!filePath || !expectedFileName) {
            res.status(BAD_REQUEST).send();
        }
        else {
            var fileNames = fs.readdirSync(filePath);
            try {
                var foundContent = (0, utils_1.findMatchingFile)(filePath, fileNames, expectedFileName);
                if (foundContent) {
                    res.status(exports.SUCCESS).send(foundContent);
                }
                else {
                    res.status(NO_CONTENT_SUCCESS).send();
                }
            }
            catch (error) {
                res.status(NOT_FOUND).send(error.message); // couldn't find matching file, and the folder contains json files that cannot be parsed
            }
        }
    }
    catch (error) {
        res.status(exports.SERVER_ERROR).send(error);
    }
};
exports.handleReadFileRequest = handleReadFileRequest;
var readFileNaiveUri = '/api/ReadFileNaive/:path/:file';
var handleReadFileNaiveRequest = function (req, res) {
    try {
        var filePath = req.params.path;
        var expectedFileName = req.params.file;
        if (!filePath || !expectedFileName) {
            res.status(BAD_REQUEST).send();
        }
        else {
            var data = (0, utils_1.readFileFromLocal)(filePath, expectedFileName);
            JSON.parse(data); // try parse the data to validate json format
            res.status(exports.SUCCESS).send(data);
        }
    }
    catch (error) {
        res.status(exports.SERVER_ERROR).send(error);
    }
};
exports.handleReadFileNaiveRequest = handleReadFileNaiveRequest;
var getDirectoriesUri = '/api/Directories/:path';
var handleGetDirectoriesRequest = function (req, res) {
    try {
        var dir = req.params.path;
        if (dir === '$DEFAULT') {
            (0, utils_1.fetchDrivesOnWindows)(res);
        }
        else {
            (0, utils_1.fetchDirectories)(dir, res);
        }
    }
    catch (error) {
        res.status(exports.SERVER_ERROR).send(error);
    }
};
exports.handleGetDirectoriesRequest = handleGetDirectoriesRequest;
var dataPlaneUri = '/api/DataPlane';
var handleDataPlanePostRequest = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var dataPlaneRequest, response, _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                if (!!req.body) return [3 /*break*/, 1];
                res.status(BAD_REQUEST).send();
                return [3 /*break*/, 4];
            case 1:
                dataPlaneRequest = (0, dataPlaneHelper_1.generateDataPlaneRequestBody)(req);
                response = (0, node_fetch_1["default"])(dataPlaneRequest.url, dataPlaneRequest.request);
                _a = dataPlaneHelper_1.generateDataPlaneResponse;
                return [4 /*yield*/, response];
            case 2: return [4 /*yield*/, _a.apply(void 0, [_b.sent(), res])];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                res.status(exports.SERVER_ERROR).send(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.handleDataPlanePostRequest = handleDataPlanePostRequest;
var eventHubMonitorUri = '/api/EventHub/monitor';
var IOTHUB_CONNECTION_DEVICE_ID = 'iothub-connection-device-id';
var IOTHUB_CONNECTION_MODULE_ID = 'iothub-connection-module-id';
var client = null;
var subscription = null;
var handleEventHubMonitorPostRequest = function (req, res) {
    try {
        if (!req.body) {
            res.status(BAD_REQUEST).send();
            return;
        }
        initializeEventHubClient(req.body).then(function () {
            res.status(exports.SUCCESS).send([]);
        });
    }
    catch (error) {
        res.status(exports.SERVER_ERROR).send(error);
    }
};
exports.handleEventHubMonitorPostRequest = handleEventHubMonitorPostRequest;
var eventHubStopUri = '/api/EventHub/stop';
var handleEventHubStopPostRequest = function (req, res) {
    try {
        if (!req.body) {
            res.status(BAD_REQUEST).send();
            return;
        }
        (0, exports.stopClient)().then(function () {
            res.status(exports.SUCCESS).send();
        });
    }
    catch (error) {
        res.status(exports.SERVER_ERROR).send(error);
    }
};
exports.handleEventHubStopPostRequest = handleEventHubStopPostRequest;
var modelRepoUri = '/api/ModelRepo';
var handleModelRepoPostRequest = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var controllerRequest, response, _a, _b, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.body) {
                    res.status(BAD_REQUEST).send();
                }
                controllerRequest = req.body;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, node_fetch_1["default"])(controllerRequest.uri, {
                        body: controllerRequest.body || null,
                        headers: controllerRequest.headers || null,
                        method: controllerRequest.method || 'GET'
                    })];
            case 2:
                response = _c.sent();
                _b = (_a = res.status((response && response.status) || exports.SUCCESS)).send;
                return [4 /*yield*/, response.json()];
            case 3:
                _b.apply(_a, [(_c.sent()) || {}]); //tslint:disable-line
                return [3 /*break*/, 5];
            case 4:
                error_2 = _c.sent();
                res.status(exports.SERVER_ERROR).send(error_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.handleModelRepoPostRequest = handleModelRepoPostRequest;
var initializeEventHubClient = function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!params.customEventHubConnectionString) return [3 /*break*/, 1];
                client = new event_hubs_1.EventHubConsumerClient(params.consumerGroup, params.customEventHubConnectionString);
                return [3 /*break*/, 3];
            case 1:
                _a = event_hubs_1.EventHubConsumerClient.bind;
                _b = [void 0, params.consumerGroup];
                return [4 /*yield*/, (0, eventHubHelper_1.convertIotHubToEventHubsConnectionString)(params.hubConnectionString)];
            case 2:
                client = new (_a.apply(event_hubs_1.EventHubConsumerClient, _b.concat([_c.sent()])))();
                _c.label = 3;
            case 3:
                subscription = client.subscribe({
                    processEvents: function (events) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            handleMessages(events, params);
                            return [2 /*return*/];
                        });
                    }); },
                    processError: function (err) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log(err);
                            return [2 /*return*/];
                        });
                    }); }
                });
                timerId = setInterval(function () {
                    if (ws.readyState === 1) {
                        ws === null || ws === void 0 ? void 0 : ws.send(JSON.stringify(messages));
                    }
                    messages = [];
                }, 800 // send messages to client in a 0.8 sec interval
                );
                return [2 /*return*/];
        }
    });
}); };
var handleMessages = function (events, params) {
    events.forEach(function (event) {
        var _a, _b;
        if (((_a = event === null || event === void 0 ? void 0 : event.systemProperties) === null || _a === void 0 ? void 0 : _a[IOTHUB_CONNECTION_DEVICE_ID]) === params.deviceId) {
            if (!params.moduleId || ((_b = event === null || event === void 0 ? void 0 : event.systemProperties) === null || _b === void 0 ? void 0 : _b[IOTHUB_CONNECTION_MODULE_ID]) === params.moduleId) {
                var message_1 = {
                    body: event.body,
                    enqueuedTime: event.enqueuedTimeUtc.toString(),
                    properties: event.properties,
                    sequenceNumber: event.sequenceNumber
                };
                message_1.systemProperties = event.systemProperties;
                if (messages.find(function (item) { return item.sequenceNumber === message_1.sequenceNumber; }))
                    return; // do not push message if the same sequence already exist
                messages.push(message_1);
            }
        }
    });
};
var stopClient = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('stop client');
                if (messages.length >= 1) {
                    // send left over messages if any
                    ws === null || ws === void 0 ? void 0 : ws.send(JSON.stringify(messages));
                    messages = [];
                }
                clearInterval(timerId);
                return [4 /*yield*/, (subscription === null || subscription === void 0 ? void 0 : subscription.close())];
            case 1:
                _a.sent();
                return [4 /*yield*/, (client === null || client === void 0 ? void 0 : client.close())];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.stopClient = stopClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2ZXIvc2VydmVyQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OzREQUc0RDtBQUM1RCwySkFBMko7QUFDM0osdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3Qiw4QkFBZ0M7QUFDaEMsaUNBQW1DO0FBQ25DLHdDQUEwQztBQUMxQywyQkFBNkI7QUFDN0IseUNBQStCO0FBQy9CLGdEQUE0RjtBQUM1RixxREFBNEY7QUFDNUYsbURBQTRFO0FBQzVFLGlDQUFzRztBQUV6RixRQUFBLFlBQVksR0FBRyxHQUFHLENBQUM7QUFDbkIsUUFBQSxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQzNCLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUN4QixJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDdEIsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFFL0IsSUFBSSxRQUFRLEdBQWMsRUFBRSxDQUFDO0FBQzdCLElBQUksR0FBcUIsQ0FBQztBQUMxQixJQUFJLEVBQXVCLENBQUM7QUFDNUIsSUFBSSxPQUFxQixDQUFDO0FBVTFCO0lBRUksb0JBQVksSUFBWTtRQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRU0seUJBQUksR0FBWDtRQUFBLGlCQW9DQztRQW5DRyxJQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQztRQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1QsV0FBVyxFQUFFLElBQUk7WUFDakIsTUFBTSxFQUFFLHVCQUF1QjtTQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVKLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFB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