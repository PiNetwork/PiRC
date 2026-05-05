"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGenerator = createGenerator;
exports.deriveContractName = deriveContractName;
exports.generateAndWrite = generateAndWrite;
exports.logSourceInfo = logSourceInfo;
exports.writeBindings = writeBindings;
var fs = _interopRequireWildcard(require("fs/promises"));
var path = _interopRequireWildcard(require("path"));
var _generator = require("../bindings/generator");
var _bindings = require("../bindings");
var _server = require("../rpc/server");
var _excluded = ["outputDir", "overwrite"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t4 in e) "default" !== _t4 && {}.hasOwnProperty.call(e, _t4) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t4)) && (i.get || i.set) ? o(f, _t4, i) : f[_t4] = e[_t4]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function verifyNetwork(_x, _x2) {
  return _verifyNetwork.apply(this, arguments);
}
function _verifyNetwork() {
  _verifyNetwork = _asyncToGenerator(_regenerator().m(function _callee(server, expectedPassphrase) {
    var networkResponse;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return server.getNetwork();
        case 1:
          networkResponse = _context.v;
          if (!(networkResponse.passphrase !== expectedPassphrase)) {
            _context.n = 2;
            break;
          }
          throw new _bindings.WasmFetchError("Network mismatch: expected \"".concat(expectedPassphrase, "\", got \"").concat(networkResponse.passphrase, "\""));
        case 2:
          return _context.a(2);
      }
    }, _callee);
  }));
  return _verifyNetwork.apply(this, arguments);
}
function createGenerator(_x3) {
  return _createGenerator.apply(this, arguments);
}
function _createGenerator() {
  _createGenerator = _asyncToGenerator(_regenerator().m(function _callee2(args) {
    var sources, wasmBuffer, server, generator, _t, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          sources = [args.wasm, args.wasmHash, args.contractId].filter(Boolean);
          if (!(sources.length === 0)) {
            _context2.n = 1;
            break;
          }
          throw new _bindings.WasmFetchError("Must provide one of: --wasm, --wasm-hash, or --contract-id");
        case 1:
          if (!(sources.length > 1)) {
            _context2.n = 2;
            break;
          }
          throw new _bindings.WasmFetchError("Must provide only one of: --wasm, --wasm-hash, or --contract-id");
        case 2:
          if (!args.wasm) {
            _context2.n = 4;
            break;
          }
          _context2.n = 3;
          return fs.readFile(args.wasm);
        case 3:
          wasmBuffer = _context2.v;
          return _context2.a(2, {
            generator: _generator.BindingGenerator.fromWasm(wasmBuffer),
            source: {
              type: "file",
              path: args.wasm
            }
          });
        case 4:
          if (args.rpcUrl) {
            _context2.n = 5;
            break;
          }
          throw new _bindings.WasmFetchError("--rpc-url is required when fetching from network");
        case 5:
          if (args.networkPassphrase) {
            _context2.n = 6;
            break;
          }
          throw new _bindings.WasmFetchError("--network is required when fetching from network");
        case 6:
          server = new _server.RpcServer(args.rpcUrl, args.serverOptions);
          _context2.n = 7;
          return verifyNetwork(server, args.networkPassphrase);
        case 7:
          if (!args.wasmHash) {
            _context2.n = 9;
            break;
          }
          _context2.n = 8;
          return _generator.BindingGenerator.fromWasmHash(args.wasmHash, server);
        case 8:
          _t = _context2.v;
          _t2 = {
            type: "wasm-hash",
            hash: args.wasmHash,
            rpcUrl: args.rpcUrl,
            network: args.networkPassphrase
          };
          return _context2.a(2, {
            generator: _t,
            source: _t2
          });
        case 9:
          if (!args.contractId) {
            _context2.n = 11;
            break;
          }
          _context2.n = 10;
          return _generator.BindingGenerator.fromContractId(args.contractId, server);
        case 10:
          generator = _context2.v;
          return _context2.a(2, {
            generator: generator,
            source: {
              type: "contract-id",
              contractId: args.contractId,
              rpcUrl: args.rpcUrl,
              network: args.networkPassphrase
            }
          });
        case 11:
          throw new _bindings.WasmFetchError("Invalid arguments");
        case 12:
          return _context2.a(2);
      }
    }, _callee2);
  }));
  return _createGenerator.apply(this, arguments);
}
function writeBindings(_x4, _x5, _x6) {
  return _writeBindings.apply(this, arguments);
}
function _writeBindings() {
  _writeBindings = _asyncToGenerator(_regenerator().m(function _callee3(outputDir, bindings, overwrite) {
    var stat, writes, _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          _context3.p = 0;
          _context3.n = 1;
          return fs.stat(outputDir);
        case 1:
          stat = _context3.v;
          if (!stat.isFile()) {
            _context3.n = 2;
            break;
          }
          throw new Error("Output path is a file: ".concat(outputDir));
        case 2:
          if (overwrite) {
            _context3.n = 3;
            break;
          }
          throw new Error("Directory exists (use --overwrite): ".concat(outputDir));
        case 3:
          _context3.n = 4;
          return fs.rm(outputDir, {
            recursive: true,
            force: true
          });
        case 4:
          _context3.n = 6;
          break;
        case 5:
          _context3.p = 5;
          _t3 = _context3.v;
          if (!(_t3.code !== "ENOENT")) {
            _context3.n = 6;
            break;
          }
          throw _t3;
        case 6:
          _context3.n = 7;
          return fs.mkdir(path.join(outputDir, "src"), {
            recursive: true
          });
        case 7:
          writes = [fs.writeFile(path.join(outputDir, "src/index.ts"), bindings.index), fs.writeFile(path.join(outputDir, "src/client.ts"), bindings.client), fs.writeFile(path.join(outputDir, ".gitignore"), bindings.gitignore), fs.writeFile(path.join(outputDir, "README.md"), bindings.readme), fs.writeFile(path.join(outputDir, "package.json"), bindings.packageJson), fs.writeFile(path.join(outputDir, "tsconfig.json"), bindings.tsConfig)];
          if (bindings.types.trim()) {
            writes.push(fs.writeFile(path.join(outputDir, "src/types.ts"), bindings.types));
          }
          _context3.n = 8;
          return Promise.all(writes);
        case 8:
          return _context3.a(2);
      }
    }, _callee3, null, [[0, 5]]);
  }));
  return _writeBindings.apply(this, arguments);
}
function generateAndWrite(_x7, _x8) {
  return _generateAndWrite.apply(this, arguments);
}
function _generateAndWrite() {
  _generateAndWrite = _asyncToGenerator(_regenerator().m(function _callee4(generator, options) {
    var outputDir, _options$overwrite, overwrite, genOptions, bindings;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          outputDir = options.outputDir, _options$overwrite = options.overwrite, overwrite = _options$overwrite === void 0 ? false : _options$overwrite, genOptions = _objectWithoutProperties(options, _excluded);
          bindings = generator.generate(genOptions);
          _context4.n = 1;
          return writeBindings(outputDir, bindings, overwrite);
        case 1:
          return _context4.a(2);
      }
    }, _callee4);
  }));
  return _generateAndWrite.apply(this, arguments);
}
function logSourceInfo(source) {
  console.log("\nSource:");
  switch (source.type) {
    case "file":
      console.log("  Type: Local file");
      console.log("  Path: ".concat(source.path));
      break;
    case "wasm-hash":
      console.log("  Type: WASM hash");
      console.log("  Hash: ".concat(source.hash));
      console.log("  RPC: ".concat(source.rpcUrl));
      console.log("  Network: ".concat(source.network));
      break;
    case "contract-id":
      console.log("  Type: Contract ID");
      console.log("  Address: ".concat(source.contractId));
      console.log("  RPC: ".concat(source.rpcUrl));
      console.log("  Network: ".concat(source.network));
      break;
  }
}
function deriveContractName(source) {
  if (source.type !== "file") return null;
  return path.basename(source.path, path.extname(source.path)).replace(/([a-z])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}