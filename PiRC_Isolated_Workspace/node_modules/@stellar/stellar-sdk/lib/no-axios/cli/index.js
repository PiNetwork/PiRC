"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runCli = runCli;
var _commander = require("commander");
var path = _interopRequireWildcard(require("path"));
var _wasm_fetcher = require("../bindings/wasm_fetcher");
var _util = require("./util");
var _stellarBase = require("@stellar/stellar-base");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t3 in e) "default" !== _t3 && {}.hasOwnProperty.call(e, _t3) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t3)) && (i.get || i.set) ? o(f, _t3, i) : f[_t3] = e[_t3]); return f; })(e, t); }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var NETWORK_CONFIG = {
  testnet: {
    passphrase: _stellarBase.Networks.TESTNET,
    rpcUrl: "https://soroban-testnet.stellar.org"
  },
  mainnet: {
    passphrase: _stellarBase.Networks.PUBLIC,
    rpcUrl: null
  },
  futurenet: {
    passphrase: _stellarBase.Networks.FUTURENET,
    rpcUrl: "https://rpc-futurenet.stellar.org"
  },
  localnet: {
    passphrase: _stellarBase.Networks.STANDALONE,
    rpcUrl: "http://localhost:8000/rpc"
  }
};
function runCli() {
  var program = new _commander.Command();
  program.name("stellar-cli").description("CLI for generating TypeScript bindings for Stellar contracts").version("1.0.0");
  program.command("generate").description("Generate TypeScript bindings for a Stellar contract").helpOption("-h, --help", "Display help for command").option("--wasm <path>", "Path to local WASM file").option("--wasm-hash <hash>", "Hash of WASM blob on network").option("--contract-id <id>", "Contract ID on network").option("--rpc-url <url>", "RPC server URL").option("--network <network>", "Network options to use: mainnet, testnet, futurenet, or localnet").option("--output-dir <dir>", "Output directory for generated bindings").option("--allow-http", "Allow insecure HTTP connections to RPC server", false).option("--timeout <ms>", "RPC request timeout in milliseconds").option("--headers <json>", 'Custom headers as JSON object (e.g., \'{"Authorization": "Bearer token"}\')').option("--contract-name <name>", "Name for the generated contract client class").option("--overwrite", "Overwrite existing files", false).action(function () {
    var _ref = _asyncToGenerator(_regenerator().m(function _callee(options) {
      var networkPassphrase, rpcUrl, allowHttp, network, config, needsRpcUrl, headers, timeout, _yield$createGenerato, generator, source, contractName, _t, _t2;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            _context.p = 0;
            rpcUrl = options.rpcUrl;
            allowHttp = options.allowHttp;
            if (!options.network) {
              _context.n = 3;
              break;
            }
            network = options.network.toLowerCase();
            config = NETWORK_CONFIG[network];
            if (config) {
              _context.n = 1;
              break;
            }
            throw new Error("\n\u2717 Invalid network: ".concat(options.network, ". Must be mainnet, testnet, futurenet, or localnet"));
          case 1:
            networkPassphrase = config.passphrase;
            needsRpcUrl = options.wasmHash || options.contractId;
            if (!(!rpcUrl && needsRpcUrl)) {
              _context.n = 3;
              break;
            }
            if (!config.rpcUrl) {
              _context.n = 2;
              break;
            }
            rpcUrl = config.rpcUrl;
            console.log("Using default RPC URL for ".concat(network, ": ").concat(rpcUrl));
            if (network === "localnet" && !options.allowHttp) {
              allowHttp = true;
            }
            _context.n = 3;
            break;
          case 2:
            if (!(network === "mainnet")) {
              _context.n = 3;
              break;
            }
            throw new Error("\n\u2717 --rpc-url is required for mainnet. Find RPC providers at: https://developers.stellar.org/docs/data/rpc/rpc-providers");
          case 3:
            if (!(options.outputDir === undefined)) {
              _context.n = 4;
              break;
            }
            throw new Error("Output directory (--output-dir) is required");
          case 4:
            if (!options.headers) {
              _context.n = 7;
              break;
            }
            _context.p = 5;
            headers = JSON.parse(options.headers);
            _context.n = 7;
            break;
          case 6:
            _context.p = 6;
            _t = _context.v;
            throw new Error("Invalid JSON for --headers: ".concat(options.headers));
          case 7:
            if (!options.timeout) {
              _context.n = 8;
              break;
            }
            timeout = parseInt(options.timeout, 10);
            if (!(Number.isNaN(timeout) || timeout <= 0)) {
              _context.n = 8;
              break;
            }
            throw new Error("Invalid timeout value: ".concat(options.timeout, ". Must be a positive integer."));
          case 8:
            console.log("Fetching contract...");
            _context.n = 9;
            return (0, _util.createGenerator)({
              wasm: options.wasm,
              wasmHash: options.wasmHash,
              contractId: options.contractId,
              rpcUrl: rpcUrl,
              networkPassphrase: networkPassphrase,
              serverOptions: {
                allowHttp: allowHttp,
                timeout: timeout,
                headers: headers
              }
            });
          case 9:
            _yield$createGenerato = _context.v;
            generator = _yield$createGenerato.generator;
            source = _yield$createGenerato.source;
            (0, _util.logSourceInfo)(source);
            contractName = options.contractName || (0, _util.deriveContractName)(source) || "contract";
            console.log("\n\u2713 Generating TypeScript bindings for \"".concat(contractName, "\"..."));
            _context.n = 10;
            return (0, _util.generateAndWrite)(generator, {
              contractName: contractName,
              outputDir: path.resolve(options.outputDir),
              overwrite: options.overwrite
            });
          case 10:
            console.log("\n\u2713 Successfully generated bindings in ".concat(options.outputDir));
            console.log("\nUsage:");
            console.log("  import { Client } from './".concat(path.basename(options.outputDir), "';"));
            _context.n = 12;
            break;
          case 11:
            _context.p = 11;
            _t2 = _context.v;
            if (_t2 instanceof _wasm_fetcher.WasmFetchError) {
              console.error("\n\u2717 Error: ".concat(_t2.message));
              if (_t2.cause) {
                console.error("  Caused by: ".concat(_t2.cause.message));
              }
            } else if (_t2 instanceof Error) {
              console.error("\n\u2717 Error: ".concat(_t2.message));
            } else {
              console.error("\n\u2717 Unexpected error:", _t2);
            }
            process.exit(1);
          case 12:
            return _context.a(2);
        }
      }, _callee, null, [[5, 6], [0, 11]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  program.parse();
}