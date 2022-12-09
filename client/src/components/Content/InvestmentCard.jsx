import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useEth } from "../../contexts/EthContext";
import ActionDialog from "./ActionDialog";

function InvestmentCard({assetAddress, symbol}) {
    const {state: {web3, accounts, artifacts, contracts}} = useEth();
    const [balanceDeposited, setBalanceDeposited] = useState(0);
    const [balanceDepositedUsd, setBalanceDepositedUsd] = useState(0);
    const [rewards, setRewards] = useState(0);
    const [rewardsUsd, setRewardsUsd] = useState(0);

    const [open, setOpen] = useState(false);

    const tokenContract = new web3.eth.Contract(artifacts.IERC20Metadata.abi, assetAddress);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
    };

    async function refreshBalanceDepositedAndRewards() {
        const currentBalanceDeposited = await contracts.HelloDefiAAVE2.methods.depositedBalance(assetAddress).call({ from: accounts[0] });
        setBalanceDeposited(Math.round(web3.utils.fromWei(currentBalanceDeposited) * 100000000) / 100000000);

        const result = await contracts.IProtocolDataProviderAAVE2.methods.getUserReserveData(assetAddress, contracts.HelloDefiAAVE2.options.address)
            .call({from: accounts[0]});
        const aTokenBalance = result[0];

        const rewards = web3.utils.toBN(aTokenBalance).sub(web3.utils.toBN(currentBalanceDeposited));
        setRewards((Math.round(web3.utils.fromWei(rewards.toString()) * 100000000) / 100000000).toFixed(8));

        const lastPrice = await contracts.PriceFeedConsumer.methods.getLatestPrice(assetAddress).call();
        setRewardsUsd(
            Math.round(web3.utils.fromWei(rewards) * web3.utils.fromWei(lastPrice) * 100) / 100
        );
        setBalanceDepositedUsd(
            Math.round(web3.utils.fromWei(currentBalanceDeposited) * web3.utils.fromWei(lastPrice) * 100) / 100
        );
    }

    useEffect(() => {
        (async() => {
            if (contracts?.HelloDefiAAVE2 !== undefined) {
                await refreshBalanceDepositedAndRewards();
            } else {
                setBalanceDeposited(0);
                setBalanceDepositedUsd(0);
                setRewards(0)
                setRewardsUsd(0);
            }
        })()
    }, [accounts, contracts?.HelloDefiAAVE2]);

    useEffect(() => {
        (async()=> {
            if (contracts?.HelloDefiAAVE2 !== undefined) {
                await contracts.HelloDefiAAVE2.events.Deposit({ _asset: assetAddress, fromBlock: "earliest" })
                    .on('data', async event => {
                        await refreshBalanceDepositedAndRewards();
                    })
                    .on('error',    err => console.log("err: " + err))
            }     
        })();
    }, [accounts, contracts?.HelloDefiAAVE2]);

    useEffect(() => {
        (async()=> {
            if (contracts?.HelloDefiAAVE2 !== undefined) {
                await contracts.HelloDefiAAVE2.events.Withdraw({ _asset: assetAddress, fromBlock: "earliest" })
                    .on('data', async event => {
                        await refreshBalanceDepositedAndRewards();
                    })
                    .on('error',    err => console.log("err: " + err))
            }     
        })();
    }, [accounts, contracts?.HelloDefiAAVE2]);



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