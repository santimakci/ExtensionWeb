

/* Métodos para renderizar los resultados del popup*/
function agregarTitulo(results, i) {
  var capa = document.getElementById("cuerpo");
  var p = document.createElement("p");
  var imagen = document.createElement("div");
  var img = this.createSVG(results.buscador)
  url = '<a class="results" href="' + results.busquedas[i] + '">' + results.busquedas[i] + "</a>"
  para = '<p id="'+ results.buscador + i + '">' + img + "    " + url + "</p>      "
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
    
    try{
    
    sendData(results[0])
    
    this.agregarBusquedaAlTitulo(results[0].busqueda)

    for (var i = 0; i < 5; i++) {
      ResultsPromediosInstance.initLinks(results, i)
      this.agregarTitulo(results[0], i)
      this.agregarTitulo(results[1], i)
      this.agregarTitulo(results[2], i)

    }
  }
    catch{
      console.log("se produjo un error en requestResults", results)
    }
  })

}


function renderPromedios(results){
  ResultsPromediosInstance.incrementPeers()
  results.forEach(res => {
      switch(res.buscador){
        case "google":
          ResultsPromediosInstance.checkInGoogle(res.busquedas)
          break;
        case "bing":
          ResultsPromediosInstance.checkInBing(res.busquedas)
          break;
        case "duckduckgo":
          ResultsPromediosInstance.checkInDuckDuckgo(res.busquedas)
          break;
      }
      
    });

  
}

/* --------------------------------------------------------*/

/* Class para manejar el promedio y las ocurrencias en los resultados de los peers*/

class ResultsPromedios{

  constructor(){
    this.googleProms = []
    this.bingProms = []
    this.DuckDuckGoProms = []
    this.totalPeers = 0
  }

  incrementPeers(){
    this.totalPeers++
  }

  createSpan(i, totalPeers, totalApariciones, sp, prom){
    var sp = document.createElement("span")
    sp.setAttribute("id", (sp + i));
    var content = document.createTextNode("  | Posición promedio: " +  prom + (" ( " +totalApariciones + ' de ' + totalPeers + ")"))
    sp.appendChild(content)
    return sp

  }

  renderSpan(oldSpan, rs, sp){
    if (oldSpan != null) {
        var parent = oldSpan.parentNode;
        parent.replaceChild(sp, oldSpan);
    }
   else {
    rs.appendChild(sp)
  }
}

  checkInGoogle(results){
    
    for (var i = 0; i < 5; i++) {
      if(results.includes((this.googleProms[i]).link)){
        (this.googleProms[i]).totalApariciones++
        var pos = results.indexOf((this.googleProms[i]).link)
        pos++
        (this.googleProms[i]).posPromedio = ((this.googleProms[i]).posPromedio  + pos) / this.totalPeers        
      }


      var sp = this.createSpan(i, this.totalPeers, (this.googleProms[i]).totalApariciones, "g", this.googleProms[i].posPromedio )
      var rs = document.getElementById(("google" + i))
      var oldSpan = document.getElementById(("g" + i))
      this.renderSpan(oldSpan, rs, sp)

        
    }
    
  }
  checkInBing(results){
    for (var i = 0; i < 5; i++) {
      
      if(results.includes((this.bingProms[i]).link)){
        (this.bingProms[i]).totalApariciones++
        var pos = results.indexOf((this.bingProms[i]).link)
        pos++
        (this.bingProms[i]).posPromedio = ((this.bingProms[i]).posPromedio  + pos) / this.totalPeers  
      }
      var sp = this.createSpan(i, this.totalPeers, (this.bingProms[i]).totalApariciones, "b", this.bingProms[i].posPromedio )
      var rs = document.getElementById(("bing" + i))
      var oldSpan = document.getElementById(("b" + i))
      this.renderSpan(oldSpan, rs, sp)
           
    }
    
  }
  checkInDuckDuckgo(results){
    for (var i = 0; i < 5; i++) {     
      if(results.includes((this.DuckDuckGoProms[i]).link)){
        (this.DuckDuckGoProms[i]).totalApariciones++
        var pos = results.indexOf((this.DuckDuckGoProms[i]).link)
        pos++
        (this.DuckDuckGoProms[i]).posPromedio = ((this.DuckDuckGoProms[i]).posPromedio  + pos) / this.totalPeers
      }
      var sp = this.createSpan(i, this.totalPeers, (this.DuckDuckGoProms[i]).totalApariciones, "d", this.DuckDuckGoProms[i].posPromedio )
      var rs = document.getElementById(("duckduckgo" + i))
      var oldSpan = document.getElementById(("d" + i))
      this.renderSpan(oldSpan, rs, sp)

    }
    
  }

  createCont(res, i){
    var cont = {
      "link": res.busquedas[i],
      "posPromedio": 0,
      "totalApariciones":0,
    } 
    return cont
  }

  initLinks(results, i){
    results.forEach(res => {
      switch(res.buscador){
        case "google":
          this.googleProms.push(this.createCont(res, i))
          break;
        case "bing":
          this.bingProms.push(this.createCont(res, i))
          break;
        case "duckduckgo":
          this.DuckDuckGoProms.push( this.createCont(res, i) )
          break;
      }
      
    });

  }

}

/* --------------------------------------------------------*/

/* P2P METHODS, Captar los peers y enviar la busqueda para renderizar en la página*/
var backgroundPage_1 = browser.extension.getBackgroundPage();
var usuarios = document.getElementById("listusers");
var listItems = document.getElementById("listitems");
var p2pExtension = backgroundPage_1.sample;


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
    console.log(Response)
    console.log(e);
  }

}

function loadUsersCustom(event) {
  try {

    let listaUsuarios = p2pExtension.getDataCallBack();

    if (listaUsuarios != null || listaUsuarios != undefined || listaUsuarios !== "undefined") {

      let usuarios = document.getElementById("listusers");
      let optionOne = new Option("All", "All");
      usuarios.options.length = 0;
      usuarios.options[usuarios.options.length] = optionOne;
      for (let i in listaUsuarios.peers) {
        if (listaUsuarios.peers.hasOwnProperty(i)) {
          let optionNew = new Option(listaUsuarios.peers[i].username, listaUsuarios.peers[i].username);
          usuarios.options[usuarios.options.length] = optionNew;
        }
      };
    };

  } catch (e) {
    console.log("Error al cargar lista de usuarios");
    console.log(e);
  }
}

/* ---------------------------------------------- */


var ResultsPromediosInstance = new ResultsPromedios
requestResults()


/* Listeners de recepción de resultados y peers */
browser.runtime.onMessage.addListener((request, sender) => {
  if ( request.call === 'PopupAction') {
    renderPromedios(request.results)
  }
});


document.addEventListener('DOMContentLoaded', function () {
  p2pExtension.getQueryP2P(loadUsersCustom, 'peers', {});
});








