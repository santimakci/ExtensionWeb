class BackgroundExtension {

	captarBusqueda(){
		browser.tabs.sendMessage({
			call: "captarBusqueda"
	} )}

	googleResults(args){
		return new Promise( (resolve) => {
			var parser = new DOMParser();
			var doc = parser.parseFromString(args.url, "text/html");
			console.log(doc)
			var busquedas = []
			doc.querySelectorAll("div cite").forEach(H3 => {
				if (H3.innerText != ""){
					busquedas.push(H3.innerText)
				}
			})
				resolve(busquedas)
		}) }


   
}

var extension = new BackgroundExtension() 

browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[background-side] calling the message: " + request.call);
	if(extension[request.call]){
		return extension[request.call](request.args);
	} } )

