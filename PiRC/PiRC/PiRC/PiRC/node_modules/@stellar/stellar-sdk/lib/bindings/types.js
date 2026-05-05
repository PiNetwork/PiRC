"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeGenerator = void 0;
var _stellarBase = require("@stellar/stellar-base");
var _utils = require("./utils");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var TypeGenerator = exports.TypeGenerator = function () {
  function TypeGenerator(spec) {
    _classCallCheck(this, TypeGenerator);
    this.spec = spec;
  }
  return _createClass(TypeGenerator, [{
    key: "generate",
    value: function generate() {
      var _this = this;
      var types = this.spec.entries.map(function (entry) {
        return _this.generateEntry(entry);
      }).filter(function (t) {
        return t;
      }).join("\n\n");
      var imports = this.generateImports();
      return "".concat(imports, "\n\n    ").concat(types, "\n    ");
    }
  }, {
    key: "generateEntry",
    value: function generateEntry(entry) {
      switch (entry.switch()) {
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
          if ((0, _utils.isTupleStruct)(entry.udtStructV0())) {
            return this.generateTupleStruct(entry.udtStructV0());
          }
          return this.generateStruct(entry.udtStructV0());
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
          return this.generateUnion(entry.udtUnionV0());
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
          return this.generateEnum(entry.udtEnumV0());
        case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
          return this.generateErrorEnum(entry.udtErrorEnumV0());
        default:
          return null;
      }
    }
  }, {
    key: "generateImports",
    value: function generateImports() {
      var imports = (0, _utils.generateTypeImports)(this.spec.entries.flatMap(function (entry) {
        switch (entry.switch()) {
          case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
            return entry.udtStructV0().fields().map(function (field) {
              return field.type();
            });
          case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
            return entry.udtUnionV0().cases().flatMap(function (unionCase) {
              if (unionCase.switch() === _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0()) {
                return unionCase.tupleCase().type();
              }
              return [];
            });
          case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
            return [];
          case _stellarBase.xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
            return [];
          default:
            return [];
        }
      }));
      return (0, _utils.formatImports)(imports, {
        includeTypeFileImports: false
      });
    }
  }, {
    key: "generateStruct",
    value: function generateStruct(struct) {
      var name = (0, _utils.sanitizeIdentifier)(struct.name().toString());
      var doc = (0, _utils.formatJSDocComment)(struct.doc().toString() || "Struct: ".concat(name), 0);
      var fields = struct.fields().map(function (field) {
        var fieldName = field.name().toString();
        var fieldType = (0, _utils.parseTypeFromTypeDef)(field.type());
        var fieldDoc = (0, _utils.formatJSDocComment)(field.doc().toString(), 2);
        return "".concat(fieldDoc, "  ").concat(fieldName, ": ").concat(fieldType, ";");
      }).join("\n");
      return "".concat(doc, "export interface ").concat(name, " {\n").concat(fields, "\n}");
    }
  }, {
    key: "generateUnion",
    value: function generateUnion(union) {
      var _this2 = this;
      var name = (0, _utils.sanitizeIdentifier)(union.name().toString());
      var doc = (0, _utils.formatJSDocComment)(union.doc().toString() || "Union: ".concat(name), 0);
      var cases = union.cases().map(function (unionCase) {
        return _this2.generateUnionCase(unionCase);
      });
      var caseTypes = cases.map(function (c) {
        if (c.types.length > 0) {
          return "".concat((0, _utils.formatJSDocComment)(c.doc, 2), "  { tag: \"").concat(c.name, "\"; values: readonly [").concat(c.types.join(", "), "] }");
        }
        return "".concat((0, _utils.formatJSDocComment)(c.doc, 2), "  { tag: \"").concat(c.name, "\"; values: void }");
      }).join(" |\n");
      return "".concat(doc, " export type ").concat(name, " =\n").concat(caseTypes, ";");
    }
  }, {
    key: "generateEnum",
    value: function generateEnum(enumEntry) {
      var name = (0, _utils.sanitizeIdentifier)(enumEntry.name().toString());
      var doc = (0, _utils.formatJSDocComment)(enumEntry.doc().toString() || "Enum: ".concat(name), 0);
      var members = enumEntry.cases().map(function (enumCase) {
        var caseName = enumCase.name().toString();
        var caseValue = enumCase.value();
        var caseDoc = enumCase.doc().toString() || "Enum Case: ".concat(caseName);
        return "".concat((0, _utils.formatJSDocComment)(caseDoc, 2), "  ").concat(caseName, " = ").concat(caseValue);
      }).join(",\n");
      return "".concat(doc, "export enum ").concat(name, " {\n").concat(members, "\n}");
    }
  }, {
    key: "generateErrorEnum",
    value: function generateErrorEnum(errorEnum) {
      var _this3 = this;
      var name = (0, _utils.sanitizeIdentifier)(errorEnum.name().toString());
      var doc = (0, _utils.formatJSDocComment)(errorEnum.doc().toString() || "Error Enum: ".concat(name), 0);
      var cases = errorEnum.cases().map(function (enumCase) {
        return _this3.generateEnumCase(enumCase);
      });
      var members = cases.map(function (c) {
        return "".concat((0, _utils.formatJSDocComment)(c.doc, 2), "  ").concat(c.value, " : { message: \"").concat(c.name, "\" }");
      }).join(",\n");
      return "".concat(doc, "export const ").concat(name, " = {\n").concat(members, "\n}");
    }
  }, {
    key: "generateUnionCase",
    value: function generateUnionCase(unionCase) {
      switch (unionCase.switch()) {
        case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0():
          {
            var voidCase = unionCase.voidCase();
            return {
              doc: voidCase.doc().toString(),
              name: voidCase.name().toString(),
              types: []
            };
          }
        case _stellarBase.xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0():
          {
            var tupleCase = unionCase.tupleCase();
            return {
              doc: tupleCase.doc().toString(),
              name: tupleCase.name().toString(),
              types: tupleCase.type().map(function (t) {
                return (0, _utils.parseTypeFromTypeDef)(t);
              })
            };
          }
        default:
          throw new Error("Unknown union case kind: ".concat(unionCase.switch()));
      }
    }
  }, {
    key: "generateEnumCase",
    value: function generateEnumCase(enumCase) {
      return {
        doc: enumCase.doc().toString(),
        name: enumCase.name().toString(),
        value: enumCase.value()
      };
    }
  }, {
    key: "generateTupleStruct",
    value: function generateTupleStruct(udtStruct) {
      var name = (0, _utils.sanitizeIdentifier)(udtStruct.name().toString());
      var doc = (0, _utils.formatJSDocComment)(udtStruct.doc().toString() || "Tuple Struct: ".concat(name), 0);
      var types = udtStruct.fields().map(function (field) {
        return (0, _utils.parseTypeFromTypeDef)(field.type());
      }).join(", ");
      return "".concat(doc, "export type ").concat(name, " = readonly [").concat(types, "];");
    }
  }]);
}();