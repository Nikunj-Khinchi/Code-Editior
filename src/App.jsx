import { useEffect, useState } from "react";
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

const WindowSet = () =>{
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (windowWidth < 800) {
    return (
      <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          backgroundColor: "#282c34",
          color: "white",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1 style={{ fontSize: "1.8em", marginBottom: "20px" }}>
          Unsupported Screen Size
        </h1>
        <p>
          Your screen size is not supported. Please increase the window size for
          a better experience.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <h1 className="text-start font-light">Website Preview</h1>
        <img
         src="/public/Images/MainPage.png"
          alt="Main Page Image"
          style={{ width: "400px" }}
        />
        <img
          src="/public/Images/Dashboard.png"
          alt="Dashboard Image"
          style={{ width: "400px" }}
        />
        </div>
       
      </div>

      
      </>
    );
  }
}

const App = () => {
 
  return (
    <BrowserRouter>
    <WindowSet />
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
