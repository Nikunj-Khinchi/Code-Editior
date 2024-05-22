import {  db } from "../auth/Firebase";
import {
  updateDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from "react-redux";
const UserDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(true);

  const reduxUserData = useSelector((state) => state.user);


  useEffect(() => {
    if (reduxUserData) {
      setUserDetails(reduxUserData);
      setLoading(false);
    } else {
      console.log("No user is authenticated");
      setLoading(false);
    }
  }, [reduxUserData]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (reduxUserData.uid) {
      const q = query(collection(db, "users"), where("uid", "==", reduxUserData.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        updateDoc(document.ref, userDetails);
      });
      toast.success('User details updated successfully');
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100%]">
        <div className="flex space-x-3">
          <div className="w-5 h-5 bg-pink-700 rounded-full animate-pulse"></div>
          <div className="w-5 h-5 bg-red-700 rounded-full animate-pulse delay-150"></div>
          <div className="w-5 h-5 bg-yellow-700 rounded-full animate-pulse delay-300"></div>
        </div>
        <h1 className="text-lg tracking-widest ml-3">Loading...</h1>
      </div>
    );
  }

  if (!reduxUserData.uid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-lg tracking-widest">No user logged in</h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg tracking-wider max-w-sm mx-auto mt-10">
       <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
       />
      <div className="float-end">
        <button
          onClick={handleEdit}
          className="text-blue-500 hover:text-blue-700 transform hover:scale-110 transition duration-500 "
        >
          <img
            width="20"
            height="20"
            src={
              isEditing
                ? "https://img.icons8.com/ios-glyphs/30/multiply.png"
                : "https://img.icons8.com/material/24/pencil--v1.png"
            }
            alt={isEditing ? "x--v1" : "pencil--v1"}
          />
        </button>
        </div>
      <div className="flex justify-center items-center mb-6">
        <div className="flex flex-col gap-2"> 
       
        <img
          className="h-20 w-20 rounded-full border-2 border-red-500 hover:scale-105 transition duration-300"
          src={userDetails.photoURL ? userDetails.photoURL : "path/to/default/image.jpg"} // replace with your default image path
          alt="User profile"
        />
        </div>
      
      </div>
      
      {isEditing ? (
        <div className="text-pretty space-y-4">
          <div>
            <label className="block font-bold text-gray-700">Name:</label>
            <input
              type="text"
              name="displayName"
              value={userDetails.displayName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee4447]"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee4447]"
              readOnly
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700">Phone Number:</label>
            <input
              type="text"
              name="phoneNumber"
              value={userDetails.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee4447]"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="text-center  space-y-5">
          <p>
            <span className="font-bold">Name:</span> {userDetails.displayName}
          </p>
          <p>
            <span className="font-bold">Email:</span> {userDetails.email}
          </p>
          <p>
            <span className="font-bold">Phone Number:</span>{" "}
            {userDetails.phoneNumber}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
