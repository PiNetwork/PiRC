"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.specFromWasm = specFromWasm;
var _utils = require("./utils");
function specFromWasm(wasm) {
  var customData = (0, _utils.parseWasmCustomSections)(wasm);
  var xdrSections = customData.get("contractspecv0");
  if (!xdrSections || xdrSections.length === 0) {
    throw new Error("Could not obtain contract spec from wasm");
  }
  return Buffer.from(xdrSections[0]);
}