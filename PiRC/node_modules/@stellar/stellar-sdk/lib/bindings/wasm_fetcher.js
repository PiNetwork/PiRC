"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WasmFetchError = void 0;
exports.fetchFromContractId = fetchFromContractId;
exports.fetchFromWasmHash = fetchFromWasmHash;
var _stellarBase = require("@stellar/stellar-base");
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
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
var WasmFetchError = exports.WasmFetchError = function (_Error) {
  function WasmFetchError(message, cause) {
    var _this;
    _classCallCheck(this, WasmFetchError);
    _this = _callSuper(this, WasmFetchError, [message]);
    _this.cause = cause;
    _this.name = "WasmFetchError";
    return _this;
  }
  _inherits(WasmFetchError, _Error);
  return _createClass(WasmFetchError);
}(_wrapNativeSuper(Error));
function getRemoteWasmFromHash(_x, _x2) {
  return _getRemoteWasmFromHash.apply(this, arguments);
}
function _getRemoteWasmFromHash() {
  _getRemoteWasmFromHash = _asyncToGenerator(_regenerator().m(function _callee(server, hashBuffer) {
    var contractCodeKey, response, entry, contractCode, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          contractCodeKey = _stellarBase.xdr.LedgerKey.contractCode(new _stellarBase.xdr.LedgerKeyContractCode({
            hash: _stellarBase.xdr.Hash.fromXDR(hashBuffer, "raw")
          }));
          _context.n = 1;
          return server.getLedgerEntries(contractCodeKey);
        case 1:
          response = _context.v;
          if (!(!response.entries || response.entries.length === 0)) {
            _context.n = 2;
            break;
          }
          throw new WasmFetchError("WASM not found for the given hash");
        case 2:
          entry = response.entries[0];
          if (!(entry.key.switch() !== _stellarBase.xdr.LedgerEntryType.contractCode())) {
            _context.n = 3;
            break;
          }
          throw new WasmFetchError("Invalid ledger entry type returned");
        case 3:
          contractCode = entry.val.contractCode();
          return _context.a(2, Buffer.from(contractCode.code()));
        case 4:
          _context.p = 4;
          _t = _context.v;
          if (!(_t instanceof WasmFetchError)) {
            _context.n = 5;
            break;
          }
          throw _t;
        case 5:
          throw new WasmFetchError("Failed to fetch WASM from hash", _t);
        case 6:
          return _context.a(2);
      }
    }, _callee, null, [[0, 4]]);
  }));
  return _getRemoteWasmFromHash.apply(this, arguments);
}
function isStellarAssetContract(instance) {
  return instance.executable().switch() === _stellarBase.xdr.ContractExecutableType.contractExecutableStellarAsset();
}
function fetchWasmFromContract(_x3, _x4) {
  return _fetchWasmFromContract.apply(this, arguments);
}
function _fetchWasmFromContract() {
  _fetchWasmFromContract = _asyncToGenerator(_regenerator().m(function _callee2(server, contractAddress) {
    var contract, response, entry, contractData, instance, wasmHash, wasmBytes, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          contract = new _stellarBase.Contract(contractAddress.toString());
          _context2.n = 1;
          return server.getLedgerEntries(contract.getFootprint());
        case 1:
          response = _context2.v;
          if (!(!response.entries || response.entries.length === 0)) {
            _context2.n = 2;
            break;
          }
          throw new WasmFetchError("Contract instance not found");
        case 2:
          entry = response.entries[0];
          if (!(entry.key.switch() !== _stellarBase.xdr.LedgerEntryType.contractData())) {
            _context2.n = 3;
            break;
          }
          throw new WasmFetchError("Invalid ledger entry type returned");
        case 3:
          contractData = entry.val.contractData();
          instance = contractData.val().instance();
          if (!isStellarAssetContract(instance)) {
            _context2.n = 4;
            break;
          }
          return _context2.a(2, {
            type: "stellar-asset-contract"
          });
        case 4:
          wasmHash = instance.executable().wasmHash();
          _context2.n = 5;
          return getRemoteWasmFromHash(server, wasmHash);
        case 5:
          wasmBytes = _context2.v;
          return _context2.a(2, {
            type: "wasm",
            wasmBytes: wasmBytes
          });
        case 6:
          _context2.p = 6;
          _t2 = _context2.v;
          if (!(_t2 instanceof WasmFetchError)) {
            _context2.n = 7;
            break;
          }
          throw _t2;
        case 7:
          throw new WasmFetchError("Failed to fetch WASM from contract", _t2);
        case 8:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 6]]);
  }));
  return _fetchWasmFromContract.apply(this, arguments);
}
function fetchFromWasmHash(_x5, _x6) {
  return _fetchFromWasmHash.apply(this, arguments);
}
function _fetchFromWasmHash() {
  _fetchFromWasmHash = _asyncToGenerator(_regenerator().m(function _callee3(wasmHash, rpcServer) {
    var hashBuffer, wasmBytes, _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          _context3.p = 0;
          hashBuffer = Buffer.from(wasmHash, "hex");
          if (!(hashBuffer.length !== 32)) {
            _context3.n = 1;
            break;
          }
          throw new WasmFetchError("Invalid WASM hash length: expected 32 bytes, got ".concat(hashBuffer.length));
        case 1:
          _context3.n = 2;
          return getRemoteWasmFromHash(rpcServer, hashBuffer);
        case 2:
          wasmBytes = _context3.v;
          return _context3.a(2, {
            type: "wasm",
            wasmBytes: wasmBytes
          });
        case 3:
          _context3.p = 3;
          _t3 = _context3.v;
          throw new WasmFetchError("Failed to fetch WASM from hash ".concat(wasmHash), _t3);
        case 4:
          return _context3.a(2);
      }
    }, _callee3, null, [[0, 3]]);
  }));
  return _fetchFromWasmHash.apply(this, arguments);
}
function fetchFromContractId(_x7, _x8) {
  return _fetchFromContractId.apply(this, arguments);
}
function _fetchFromContractId() {
  _fetchFromContractId = _asyncToGenerator(_regenerator().m(function _callee4(contractId, rpcServer) {
    var contractAddress, _t4;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          _context4.p = 0;
          if (_stellarBase.StrKey.isValidContract(contractId)) {
            _context4.n = 1;
            break;
          }
          throw new WasmFetchError("Invalid contract ID: ".concat(contractId));
        case 1:
          contractAddress = _stellarBase.Address.fromString(contractId);
          _context4.n = 2;
          return fetchWasmFromContract(rpcServer, contractAddress);
        case 2:
          return _context4.a(2, _context4.v);
        case 3:
          _context4.p = 3;
          _t4 = _context4.v;
          throw new WasmFetchError("Failed to fetch WASM from contract ".concat(contractId), _t4);
        case 4:
          return _context4.a(2);
      }
    }, _callee4, null, [[0, 3]]);
  }));
  return _fetchFromContractId.apply(this, arguments);
}