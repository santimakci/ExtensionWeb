
/*
* Copyright ragonzalez@disroot.org. Licensed under MIT
* See license text at https://mit-license.org/license.txt
*/
var url_text = "";
var remoteuser = "";
var jquery_link;
var popper_link;
var bootstrap_link;
var boostrap_css;
var tabActive = null;

//variables que usa el process local

var remoteuser;
var remoteResponse = null;
var ports = [];
var portFromCS;


function getDataResultadoP2P() {
  return remoteResponse;
}

function getRemoteUser() {
  try {
    return remoteuser;
  } catch (e) {
    console.log("Error el retornar usuario peer");
    console.log(e);
  }
}



class BuscadorP2P extends AbstractP2PExtensionBackground {

  constructor() {
    super();
    this.listado = {};
    this.dataTemp = null;
    this.setExtensionName("buscadorP2P");
    this.setExtensionId(browser.runtime.id);
  }

  initialize() {

  }

  processRequest(msg, peer) {
    try {
      remoteuser = peer;
      if (msg.type === "RequestResult") {

        console.log("Llegó solicitud de búsqueda resultados");
        var buscadorInstance = new BackgroundExtension
        var results = []
        /* Generamos los resultados de los 3 buscadores */
        results.push(buscadorInstance.googleResults(msg.busqueda))
        results.push(buscadorInstance.duckduckgoResults(msg.busqueda))
        results.push(buscadorInstance.bingResults(msg.busqueda))

        browser.notifications.create({
          "type": "basic",
          "title": "Solicitud de resultados",
          "message": "DESDE: " + peer
        });

        this.sendResponse({
          type: 'check',
          status: true,
          automatic: false,
          searchResults: results
        }, peer);


      } else {

        browser.notifications.create({
          "type": "basic",
          "title": "Sin actividad",
          "message": "Se solicitó una actividad no reconocida"
        });

      }

    }
    catch (e) {
      console.log("Error al realizar processRequest.");
      console.log(e);
    }

  }

  processResponse(msg, peer) {
    try {
      console.log("SIN ACTIVIDAD PROCESS RESPONSE.");
    } catch (e) {
      console.log("Ocurrio una exception con el response: ");
      console.error(e);
    }
  }

  receiveResponse(msg, peer) {
    try {
      if (msg.type === 'check') {
        console.log("Llegaron los resultados");
        var buscadorInstance = new BackgroundExtension
        buscadorInstance.printPeers(msg.searchResults)
        /* Le mandamos al popup los resultados que llegan */
        browser.runtime.sendMessage({
          "call": "PopupAction",
          "results": msg.searchResults
        })

        browser.notifications.create({
          "type": "basic",
          "title": "Llegaron resultados",
          "message": "DESDE: " + peer
        });
      } else {
        console.log("SIN ACTIVIDAD RECEIVE RESPONSE.");
      }
    } catch (e) {
      console.log("Ocurrio una exception con receiveResponse: ");
      console.error(e);
    }
  }


}

var sample = new BuscadorP2P();
sample.connect();