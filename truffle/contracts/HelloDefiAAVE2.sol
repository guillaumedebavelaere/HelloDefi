// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ILendingPoolAAVE2.sol";
import "./IProtocolDataProviderAAVE2.sol";
import "./PriceFeedConsumer.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./FeesCollector.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HelloDefiAAVE2
 * @dev This smart contract interacts with AAVE protocol v2.
 * @dev It is created as a clone from the HelloDefiAAVE2Factory.
 */
contract HelloDefiAAVE2 is Ownable, Initializable {
    using SafeERC20 for IERC20;

    ILendingPoolAAVE2 private _aaveLendingPool;
    IProtocolDataProviderAAVE2 private _aaveProtocoDataProvider;
    PriceFeedConsumer private _priceFeed;
    FeesCollector private _feesCollector;

    uint256 private constant _referalCommission = 2; // 2%
    uint256 private constant _performanceCommission = 10; // 10%

    // mapping to keep track of the user's deposit balance: asset address => deposited asset qty
    mapping(address => uint256) public depositedBalance;

    // mapping to keep track of the user's asset avg deposit dollar cost : asset address => asset avg cost
    mapping(address => uint256) public assetAvgCost;

    event Deposit(address indexed _asset, uint256 _amount);
    event Withdraw(address indexed _asset, uint256 _amount);

    /**
     * @dev As HelloDefiAAVE2 is used as a Clone, there is no constructor.
     * @dev Call this function to initialize the clone instead.
     * @param _aaveLendingPoolAddress aave lending pool smart contract address
     * @param _aaveProtocolDataProviderAddress aave protocol data provider smart contract address
     * @param _priceFeedAddress price feed address
     * @param _feesCollectorAddress fees collector smart contract address
     * @param _user is the adress of the owner of this initialized clone
     */
    function initialize(
        address _aaveLendingPoolAddress,
        address _aaveProtocolDataProviderAddress,
        address _priceFeedAddress,
        address _feesCollectorAddress,
        address _user
    ) external initializer {
        _aaveLendingPool = ILendingPoolAAVE2(_aaveLendingPoolAddress);
        _aaveProtocoDataProvider = IProtocolDataProviderAAVE2(
            _aaveProtocolDataProviderAddress
        );
        _priceFeed = PriceFeedConsumer(_priceFeedAddress);
        _feesCollector = FeesCollector(_feesCollectorAddress);
        _transferOwnership(_user);
    }

    /**
     * @dev Deposits an `amount` of underlying asset into this smart contract. Referal fees are applied. Then the smart contract deposits the (amount - fees) into
     * AAVE in behalf of the user, receiving in return overlying aTokens in the smart contract.
     * - E.g. User deposits 100 USDC to the SC and the SC will deposit into AAVE 98 USDC to get in return 98 aUSDC (received into the SC).
     * Before calling this function, it requires the user to approve this smart contract to spend his asset.
     * @param _asset The address of the underlying asset to deposit.
     * @param _amount The amount to be deposited.
     **/
    function deposit(address _asset, uint256 _amount) external onlyOwner {
        require(_amount > 0, "amount must be > 0!");

        // Transfers the asset from user's wallet to this smart contract
        IERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);

        // collect referal fees
        uint256 amountAfterFees = _collectReferalFees(_asset, _amount);

        // keep track of avg cost
        assetAvgCost[_asset] = _computeAssetAvgCost(_asset, amountAfterFees);

        // keep track of the asset balance
        depositedBalance[_asset] += amountAfterFees;

        // Approval to allow aave to spend the user's asset
        IERC20(_asset).safeIncreaseAllowance(
            address(_aaveLendingPool),
            amountAfterFees
        );

        // This smart contract deposits to AAVE in behalf of the user
        _aaveLendingPool.deposit(_asset, amountAfterFees, address(this), 0);

        emit Deposit(_asset, amountAfterFees);
    }

    /**
     * @dev Withdraws an `amount` of underlying _asset from the AAVE reserve, burning the equivalent aTokens owned by the smart contract
     * E.g. Smart contract has 100 aUSDC, calls withdraw() and receives 100 USDC, burning the 100 aUSDC. 100 USDC are then returned to the user (msg.sender)
     * @param _asset The address of the underlying asset to withdraw
     * @param _amount The underlying amount to be withdrawn
     **/
    function withdraw(address _asset, uint256 _amount) external onlyOwner {
        require(_amount > 0, "_amount must be > 0!");

        // Getting total balance (deposited + rewards)
        (uint256 totalBalance, , , , , , , , ) = _aaveProtocoDataProvider
            .getUserReserveData(_asset, address(this));
        require(_amount <= totalBalance, "Insufficiant balance");

        // collect performance fees
        uint256 lastPrice = _priceFeed.getLatestPrice(_asset);
        uint256 totalRemainingBalance = _collectPerformanceFees(_asset, totalBalance, lastPrice);

        // If the user withdraw all of it
        if (_amount > totalRemainingBalance) {
            _amount = totalRemainingBalance;
            lastPrice = 0;
        }

        // This smart contract withdraw from AAVE in behalf of the user
        require(
            _aaveLendingPool.withdraw(_asset, _amount, address(this)) > 0,
            "0 whithdrawn from AAVE!"
        );

        // Update the user asset's balance and avg cost
        depositedBalance[_asset] = (totalRemainingBalance - _amount);
        assetAvgCost[_asset] = lastPrice;

        //Transfers the asset from this smart contract to user's wallet
        IERC20(_asset).safeTransfer(
            msg.sender,
            _amount
        );

        emit Withdraw(_asset, _amount);
    }

    /**
     * _collectReferalFees verifies first if the user has a referal wealth manager.
     * If it is the case, it computes the fees and substract from the deposited amount and transfer to the FeesCollector.
     * @param _asset asset to deposit
     * @param _amount asset quantity to deposit
     * @return the remaining amount after the applied fees.
     */
    function _collectReferalFees(address _asset, uint256 _amount)
        private
        returns (uint256)
    {
        require(_amount > 100);
        uint256 fees = (_amount * _referalCommission) / 100;

        // Transfer referal fees to the fees collector
        IERC20(_asset).safeTransfer(
            address(_feesCollector),
            fees
        );

        return _amount - fees;
    }

    /**
     *  _collectPerformanceFees computes the performance fees send them to the FeesCollector;
     * @param _asset asset to withdraw
     * @param _totalBalance total asset quantity (deposited + rewards)
     * @return the remaining amount to withdraw after the applied fees.
     */
    function _collectPerformanceFees(
        address _asset,
        uint256 _totalBalance,
        uint256 _lastPrice
    ) private returns (uint256) {
        // Compute the real avg cost
        uint256 _avgCost = _computeRealAvgCost(_asset, _totalBalance);

        // Compute profit or loss
        int256 profitOrLoss = (int256(_lastPrice) - int256(_avgCost)) *
            int256(_totalBalance) / 10**18;
        
        if (profitOrLoss > 100) {
            // 100 is the minimum to be able to compute the fees
            uint256 dollarFees = (uint256(profitOrLoss) *
                _performanceCommission) / 100;
            
            uint256 feesQty = dollarFees * 10**18/ _lastPrice;
            
            // Withdraw fees from AAVE
            _aaveLendingPool.withdraw(_asset, feesQty, address(this));

            // Transfer performance fees to the fees collector
            IERC20(_asset).safeTransfer(
                address(_feesCollector),
                feesQty
            );
            
            return _totalBalance - feesQty;
        }
        return _totalBalance;
    }

    /**
     * _computeAssetAvgCost computes the asset avg cost
     * @param _asset asset to compute the avg cost
     * @param _depositAmount amount the user is depositing
     */
    function _computeAssetAvgCost(address _asset, uint256 _depositAmount)
        private
        view
        returns (uint256)
    {
        uint256 totalQty = depositedBalance[_asset] + _depositAmount;
        require(totalQty > 0, "No quantity!");
        uint256 currentTotalValue = depositedBalance[_asset] *
            assetAvgCost[_asset];

        uint256 lastPrice = _priceFeed.getLatestPrice(_asset);

        uint256 depositTotalValue = _depositAmount * lastPrice;

        return (depositTotalValue + currentTotalValue) / totalQty;
    }

    /**
     * _computeRealAvgCost computes the real avg cost for the user, ie: including aToken rewards.
     * @param _asset address of the asset
     * @param _totalBalance total balance = deposited + rewards
     * @return the real avg cost
     */
    function _computeRealAvgCost(address _asset, uint256 _totalBalance)
        private
        view
        returns (uint256)
    {
        uint256 totalDepositedValue = depositedBalance[_asset] *
            assetAvgCost[_asset];
        if (IERC20Metadata(_asset).decimals() < 18) {
            // aToken have 18 decimals
            uint256 decimalsToAdd = 10**IERC20Metadata(_asset).decimals() /
                10**18;
            totalDepositedValue = totalDepositedValue * decimalsToAdd;
        }

        return totalDepositedValue / _totalBalance;
    }
}
