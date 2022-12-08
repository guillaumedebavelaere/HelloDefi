import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useEth } from "../../contexts/EthContext";
import ActionDialog from "./ActionDialog";

function InvestmentCard({assetAddress, symbol}) {
    const {state: {web3, accounts, clone, priceFeed, protocolDataProvider, erc20Abi}} = useEth();
    const [balanceDeposited, setBalanceDeposited] = useState(0);
    const [balanceDepositedUsd, setBalanceDepositedUsd] = useState(0);
    const [rewards, setRewards] = useState(0);
    const [rewardsUsd, setRewardsUsd] = useState(0);

    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");

    const tokenContract = new web3.eth.Contract(erc20Abi, assetAddress);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };
    
    async function refreshBalanceDeposited() {
        const balanceDeposited = await clone.methods.depositedBalance(assetAddress).call({ from: accounts[0] });
        setBalanceDeposited(web3.utils.fromWei(balanceDeposited));

        const lastPrice = await priceFeed.methods.getLatestPrice(assetAddress).call();
        setBalanceDepositedUsd(
            Math.round(web3.utils.fromWei(balanceDeposited) * web3.utils.fromWei(lastPrice) * 100) / 100
        );
    }

    async function refreshRewards() {
        const {aTokenBalance} = await protocolDataProvider.methods.getUserReserveData(assetAddress, clone.options.address)
            .call({from: accounts[0]});
        
        const rewards = web3.utils.BN(aTokenBalance).sub(web3.utils.toWei(web3.utils.BN(balanceDeposited)));
        setRewards(web3.utils.fromWei(rewards));

        const lastPrice = await priceFeed.methods.getLatestPrice(assetAddress).call();
        setRewardsUsd(
            Math.round(web3.utils.fromWei(rewards) * web3.utils.fromWei(lastPrice) * 100) / 100
        );
    }

    useEffect(() => {
        (async() => {
            if (clone !== undefined) {
                await refreshBalanceDeposited();
                await refreshRewards();
            } else {
                setBalanceDeposited(0);
                setBalanceDepositedUsd(0);
                setRewards(0)
                setRewardsUsd(0);
            }
        })()
    }, [accounts, clone]);

    useEffect(() => {
        (async()=> {
            if (clone !== undefined) {
                await clone.events.Deposit({ _asset: assetAddress, fromBlock: "earliest" })
                    .on('data', async event => {
                        await refreshBalanceDeposited();
                        await refreshRewards();
                    })
                    .on('error',    err => console.log("err: " + err))
            }     
        })();
    }, [accounts, clone]);

    useEffect(() => {
        (async()=> {
            if (clone !== undefined) {
                await clone.events.Withdraw({ _asset: assetAddress, fromBlock: "earliest" })
                    .on('data', async event => {
                        await refreshBalanceDeposited();
                        await refreshRewards();
                    })
                    .on('error',    err => console.log("err: " + err))
            }     
        })();
    }, [accounts, clone]);



    return <>
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {balanceDeposited} {symbol}
                </Typography>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    ${balanceDepositedUsd}
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center">
                    <img src={`/${symbol.toLowerCase()}.svg`} width="100px" height="100px" />
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        APY
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        0%
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Earnings
                    </Typography>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        <span>{rewards} {symbol} <span>{rewardsUsd} $</span></span>
                    </Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", alignItems: "center", marginBottom: "5px" }}>
                <Button variant="contained" onClick={handleClickOpen}>
                    { balanceDeposited > 0 ? <>Earn more</> : <>Start Earning</>}
                </Button>
            </CardActions>
        </Card>
        <ActionDialog
            selectedValue={selectedValue}
            open={open}
            onClose={handleClose}
            balanceDeposited={balanceDeposited}
            symbol={symbol}
            assetAddress={assetAddress}
            tokenContract={tokenContract}
        />
    </>
}

export default InvestmentCard;