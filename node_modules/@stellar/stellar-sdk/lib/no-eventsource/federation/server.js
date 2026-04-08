"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FederationServer = exports.FEDERATION_RESPONSE_MAX_SIZE = void 0;
var _stellarBase = require("@stellar/stellar-base");
var _urijs = _interopRequireDefault(require("urijs"));
var _config = require("../config");
var _errors = require("../errors");
var _stellartoml = require("../stellartoml");
var _httpClient = require("../http-client");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var FEDERATION_RESPONSE_MAX_SIZE = exports.FEDERATION_RESPONSE_MAX_SIZE = 100 * 1024;
var FederationServer = exports.FederationServer = function () {
  function FederationServer(serverURL, domain) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, FederationServer);
    this.serverURL = (0, _urijs.default)(serverURL);
    this.domain = domain;
    var allowHttp = typeof opts.allowHttp === "undefined" ? _config.Config.isAllowHttp() : opts.allowHttp;
    this.timeout = typeof opts.timeout === "undefined" ? _config.Config.getTimeout() : opts.timeout;
    if (this.serverURL.protocol() !== "https" && !allowHttp) {
      throw new Error("Cannot connect to insecure federation server");
    }
  }
  return _createClass(FederationServer, [{
    key: "resolveAddress",
    value: (function () {
      var _resolveAddress = _asyncToGenerator(_regenerator().m(function _callee(address) {
        var stellarAddress, url;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              stellarAddress = address;
              if (!(address.indexOf("*") < 0)) {
                _context.n = 2;
                break;
              }
              if (this.domain) {
                _context.n = 1;
                break;
              }
              return _context.a(2, Promise.reject(new Error("Unknown domain. Make sure `address` contains a domain (ex. `bob*stellar.org`) or pass `domain` parameter when instantiating the server object.")));
            case 1:
              stellarAddress = "".concat(address, "*").concat(this.domain);
            case 2:
              url = this.serverURL.query({
                type: "name",
                q: stellarAddress
              });
              return _context.a(2, this._sendRequest(url));
          }
        }, _callee, this);
      }));
      function resolveAddress(_x) {
        return _resolveAddress.apply(this, arguments);
      }
      return resolveAddress;
    }())
  }, {
    key: "resolveAccountId",
    value: (function () {
      var _resolveAccountId = _asyncToGenerator(_regenerator().m(function _callee2(accountId) {
        var url;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              url = this.serverURL.query({
                type: "id",
                q: accountId
              });
              return _context2.a(2, this._sendRequest(url));
          }
        }, _callee2, this);
      }));
      function resolveAccountId(_x2) {
        return _resolveAccountId.apply(this, arguments);
      }
      return resolveAccountId;
    }())
  }, {
    key: "resolveTransactionId",
    value: (function () {
      var _resolveTransactionId = _asyncToGenerator(_regenerator().m(function _callee3(transactionId) {
        var url;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              url = this.serverURL.query({
                type: "txid",
                q: transactionId
              });
              return _context3.a(2, this._sendRequest(url));
          }
        }, _callee3, this);
      }));
      function resolveTransactionId(_x3) {
        return _resolveTransactionId.apply(this, arguments);
      }
      return resolveTransactionId;
    }())
  }, {
    key: "_sendRequest",
    value: function () {
      var _sendRequest2 = _asyncToGenerator(_regenerator().m(function _callee4(url) {
        var timeout;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              timeout = this.timeout;
              return _context4.a(2, _httpClient.httpClient.get(url.toString(), {
                maxContentLength: FEDERATION_RESPONSE_MAX_SIZE,
                timeout: timeout
              }).then(function (response) {
                if (typeof response.data.memo !== "undefined" && typeof response.data.memo !== "string") {
                  throw new Error("memo value should be of type string");
                }
                return response.data;
              }).catch(function (response) {
                if (response instanceof Error) {
                  if (response.message.match(/^maxContentLength size/)) {
                    throw new Error("federation response exceeds allowed size of ".concat(FEDERATION_RESPONSE_MAX_SIZE));
                  } else {
                    return Promise.reject(response);
                  }
                } else {
                  return Promise.reject(new _errors.BadResponseError("Server query failed. Server responded: ".concat(response.status, " ").concat(response.statusText), response.data));
                }
              }));
          }
        }, _callee4, this);
      }));
      function _sendRequest(_x4) {
        return _sendRequest2.apply(this, arguments);
      }
      return _sendRequest;
    }()
  }], [{
    key: "resolve",
    value: (function () {
      var _resolve = _asyncToGenerator(_regenerator().m(function _callee5(value) {
        var opts,
          addressParts,
          _addressParts,
          domain,
          federationServer,
          _args5 = arguments;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              opts = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {};
              if (!(value.indexOf("*") < 0)) {
                _context5.n = 2;
                break;
              }
              if (_stellarBase.StrKey.isValidEd25519PublicKey(value)) {
                _context5.n = 1;
                break;
              }
              return _context5.a(2, Promise.reject(new Error("Invalid Account ID")));
            case 1:
              return _context5.a(2, Promise.resolve({
                account_id: value
              }));
            case 2:
              addressParts = value.split("*");
              _addressParts = _slicedToArray(addressParts, 2), domain = _addressParts[1];
              if (!(addressParts.length !== 2 || !domain)) {
                _context5.n = 3;
                break;
              }
              return _context5.a(2, Promise.reject(new Error("Invalid Stellar address")));
            case 3:
              _context5.n = 4;
              return FederationServer.createForDomain(domain, opts);
            case 4:
              federationServer = _context5.v;
              return _context5.a(2, federationServer.resolveAddress(value));
          }
        }, _callee5);
      }));
      function resolve(_x5) {
        return _resolve.apply(this, arguments);
      }
      return resolve;
    }())
  }, {
    key: "createForDomain",
    value: (function () {
      var _createForDomain = _asyncToGenerator(_regenerator().m(function _callee6(domain) {
        var opts,
          tomlObject,
          _args6 = arguments;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              opts = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
              _context6.n = 1;
              return _stellartoml.Resolver.resolve(domain, opts);
            case 1:
              tomlObject = _context6.v;
              if (tomlObject.FEDERATION_SERVER) {
                _context6.n = 2;
                break;
              }
              return _context6.a(2, Promise.reject(new Error("stellar.toml does not contain FEDERATION_SERVER field")));
            case 2:
              return _context6.a(2, new FederationServer(tomlObject.FEDERATION_SERVER, domain, opts));
          }
        }, _callee6);
      }));
      function createForDomain(_x6) {
        return _createForDomain.apply(this, arguments);
      }
      return createForDomain;
    }())
  }]);
}();