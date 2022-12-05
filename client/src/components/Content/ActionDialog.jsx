import { Box } from "@mui/system";
import { useState } from "react";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
const { Dialog, DialogTitle, Typography, Button, TextField } = require("@mui/material");

function ActionDialog({onClose, selectedValue, open, balance}) {
    const [depositValue, setDepositValue] = useState(0);
    const [withdrawValue, setWithdrawValue] = useState(0);

    const [tabValue, setTabValue] = useState('1');
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };


    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleDepositChange = () => {
        console.log("on cahnge");
    }

    const handleDepositSubmit = () => {
        console.log("on cahnge");
    }

    const handleWithdrawChange = () => {
        console.log("on cahnge");
    }

    const handleWithdrawSubmit = () => {
        console.log("on cahnge");
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle display="flex" justifyContent="center" alignItems="center">
                <img src="https://staging.aave.com/icons/tokens/dai.svg" width="40px" height="40px" />
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
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    Use max ({balance} DAI)
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
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Deposit Dai
                                </Button>
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
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    Use max (0 DAI)
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
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Withdraw Dai
                                </Button>
                            </Box>
                        </Box>
                    </TabPanel>
                </TabContext>
            </Box>
        </Dialog>
    );
}

export default ActionDialog;