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
		alert("Background got a request!");
        if (request.msg == "sign email") {
			alert(" client: " +request.data.userEmail + " body: " +request.data.emailBod);
			accessServer(request.data.userEmail+"\n" + request.data.emailBod)
			
            //sendResponse({ sender: "content.js"/*, data: parsedTextFieldContent*/  }); // This response is sent to the message's sender 

			 
   		}
		
		/* if (request.msg == "verify email") {
			alert(" client: " +request.data.userEmail);
			alert(" body: " +request.data.emailBod);

            //sendResponse({ sender: "content.js"/*, data: parsedTextFieldContent  }); // This response is sent to the message's sender 

			 
   		} */
		
        if (request.msg == "content talking to background") {
            // do cool things with the request then send response
            //alert("msg received from content to background" );
            sendResponse({ sender: "content.js"/*, data: parsedTextFieldContent*/  }); // This response is sent to the message's sender 
        }
		//alert(request.msg);
    }
});

function accessServer(mess){
function callback() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
		alert("i'm done")

        if (xhr.status === 200) {
            result = xhr.responseText;
           alert("response received " +result)
        }
    }
};
var xhr = new XMLHttpRequest();
xhr.open("POST", "http://localhost:5525/hello", true);
xhr.onreadystatechange = callback;
xhr.send(mess+"\r\n\r\n");
/*"lng uninteligent sentence that can act as some long long data which will sort of be like what we really want to send. which is - not sure what actualy. bytes? sometimes - in verify.\r\n\r\n");*/
}
