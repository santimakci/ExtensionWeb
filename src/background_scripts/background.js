class BackgroundExtension {

	captarBusqueda(){
		browser.tabs.sendMessage({
			call: "captarBusqueda"
	} )}

	googleResults(args){
		return new Promise( (resolve) => {
			var busquedas = []
			document.querySelectorAll("div cite").forEach(H3 => {
				if (H3.innerText != ""){
					busquedas.push(H3.innerText)
				}
			})
				resolve("holaaa")
		}) }

	promesa(){
		return new Promise((resolve) => {
			resolve("Promesa de prueba")
		}
		)
	}

   
}

var startBackground = function() {
	var extension = new BackgroundExtension();

	extension.captarBusqueda()

	browser.runtime.onMessage.addListener((request, sender) => {
		console.log("[background-side] calling the message: " + request.call);
		if(extension[request.call]){
			return extension[request.call](request.args);
		}
	});
}

