import { EthProvider } from "./contexts/EthContext";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from "./components/Header";
import { Container } from "@mui/material";
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
