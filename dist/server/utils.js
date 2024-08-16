"use strict";
exports.__esModule = true;
exports.readFileFromLocal = exports.findMatchingFile = exports.fetchDirectories = exports.fetchDrivesOnWindows = void 0;
var fs = require("fs");
var path = require("path");
var serverBase_1 = require("./serverBase");
var fetchDrivesOnWindows = function (res) {
    var exec = require('child_process').exec;
    exec('wmic logicaldisk get name', function (error, stdout, stderr) {
        if (!error && !stderr) {
            res.status(serverBase_1.SUCCESS).send(stdout);
        }
        else {
            res.status(serverBase_1.SERVER_ERROR).send();
        }
    });
};
exports.fetchDrivesOnWindows = fetchDrivesOnWindows;
var fetchDirectories = function (dir, res) {
    var result = [];
    for (var _i = 0, _a = fs.readdirSync(dir); _i < _a.length; _i++) {
        var item = _a[_i];
        try {
            var stat = fs.statSync(path.join(dir, item));
            if (stat.isDirectory()) {
                result.push(item);
            }
        }
        catch (_b) {
            // some item cannot be checked by isDirectory(), swallow error and continue the loop
        }
    }
    res.status(serverBase_1.SUCCESS).send(result);
};
exports.fetchDirectories = fetchDirectories;
// tslint:disable-next-line:cyclomatic-complexity
var findMatchingFile = function (filePath, fileNames, expectedFileName) {
    var _a, _b;
    var filesWithParsingError = [];
    for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
        var fileName = fileNames_1[_i];
        if (isFileExtensionJson(fileName)) {
            try {
                var data = (0, exports.readFileFromLocal)(filePath, fileName);
                var parsedData = JSON.parse(data);
                if (parsedData) {
                    if (Array.isArray(parsedData)) { // if parsedData is array, it is using expanded dtdl format
                        for (var _c = 0, parsedData_1 = parsedData; _c < parsedData_1.length; _c++) {
                            var pd = parsedData_1[_c];
                            if (((_a = pd['@id']) === null || _a === void 0 ? void 0 : _a.toString()) === expectedFileName) {
                                return pd;
                            }
                        }
                    }
                    else {
                        if (((_b = parsedData['@id']) === null || _b === void 0 ? void 0 : _b.toString()) === expectedFileName) {
                            return data;
                        }
                    }
                }
            }
            catch (error) {
                filesWithParsingError.push("".concat(fileName, ": ").concat(error.message)); // swallow error and continue the loop
            }
        }
    }
    if (filesWithParsingError.length > 0) {
        throw new Error(filesWithParsingError.join(', '));
    }
    return null;
};
exports.findMatchingFile = findMatchingFile;
var isFileExtensionJson = function (fileName) {
    var i = fileName.lastIndexOf('.');
    return i > 0 && fileName.substr(i) === '.json';
};
var readFileFromLocal = function (filePath, fileName) {
    return fs.readFileSync("".concat(filePath, "/").concat(fileName), 'utf-8');
};
exports.readFileFromLocal = readFileFromLocal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmVyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFDN0IsMkNBQXFEO0FBRTlDLElBQU0sb0JBQW9CLEdBQUcsVUFBQyxHQUFxQjtJQUN0RCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzNDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxVQUFDLEtBQVUsRUFBRSxNQUFXLEVBQUUsTUFBVztRQUNuRSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ25CLEdBQUcsQ0FBQyxNQUFNLENBQUMsb0JBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNwQzthQUNJO1lBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyx5QkFBWSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDbkM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQVZXLFFBQUEsb0JBQW9CLHdCQVUvQjtBQUVLLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxHQUFXLEVBQUUsR0FBcUI7SUFDL0QsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBQzVCLEtBQW1CLFVBQW1CLEVBQW5CLEtBQUEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBbkIsY0FBbUIsRUFBbkIsSUFBbUIsRUFBRTtRQUFuQyxJQUFNLElBQUksU0FBQTtRQUNYLElBQUk7WUFDQSxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7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