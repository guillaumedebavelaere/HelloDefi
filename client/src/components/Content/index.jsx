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
                <InvestmentCard assetAddress={process.env.REACT_APP_DAI_CONTRACT_ADDRESS} symbol="DAI"/>
            </Stack>

        }
    </>
}


export default Content;