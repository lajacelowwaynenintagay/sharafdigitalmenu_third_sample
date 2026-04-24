"use client";

import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";

import type { MenuStatusMap } from "@/types/menu";

const firebaseConfig = {
  apiKey: "AIzaSyC-0da7Nex5O3KfBL0kGF9nJoradGrx6ds",
  authDomain: "d-smart-menu-orders.firebaseapp.com",
  databaseURL: "https://d-smart-menu-orders-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "d-smart-menu-orders",
  appId: "1:341530688970:web:05e95a7f14f8da708e2333",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let authPromise: Promise<void> | null = null;

async function ensureAuth() {
  if (!authPromise) {
    authPromise = signInAnonymously(auth).then(() => undefined);
  }

  return authPromise;
}

export async function subscribeToMenuStatus(
  restaurantId: string,
  onData: (value: MenuStatusMap) => void,
) {
  await ensureAuth();

  const statusRef = ref(db, `restaurants/${restaurantId}/menu_status`);
  return onValue(statusRef, (snapshot) => {
    onData((snapshot.val() as MenuStatusMap | null) ?? {});
  });
}
