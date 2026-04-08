"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Watcher = exports.SentTransaction = void 0;
var _rpc = require("../rpc");
var _api = require("../rpc/api");
var _utils = require("./utils");
var _types = require("./types");
var _SentTransaction;
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var SentTransaction = exports.SentTransaction = function () {
  function SentTransaction(assembled) {
    var _this = this;
    _classCallCheck(this, SentTransaction);
    _defineProperty(this, "send", function () {
      var _ref = _asyncToGenerator(_regenerator().m(function _callee2(watcher) {
        var _this$assembled$optio;
        var hash, timeoutInSeconds;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return _this.server.sendTransaction(_this.assembled.signed);
            case 1:
              _this.sendTransactionResponse = _context2.v;
              if (!(_this.sendTransactionResponse.status !== "PENDING")) {
                _context2.n = 2;
                break;
              }
              throw new SentTransaction.Errors.SendFailed("Sending the transaction to the network failed!\n".concat(JSON.stringify(_this.sendTransactionResponse, null, 2)));
            case 2:
              if (watcher !== null && watcher !== void 0 && watcher.onSubmitted) watcher.onSubmitted(_this.sendTransactionResponse);
              hash = _this.sendTransactionResponse.hash;
              timeoutInSeconds = (_this$assembled$optio = _this.assembled.options.timeoutInSeconds) !== null && _this$assembled$optio !== void 0 ? _this$assembled$optio : _types.DEFAULT_TIMEOUT;
              _context2.n = 3;
              return (0, _utils.withExponentialBackoff)(_asyncToGenerator(_regenerator().m(function _callee() {
                var tx;
                return _regenerator().w(function (_context) {
                  while (1) switch (_context.n) {
                    case 0:
                      _context.n = 1;
                      return _this.server.getTransaction(hash);
                    case 1:
                      tx = _context.v;
                      if (watcher !== null && watcher !== void 0 && watcher.onProgress) watcher.onProgress(tx);
                      return _context.a(2, tx);
                  }
                }, _callee);
              })), function (resp) {
                return resp.status === _api.Api.GetTransactionStatus.NOT_FOUND;
              }, timeoutInSeconds);
            case 3:
              _this.getTransactionResponseAll = _context2.v;
              _this.getTransactionResponse = _this.getTransactionResponseAll[_this.getTransactionResponseAll.length - 1];
              if (!(_this.getTransactionResponse.status === _api.Api.GetTransactionStatus.NOT_FOUND)) {
                _context2.n = 4;
                break;
              }
              throw new SentTransaction.Errors.TransactionStillPending("Waited ".concat(timeoutInSeconds, " seconds for transaction to complete, but it did not. ") + "Returning anyway. Check the transaction status manually. " + "Sent transaction: ".concat(JSON.stringify(_this.sendTransactionResponse, null, 2), "\n") + "All attempts to get the result: ".concat(JSON.stringify(_this.getTransactionResponseAll, null, 2)));
            case 4:
              return _context2.a(2, _this);
          }
        }, _callee2);
      }));
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    this.assembled = assembled;
    var _this$assembled$optio2 = this.assembled.options,
      server = _this$assembled$optio2.server,
      allowHttp = _this$assembled$optio2.allowHttp,
      headers = _this$assembled$optio2.headers,
      rpcUrl = _this$assembled$optio2.rpcUrl;
    this.server = server !== null && server !== void 0 ? server : new _rpc.Server(rpcUrl, {
      allowHttp: allowHttp,
      headers: headers
    });
  }
  return _createClass(SentTransaction, [{
    key: "result",
    get: function get() {
      if ("getTransactionResponse" in this && this.getTransactionResponse) {
        if ("returnValue" in this.getTransactionResponse) {
          return this.assembled.options.parseResultXdr(this.getTransactionResponse.returnValue);
        }
        throw new Error("Transaction failed! Cannot parse result.");
      }
      if (this.sendTransactionResponse) {
        var _this$sendTransaction;
        var errorResult = (_this$sendTransaction = this.sendTransactionResponse.errorResult) === null || _this$sendTransaction === void 0 ? void 0 : _this$sendTransaction.result();
        if (errorResult) {
          throw new SentTransaction.Errors.SendFailed("Transaction simulation looked correct, but attempting to send the transaction failed. Check `simulation` and `sendTransactionResponseAll` to troubleshoot. Decoded `sendTransactionResponse.errorResultXdr`: ".concat(errorResult));
        }
        throw new SentTransaction.Errors.SendResultOnly("Transaction was sent to the network, but not yet awaited. No result to show. Await transaction completion with `getTransaction(sendTransactionResponse.hash)`");
      }
      throw new Error("Sending transaction failed: ".concat(JSON.stringify(this.assembled.signed)));
    }
  }]);
}();
_SentTransaction = SentTransaction;
_defineProperty(SentTransaction, "Errors", {
  SendFailed: function (_Error) {
    function SendFailedError() {
      _classCallCheck(this, SendFailedError);
      return _callSuper(this, SendFailedError, arguments);
    }
    _inherits(SendFailedError, _Error);
    return _createClass(SendFailedError);
  }(_wrapNativeSuper(Error)),
  SendResultOnly: function (_Error2) {
    function SendResultOnlyError() {
      _classCallCheck(this, SendResultOnlyError);
      return _callSuper(this, SendResultOnlyError, arguments);
    }
    _inherits(SendResultOnlyError, _Error2);
    return _createClass(SendResultOnlyError);
  }(_wrapNativeSuper(Error)),
  TransactionStillPending: function (_Error3) {
    function TransactionStillPendingError() {
      _classCallCheck(this, TransactionStillPendingError);
      return _callSuper(this, TransactionStillPendingError, arguments);
    }
    _inherits(TransactionStillPendingError, _Error3);
    return _createClass(TransactionStillPendingError);
  }(_wrapNativeSuper(Error))
});
_defineProperty(SentTransaction, "init", function () {
  var _ref3 = _asyncToGenerator(_regenerator().m(function _callee3(assembled, watcher) {
    var tx, sent;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          tx = new _SentTransaction(assembled);
          _context3.n = 1;
          return tx.send(watcher);
        case 1:
          sent = _context3.v;
          return _context3.a(2, sent);
      }
    }, _callee3);
  }));
  return function (_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}());
var Watcher = exports.Watcher = _createClass(function Watcher() {
  _classCallCheck(this, Watcher);
});