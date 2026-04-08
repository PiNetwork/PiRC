"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Address = void 0;
var _strkey = require("./strkey");
var _xdr = _interopRequireDefault(require("./xdr"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Create a new Address object.
 *
 * `Address` represents a single address in the Stellar network that can be
 * inputted to or outputted by a smart contract. An address can represent an
 * account, muxed account, contract, claimable balance, or a liquidity pool
 * (the latter two can only be present as the *output* of Core in the form
 * of an event, never an input to a smart contract).
 *
 * @constructor
 *
 * @param {string} address - a {@link StrKey} of the address value
 */
var Address = exports.Address = /*#__PURE__*/function () {
  function Address(address) {
    _classCallCheck(this, Address);
    if (_strkey.StrKey.isValidEd25519PublicKey(address)) {
      this._type = 'account';
      this._key = _strkey.StrKey.decodeEd25519PublicKey(address);
    } else if (_strkey.StrKey.isValidContract(address)) {
      this._type = 'contract';
      this._key = _strkey.StrKey.decodeContract(address);
    } else if (_strkey.StrKey.isValidMed25519PublicKey(address)) {
      this._type = 'muxedAccount';
      this._key = _strkey.StrKey.decodeMed25519PublicKey(address);
    } else if (_strkey.StrKey.isValidClaimableBalance(address)) {
      this._type = 'claimableBalance';
      this._key = _strkey.StrKey.decodeClaimableBalance(address);
    } else if (_strkey.StrKey.isValidLiquidityPool(address)) {
      this._type = 'liquidityPool';
      this._key = _strkey.StrKey.decodeLiquidityPool(address);
    } else {
      throw new Error("Unsupported address type: ".concat(address));
    }
  }

  /**
   * Parses a string and returns an Address object.
   *
   * @param {string} address - The address to parse. ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`
   * @returns {Address}
   */
  return _createClass(Address, [{
    key: "toString",
    value:
    /**
     * Serialize an address to string.
     *
     * @returns {string}
     */
    function toString() {
      switch (this._type) {
        case 'account':
          return _strkey.StrKey.encodeEd25519PublicKey(this._key);
        case 'contract':
          return _strkey.StrKey.encodeContract(this._key);
        case 'claimableBalance':
          return _strkey.StrKey.encodeClaimableBalance(this._key);
        case 'liquidityPool':
          return _strkey.StrKey.encodeLiquidityPool(this._key);
        case 'muxedAccount':
          return _strkey.StrKey.encodeMed25519PublicKey(this._key);
        default:
          throw new Error('Unsupported address type');
      }
    }

    /**
     * Convert this Address to an xdr.ScVal type.
     *
     * @returns {xdr.ScVal}
     */
  }, {
    key: "toScVal",
    value: function toScVal() {
      return _xdr["default"].ScVal.scvAddress(this.toScAddress());
    }

    /**
     * Convert this Address to an xdr.ScAddress type.
     *
     * @returns {xdr.ScAddress}
     */
  }, {
    key: "toScAddress",
    value: function toScAddress() {
      switch (this._type) {
        case 'account':
          return _xdr["default"].ScAddress.scAddressTypeAccount(_xdr["default"].PublicKey.publicKeyTypeEd25519(this._key));
        case 'contract':
          return _xdr["default"].ScAddress.scAddressTypeContract(this._key);
        case 'liquidityPool':
          return _xdr["default"].ScAddress.scAddressTypeLiquidityPool(this._key);
        case 'claimableBalance':
          return _xdr["default"].ScAddress.scAddressTypeClaimableBalance(new _xdr["default"].ClaimableBalanceId("claimableBalanceIdTypeV".concat(this._key.at(0)),
          // future-proof for cb v1
          this._key.subarray(1)));
        case 'muxedAccount':
          return _xdr["default"].ScAddress.scAddressTypeMuxedAccount(new _xdr["default"].MuxedEd25519Account({
            ed25519: this._key.subarray(0, 32),
            id: _xdr["default"].Uint64.fromXDR(this._key.subarray(32, 40), 'raw')
          }));
        default:
          throw new Error("Unsupported address type: ".concat(this._type));
      }
    }

    /**
     * Return the raw public key bytes for this address.
     *
     * @returns {Buffer}
     */
  }, {
    key: "toBuffer",
    value: function toBuffer() {
      return this._key;
    }
  }], [{
    key: "fromString",
    value: function fromString(address) {
      return new Address(address);
    }

    /**
     * Creates a new account Address object from a buffer of raw bytes.
     *
     * @param {Buffer} buffer - The bytes of an address to parse.
     * @returns {Address}
     */
  }, {
    key: "account",
    value: function account(buffer) {
      return new Address(_strkey.StrKey.encodeEd25519PublicKey(buffer));
    }

    /**
     * Creates a new contract Address object from a buffer of raw bytes.
     *
     * @param {Buffer} buffer - The bytes of an address to parse.
     * @returns {Address}
     */
  }, {
    key: "contract",
    value: function contract(buffer) {
      return new Address(_strkey.StrKey.encodeContract(buffer));
    }

    /**
     * Creates a new claimable balance Address object from a buffer of raw bytes.
     *
     * @param {Buffer} buffer - The bytes of a claimable balance ID to parse.
     * @returns {Address}
     */
  }, {
    key: "claimableBalance",
    value: function claimableBalance(buffer) {
      return new Address(_strkey.StrKey.encodeClaimableBalance(buffer));
    }

    /**
     * Creates a new liquidity pool Address object from a buffer of raw bytes.
     *
     * @param {Buffer} buffer - The bytes of an LP ID to parse.
     * @returns {Address}
     */
  }, {
    key: "liquidityPool",
    value: function liquidityPool(buffer) {
      return new Address(_strkey.StrKey.encodeLiquidityPool(buffer));
    }

    /**
     * Creates a new muxed account Address object from a buffer of raw bytes.
     *
     * @param {Buffer} buffer - The bytes of an address to parse.
     * @returns {Address}
     */
  }, {
    key: "muxedAccount",
    value: function muxedAccount(buffer) {
      return new Address(_strkey.StrKey.encodeMed25519PublicKey(buffer));
    }

    /**
     * Convert this from an xdr.ScVal type.
     *
     * @param {xdr.ScVal} scVal - The xdr.ScVal type to parse
     * @returns {Address}
     */
  }, {
    key: "fromScVal",
    value: function fromScVal(scVal) {
      return Address.fromScAddress(scVal.address());
    }

    /**
     * Convert this from an xdr.ScAddress type
     *
     * @param {xdr.ScAddress} scAddress - The xdr.ScAddress type to parse
     * @returns {Address}
     */
  }, {
    key: "fromScAddress",
    value: function fromScAddress(scAddress) {
      switch (scAddress["switch"]().value) {
        case _xdr["default"].ScAddressType.scAddressTypeAccount().value:
          return Address.account(scAddress.accountId().ed25519());
        case _xdr["default"].ScAddressType.scAddressTypeContract().value:
          return Address.contract(scAddress.contractId());
        case _xdr["default"].ScAddressType.scAddressTypeMuxedAccount().value:
          {
            var raw = Buffer.concat([scAddress.muxedAccount().ed25519(), scAddress.muxedAccount().id().toXDR('raw')]);
            return Address.muxedAccount(raw);
          }
        case _xdr["default"].ScAddressType.scAddressTypeClaimableBalance().value:
          {
            var cbi = scAddress.claimableBalanceId();
            return Address.claimableBalance(Buffer.concat([Buffer.from([cbi["switch"]().value]), cbi.v0()]));
          }
        case _xdr["default"].ScAddressType.scAddressTypeLiquidityPool().value:
          return Address.liquidityPool(scAddress.liquidityPoolId());
        default:
          throw new Error("Unsupported address type: ".concat(scAddress["switch"]().name));
      }
    }
  }]);
}();