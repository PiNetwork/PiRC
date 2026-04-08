"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Config: true,
  Utils: true,
  StellarToml: true,
  Federation: true,
  WebAuth: true,
  Friendbot: true,
  Horizon: true,
  rpc: true,
  contract: true,
  BindingGenerator: true
};
Object.defineProperty(exports, "BindingGenerator", {
  enumerable: true,
  get: function get() {
    return _bindings.BindingGenerator;
  }
});
Object.defineProperty(exports, "Config", {
  enumerable: true,
  get: function get() {
    return _config.Config;
  }
});
exports.StellarToml = exports.Horizon = exports.Friendbot = exports.Federation = void 0;
Object.defineProperty(exports, "Utils", {
  enumerable: true,
  get: function get() {
    return _utils.Utils;
  }
});
exports.rpc = exports.default = exports.contract = exports.WebAuth = void 0;
var _errors = require("./errors");
Object.keys(_errors).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _errors[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _errors[key];
    }
  });
});
var _config = require("./config");
var _utils = require("./utils");
var _StellarToml = _interopRequireWildcard(require("./stellartoml"));
exports.StellarToml = _StellarToml;
var _Federation = _interopRequireWildcard(require("./federation"));
exports.Federation = _Federation;
var _WebAuth = _interopRequireWildcard(require("./webauth"));
exports.WebAuth = _WebAuth;
var _Friendbot = _interopRequireWildcard(require("./friendbot"));
exports.Friendbot = _Friendbot;
var _Horizon = _interopRequireWildcard(require("./horizon"));
exports.Horizon = _Horizon;
var _rpc = _interopRequireWildcard(require("./rpc"));
exports.rpc = _rpc;
var _contract = _interopRequireWildcard(require("./contract"));
exports.contract = _contract;
var _bindings = require("./bindings");
var _stellarBase = require("@stellar/stellar-base");
Object.keys(_stellarBase).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _stellarBase[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _stellarBase[key];
    }
  });
});
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var _default = exports.default = module.exports;
if (typeof global.__USE_AXIOS__ === "undefined") {
  global.__USE_AXIOS__ = true;
}
if (typeof global.__USE_EVENTSOURCE__ === "undefined") {
  global.__USE_EVENTSOURCE__ = false;
}