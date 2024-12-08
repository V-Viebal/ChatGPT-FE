importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp(
	{
		apiKey: "AIzaSyDgbcaV2mN-9DNzakMInAoI5mT8rlyMctU",
		authDomain: "chat-monskaner.firebaseapp.com",
		projectId: "chat-monskaner",
		storageBucket: "chat-monskaner.appspot.com",
		messagingSenderId: "289407202567",
		appId: "1:289407202567:web:eca3ae731ea46c60dc41a2"
	}
)
const messaging = firebase.messaging();
