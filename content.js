//content.js

/**
messages from background
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.data + " content from background.");
	//send message to extension.js
	//window.dispatchEvent(new CustomEvent("sendChromeData", {detail: {res: response}}));
 content = "I:M HERE FROM THE CONTENT SCRIOT!!!";
  var event = new CustomEvent('sendChromeData', {detail: content});
  window.dispatchEvent(event);
	console.log("sent event from content!");
    return true;
});

//"default_popup": "popup.html",

/* window.addEventListener("message", (event) => {
	//if (event.origin !== "https://mail.google.com")
    //return;
	console.log("got a msg from window thing"+ event.message+" event.origin: "+event.origin);}, false); */

window.addEventListener("MyCustomMsg", function(e) {
  console.log("msg from injected e sign "+e.detail.emailBody+e.detail.client);
  chrome.runtime.sendMessage({ msg: "sign email", data: {userEmail: e.detail.client, emailBod: e.detail.emailBody}}, (response) => {
    // If this message's recipient sends a response it will be handled here 
    if (response) {
      // do cool things with the response
      console.log("received response from background");
	  //window.dispatchEvent(new CustomEvent("ContentToExtension", {detail: {hello: hi}}));
    }
});
}, false);
