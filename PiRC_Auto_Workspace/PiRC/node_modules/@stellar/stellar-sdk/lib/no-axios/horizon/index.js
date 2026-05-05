"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Server: true,
  SERVER_TIME_MAP: true,
  getCurrentServerTime: true
};
Object.defineProperty(exports, "SERVER_TIME_MAP", {
  enumerable: true,
  get: function get() {
    return _horizon_axios_client.SERVER_TIME_MAP;
  }
});
Object.defineProperty(exports, "Server", {
  enumerable: true,
  get: function get() {
    return _server.HorizonServer;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "getCurrentServerTime", {
  enumerable: true,
  get: function get() {
    return _horizon_axios_client.getCurrentServerTime;
  }
});
var _horizon_api = require("./horizon_api");
Object.keys(_horizon_api).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _horizon_api[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _horizon_api[key];
    }
  });
});
var _server_api = require("./server_api");
Object.keys(_server_api).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _server_api[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _server_api[key];
    }
  });
});
var _account_response = require("./account_response");
Object.keys(_account_response).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _account_response[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _account_response[key];
    }
  });
});
var _server = require("./server");
var _horizon_axios_client = require("./horizon_axios_client");
var _default = exports.default = module.exports;