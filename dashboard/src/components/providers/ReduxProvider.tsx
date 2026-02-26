// ============================================
// REDUX PROVIDER - Wraps app with Redux store + persist rehydration
// ============================================
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";

// Shown for the brief moment while redux-persist reads localStorage and
// rehydrates the store. Using `null` here causes a blank-white flash.
function RehydrationLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning ring */}
        <svg
          className="animate-spin h-10 w-10 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Loading your preferences…
        </p>
      </div>
    </div>
  );
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/* PersistGate delays rendering until the persisted Redux state has been
          rehydrated from localStorage. We show a spinner instead of null to
          avoid a blank-white flash on first load. */}
      <PersistGate loading={<RehydrationLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
