"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.processDataPlaneResponse = exports.generateDataPlaneResponse = exports.generateDataPlaneRequestBody = void 0;
var DEVICE_STATUS_HEADER = 'x-ms-command-statuscode';
var SERVER_ERROR = 500;
var generateDataPlaneRequestBody = function (req) {
    var headers = __assign({ 'Accept': 'application/json', 'Authorization': req.body.sharedAccessSignature, 'Content-Type': 'application/json' }, req.body.headers);
    var apiVersion = req.body.apiVersion;
    var queryString = req.body.queryString ? "?".concat(req.body.queryString, "&api-version=").concat(apiVersion) : "?api-version=".concat(apiVersion);
    return {
        url: "https://".concat(req.body.hostName, "/").concat(encodeURIComponent(req.body.path)).concat(queryString),
        request: {
            body: req.body.body,
            headers: headers,
            method: req.body.httpMethod.toUpperCase()
        }
    };
};
exports.generateDataPlaneRequestBody = generateDataPlaneRequestBody;
var generateDataPlaneResponse = function (dataPlaneResponse, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.processDataPlaneResponse)(dataPlaneResponse)];
            case 1:
                response = _a.sent();
                res.status(response.statusCode).send(response.body);
                return [2 /*return*/];
        }
    });
}); };
exports.generateDataPlaneResponse = generateDataPlaneResponse;
// tslint:disable-next-line:cyclomatic-complexity
var processDataPlaneResponse = function (dataPlaneResponse) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceResponseBody, _a, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 9, , 10]);
                if (!dataPlaneResponse) {
                    throw new Error('Failed to get any response from iot hub service.');
                }
                if (!(dataPlaneResponse.headers && dataPlaneResponse.headers.get(DEVICE_STATUS_HEADER))) return [3 /*break*/, 5];
                deviceResponseBody = void 0;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, dataPlaneResponse.json()];
            case 2:
                deviceResponseBody = _d.sent();
                return [3 /*break*/, 4];
            case 3:
                _a = _d.sent();
                throw new Error('Failed to parse response from device. The response is expected to be a JSON document up to 128 KB. Learn more: https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-direct-methods#method-lifecycle.');
            case 4: return [2 /*return*/, {
                    body: { body: deviceResponseBody },
                    statusCode: parseInt(dataPlaneResponse.headers.get(DEVICE_STATUS_HEADER))
                }];
            case 5:
                if (!(dataPlaneResponse.status === 204)) return [3 /*break*/, 6];
                return [2 /*return*/, {
                        body: { body: null, headers: dataPlaneResponse.headers },
                        statusCode: dataPlaneResponse.status
                    }];
            case 6:
                _b = {};
                _c = {};
                return [4 /*yield*/, dataPlaneResponse.json()];
            case 7: return [2 /*return*/, (_b.body = (_c.body = _d.sent(), _c.headers = dataPlaneResponse.headers, _c),
                    _b.statusCode = dataPlaneResponse.status,
                    _b)];
            case 8: return [3 /*break*/, 10];
            case 9:
                error_1 = _d.sent();
                return [2 /*return*/, {
                        body: { body: { Message: error_1.message } },
                        statusCode: SERVER_ERROR
                    }];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.processDataPlaneResponse = processDataPlaneResponse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YVBsYW5lSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZlci9kYXRhUGxhbmVIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNQSxJQUFNLG9CQUFvQixHQUFHLHlCQUF5QixDQUFDO0FBQ3ZELElBQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQztBQUVsQixJQUFNLDRCQUE0QixHQUFHLFVBQUMsR0FBb0I7SUFDN0QsSUFBTSxPQUFPLGNBQ1QsUUFBUSxFQUFFLGtCQUFrQixFQUM1QixlQUFlLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFDL0MsY0FBYyxFQUFFLGtCQUFrQixJQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDdEIsQ0FBQztJQUVGLElBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3ZDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVywwQkFBZ0IsVUFBVSxDQUFFLENBQUMsQ0FBQyxDQUFDLHVCQUFnQixVQUFVLENBQUUsQ0FBQztJQUUvSCxPQUFPO1FBQ0gsR0FBRyxFQUFFLGtCQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxjQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQUcsV0FBVyxDQUFFO1FBQ3RGLE9BQU8sRUFBRTtZQUNMLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUk7WUFDbkIsT0FBTyxTQUFBO1lBQ1AsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTtTQUM1QztLQUNKLENBQUM7QUFDTixDQUFDLENBQUM7QUFuQlcsUUFBQSw0QkFBNEIsZ0NBbUJ2QztBQUVLLElBQU0seUJBQXlCLEdBQUcsVUFBTyxpQkFBMkIsRUFBRSxHQUFxQjs7OztvQkFDN0UscUJBQU0sSUFBQSxnQ0FBd0IsRUFBQyxpQkFBaUIsQ0FBQyxFQUFBOztnQkFBNUQsUUFBUSxHQUFHLFNBQWlEO2dCQUNsRSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7O0tBQ3ZELENBQUM7QUFIVyxRQUFBLHlCQUF5Qiw2QkFHcEM7QUFFRixpREFBaUQ7QUFDMUMsSUFBTSx3QkFBd0IsR0FBRyxVQUFPLGlCQUEyQjs7Ozs7OztnQkFFbEUsSUFBRyxDQUFDLGlCQUFpQixFQUFFO29CQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7aUJBQ3ZFO3FCQUNHLENBQUEsaUJBQWlCLENBQUMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQSxFQUFoRix3QkFBZ0Y7Z0JBQzVFLGtCQUFrQixTQUFBLENBQUM7Ozs7Z0JBRUUscUJBQU0saUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUE7O2dCQUFuRCxrQkFBa0IsR0FBRyxTQUE4QixDQUFDOzs7O2dCQUdwRCxNQUFNLElBQUksS0FBSyxDQUFDLGlOQUFpTixDQUFDLENBQUM7b0JBRXZPLHNCQUFPO29CQUNILElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBQztvQkFDaEMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFXLENBQUM7aUJBQ3RGLEVBQUM7O3FCQUVHLENBQUEsaUJBQWlCLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQSxFQUFoQyx3QkFBZ0M7Z0JBQ3JDLHNCQUFPO3dCQUNILElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLE9BQU8sRUFBQzt3QkFDdEQsVUFBVSxFQUFFLGlCQUFpQixDQUFDLE1BQU07cUJBQ3ZDLEVBQUM7Ozs7Z0JBSWUscUJBQU0saUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUE7b0JBRC9DLHVCQUNJLE9BQUksSUFBRyxPQUFJLEdBQUUsU0FBOEIsRUFBRSxVQUFPLEdBQUUsaUJBQWlCLENBQUMsT0FBTyxLQUFDO29CQUNoRixhQUFVLEdBQUUsaUJBQWlCLENBQUMsTUFBTTt5QkFDdEM7Ozs7Z0JBSU4sc0JBQU87d0JBQ0gsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLEVBQUMsT0FBTyxFQUFFLE9BQUssQ0FBQyxPQUFPLEVBQUMsRUFBQzt3QkFDdEMsVUFBVSxFQUFFLFlBQVk7cUJBQzNCLEVBQUM7Ozs7S0FFVCxDQUFDO0FBckNXLFFBQUEsd0JBQXdCLDRCQXFDbkMifQ==