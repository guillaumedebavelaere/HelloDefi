import { EthProvider } from "./contexts/EthContext";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import Header from "./components/Header";

const theme = createTheme();

function App() {

  return (
    <EthProvider>
      <ThemeProvider theme={theme}>
        <div id="App" >
          <Grid2 container spacing={2}>
            <Grid2 xs={12}>
              <Header/>
            </Grid2>
            <Grid2 xs={12}>
              <p>content</p>
            </Grid2>
            <Grid2 xs={12}>
              <p>footer</p>
            </Grid2>
          </Grid2>
        </div>
      </ThemeProvider>
    </EthProvider>
  );
}

export default App;
