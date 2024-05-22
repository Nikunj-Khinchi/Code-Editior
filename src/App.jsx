import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import UserDetails from "./components/UserDetails";
import Dashboard from "./components/Dashboard";
import Error from "./components/Error";
import SavedCode from "./components/SavedCode";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} >
        <Route path="user-details" element={<UserDetails />} />
        <Route path="saved-code" element={<SavedCode />} />
        </Route>
        <Route path="*" element={ <Error />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;