import Router from "./Router";
import { MantineProvider } from "@mantine/core";

function App() {
  return (
    <MantineProvider>
      <Router />
    </MantineProvider>
  );
}

export default App;
