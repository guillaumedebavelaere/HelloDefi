import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import Address from './Address';
import Network from './Network';

function Header() {

    return <>
        <Grid2 container spacing={1}>
            <Grid2 xs={8}>

            </Grid2>
            <Grid2 xs={1}>
                <Network />
            </Grid2>
            <Grid2 xs={2}>
                <Address />
            </Grid2>
        </Grid2>
    </>
}

export default Header;