import { Box, Button, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import "./App.css";
import ContactsList from "./components/ContactsList";

function App() {
    const [subscription, setSubscription] = useState<null | boolean>(null);
    const [publicKey, setPublicKey] = useState();
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [QRData, setQRData] = useState("");
    const [showContacts, setShowContacts] = useState<boolean>(false);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            console.log("test");
            navigator.serviceWorker
                .register("/custom-sw.js")
                .then((registration) => {
                    registration.pushManager
                        .getSubscription()
                        .then((subscription) => {
                            setSubscription(!!subscription);
                        });
                })
                .catch((error) => {
                    console.error("Service Worker registration failed:", error);
                });
        } else {
            console.log("Push notifications are not supported.");
        }
        fetchApplicationServerKey();
    }, []);

    const fetchApplicationServerKey = async () => {
        try {
            const response = await axios.get(
                "https://test-pwa-server.vercel.app/api/pushNotification/applicationServerKey"
            );
            setPublicKey(response.data.publicKey);
        } catch (error) {
            console.error("Error fetching public key:", error);
        }
    };

    const subscribeUser = async () => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: publicKey,
                });

                const response = await axios.post(
                    "https://test-pwa-server.vercel.app/api/pushNotification/subscribe",
                    subscription
                );
                console.log(response);

                if (response.status === 200) {
                    const subscriptionData = response.data;
                    setSubscription(subscriptionData);
                } else {
                    console.error("Failed to subscribe:", response.status);
                }
            } catch (error) {
                console.error("Error subscribing:", error);
            }
        } else {
            console.log("Push notifications are not supported.");
        }
    };

    const sendPushNotification = async () => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            try {
                if (!subscription) {
                    console.error("User has not subscribed yet.");
                    return;
                }

                const response = await axios.post(
                    "https://test-pwa-server.vercel.app/api/pushNotification/send",
                    {
                        title: "Test",
                        body: "Test",
                    }
                );

                if (response.status === 200) {
                    console.log("Push notification sent successfully.");
                } else {
                    console.error(
                        "Failed to send push notification:",
                        response.status
                    );
                }
            } catch (error) {
                console.error("Error sending push notification:", error);
            }
        } else {
            console.log("Push notifications are not supported.");
        }
    };

    const handleScan = (data: any) => {
        if (data) {
            setQRData(data);
        }
    };

    return (
        <Stack
            sx={{
                paddingTop: "0.5em",
            }}
        >
            <Typography variant="h1">Test</Typography>
            //SUBSCRIPTION AND NOTIFS
            <Box>
                {subscription ? (
                    <Button variant="contained" onClick={sendPushNotification}>
                        Send notif
                    </Button>
                ) : (
                    <Button variant="contained" onClick={subscribeUser}>
                        Subscribe
                    </Button>
                )}
            </Box>
            //QRSCANNER
            <Box>
                <Button
                    variant="contained"
                    onClick={() => setShowScanner(!showScanner)}
                >
                    {showScanner ? "Hide Scanner" : "Show Scanner"}
                </Button>
                {showScanner && (
                    <QrScanner
                        delay="100"
                        facingMode={"rear"}
                        onScan={handleScan}
                        onError={(err: any) => console.error(err)}
                        style={{ width: "100%" }}
                    />
                )}
                {QRData && <Typography>{QRData}</Typography>}
            </Box>
            //PHONE CONTACTS
            <Box>
                <Button
                    variant="contained"
                    onClick={() => setShowContacts(!showContacts)}
                >
                    {showContacts ? "Hide Contacts" : "Show Contacts"}
                </Button>
                {showContacts && <ContactsList />}
            </Box>
        </Stack>
    );
}

export default App;
