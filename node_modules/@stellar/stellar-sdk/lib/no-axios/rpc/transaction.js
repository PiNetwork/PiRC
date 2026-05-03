"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assembleTransaction = assembleTransaction;
var _stellarBase = require("@stellar/stellar-base");
var _api = require("./api");
var _parsers = require("./parsers");
function isSorobanTransaction(tx) {
  if (tx.operations.length !== 1) {
    return false;
  }
  switch (tx.operations[0].type) {
    case "invokeHostFunction":
    case "extendFootprintTtl":
    case "restoreFootprint":
      return true;
    default:
      return false;
  }
}
function assembleTransaction(raw, simulation) {
  if ("innerTransaction" in raw) {
    return assembleTransaction(raw.innerTransaction, simulation);
  }
  if (!isSorobanTransaction(raw)) {
    throw new TypeError("unsupported transaction: must contain exactly one " + "invokeHostFunction, extendFootprintTtl, or restoreFootprint " + "operation");
  }
  var success = (0, _parsers.parseRawSimulation)(simulation);
  if (!_api.Api.isSimulationSuccess(success)) {
    throw new Error("simulation incorrect: ".concat(JSON.stringify(success)));
  }
  var classicFeeNum;
  try {
    classicFeeNum = BigInt(raw.fee);
  } catch (_unused) {
    classicFeeNum = BigInt(0);
  }
  var rawSorobanData = raw.toEnvelope().v1().tx().ext().value();
  if (rawSorobanData) {
    if (classicFeeNum - rawSorobanData.resourceFee().toBigInt() > BigInt(0)) {
      classicFeeNum -= rawSorobanData.resourceFee().toBigInt();
    }
  }
  var txnBuilder = _stellarBase.TransactionBuilder.cloneFrom(raw, {
    fee: classicFeeNum.toString(),
    sorobanData: success.transactionData.build(),
    networkPassphrase: raw.networkPassphrase
  });
  if (raw.operations[0].type === "invokeHostFunction") {
    var _invokeOp$auth;
    txnBuilder.clearOperations();
    var invokeOp = raw.operations[0];
    var existingAuth = (_invokeOp$auth = invokeOp.auth) !== null && _invokeOp$auth !== void 0 ? _invokeOp$auth : [];
    txnBuilder.addOperation(_stellarBase.Operation.invokeHostFunction({
      source: invokeOp.source,
      func: invokeOp.func,
      auth: existingAuth.length > 0 ? existingAuth : success.result.auth
    }));
  }
  return txnBuilder;
}