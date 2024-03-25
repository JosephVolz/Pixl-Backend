import {app} from "../config/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";

const auth = getAuth(app);

async function signup(req, res) {
  try {
    const {email, password} = req.body;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const token = await userCredential.user.getIdToken();
    res.status(200).json({token});
  } catch (error) {
    handleAuthError(error, res);
  }
}

async function login(req, res) {
  try {
    const {email, password} = req.body;
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const token = await userCredential.user.getIdToken();
    res.json({token});
  } catch (error) {
    handleAuthError(error, res);
  }
}

async function changePassword(req, res) {
  try {
    if (!req.user) throw new Error("User not authenticated");
    await updatePassword(req.user, req.body.newPassword);
    const token = await req.user.getIdToken();
    res.json({token});
  } catch (error) {
    handleAuthError(error, res);
  }
}

/* --== Helper Functions ==-- */

function handleAuthError(error, res) {
  console.log(error);
  let statusCode = 500; // Default to server error
  let message = "An error occurred";

  // Firebase Auth error handling
  switch (error.code) {
    case "auth/email-already-in-use":
      statusCode = 400;
      message = "Email already in use";
      break;
    case "auth/invalid-email":
      statusCode = 400;
      message = "Invalid email format";
      break;
    case "auth/user-not-found":
    case "auth/wrong-password":
      statusCode = 401;
      message = "Incorrect email or password";
      break;
    case "auth/weak-password":
      statusCode = 400;
      message = "Password is too weak";
      break;
    case "auth/too-many-requests":
      statusCode = 429;
      message = "Too many requests, please try again later";
      break;
    default:
      // Preserve the original Firebase error message for unhandled errors
      message = error.message;
  }

  res.status(statusCode).json({error: message});
}

export {signup, login, changePassword};
