import Router from "./Router";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Router />
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
