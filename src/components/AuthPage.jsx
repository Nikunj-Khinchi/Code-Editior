import { useState } from "react";
import PropTypes from "prop-types";
import "firebase/auth";
import { auth } from "../auth/Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";



const AuthPage = ({ onClose, AuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // initialize firestore
  const db = getFirestore();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // check if email and password isnt empty
      if (!email || !password) {
        setError("Email and Password is required");
        return;
      }

      //   await firebase.auth().signInWithEmailAndPassword(email, password);

      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          AuthSuccess("Login Successfully");
          
          onClose();
          setLoading(false);

        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setError(errorMessage);
          console.log(errorCode, errorMessage);
          // ..
        });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      // check if email, password, name and phone number isnt empty
      if (!email || !password || !name || !phoneNumber) {
        setError("All fields are required");
        return;
      }

      // Check if email or phone number is already in use
      const userCollection = collection(db, "users");
      const emailQuery = query(userCollection, where("email", "==", email));
      const phoneQuery = query(
        userCollection,
        where("phoneNumber", "==", phoneNumber)
      );

      const emailSnapshot = await getDocs(emailQuery);
      const phoneSnapshot = await getDocs(phoneQuery);

      if (!emailSnapshot.empty) {
        setError("Email is already in use");
        return;
      }

      if (!phoneSnapshot.empty) {
        setError("Phone number is already in use");
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);

          // Update user profile
          updateProfile(user, { displayName: name })
            .then(() => {
              AuthSuccess("Signup Successfully");
              // Add a new document with a generated id.
              addNewUserDocument(user);
              onClose();
            })
            .catch((error) => {
              // An error occurred
              console.error("Error updating user profile: ", error);
            });

            setLoading(false);
        })


        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setError(errorMessage);
          console.log(errorCode, errorMessage);
        });
    } catch (error) {
      setError(error.message);
    }
  };


  // Genrate user Profile

  const addNewUserDocument = (user) => {
  let profile = `https://api.dicebear.com/8.x/icons/svg?seed=${user.displayName}`
  console.log(profile);

    addDoc(collection(db, "users"), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: phoneNumber,
      photoURL: user.photoURL || profile,
    })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  const checkEmailRegistered = async (email) => {
    const userCollection = collection(db, "users");
    const emailQuery = query(userCollection, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);
    return !emailSnapshot.empty;
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider)
        .then(async (result) => {
          // Signed in with Google
          const user = result.user;
          const photo = user.photoURL;
          console.log(photo);

          // Check if email is already registered
          const emailRegistered = await checkEmailRegistered(user.email);

          if (emailRegistered) {
            AuthSuccess(
              "Google Login Successfully"
            );
            onClose();
            return;
          }

          // Add user to firestore
        await addNewUserDocument(user);

          AuthSuccess("Google Login Successfully");
          console.log(user);
          onClose();
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setError(errorMessage);
          console.log(errorCode, errorMessage);
        });
    } catch (error) {
      setError(error.message);
    }
  };

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null); // Reset any previous errors
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div
        style={{ fontFamily: "sans-serif" }}
        className="p-3   rounded flex flex-col mb-4"
      >
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? (
            <span className="font-semibold tracking-widest ">Login</span>
          ) : (
            <span className="font-semibold tracking-wider ">Sign up</span>
          )}
        </h2>
        {!isLogin && (
          <input
            className="shadow appearance-none border rounded py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="shadow appearance-none border rounded py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="shadow appearance-none border rounded py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {!isLogin && (
          <input
            className="shadow appearance-none border rounded py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        )}
        {error && <p className="text-red-500 text-sm italic mt-2">{error}</p>}

        {isLogin ? (
          <button
            className="focus:outline-none w-[50%] p-1 border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200 bg-white mt-2"
            onClick={handleLogin}
          >
            { loading ? "Login..." :"Login"}
          </button>
        ) : (
          <button
            className="focus:outline-none w-[50%] p-1 border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200 bg-white mt-2"
            onClick={handleSignup}
          >
            {loading ? "Sign up..." : "Sign up"}
          </button>
        )}
        <button
          className="text-blue-400 text-start hover:text-blue-700 focus:outline-none mt-4"
          onClick={toggleMode}
        >
          {isLogin
            ? "Create an account ? Sign up"
            : "Already have an account? Login"}
        </button>
        <p className="text-base  mt-2 text-center text-gray-500">or</p>

        <div className="flex justify-center">
          <button
            className="mt-2 w-[70%] px-4 py-2 border-[1.5px] flex items-center gap-2 rounded-lg text-slate-900  hover:border-slate-400"
            onClick={handleGoogleLogin}
          >
            <img
              className="w-6 h-6"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              loading="lazy"
              alt="google logo"
            />
            <span className="tracking-wider">Sign in with Google</span>
          </button>
        </div>
      </div>
    </>
  );
};

AuthPage.propTypes = {
  onClose: PropTypes.func.isRequired,
  AuthSuccess: PropTypes.func.isRequired,
};

export default AuthPage;
