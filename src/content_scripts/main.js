class contentPage {


	  

	captarBusqueda(){
		var busquedas = []
		const params = new URL(location.href).searchParams; //Estas dos lineas captar la busqueda enviada por metodo get en los buscadores
		const busqueda = params.get('q');					// y la guardan en la variable busqueda
		var buscador = window.location.hostname	
		console.log(busqueda)
		console.log(buscador) 
		document.querySelectorAll("div cite").forEach(H3 => {
			if (H3.innerText != ""){
				busquedas.push(H3.innerText)
			}
			
		});

		browser.runtime.sendMessage({
			"call": "promesa"
		}).then(respuesta => {
			console.log(respuesta)
		})

		browser.runtime.sendMessage({
			"call": "googleResults",
			"args": {
				"buscador": buscador,
				"busqueda": busqueda
			}
		}).then(news => {
			console.log(news)
		});
		
	}

}


var pageManager = new contentPage();


browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[content-side] calling the message: " + request.call);
	if(pageManager[request.call]){
		pageManager[request.call](request.args);
	}
});
