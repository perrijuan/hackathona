import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import { Routes } from "react-router";
import { Route } from "react-router";
import Login from "./pages/login";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/about" element={<h1>about</h1>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
