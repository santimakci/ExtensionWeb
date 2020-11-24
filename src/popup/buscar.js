

function agregarTitulo(results, i) {
  var capa = document.getElementById("cuerpo");
  var p = document.createElement("p");
  var imagen = document.createElement("div");
  var img = this.createSVG(results.buscador)
  url = '<a class="results" href="' + results.busquedas[i] + '">' + results.busquedas[i] + "</a>"
  para = "<p>" + img + "    " + url + "</p>"
  capa.innerHTML += para
}

function createSVG(buscador) {

  ruta = "img/" + buscador + ".png"
  img = '<img src="' + ruta + '" width=30 height=30>'
  return img
}

function agregarBusquedaAlTitulo(busqueda) {
  title = document.getElementById('titulo')
  title.innerHTML += busqueda
}


function requestResults() {

  browser.runtime.sendMessage({
    "call": 'listarResultados'
  }).then(results => {
    console.log(results)
    sendData(results[0])
    this.agregarBusquedaAlTitulo(results[0].busqueda)
    for (var i = 0; i < 5; i++) {
      this.agregarTitulo(results[0], i)
      this.agregarTitulo(results[1], i)
      this.agregarTitulo(results[2], i)
    }
  })
}


/* PS2 METHODS --------------------------------------------------------*/

function sendData(Response) {

  try {

    let usuarioSelected = usuarios.selectedIndex;


    let usuario = usuarios.options[usuarioSelected].value;

    p2pExtension.sendRequest({
      type: 'RequestResult',
      busqueda: Response.busqueda,
      automatic: false
    }, usuario);

  } catch (e) {
    console.log("Error al utilizar sendData.");
    console.log(e);
  }

}

function renderPromedios(results){
  console.log("RESULTADOSOJALAANDE")
  console.log(results)
}

browser.runtime.onMessage.addListener((request, sender) => {
  if ( request.call === 'PopupAction') {
    renderPromedios(request.results)
  }
});



requestResults()






