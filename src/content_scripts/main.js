"use strict";

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
          "call": buscador,
          "args": {
            "busqueda": busqueda,
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
  }

  buscar() { }
  imprimirPos() { }
  imprimirPeers() { }

}




class bing extends Buscador {

  buscar() {
    var busquedas = []
    var anchors = document.getElementsByClassName("b_title")

    Array.from(anchors).forEach(link => {
      Array.from(link.getElementsByTagName('a')).forEach(href => {
        busquedas.push(href.getAttribute('href'))
      })
    })
    busquedas = Array.from(new Set(busquedas))
    return busquedas
  }

  imprimirPos(resultados) {
    var divs = document.getElementsByClassName("b_title") /* Me traigo todos los lso divs donde hay que imprimir */
    Array.from(divs).forEach(div => {
      Array.from(div.getElementsByTagName('h2')).forEach(h2 => {
        Array.from(h2.getElementsByTagName('a')).forEach(href => {
          var google = 0 // Estas variables indican la posicion de la direccion del div en los otros buscadores
          var duckduckgo = 0 // por defecto se inicializan en 0 para cada div
          resultados.forEach(res => {  //recorremos los resultados
            if (res.buscador != 'bing') { // entramos en aquellos que no sea igual a la pagina que estamos escribiendo
              for (var i = 0; i < (res.busquedas).length; i++) {
                //Recorremos todas las busquedas del primer resultado que no sea google
                if (href.getAttribute('href') === (res.busquedas[i])) { // Si coincide el link con alguno de los resultados de los otros buscadores
                  switch (res.buscador) { //dependiendo que buscador del resultado estemos recorriendo se guarda la posicion en el que se encuentra
                    case 'duckduckgo':
                      duckduckgo = (i + 1)
                    case 'google':
                      google = (i + 1)
                  }
                }
              }
              if (res.buscador === 'duckduckgo') { // siempre va a imprimir una posicion, si hubo coincidencia va a tener guardada la posicion en la variables duckduckgo o bing
                var ruta = browser.extension.getURL("img/" + res.buscador + ".png")
                div.innerHTML += ' <img src="' + ruta + '" width=30 height=30>  <strong style="font-size: x-large;">' + duckduckgo + "</strong> "
              }
              else {
                var ruta = browser.extension.getURL("img/" + res.buscador + ".png")
                div.innerHTML += ' <img src="' + ruta + '" width=30 height=30>  <strong style="font-size: x-large;" >' + google + "</strong> "

              }
            }
          })
        })
      })
    });
  }

}


class google extends Buscador {

  constructor() {
    super()
  }


  imprimirPeers(resultados) {
    this.totalPeers++
    console.log(this.resultsPage)
    var googleResults = resultados[0].busquedas
    console.log(googleResults)
    var divs = document.getElementsByClassName("yuRUbf") /* Me traigo todos los lso divs donde hay que imprimir */
    divs = Array.from(divs)
    console.log(divs)
    for (var i = 0; i < divs.length; i++) {
      if (googleResults.includes((divs[0].querySelector('a')['href']))) {
        this.resultsPage[i] += 1
      }
      var sp = document.createElement("span")
      sp.setAttribute("id", ("sp" + i));
      sp.style.borderRadius = "50%"
      sp.style.borderStyle = "groove"
      sp.style.padding = "10px"
      var content = document.createTextNode((this.resultsPage[i] + 'de' + this.totalPeers))
      sp.appendChild(content)
      var oldSpan = document.getElementById(("sp" + i))

      if (oldSpan != null) {
        var parentDiv = oldSpan.parentNode;
        parentDiv.replaceChild(sp, oldSpan);
      }
      else {
        divs[i].appendChild(sp)
      }
    }
  }

  buscar() {
    var busquedas = []
    var divs = document.getElementsByClassName("yuRUbf")
    Array.from(divs).forEach(div => {
      busquedas.push((div.querySelector('a')['href']))
    });
    busquedas = Array.from(new Set(busquedas))
    for (var i = 0; i <= busquedas.length; i++) {
      this.resultsPage[i] = 0
    }
    return busquedas
  }

  imprimirPos(resultados) {

    var divs = document.getElementsByClassName("yuRUbf") /* Me traigo todos los lso divs donde hay que imprimir */
    Array.from(divs).forEach(div => {
      var bing = 0 // Estas variables indican la posicion de la direccion del div en los otros buscadores
      var duckduckgo = 0 // por defecto se inicializan en 0 para cada div
      resultados.forEach(res => {  //recorremos los resultados
        if (res.buscador != 'google') { // entramos en aquellos que no sea igual a la pagina que estamos escribiendo
          for (var i = 0; i < (res.busquedas).length; i++) { //Recorremos todas las busquedas del primer resultado que no sea google
            if ((div.querySelector('a')['href']) === (res.busquedas[i])) { // Si coincide el link con alguno de los resultados de los otros buscadores
              switch (res.buscador) { //dependiendo que buscador del resultado estemos recorriendo se guarda la posicion en el que se encuentra
                case 'duckduckgo':
                  duckduckgo = (i + 1)
                case 'bing':
                  bing = (i + 1)
              }
            }
          }
          if (res.buscador === 'duckduckgo') { // siempre va a imprimir una posicion, si hubo coincidencia va a tener guardada la posicion en la variables duckduckgo o bing
            var ruta = browser.extension.getURL("img/" + res.buscador + ".png")
            div.innerHTML += ' <img src="' + ruta + '" width=30 height=30>  <strong style="font-size: x-large;">' + duckduckgo + "</strong> "
          }
          else {
            var ruta = browser.extension.getURL("img/" + res.buscador + ".png")
            div.innerHTML += ' <img src="' + ruta + '" width=30 height=30>  <strong style="font-size: x-large;" >' + bing + "</strong> "

          }
        }
      })

    });

  }


}




class duckduckgo extends Buscador {

  buscar() {
    var busquedas = []
    var anchors = document.getElementsByClassName("result__a")
    Array.from(anchors).forEach(link => {
      busquedas.push(link.getAttribute('href'))
    })
    busquedas = Array.from(new Set(busquedas))
    var final = []
    busquedas.forEach(string => {
      if (!string.includes('duckduckgo')) {
        final.push(string)
      }
    })
    return final

  }

  imprimirPos(resultados) {
    var divs = document.getElementsByClassName("result__a") /* Me traigo todos los lso divs donde hay que imprimir */
    Array.from(divs).forEach(div => {
      var bing = 0 // Estas variables indican la posicion de la direccion del div en los otros buscadores
      var google = 0 // por defecto se inicializan en 0 para cada div
      resultados.forEach(res => {  //recorremos los resultados
        if (res.buscador != 'duckduckgo') { // entramos en aquellos que no sea igual a la pagina que estamos escribiendo
          for (var i = 0; i < (res.busquedas).length; i++) { //Recorremos todas las busquedas del primer resultado que no sea google
            if ((div.getAttribute('href')) === (res.busquedas[i])) { // Si coincide el link con alguno de los resultados de los otros buscadores
              switch (res.buscador) { //dependiendo que buscador del resultado estemos recorriendo se guarda la posicion en el que se encuentra
                case 'google':
                  google = (i + 1)
                case 'bing':
                  bing = (i + 1)
              }
            }
          }
          if (res.buscador === 'google') { // siempre va a imprimir una posicion, si hubo coincidencia va a tener guardada la posicion en la variables duckduckgo o bing
            var ruta = browser.extension.getURL("img/" + res.buscador + ".png")
            div.innerHTML += ' <img src="' + ruta + '" width=30 height=30>  <strong style="font-size: x-large;">' + google + "</strong> "
          }
          else {
            var ruta = browser.extension.getURL("img/" + res.buscador + ".png")
            div.innerHTML += ' <img src="' + ruta + '" width=30 height=30>  <strong style="font-size: x-large;" >' + bing + "</strong> "

          }
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





