"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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
exports.convertIotHubToEventHubsConnectionString = void 0;
/**
 * @summary Demonstrates how to convert an IoT Hub connection string to an Event Hubs connection string that points to the built-in messaging endpoint.
*/
/*
* The Event Hubs connection string is then used with the EventHubConsumerClient to receive events.
*
* More information about the built-in messaging endpoint can be found at:
* https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-messages-read-builtin
*/
var crypto = require("crypto");
var buffer_1 = require("buffer");
var rhea_promise_1 = require("rhea-promise");
var rheaPromise = require("rhea-promise");
var core_amqp_1 = require("@azure/core-amqp");
/**
 * Type guard for AmqpError.
 * @param err - An unknown error.
 */
function isAmqpError(err) {
    return rheaPromise.isAmqpError(err);
}
// This code is modified from https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-security#security-tokens.
function generateSasToken(resourceUri, signingKey, policyName, expiresInMins) {
    resourceUri = encodeURIComponent(resourceUri);
    var expiresInSeconds = Math.ceil(Date.now() / 1000 + expiresInMins * 60);
    var toSign = resourceUri + "\n" + expiresInSeconds;
    // Use the crypto module to create the hmac.
    var hmac = crypto.createHmac("sha256", buffer_1.Buffer.from(signingKey, "base64"));
    hmac.update(toSign);
    var base64UriEncoded = encodeURIComponent(hmac.digest("base64"));
    // Construct authorization string.
    return "SharedAccessSignature sr=".concat(resourceUri, "&sig=").concat(base64UriEncoded, "&se=").concat(expiresInSeconds, "&skn=").concat(policyName);
}
/**
 * Converts an IotHub Connection string into an Event Hubs-compatible connection string.
 * @param connectionString - An IotHub connection string in the format:
 * `"HostName=<your-iot-hub>.azure-devices.net;SharedAccessKeyName=<KeyName>;SharedAccessKey=<Key>"`
 * @returns An Event Hubs-compatible connection string in the format:
 * `"Endpoint=sb://<hostname>;EntityPath=<your-iot-hub>;SharedAccessKeyName=<KeyName>;SharedAccessKey=<Key>"`
 */
function convertIotHubToEventHubsConnectionString(connectionString) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, HostName, SharedAccessKeyName, SharedAccessKey, iotHubName, token, connection, receiver;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, rhea_promise_1.parseConnectionString)(connectionString), HostName = _a.HostName, SharedAccessKeyName = _a.SharedAccessKeyName, SharedAccessKey = _a.SharedAccessKey;
                    // Verify that the required info is in the connection string.
                    if (!HostName || !SharedAccessKey || !SharedAccessKeyName) {
                        throw new Error("Invalid IotHub connection string.");
                    }
                    iotHubName = HostName.split(".")[0];
                    if (!iotHubName) {
                        throw new Error("Unable to extract the IotHub name from the connection string.");
                    }
                    token = generateSasToken("".concat(HostName, "/messages/events"), SharedAccessKey, SharedAccessKeyName, 5 // token expires in 5 minutes
                    );
                    connection = new rhea_promise_1.Connection({
                        transport: "tls",
                        host: HostName,
                        hostname: HostName,
                        username: "".concat(SharedAccessKeyName, "@sas.root.").concat(iotHubName),
                        port: 5671,
                        reconnect: false,
                        password: token
                    });
                    return [4 /*yield*/, connection.open()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, connection.createReceiver({
                            source: { address: "amqps://".concat(HostName, "/messages/events/$management") }
                        })];
                case 2:
                    receiver = _b.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            receiver.on(rhea_promise_1.ReceiverEvents.receiverError, function (context) {
                                var error = context.receiver && context.receiver.error;
                                if (isAmqpError(error) && error.condition === core_amqp_1.ErrorNameConditionMapper.LinkRedirectError && error.info) {
                                    var hostname = error.info.hostname;
                                    // an example: "amqps://iothub.test-1234.servicebus.windows.net:5671/hub-name/$management"
                                    var iotAddress = error.info.address;
                                    var regex = /:\d+\/(.*)\/\$management/i;
                                    var regexResults = regex.exec(iotAddress);
                                    if (!hostname || !regexResults) {
                                        reject(error);
                                    }
                                    else {
                                        var eventHubName = regexResults[1];
                                        resolve("Endpoint=sb://".concat(hostname, "/;EntityPath=").concat(eventHubName, ";SharedAccessKeyName=").concat(SharedAccessKeyName, ";SharedAccessKey=").concat(SharedAccessKey));
                                    }
                                }
                                else {
                                    reject(error);
                                }
                                connection.close()["catch"](function () {
                                    /* ignore error */
                                });
                            });
                        })];
            }
        });
    });
}
exports.convertIotHubToEventHubsConnectionString = convertIotHubToEventHubsConnectionString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRIdWJIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVyL2V2ZW50SHViSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7QUFDdkMsa0NBQWtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFbEM7O0VBRUU7QUFFRjs7Ozs7RUFLRTtBQUVGLCtCQUFpQztBQUNqQyxpQ0FBZ0M7QUFDaEMsNkNBQTRGO0FBQzVGLDBDQUE0QztBQUM1Qyw4Q0FBeUU7QUFFekU7OztHQUdHO0FBQ0gsU0FBUyxXQUFXLENBQUMsR0FBUTtJQUN6QixPQUFPLFdBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVELHVIQUF1SDtBQUN2SCxTQUFTLGdCQUFnQixDQUNyQixXQUFtQixFQUNuQixVQUFrQixFQUNsQixVQUFrQixFQUNsQixhQUFxQjtJQUVyQixXQUFXLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFOUMsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsYUFBYSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzNFLElBQU0sTUFBTSxHQUFHLFdBQVcsR0FBRyxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7SUFFckQsNENBQTRDO0lBQzVDLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLGVBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDNUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQixJQUFNLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUVuRSxrQ0FBa0M7SUFD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