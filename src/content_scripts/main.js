

class contentPage {

  constructor() {
    this.page = null
  }

  imprimirPeers(args) {
    (this.page).imprimirPeers(args.results)
  }

  identificarBuscador(buscador) {
    var separador = "."
    var limite = 2
    var arregloDeSubCadenas = buscador.split(separador, limite)
    if (arregloDeSubCadenas[1] === "com") {
      return "duckduckgo"
    }
    else {
      return arregloDeSubCadenas[1]
    }
  }

  mostrarPos(args) {
    (this.page).imprimirPos(args.resultados)
  }

  guardarBusqueda() {
    const params = new URL(location.href).searchParams; //Estas dos lineas captarn la busqueda enviada por metodo get en los buscadores
    return params.get('q');

  }

  captarBusqueda() {
    return new Promise((resolve) => {
      var busqueda = this.guardarBusqueda()
      if (busqueda != null) {
        var buscador = this.identificarBuscador(window.location.hostname)
        this.page = eval('new ' + buscador + '()')
        var busquedas = (this.page).buscar()
        var search = new SearchResult(buscador, busqueda, busquedas);
        browser.runtime.sendMessage({
          "call": "captarResults",
          "args": {
            "search": search
          }
        }).then(news => {
          resolve(news)
        });
      }

    });
  }

}



class Buscador {
  /* Métodos abstractos ejecutados en las clases hijas */
  constructor() {
    this.totalPeers = 0
    this.totalPeersCoincidence = 0
    this.resultsPage = []
    this.busquedas = []
  }

  buscar() { }
  imprimirPos() { }
  imprimirPeers() { }
  createSpan(i){
    var sp = document.createElement("span")
    sp.setAttribute("id", ("sp" + i));
    sp.style.borderRadius = "50%"
    sp.style.borderStyle = "groove"
    sp.style.padding = "10px"
    var content = document.createTextNode((this.resultsPage[i] + 'de' + this.totalPeers))
    sp.appendChild(content)
    return sp

  }
  initializeResultsPage(BusquedasLength){
    for (var i = 0; i <= BusquedasLength; i++) {
      this.resultsPage[i] = 0
    }
  }
  printResults(nodo, buscador, result){
    let ruta = browser.extension.getURL("img/" + buscador + ".png")
    nodo.innerHTML += ' <img src="' + ruta + '" width=30 height=30>  <strong style="font-size: x-large;" >' + result + "</strong> "    
}
  appendSpan(i, nodo){
    var sp = this.createSpan(i)
    var oldSpan = document.getElementById(("sp" + i))
    if (oldSpan != null) {
      var parentDiv = oldSpan.parentNode;
      parentDiv.replaceChild(sp, oldSpan);
    }
    else {
      nodo.appendChild(sp)
    }
  
}

}

class bing extends Buscador {

  buscar() {
    var anchors = document.querySelectorAll("div cite")
    Array.from(anchors).forEach(href => {
        if ((href.innerText).includes('http')) {
          this.busquedas.push(href.innerText)
      }
    })
    this.busquedas = Array.from(new Set(this.busquedas))
    this.initializeResultsPage(this.busquedas.length)
    return this.busquedas
  }

  imprimirPeers(resultados) {

    this.totalPeers++
    let bingResults = resultados[2].busquedas
    let divs = document.getElementsByClassName("b_algo") 
    divs = Array.from(divs)
    for (var i = 0; i < divs.length; i++) {
      Array.from(divs[i].getElementsByTagName('h2')).forEach(h2 => {
        Array.from(h2.getElementsByTagName('a')).forEach(href => {
          if ( bingResults.includes(href.getAttribute('href')) ){
            this.resultsPage[i] += 1
          }   
          this.appendSpan(i,h2)
        })
      })
    }
  }

  imprimirPos(resultados) {
    let divs = document.getElementsByClassName("b_algo") /* Me traigo todos los divs donde hay que imprimir */
    Array.from(divs).forEach(div => {
      Array.from(div.getElementsByTagName('h2')).forEach(h2 => {
        Array.from(h2.getElementsByTagName('a')).forEach(href => {
          let google = 0 // Estas variables indican la posicion de la direccion del div en los otros buscadores
          let duckduckgo = 0 // por defecto se inicializan en 0 para cada div
          resultados.forEach(res => {  //recorremos los resultados
            if (res.buscador != 'bing') { // entramos en aquellos que no sea igual a la pagina que estamos escribiendo
              for (var i = 0; i < (res.busquedas).length; i++) { //Recorremos todas las busquedas del primer resultado que no sea google
                if (href.getAttribute('href') === (res.busquedas[i])) { // Si coincide el link con alguno de los resultados de los otros buscadores
                  switch (res.buscador) { //dependiendo que buscador del resultado estemos recorriendo se guarda la posicion en el que se encuentra
                    case 'duckduckgo': duckduckgo = (i + 1)
                    case 'google': google = (i + 1)
                  }
                }
              }
              if (res.buscador === 'duckduckgo') { // siempre va a imprimir una posicion, si hubo coincidencia va a tener guardada la posicion en la variables duckduckgo o bing
                this.printResults(h2,res.buscador,duckduckgo)
              }
              else {
                this.printResults(h2,res.buscador,google)
              }
            }
          })
        })
      })
    });
  }

}

class google extends Buscador {


  imprimirPeers(resultados) {
    this.totalPeers++
    let googleResults = resultados[0].busquedas
    let divs = document.getElementsByClassName("yuRUbf") /* Me traigo todos los lso divs donde hay que imprimir */
    divs = Array.from(divs)
    for (var i = 0; i < divs.length; i++) {
      if (googleResults.includes((divs[i].querySelector('a')['href']))) {
        this.resultsPage[i] += 1
      }   
      this.appendSpan(i, divs[i])
    }
  }

  buscar() {
    var divs = document.getElementsByClassName("yuRUbf")
    Array.from(divs).forEach(div => {
      this.busquedas.push((div.querySelector('a')['href']))
    });
    this.busquedas = Array.from(new Set(this.busquedas))
    this.initializeResultsPage(this.busquedas.length)
    return this.busquedas
  }

  imprimirPos(resultados) {
    let divs = document.getElementsByClassName("yuRUbf") /* Me traigo todos los lso divs donde hay que imprimir */
    Array.from(divs).forEach(div => {
      let bing = 0 // Estas variables indican la posicion de la direccion del div en los otros buscadores
      let duckduckgo = 0 // por defecto se inicializan en 0 para cada div
      resultados.forEach(res => {  //recorremos los resultados
      if (res.buscador != 'google') { // entramos en aquellos que no sea igual a la pagina que estamos escribiendo
        for (var i = 0; i < (res.busquedas).length; i++) { //Recorremos todas las busquedas del primer resultado que no sea google
          if ((div.querySelector('a')['href']) === (res.busquedas[i])) { // Si coincide el link con alguno de los resultados de los otros buscadores
            switch (res.buscador) { //dependiendo que buscador del resultado estemos recorriendo se guarda la posicion en el que se encuentra
              case 'duckduckgo': duckduckgo = (i + 1)
              case 'bing': bing = (i + 1) 
            }
          }
        }
        if (res.buscador === 'duckduckgo') { // siempre va a imprimir una posicion, si hubo coincidencia va a tener guardada la posicion en la variables duckduckgo o bing
              this.printResults(div,res.buscador,duckduckgo)
        }
        else {
              this.printResults(div,res.buscador,bing)
        }
      }
    })
  });
}


}


class duckduckgo extends Buscador {

  buscar() {
    var anchors = document.getElementsByClassName("result__a")
    Array.from(anchors).forEach(link => {
      this.busquedas.push(link.getAttribute('href'))
    })
    this.busquedas = Array.from(new Set(this.busquedas))
    var final = []
    this.busquedas.forEach(string => {
      if (!string.includes('duckduckgo')) {
        final.push(string)
      }
    })
    this.initializeResultsPage(final.length)
    return final

  }

  imprimirPeers(resultados) {
    this.totalPeers++
    let duckduckgoResults = resultados[1].busquedas
    let divs = document.getElementsByClassName("result__a") 
    divs = Array.from(divs)
    for (var i = 0; i < divs.length; i++) {
      if (duckduckgoResults.includes((divs[i].getAttribute('href')))) {
        this.resultsPage[i] += 1
      }   
      this.appendSpan(i, divs[i])
    }
  }

  imprimirPos(resultados) {
    let divs = document.getElementsByClassName("result__a") /* Me traigo todos los lso divs donde hay que imprimir */
    Array.from(divs).forEach(div => {
      let bing = 0 // Estas variables indican la posicion de la direccion del div en los otros buscadores
      let google = 0 // por defecto se inicializan en 0 para cada div
      resultados.forEach(res => {  //recorremos los resultados
        if (res.buscador != 'duckduckgo') { // entramos en aquellos que no sea igual a la pagina que estamos escribiendo
          for (var i = 0; i < (res.busquedas).length; i++) { //Recorremos todas las busquedas del primer resultado que no sea google
            if ((div.getAttribute('href')) === (res.busquedas[i])) { // Si coincide el link con alguno de los resultados de los otros buscadores
              switch (res.buscador) { //dependiendo que buscador del resultado estemos recorriendo se guarda la posicion en el que se encuentra
                case 'google': google = (i + 1)
                case 'bing': bing = (i + 1)
              }
            }
          }
        if (res.buscador === 'google') { // siempre va a imprimir una posicion, si hubo coincidencia va a tener guardada la posicion en la variables duckduckgo o bing
          this.printResults(div,res.buscador,google)}
        else {
          this.printResults(div,res.buscador,bing)}
        }
      })

    });

  }

}


class SearchResult {

  constructor(buscador, busqueda, resultados) {

    this.buscador = buscador;
    this.busqueda = busqueda;
    this.busquedas = resultados;
  }


}


var pageManager = new contentPage();


browser.runtime.onMessage.addListener((request, sender) => {
  console.log("[content-side] calling the message: " + request.call);
  if (pageManager[request.call]) {
    pageManager[request.call](request.args)
  }
});





