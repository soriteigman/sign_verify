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
		//alert("Background got a request!");
        if (request.msg == "sign email") {
			releventData = request.data.userEmail+"\n" + request.data.emailBod
			//sends data to server
			accessServer(releventData)
			alert("I sent successfully! from background: client: " +request.data.userEmail + " body: " +request.data.emailBod);
}}		
		if (request.msg == "verify email") {
			alert(" client: " +request.data.userEmail);
			alert(" body: " +request.data.emailBod);
            sendResponse({ sender: "content.js"/*, data: parsedTextFieldContent*/  }); // This response is sent to the message's sender 
   		}
		
        if (request.msg == "content talking to background") {
            // do cool things with the request then send response
            //alert("msg received from content to background" );
            sendResponse({ sender: "content.js"/*, data: parsedTextFieldContent*/  }); // This response is sent to the message's sender 
        }
});

	
//calls python server for signing and verifying
function accessServer(mess){
function callback() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
		alert("extension http req done") 
		//response background to content
			 chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {data: xhr.responseText, data1: "hello"});});
        //deal with response if successful status
		if (xhr.status === 200) {
            result = xhr.responseText;
           alert("response received " +result)
		   
		   //response background to content
		   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		   chrome.tabs.sendMessage(tabs[0].id, {data: "hello"})});
			}
		
}};
var xhr = new XMLHttpRequest();
xhr.open("POST", "http://localhost:5525/hello", true);
xhr.onreadystatechange = callback;
xhr.send(mess+"\r\n\r\n");
}