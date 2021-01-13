// background.js
//alert("this is the background script speaking");

// Called when the user clicks on the browser action. 
/*chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  alert("I was clicked!");
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
 });
});
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request) {
		alert("BAckground got a request!");
        if (request.msg == "sign email") {
            // do cool things with the request then send response
			//" body: " + request.emailBod);
			alert(" regular: " +request.data);
			alert(" client: " +request.data.userEmail);
			alert(" body: " +request.data.emailBod);

		}
		
        if (request.msg == "content talking to background") {
            // do cool things with the request then send response
            //alert("msg received from content to background" );
            sendResponse({ sender: "content.js"/*, data: parsedTextFieldContent*/  }); // This response is sent to the message's sender 
        }
		//alert(request.msg);
    }
});