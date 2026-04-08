"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = generate;
exports.sign = sign;
exports.verify = verify;
var _ed = require("@noble/curves/ed25519");
function generate(secretKey) {
  return Buffer.from(_ed.ed25519.getPublicKey(secretKey));
}
function sign(data, secretKey) {
  return Buffer.from(_ed.ed25519.sign(Buffer.from(data), secretKey));
}
function verify(data, signature, publicKey) {
  return _ed.ed25519.verify(Buffer.from(signature), Buffer.from(data), Buffer.from(publicKey), {
    zip215: false
  });
}