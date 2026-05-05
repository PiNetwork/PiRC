"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientGenerator = void 0;
var _utils = require("./utils");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ClientGenerator = exports.ClientGenerator = function () {
  function ClientGenerator(spec) {
    _classCallCheck(this, ClientGenerator);
    this.spec = spec;
  }
  return _createClass(ClientGenerator, [{
    key: "generate",
    value: function generate() {
      var _this = this;
      var deployMethod = "";
      try {
        var constructorFunc = this.spec.getFunc("__constructor");
        deployMethod = this.generateDeployMethod(constructorFunc);
      } catch (_unused) {
        deployMethod = this.generateDeployMethod(undefined);
      }
      var interfaceMethods = this.spec.funcs().filter(function (func) {
        return func.name().toString() !== "__constructor";
      }).map(function (func) {
        return _this.generateInterfaceMethod(func);
      }).join("\n");
      var imports = this.generateImports();
      var specEntries = this.spec.entries.map(function (entry) {
        return "\"".concat(entry.toXDR("base64"), "\"");
      });
      var fromJSON = this.spec.funcs().filter(function (func) {
        return func.name().toString() !== "__constructor";
      }).map(function (func) {
        return _this.generateFromJSONMethod(func);
      }).join(",");
      return "".concat(imports, "\n\nexport interface Client {\n").concat(interfaceMethods, "\n}\n\nexport class Client extends ContractClient {\n  constructor(public readonly options: ContractClientOptions) {\n    super(\n      new Spec([").concat(specEntries.join(", "), "]),\n      options\n    );\n  }\n\n ").concat(deployMethod, "\n  public readonly fromJSON = {\n  ").concat(fromJSON, "\n  };\n}");
    }
  }, {
    key: "generateImports",
    value: function generateImports() {
      var imports = (0, _utils.generateTypeImports)(this.spec.funcs().flatMap(function (func) {
        var inputs = func.inputs();
        var outputs = func.outputs();
        var defs = inputs.map(function (input) {
          return input.type();
        }).concat(outputs);
        return defs;
      }));
      return (0, _utils.formatImports)(imports, {
        includeTypeFileImports: true,
        additionalStellarContractImports: ["Spec", "AssembledTransaction", "Client as ContractClient", "ClientOptions as ContractClientOptions", "MethodOptions"]
      });
    }
  }, {
    key: "generateInterfaceMethod",
    value: function generateInterfaceMethod(func) {
      var name = (0, _utils.sanitizeIdentifier)(func.name().toString());
      var inputs = func.inputs().map(function (input) {
        return {
          name: input.name().toString(),
          type: (0, _utils.parseTypeFromTypeDef)(input.type(), true)
        };
      });
      var outputType = func.outputs().length > 0 ? (0, _utils.parseTypeFromTypeDef)(func.outputs()[0]) : "void";
      var docs = (0, _utils.formatJSDocComment)(func.doc().toString(), 2);
      var params = this.formatMethodParameters(inputs);
      return "".concat(docs, "  ").concat(name, "(").concat(params, "): Promise<AssembledTransaction<").concat(outputType, ">>;");
    }
  }, {
    key: "generateFromJSONMethod",
    value: function generateFromJSONMethod(func) {
      var name = func.name().toString();
      var outputType = func.outputs().length > 0 ? (0, _utils.parseTypeFromTypeDef)(func.outputs()[0]) : "void";
      return "  ".concat(name, " : this.txFromJSON<").concat(outputType, ">");
    }
  }, {
    key: "generateDeployMethod",
    value: function generateDeployMethod(constructorFunc) {
      if (!constructorFunc) {
        var _params = this.formatConstructorParameters([]);
        return "  static deploy<T = Client>(".concat(_params, "): Promise<AssembledTransaction<T>> {\n    return ContractClient.deploy(null, options);\n  }");
      }
      var inputs = constructorFunc.inputs().map(function (input) {
        return {
          name: input.name().toString(),
          type: (0, _utils.parseTypeFromTypeDef)(input.type(), true)
        };
      });
      var params = this.formatConstructorParameters(inputs);
      var inputsDestructure = inputs.length > 0 ? "{ ".concat(inputs.map(function (i) {
        return i.name;
      }).join(", "), " }, ") : "";
      return "  static deploy<T = Client>(".concat(params, "): Promise<AssembledTransaction<T>> {\n    return ContractClient.deploy(").concat(inputsDestructure, "options);\n  }");
    }
  }, {
    key: "formatMethodParameters",
    value: function formatMethodParameters(inputs) {
      var params = [];
      if (inputs.length > 0) {
        var inputsParam = "{ ".concat(inputs.map(function (i) {
          return "".concat(i.name, ": ").concat(i.type);
        }).join("; "), " }");
        params.push("{ ".concat(inputs.map(function (i) {
          return i.name;
        }).join(", "), " }: ").concat(inputsParam));
      }
      params.push("options?: MethodOptions");
      return params.join(", ");
    }
  }, {
    key: "formatConstructorParameters",
    value: function formatConstructorParameters(inputs) {
      var params = [];
      if (inputs.length > 0) {
        var inputsParam = "{ ".concat(inputs.map(function (i) {
          return "".concat(i.name, ": ").concat(i.type);
        }).join("; "), " }");
        params.push("{ ".concat(inputs.map(function (i) {
          return i.name;
        }).join(", "), " }: ").concat(inputsParam));
      }
      params.push('options: MethodOptions & Omit<ContractClientOptions, \'contractId\'> & { wasmHash: Buffer | string; salt?: Buffer | Uint8Array; format?: "hex" | "base64"; address?: string; }');
      return params.join(", ");
    }
  }]);
}();