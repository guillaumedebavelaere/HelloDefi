import { EthProvider } from "./contexts/EthContext";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Content from "./components/Content";

const theme = createTheme();

function App() {

  return (
    <EthProvider>
      <ThemeProvider theme={theme}>
        <div id="App" >
          <Content />
        </div>
      </ThemeProvider>
    </EthProvider>
  );
}

export default App;
