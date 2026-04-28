"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;
var _stellarBase = require("@stellar/stellar-base");
var _spec = require("./spec");
var _rpc = require("../rpc");
var _assembled_transaction = require("./assembled_transaction");
var _utils = require("../bindings/utils");
var _excluded = ["method"],
  _excluded2 = ["wasmHash", "salt", "format", "fee", "timeoutInSeconds", "simulate"];
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var CONSTRUCTOR_FUNC = "__constructor";
function specFromWasmHash(_x, _x2) {
  return _specFromWasmHash.apply(this, arguments);
}
function _specFromWasmHash() {
  _specFromWasmHash = _asyncToGenerator(_regenerator().m(function _callee5(wasmHash, options) {
    var format,
      rpcUrl,
      allowHttp,
      headers,
      serverOpts,
      server,
      wasm,
      _args5 = arguments;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          format = _args5.length > 2 && _args5[2] !== undefined ? _args5[2] : "hex";
          if (!(!options || !options.rpcUrl)) {
            _context5.n = 1;
            break;
          }
          throw new TypeError("options must contain rpcUrl");
        case 1:
          rpcUrl = options.rpcUrl, allowHttp = options.allowHttp, headers = options.headers;
          serverOpts = {
            allowHttp: allowHttp,
            headers: headers
          };
          server = new _rpc.Server(rpcUrl, serverOpts);
          _context5.n = 2;
          return server.getContractWasmByHash(wasmHash, format);
        case 2:
          wasm = _context5.v;
          return _context5.a(2, _spec.Spec.fromWasm(wasm));
      }
    }, _callee5);
  }));
  return _specFromWasmHash.apply(this, arguments);
}
var Client = exports.Client = function () {
  function Client(spec, options) {
    var _this = this;
    _classCallCheck(this, Client);
    _defineProperty(this, "txFromJSON", function (json) {
      var _JSON$parse = JSON.parse(json),
        method = _JSON$parse.method,
        tx = _objectWithoutProperties(_JSON$parse, _excluded);
      return _assembled_transaction.AssembledTransaction.fromJSON(_objectSpread(_objectSpread({}, _this.options), {}, {
        method: method,
        parseResultXdr: function parseResultXdr(result) {
          return _this.spec.funcResToNative(method, result);
        }
      }), tx);
    });
    _defineProperty(this, "txFromXDR", function (xdrBase64) {
      return _assembled_transaction.AssembledTransaction.fromXDR(_this.options, xdrBase64, _this.spec);
    });
    this.spec = spec;
    this.options = options;
    if (options.server === undefined) {
      var allowHttp = options.allowHttp,
        headers = options.headers;
      options.server = new _rpc.Server(options.rpcUrl, {
        allowHttp: allowHttp,
        headers: headers
      });
    }
    this.spec.funcs().forEach(function (xdrFn) {
      var method = xdrFn.name().toString();
      if (method === CONSTRUCTOR_FUNC) {
        return;
      }
      var assembleTransaction = function assembleTransaction(args, methodOptions) {
        return _assembled_transaction.AssembledTransaction.build(_objectSpread(_objectSpread(_objectSpread({
          method: method,
          args: args && spec.funcArgsToScVals(method, args)
        }, options), methodOptions), {}, {
          errorTypes: spec.errorCases().reduce(function (acc, curr) {
            return _objectSpread(_objectSpread({}, acc), {}, _defineProperty({}, curr.value(), {
              message: curr.doc().toString()
            }));
          }, {}),
          parseResultXdr: function parseResultXdr(result) {
            return spec.funcResToNative(method, result);
          }
        }));
      };
      _this[(0, _utils.sanitizeIdentifier)(method)] = spec.getFunc(method).inputs().length === 0 ? function (opts) {
        return assembleTransaction(undefined, opts);
      } : assembleTransaction;
    });
  }
  return _createClass(Client, null, [{
    key: "deploy",
    value: function () {
      var _deploy = _asyncToGenerator(_regenerator().m(function _callee(args, options) {
        var wasmHash, salt, format, fee, timeoutInSeconds, simulate, clientOptions, spec, operation;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              wasmHash = options.wasmHash, salt = options.salt, format = options.format, fee = options.fee, timeoutInSeconds = options.timeoutInSeconds, simulate = options.simulate, clientOptions = _objectWithoutProperties(options, _excluded2);
              _context.n = 1;
              return specFromWasmHash(wasmHash, clientOptions, format);
            case 1:
              spec = _context.v;
              operation = _stellarBase.Operation.createCustomContract({
                address: new _stellarBase.Address(options.address || options.publicKey),
                wasmHash: typeof wasmHash === "string" ? Buffer.from(wasmHash, format !== null && format !== void 0 ? format : "hex") : wasmHash,
                salt: salt,
                constructorArgs: args ? spec.funcArgsToScVals(CONSTRUCTOR_FUNC, args) : []
              });
              return _context.a(2, _assembled_transaction.AssembledTransaction.buildWithOp(operation, _objectSpread(_objectSpread({
                fee: fee,
                timeoutInSeconds: timeoutInSeconds,
                simulate: simulate
              }, clientOptions), {}, {
                contractId: "ignored",
                method: CONSTRUCTOR_FUNC,
                parseResultXdr: function parseResultXdr(result) {
                  return new Client(spec, _objectSpread(_objectSpread({}, clientOptions), {}, {
                    contractId: _stellarBase.Address.fromScVal(result).toString()
                  }));
                }
              })));
          }
        }, _callee);
      }));
      function deploy(_x3, _x4) {
        return _deploy.apply(this, arguments);
      }
      return deploy;
    }()
  }, {
    key: "fromWasmHash",
    value: (function () {
      var _fromWasmHash = _asyncToGenerator(_regenerator().m(function _callee2(wasmHash, options) {
        var _options$server;
        var format,
          rpcUrl,
          allowHttp,
          headers,
          server,
          wasm,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              format = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : "hex";
              if (!(!options || !options.rpcUrl)) {
                _context2.n = 1;
                break;
              }
              throw new TypeError("options must contain rpcUrl");
            case 1:
              rpcUrl = options.rpcUrl, allowHttp = options.allowHttp, headers = options.headers;
              server = (_options$server = options.server) !== null && _options$server !== void 0 ? _options$server : new _rpc.Server(rpcUrl, {
                allowHttp: allowHttp,
                headers: headers
              });
              _context2.n = 2;
              return server.getContractWasmByHash(wasmHash, format);
            case 2:
              wasm = _context2.v;
              return _context2.a(2, Client.fromWasm(wasm, options));
          }
        }, _callee2);
      }));
      function fromWasmHash(_x5, _x6) {
        return _fromWasmHash.apply(this, arguments);
      }
      return fromWasmHash;
    }())
  }, {
    key: "fromWasm",
    value: (function () {
      var _fromWasm = _asyncToGenerator(_regenerator().m(function _callee3(wasm, options) {
        var spec;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              _context3.n = 1;
              return _spec.Spec.fromWasm(wasm);
            case 1:
              spec = _context3.v;
              return _context3.a(2, new Client(spec, options));
          }
        }, _callee3);
      }));
      function fromWasm(_x7, _x8) {
        return _fromWasm.apply(this, arguments);
      }
      return fromWasm;
    }())
  }, {
    key: "from",
    value: (function () {
      var _from = _asyncToGenerator(_regenerator().m(function _callee4(options) {
        var rpcUrl, contractId, allowHttp, headers, server, wasm;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              if (!(!options || !options.rpcUrl || !options.contractId)) {
                _context4.n = 1;
                break;
              }
              throw new TypeError("options must contain rpcUrl and contractId");
            case 1:
              rpcUrl = options.rpcUrl, contractId = options.contractId, allowHttp = options.allowHttp, headers = options.headers;
              server = new _rpc.Server(rpcUrl, {
                allowHttp: allowHttp,
                headers: headers
              });
              _context4.n = 2;
              return server.getContractWasmByContractId(contractId);
            case 2:
              wasm = _context4.v;
              return _context4.a(2, Client.fromWasm(wasm, options));
          }
        }, _callee4);
      }));
      function from(_x9) {
        return _from.apply(this, arguments);
      }
      return from;
    }())
  }]);
}();