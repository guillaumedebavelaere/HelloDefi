import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useEth } from "../../contexts/EthContext";
import LoadingButton from '@mui/lab/LoadingButton';
const { Dialog, DialogTitle, Typography, TextField, InputAdornment } = require("@mui/material");

function ActionDialog({ assetAddress, onClose, selectedValue, open, balanceDeposited, symbol, tokenContract }) {
    const { refreshContext, state: { accounts, web3, contracts } } = useEth();
    const [tabValue, setTabValue] = useState('1');
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const handleClose = () => {
        onClose(selectedValue);
    };
    const [balanceUser, setBalanceUser] = useState(0);
    const [depositLoading, setDepositLoading] = useState(false);
    const [depositValue, setDepositValue] = useState(0);
    const [depositValueDollars, setDepositValueDollars] = useState(0);
    const [approved, setApproved] = useState(false);


    const handleDepositChange = e => {
        setDepositValue(e.target.value);
    }

    useEffect(() => {
        (async () => {
            const balance = await tokenContract.methods.balanceOf(accounts[0]).call({ from: accounts[0] });
            setBalanceUser(Math.round(web3.utils.fromWei(balance) * 100000000) / 100000000);
        })();
    });

    useEffect(() => {
        (async () => {
            if (depositValue !== 0) {
                const lastPrice = await contracts.PriceFeedConsumer.methods.getLatestPrice(assetAddress).call();
                setDepositValueDollars(
                    Math.round(depositValue * web3.utils.fromWei(lastPrice) * 100) / 100
                );
            } else {
                setDepositValueDollars(0);
            }

        })()
    }, [depositValue, assetAddress]);

    async function verifyAllowance(cloneAddress) {
        try {
            setDepositLoading(true);
            const allowAmount = await tokenContract.methods.allowance(accounts[0], cloneAddress).call({ from: accounts[0] });
            setApproved(depositValue <= web3.utils.fromWei(allowAmount));
            setDepositLoading(false);
        } catch (error) {
            console.log(error);
            setDepositLoading(false);
        }
    }

    async function approve(cloneAddress) {
        try {
            setDepositLoading(true);
            const allowed = await tokenContract.methods.approve(cloneAddress, web3.utils.toWei(depositValue))
                .send({ from: accounts[0] });
            setApproved(allowed);
            setDepositLoading(false);
            if (!allowed) {
                alert("Approval error. Try again.");
            }
        } catch (error) {
            console.log(error);
            setDepositLoading(false);
        }
    }

    async function deposit() {
        try {
            setDepositLoading(true);
            await contracts.HelloDefiAAVE2.methods.deposit(assetAddress, web3.utils.toWei(depositValue)).send({ from: accounts[0] });
            setDepositLoading(false);
        } catch (error) {
            console.log(error);
            setDepositLoading(false);
        }
    }

    async function createClone() {
        try {
            setDepositLoading(true);
            const receipt = await contracts.HelloDefiAAVE2Factory.methods.createClone().send({ from: accounts[0] });
            setDepositLoading(false);
            return receipt;
        } catch (error) {
            console.log(error);
            setDepositLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            if (contracts?.HelloDefiAAVE2 !== undefined) {
                await verifyAllowance(contracts.HelloDefiAAVE2.options.address);
            }
        })();
    }, [depositValue, contracts?.HelloDefiAAVE2]);

    const handleDepositSubmit = async (e) => {
        e.preventDefault();
        if (contracts?.HelloDefiAAVE2 === undefined) {
            const receipt = await createClone();
            const cloneAddress = receipt.events.CloneCreated.returnValues._clone;
            await approve(cloneAddress);
            refreshContext();
        } else if (!approved) {
            await approve(contracts.HelloDefiAAVE2.options.address);
        } else {
            await deposit();
            handleClose();
        }
    }

    /**
     * Withdraw methods
     */
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawValue, setWithdrawValue] = useState(0);
    const [withdrawValueDollars, setWithdrawValueDollars] = useState(0);

    useEffect(() => {
        (async () => {
            if (withdrawValue !== 0) {
                const lastPrice = await contracts.PriceFeedConsumer.methods.getLatestPrice(assetAddress).call();
                setWithdrawValueDollars(
                    Math.round(withdrawValue * web3.utils.fromWei(lastPrice) * 100) / 100
                );
            } else {
                setWithdrawValueDollars(0);
            }

        })()
    }, [withdrawValue, assetAddress]);


    const handleWithdrawChange = e => {
        setWithdrawValue(e.target.value);
    }

    const withdraw = async () => {
        try {
            setWithdrawLoading(true);
            await contracts.HelloDefiAAVE2.methods.withdraw(assetAddress, web3.utils.toWei(`${withdrawValue}`))
                .send({ from: accounts[0] });
            setWithdrawLoading(false);
        } catch (error) {
            console.log(error);
            setWithdrawLoading(false);
        }
    }

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        await withdraw();
        handleClose();
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle display="flex" justifyContent="center" alignItems="center">
                <img src={`/${symbol.toLowerCase()}.svg`} width="40px" height="40px" />
            </DialogTitle>
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', display: "flex", justifyContent: "center", alignItems: "center", minWidth: "300px" }}>
                        <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                            <Tab label="Deposit" value="1" />
                            <Tab label="Withdraw" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">
                        <Box
                            sx={{
                                margin: 2
                            }}
                        >
                            <Box display="flex" justifyContent="flex-end" alignItems="flex-end" mb={0}>
                                <Typography sx={{ fontSize: 14, cursor: "pointer" }} color="text.secondary" gutterBottom onClick={() => setDepositValue(balanceUser)}>
                                    Use max ({balanceUser} {symbol})
                                </Typography>
                            </Box>
                            <Box component="form" onSubmit={handleDepositSubmit} noValidate mt={0}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="deposit"
                                    label="Deposit"
                                    name="deposit"
                                    value={depositValue}
                                    onChange={handleDepositChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            <Typography sx={{ fontSize: 15 }} color="text.secondary" gutterBottom>
                                                ${depositValueDollars}
                                            </Typography>
                                        </InputAdornment>
                                    }}
                                />
                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    disabled={depositValue === 0}
                                    loading={depositLoading}
                                    fullWidth
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    {contracts?.HelloDefiAAVE2 === undefined ?
                                        <>Create {symbol} Investment</>
                                        : approved ? <>Deposit {symbol}</>
                                            : <>Approve {symbol}</>}

                                </LoadingButton>
                            </Box>
                        </Box>

                    </TabPanel>
                    <TabPanel value="2">
                        <Box
                            sx={{
                                margin: 2
                            }}
                        >
                            <Box display="flex" justifyContent="flex-end" alignItems="flex-end" mb={0}>
                                <Typography sx={{ fontSize: 14, cursor: "pointer" }} color="text.secondary" gutterBottom onClick={() => setWithdrawValue(balanceDeposited)}>
                                    Use max ({balanceDeposited} {symbol})
                                </Typography>
                            </Box>
                            <Box component="form" onSubmit={handleWithdrawSubmit} noValidate mt={0}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="withdraw"
                                    label="Withdraw"
                                    name="withdraw"
                                    value={withdrawValue}
                                    onChange={handleWithdrawChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            <Typography sx={{ fontSize: 15 }} color="text.secondary" gutterBottom>
                                                ${withdrawValueDollars}
                                            </Typography>
                                        </InputAdornment>
                                    }}
                                />
                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    loading={withdrawLoading}
                                    disabled={balanceDeposited === 0}
                                    fullWidth
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Withdraw {symbol}
                                </LoadingButton>
                            </Box>
                        </Box>
                    </TabPanel>
                </TabContext>
            </Box>
        </Dialog>
    );
}
export default ActionDialog;