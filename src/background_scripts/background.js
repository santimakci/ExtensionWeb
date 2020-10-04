class BackgroundExtension {

	captarBusqueda(){
		browser.tabs.sendMessage({
			call: "captarBusqueda"
	} )}

	google(args){
		return new Promise( (resolve, reject) =>{
			console.log('entro en google')
			var url = 'http://www.google.com/' + '?' + 'q=' + args.busqueda

			var request = new XMLHttpRequest();
			
			request.onreadystatechange = () => {
				if(request.status === 200){
					var parser = new DOMParser()
					var doc = parser.parseFromString(request.response, "text/html");
					console.log(doc.title)
					var divs = doc.getElementsByTagName('HEAD')
					console.log(divs.length)
					Array.from(divs).forEach(element => {
						console.log(element)
						
					});
					resolve('request')	}}
			request.open("GET", 'www.google.com', true);
			request.send(null);	
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

			const request = new Request('www.google.com', {headers:{'Content-Type': "text/html"}});
			fetch(request).then(
				(response) => { 
					var parser = new DOMParser()
					var doc = parser.parseFromString(response, "text/html");
					console.log(doc.title)
				}
			)

			
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

