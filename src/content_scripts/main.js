class contentPage {


	  
	captarResultados(){
	  var oReq = new XMLHttpRequest();
	  oReq.open("GET", "https://duckduckgo.com/?q=pais&t=h_&ia=web");
	  oReq.send();}

	captarBusqueda(){
		const params = new URL(location.href).searchParams; //Estas dos lineas captar la busqueda enviada por metodo get en los buscadores
		const busqueda = params.get('q');					// y la guardan en la variable busqueda
		var urltab = window.location.hostname
		console.log(this.captarResultados())	
		console.log(busqueda)
		console.log( urltab) 

    }
	

/*     imprimirUrl(){
         
        document.querySelectorAll("body").forEach(div => {
			div.addEventListener("dblclick", (evt) => {
				
                this.highlightDomElement(evt.target);
                var urltab = window.location
               console.log( urltab) 
    }
 )} )} */

}


var pageManager = new contentPage();

pageManager.captarBusqueda()

browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[content-side] calling the message: " + request.call);
	if(pageManager[request.call]){
		pageManager[request.call](request.args);
	}
});
