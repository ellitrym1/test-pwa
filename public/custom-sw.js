import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST || []);

cleanupOutdatedCaches();

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("static-cache").then((cache) => {
            return cache.addAll(["/index.html", "/app.js", "/styles.css"]);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return (
                            cacheName.startsWith("static-cache") &&
                            cacheName !== "static-cache"
                        );
                    })
                    .map((cacheName) => {
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    console.log("Fetching:", event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("push", function (event) {
    if (!(self.Notification && self.Notification.permission === "granted")) {
        return;
    }
    console.log(event);
    if (event.data) {
        const message = event.data.json();
        console.log(message);
        event.waitUntil(
            self.registration
                .showNotification(message.title, {
                    body: message.body,
                })
                .catch((error) => {
                    console.error("Error displaying notification:", error);
                })
        );
    }
});
