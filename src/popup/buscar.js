


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
    sendData(results[0])
    this.agregarBusquedaAlTitulo(results[0].busqueda)

    for (var i = 0; i < 5; i++) {
      ResultsPromediosInstance.initLinks(results, i)
      this.agregarTitulo(results[0], i)
      this.agregarTitulo(results[1], i)
      this.agregarTitulo(results[2], i)

    }
  })
  ResultsPromediosInstance.getArrays()

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
/* Class coincidencias --------------------------------------------------------*/

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

  createSpan(i, totalPeers, totalApariciones, sp){
    var sp = document.createElement("span")
    sp.setAttribute("id", (sp + i));
    var content = document.createTextNode(("    " +totalApariciones + ' de ' + totalPeers))
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
        (this.googleProms[i]).posPromedio = ((this.googleProms[i]).posPromedio  + results.indexOf((this.googleProms[i]).link)) / this.totalPeers        
      }
      var sp = this.createSpan(i, this.totalPeers, (this.googleProms[i]).totalApariciones, "g" )
      var rs = document.getElementById(("google" + i))
      var oldSpan = document.getElementById(("g" + i))
      this.renderSpan(oldSpan, rs, sp)

        
    }
    
  }
  checkInBing(results){
    for (var i = 0; i < 5; i++) {
      
      if(results.includes((this.bingProms[i]).link)){
        (this.bingProms[i]).totalApariciones++
        (this.bingProms[i]).posPromedio = ((this.bingProms[i]).posPromedio  + results.indexOf((this.bingProms[i]).link)) / this.totalPeers  
      }
      var sp = this.createSpan(i, this.totalPeers, (this.bingProms[i]).totalApariciones, "b" )
      var rs = document.getElementById(("bing" + i))
      var oldSpan = document.getElementById(("b" + i))
      this.renderSpan(oldSpan, rs, sp)
           
    }
    
  }
  checkInDuckDuckgo(results){
    for (var i = 0; i < 5; i++) {     
      if(results.includes((this.DuckDuckGoProms[i]).link)){
        (this.DuckDuckGoProms[i]).totalApariciones++
        (this.DuckDuckGoProms[i]).posPromedio = ((this.DuckDuckGoProms[i]).posPromedio  + results.indexOf((this.DuckDuckGoProms[i]).link)) / this.totalPeers
      }
      var sp = this.createSpan(i, this.totalPeers, (this.DuckDuckGoProms[i]).totalApariciones, "d" )
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

  getArrays(){
    console.log(this.googleProms)
    console.log(this.bingProms)
    console.log(this.DuckDuckGoProms)
  }

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

var ResultsPromediosInstance = new ResultsPromedios
requestResults()

browser.runtime.onMessage.addListener((request, sender) => {
  if ( request.call === 'PopupAction') {
    renderPromedios(request.results)
  }
});









