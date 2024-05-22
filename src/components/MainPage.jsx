import CodeEditor from "./CodeEditor";
import axios from "axios";
// import firebase from "firebase/app";
import "firebase/auth";
import { auth } from "../auth/Firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { defineTheme } from "../constants/AddTheme";

import useKeyPress from "../constants/useKeyPress";
import Output from "./Ouput";
import UserInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import LanguagesDropdown from "./LanguagesDropdown";
import ThemeDropdown from "./ThemeDropdown";
import { languageOptions } from "../constants/languageOptions";
import AuthPage from "./AuthPage";
import Modal from "react-modal";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

// MainPage.js

const javascriptDefault = 
`// Bubble sort Implementation using Javascript
// Creating the bblSort function
function bblSort(arr) {

    for (var i = 0; i < arr.length; i++) {

        // Last i elements are already in place  
        for (var j = 0; j < (arr.length - i - 1); j++) {

            // Checking if the item at present iteration 
            // is greater than the next iteration
            if (arr[j] > arr[j + 1]) {

                // If the condition is true
                // then swap them
                var temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
    }

    // Print the sorted array
    console.log(arr);
}

// This is our unsorted array
var arr = [234, 43, 55, 63, 5, 6, 235, 547];

// Now pass this array to the bblSort() function
bblSort(arr); `;

const MainPage = () => {
  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);
  // const [loading, setLoading] = useState(false);
  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

 

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
    // eslint-disable-next-line
  }, [ctrlPress, enterPress]);

  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        console.log("code...", data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };

    const options = {
      method: "POST",
      url: import.meta.env.VITE_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
      data: formData,
    };

    console.log("options", options);

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        // console.log(err);
        let error = err.response ? err.response.data : err;
        // get error status
        // let status = err.response.status;
        // console.log("status", status);
        if (error.status === 429) {
          console.log("too many requests", status);

          showErrorToast(
            `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
            10000
          );
        }
        setProcessing(false);
        console.log("catch block...", err);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: import.meta.env.VITE_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then(() => setTheme(theme));
    }
  }

  useEffect(() => {
    defineTheme("merbivore").then(() =>
      setTheme({ value: "merbivore", label: "Merbivore" })
    );
  }, []);

  // firsebase auth
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const confirmLogout = () => {
    setShowConfirmModal(true);
  };

  const handleLogout = async () => {
   await auth
      .signOut()
      .then(() => {
        // Sign-out successful.
        setShowConfirmModal(false);
        showSuccessToast("Sign-out successfully");
        setUser(null);
        console.log("Sign-out successful.");
      })
      .catch((error) => {
        // An error happened.
        console.log("An error happened.", error);
      });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const q = query(
          collection(db, "users"),
          where("uid", "==", authUser.uid)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((document) => {
          const userData = document.data();
          console.log("User data:", userData);
          setUser(userData);
          // setLoading(false);
        });
      } else {
        console.log("No user is authenticated");
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const handelAuthStatus = (data) => {
    console.log(data);
    showSuccessToast(data);
  };

  // Toast messages
  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Save code
  const db = getFirestore();

  const handleSave = async () => {
    // Ask for the name to store the code
    if (!user) {
      showErrorToast("Please login to save the code!");
      return;
    }
    if (!codeName) {
      // User didn't enter a name, don't save the code
      return;
    }
    // Get a reference to the user's document in the database
    const userDocRef = doc(db, "CodeSave", user.uid);

    // Get the user's document

    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      // The user's document exists, get the data
      const userData = userDocSnapshot.data();

      // Find the language object
      const languageObject = userData.languages.find(
        (lang) => lang.name === language.value
      );

      // Check if a code with the same name already exists in the relevant language object
      if (
        languageObject &&
        languageObject.codes.some((doc) => doc.name === codeName)
      ) {
        // A code with the same name already exists, don't save the code
        showErrorToast(
          "A code with this name already exists. Please use a different name."
        );
        return;
      }
    }

    // save to the database

    // Prepare the code document
    const codeDocument = {
      name: codeName,
      code: code,
      language: language.value,
    };

    // Get the user's document
    const userDocSnap = await getDoc(userDocRef);
    console.log("userDocSnap", userDocSnap);

    if (userDocSnap.exists()) {
      // User document exists, update it
      const userData = userDocSnap.data();

      // Find the language object
      const languageObject = userData.languages.find(
        (lang) => lang.name === language.value
      );

      if (languageObject) {
        // Language object exists, add the code to it
        languageObject.codes.push(codeDocument);
      } else {
        // Language object doesn't exist, create it
        userData.languages.push({
          name: language.value,
          codes: [codeDocument],
        });
      }
      // Update the user document
      await updateDoc(userDocRef, userData);
    } else {
      // User document doesn't exist, create it
      await setDoc(userDocRef, {
        languages: [
          {
            name: language.value,
            codes: [codeDocument],
          },
        ],
      });
    }

    showSuccessToast("Code saved successfully!");
    closeSaveModal();
  };


  const [saveModalIsOpen, saveSetModalIsOpen] = useState(false);
  const [codeName, setCodeName] = useState("");

  const openSaveModal = () => {
    saveSetModalIsOpen(true);
    setCodeName("");
  };

  const closeSaveModal = () => {
    saveSetModalIsOpen(false);
    setCodeName("");
  };

  const navigate = useNavigate();



  return (
    <>
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

      <div className="w-[100%] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow-2xl">
        <h1 className="text-center text-2xl font-normal tracking-[0.8rem] p-[0.2rem]">
          <Link to="/">Code Editor</Link>
        </h1>
      </div>

      <div className="flex flex-row justify-between">
        <div className="flex gap-7 flex-row">
          <div className="flex">
            <div className="px-4 py-2">
              <LanguagesDropdown onSelectChange={onSelectChange} />
            </div>
            <div className="px-4 py-2">
              <ThemeDropdown
                handleThemeChange={handleThemeChange}
                theme={theme}
              />
            </div>
          </div>
          <div className="">
            <button
              onClick={openSaveModal}
              className=" mt-4 border-2 border-black rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-green-300 hover:bg-green-500 font-semibold flex-shrink-0"
            >
              Save Code
            </button>

            <Modal ariaHideApp={false}
              className={
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md px-8 pt-6 pb-10 mb-4 "
              }
              isOpen={saveModalIsOpen}
              onRequestClose={closeSaveModal}
              contentLabel="Save Code"
            >
              <h2 className="text-sm mb-2 font-semibold">
                Enter a name for your code:
              </h2>
              <input
                className="shadow appearance-none border rounded py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                type="text"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
              />
              <div className="flex gap-4">
                <button
                  className="focus:outline-none w-[50%] p-1 border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200  mt-2  bg-green-400 hover:bg-green-600"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="focus:outline-none w-[50%] p-1 border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200 bg-white mt-2"
                  onClick={closeSaveModal}
                >
                  Cancel
                </button>
              </div>
            </Modal>
          </div>
        </div>

        <div className="px-4 pt-2 pb-0 ">
          {!user && (
            <button
              className="focus:outline-none p-[0.4rem] w-full border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200 bg-white mt-2 tracking-wider"
              onClick={openModal}
            >
              Login/Signup
            </button>
          )}
          {user && (
            <div className="w-full grid grid-flow-col gap-8 pr-4 items-center">
              <div className="w-full flex items-center">
                <img
                  className="h-10 w-10 rounded-full mr-4"
                  src={user.photoURL}
                  alt="User profile"
                />
                <div className="font-bold">
                  Welcome,
                  <p
                    className="font-medium text-base underline cursor-pointer"
                    onClick={() => {
                      navigate("/dashboard/user-details");
                    }}
                  >
                    {user.displayName}
                  </p>
                </div>
              </div>
              <div className="w-full">
                <button
                  className="bg-red-200 hover:bg-red-400 focus:outline-none p-[0.4rem]  border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200  mt-2"
                  onClick={confirmLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
          <Modal ariaHideApp={false}
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md px-8 pt-6 pb-10 mb-4 
            
            focus:outline-none  border-[3px] border-black  shadow-[8px_8px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200  mt-2
            w-[450px]
            "
            overlayClassName="fixed top-0 left-0 right-0 bottom-0 bg-gray-800 bg-opacity-50"
          >
            <AuthPage onClose={closeModal} AuthSuccess={handelAuthStatus} />
          </Modal>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-3xl font-semibold mb-4">Confirm Logout</p>
            <p className="text-lg text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <CodeEditor
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme?.value}
          />
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <Output outputDetails={outputDetails} />
          <div className="flex flex-col items-end">
            <UserInput
              customInput={customInput}
              setCustomInput={setCustomInput}
            />

            <button
              onClick={handleCompile}
              disabled={!code}
              className={`mt-4 border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0 ${
                !code ? "opacity-50" : ""
              }`}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  );
};

export default MainPage;
