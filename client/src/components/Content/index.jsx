import Header from "./Header";
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2

function Content() {

    return <>
                <Grid2 container spacing={2}>
                    <Grid2 xs={12}>
                        <Header />
                    </Grid2>
                    <Grid2 xs={12}>
                        <p>content</p>
                    </Grid2>
                    <Grid2 xs={12}>
                        <p>footer</p>
                    </Grid2>
                </Grid2>
    </>
}

export default Content;