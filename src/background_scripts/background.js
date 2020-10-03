class BackgroundExtension {

	captarBusqueda(){
		browser.tabs.sendMessage({
			call: "captarBusqueda"
	} )}

	google(args){
		return new Promise( (resolve) =>{
			console.log('entro en google')
			resolve('resultado')	
		});
	}

	duckduckgo(args){
		return new Promise( (resolve) =>{
			console.log('entro en duckduckgo')
			resolve('resultado')	
		});
	}

	bing(args){
		return new Promise( (resolve) =>{
			console.log('entro en bing')
			resolve('resultado')	
		});
	}
   
}

var extension = new BackgroundExtension() 

browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[background-side] calling the message: " + request.call);
	if(extension[request.call]){
		return extension[request.call](request.args);
	} } )

