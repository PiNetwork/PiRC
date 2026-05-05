"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gatherTxSigners = gatherTxSigners;
exports.verifyTxSignedBy = verifyTxSignedBy;
var _stellarBase = require("@stellar/stellar-base");
var _errors = require("./errors");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function gatherTxSigners(transaction, signers) {
  var hashedSignatureBase = transaction.hash();
  var txSignatures = _toConsumableArray(transaction.signatures);
  var signersFound = new Set();
  var _iterator = _createForOfIteratorHelper(signers),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var signer = _step.value;
      if (txSignatures.length === 0) {
        break;
      }
      var keypair = void 0;
      try {
        keypair = _stellarBase.Keypair.fromPublicKey(signer);
      } catch (err) {
        throw new _errors.InvalidChallengeError("Signer is not a valid address: ".concat(err.message));
      }
      for (var i = 0; i < txSignatures.length; i++) {
        var decSig = txSignatures[i];
        if (!decSig.hint().equals(keypair.signatureHint())) {
          continue;
        }
        if (keypair.verify(hashedSignatureBase, decSig.signature())) {
          signersFound.add(signer);
          txSignatures.splice(i, 1);
          break;
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return Array.from(signersFound);
}
function verifyTxSignedBy(transaction, accountID) {
  return gatherTxSigners(transaction, [accountID]).length !== 0;
}