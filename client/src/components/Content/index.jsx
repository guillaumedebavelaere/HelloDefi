import { Box } from "@mui/material";
import { useEth } from "../../contexts/EthContext";
import InvestmentCard from "./InvestmentCard";

const { Stack } = require("@mui/system");

function Content() {
    const { state: { accounts } } = useEth();



    return <>
        {accounts === undefined || accounts === null ?

            (<p>
                Please connect to your wallet to see your positions and interact with the app.
            </p>)
            : <Stack direction="row" spacing={2} sx={{ marginTop: "100px" }}>
                <InvestmentCard assetAddress="0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33"/>
            </Stack>

        }
    </>
}


export default Content;