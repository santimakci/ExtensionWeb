class BackgroundExtension {


    imprimirUrl(){
		this.getCurrentTab().then((tabs) => {
			browser.tabs.sendMessage(tabs[0].id, {
				call: "imprimirUrl"
			});
		});
	}

    getCurrentTab(callback) {
		return browser.tabs.query({
			active: true,
			currentWindow: true
		});
	}
   
}

var startBackground = function(config) {
	var extension = new BackgroundExtension(config.apiUrl);

	browser (() => {
	  extension.imprimirUrl();
	});

	browser.runtime.onMessage.addListener((request, sender) => {
		console.log("[background-side] calling the message: " + request.call);
		if(extension[request.call]){
			return extension[request.call](request.args);
		}
	});
}


function checkExpectedParameters(config){
	if (config == undefined)
		return false;

    var foundParams = ["apiUrl"].filter(param => (param && config.hasOwnProperty(param)));
    return (config.length == foundParams.length);
}

browser.storage.local.get("config").then(data => {
    if (!checkExpectedParameters(data.config)) {
        data.config = {
        	"apiUrl": ""
        };
        //Si no se setea, se puede perder consistencia con lo que se lee en la pagina de config
        browser.storage.local.set({"config": data.config }).then(() => startBackground(data.config));
    }
    else startBackground(data.config);
});

//Listening for background's messages
browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[content-side] calling the message: " + request.call);
	if(pageManager[request.call]){
		pageManager[request.call](request.args);
	}
});
