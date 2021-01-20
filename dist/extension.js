//uses gmail.js api
//dist/extension.js


(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }
    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

// actual extension-code
function startExtension(gmail) {
    console.log("Extension loading...");
    window.gmail = gmail;

	/* gmail.observe.on("load_email_menu", function(obj) {/
	//gmail.observe.on('view_email', function(obj) {
		
		console.log("view email option"+obj.arguments+"#1");
		console.log("view email option"+obj.textContent+"#2");
		console.log("view email option"+obj.data+"#3");
		console.log("view email option"+obj.text+"#4");
		console.log("view email option"+obj.value+"#5");
		console.log("view email option"+obj.emailBody+"#6");
	
		/* gmail.tools.add_toolbar_button("verify", () => { 
			var emailBod = compose.body();
			const userEmail = gmail.get.user_email();
			console.log("verify button pressed");
			//window.dispatchEvent(new CustomEvent("verifyRequest", {detail: {emailBody: emailBod, client: userEmail}}));

		}); *//*
		
		gmail.tools.add_toolbar_button('verify', function() {
			
			console.log("toolbar button 2.0");
			//var emailBod = gmail.get.current_email().body;
			//console.log(gmail.get.current_page().body+"#2");
			//console.log(gmail.get.current_page()+"#3");
			//console.log(gmail.get.email_data().email.body+"#4");
			//console.log(gmail.dom.email_data(id)+"#5");
			//console.log(body);

			const userEmail = gmail.get.user_email();
			console.log("verify button pressed");
			//window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {emailBody: emailBod, client: userEmail}}));
		});
	})
 */
 
 gmail.observe.on("open_email", function(id, url, body, xhr) {
	 console.log("hello.");
//console.log("the emai is: " + email.body());
  //console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
  //console.log(gmail.new.get.email_data(id));
})

    gmail.observe.on("compose", function(compose, type){
		//event listener from content
		window.addEventListener("ContentToExtension", function(e) {
		//add signature data from content.js to email
		const userEmail = gmail.get.user_email();
		const signature = e.detail;
	  console.log("msg from content to injected "+ signature);
	  
	  //sends to the current email address too, in addition to whoever else was in the send
	  compose.bcc(userEmail);
	  compose.body(compose.body() + signature +"YOU ADDD ME!");

	  //sendss email to avoid extra characters being added to signature text
	  compose.send();
  }, false);

        const userEmail = gmail.get.user_email();

		//sign function button
		gmail.tools.add_compose_button(compose, 'sign', function() {  
				var emailBod = compose.body();
				const userEmail = gmail.get.user_email();
				//send email to be signed to content script
				window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {emailBody: emailBod, client: userEmail}}));
				console.log("the body being signed:" + emailBod);
		});
    });
}

},{}]},{},[1]);
