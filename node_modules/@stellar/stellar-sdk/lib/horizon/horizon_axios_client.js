"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SERVER_TIME_MAP = void 0;
exports.createHttpClient = createHttpClient;
exports.getCurrentServerTime = getCurrentServerTime;
exports.version = void 0;
var _urijs = _interopRequireDefault(require("urijs"));
var _httpClient = require("../http-client");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var version = exports.version = "14.6.1";
var SERVER_TIME_MAP = exports.SERVER_TIME_MAP = {};
function toSeconds(ms) {
  return Math.floor(ms / 1000);
}
function createHttpClient(headers) {
  var httpClient = (0, _httpClient.create)({
    headers: _objectSpread(_objectSpread({}, headers), {}, {
      "X-Client-Name": "js-stellar-sdk",
      "X-Client-Version": version
    })
  });
  httpClient.interceptors.response.use(function (response) {
    var hostname = (0, _urijs.default)(response.config.url).hostname();
    var serverTime = 0;
    if (response.headers instanceof Headers) {
      var dateHeader = response.headers.get("date");
      if (dateHeader) {
        serverTime = toSeconds(Date.parse(dateHeader));
      }
    } else if (_typeof(response.headers) === "object" && "date" in response.headers) {
      var responseHeader = response.headers;
      if (typeof responseHeader.date === "string") {
        serverTime = toSeconds(Date.parse(responseHeader.date));
      }
    }
    var localTimeRecorded = toSeconds(new Date().getTime());
    if (!Number.isNaN(serverTime)) {
      SERVER_TIME_MAP[hostname] = {
        serverTime: serverTime,
        localTimeRecorded: localTimeRecorded
      };
    }
    return response;
  });
  return httpClient;
}
function getCurrentServerTime(hostname) {
  var entry = SERVER_TIME_MAP[hostname];
  if (!entry || !entry.localTimeRecorded || !entry.serverTime) {
    return null;
  }
  var serverTime = entry.serverTime,
    localTimeRecorded = entry.localTimeRecorded;
  var currentTime = toSeconds(new Date().getTime());
  if (currentTime - localTimeRecorded > 60 * 5) {
    return null;
  }
  return currentTime - localTimeRecorded + serverTime;
}