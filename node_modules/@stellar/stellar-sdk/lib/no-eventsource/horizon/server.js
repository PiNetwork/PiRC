"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SUBMIT_TRANSACTION_TIMEOUT = exports.HorizonServer = void 0;
var _bignumber = _interopRequireDefault(require("bignumber.js"));
var _stellarBase = require("@stellar/stellar-base");
var _urijs = _interopRequireDefault(require("urijs"));
var _call_builder = require("./call_builder");
var _config = require("../config");
var _errors = require("../errors");
var _account_call_builder = require("./account_call_builder");
var _account_response = require("./account_response");
var _assets_call_builder = require("./assets_call_builder");
var _claimable_balances_call_builder = require("./claimable_balances_call_builder");
var _effect_call_builder = require("./effect_call_builder");
var _friendbot_builder = require("./friendbot_builder");
var _ledger_call_builder = require("./ledger_call_builder");
var _liquidity_pool_call_builder = require("./liquidity_pool_call_builder");
var _offer_call_builder = require("./offer_call_builder");
var _operation_call_builder = require("./operation_call_builder");
var _orderbook_call_builder = require("./orderbook_call_builder");
var _payment_call_builder = require("./payment_call_builder");
var _strict_receive_path_call_builder = require("./strict_receive_path_call_builder");
var _strict_send_path_call_builder = require("./strict_send_path_call_builder");
var _trade_aggregation_call_builder = require("./trade_aggregation_call_builder");
var _trades_call_builder = require("./trades_call_builder");
var _transaction_call_builder = require("./transaction_call_builder");
var _horizon_axios_client = require("./horizon_axios_client");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
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
var STROOPS_IN_LUMEN = 10000000;
var ACCOUNT_REQUIRES_MEMO = "MQ==";
function getAmountInLumens(amt) {
  return new _bignumber.default(amt).div(STROOPS_IN_LUMEN).toString();
}
var HorizonServer = exports.HorizonServer = function () {
  function HorizonServer(serverURL) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, HorizonServer);
    this.serverURL = (0, _urijs.default)(serverURL);
    var allowHttp = typeof opts.allowHttp === "undefined" ? _config.Config.isAllowHttp() : opts.allowHttp;
    var customHeaders = {};
    if (opts.appName) {
      customHeaders["X-App-Name"] = opts.appName;
    }
    if (opts.appVersion) {
      customHeaders["X-App-Version"] = opts.appVersion;
    }
    if (opts.authToken) {
      customHeaders["X-Auth-Token"] = opts.authToken;
    }
    if (opts.headers) {
      Object.assign(customHeaders, opts.headers);
    }
    this.httpClient = (0, _horizon_axios_client.createHttpClient)(customHeaders);
    if (this.serverURL.protocol() !== "https" && !allowHttp) {
      throw new Error("Cannot connect to insecure horizon server");
    }
  }
  return _createClass(HorizonServer, [{
    key: "fetchTimebounds",
    value: (function () {
      var _fetchTimebounds = _asyncToGenerator(_regenerator().m(function _callee(seconds) {
        var _isRetry,
          currentTime,
          _args = arguments;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _isRetry = _args.length > 1 && _args[1] !== undefined ? _args[1] : false;
              currentTime = (0, _horizon_axios_client.getCurrentServerTime)(this.serverURL.hostname());
              if (!currentTime) {
                _context.n = 1;
                break;
              }
              return _context.a(2, {
                minTime: 0,
                maxTime: currentTime + seconds
              });
            case 1:
              if (!_isRetry) {
                _context.n = 2;
                break;
              }
              return _context.a(2, {
                minTime: 0,
                maxTime: Math.floor(new Date().getTime() / 1000) + seconds
              });
            case 2:
              _context.n = 3;
              return this.httpClient.get(this.serverURL.toString());
            case 3:
              return _context.a(2, this.fetchTimebounds(seconds, true));
          }
        }, _callee, this);
      }));
      function fetchTimebounds(_x) {
        return _fetchTimebounds.apply(this, arguments);
      }
      return fetchTimebounds;
    }())
  }, {
    key: "fetchBaseFee",
    value: (function () {
      var _fetchBaseFee = _asyncToGenerator(_regenerator().m(function _callee2() {
        var response;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return this.feeStats();
            case 1:
              response = _context2.v;
              return _context2.a(2, parseInt(response.last_ledger_base_fee, 10) || 100);
          }
        }, _callee2, this);
      }));
      function fetchBaseFee() {
        return _fetchBaseFee.apply(this, arguments);
      }
      return fetchBaseFee;
    }())
  }, {
    key: "feeStats",
    value: (function () {
      var _feeStats = _asyncToGenerator(_regenerator().m(function _callee3() {
        var cb;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              cb = new _call_builder.CallBuilder(this.serverURL, this.httpClient);
              cb.filter.push(["fee_stats"]);
              return _context3.a(2, cb.call());
          }
        }, _callee3, this);
      }));
      function feeStats() {
        return _feeStats.apply(this, arguments);
      }
      return feeStats;
    }())
  }, {
    key: "root",
    value: (function () {
      var _root = _asyncToGenerator(_regenerator().m(function _callee4() {
        var cb;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              cb = new _call_builder.CallBuilder(this.serverURL, this.httpClient);
              return _context4.a(2, cb.call());
          }
        }, _callee4, this);
      }));
      function root() {
        return _root.apply(this, arguments);
      }
      return root;
    }())
  }, {
    key: "submitTransaction",
    value: (function () {
      var _submitTransaction = _asyncToGenerator(_regenerator().m(function _callee5(transaction) {
        var opts,
          tx,
          _args5 = arguments;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              opts = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : {
                skipMemoRequiredCheck: false
              };
              if (opts.skipMemoRequiredCheck) {
                _context5.n = 1;
                break;
              }
              _context5.n = 1;
              return this.checkMemoRequired(transaction);
            case 1:
              tx = encodeURIComponent(transaction.toEnvelope().toXDR().toString("base64"));
              return _context5.a(2, this.httpClient.post(this.serverURL.clone().segment("transactions").toString(), "tx=".concat(tx), {
                timeout: SUBMIT_TRANSACTION_TIMEOUT,
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded"
                }
              }).then(function (response) {
                if (!response.data.result_xdr) {
                  return response.data;
                }
                var responseXDR = _stellarBase.xdr.TransactionResult.fromXDR(response.data.result_xdr, "base64");
                var results = responseXDR.result().value();
                var offerResults;
                var hasManageOffer;
                if (results.length) {
                  offerResults = results.map(function (result, i) {
                    if (result.value().switch().name !== "manageBuyOffer" && result.value().switch().name !== "manageSellOffer") {
                      return null;
                    }
                    hasManageOffer = true;
                    var amountBought = new _bignumber.default(0);
                    var amountSold = new _bignumber.default(0);
                    var offerSuccess = result.value().value().success();
                    var offersClaimed = offerSuccess.offersClaimed().map(function (offerClaimedAtom) {
                      var offerClaimed = offerClaimedAtom.value();
                      var sellerId = "";
                      switch (offerClaimedAtom.switch()) {
                        case _stellarBase.xdr.ClaimAtomType.claimAtomTypeV0():
                          sellerId = _stellarBase.StrKey.encodeEd25519PublicKey(offerClaimed.sellerEd25519());
                          break;
                        case _stellarBase.xdr.ClaimAtomType.claimAtomTypeOrderBook():
                          sellerId = _stellarBase.StrKey.encodeEd25519PublicKey(offerClaimed.sellerId().ed25519());
                          break;
                        default:
                          throw new Error("Invalid offer result type: ".concat(offerClaimedAtom.switch()));
                      }
                      var claimedOfferAmountBought = new _bignumber.default(offerClaimed.amountBought().toString());
                      var claimedOfferAmountSold = new _bignumber.default(offerClaimed.amountSold().toString());
                      amountBought = amountBought.plus(claimedOfferAmountSold);
                      amountSold = amountSold.plus(claimedOfferAmountBought);
                      var sold = _stellarBase.Asset.fromOperation(offerClaimed.assetSold());
                      var bought = _stellarBase.Asset.fromOperation(offerClaimed.assetBought());
                      var assetSold = {
                        type: sold.getAssetType(),
                        assetCode: sold.getCode(),
                        issuer: sold.getIssuer()
                      };
                      var assetBought = {
                        type: bought.getAssetType(),
                        assetCode: bought.getCode(),
                        issuer: bought.getIssuer()
                      };
                      return {
                        sellerId: sellerId,
                        offerId: offerClaimed.offerId().toString(),
                        assetSold: assetSold,
                        amountSold: getAmountInLumens(claimedOfferAmountSold),
                        assetBought: assetBought,
                        amountBought: getAmountInLumens(claimedOfferAmountBought)
                      };
                    });
                    var effect = offerSuccess.offer().switch().name;
                    var currentOffer;
                    if (typeof offerSuccess.offer().value === "function" && offerSuccess.offer().value()) {
                      var offerXDR = offerSuccess.offer().value();
                      currentOffer = {
                        offerId: offerXDR.offerId().toString(),
                        selling: {},
                        buying: {},
                        amount: getAmountInLumens(offerXDR.amount().toString()),
                        price: {
                          n: offerXDR.price().n(),
                          d: offerXDR.price().d()
                        }
                      };
                      var selling = _stellarBase.Asset.fromOperation(offerXDR.selling());
                      currentOffer.selling = {
                        type: selling.getAssetType(),
                        assetCode: selling.getCode(),
                        issuer: selling.getIssuer()
                      };
                      var buying = _stellarBase.Asset.fromOperation(offerXDR.buying());
                      currentOffer.buying = {
                        type: buying.getAssetType(),
                        assetCode: buying.getCode(),
                        issuer: buying.getIssuer()
                      };
                    }
                    return {
                      offersClaimed: offersClaimed,
                      effect: effect,
                      operationIndex: i,
                      currentOffer: currentOffer,
                      amountBought: getAmountInLumens(amountBought),
                      amountSold: getAmountInLumens(amountSold),
                      isFullyOpen: !offersClaimed.length && effect !== "manageOfferDeleted",
                      wasPartiallyFilled: !!offersClaimed.length && effect !== "manageOfferDeleted",
                      wasImmediatelyFilled: !!offersClaimed.length && effect === "manageOfferDeleted",
                      wasImmediatelyDeleted: !offersClaimed.length && effect === "manageOfferDeleted"
                    };
                  }).filter(function (result) {
                    return !!result;
                  });
                }
                return _objectSpread(_objectSpread({}, response.data), {}, {
                  offerResults: hasManageOffer ? offerResults : undefined
                });
              }).catch(function (response) {
                if (response instanceof Error) {
                  return Promise.reject(response);
                }
                return Promise.reject(new _errors.BadResponseError("Transaction submission failed. Server responded: ".concat(response.status, " ").concat(response.statusText), response.data));
              }));
          }
        }, _callee5, this);
      }));
      function submitTransaction(_x2) {
        return _submitTransaction.apply(this, arguments);
      }
      return submitTransaction;
    }())
  }, {
    key: "submitAsyncTransaction",
    value: (function () {
      var _submitAsyncTransaction = _asyncToGenerator(_regenerator().m(function _callee6(transaction) {
        var opts,
          tx,
          _args6 = arguments;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              opts = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {
                skipMemoRequiredCheck: false
              };
              if (opts.skipMemoRequiredCheck) {
                _context6.n = 1;
                break;
              }
              _context6.n = 1;
              return this.checkMemoRequired(transaction);
            case 1:
              tx = encodeURIComponent(transaction.toEnvelope().toXDR().toString("base64"));
              return _context6.a(2, this.httpClient.post(this.serverURL.clone().segment("transactions_async").toString(), "tx=".concat(tx), {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded"
                }
              }).then(function (response) {
                return response.data;
              }).catch(function (response) {
                if (response instanceof Error) {
                  return Promise.reject(response);
                }
                return Promise.reject(new _errors.BadResponseError("Transaction submission failed. Server responded: ".concat(response.status, " ").concat(response.statusText), response.data));
              }));
          }
        }, _callee6, this);
      }));
      function submitAsyncTransaction(_x3) {
        return _submitAsyncTransaction.apply(this, arguments);
      }
      return submitAsyncTransaction;
    }())
  }, {
    key: "accounts",
    value: function accounts() {
      return new _account_call_builder.AccountCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "claimableBalances",
    value: function claimableBalances() {
      return new _claimable_balances_call_builder.ClaimableBalanceCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "ledgers",
    value: function ledgers() {
      return new _ledger_call_builder.LedgerCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "transactions",
    value: function transactions() {
      return new _transaction_call_builder.TransactionCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "offers",
    value: function offers() {
      return new _offer_call_builder.OfferCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "orderbook",
    value: function orderbook(selling, buying) {
      return new _orderbook_call_builder.OrderbookCallBuilder(this.serverURL, this.httpClient, selling, buying);
    }
  }, {
    key: "trades",
    value: function trades() {
      return new _trades_call_builder.TradesCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "operations",
    value: function operations() {
      return new _operation_call_builder.OperationCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "liquidityPools",
    value: function liquidityPools() {
      return new _liquidity_pool_call_builder.LiquidityPoolCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "strictReceivePaths",
    value: function strictReceivePaths(source, destinationAsset, destinationAmount) {
      return new _strict_receive_path_call_builder.StrictReceivePathCallBuilder(this.serverURL, this.httpClient, source, destinationAsset, destinationAmount);
    }
  }, {
    key: "strictSendPaths",
    value: function strictSendPaths(sourceAsset, sourceAmount, destination) {
      return new _strict_send_path_call_builder.StrictSendPathCallBuilder(this.serverURL, this.httpClient, sourceAsset, sourceAmount, destination);
    }
  }, {
    key: "payments",
    value: function payments() {
      return new _payment_call_builder.PaymentCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "effects",
    value: function effects() {
      return new _effect_call_builder.EffectCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "friendbot",
    value: function friendbot(address) {
      return new _friendbot_builder.FriendbotBuilder(this.serverURL, this.httpClient, address);
    }
  }, {
    key: "assets",
    value: function assets() {
      return new _assets_call_builder.AssetsCallBuilder(this.serverURL, this.httpClient);
    }
  }, {
    key: "loadAccount",
    value: (function () {
      var _loadAccount = _asyncToGenerator(_regenerator().m(function _callee7(accountId) {
        var res;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              _context7.n = 1;
              return this.accounts().accountId(accountId).call();
            case 1:
              res = _context7.v;
              return _context7.a(2, new _account_response.AccountResponse(res));
          }
        }, _callee7, this);
      }));
      function loadAccount(_x4) {
        return _loadAccount.apply(this, arguments);
      }
      return loadAccount;
    }())
  }, {
    key: "tradeAggregation",
    value: function tradeAggregation(base, counter, start_time, end_time, resolution, offset) {
      return new _trade_aggregation_call_builder.TradeAggregationCallBuilder(this.serverURL, this.httpClient, base, counter, start_time, end_time, resolution, offset);
    }
  }, {
    key: "checkMemoRequired",
    value: (function () {
      var _checkMemoRequired = _asyncToGenerator(_regenerator().m(function _callee8(transaction) {
        var destinations, i, operation, destination, account, _t, _t2;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.p = _context8.n) {
            case 0:
              if (transaction instanceof _stellarBase.FeeBumpTransaction) {
                transaction = transaction.innerTransaction;
              }
              if (!(transaction.memo.type !== "none")) {
                _context8.n = 1;
                break;
              }
              return _context8.a(2);
            case 1:
              destinations = new Set();
              i = 0;
            case 2:
              if (!(i < transaction.operations.length)) {
                _context8.n = 14;
                break;
              }
              operation = transaction.operations[i];
              _t = operation.type;
              _context8.n = _t === "payment" ? 3 : _t === "pathPaymentStrictReceive" ? 3 : _t === "pathPaymentStrictSend" ? 3 : _t === "accountMerge" ? 3 : 4;
              break;
            case 3:
              return _context8.a(3, 5);
            case 4:
              return _context8.a(3, 13);
            case 5:
              destination = operation.destination;
              if (!destinations.has(destination)) {
                _context8.n = 6;
                break;
              }
              return _context8.a(3, 13);
            case 6:
              destinations.add(destination);
              if (!destination.startsWith("M")) {
                _context8.n = 7;
                break;
              }
              return _context8.a(3, 13);
            case 7:
              _context8.p = 7;
              _context8.n = 8;
              return this.loadAccount(destination);
            case 8:
              account = _context8.v;
              if (!(account.data_attr["config.memo_required"] === ACCOUNT_REQUIRES_MEMO)) {
                _context8.n = 9;
                break;
              }
              throw new _errors.AccountRequiresMemoError("account requires memo", destination, i);
            case 9:
              _context8.n = 13;
              break;
            case 10:
              _context8.p = 10;
              _t2 = _context8.v;
              if (!(_t2 instanceof _errors.AccountRequiresMemoError)) {
                _context8.n = 11;
                break;
              }
              throw _t2;
            case 11:
              if (_t2 instanceof _errors.NotFoundError) {
                _context8.n = 12;
                break;
              }
              throw _t2;
            case 12:
              return _context8.a(3, 13);
            case 13:
              i += 1;
              _context8.n = 2;
              break;
            case 14:
              return _context8.a(2);
          }
        }, _callee8, this, [[7, 10]]);
      }));
      function checkMemoRequired(_x5) {
        return _checkMemoRequired.apply(this, arguments);
      }
      return checkMemoRequired;
    }())
  }]);
}();