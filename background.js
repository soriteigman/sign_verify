// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request) {
		//alert("Background got a request!");
        if (request.msg == "sign/verify email") {
			releventData = request.data.userEmail+"\n" + request.data.emailBod
			//sends data to server
			accessServer(releventData,request.data.type)
			alert("I sent successfully! from background: client: " +request.data.userEmail + " body: " +request.data.emailBod);
		}
		
		 if (request.msg == "verify email") {
			releventData = request.data.userEmail+"\n" + request.data.emailBod
			//sends data to server
			accessServer(releventData,"v")
			alert("I sent successfully! from background: client: " +request.data.userEmail + " body: " +request.data.emailBod);
		}
	}			
});

	
//calls python server for signing and verifying
function accessServer(mess,type){
function callback() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
		result = xhr.responseText;

	  //deal with response if successful status
		if (xhr.status === 200) {
           alert("response received " +result)
		   
		   //response background to content
		   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		   chrome.tabs.sendMessage(tabs[0].id, {data:  "\n$@$@"+result+"$@$@"})});
		}
		else{ //error
			alert("error!" +result + "unable to sign your email.");
		   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {chrome.tabs.sendMessage(tabs[0].id, {data:  '\nunable to sign your email.'})});
		}
		
}};
var xhr = new XMLHttpRequest();
xhr.open("POST", "http://localhost:6626/hello", true);
xhr.onreadystatechange = callback;
xhr.send(mess+"\r\n\r\n"+type);
}