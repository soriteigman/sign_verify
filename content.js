//content.js
alert("I'm alive!");
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
	if (event.origin !== "https://mail.google.com")
    return;
	console.log("got a msg from window thing"+ event.msg);
}, false); */

chrome.runtime.sendMessage({ msg: "content talking to background"/*, data: textFieldContent*/ }, (response) => {
    // If this message's recipient sends a response it will be handled here 
    if (response) {
      // do cool things with the response
      alert("received response from background");
    }
});

//,"content.js"  -from manifest