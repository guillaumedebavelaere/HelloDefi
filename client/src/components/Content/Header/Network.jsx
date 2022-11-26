import { Chip } from "@mui/material";
import { useEth } from "../../../contexts/EthContext";


function Network() {
    const { state: { wrongNetworkId } } = useEth();
    return <>
        {wrongNetworkId && <Chip label="Wrong network" color="error" />}
    </>
}

export default Network;