"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallBuilder = void 0;
var _urijs = _interopRequireDefault(require("urijs"));
var _URITemplate = _interopRequireDefault(require("urijs/src/URITemplate"));
var _errors = require("../errors");
var _horizon_axios_client = require("./horizon_axios_client");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var JOINABLE = ["transaction"];
var anyGlobal = global;
var EventSource;
if (typeof true !== "undefined" && true) {
  var _ref, _anyGlobal$EventSourc, _anyGlobal$window;
  EventSource = (_ref = (_anyGlobal$EventSourc = anyGlobal.EventSource) !== null && _anyGlobal$EventSourc !== void 0 ? _anyGlobal$EventSourc : (_anyGlobal$window = anyGlobal.window) === null || _anyGlobal$window === void 0 ? void 0 : _anyGlobal$window.EventSource) !== null && _ref !== void 0 ? _ref : require("eventsource");
}
var CallBuilder = exports.CallBuilder = function () {
  function CallBuilder(serverUrl, httpClient) {
    var neighborRoot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    _classCallCheck(this, CallBuilder);
    this.url = serverUrl.clone();
    this.filter = [];
    this.originalSegments = this.url.segment() || [];
    this.neighborRoot = neighborRoot;
    this.httpClient = httpClient;
  }
  return _createClass(CallBuilder, [{
    key: "call",
    value: function call() {
      var _this = this;
      this.checkFilter();
      return this._sendNormalRequest(this.url).then(function (r) {
        return _this._parseResponse(r);
      });
    }
  }, {
    key: "stream",
    value: function stream() {
      var _this2 = this;
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (EventSource === undefined) {
        throw new Error("Streaming requires eventsource to be enabled. If you need this functionality, compile with USE_EVENTSOURCE=true.");
      }
      this.checkFilter();
      this.url.setQuery("X-Client-Name", "js-stellar-sdk");
      this.url.setQuery("X-Client-Version", _horizon_axios_client.version);
      var headers = this.httpClient.defaults.headers;
      if (headers) {
        var headerNames = ["X-App-Name", "X-App-Version"];
        headerNames.forEach(function (name) {
          var value;
          if (headers instanceof Headers) {
            var _headers$get;
            value = (_headers$get = headers.get(name)) !== null && _headers$get !== void 0 ? _headers$get : undefined;
          } else if (Array.isArray(headers)) {
            var entry = headers.find(function (_ref2) {
              var _ref3 = _slicedToArray(_ref2, 1),
                key = _ref3[0];
              return key === name;
            });
            value = entry === null || entry === void 0 ? void 0 : entry[1];
          } else {
            value = headers[name];
          }
          if (value) {
            _this2.url.setQuery(name, value);
          }
        });
      }
      var es;
      var timeout;
      var createTimeout = function createTimeout() {
        timeout = setTimeout(function () {
          var _es;
          (_es = es) === null || _es === void 0 || _es.close();
          es = _createEventSource();
        }, options.reconnectTimeout || 15 * 1000);
      };
      var _createEventSource = function createEventSource() {
        try {
          es = new EventSource(_this2.url.toString());
        } catch (err) {
          if (options.onerror) {
            options.onerror(err);
          }
        }
        createTimeout();
        if (!es) {
          return es;
        }
        var closed = false;
        var onClose = function onClose() {
          if (closed) {
            return;
          }
          clearTimeout(timeout);
          es.close();
          _createEventSource();
          closed = true;
        };
        var onMessage = function onMessage(message) {
          if (message.type === "close") {
            onClose();
            return;
          }
          var result = message.data ? _this2._parseRecord(JSON.parse(message.data)) : message;
          if (result.paging_token) {
            _this2.url.setQuery("cursor", result.paging_token);
          }
          clearTimeout(timeout);
          createTimeout();
          if (typeof options.onmessage !== "undefined") {
            options.onmessage(result);
          }
        };
        var onError = function onError(error) {
          if (options.onerror) {
            options.onerror(error);
          }
        };
        if (es.addEventListener) {
          es.addEventListener("message", onMessage.bind(_this2));
          es.addEventListener("error", onError.bind(_this2));
          es.addEventListener("close", onClose.bind(_this2));
        } else {
          es.onmessage = onMessage.bind(_this2);
          es.onerror = onError.bind(_this2);
        }
        return es;
      };
      _createEventSource();
      return function () {
        var _es2;
        clearTimeout(timeout);
        (_es2 = es) === null || _es2 === void 0 || _es2.close();
      };
    }
  }, {
    key: "cursor",
    value: function cursor(_cursor) {
      this.url.setQuery("cursor", _cursor);
      return this;
    }
  }, {
    key: "limit",
    value: function limit(recordsNumber) {
      this.url.setQuery("limit", recordsNumber.toString());
      return this;
    }
  }, {
    key: "order",
    value: function order(direction) {
      this.url.setQuery("order", direction);
      return this;
    }
  }, {
    key: "join",
    value: function join(include) {
      this.url.setQuery("join", include);
      return this;
    }
  }, {
    key: "forEndpoint",
    value: function forEndpoint(endpoint, param) {
      if (this.neighborRoot === "") {
        throw new Error("Invalid usage: neighborRoot not set in constructor");
      }
      this.filter.push([endpoint, param, this.neighborRoot]);
      return this;
    }
  }, {
    key: "checkFilter",
    value: function checkFilter() {
      if (this.filter.length >= 2) {
        throw new _errors.BadRequestError("Too many filters specified", this.filter);
      }
      if (this.filter.length === 1) {
        var newSegment = this.originalSegments.concat(this.filter[0]);
        this.url.segment(newSegment);
      }
    }
  }, {
    key: "_requestFnForLink",
    value: function _requestFnForLink(link) {
      var _this3 = this;
      return _asyncToGenerator(_regenerator().m(function _callee() {
        var opts,
          uri,
          template,
          r,
          _args = arguments;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              opts = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
              if (link.templated) {
                template = (0, _URITemplate.default)(link.href);
                uri = (0, _urijs.default)(template.expand(opts));
              } else {
                uri = (0, _urijs.default)(link.href);
              }
              _context.n = 1;
              return _this3._sendNormalRequest(uri);
            case 1:
              r = _context.v;
              return _context.a(2, _this3._parseResponse(r));
          }
        }, _callee);
      }));
    }
  }, {
    key: "_parseRecord",
    value: function _parseRecord(json) {
      var _this4 = this;
      if (!json._links) {
        return json;
      }
      Object.keys(json._links).forEach(function (key) {
        var n = json._links[key];
        var included = false;
        if (typeof json[key] !== "undefined") {
          json["".concat(key, "_attr")] = json[key];
          included = true;
        }
        if (included && JOINABLE.indexOf(key) >= 0) {
          var record = _this4._parseRecord(json[key]);
          json[key] = _asyncToGenerator(_regenerator().m(function _callee2() {
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  return _context2.a(2, record);
              }
            }, _callee2);
          }));
        } else {
          json[key] = _this4._requestFnForLink(n);
        }
      });
      return json;
    }
  }, {
    key: "_sendNormalRequest",
    value: function () {
      var _sendNormalRequest2 = _asyncToGenerator(_regenerator().m(function _callee3(initialUrl) {
        var url;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              url = initialUrl;
              url = url.authority(this.url.authority()).protocol(this.url.protocol());
              return _context3.a(2, this.httpClient.get(url.toString()).then(function (response) {
                return response.data;
              }).catch(this._handleNetworkError));
          }
        }, _callee3, this);
      }));
      function _sendNormalRequest(_x) {
        return _sendNormalRequest2.apply(this, arguments);
      }
      return _sendNormalRequest;
    }()
  }, {
    key: "_parseResponse",
    value: function _parseResponse(json) {
      if (json._embedded && json._embedded.records) {
        return this._toCollectionPage(json);
      }
      return this._parseRecord(json);
    }
  }, {
    key: "_toCollectionPage",
    value: function _toCollectionPage(json) {
      var _this5 = this;
      for (var i = 0; i < json._embedded.records.length; i += 1) {
        json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
      }
      return {
        records: json._embedded.records,
        next: function () {
          var _next2 = _asyncToGenerator(_regenerator().m(function _callee4() {
            var r;
            return _regenerator().w(function (_context4) {
              while (1) switch (_context4.n) {
                case 0:
                  _context4.n = 1;
                  return _this5._sendNormalRequest((0, _urijs.default)(json._links.next.href));
                case 1:
                  r = _context4.v;
                  return _context4.a(2, _this5._toCollectionPage(r));
              }
            }, _callee4);
          }));
          function next() {
            return _next2.apply(this, arguments);
          }
          return next;
        }(),
        prev: function () {
          var _prev = _asyncToGenerator(_regenerator().m(function _callee5() {
            var r;
            return _regenerator().w(function (_context5) {
              while (1) switch (_context5.n) {
                case 0:
                  _context5.n = 1;
                  return _this5._sendNormalRequest((0, _urijs.default)(json._links.prev.href));
                case 1:
                  r = _context5.v;
                  return _context5.a(2, _this5._toCollectionPage(r));
              }
            }, _callee5);
          }));
          function prev() {
            return _prev.apply(this, arguments);
          }
          return prev;
        }()
      };
    }
  }, {
    key: "_handleNetworkError",
    value: (function () {
      var _handleNetworkError2 = _asyncToGenerator(_regenerator().m(function _callee6(error) {
        var _error$response$statu, _error$response$statu2;
        var _t;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              if (!(error.response && error.response.status)) {
                _context6.n = 4;
                break;
              }
              _t = error.response.status;
              _context6.n = _t === 404 ? 1 : 2;
              break;
            case 1:
              return _context6.a(2, Promise.reject(new _errors.NotFoundError((_error$response$statu = error.response.statusText) !== null && _error$response$statu !== void 0 ? _error$response$statu : "Not Found", error.response.data)));
            case 2:
              return _context6.a(2, Promise.reject(new _errors.NetworkError((_error$response$statu2 = error.response.statusText) !== null && _error$response$statu2 !== void 0 ? _error$response$statu2 : "Unknown", error.response.data)));
            case 3:
              _context6.n = 5;
              break;
            case 4:
              return _context6.a(2, Promise.reject(new Error(error.message)));
            case 5:
              return _context6.a(2);
          }
        }, _callee6);
      }));
      function _handleNetworkError(_x2) {
        return _handleNetworkError2.apply(this, arguments);
      }
      return _handleNetworkError;
    }())
  }]);
}();