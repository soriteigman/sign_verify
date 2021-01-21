//uses gmail.js api
//dist/extension.js


(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }
    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

// actual extension-code
function startExtension(gmail) {
    console.log("Extension loading...");
    window.gmail = gmail;

	/* gmail.observe.on("load_email_menu", function(obj) {/
	
		/* gmail.tools.add_toolbar_button("verify", () => { 
			var emailBod = compose.body();
			const userEmail = gmail.get.user_email();
			console.log("verify button pressed");
			//window.dispatchEvent(new CustomEvent("verifyRequest", {detail: {emailBody: emailBod, client: userEmail}}));

		}); *//*
		
		gmail.tools.add_toolbar_button('verify', function() {
			
			console.log("toolbar button 2.0");
			//var emailBod = gmail.get.current_email().body;
			//console.log(gmail.get.current_page().body+"#2");
			//console.log(gmail.get.current_page()+"#3");
			//console.log(gmail.get.email_data().email.body+"#4");
			//console.log(gmail.dom.email_data(id)+"#5");
			//console.log(body);

			const userEmail = gmail.get.user_email();
			console.log("verify button pressed");
			//window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {emailBody: emailBod, client: userEmail}}));
		});
	})
 */
 
 gmail.observe.on('view_email', function(obj) {
	console.log('individual email opened', obj);  // gmail.dom.email object
	const userEmail = gmail.get.user_email();
	var id=gmail.new.get.email_id();
	console.log(id);
	var data=gmail.new.get.email_data(id);
	console.log(data);
	var emailBod=data.content_html;
	console.log(emailBod);
	
	var sequence="$@$@";
		var i=0; 
		var result="";   
		//extracts signed part of email body
		while(i<emailBod.length-8){

			if(emailBod[i]==sequence[0] && emailBod[i+1]==sequence[1]&&emailBod[i+2]==sequence[2]&&emailBod[i+3]==sequence[3]){
				i=i+4;
				while(i<emailBod.length-4){
					if(emailBod[i]==sequence[0]&&emailBod[i+1]==sequence[1]&&emailBod[i+2]==sequence[2]&&emailBod[i+3]==sequence[3]){
						i=emailBod.length;//leave both loops.
						}
					else{
						result=result+emailBod[i];
						i=i+1;
					}
				}
			}
			else{
				i=i+1;
			}
		}
		console.log(result);
		//console.log(removeTags(result));
		console.log(stripHtml(result));

		//var result = "kajdf;lajoiewjdlkajdlfkjiefj"; 
		console.log(result);
		/*clearText = "";
		
		//take out " and <> parts from result
		var j=0;
		while(j<result.length){
			alert(result[j]);
			if(result[j] != " \"" && result[j] != "<"){
				clearText = clearText + result[j];
			}
			//skipts all text inside div <----->
			else if (result[j] == "<"){
				j = j+1
				while (j < result.length && result[j] != ">"){
					j=j+1;
				}
			}
			j=j+1;
		}
		console.log("the text only: " + clearText);*/
		window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {type: "v", emailBody: stripHtml(result), client: userEmail}}));
		console.log("dispatched event with clearText");
  
});

/* <script> 
function removeTags(str) { 
    if ((str===null) || (str==='')) 
        return false; 
    else
        str = str.toString(); 
          
    // Regular expression to identify HTML tags in  
    // the input string. Replacing the identified  
    // HTML tag with a null string. 
    return str.replace( /(<([^>]+)>)/ig, ''); 
} 

</script>  */ 
function stripHtml(html)
{
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}    

 
	/*gmail.observe.on("open_email", function(id, url, body, xhr) {
 		(const userEmail = gmail.get.user_email();
		var id1=gmail.new.get.email_id();
		console.log(id1);
		var data=gmail.new.get.email_data(id1);
		console.log(data);
		if (!data){
			data=gmail.new.get.email_data();
			console.log(data);
		}
		var emailBod=data.content_html;
		console.log(emailBod);
		var sequence="$@$@";
		var i=0; 
		var result="";   
		//extracts signed part of email body
		while(i<emailBod.length-8){

			if(emailBod[i]==sequence[0] && emailBod[i+1]==sequence[1]&&emailBod[i+2]==sequence[2]&&emailBod[i+3]==sequence[3]){
				i=i+4;
				while(i<emailBod.length-4){
					if(emailBod[i]==sequence[0]&&emailBod[i+1]==sequence[1]&&emailBod[i+2]==sequence[2]&&emailBod[i+3]==sequence[3]){
						i=emailBod.length;//leave both loops.
						}
					else{
						result=result+emailBod[i];
						i=i+1;
					}
				}
			}
			else{
				i=i+1;
			}
		}
		console.log(result);
		
		var result = "kajdf;lajoiewjdlkajdlfkjiefj"; 
		console.log(result);
		clearText = "";
		//take out " and <> parts from result
		var j=0;
		while(j<result.length){
			alert(result[j]);
			if(result[j] != " \"" && result[j] != "<"){
				clearText = clearText + result[j];
			}
			//skipts all text inside div <----->
			else if (result[j] == "<"){
				j = j+1
				while (j < result.length && result[j] != ">"){
					j=j+1;
				}
			}
			j=j+1;
		}
		console.log("the text only: " + clearText);*/
		/*window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {type: "v", emailBody: clearText, client: userEmail}}));

		console.log("got till here open email func");
			
	});*/

    gmail.observe.on("compose", function(compose, type){
		//event listener from content
		window.addEventListener("ContentToExtension", function(e) {
			//add signature data from content.js to email
			const userEmail = gmail.get.user_email();
			const signature = e.detail;
			console.log("msg from content to injected "+ signature);
	  
			//sends to the current email address too, in addition to whoever else was in the send
			compose.bcc(userEmail);
			compose.body(compose.body() + signature);

			//sendss email to avoid extra characters being added to signature text
			compose.send();
		}, false);

        const userEmail = gmail.get.user_email();

		//sign function button
		gmail.tools.add_compose_button(compose, 'sign', function() {  
				var emailBod = compose.body();
				const userEmail = gmail.get.user_email();
				//send email to be signed to content script
				window.dispatchEvent(new CustomEvent("MyCustomMsg", {detail: {type: "s", emailBody: emailBod, client: userEmail}}));
				console.log("the body being signed:" + emailBod);
		});
    });
}

},{}]},{},[1]);
