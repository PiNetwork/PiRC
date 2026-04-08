"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatImports = formatImports;
exports.formatJSDocComment = formatJSDocComment;
exports.generateTypeImports = generateTypeImports;
exports.isNameReserved = isNameReserved;
exports.isTupleStruct = isTupleStruct;
exports.parseTypeFromTypeDef = parseTypeFromTypeDef;
exports.sanitizeIdentifier = sanitizeIdentifier;
var _stellarBase = require("@stellar/stellar-base");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function isNameReserved(name) {
  var reservedNames = ["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "enum", "implements", "interface", "let", "package", "private", "protected", "public", "static", "async", "await", "constructor", "null", "true", "false"];
  return reservedNames.includes(name);
}
function sanitizeIdentifier(identifier) {
  if (isNameReserved(identifier)) {
    return identifier + "_";
  }
  if (/^\d/.test(identifier)) {
    return "_" + identifier;
  }
  return identifier;
}
function parseTypeFromTypeDef(typeDef) {
  var isFunctionInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  switch (typeDef.switch()) {
    case _stellarBase.xdr.ScSpecType.scSpecTypeVal():
      return "any";
    case _stellarBase.xdr.ScSpecType.scSpecTypeBool():
      return "boolean";
    case _stellarBase.xdr.ScSpecType.scSpecTypeVoid():
      return "null";
    case _stellarBase.xdr.ScSpecType.scSpecTypeError():
      return "Error";
    case _stellarBase.xdr.ScSpecType.scSpecTypeU32():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI32():
      return "number";
    case _stellarBase.xdr.ScSpecType.scSpecTypeU64():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI64():
    case _stellarBase.xdr.ScSpecType.scSpecTypeTimepoint():
    case _stellarBase.xdr.ScSpecType.scSpecTypeDuration():
    case _stellarBase.xdr.ScSpecType.scSpecTypeU128():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI128():
    case _stellarBase.xdr.ScSpecType.scSpecTypeU256():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI256():
      return "bigint";
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytes():
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytesN():
      return "Buffer";
    case _stellarBase.xdr.ScSpecType.scSpecTypeString():
      return "string";
    case _stellarBase.xdr.ScSpecType.scSpecTypeSymbol():
      return "string";
    case _stellarBase.xdr.ScSpecType.scSpecTypeAddress():
    case _stellarBase.xdr.ScSpecType.scSpecTypeMuxedAddress():
      {
        if (isFunctionInput) {
          return "string | Address";
        }
        return "string";
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeVec():
      {
        var vecType = parseTypeFromTypeDef(typeDef.vec().elementType(), isFunctionInput);
        return "Array<".concat(vecType, ">");
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeMap():
      {
        var keyType = parseTypeFromTypeDef(typeDef.map().keyType(), isFunctionInput);
        var valueType = parseTypeFromTypeDef(typeDef.map().valueType(), isFunctionInput);
        return "Map<".concat(keyType, ", ").concat(valueType, ">");
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeTuple():
      {
        var tupleTypes = typeDef.tuple().valueTypes().map(function (t) {
          return parseTypeFromTypeDef(t, isFunctionInput);
        });
        return "[".concat(tupleTypes.join(", "), "]");
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeOption():
      {
        while (typeDef.option().valueType().switch() === _stellarBase.xdr.ScSpecType.scSpecTypeOption()) {
          typeDef = typeDef.option().valueType();
        }
        var optionType = parseTypeFromTypeDef(typeDef.option().valueType(), isFunctionInput);
        return "".concat(optionType, " | null");
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeResult():
      {
        var okType = parseTypeFromTypeDef(typeDef.result().okType(), isFunctionInput);
        var errorType = parseTypeFromTypeDef(typeDef.result().errorType(), isFunctionInput);
        return "Result<".concat(okType, ", ").concat(errorType, ">");
      }
    case _stellarBase.xdr.ScSpecType.scSpecTypeUdt():
      {
        var udtName = sanitizeIdentifier(typeDef.udt().name().toString());
        return udtName;
      }
    default:
      return "unknown";
  }
}
function extractNestedTypes(typeDef) {
  switch (typeDef.switch()) {
    case _stellarBase.xdr.ScSpecType.scSpecTypeVec():
      return [typeDef.vec().elementType()];
    case _stellarBase.xdr.ScSpecType.scSpecTypeMap():
      return [typeDef.map().keyType(), typeDef.map().valueType()];
    case _stellarBase.xdr.ScSpecType.scSpecTypeTuple():
      return typeDef.tuple().valueTypes();
    case _stellarBase.xdr.ScSpecType.scSpecTypeOption():
      return [typeDef.option().valueType()];
    case _stellarBase.xdr.ScSpecType.scSpecTypeResult():
      return [typeDef.result().okType(), typeDef.result().errorType()];
    default:
      return [];
  }
}
function visitTypeDef(typeDef, accumulator) {
  var typeSwitch = typeDef.switch();
  switch (typeSwitch) {
    case _stellarBase.xdr.ScSpecType.scSpecTypeUdt():
      accumulator.typeFileImports.add(sanitizeIdentifier(typeDef.udt().name().toString()));
      return;
    case _stellarBase.xdr.ScSpecType.scSpecTypeAddress():
    case _stellarBase.xdr.ScSpecType.scSpecTypeMuxedAddress():
      accumulator.stellarImports.add("Address");
      return;
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytes():
    case _stellarBase.xdr.ScSpecType.scSpecTypeBytesN():
      accumulator.needsBufferImport = true;
      return;
    case _stellarBase.xdr.ScSpecType.scSpecTypeVal():
      accumulator.stellarImports.add("xdr");
      return;
    case _stellarBase.xdr.ScSpecType.scSpecTypeResult():
      accumulator.stellarContractImports.add("Result");
      break;
    case _stellarBase.xdr.ScSpecType.scSpecTypeBool():
    case _stellarBase.xdr.ScSpecType.scSpecTypeVoid():
    case _stellarBase.xdr.ScSpecType.scSpecTypeError():
    case _stellarBase.xdr.ScSpecType.scSpecTypeU32():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI32():
    case _stellarBase.xdr.ScSpecType.scSpecTypeU64():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI64():
    case _stellarBase.xdr.ScSpecType.scSpecTypeTimepoint():
    case _stellarBase.xdr.ScSpecType.scSpecTypeDuration():
    case _stellarBase.xdr.ScSpecType.scSpecTypeU128():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI128():
    case _stellarBase.xdr.ScSpecType.scSpecTypeU256():
    case _stellarBase.xdr.ScSpecType.scSpecTypeI256():
    case _stellarBase.xdr.ScSpecType.scSpecTypeString():
    case _stellarBase.xdr.ScSpecType.scSpecTypeSymbol():
      return;
  }
  var nestedTypes = extractNestedTypes(typeDef);
  nestedTypes.forEach(function (nested) {
    return visitTypeDef(nested, accumulator);
  });
}
function generateTypeImports(typeDefs) {
  var imports = {
    typeFileImports: new Set(),
    stellarContractImports: new Set(),
    stellarImports: new Set(),
    needsBufferImport: false
  };
  typeDefs.forEach(function (typeDef) {
    return visitTypeDef(typeDef, imports);
  });
  return imports;
}
function formatImports(imports, options) {
  var importLines = [];
  var typeFileImports = imports.typeFileImports;
  var stellarContractImports = [].concat(_toConsumableArray(imports.stellarContractImports), _toConsumableArray((options === null || options === void 0 ? void 0 : options.additionalStellarContractImports) || []));
  var stellarImports = [].concat(_toConsumableArray(imports.stellarImports), _toConsumableArray((options === null || options === void 0 ? void 0 : options.additionalStellarImports) || []));
  if (options !== null && options !== void 0 && options.includeTypeFileImports && typeFileImports.size > 0) {
    importLines.push("import {".concat(Array.from(typeFileImports).join(", "), "} from './types.js';"));
  }
  if (stellarContractImports.length > 0) {
    var uniqueContractImports = Array.from(new Set(stellarContractImports));
    importLines.push("import {".concat(uniqueContractImports.join(", "), "} from '@stellar/stellar-sdk/contract';"));
  }
  if (stellarImports.length > 0) {
    var uniqueStellarImports = Array.from(new Set(stellarImports));
    importLines.push("import {".concat(uniqueStellarImports.join(", "), "} from '@stellar/stellar-sdk';"));
  }
  if (imports.needsBufferImport) {
    importLines.push("import { Buffer } from 'buffer';");
  }
  return importLines.join("\n");
}
function escapeJSDocContent(text) {
  return text.replace(/\*\//g, "* /").replace(/@(?!(param|returns?|type|throws?|example|deprecated|see|link|since|author|version|description|summary)\b)/g, "\\@");
}
function formatJSDocComment(comment) {
  var indentLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  if (comment.trim() === "") {
    return "";
  }
  var indent = " ".repeat(indentLevel);
  var escapedComment = escapeJSDocContent(comment);
  var lines = escapedComment.split("\n").map(function (line) {
    return "".concat(indent, " * ").concat(line).trimEnd();
  });
  return "".concat(indent, "/**\n").concat(lines.join("\n"), "\n").concat(indent, " */\n");
}
function isTupleStruct(udtStruct) {
  var fields = udtStruct.fields();
  return fields.every(function (field, index) {
    return field.name().toString().trim() === index.toString();
  });
}