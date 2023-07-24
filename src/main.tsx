import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
    onRegistered(registration) {
        console.log("Registered: ", registration);
    },
    onRegisterError(error) {
        console.error(error);
    },
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/custom-sw.js")
            .then((registration) => {
                console.log("Custom service worker registered:", registration);
            })
            .catch((error) => {
                console.error(
                    "Custom service worker registration failed:",
                    error
                );
            });
    });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
