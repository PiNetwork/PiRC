"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SUBMIT_TRANSACTION_TIMEOUT = exports.RpcServer = exports.LinearSleepStrategy = exports.Durability = exports.BasicSleepStrategy = void 0;
var _urijs = _interopRequireDefault(require("urijs"));
var _stellarBase = require("@stellar/stellar-base");
var _axios = require("./axios");
var jsonrpc = _interopRequireWildcard(require("./jsonrpc"));
var _api = require("./api");
var _transaction = require("./transaction");
var _parsers = require("./parsers");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t1 in e) "default" !== _t1 && {}.hasOwnProperty.call(e, _t1) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t1)) && (i.get || i.set) ? o(f, _t1, i) : f[_t1] = e[_t1]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var SUBMIT_TRANSACTION_TIMEOUT = exports.SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;
var Durability = exports.Durability = function (Durability) {
  Durability["Temporary"] = "temporary";
  Durability["Persistent"] = "persistent";
  return Durability;
}({});
var DEFAULT_GET_TRANSACTION_TIMEOUT = 30;
var BasicSleepStrategy = exports.BasicSleepStrategy = function BasicSleepStrategy(_iter) {
  return 1000;
};
var LinearSleepStrategy = exports.LinearSleepStrategy = function LinearSleepStrategy(iter) {
  return 1000 * iter;
};
function findCreatedAccountSequenceInTransactionMeta(meta) {
  var _operations$flatMap$f;
  var operations = [];
  switch (meta.switch()) {
    case 0:
      operations = meta.operations();
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      operations = meta.value().operations();
      break;
    default:
      throw new Error("Unexpected transaction meta switch value");
  }
  var sequenceNumber = (_operations$flatMap$f = operations.flatMap(function (op) {
    return op.changes();
  }).find(function (c) {
    return c.switch() === _stellarBase.xdr.LedgerEntryChangeType.ledgerEntryCreated() && c.created().data().switch() === _stellarBase.xdr.LedgerEntryType.account();
  })) === null || _operations$flatMap$f === void 0 || (_operations$flatMap$f = _operations$flatMap$f.created()) === null || _operations$flatMap$f === void 0 || (_operations$flatMap$f = _operations$flatMap$f.data()) === null || _operations$flatMap$f === void 0 || (_operations$flatMap$f = _operations$flatMap$f.account()) === null || _operations$flatMap$f === void 0 || (_operations$flatMap$f = _operations$flatMap$f.seqNum()) === null || _operations$flatMap$f === void 0 ? void 0 : _operations$flatMap$f.toString();
  if (sequenceNumber) {
    return sequenceNumber;
  }
  throw new Error("No account created in transaction");
}
var RpcServer = exports.RpcServer = function () {
  function RpcServer(serverURL) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, RpcServer);
    this.serverURL = (0, _urijs.default)(serverURL);
    this.httpClient = (0, _axios.createHttpClient)(opts.headers);
    if (this.serverURL.protocol() !== "https" && !opts.allowHttp) {
      throw new Error("Cannot connect to insecure Soroban RPC server if `allowHttp` isn't set");
    }
  }
  return _createClass(RpcServer, [{
    key: "getAccount",
    value: (function () {
      var _getAccount = _asyncToGenerator(_regenerator().m(function _callee(address) {
        var entry;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _context.n = 1;
              return this.getAccountEntry(address);
            case 1:
              entry = _context.v;
              return _context.a(2, new _stellarBase.Account(address, entry.seqNum().toString()));
          }
        }, _callee, this);
      }));
      function getAccount(_x) {
        return _getAccount.apply(this, arguments);
      }
      return getAccount;
    }())
  }, {
    key: "getAccountEntry",
    value: (function () {
      var _getAccountEntry = _asyncToGenerator(_regenerator().m(function _callee2(address) {
        var ledgerKey, resp, _t;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              ledgerKey = _stellarBase.xdr.LedgerKey.account(new _stellarBase.xdr.LedgerKeyAccount({
                accountId: _stellarBase.Keypair.fromPublicKey(address).xdrPublicKey()
              }));
              _context2.p = 1;
              _context2.n = 2;
              return this.getLedgerEntry(ledgerKey);
            case 2:
              resp = _context2.v;
              return _context2.a(2, resp.val.account());
            case 3:
              _context2.p = 3;
              _t = _context2.v;
              throw new Error("Account not found: ".concat(address));
            case 4:
              return _context2.a(2);
          }
        }, _callee2, this, [[1, 3]]);
      }));
      function getAccountEntry(_x2) {
        return _getAccountEntry.apply(this, arguments);
      }
      return getAccountEntry;
    }())
  }, {
    key: "getTrustline",
    value: (function () {
      var _getTrustline = _asyncToGenerator(_regenerator().m(function _callee3(account, asset) {
        var trustlineLedgerKey, entry, _t2;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              trustlineLedgerKey = _stellarBase.xdr.LedgerKey.trustline(new _stellarBase.xdr.LedgerKeyTrustLine({
                accountId: _stellarBase.Keypair.fromPublicKey(account).xdrAccountId(),
                asset: asset.toTrustLineXDRObject()
              }));
              _context3.p = 1;
              _context3.n = 2;
              return this.getLedgerEntry(trustlineLedgerKey);
            case 2:
              entry = _context3.v;
              return _context3.a(2, entry.val.trustLine());
            case 3:
              _context3.p = 3;
              _t2 = _context3.v;
              throw new Error("Trustline for ".concat(asset.getCode(), ":").concat(asset.getIssuer(), " not found for ").concat(account));
            case 4:
              return _context3.a(2);
          }
        }, _callee3, this, [[1, 3]]);
      }));
      function getTrustline(_x3, _x4) {
        return _getTrustline.apply(this, arguments);
      }
      return getTrustline;
    }())
  }, {
    key: "getClaimableBalance",
    value: (function () {
      var _getClaimableBalance = _asyncToGenerator(_regenerator().m(function _callee4(id) {
        var balanceId, buffer, v, trustlineLedgerKey, entry, _t3;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              if (!_stellarBase.StrKey.isValidClaimableBalance(id)) {
                _context4.n = 1;
                break;
              }
              buffer = _stellarBase.StrKey.decodeClaimableBalance(id);
              v = Buffer.concat([Buffer.from("\x00\x00\x00"), buffer.subarray(0, 1)]);
              balanceId = _stellarBase.xdr.ClaimableBalanceId.fromXDR(Buffer.concat([v, buffer.subarray(1)]));
              _context4.n = 4;
              break;
            case 1:
              if (!id.match(/[a-f0-9]{72}/i)) {
                _context4.n = 2;
                break;
              }
              balanceId = _stellarBase.xdr.ClaimableBalanceId.fromXDR(id, "hex");
              _context4.n = 4;
              break;
            case 2:
              if (!id.match(/[a-f0-9]{64}/i)) {
                _context4.n = 3;
                break;
              }
              balanceId = _stellarBase.xdr.ClaimableBalanceId.fromXDR(id.padStart(72, "0"), "hex");
              _context4.n = 4;
              break;
            case 3:
              throw new TypeError("expected 72-char hex ID or strkey, not ".concat(id));
            case 4:
              trustlineLedgerKey = _stellarBase.xdr.LedgerKey.claimableBalance(new _stellarBase.xdr.LedgerKeyClaimableBalance({
                balanceId: balanceId
              }));
              _context4.p = 5;
              _context4.n = 6;
              return this.getLedgerEntry(trustlineLedgerKey);
            case 6:
              entry = _context4.v;
              return _context4.a(2, entry.val.claimableBalance());
            case 7:
              _context4.p = 7;
              _t3 = _context4.v;
              throw new Error("Claimable balance ".concat(id, " not found"));
            case 8:
              return _context4.a(2);
          }
        }, _callee4, this, [[5, 7]]);
      }));
      function getClaimableBalance(_x5) {
        return _getClaimableBalance.apply(this, arguments);
      }
      return getClaimableBalance;
    }())
  }, {
    key: "getAssetBalance",
    value: (function () {
      var _getAssetBalance = _asyncToGenerator(_regenerator().m(function _callee5(address, asset, networkPassphrase) {
        var addr, _yield$Promise$all, _yield$Promise$all2, tl, ll;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              addr = address;
              if (!(typeof address === "string")) {
                _context5.n = 1;
                break;
              }
              addr = address;
              _context5.n = 4;
              break;
            case 1:
              if (!(address instanceof _stellarBase.Address)) {
                _context5.n = 2;
                break;
              }
              addr = address.toString();
              _context5.n = 4;
              break;
            case 2:
              if (!(address instanceof _stellarBase.Contract)) {
                _context5.n = 3;
                break;
              }
              addr = address.toString();
              _context5.n = 4;
              break;
            case 3:
              throw new TypeError("invalid address: ".concat(address));
            case 4:
              if (!_stellarBase.StrKey.isValidEd25519PublicKey(addr)) {
                _context5.n = 6;
                break;
              }
              _context5.n = 5;
              return Promise.all([this.getTrustline(addr, asset), this.getLatestLedger()]);
            case 5:
              _yield$Promise$all = _context5.v;
              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
              tl = _yield$Promise$all2[0];
              ll = _yield$Promise$all2[1];
              return _context5.a(2, {
                latestLedger: ll.sequence,
                balanceEntry: {
                  amount: tl.balance().toString(),
                  authorized: Boolean(tl.flags() & _stellarBase.AuthRequiredFlag),
                  clawback: Boolean(tl.flags() & _stellarBase.AuthClawbackEnabledFlag),
                  revocable: Boolean(tl.flags() & _stellarBase.AuthRevocableFlag)
                }
              });
            case 6:
              if (!_stellarBase.StrKey.isValidContract(addr)) {
                _context5.n = 7;
                break;
              }
              return _context5.a(2, this.getSACBalance(addr, asset, networkPassphrase));
            case 7:
              throw new Error("invalid address: ".concat(address));
            case 8:
              return _context5.a(2);
          }
        }, _callee5, this);
      }));
      function getAssetBalance(_x6, _x7, _x8) {
        return _getAssetBalance.apply(this, arguments);
      }
      return getAssetBalance;
    }())
  }, {
    key: "getHealth",
    value: (function () {
      var _getHealth = _asyncToGenerator(_regenerator().m(function _callee6() {
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              return _context6.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getHealth"));
          }
        }, _callee6, this);
      }));
      function getHealth() {
        return _getHealth.apply(this, arguments);
      }
      return getHealth;
    }())
  }, {
    key: "getContractData",
    value: (function () {
      var _getContractData = _asyncToGenerator(_regenerator().m(function _callee7(contract, key) {
        var durability,
          scAddress,
          xdrDurability,
          contractKey,
          _args7 = arguments,
          _t4,
          _t5;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.p = _context7.n) {
            case 0:
              durability = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : Durability.Persistent;
              if (!(typeof contract === "string")) {
                _context7.n = 1;
                break;
              }
              scAddress = new _stellarBase.Contract(contract).address().toScAddress();
              _context7.n = 4;
              break;
            case 1:
              if (!(contract instanceof _stellarBase.Address)) {
                _context7.n = 2;
                break;
              }
              scAddress = contract.toScAddress();
              _context7.n = 4;
              break;
            case 2:
              if (!(contract instanceof _stellarBase.Contract)) {
                _context7.n = 3;
                break;
              }
              scAddress = contract.address().toScAddress();
              _context7.n = 4;
              break;
            case 3:
              throw new TypeError("unknown contract type: ".concat(contract));
            case 4:
              _t4 = durability;
              _context7.n = _t4 === Durability.Temporary ? 5 : _t4 === Durability.Persistent ? 6 : 7;
              break;
            case 5:
              xdrDurability = _stellarBase.xdr.ContractDataDurability.temporary();
              return _context7.a(3, 8);
            case 6:
              xdrDurability = _stellarBase.xdr.ContractDataDurability.persistent();
              return _context7.a(3, 8);
            case 7:
              throw new TypeError("invalid durability: ".concat(durability));
            case 8:
              contractKey = _stellarBase.xdr.LedgerKey.contractData(new _stellarBase.xdr.LedgerKeyContractData({
                key: key,
                contract: scAddress,
                durability: xdrDurability
              }));
              _context7.p = 9;
              _context7.n = 10;
              return this.getLedgerEntry(contractKey);
            case 10:
              return _context7.a(2, _context7.v);
            case 11:
              _context7.p = 11;
              _t5 = _context7.v;
              throw {
                code: 404,
                message: "Contract data not found for ".concat(_stellarBase.Address.fromScAddress(scAddress).toString(), " with key ").concat(key.toXDR("base64"), " and durability: ").concat(durability)
              };
            case 12:
              return _context7.a(2);
          }
        }, _callee7, this, [[9, 11]]);
      }));
      function getContractData(_x9, _x0) {
        return _getContractData.apply(this, arguments);
      }
      return getContractData;
    }())
  }, {
    key: "getContractWasmByContractId",
    value: (function () {
      var _getContractWasmByContractId = _asyncToGenerator(_regenerator().m(function _callee8(contractId) {
        var _response$entries$;
        var contractLedgerKey, response, wasmHash;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              contractLedgerKey = new _stellarBase.Contract(contractId).getFootprint();
              _context8.n = 1;
              return this.getLedgerEntries(contractLedgerKey);
            case 1:
              response = _context8.v;
              if (!(!response.entries.length || !((_response$entries$ = response.entries[0]) !== null && _response$entries$ !== void 0 && _response$entries$.val))) {
                _context8.n = 2;
                break;
              }
              return _context8.a(2, Promise.reject({
                code: 404,
                message: "Could not obtain contract hash from server"
              }));
            case 2:
              wasmHash = response.entries[0].val.contractData().val().instance().executable().wasmHash();
              return _context8.a(2, this.getContractWasmByHash(wasmHash));
          }
        }, _callee8, this);
      }));
      function getContractWasmByContractId(_x1) {
        return _getContractWasmByContractId.apply(this, arguments);
      }
      return getContractWasmByContractId;
    }())
  }, {
    key: "getContractWasmByHash",
    value: (function () {
      var _getContractWasmByHash = _asyncToGenerator(_regenerator().m(function _callee9(wasmHash) {
        var _responseWasm$entries;
        var format,
          wasmHashBuffer,
          ledgerKeyWasmHash,
          responseWasm,
          wasmBuffer,
          _args9 = arguments;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              format = _args9.length > 1 && _args9[1] !== undefined ? _args9[1] : undefined;
              wasmHashBuffer = typeof wasmHash === "string" ? Buffer.from(wasmHash, format) : wasmHash;
              ledgerKeyWasmHash = _stellarBase.xdr.LedgerKey.contractCode(new _stellarBase.xdr.LedgerKeyContractCode({
                hash: wasmHashBuffer
              }));
              _context9.n = 1;
              return this.getLedgerEntries(ledgerKeyWasmHash);
            case 1:
              responseWasm = _context9.v;
              if (!(!responseWasm.entries.length || !((_responseWasm$entries = responseWasm.entries[0]) !== null && _responseWasm$entries !== void 0 && _responseWasm$entries.val))) {
                _context9.n = 2;
                break;
              }
              return _context9.a(2, Promise.reject({
                code: 404,
                message: "Could not obtain contract wasm from server"
              }));
            case 2:
              wasmBuffer = responseWasm.entries[0].val.contractCode().code();
              return _context9.a(2, wasmBuffer);
          }
        }, _callee9, this);
      }));
      function getContractWasmByHash(_x10) {
        return _getContractWasmByHash.apply(this, arguments);
      }
      return getContractWasmByHash;
    }())
  }, {
    key: "getLedgerEntries",
    value: function getLedgerEntries() {
      return this._getLedgerEntries.apply(this, arguments).then(_parsers.parseRawLedgerEntries);
    }
  }, {
    key: "_getLedgerEntries",
    value: function _getLedgerEntries() {
      for (var _len = arguments.length, keys = new Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
      }
      return jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getLedgerEntries", {
        keys: keys.map(function (k) {
          return k.toXDR("base64");
        })
      });
    }
  }, {
    key: "getLedgerEntry",
    value: function () {
      var _getLedgerEntry = _asyncToGenerator(_regenerator().m(function _callee0(key) {
        var results;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              _context0.n = 1;
              return this._getLedgerEntries(key).then(_parsers.parseRawLedgerEntries);
            case 1:
              results = _context0.v;
              if (!(results.entries.length !== 1)) {
                _context0.n = 2;
                break;
              }
              throw new Error("failed to find an entry for key ".concat(key.toXDR("base64")));
            case 2:
              return _context0.a(2, results.entries[0]);
          }
        }, _callee0, this);
      }));
      function getLedgerEntry(_x11) {
        return _getLedgerEntry.apply(this, arguments);
      }
      return getLedgerEntry;
    }()
  }, {
    key: "pollTransaction",
    value: (function () {
      var _pollTransaction = _asyncToGenerator(_regenerator().m(function _callee1(hash, opts) {
        var _opts$attempts, _opts$attempts2;
        var maxAttempts, foundInfo, attempt, _opts$sleepStrategy;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.n) {
            case 0:
              maxAttempts = ((_opts$attempts = opts === null || opts === void 0 ? void 0 : opts.attempts) !== null && _opts$attempts !== void 0 ? _opts$attempts : 0) < 1 ? DEFAULT_GET_TRANSACTION_TIMEOUT : (_opts$attempts2 = opts === null || opts === void 0 ? void 0 : opts.attempts) !== null && _opts$attempts2 !== void 0 ? _opts$attempts2 : DEFAULT_GET_TRANSACTION_TIMEOUT;
              attempt = 1;
            case 1:
              if (!(attempt < maxAttempts)) {
                _context1.n = 5;
                break;
              }
              _context1.n = 2;
              return this.getTransaction(hash);
            case 2:
              foundInfo = _context1.v;
              if (!(foundInfo.status !== _api.Api.GetTransactionStatus.NOT_FOUND)) {
                _context1.n = 3;
                break;
              }
              return _context1.a(2, foundInfo);
            case 3:
              _context1.n = 4;
              return _utils.Utils.sleep(((_opts$sleepStrategy = opts === null || opts === void 0 ? void 0 : opts.sleepStrategy) !== null && _opts$sleepStrategy !== void 0 ? _opts$sleepStrategy : BasicSleepStrategy)(attempt));
            case 4:
              attempt++;
              _context1.n = 1;
              break;
            case 5:
              return _context1.a(2, foundInfo);
          }
        }, _callee1, this);
      }));
      function pollTransaction(_x12, _x13) {
        return _pollTransaction.apply(this, arguments);
      }
      return pollTransaction;
    }())
  }, {
    key: "getTransaction",
    value: (function () {
      var _getTransaction2 = _asyncToGenerator(_regenerator().m(function _callee10(hash) {
        return _regenerator().w(function (_context10) {
          while (1) switch (_context10.n) {
            case 0:
              return _context10.a(2, this._getTransaction(hash).then(function (raw) {
                var foundInfo = {};
                if (raw.status !== _api.Api.GetTransactionStatus.NOT_FOUND) {
                  Object.assign(foundInfo, (0, _parsers.parseTransactionInfo)(raw));
                }
                var result = _objectSpread({
                  status: raw.status,
                  txHash: hash,
                  latestLedger: raw.latestLedger,
                  latestLedgerCloseTime: raw.latestLedgerCloseTime,
                  oldestLedger: raw.oldestLedger,
                  oldestLedgerCloseTime: raw.oldestLedgerCloseTime
                }, foundInfo);
                return result;
              }));
          }
        }, _callee10, this);
      }));
      function getTransaction(_x14) {
        return _getTransaction2.apply(this, arguments);
      }
      return getTransaction;
    }())
  }, {
    key: "_getTransaction",
    value: function () {
      var _getTransaction3 = _asyncToGenerator(_regenerator().m(function _callee11(hash) {
        return _regenerator().w(function (_context11) {
          while (1) switch (_context11.n) {
            case 0:
              return _context11.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getTransaction", {
                hash: hash
              }));
          }
        }, _callee11, this);
      }));
      function _getTransaction(_x15) {
        return _getTransaction3.apply(this, arguments);
      }
      return _getTransaction;
    }()
  }, {
    key: "getTransactions",
    value: (function () {
      var _getTransactions2 = _asyncToGenerator(_regenerator().m(function _callee12(request) {
        return _regenerator().w(function (_context12) {
          while (1) switch (_context12.n) {
            case 0:
              return _context12.a(2, this._getTransactions(request).then(function (raw) {
                var result = {
                  transactions: (raw.transactions || []).map(_parsers.parseRawTransactions),
                  latestLedger: raw.latestLedger,
                  latestLedgerCloseTimestamp: raw.latestLedgerCloseTimestamp,
                  oldestLedger: raw.oldestLedger,
                  oldestLedgerCloseTimestamp: raw.oldestLedgerCloseTimestamp,
                  cursor: raw.cursor
                };
                return result;
              }));
          }
        }, _callee12, this);
      }));
      function getTransactions(_x16) {
        return _getTransactions2.apply(this, arguments);
      }
      return getTransactions;
    }())
  }, {
    key: "_getTransactions",
    value: function () {
      var _getTransactions3 = _asyncToGenerator(_regenerator().m(function _callee13(request) {
        return _regenerator().w(function (_context13) {
          while (1) switch (_context13.n) {
            case 0:
              return _context13.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getTransactions", request));
          }
        }, _callee13, this);
      }));
      function _getTransactions(_x17) {
        return _getTransactions3.apply(this, arguments);
      }
      return _getTransactions;
    }()
  }, {
    key: "getEvents",
    value: (function () {
      var _getEvents2 = _asyncToGenerator(_regenerator().m(function _callee14(request) {
        return _regenerator().w(function (_context14) {
          while (1) switch (_context14.n) {
            case 0:
              return _context14.a(2, this._getEvents(request).then(_parsers.parseRawEvents));
          }
        }, _callee14, this);
      }));
      function getEvents(_x18) {
        return _getEvents2.apply(this, arguments);
      }
      return getEvents;
    }())
  }, {
    key: "_getEvents",
    value: function () {
      var _getEvents3 = _asyncToGenerator(_regenerator().m(function _callee15(request) {
        var _request$filters;
        return _regenerator().w(function (_context15) {
          while (1) switch (_context15.n) {
            case 0:
              return _context15.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getEvents", _objectSpread(_objectSpread({
                filters: (_request$filters = request.filters) !== null && _request$filters !== void 0 ? _request$filters : [],
                pagination: _objectSpread(_objectSpread({}, request.cursor && {
                  cursor: request.cursor
                }), request.limit && {
                  limit: request.limit
                })
              }, request.startLedger && {
                startLedger: request.startLedger
              }), request.endLedger && {
                endLedger: request.endLedger
              })));
          }
        }, _callee15, this);
      }));
      function _getEvents(_x19) {
        return _getEvents3.apply(this, arguments);
      }
      return _getEvents;
    }()
  }, {
    key: "getNetwork",
    value: (function () {
      var _getNetwork = _asyncToGenerator(_regenerator().m(function _callee16() {
        return _regenerator().w(function (_context16) {
          while (1) switch (_context16.n) {
            case 0:
              return _context16.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getNetwork"));
          }
        }, _callee16, this);
      }));
      function getNetwork() {
        return _getNetwork.apply(this, arguments);
      }
      return getNetwork;
    }())
  }, {
    key: "getLatestLedger",
    value: (function () {
      var _getLatestLedger = _asyncToGenerator(_regenerator().m(function _callee17() {
        return _regenerator().w(function (_context17) {
          while (1) switch (_context17.n) {
            case 0:
              return _context17.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getLatestLedger"));
          }
        }, _callee17, this);
      }));
      function getLatestLedger() {
        return _getLatestLedger.apply(this, arguments);
      }
      return getLatestLedger;
    }())
  }, {
    key: "simulateTransaction",
    value: (function () {
      var _simulateTransaction2 = _asyncToGenerator(_regenerator().m(function _callee18(tx, addlResources, authMode) {
        return _regenerator().w(function (_context18) {
          while (1) switch (_context18.n) {
            case 0:
              return _context18.a(2, this._simulateTransaction(tx, addlResources, authMode).then(_parsers.parseRawSimulation));
          }
        }, _callee18, this);
      }));
      function simulateTransaction(_x20, _x21, _x22) {
        return _simulateTransaction2.apply(this, arguments);
      }
      return simulateTransaction;
    }())
  }, {
    key: "_simulateTransaction",
    value: function () {
      var _simulateTransaction3 = _asyncToGenerator(_regenerator().m(function _callee19(transaction, addlResources, authMode) {
        return _regenerator().w(function (_context19) {
          while (1) switch (_context19.n) {
            case 0:
              return _context19.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "simulateTransaction", _objectSpread({
                transaction: transaction.toXDR(),
                authMode: authMode
              }, addlResources !== undefined && {
                resourceConfig: {
                  instructionLeeway: addlResources.cpuInstructions
                }
              })));
          }
        }, _callee19, this);
      }));
      function _simulateTransaction(_x23, _x24, _x25) {
        return _simulateTransaction3.apply(this, arguments);
      }
      return _simulateTransaction;
    }()
  }, {
    key: "prepareTransaction",
    value: (function () {
      var _prepareTransaction = _asyncToGenerator(_regenerator().m(function _callee20(tx) {
        var simResponse;
        return _regenerator().w(function (_context20) {
          while (1) switch (_context20.n) {
            case 0:
              _context20.n = 1;
              return this.simulateTransaction(tx);
            case 1:
              simResponse = _context20.v;
              if (!_api.Api.isSimulationError(simResponse)) {
                _context20.n = 2;
                break;
              }
              throw new Error(simResponse.error);
            case 2:
              return _context20.a(2, (0, _transaction.assembleTransaction)(tx, simResponse).build());
          }
        }, _callee20, this);
      }));
      function prepareTransaction(_x26) {
        return _prepareTransaction.apply(this, arguments);
      }
      return prepareTransaction;
    }())
  }, {
    key: "sendTransaction",
    value: (function () {
      var _sendTransaction2 = _asyncToGenerator(_regenerator().m(function _callee21(transaction) {
        return _regenerator().w(function (_context21) {
          while (1) switch (_context21.n) {
            case 0:
              return _context21.a(2, this._sendTransaction(transaction).then(_parsers.parseRawSendTransaction));
          }
        }, _callee21, this);
      }));
      function sendTransaction(_x27) {
        return _sendTransaction2.apply(this, arguments);
      }
      return sendTransaction;
    }())
  }, {
    key: "_sendTransaction",
    value: function () {
      var _sendTransaction3 = _asyncToGenerator(_regenerator().m(function _callee22(transaction) {
        return _regenerator().w(function (_context22) {
          while (1) switch (_context22.n) {
            case 0:
              return _context22.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "sendTransaction", {
                transaction: transaction.toXDR()
              }));
          }
        }, _callee22, this);
      }));
      function _sendTransaction(_x28) {
        return _sendTransaction3.apply(this, arguments);
      }
      return _sendTransaction;
    }()
  }, {
    key: "requestAirdrop",
    value: (function () {
      var _requestAirdrop = _asyncToGenerator(_regenerator().m(function _callee23(address, friendbotUrl) {
        var account, response, meta, txMeta, sequence, _error$response, _error$response$detai, _t6, _t7;
        return _regenerator().w(function (_context23) {
          while (1) switch (_context23.p = _context23.n) {
            case 0:
              account = typeof address === "string" ? address : address.accountId();
              _t6 = friendbotUrl;
              if (_t6) {
                _context23.n = 2;
                break;
              }
              _context23.n = 1;
              return this.getNetwork();
            case 1:
              _t6 = _context23.v.friendbotUrl;
            case 2:
              friendbotUrl = _t6;
              if (friendbotUrl) {
                _context23.n = 3;
                break;
              }
              throw new Error("No friendbot URL configured for current network");
            case 3:
              _context23.p = 3;
              _context23.n = 4;
              return this.httpClient.post("".concat(friendbotUrl, "?addr=").concat(encodeURIComponent(account)));
            case 4:
              response = _context23.v;
              if (response.data.result_meta_xdr) {
                _context23.n = 7;
                break;
              }
              _context23.n = 5;
              return this.getTransaction(response.data.hash);
            case 5:
              txMeta = _context23.v;
              if (!(txMeta.status !== _api.Api.GetTransactionStatus.SUCCESS)) {
                _context23.n = 6;
                break;
              }
              throw new Error("Funding account ".concat(address, " failed"));
            case 6:
              meta = txMeta.resultMetaXdr;
              _context23.n = 8;
              break;
            case 7:
              meta = _stellarBase.xdr.TransactionMeta.fromXDR(response.data.result_meta_xdr, "base64");
            case 8:
              sequence = findCreatedAccountSequenceInTransactionMeta(meta);
              return _context23.a(2, new _stellarBase.Account(account, sequence));
            case 9:
              _context23.p = 9;
              _t7 = _context23.v;
              if (!(((_error$response = _t7.response) === null || _error$response === void 0 ? void 0 : _error$response.status) === 400)) {
                _context23.n = 10;
                break;
              }
              if (!((_error$response$detai = _t7.response.detail) !== null && _error$response$detai !== void 0 && _error$response$detai.includes("createAccountAlreadyExist"))) {
                _context23.n = 10;
                break;
              }
              return _context23.a(2, this.getAccount(account));
            case 10:
              throw _t7;
            case 11:
              return _context23.a(2);
          }
        }, _callee23, this, [[3, 9]]);
      }));
      function requestAirdrop(_x29, _x30) {
        return _requestAirdrop.apply(this, arguments);
      }
      return requestAirdrop;
    }())
  }, {
    key: "fundAddress",
    value: (function () {
      var _fundAddress = _asyncToGenerator(_regenerator().m(function _callee24(address, friendbotUrl) {
        var response, txResponse, _error$response2, _error$response$data$, _error$response$data, _t8, _t9;
        return _regenerator().w(function (_context24) {
          while (1) switch (_context24.p = _context24.n) {
            case 0:
              if (!(!_stellarBase.StrKey.isValidEd25519PublicKey(address) && !_stellarBase.StrKey.isValidContract(address))) {
                _context24.n = 1;
                break;
              }
              throw new Error("Invalid address: ".concat(address, ". Expected a Stellar account (G...) or contract (C...) address."));
            case 1:
              _t8 = friendbotUrl;
              if (_t8) {
                _context24.n = 3;
                break;
              }
              _context24.n = 2;
              return this.getNetwork();
            case 2:
              _t8 = _context24.v.friendbotUrl;
            case 3:
              friendbotUrl = _t8;
              if (friendbotUrl) {
                _context24.n = 4;
                break;
              }
              throw new Error("No friendbot URL configured for current network");
            case 4:
              _context24.p = 4;
              _context24.n = 5;
              return this.httpClient.post("".concat(friendbotUrl, "?addr=").concat(encodeURIComponent(address)));
            case 5:
              response = _context24.v;
              _context24.n = 6;
              return this.getTransaction(response.data.hash);
            case 6:
              txResponse = _context24.v;
              if (!(txResponse.status !== _api.Api.GetTransactionStatus.SUCCESS)) {
                _context24.n = 7;
                break;
              }
              throw new Error("Funding address ".concat(address, " failed: transaction status ").concat(txResponse.status));
            case 7:
              return _context24.a(2, txResponse);
            case 8:
              _context24.p = 8;
              _t9 = _context24.v;
              if (!(((_error$response2 = _t9.response) === null || _error$response2 === void 0 ? void 0 : _error$response2.status) === 400)) {
                _context24.n = 9;
                break;
              }
              throw new Error((_error$response$data$ = (_error$response$data = _t9.response.data) === null || _error$response$data === void 0 ? void 0 : _error$response$data.detail) !== null && _error$response$data$ !== void 0 ? _error$response$data$ : "Bad Request");
            case 9:
              throw _t9;
            case 10:
              return _context24.a(2);
          }
        }, _callee24, this, [[4, 8]]);
      }));
      function fundAddress(_x31, _x32) {
        return _fundAddress.apply(this, arguments);
      }
      return fundAddress;
    }())
  }, {
    key: "getFeeStats",
    value: (function () {
      var _getFeeStats = _asyncToGenerator(_regenerator().m(function _callee25() {
        return _regenerator().w(function (_context25) {
          while (1) switch (_context25.n) {
            case 0:
              return _context25.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getFeeStats"));
          }
        }, _callee25, this);
      }));
      function getFeeStats() {
        return _getFeeStats.apply(this, arguments);
      }
      return getFeeStats;
    }())
  }, {
    key: "getVersionInfo",
    value: (function () {
      var _getVersionInfo = _asyncToGenerator(_regenerator().m(function _callee26() {
        return _regenerator().w(function (_context26) {
          while (1) switch (_context26.n) {
            case 0:
              return _context26.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getVersionInfo"));
          }
        }, _callee26, this);
      }));
      function getVersionInfo() {
        return _getVersionInfo.apply(this, arguments);
      }
      return getVersionInfo;
    }())
  }, {
    key: "getSACBalance",
    value: (function () {
      var _getSACBalance = _asyncToGenerator(_regenerator().m(function _callee27(address, sac, networkPassphrase) {
        var addressString, passphrase, sacId, key, ledgerKey, response, _response$entries$2, lastModifiedLedgerSeq, liveUntilLedgerSeq, val, entry, _t0;
        return _regenerator().w(function (_context27) {
          while (1) switch (_context27.n) {
            case 0:
              addressString = address instanceof _stellarBase.Address ? address.toString() : address;
              if (_stellarBase.StrKey.isValidContract(addressString)) {
                _context27.n = 1;
                break;
              }
              throw new TypeError("expected contract ID, got ".concat(addressString));
            case 1:
              if (!(networkPassphrase !== null && networkPassphrase !== void 0)) {
                _context27.n = 2;
                break;
              }
              _t0 = networkPassphrase;
              _context27.n = 4;
              break;
            case 2:
              _context27.n = 3;
              return this.getNetwork().then(function (n) {
                return n.passphrase;
              });
            case 3:
              _t0 = _context27.v;
            case 4:
              passphrase = _t0;
              sacId = sac.contractId(passphrase);
              key = (0, _stellarBase.nativeToScVal)(["Balance", addressString], {
                type: ["symbol", "address"]
              });
              ledgerKey = _stellarBase.xdr.LedgerKey.contractData(new _stellarBase.xdr.LedgerKeyContractData({
                contract: new _stellarBase.Address(sacId).toScAddress(),
                durability: _stellarBase.xdr.ContractDataDurability.persistent(),
                key: key
              }));
              _context27.n = 5;
              return this.getLedgerEntries(ledgerKey);
            case 5:
              response = _context27.v;
              if (!(response.entries.length === 0)) {
                _context27.n = 6;
                break;
              }
              return _context27.a(2, {
                latestLedger: response.latestLedger
              });
            case 6:
              _response$entries$2 = response.entries[0], lastModifiedLedgerSeq = _response$entries$2.lastModifiedLedgerSeq, liveUntilLedgerSeq = _response$entries$2.liveUntilLedgerSeq, val = _response$entries$2.val;
              if (!(val.switch().value !== _stellarBase.xdr.LedgerEntryType.contractData().value)) {
                _context27.n = 7;
                break;
              }
              return _context27.a(2, {
                latestLedger: response.latestLedger
              });
            case 7:
              entry = (0, _stellarBase.scValToNative)(val.contractData().val());
              return _context27.a(2, {
                latestLedger: response.latestLedger,
                balanceEntry: {
                  liveUntilLedgerSeq: liveUntilLedgerSeq,
                  lastModifiedLedgerSeq: lastModifiedLedgerSeq,
                  amount: entry.amount.toString(),
                  authorized: entry.authorized,
                  clawback: entry.clawback
                }
              });
          }
        }, _callee27, this);
      }));
      function getSACBalance(_x33, _x34, _x35) {
        return _getSACBalance.apply(this, arguments);
      }
      return getSACBalance;
    }())
  }, {
    key: "getLedgers",
    value: (function () {
      var _getLedgers2 = _asyncToGenerator(_regenerator().m(function _callee28(request) {
        return _regenerator().w(function (_context28) {
          while (1) switch (_context28.n) {
            case 0:
              return _context28.a(2, this._getLedgers(request).then(function (raw) {
                var result = {
                  ledgers: (raw.ledgers || []).map(_parsers.parseRawLedger),
                  latestLedger: raw.latestLedger,
                  latestLedgerCloseTime: raw.latestLedgerCloseTime,
                  oldestLedger: raw.oldestLedger,
                  oldestLedgerCloseTime: raw.oldestLedgerCloseTime,
                  cursor: raw.cursor
                };
                return result;
              }));
          }
        }, _callee28, this);
      }));
      function getLedgers(_x36) {
        return _getLedgers2.apply(this, arguments);
      }
      return getLedgers;
    }())
  }, {
    key: "_getLedgers",
    value: function () {
      var _getLedgers3 = _asyncToGenerator(_regenerator().m(function _callee29(request) {
        return _regenerator().w(function (_context29) {
          while (1) switch (_context29.n) {
            case 0:
              return _context29.a(2, jsonrpc.postObject(this.httpClient, this.serverURL.toString(), "getLedgers", request));
          }
        }, _callee29, this);
      }));
      function _getLedgers(_x37) {
        return _getLedgers3.apply(this, arguments);
      }
      return _getLedgers;
    }()
  }]);
}();