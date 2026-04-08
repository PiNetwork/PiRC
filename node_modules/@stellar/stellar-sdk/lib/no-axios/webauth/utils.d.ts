/**
 * Stellar Web Authentication
 * @module WebAuth
 * @see {@link https://stellar.org/protocol-10 | SEP-10 Specification}
 */
import { FeeBumpTransaction, Transaction } from "@stellar/stellar-base";
/**
 * Checks if a transaction has been signed by one or more of the given signers,
 * returning a list of non-repeated signers that were found to have signed the
 * given transaction.
 *
 * @param {Transaction | FeeBumpTransaction} transaction The signed transaction.
 * @param {Array.<string>} signers The signer's public keys.
 * @returns {Array.<string>} A list of signers that were found to have signed
 *    the transaction.
 *
 * @example
 * let keypair1 = Keypair.random();
 * let keypair2 = Keypair.random();
 * const account = new StellarSdk.Account(keypair1.publicKey(), "-1");
 *
 * const transaction = new TransactionBuilder(account, { fee: 100 })
 *    .setTimeout(30)
 *    .build();
 *
 * transaction.sign(keypair1, keypair2)
 * WebAuth.gatherTxSigners(transaction, [keypair1.publicKey(), keypair2.publicKey()])
 */
export declare function gatherTxSigners(transaction: FeeBumpTransaction | Transaction, signers: string[]): string[];
/**
 * Verifies if a transaction was signed by the given account id.
 *
 * @param {Transaction | FeeBumpTransaction} transaction The signed transaction.
 * @param {string} accountID The signer's public key.
 * @returns {boolean} Whether or not `accountID` was found to have signed the
 *    transaction.
 *
 * @example
 * let keypair = Keypair.random();
 * const account = new StellarSdk.Account(keypair.publicKey(), "-1");
 *
 * const transaction = new TransactionBuilder(account, { fee: 100 })
 *    .setTimeout(30)
 *    .build();
 *
 * transaction.sign(keypair)
 * WebAuth.verifyTxSignedBy(transaction, keypair.publicKey())
 */
export declare function verifyTxSignedBy(transaction: FeeBumpTransaction | Transaction, accountID: string): boolean;
/**
 * A parsed and validated challenge transaction, and some of its constituent details.
 */
export type ChallengeTxDetails = {
    /** The challenge transaction. */
    tx: Transaction;
    /** The Stellar public key (master key) used to sign the Manage Data operation. */
    clientAccountId: string;
    /** The matched home domain. */
    matchedHomeDomain: string;
    /** The memo attached to the transaction, which will be null if not present */
    memo?: string;
};
