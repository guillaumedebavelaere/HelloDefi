import { EthProvider } from "./contexts/EthContext";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import Header from "./components/Header";
import Address from "./components/Header/Address";
import { Container, Stack } from "@mui/material";
import Content from "./components/Content";

const theme = createTheme();

function App() {

  return (
    <EthProvider>
      <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
            <Header/>
            <Content />
        </Container>
      </ThemeProvider>
    </EthProvider>
  );
}

export default App;
