import * as _ from 'lodash';
import Web3 from 'web3';

// Types
import { ERC20, MarketCollateralPool, MarketContractOraclize } from '@marketprotocol/types';
import BigNumber from 'bignumber.js';
import { ContractSet } from './ContractSet';
import { OraclizeContractSet } from './OraclizeContractSet';
import { ContractWrapper } from './ContractWrapper';
import { Market } from '../Market';

/**
 * Wrapper for our MarketContractOraclize objects.  This wrapper exposes all needed functionality of the
 * MarketContractOraclize itself and stores the created MarketContractOraclize objects in a mapping for easy reuse.
 */
export class OraclizeContractWrapper extends ContractWrapper {
  // region Members
  // *****************************************************************
  // ****                     Members                             ****
  // *****************************************************************
  protected readonly _marketProtocolSetByMarketContractAddress: {
    [address: string]: OraclizeContractSet;
  };

  protected readonly _marketProtocolSetByMarketCollateralPoolAddress: {
    [address: string]: OraclizeContractSet;
  };
  // endregion // members

  // region Constructors
  // *****************************************************************
  // ****                     Constructors                        ****
  // *****************************************************************
  constructor(web3: Web3, market: Market) {
    super(web3, market);
    this._marketProtocolSetByMarketContractAddress = {};
    this._marketProtocolSetByMarketCollateralPoolAddress = {};
  }
  // endregion//Constructors

  // region Properties
  // *****************************************************************
  // ****                     Properties                          ****
  // *****************************************************************
  // endregion //Properties

  // region Public Methods
  // *****************************************************************
  // ****                     Public Methods                      ****
  // *****************************************************************
  /**
   * Gets the MarketContract oracle query.
   * @param {string} marketContractAddress   Address of the contract
   * @returns {Promise<string>}                      The oracle query
   */
  public async getOracleQueryAsync(marketContractAddress: string): Promise<string> {
    const contractSetWrapper: OraclizeContractSet = await this._getContractSetByMarketContractAddressAsync(
      marketContractAddress
    );
    return contractSetWrapper.marketContractOraclize.ORACLE_QUERY;
  }

  /**
   * Gets the MarketContract expiration.
   * @param {string} marketContractAddress   Address of the contract
   * @returns {Promise<BigNumber>}                   Expiration timestamp
   */
  public async getContractExpirationAsync(marketContractAddress: string): Promise<BigNumber> {
    const contractSetWrapper: OraclizeContractSet = await this._getContractSetByMarketContractAddressAsync(
      marketContractAddress
    );
    return contractSetWrapper.marketContractOraclize.EXPIRATION;
  }

  /**
   * Gets the MarketContract expiration.
   * @param {string} marketContractAddress   Address of the contract
   * @returns {Promise<boolean>}                     Is this contract settled?
   */
  public async isContractSettledAsync(marketContractAddress: string): Promise<boolean> {
    const contractSetWrapper: OraclizeContractSet = await this._getContractSetByMarketContractAddressAsync(
      marketContractAddress
    );
    return contractSetWrapper.marketContractOraclize.isSettled;
  }

  // endregion //Public Methods

  // region Protected Methods
  // *****************************************************************
  // ****                    Protected Methods                    ****
  // *****************************************************************
  /**
   * Allow for retrieval or creation of a given ContractWrapperSet
   * @param {string} marketContractAddress                address of MarketContract
   * @returns {Promise<ContractSet>} ContractWrapperSet object
   * @private
   */
  protected async _getContractSetByMarketContractAddressAsync(
    marketContractAddress: string
  ): Promise<OraclizeContractSet> {
    const normalizedMarketAddress = marketContractAddress.toLowerCase();
    let contractSetWrapper: OraclizeContractSet = this._marketProtocolSetByMarketContractAddress[
      normalizedMarketAddress
    ];

    if (!_.isUndefined(contractSetWrapper)) {
      return contractSetWrapper;
    }

    contractSetWrapper = await this.createNewMarketContractSetFromMarketContractAddressAsync(
      marketContractAddress
    );
    this._marketProtocolSetByMarketContractAddress[normalizedMarketAddress] = contractSetWrapper;
    this._marketProtocolSetByMarketCollateralPoolAddress[
      contractSetWrapper.marketCollateralPool.address
    ] = contractSetWrapper;
    return contractSetWrapper;
  }

  /**
   * Creates a new contract set from a MarketContract address
   * @param {string} marketContractAddress
   * @returns {Promise<ContractSet>}
   */
  protected async createNewMarketContractSetFromMarketContractAddressAsync(
    marketContractAddress: string
  ): Promise<OraclizeContractSet> {
    const marketContract: MarketContractOraclize = new MarketContractOraclize(
      this._web3,
      marketContractAddress
    );
    const marketCollateralPool: MarketCollateralPool = new MarketCollateralPool(
      this._web3,
      await marketContract.MARKET_COLLATERAL_POOL_ADDRESS
    );
    const erc20: ERC20 = await this.getERC20TokenContractAsync(
      await marketContract.COLLATERAL_TOKEN_ADDRESS
    );

    return new OraclizeContractSet(marketContract, marketCollateralPool, erc20);
  }
  // endregion //Protected Methods

  // region Private Methods
  // *****************************************************************
  // ****                     Private Methods                     ****
  // *****************************************************************
  // endregion //Private Methods
}
