//content.js

/**
messages from background
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
content = message.data; 
 console.log(content + " content from background.");
	//send message to extension.js with signature
  var event = new CustomEvent('ContentToExtension', {detail: content});
  window.dispatchEvent(event);
    return true;
});

//"default_popup": "popup.html",

/* window.addEventListener("message", (event) => {
	//if (event.origin !== "https://mail.google.com")
    //return;
	console.log("got a msg from window thing"+ event.message+" event.origin: "+event.origin);}, false); */

window.addEventListener("MyCustomMsg", function(e) {
	console.log("msg from injected e sign "+e.detail.type+e.detail.emailBody+e.detail.client);
	chrome.runtime.sendMessage({ msg: "sign/verify email", data: {type: e.detail.type, userEmail: e.detail.client, emailBod: e.detail.emailBody}});
  
}, false);
