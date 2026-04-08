"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerApi = void 0;
var _horizon_api = require("./horizon_api");
var Effects = _interopRequireWildcard(require("./types/effects"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var ServerApi;
(function (_ServerApi) {
  var EffectType = _ServerApi.EffectType = Effects.EffectType;
  var TradeType = function (TradeType) {
    TradeType["all"] = "all";
    TradeType["liquidityPools"] = "liquidity_pool";
    TradeType["orderbook"] = "orderbook";
    return TradeType;
  }({});
  _ServerApi.TradeType = TradeType;
  var OperationResponseType = _horizon_api.HorizonApi.OperationResponseType;
  var OperationResponseTypeI = _horizon_api.HorizonApi.OperationResponseTypeI;
})(ServerApi || (exports.ServerApi = ServerApi = {}));