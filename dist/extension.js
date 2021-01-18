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
	
	
	gmail.observe.on("load_email_menu", function(id,body) {//id, url, body, xhr
		
		/* gmail.tools.add_toolbar_button("verify", () => { 
			var emailBod = compose.body();
			const userEmail = gmail.get.user_email();
			console.log("verify button pressed");
			//window.dispatchEvent(new CustomEvent("verifyRequest", {detail: {emailBody: emailBod, client: userEmail}}));

		}); */
		
		gmail.tools.add_toolbar_button('verify', function() {
			console.log("toolbar button 2.0");
			//var emailBod = gmail.get.current_email().body;
			console.log(gmail.get.current_page().body+"#2");
			console.log(gmail.get.current_page()+"#3");
			//console.log(gmail.get.email_data().email.body+"#4");
			//console.log(gmail.dom.email_data(id)+"#5");
			console.log(body);


			const userEmail = gmail.get.user_email();
			console.log("verify button pressed");
			window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {emailBody: emailBod, client: userEmail}}));

		});
		
		//console.log("id:", id, "url:", url, 'body', body, 'xhr', xhr);
		//console.log(gmail.get.email_data(id));
	})


    gmail.observe.on("compose", function(compose, type){
        const userEmail = gmail.get.user_email();
        console.log("Hello, " + userEmail + ". This is your extension talking!");
		
        //gmail.tools.add_toolbar_button("verify", () => { console.log("verify button pressed"); });

		gmail.tools.add_compose_button(compose, 'sign', function() {  
				var emailBod = compose.body();
				const userEmail = gmail.get.user_email();
                compose.bcc(userEmail);
				window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {emailBody: emailBod, client: userEmail}}));

				console.log("the body being signed:" + emailBod);
				
		});
    });
	//targetWindow.postMessage("extension sending msg", "*");
	//window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: 'extension sending msg'}));
	console.log("got up to here");

}

},{}]},{},[1]);
