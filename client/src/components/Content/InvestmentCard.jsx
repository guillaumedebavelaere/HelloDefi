import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useEth } from "../../contexts/EthContext";
import ActionDialog from "./ActionDialog";

function InvestmentCard({assetAddress}) {
    const {state: {web3, accounts, priceFeed, erc20Abi}} = useEth();
    const [balance, setBalance] = useState(0);
    const [balanceUsd, setBalanceUsd] = useState(0);
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

    useEffect(() => {
        (async() => {
            const balanceToken = await tokenContract.methods.balanceOf(accounts[0]).call();
            setBalance(web3.utils.fromWei(balanceToken));

            const lastPrice = await priceFeed.methods.getLatestPrice(assetAddress).call();
            setBalanceUsd(web3.utils.fromWei(balanceToken) * web3.utils.fromWei(lastPrice));
        })()
    }, []);




    return <>
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {balance} DAI
                </Typography>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {balanceUsd} $
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center">
                    <img src="https://staging.aave.com/icons/tokens/dai.svg" width="100px" height="100px" />
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
                        <span>{rewards} DAI <span>{rewardsUsd} $</span></span>
                    </Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", alignItems: "center", marginBottom: "5px" }}>
                <Button variant="contained" onClick={handleClickOpen}>Start Earning</Button>
            </CardActions>
        </Card>
        <ActionDialog
            selectedValue={selectedValue}
            open={open}
            onClose={handleClose}
            balance={balance}
        />
    </>
}

export default InvestmentCard;