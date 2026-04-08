"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contractErrorPattern = void 0;
exports.getAccount = getAccount;
exports.implementsToString = implementsToString;
exports.parseWasmCustomSections = parseWasmCustomSections;
exports.processSpecEntryStream = processSpecEntryStream;
exports.withExponentialBackoff = withExponentialBackoff;
var _stellarBase = require("@stellar/stellar-base");
var _types = require("./types");
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function withExponentialBackoff(_x, _x2, _x3) {
  return _withExponentialBackoff.apply(this, arguments);
}
function _withExponentialBackoff() {
  _withExponentialBackoff = _asyncToGenerator(_regenerator().m(function _callee(fn, keepWaitingIf, timeoutInSeconds) {
    var exponentialFactor,
      verbose,
      attempts,
      count,
      waitUntil,
      waitTime,
      totalWaitTime,
      _args = arguments,
      _t,
      _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          exponentialFactor = _args.length > 3 && _args[3] !== undefined ? _args[3] : 1.5;
          verbose = _args.length > 4 && _args[4] !== undefined ? _args[4] : false;
          attempts = [];
          count = 0;
          _t = attempts;
          _context.n = 1;
          return fn();
        case 1:
          _t.push.call(_t, _context.v);
          if (keepWaitingIf(attempts[attempts.length - 1])) {
            _context.n = 2;
            break;
          }
          return _context.a(2, attempts);
        case 2:
          waitUntil = new Date(Date.now() + timeoutInSeconds * 1000).valueOf();
          waitTime = 1000;
          totalWaitTime = waitTime;
        case 3:
          if (!(Date.now() < waitUntil && keepWaitingIf(attempts[attempts.length - 1]))) {
            _context.n = 6;
            break;
          }
          count += 1;
          if (verbose) {
            console.info("Waiting ".concat(waitTime, "ms before trying again (bringing the total wait time to ").concat(totalWaitTime, "ms so far, of total ").concat(timeoutInSeconds * 1000, "ms)"));
          }
          _context.n = 4;
          return new Promise(function (res) {
            return setTimeout(res, waitTime);
          });
        case 4:
          waitTime *= exponentialFactor;
          if (new Date(Date.now() + waitTime).valueOf() > waitUntil) {
            waitTime = waitUntil - Date.now();
            if (verbose) {
              console.info("was gonna wait too long; new waitTime: ".concat(waitTime, "ms"));
            }
          }
          totalWaitTime = waitTime + totalWaitTime;
          _t2 = attempts;
          _context.n = 5;
          return fn(attempts[attempts.length - 1]);
        case 5:
          _t2.push.call(_t2, _context.v);
          if (verbose && keepWaitingIf(attempts[attempts.length - 1])) {
            console.info("".concat(count, ". Called ").concat(fn, "; ").concat(attempts.length, " prev attempts. Most recent: ").concat(JSON.stringify(attempts[attempts.length - 1], null, 2)));
          }
          _context.n = 3;
          break;
        case 6:
          return _context.a(2, attempts);
      }
    }, _callee);
  }));
  return _withExponentialBackoff.apply(this, arguments);
}
var contractErrorPattern = exports.contractErrorPattern = /Error\(Contract, #(\d+)\)/;
function implementsToString(obj) {
  return _typeof(obj) === "object" && obj !== null && "toString" in obj;
}
function parseWasmCustomSections(buffer) {
  var sections = new Map();
  var arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  var offset = 0;
  var read = function read(length) {
    if (offset + length > buffer.byteLength) throw new Error("Buffer overflow");
    var bytes = new Uint8Array(arrayBuffer, offset, length);
    offset += length;
    return bytes;
  };
  function readVarUint32() {
    var value = 0;
    var shift = 0;
    while (true) {
      var byte = read(1)[0];
      value |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) break;
      if ((shift += 7) >= 32) throw new Error("Invalid WASM value");
    }
    return value >>> 0;
  }
  if (_toConsumableArray(read(4)).join() !== "0,97,115,109") throw new Error("Invalid WASM magic");
  if (_toConsumableArray(read(4)).join() !== "1,0,0,0") throw new Error("Invalid WASM version");
  while (offset < buffer.byteLength) {
    var sectionId = read(1)[0];
    var sectionLength = readVarUint32();
    var start = offset;
    if (sectionId === 0) {
      var nameLen = readVarUint32();
      if (nameLen === 0 || offset + nameLen > start + sectionLength) continue;
      var nameBytes = read(nameLen);
      var payload = read(sectionLength - (offset - start));
      try {
        var name = new TextDecoder("utf-8", {
          fatal: true
        }).decode(nameBytes);
        if (payload.length > 0) {
          sections.set(name, (sections.get(name) || []).concat(payload));
        }
      } catch (_unused) {}
    } else {
      offset += sectionLength;
    }
  }
  return sections;
}
function processSpecEntryStream(buffer) {
  var reader = new _stellarBase.cereal.XdrReader(buffer);
  var res = [];
  while (!reader.eof) {
    res.push(_stellarBase.xdr.ScSpecEntry.read(reader));
  }
  return res;
}
function getAccount(_x4, _x5) {
  return _getAccount.apply(this, arguments);
}
function _getAccount() {
  _getAccount = _asyncToGenerator(_regenerator().m(function _callee2(options, server) {
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          return _context2.a(2, options.publicKey ? server.getAccount(options.publicKey) : new _stellarBase.Account(_types.NULL_ACCOUNT, "0"));
      }
    }, _callee2);
  }));
  return _getAccount.apply(this, arguments);
}