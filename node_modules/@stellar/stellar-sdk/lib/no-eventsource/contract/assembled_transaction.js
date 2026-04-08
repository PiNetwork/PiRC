"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AssembledTransaction = void 0;
var _stellarBase = require("@stellar/stellar-base");
var _rpc = require("../rpc");
var _api = require("../rpc/api");
var _transaction = require("../rpc/transaction");
var _rust_result = require("./rust_result");
var _utils = require("./utils");
var _types = require("./types");
var _sent_transaction = require("./sent_transaction");
var _errors = require("./errors");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var AssembledTransaction = exports.AssembledTransaction = function () {
  function AssembledTransaction(options) {
    var _this = this,
      _this$options$simulat;
    _classCallCheck(this, AssembledTransaction);
    _defineProperty(this, "simulate", _asyncToGenerator(_regenerator().m(function _callee() {
      var _ref2,
        restore,
        account,
        result,
        _this$options$fee,
        _this$options$args,
        _this$options$timeout,
        contract,
        _args = arguments;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _ref2 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, restore = _ref2.restore;
            if (_this.built) {
              _context.n = 2;
              break;
            }
            if (_this.raw) {
              _context.n = 1;
              break;
            }
            throw new Error("Transaction has not yet been assembled; " + "call `AssembledTransaction.build` first.");
          case 1:
            _this.built = _this.raw.build();
          case 2:
            restore = restore !== null && restore !== void 0 ? restore : _this.options.restore;
            delete _this.simulationResult;
            delete _this.simulationTransactionData;
            _context.n = 3;
            return _this.server.simulateTransaction(_this.built);
          case 3:
            _this.simulation = _context.v;
            if (!(restore && _api.Api.isSimulationRestore(_this.simulation))) {
              _context.n = 8;
              break;
            }
            _context.n = 4;
            return (0, _utils.getAccount)(_this.options, _this.server);
          case 4:
            account = _context.v;
            _context.n = 5;
            return _this.restoreFootprint(_this.simulation.restorePreamble, account);
          case 5:
            result = _context.v;
            if (!(result.status === _api.Api.GetTransactionStatus.SUCCESS)) {
              _context.n = 7;
              break;
            }
            contract = new _stellarBase.Contract(_this.options.contractId);
            _this.raw = new _stellarBase.TransactionBuilder(account, {
              fee: (_this$options$fee = _this.options.fee) !== null && _this$options$fee !== void 0 ? _this$options$fee : _stellarBase.BASE_FEE,
              networkPassphrase: _this.options.networkPassphrase
            }).addOperation(contract.call.apply(contract, [_this.options.method].concat(_toConsumableArray((_this$options$args = _this.options.args) !== null && _this$options$args !== void 0 ? _this$options$args : [])))).setTimeout((_this$options$timeout = _this.options.timeoutInSeconds) !== null && _this$options$timeout !== void 0 ? _this$options$timeout : _types.DEFAULT_TIMEOUT);
            _context.n = 6;
            return _this.simulate();
          case 6:
            return _context.a(2, _this);
          case 7:
            throw new AssembledTransaction.Errors.RestorationFailure("Automatic restore failed! You set 'restore: true' but the attempted restore did not work. Result:\n".concat(JSON.stringify(result)));
          case 8:
            if (_api.Api.isSimulationSuccess(_this.simulation)) {
              _this.built = (0, _transaction.assembleTransaction)(_this.built, _this.simulation).build();
            }
            return _context.a(2, _this);
        }
      }, _callee);
    })));
    _defineProperty(this, "sign", _asyncToGenerator(_regenerator().m(function _callee2() {
      var _this$options$timeout2;
      var _ref4,
        _ref4$force,
        force,
        _ref4$signTransaction,
        signTransaction,
        sigsNeeded,
        timeoutInSeconds,
        signOpts,
        _yield$signTransactio,
        signature,
        error,
        _args2 = arguments;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            _ref4 = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, _ref4$force = _ref4.force, force = _ref4$force === void 0 ? false : _ref4$force, _ref4$signTransaction = _ref4.signTransaction, signTransaction = _ref4$signTransaction === void 0 ? _this.options.signTransaction : _ref4$signTransaction;
            if (_this.built) {
              _context2.n = 1;
              break;
            }
            throw new Error("Transaction has not yet been simulated");
          case 1:
            if (!(!force && _this.isReadCall)) {
              _context2.n = 2;
              break;
            }
            throw new AssembledTransaction.Errors.NoSignatureNeeded("This is a read call. It requires no signature or sending. " + "Use `force: true` to sign and send anyway.");
          case 2:
            if (signTransaction) {
              _context2.n = 3;
              break;
            }
            throw new AssembledTransaction.Errors.NoSigner("You must provide a signTransaction function, either when calling " + "`signAndSend` or when initializing your Client");
          case 3:
            if (_this.options.publicKey) {
              _context2.n = 4;
              break;
            }
            throw new AssembledTransaction.Errors.FakeAccount("This transaction was constructed using a default account. Provide a valid publicKey in the AssembledTransactionOptions.");
          case 4:
            sigsNeeded = _this.needsNonInvokerSigningBy().filter(function (id) {
              return !id.startsWith("C");
            });
            if (!sigsNeeded.length) {
              _context2.n = 5;
              break;
            }
            throw new AssembledTransaction.Errors.NeedsMoreSignatures("Transaction requires signatures from ".concat(sigsNeeded, ". ") + "See `needsNonInvokerSigningBy` for details.");
          case 5:
            timeoutInSeconds = (_this$options$timeout2 = _this.options.timeoutInSeconds) !== null && _this$options$timeout2 !== void 0 ? _this$options$timeout2 : _types.DEFAULT_TIMEOUT;
            _this.built = _stellarBase.TransactionBuilder.cloneFrom(_this.built, {
              fee: _this.built.fee,
              timebounds: undefined,
              sorobanData: _this.simulationData.transactionData
            }).setTimeout(timeoutInSeconds).build();
            signOpts = {
              networkPassphrase: _this.options.networkPassphrase
            };
            if (_this.options.address) signOpts.address = _this.options.address;
            if (_this.options.submit !== undefined) signOpts.submit = _this.options.submit;
            if (_this.options.submitUrl) signOpts.submitUrl = _this.options.submitUrl;
            _context2.n = 6;
            return signTransaction(_this.built.toXDR(), signOpts);
          case 6:
            _yield$signTransactio = _context2.v;
            signature = _yield$signTransactio.signedTxXdr;
            error = _yield$signTransactio.error;
            _this.handleWalletError(error);
            _this.signed = _stellarBase.TransactionBuilder.fromXDR(signature, _this.options.networkPassphrase);
          case 7:
            return _context2.a(2);
        }
      }, _callee2);
    })));
    _defineProperty(this, "signAndSend", _asyncToGenerator(_regenerator().m(function _callee3() {
      var _ref6,
        _ref6$force,
        force,
        _ref6$signTransaction,
        signTransaction,
        watcher,
        originalSubmit,
        _args3 = arguments;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            _ref6 = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {}, _ref6$force = _ref6.force, force = _ref6$force === void 0 ? false : _ref6$force, _ref6$signTransaction = _ref6.signTransaction, signTransaction = _ref6$signTransaction === void 0 ? _this.options.signTransaction : _ref6$signTransaction, watcher = _ref6.watcher;
            if (_this.signed) {
              _context3.n = 3;
              break;
            }
            originalSubmit = _this.options.submit;
            if (_this.options.submit) {
              _this.options.submit = false;
            }
            _context3.p = 1;
            _context3.n = 2;
            return _this.sign({
              force: force,
              signTransaction: signTransaction
            });
          case 2:
            _context3.p = 2;
            _this.options.submit = originalSubmit;
            return _context3.f(2);
          case 3:
            return _context3.a(2, _this.send(watcher));
        }
      }, _callee3, null, [[1,, 2, 3]]);
    })));
    _defineProperty(this, "needsNonInvokerSigningBy", function () {
      var _rawInvokeHostFunctio;
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref7$includeAlreadyS = _ref7.includeAlreadySigned,
        includeAlreadySigned = _ref7$includeAlreadyS === void 0 ? false : _ref7$includeAlreadyS;
      if (!_this.built) {
        throw new Error("Transaction has not yet been simulated");
      }
      if (!("operations" in _this.built)) {
        throw new Error("Unexpected Transaction type; no operations: ".concat(JSON.stringify(_this.built)));
      }
      var rawInvokeHostFunctionOp = _this.built.operations[0];
      return _toConsumableArray(new Set(((_rawInvokeHostFunctio = rawInvokeHostFunctionOp.auth) !== null && _rawInvokeHostFunctio !== void 0 ? _rawInvokeHostFunctio : []).filter(function (entry) {
        return entry.credentials().switch() === _stellarBase.xdr.SorobanCredentialsType.sorobanCredentialsAddress() && (includeAlreadySigned || entry.credentials().address().signature().switch().name === "scvVoid");
      }).map(function (entry) {
        return _stellarBase.Address.fromScAddress(entry.credentials().address().address()).toString();
      })));
    });
    _defineProperty(this, "signAuthEntries", _asyncToGenerator(_regenerator().m(function _callee6() {
      var _rawInvokeHostFunctio2;
      var _ref9,
        _ref9$expiration,
        expiration,
        _ref9$signAuthEntry,
        signAuthEntry,
        _ref9$address,
        address,
        _ref9$authorizeEntry,
        authorizeEntry,
        needsNonInvokerSigningBy,
        rawInvokeHostFunctionOp,
        authEntries,
        _iterator,
        _step,
        _loop,
        _ret,
        _args7 = arguments,
        _t5;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            _ref9 = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : {}, _ref9$expiration = _ref9.expiration, expiration = _ref9$expiration === void 0 ? _asyncToGenerator(_regenerator().m(function _callee4() {
              var _t;
              return _regenerator().w(function (_context4) {
                while (1) switch (_context4.n) {
                  case 0:
                    _context4.n = 1;
                    return _this.server.getLatestLedger();
                  case 1:
                    _t = _context4.v.sequence;
                    return _context4.a(2, _t + 100);
                }
              }, _callee4);
            }))() : _ref9$expiration, _ref9$signAuthEntry = _ref9.signAuthEntry, signAuthEntry = _ref9$signAuthEntry === void 0 ? _this.options.signAuthEntry : _ref9$signAuthEntry, _ref9$address = _ref9.address, address = _ref9$address === void 0 ? _this.options.publicKey : _ref9$address, _ref9$authorizeEntry = _ref9.authorizeEntry, authorizeEntry = _ref9$authorizeEntry === void 0 ? _stellarBase.authorizeEntry : _ref9$authorizeEntry;
            if (_this.built) {
              _context7.n = 1;
              break;
            }
            throw new Error("Transaction has not yet been assembled or simulated");
          case 1:
            if (!(authorizeEntry === _stellarBase.authorizeEntry)) {
              _context7.n = 4;
              break;
            }
            needsNonInvokerSigningBy = _this.needsNonInvokerSigningBy();
            if (!(needsNonInvokerSigningBy.length === 0)) {
              _context7.n = 2;
              break;
            }
            throw new AssembledTransaction.Errors.NoUnsignedNonInvokerAuthEntries("No unsigned non-invoker auth entries; maybe you already signed?");
          case 2:
            if (!(needsNonInvokerSigningBy.indexOf(address !== null && address !== void 0 ? address : "") === -1)) {
              _context7.n = 3;
              break;
            }
            throw new AssembledTransaction.Errors.NoSignatureNeeded("No auth entries for public key \"".concat(address, "\""));
          case 3:
            if (signAuthEntry) {
              _context7.n = 4;
              break;
            }
            throw new AssembledTransaction.Errors.NoSigner("You must provide `signAuthEntry` or a custom `authorizeEntry`");
          case 4:
            rawInvokeHostFunctionOp = _this.built.operations[0];
            authEntries = (_rawInvokeHostFunctio2 = rawInvokeHostFunctionOp.auth) !== null && _rawInvokeHostFunctio2 !== void 0 ? _rawInvokeHostFunctio2 : [];
            _iterator = _createForOfIteratorHelper(authEntries.entries());
            _context7.p = 5;
            _loop = _regenerator().m(function _loop() {
              var _step$value, i, entry, credentials, authEntryAddress, sign, _t2, _t3, _t4;
              return _regenerator().w(function (_context6) {
                while (1) switch (_context6.n) {
                  case 0:
                    _step$value = _slicedToArray(_step.value, 2), i = _step$value[0], entry = _step$value[1];
                    credentials = _stellarBase.xdr.SorobanCredentials.fromXDR(entry.credentials().toXDR());
                    if (!(credentials.switch() !== _stellarBase.xdr.SorobanCredentialsType.sorobanCredentialsAddress())) {
                      _context6.n = 1;
                      break;
                    }
                    return _context6.a(2, 0);
                  case 1:
                    authEntryAddress = _stellarBase.Address.fromScAddress(credentials.address().address()).toString();
                    if (!(authEntryAddress !== address)) {
                      _context6.n = 2;
                      break;
                    }
                    return _context6.a(2, 0);
                  case 2:
                    sign = signAuthEntry !== null && signAuthEntry !== void 0 ? signAuthEntry : Promise.resolve;
                    _t2 = authorizeEntry;
                    _t3 = entry;
                    _t4 = function () {
                      var _ref1 = _asyncToGenerator(_regenerator().m(function _callee5(preimage) {
                        var _yield$sign, signedAuthEntry, error;
                        return _regenerator().w(function (_context5) {
                          while (1) switch (_context5.n) {
                            case 0:
                              _context5.n = 1;
                              return sign(preimage.toXDR("base64"), {
                                address: address
                              });
                            case 1:
                              _yield$sign = _context5.v;
                              signedAuthEntry = _yield$sign.signedAuthEntry;
                              error = _yield$sign.error;
                              _this.handleWalletError(error);
                              return _context5.a(2, Buffer.from(signedAuthEntry, "base64"));
                          }
                        }, _callee5);
                      }));
                      return function (_x) {
                        return _ref1.apply(this, arguments);
                      };
                    }();
                    _context6.n = 3;
                    return expiration;
                  case 3:
                    _context6.n = 4;
                    return _t2(_t3, _t4, _context6.v, _this.options.networkPassphrase);
                  case 4:
                    authEntries[i] = _context6.v;
                  case 5:
                    return _context6.a(2);
                }
              }, _loop);
            });
            _iterator.s();
          case 6:
            if ((_step = _iterator.n()).done) {
              _context7.n = 9;
              break;
            }
            return _context7.d(_regeneratorValues(_loop()), 7);
          case 7:
            _ret = _context7.v;
            if (!(_ret === 0)) {
              _context7.n = 8;
              break;
            }
            return _context7.a(3, 8);
          case 8:
            _context7.n = 6;
            break;
          case 9:
            _context7.n = 11;
            break;
          case 10:
            _context7.p = 10;
            _t5 = _context7.v;
            _iterator.e(_t5);
          case 11:
            _context7.p = 11;
            _iterator.f();
            return _context7.f(11);
          case 12:
            return _context7.a(2);
        }
      }, _callee6, null, [[5, 10, 11, 12]]);
    })));
    this.options = options;
    this.options.simulate = (_this$options$simulat = this.options.simulate) !== null && _this$options$simulat !== void 0 ? _this$options$simulat : true;
    var _this$options = this.options,
      server = _this$options.server,
      allowHttp = _this$options.allowHttp,
      headers = _this$options.headers,
      rpcUrl = _this$options.rpcUrl;
    this.server = server !== null && server !== void 0 ? server : new _rpc.Server(rpcUrl, {
      allowHttp: allowHttp,
      headers: headers
    });
  }
  return _createClass(AssembledTransaction, [{
    key: "toJSON",
    value: function toJSON() {
      var _this$built;
      return JSON.stringify({
        method: this.options.method,
        tx: (_this$built = this.built) === null || _this$built === void 0 ? void 0 : _this$built.toXDR(),
        simulationResult: {
          auth: this.simulationData.result.auth.map(function (a) {
            return a.toXDR("base64");
          }),
          retval: this.simulationData.result.retval.toXDR("base64")
        },
        simulationTransactionData: this.simulationData.transactionData.toXDR("base64")
      });
    }
  }, {
    key: "toXDR",
    value: function toXDR() {
      var _this$built2;
      if (!this.built) throw new Error("Transaction has not yet been simulated; " + "call `AssembledTransaction.simulate` first.");
      return (_this$built2 = this.built) === null || _this$built2 === void 0 ? void 0 : _this$built2.toEnvelope().toXDR("base64");
    }
  }, {
    key: "handleWalletError",
    value: function handleWalletError(error) {
      if (!error) return;
      var message = error.message,
        code = error.code;
      var fullMessage = "".concat(message).concat(error.ext ? " (".concat(error.ext.join(", "), ")") : "");
      switch (code) {
        case -1:
          throw new AssembledTransaction.Errors.InternalWalletError(fullMessage);
        case -2:
          throw new AssembledTransaction.Errors.ExternalServiceError(fullMessage);
        case -3:
          throw new AssembledTransaction.Errors.InvalidClientRequest(fullMessage);
        case -4:
          throw new AssembledTransaction.Errors.UserRejected(fullMessage);
        default:
          throw new Error("Unhandled error: ".concat(fullMessage));
      }
    }
  }, {
    key: "simulationData",
    get: function get() {
      var _simulation$result;
      if (this.simulationResult && this.simulationTransactionData) {
        return {
          result: this.simulationResult,
          transactionData: this.simulationTransactionData
        };
      }
      var simulation = this.simulation;
      if (!simulation) {
        throw new AssembledTransaction.Errors.NotYetSimulated("Transaction has not yet been simulated");
      }
      if (_api.Api.isSimulationError(simulation)) {
        throw new AssembledTransaction.Errors.SimulationFailed("Transaction simulation failed: \"".concat(simulation.error, "\""));
      }
      if (_api.Api.isSimulationRestore(simulation)) {
        throw new AssembledTransaction.Errors.ExpiredState("You need to restore some contract state before you can invoke this method.\n" + "You can set `restore` to true in the method options in order to " + "automatically restore the contract state when needed.");
      }
      this.simulationResult = (_simulation$result = simulation.result) !== null && _simulation$result !== void 0 ? _simulation$result : {
        auth: [],
        retval: _stellarBase.xdr.ScVal.scvVoid()
      };
      this.simulationTransactionData = simulation.transactionData.build();
      return {
        result: this.simulationResult,
        transactionData: this.simulationTransactionData
      };
    }
  }, {
    key: "result",
    get: function get() {
      try {
        if (!this.simulationData.result) {
          throw new Error("No simulation result!");
        }
        return this.options.parseResultXdr(this.simulationData.result.retval);
      } catch (e) {
        if (!(0, _utils.implementsToString)(e)) throw e;
        var err = this.parseError(e.toString());
        if (err) return err;
        throw e;
      }
    }
  }, {
    key: "parseError",
    value: function parseError(errorMessage) {
      if (!this.options.errorTypes) return undefined;
      var match = errorMessage.match(_utils.contractErrorPattern);
      if (!match) return undefined;
      var i = parseInt(match[1], 10);
      var err = this.options.errorTypes[i];
      if (!err) return undefined;
      return new _rust_result.Err(err);
    }
  }, {
    key: "send",
    value: (function () {
      var _send = _asyncToGenerator(_regenerator().m(function _callee7(watcher) {
        var sent;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.n) {
            case 0:
              if (this.signed) {
                _context8.n = 1;
                break;
              }
              throw new Error("The transaction has not yet been signed. Run `sign` first, or use `signAndSend` instead.");
            case 1:
              _context8.n = 2;
              return _sent_transaction.SentTransaction.init(this, watcher);
            case 2:
              sent = _context8.v;
              return _context8.a(2, sent);
          }
        }, _callee7, this);
      }));
      function send(_x2) {
        return _send.apply(this, arguments);
      }
      return send;
    }())
  }, {
    key: "isReadCall",
    get: function get() {
      var authsCount = this.simulationData.result.auth.length;
      var writeLength = this.simulationData.transactionData.resources().footprint().readWrite().length;
      return authsCount === 0 && writeLength === 0;
    }
  }, {
    key: "restoreFootprint",
    value: (function () {
      var _restoreFootprint = _asyncToGenerator(_regenerator().m(function _callee8(restorePreamble, account) {
        var restoreTx, sentTransaction, _t6;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              if (this.options.signTransaction) {
                _context9.n = 1;
                break;
              }
              throw new Error("For automatic restore to work you must provide a signTransaction function when initializing your Client");
            case 1:
              if (!(account !== null && account !== void 0)) {
                _context9.n = 2;
                break;
              }
              _t6 = account;
              _context9.n = 4;
              break;
            case 2:
              _context9.n = 3;
              return (0, _utils.getAccount)(this.options, this.server);
            case 3:
              _t6 = _context9.v;
            case 4:
              account = _t6;
              _context9.n = 5;
              return AssembledTransaction.buildFootprintRestoreTransaction(_objectSpread({}, this.options), restorePreamble.transactionData, account, restorePreamble.minResourceFee);
            case 5:
              restoreTx = _context9.v;
              _context9.n = 6;
              return restoreTx.signAndSend();
            case 6:
              sentTransaction = _context9.v;
              if (sentTransaction.getTransactionResponse) {
                _context9.n = 7;
                break;
              }
              throw new AssembledTransaction.Errors.RestorationFailure("The attempt at automatic restore failed. \n".concat(JSON.stringify(sentTransaction)));
            case 7:
              return _context9.a(2, sentTransaction.getTransactionResponse);
          }
        }, _callee8, this);
      }));
      function restoreFootprint(_x3, _x4) {
        return _restoreFootprint.apply(this, arguments);
      }
      return restoreFootprint;
    }())
  }], [{
    key: "fromJSON",
    value: function fromJSON(options, _ref10) {
      var tx = _ref10.tx,
        simulationResult = _ref10.simulationResult,
        simulationTransactionData = _ref10.simulationTransactionData;
      var txn = new AssembledTransaction(options);
      txn.built = _stellarBase.TransactionBuilder.fromXDR(tx, options.networkPassphrase);
      txn.simulationResult = {
        auth: simulationResult.auth.map(function (a) {
          return _stellarBase.xdr.SorobanAuthorizationEntry.fromXDR(a, "base64");
        }),
        retval: _stellarBase.xdr.ScVal.fromXDR(simulationResult.retval, "base64")
      };
      txn.simulationTransactionData = _stellarBase.xdr.SorobanTransactionData.fromXDR(simulationTransactionData, "base64");
      return txn;
    }
  }, {
    key: "fromXDR",
    value: function fromXDR(options, encodedXDR, spec) {
      var _operation$func;
      var envelope = _stellarBase.xdr.TransactionEnvelope.fromXDR(encodedXDR, "base64");
      var built = _stellarBase.TransactionBuilder.fromXDR(envelope, options.networkPassphrase);
      var operation = built.operations[0];
      if (!(operation !== null && operation !== void 0 && (_operation$func = operation.func) !== null && _operation$func !== void 0 && _operation$func.value) || typeof operation.func.value !== "function") {
        throw new Error("Could not extract the method from the transaction envelope.");
      }
      var invokeContractArgs = operation.func.value();
      if (!(invokeContractArgs !== null && invokeContractArgs !== void 0 && invokeContractArgs.functionName)) {
        throw new Error("Could not extract the method name from the transaction envelope.");
      }
      var method = invokeContractArgs.functionName().toString("utf-8");
      var txn = new AssembledTransaction(_objectSpread(_objectSpread({}, options), {}, {
        method: method,
        parseResultXdr: function parseResultXdr(result) {
          return spec.funcResToNative(method, result);
        }
      }));
      txn.built = built;
      return txn;
    }
  }, {
    key: "build",
    value: function build(options) {
      var _options$args;
      var contract = new _stellarBase.Contract(options.contractId);
      return AssembledTransaction.buildWithOp(contract.call.apply(contract, [options.method].concat(_toConsumableArray((_options$args = options.args) !== null && _options$args !== void 0 ? _options$args : []))), options);
    }
  }, {
    key: "buildWithOp",
    value: (function () {
      var _buildWithOp = _asyncToGenerator(_regenerator().m(function _callee9(operation, options) {
        var _options$fee, _options$timeoutInSec;
        var tx, account;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              tx = new AssembledTransaction(options);
              _context0.n = 1;
              return (0, _utils.getAccount)(options, tx.server);
            case 1:
              account = _context0.v;
              tx.raw = new _stellarBase.TransactionBuilder(account, {
                fee: (_options$fee = options.fee) !== null && _options$fee !== void 0 ? _options$fee : _stellarBase.BASE_FEE,
                networkPassphrase: options.networkPassphrase
              }).setTimeout((_options$timeoutInSec = options.timeoutInSeconds) !== null && _options$timeoutInSec !== void 0 ? _options$timeoutInSec : _types.DEFAULT_TIMEOUT).addOperation(operation);
              if (!options.simulate) {
                _context0.n = 2;
                break;
              }
              _context0.n = 2;
              return tx.simulate();
            case 2:
              return _context0.a(2, tx);
          }
        }, _callee9);
      }));
      function buildWithOp(_x5, _x6) {
        return _buildWithOp.apply(this, arguments);
      }
      return buildWithOp;
    }())
  }, {
    key: "buildFootprintRestoreTransaction",
    value: function () {
      var _buildFootprintRestoreTransaction = _asyncToGenerator(_regenerator().m(function _callee0(options, sorobanData, account, fee) {
        var _options$timeoutInSec2;
        var tx;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.n) {
            case 0:
              tx = new AssembledTransaction(options);
              tx.raw = new _stellarBase.TransactionBuilder(account, {
                fee: fee,
                networkPassphrase: options.networkPassphrase
              }).setSorobanData(sorobanData instanceof _stellarBase.SorobanDataBuilder ? sorobanData.build() : sorobanData).addOperation(_stellarBase.Operation.restoreFootprint({})).setTimeout((_options$timeoutInSec2 = options.timeoutInSeconds) !== null && _options$timeoutInSec2 !== void 0 ? _options$timeoutInSec2 : _types.DEFAULT_TIMEOUT);
              _context1.n = 1;
              return tx.simulate({
                restore: false
              });
            case 1:
              return _context1.a(2, tx);
          }
        }, _callee0);
      }));
      function buildFootprintRestoreTransaction(_x7, _x8, _x9, _x0) {
        return _buildFootprintRestoreTransaction.apply(this, arguments);
      }
      return buildFootprintRestoreTransaction;
    }()
  }]);
}();
_defineProperty(AssembledTransaction, "Errors", {
  ExpiredState: _errors.ExpiredStateError,
  RestorationFailure: _errors.RestoreFailureError,
  NeedsMoreSignatures: _errors.NeedsMoreSignaturesError,
  NoSignatureNeeded: _errors.NoSignatureNeededError,
  NoUnsignedNonInvokerAuthEntries: _errors.NoUnsignedNonInvokerAuthEntriesError,
  NoSigner: _errors.NoSignerError,
  NotYetSimulated: _errors.NotYetSimulatedError,
  FakeAccount: _errors.FakeAccountError,
  SimulationFailed: _errors.SimulationFailedError,
  InternalWalletError: _errors.InternalWalletError,
  ExternalServiceError: _errors.ExternalServiceError,
  InvalidClientRequest: _errors.InvalidClientRequestError,
  UserRejected: _errors.UserRejectedError
});