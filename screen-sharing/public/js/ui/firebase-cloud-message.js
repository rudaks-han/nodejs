	var config = {
		apiKey: " AIzaSyAABpKCGHpzhfV8NfsJL_okh1XZLseZSkA",
		authDomain: "spectra-mobile-61656.firebaseapp.com",
		databaseURL: "https://spectra-mobile-61656.firebaseio.com",
		messagingSenderId: "589322820950",
	};
	firebase.initializeApp(config);

	const messaging = firebase.messaging();

	navigator.serviceWorker.register('/js/worker/firebase-cloud-message-sw.js', {insecure:true})
	.then((registration) => {

	  	messaging.useServiceWorker(registration);

		messaging.requestPermission()
		.then(function() {
			console.log('Have permission');
			return messaging.getToken();
		})
		.then(function(token) {
			console.log('token : ' + token);
		})
		.catch(function(err) {
			console.log('Error occurred');
		});
	  // Request permission and get token.....
	});

	messaging.onMessage(function(payload) {
	  console.log("Message received. ", payload);
	  alert('received');
	  // ...
	});