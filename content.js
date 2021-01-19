//content.js

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	  console.log("hello. this is my turn.");

   if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");
      console.log(firstHref);
    }
  }
);
//"default_popup": "popup.html",

/* window.addEventListener("message", (event) => {
	//if (event.origin !== "https://mail.google.com")
    //return;
	console.log("got a msg from window thing"+ event.message+" event.origin: "+event.origin);
}, false); */


window.addEventListener("MyCustomMsg", function(e) {
  console.log("msg from injected e sign "+e.detail.emailBody+e.detail.client);
  
  chrome.runtime.sendMessage({ msg: "sign email", data: {userEmail: e.detail.client, emailBod: e.detail.emailBody}}, (response) => {
    // If this message's recipient sends a response it will be handled here 
    if (response) {
      // do cool things with the response
      console.log("received response from background");

	  //window.dispatchEvent(new CustomEvent("ContentToExtension", {detail: {hello: hi}}));
	  console.log("end of response dealing content.js");
    }
});
}, false);


/**
messages from background
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.data + "yay content got from extension.!!!!")
    return true
});

console.log("end of all the functions.")