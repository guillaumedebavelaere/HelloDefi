import { Button, Popover } from "@mui/material";
import { useState } from "react";
import { useEth } from "../../contexts/EthContext";

function Address() {
    const { connect, disconnect, state: { accounts } } = useEth();
    const [anchorEl, setAnchorEl] = useState(null);

    const formatETHAddress = (s, size = 5) => {
        const first = s.slice(0, size + 1);
        const last = s.slice(-size);
        return first + "..." + last;
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;


    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDisconnect = () => {
        disconnect();
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
      };

    return <>

        {accounts === undefined || accounts === null
            ? <Button variant="contained" onClick={connect}>Connect wallet</Button>
            : (<div>
                <Button aria-describedby={id} variant="contained" onClick={handleClick}>{formatETHAddress(accounts[0])}</Button>
                <Popover
                    id={id}
                    open={open}
                    onClose={handleClose}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}>
                    <Button  onClick={handleDisconnect}>Disconnect</Button>
                </Popover>
            </div>
            )
        }
    </>
}

export default Address;