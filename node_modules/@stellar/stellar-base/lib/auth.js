"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authorizeEntry = authorizeEntry;
exports.authorizeInvocation = authorizeInvocation;
var _xdr = _interopRequireDefault(require("./xdr"));
var _keypair = require("./keypair");
var _strkey = require("./strkey");
var _network = require("./network");
var _hashing = require("./hashing");
var _address = require("./address");
var _scval = require("./scval");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * @async
 * @callback SigningCallback A callback for signing an XDR structure
 * representing all of the details necessary to authorize an invocation tree.
 *
 * @param {xdr.HashIdPreimage} preimage   the entire authorization envelope
 *    whose hash you should sign, so that you can inspect the entire structure
 *    if necessary (rather than blindly signing a hash)
 *
 * @returns {Promise<Uint8Array | {signature: Uint8Array, publicKey: string}>}
 *    the signature of the raw payload (which is the sha256 hash of the preimage
 *    bytes, so `hash(preimage.toXDR())`) either naked, implying it is signed
 *    by the key corresponding to the public key in the entry you pass to
 *    {@link authorizeEntry} (decipherable from its
 *    `credentials().address().address()`), or alongside an explicit `publicKey`.
 */
/**
 * Actually authorizes an existing authorization entry using the given the
 * credentials and expiration details, returning a signed copy.
 *
 * This "fills out" the authorization entry with a signature, indicating to the
 * {@link Operation.invokeHostFunction} its attached to that:
 *   - a particular identity (i.e. signing {@link Keypair} or other signer)
 *   - approving the execution of an invocation tree (i.e. a simulation-acquired
 *     {@link xdr.SorobanAuthorizedInvocation} or otherwise built)
 *   - on a particular network (uniquely identified by its passphrase, see
 *     {@link Networks})
 *   - until a particular ledger sequence is reached.
 *
 * This one lets you pass a either a {@link Keypair} (or, more accurately,
 * anything with a `sign(Buffer): Buffer` method) or a callback function (see
 * {@link SigningCallback}) to handle signing the envelope hash.
 *
 * @param {xdr.SorobanAuthorizationEntry} entry   an unsigned authorization entr
 * @param {Keypair | SigningCallback} signer  either a {@link Keypair} instance
 *    or a function which takes a {@link xdr.HashIdPreimageSorobanAuthorization}
 *    input payload and returns EITHER
 *
 *      (a) an object containing a `signature` of the hash of the raw payload bytes
 *          as a Buffer-like and a `publicKey` string representing who just
 *          created this signature, or
 *      (b) just the naked signature of the hash of the raw payload bytes (where
 *          the signing key is implied to be the address in the `entry`).
 *
 *    The latter option (b) is JUST for backwards compatibility and will be
 *    removed in the future.
 * @param {number} validUntilLedgerSeq   the (exclusive) future ledger sequence
 *    number until which this authorization entry should be valid (if
 *    `currentLedgerSeq==validUntil`, this is expired))
 * @param {string} [networkPassphrase]  the network passphrase is incorprated
 *    into the signature (see {@link Networks} for options)
 *
 * @returns {Promise<xdr.SorobanAuthorizationEntry>} a promise for an
 *    authorization entry that you can pass along to
 *    {@link Operation.invokeHostFunction}
 *
 * @note If using the `SigningCallback` variation, the signer is assumed to be
 *    the entry's credential address unless you use the variant that returns
 *    the object.
 *
 * @see authorizeInvocation
 * @example
 * import {
 *   SorobanRpc,
 *   Transaction,
 *   Networks,
 *   authorizeEntry
 * } from '@stellar/stellar-sdk';
 *
 * // Assume signPayloadCallback is a well-formed signing callback.
 * //
 * // It might, for example, pop up a modal from a browser extension, send the
 * // transaction to a third-party service for signing, or just do simple
 * // signing via Keypair like it does here:
 * function signPayloadCallback(payload) {
 *    return signer.sign(hash(payload.toXDR());
 * }
 *
 * function multiPartyAuth(
 *    server: SorobanRpc.Server,
 *    // assume this involves multi-party auth
 *    tx: Transaction,
 * ) {
 *    return server
 *      .simulateTransaction(tx)
 *      .then((simResult) => {
 *          tx.operations[0].auth.map(entry =>
 *            authorizeEntry(
 *              entry,
 *              signPayloadCallback,
 *              currentLedger + 1000,
 *              Networks.TESTNET);
 *          ));
 *
 *          return server.prepareTransaction(tx, simResult);
 *      })
 *      .then((preppedTx) => {
 *        preppedTx.sign(source);
 *        return server.sendTransaction(preppedTx);
 *      });
 * }
 */
function authorizeEntry(_x, _x2, _x3) {
  return _authorizeEntry.apply(this, arguments);
}
/**
 * This builds an entry from scratch, allowing you to express authorization as a
 * function of:
 *   - a particular identity (i.e. signing {@link Keypair} or other signer)
 *   - approving the execution of an invocation tree (i.e. a simulation-acquired
 *     {@link xdr.SorobanAuthorizedInvocation} or otherwise built)
 *   - on a particular network (uniquely identified by its passphrase, see
 *     {@link Networks})
 *   - until a particular ledger sequence is reached.
 *
 * This is in contrast to {@link authorizeEntry}, which signs an existing entry.
 *
 * @param {Keypair | SigningCallback} signer  either a {@link Keypair} instance
 *    (or anything with a `.sign(buf): Buffer-like` method) or a function which
 *    takes a payload (a {@link xdr.HashIdPreimageSorobanAuthorization}
 *    instance) input and returns the signature of the hash of the raw payload
 *    bytes (where the signing key should correspond to the address in the
 *    `entry`)
 * @param {number}  validUntilLedgerSeq  the (exclusive) future ledger sequence
 *    number until which this authorization entry should be valid (if
 *    `currentLedgerSeq==validUntilLedgerSeq`, this is expired))
 * @param {xdr.SorobanAuthorizedInvocation} invocation the invocation tree that
 *    we're authorizing (likely, this comes from transaction simulation)
 * @param {string}  [publicKey]   the public identity of the signer (when
 *    providing a {@link Keypair} to `signer`, this can be omitted, as it just
 *    uses {@link Keypair.publicKey})
 * @param {string}  [networkPassphrase]   the network passphrase is incorprated
 *    into the signature (see {@link Networks} for options, default:
 *    {@link Networks.FUTURENET})
 *
 * @returns {Promise<xdr.SorobanAuthorizationEntry>} a promise for an
 *    authorization entry that you can pass along to
 *    {@link Operation.invokeHostFunction}
 *
 * @see authorizeEntry
 */
function _authorizeEntry() {
  _authorizeEntry = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(entry, signer, validUntilLedgerSeq) {
    var networkPassphrase,
      clone,
      addrAuth,
      networkId,
      preimage,
      payload,
      signature,
      publicKey,
      sigResult,
      sigScVal,
      _args = arguments;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          networkPassphrase = _args.length > 3 && _args[3] !== undefined ? _args[3] : _network.Networks.FUTURENET;
          if (!(entry.credentials()["switch"]().value !== _xdr["default"].SorobanCredentialsType.sorobanCredentialsAddress().value)) {
            _context.n = 1;
            break;
          }
          return _context.a(2, entry);
        case 1:
          clone = _xdr["default"].SorobanAuthorizationEntry.fromXDR(entry.toXDR());
          /** @type {xdr.SorobanAddressCredentials} */
          addrAuth = clone.credentials().address();
          addrAuth.signatureExpirationLedger(validUntilLedgerSeq);
          networkId = (0, _hashing.hash)(Buffer.from(networkPassphrase));
          preimage = _xdr["default"].HashIdPreimage.envelopeTypeSorobanAuthorization(new _xdr["default"].HashIdPreimageSorobanAuthorization({
            networkId: networkId,
            nonce: addrAuth.nonce(),
            invocation: clone.rootInvocation(),
            signatureExpirationLedger: addrAuth.signatureExpirationLedger()
          }));
          payload = (0, _hashing.hash)(preimage.toXDR());
          if (!(typeof signer === 'function')) {
            _context.n = 3;
            break;
          }
          _context.n = 2;
          return signer(preimage);
        case 2:
          sigResult = _context.v;
          if (sigResult !== null && sigResult !== void 0 && sigResult.signature) {
            signature = Buffer.from(sigResult.signature);
            publicKey = sigResult.publicKey;
          } else {
            // if using the deprecated form, assume it's for the entry
            signature = Buffer.from(sigResult);
            publicKey = _address.Address.fromScAddress(addrAuth.address()).toString();
          }
          _context.n = 4;
          break;
        case 3:
          signature = Buffer.from(signer.sign(payload));
          publicKey = signer.publicKey();
        case 4:
          if (_keypair.Keypair.fromPublicKey(publicKey).verify(payload, signature)) {
            _context.n = 5;
            break;
          }
          throw new Error("signature doesn't match payload");
        case 5:
          // This structure is defined here:
          // https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#stellar-account-signatures
          //
          // Encoding a contract structure as an ScVal means the map keys are supposed
          // to be symbols, hence the forced typing here.
          sigScVal = (0, _scval.nativeToScVal)({
            public_key: _strkey.StrKey.decodeEd25519PublicKey(publicKey),
            signature: signature
          }, {
            type: {
              public_key: ['symbol', null],
              signature: ['symbol', null]
            }
          });
          addrAuth.signature(_xdr["default"].ScVal.scvVec([sigScVal]));
          return _context.a(2, clone);
      }
    }, _callee);
  }));
  return _authorizeEntry.apply(this, arguments);
}
function authorizeInvocation(signer, validUntilLedgerSeq, invocation) {
  var publicKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var networkPassphrase = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _network.Networks.FUTURENET;
  // We use keypairs as a source of randomness for the nonce to avoid mucking
  // with any crypto dependencies. Note that this just has to be random and
  // unique, not cryptographically secure, so it's fine.
  var kp = _keypair.Keypair.random().rawPublicKey();
  var nonce = new _xdr["default"].Int64(bytesToInt64(kp));
  var pk = publicKey || signer.publicKey();
  if (!pk) {
    throw new Error("authorizeInvocation requires publicKey parameter");
  }
  var entry = new _xdr["default"].SorobanAuthorizationEntry({
    rootInvocation: invocation,
    credentials: _xdr["default"].SorobanCredentials.sorobanCredentialsAddress(new _xdr["default"].SorobanAddressCredentials({
      address: new _address.Address(pk).toScAddress(),
      nonce: nonce,
      signatureExpirationLedger: 0,
      // replaced
      signature: _xdr["default"].ScVal.scvVec([]) // replaced
    }))
  });
  return authorizeEntry(entry, signer, validUntilLedgerSeq, networkPassphrase);
}
function bytesToInt64(bytes) {
  // eslint-disable-next-line no-bitwise
  return bytes.subarray(0, 8).reduce(function (accum, b) {
    return accum << 8 | b;
  }, 0);
}