importScripts('https://www.gstatic.com/firebasejs/3.7.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.7.2/firebase-messaging.js');

var config = {
	apiKey: " AIzaSyAABpKCGHpzhfV8NfsJL_okh1XZLseZSkA",
	authDomain: "spectra-mobile-61656.firebaseapp.com",
	databaseURL: "https://spectra-mobile-61656.firebaseio.com",
	messagingSenderId: "589322820950",
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
	body: 'Background Message body.',
	icon: '/images/app-icon-64.png',
	tag: 'tag....'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});