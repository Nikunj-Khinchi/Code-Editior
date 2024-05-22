const handleSave = async () => {
    // ...

    // Prepare the code document
    const codeDocument = {
      name: codeName,
      code: code,
      language: language.value,
      userId: user.uid, // Add the user's ID to the code document
    };

    // Add the code document to the savedCode collection
    await addDoc(collection(db, "savedCode"), codeDocument);
    closeSaveModal();
    showSuccessToast("Code saved successfully!");
  };

  const handleLoad = async () => {
    // Get the saved code documents for the current language and user
    const savedCodeQuery = query(
      collection(db, "savedCode"),
      where("language", "==", language.value),
      where("userId", "==", user.uid)
    );

    const savedCodeQuerySnapshot = await getDocs(savedCodeQuery);

    if (!savedCodeQuerySnapshot.empty) {
      // Saved code documents exist, get the data
      const codeDocuments = savedCodeQuerySnapshot.docs.map((doc) =>
        doc.data()
      );

      // Do something with the code documents
      console.log(codeDocuments);

      // Get the unique languages
      const languages = [...new Set(codeDocuments.map((doc) => doc.language))];

      // Do something with the languages
      console.log(languages);
    } else {
      // No saved code documents
      console.log("No code saved.");
    }
  };





















  import React, { useState, useEffect } from 'react';
import { auth } from '../auth/Firebase';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

const UserDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is authenticated:', user);
        setUser(user);
        setUserDetails({
          name: user.displayName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
        });
        setLoading(false);
      } else {
        console.log('No user is authenticated');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      console.log('Fetching data for user:', user.uid);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          console.log('User data:', doc.data());
          setUserDetails(doc.data());
        } else {
          console.log('No such document!');
        }
      });

      return unsubscribe; // cleanup on unmount
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (user) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      try {
        await setDoc(userDocRef, userDetails ,{merge: true});
        console.log('User details updated successfully');
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
  };

  if (loading) {
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-lg tracking-widest">No user logged in</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">User Details</h2>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">Name:</label>
            <input
              type="text"
              name="name"
              value={userDetails.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700">Phone Number:</label>
            <input
              type="text"
              name="phoneNumber"
              value={userDetails.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
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
        <div className="space-y-4">
          <p>
            <span className="font-bold">Name:</span> {userDetails.name}
          </p>
          <p>
            <span className="font-bold">Email:</span> {userDetails.email}
          </p>
          <p>
            <span className="font-bold">Phone Number:</span> {userDetails.phoneNumber}
          </p>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>Edit</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
