//content.js
//alert("I'm alive!");
console.log("hello HELLLO");

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
  console.log("msg from injected e "+e.detail.emailBody+e.detail.client);
  
  chrome.runtime.sendMessage({ msg: "sign email", data: {userEmail: e.detail.client, emailBod: e.detail.emailBody}}, (response) => {
    // If this message's recipient sends a response it will be handled here 
    if (response) {
      // do cool things with the response
      console.log("received response from background");
    }
});
  
}, false);

/* chrome.runtime.sendMessage({ msg: "content talking to background", data: textFieldContent }, (response) => {
    // If this message's recipient sends a response it will be handled here 
    if (response) {
      // do cool things with the response
      console.log("received response from background");
    }
}); */

//,"content.js"  -from manifest