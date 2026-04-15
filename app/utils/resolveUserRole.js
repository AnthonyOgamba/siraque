import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function resolveUserRole(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  let savedRole = "customer";

  if (userSnap.exists()) {
    savedRole = String(userSnap.data()?.role || "").toLowerCase();

    if (savedRole === "vendor" || savedRole === "superadmin") {
      return savedRole;
    }
  }

  try {
    const listingsQuery = query(collection(db, "listings"), where("vendorId", "==", uid));
    const listingsSnap = await getDocs(listingsQuery);

    if (!listingsSnap.empty) {
      return "vendor";
    }
  } catch (err) {
    console.warn("Role resolution failed to query listings:", err);
  }

  if (userSnap.exists()) {
    return savedRole || "customer";
  }

  return "customer";
}
