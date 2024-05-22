import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import UserDetails from "./components/UserDetails";
import Dashboard from "./components/Dashboard";
import Error from "./components/Error";
import SavedCode from "./components/SavedCode";
import { useLocation } from "react-router-dom";



const PageTitle = () => {
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === "/") {
      document.title = "Code Editor";
    } else if (currentPath === "/dashboard/user-details") {
      document.title = "User Details";
    } else if (currentPath === "/dashboard/saved-code") {
      document.title = "Saved Code";
    }
    // Add more else if statements for other paths as needed
  }, [location]);

  return null;
};

const App = () => {

  return (
    <BrowserRouter>
    <PageTitle />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="user-details" element={<UserDetails />} />
          <Route path="saved-code" element={<SavedCode />} />
        </Route>
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
