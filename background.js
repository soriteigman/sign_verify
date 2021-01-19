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
<<<<<<< HEAD

chrome.contextMenus.create({
    title: 'verify',
    onclick: function(e){
        console.log(e)
    }

}, function(){})
=======
/*$.ajax({
  type: "POST",
  url: "http://localhost:5525/hello",
  data: { d: "hello everyone1" },
  success: function(data){
          alert("I got a response!!!!  " + this.responseText);

  }
});
*/

function callback() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
		alert("i'm done! the response is" + xhr.responseText)

        if (xhr.status === 200) {
            result = xhr.responseText;
           alert("it worked!" +result)
        }
    }
};
var xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:5525/hello", true);
xhr.onreadystatechange = callback;
xhr.send();

/*var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    }
  };
  alert("sending http request")
  xhttp.open("GET", "http://localhost:5525/hello", true);
  xhttp.send();
  alert("just respond!!!!!")
  */
>>>>>>> e8fe709e57bb5e65848195f9ab69157219a0634a
