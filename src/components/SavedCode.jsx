import { useState, useEffect } from "react";
import {
  arrayRemove,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../auth/Firebase"; // Import your Firebase configuration
import { getAuth } from "firebase/auth";
import CodeEditor from "./CodeEditor";
import { defineTheme } from "../constants/AddTheme";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

const SavedCode = () => {
  const [theme, setTheme] = useState("");
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [editMode, setEditMode] = useState(false);
  const [editedCode, setEditedCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewCode, setViewCode] = useState(null);
  const [selectedCodeName, setSelectedCodeName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [languageToDelete, setLanguageToDelete] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSavedCode = async () => {
      const userDocRef = doc(db, "CodeSave", user.uid); // Replace user.uid with the actual user ID
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setLanguages(userData.languages);
      }
      // Assume that the languages are stored in userDocSnap.data().languages
      const fetchedLanguages = userDocSnap.data().languages;
      setLanguages(fetchedLanguages);

      // Set the first language as the selected language
      if (fetchedLanguages.length > 0) {
        setSelectedLanguage(fetchedLanguages[0]);
      }
    };

    fetchSavedCode().then(() => setLoading(false));
  }, [user]);

  const handleLanguageClick = (language) => {
    setSelectedLanguage(language);
  };

  useEffect(() => {
    const addTheme = () => {
      defineTheme("merbivore").then(() =>
        setTheme({ value: "merbivore", label: "Merbivore" })
      );
    };
    return () => addTheme();
  }, []);

  const handleCodeEdit = (code) => {
    setEditMode(true);
    setEditedCode(code.code);
    setSelectedCodeName(code.name);
  };

  const handleCodeSave = async () => {
    const userDocRef = doc(db, "CodeSave", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const languageIndex = userData.languages.findIndex(
        (lang) => lang.name === selectedLanguage.name
      );

      if (languageIndex !== -1) {
        const updatedLanguages = [...userData.languages];
        const languageData = updatedLanguages[languageIndex];
        const codeIndex = languageData.codes.findIndex(
          (code) => code.name === selectedCodeName
        );

        if (codeIndex !== -1) {
          const updatedCodes = [...languageData.codes];
          updatedCodes[codeIndex] = {
            ...updatedCodes[codeIndex],
            code: editedCode,
          };
          languageData.codes = updatedCodes;

          await updateDoc(userDocRef, {
            languages: updatedLanguages,
          })
            .then(() => {
              console.log("Document successfully updated!");
              toast.success(
                `${selectedCodeName.toUpperCase()} successfully Edited!`
              );
            })
            .catch((error) => {
              toast.error("Error updating document: ", error);
              console.error("Error updating document: ", error);
            });

          // Update the state to trigger a re-render
          setLanguages(updatedLanguages);
          setSelectedLanguage(languageData); // Update the selected language
        }
      }
    }

    setEditMode(false);
  };

  useEffect(() => {
    setEditMode(false);
    setViewCode(null);
    setSelectedFile(null);
  }, [selectedLanguage]);

  const handleDeleteLanguage = (lang) => {
    setLanguageToDelete(lang);
    setShowConfirmModal(true);
  };

  const confirmDeleteLanguage = async () => {
    if (languageToDelete) {
      const docRef = doc(db, "CodeSave", user.uid);

      await updateDoc(docRef, {
        languages: arrayRemove(languageToDelete),
      })
        .then(() => {
          console.log("Document successfully deleted!");

          setLanguages(
            languages.filter(
              (language) => language.name !== languageToDelete.name
            )
          );
          selectedLanguage?.name === languageToDelete.name &&
            setSelectedLanguage(null);
          toast.success(`${languageToDelete.name.toUpperCase()} Language successfully Deleted!`);
        })
        .catch((error) => {
          console.error("Error removing document: ", error);
        });

      // Reset the language to be deleted and close the modal
      setLanguageToDelete(null);
      setShowConfirmModal(false);
    }
  };

  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteFileModal(true);
  };

  const confirmDeleteFile = async () => {
    // use this for show toast message

    if (fileToDelete) {
      const FileName = fileToDelete.name;

      // Get a reference to the document
      const docRef = doc(db, "CodeSave", user.uid);

      // Get the document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Get the current languages
        const currentLanguages = docSnap.data().languages;

        // Find the language that the file belongs to
        const language = currentLanguages.find(
          (lang) => lang.name === selectedLanguage.name
        );

        // Remove the file from the language
        language.codes = language.codes.filter(
          (code) => code.name !== FileName
        );

        // Update the document
        await updateDoc(docRef, { languages: currentLanguages })
          .then(() => {
            console.log("File successfully deleted!");
            setSelectedFile(null);

            // Update the local state
            setLanguages(currentLanguages);
            setSelectedLanguage(language);

            // Reset the file to be deleted and close the modal
            setFileToDelete(null);
            setShowDeleteFileModal(false);
            toast.success(`${FileName.toUpperCase()} successfully Deleted!`);
          })
          .catch((error) => {
            toast.error("Error removing file: ", error);
            console.error("Error removing file: ", error);
          });
      } else {
        console.log("No such document!");
      }
    }
  };

  const onchangeEdit = (action, data) => {
    switch (action) {
      case "code": {
        setEditedCode(data);
        console.log("code...", data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[100%]">
        <div className="flex space-x-3">
          <div className="w-5 h-5 bg-pink-700 rounded-full animate-pulse"></div>
          <div className="w-5 h-5 bg-red-700 rounded-full animate-pulse delay-150"></div>
          <div className="w-5 h-5 bg-yellow-700 rounded-full animate-pulse delay-300"></div>
        </div>
        <h1 className="text-lg tracking-widest ml-3">
          {user ? "Loading..." : "user not found"}
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
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
      <h1 className="text-2xl font-bold mb-4">SavedCode</h1>
      {languages.length === 0 && (
        <div className="flex items-center justify-center h-[100%]">
          <h1 className="text-lg tracking-widest ml-3">No saved code found</h1>
        </div>
      )}
      {languages && (
        <div className="h-full">
          <div className=" grid grid-flow-col max-h-20 w-full gap-3 overflow-y-auto pb-3 mb-3">
            {languages.map((lang, index) => (
              <div
                key={index}
                onClick={() => handleLanguageClick(lang)}
                className={`shadow-md flex flex-row justify-between  border-[1.5px] text-center font-bold  border-opacity-50 rounded-md p-2 cursor-pointer ${
                  selectedLanguage?.name === lang.name
                    ? "bg-orange-300   "
                    : "hover:bg-orange-100 "
                } `}
              >
                <h1 className="tracking-widest">{lang.name.toUpperCase()}</h1>

                <button onClick={() => handleDeleteLanguage(lang)} className="">
                  <img
                    className="size-6"
                    src="https://img.icons8.com/?size=100&id=67884&format=png&color=FA5252"
                    alt="delete"
                  />
                </button>
              </div>
            ))}
          </div>
          {showConfirmModal && (
            <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-3xl font-semibold mb-4">Confirm Delete </p>
                <p className="text-lg text-gray-600 mb-6">
                  Are you sure you want to delete this language{" "}
                  <span className="font-bold font-mono">
                    {" "}
                    {languageToDelete.name.toUpperCase()}
                  </span>{" "}
                  ?
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmDeleteLanguage()}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10">
            {selectedLanguage && (
              <div>
                <h2 className="text-xl font-bold">
                  {selectedLanguage.name.toUpperCase()}
                </h2>
                <div className="flex mt-2">
                  <div className="w-1/4 border-r-2 overflow-y-auto">
                    {selectedLanguage.codes.map((code, index) => (
                      <div
                        key={index}
                        className="grid grid-flow-col gap-1 mb-3"
                      >
                        <div
                          className={`flex border-[1.5px] justify-between rounded-md shadow-md align-middle items-center gap-3 border-b p-2 cursor-pointer    ${
                            selectedFile === code.name
                              ? "bg-[#ff4c79] text-white font-semibold"
                              : "hover:bg-[#f8cbd7]"
                          } `}
                          onClick={() => {
                            setViewCode(code.code);
                            setEditMode(false);
                            // setSelectedFile(null);
                            setSelectedFile(code.name);
                          }}
                        >
                          <div className=" flex gap-4">
                            <span className="font-bold">{index + 1 + "."}</span>{" "}
                            <h1 className="tracking-wider">{code.name}</h1>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCodeEdit(code);
                              setViewCode(null);
                              // selectedFile(null);
                              setSelectedFile(code.name);
                            }}
                            className=""
                          >
                            <img
                              width={20}
                              height={20}
                              className="hover:scale-105 transition duration-300"
                              src="https://img.icons8.com/material/24/pencil--v1.png"
                              alt="edit"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(code)}
                            className="..."
                          >
                            <img
                              className="size-5"
                              src="https://img.icons8.com/?size=100&id=67884&format=png&color=FA5252"
                              alt="delete"
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {showDeleteFileModal && (
                    <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p className="text-3xl font-semibold mb-4">
                          Confirm Delete{" "}
                        </p>
                        <p className="text-lg text-gray-600 mb-6">
                          Are you sure you want to delete this file{" "}
                          <span className="font-bold font-mono">
                            {" "}
                            {fileToDelete.name.toUpperCase()}{" "}
                          </span>
                          ?
                        </p>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowDeleteFileModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => confirmDeleteFile()}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 p-4 pt-0">
                    {viewCode && (
                      <div className="">
                        <h1 className="tracking-wider font-bold">
                          <i className="font-medium">{selectedFile}</i> - View{" "}
                        </h1>
                        <CodeEditor
                          // onChange={() => {}}
                          key={selectedFile}
                          vh={"55vh"}
                          theme={theme.value || ""}
                          code={viewCode}
                          language={selectedLanguage.name || ""}
                          access={true}
                        />
                        <button
                          onClick={() => setViewCode(null)}
                          className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Close
                        </button>
                      </div>
                    )}
                    {editMode && (
                      <div className="">
                        <h1 className="tracking-wider font-bold">
                          <i className="font-medium">{selectedFile}</i> - Edit
                        </h1>
                        <CodeEditor
                          key={selectedFile}
                          vh={"55vh"}
                          code={editedCode}
                          onChange={onchangeEdit}
                          language={selectedLanguage.name || ""}
                          theme={theme.value || ""}
                        />

                        <button
                          onClick={handleCodeSave}
                          className="mt-2 bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="mt-2 bg-red-500 text-white px-2 py-1 rounded ml-2"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedCode;
