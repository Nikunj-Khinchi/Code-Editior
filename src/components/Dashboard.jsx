import { NavLink, Outlet } from "react-router-dom";
import { db } from "../auth/Firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import desfultImage from "../assets/Images/defaultUser.png";
import { getAuth } from "firebase/auth";
import UserDetails from "./UserDetails";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = async () => {
      const auth = getAuth();
      const authUser = auth.currentUser;
      if (authUser) {
        // console.log("User is authenticated:", authUser);

        const q = query(
          collection(db, "users"),
          where("uid", "==", authUser.uid)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((document) => {
          const userData = document.data();
          setUser(userData);
        });
        setLoading(false);
      } else {
        console.log("No user is authenticated");
        setUser(null);
        setLoading(false);
      }
    };

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);


  if (loading || user == null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex space-x-3">
          <div className="w-5 h-5 bg-pink-700 rounded-full animate-pulse"></div>
          <div className="w-5 h-5 bg-red-700 rounded-full animate-pulse delay-150"></div>
          <div className="w-5 h-5 bg-yellow-700 rounded-full animate-pulse delay-300"></div>
        </div>
        <h1 className="text-lg tracking-widest ml-3">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="w-[100%] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow-2xl">
        <h1 className="text-center text-2xl font-normal tracking-[0.8rem] p-[0.2rem]">
          <NavLink to="/">Code Editor</NavLink>
        </h1>
      </div>
      <div className="flex  h-screen bg-gray-100">
        <div className="p-6 w-64 bg-white rounded-r-3xl shadow-lg">
          <div className="mb-6 flex flex-col items-center">
            <img
              className="h-20 w-20 rounded-full border-2 border-red-500 hover:scale-105 transition duration-300"
              src={user.photoURL ? user.photoURL : desfultImage} // replace with your default image path
              alt="User profile"
            />
            <h2 className="mt-4 text-xl font-medium text-gray-700">
              {user.displayName}
            </h2>
          </div>
          <nav className="mt-10 flex flex-col gap-4">
            {/* <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block py-2.5 px-4 bg-white  ${
                  isActive
                    ? "shadow-[5px_5px_0px_0px_rgba(78,68,53,1)] focus:outline-none w-full border-[1px] border-[#3e3d3b]  rounded-md "
                    : "border-[1px] rounded-md shadow-lg"
                }`
              }
            >
              Dashboard
            </NavLink> */}
            <NavLink
              to="user-details"
              className={({ isActive }) =>
                `block py-2.5 px-4 bg-white  ${
                  isActive
                    ? "focus:outline-none w-full border-[1px] border-[#ec8720] rounded-md shadow-[5px_5px_0px_0px_rgba(236,135,32,1)]"
                    : "border-[1px]  rounded-md shadow-lg"
                }`
              }
            >
              User Details
            </NavLink>
            <NavLink
              to="saved-code"
              className={({ isActive }) =>
                `block py-2.5 px-4 bg-white  ${
                  isActive
                    ? "focus:outline-none w-full border-[1px] border-[#ec8720]  rounded-md shadow-[5px_5px_0px_0px_rgba(236,135,32,1)]"
                    : "border-[1px]  rounded-md shadow-lg"
                }`
              }
            >
              Saved Code
            </NavLink>
          </nav>
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
