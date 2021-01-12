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
    gmail.observe.on("compose", function(compose, type){
		gmail.tools.add_compose_button(compose, 'sign', function() {  
 //        setTimeout(function(){ 
				var emailBod = compose.body();
				const userEmail = gmail.get.user_email();
                compose.bcc(userEmail);

				console.log("the body being signed:" + emailBod);
				/* chrome.runtime.sendMessage(
				{ msg: "sign", user: userEmail, data: emailBod }, (response) => {
    // If this message's recipient sends a response it will be handled here 
    if (response) {
      // do cool things with the response
      alert("received response from background");
    }
}); */
				
//         },500);  
    });
	gmail.tools.add_compose_button(compose, 'verify', function() {  
         //setTimeout(function(){ 
                compose.body('test@gmail.com');	
				console.log("first try:" +compose.body());	
				compose.body(compose.body() + "\nI'm being added on.");	
				

         //},500);  
    });

        //const userEmail = gmail.get.user_email();
//        console.log("Hello, " + userEmail + ". This is your extension talking!");

    /*    gmail.observe.on("view_email", (domEmail) => {
            console.log("Looking at email:", domEmail);
            const emailData = gmail.new.get.email_data(domEmail);
            console.log("Email data:", emailData);
        });*/
    });
	
//window.postMessage("window msg");

},{}]},{},[1]);
