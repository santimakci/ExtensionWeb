"use strict";

class BackgroundExtension {

  constructor() {
    this.resultados = []
  }

  getBuscador() {
    return new Promise(resolve => {
      resolve(
        {
          "busqueda": this.resultados[0].busqueda,
          "buscador": this.resultados[0].buscador
        })
    })

  }

  imprimirPosiciones() {
    this.getCurrentTab().then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        call: "mostrarPos",
        args: {
          "resultados": this.resultados
        }
      })
    })
  }

  printPeers(results) {
    this.getCurrentTab().then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        call: "imprimirPeers",
        args: {
          "results": results
        }
      })
    })

  }

  listarResultados() {
    return new Promise(resolve => {
      this.resultados = []
      this.getCurrentTab().then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          call: "captarBusqueda"
        }).then(() => {
          this.imprimirPosiciones()
          console.log('this resultados',this.resultados)
          resolve(this.resultados)
        })
      })
    })
  }

  getCurrentTab(callback) {
    return browser.tabs.query({
      active: true,
      currentWindow: true
    });
  }


  captarResults(args){
     return new Promise((resolve) => {
      switch(args.search.buscador){
        case "google":
          var SearchResultsInstance = new googleSearchResults(args.search.buscador, args.search.busqueda, args.search.busquedas)
          break;
        case "bing":
          var SearchResultsInstance = new bingSearchResults(args.search.buscador, args.search.busqueda, args.search.busquedas)
          break;
        case "duckduckgo":
          var SearchResultsInstance = new duckduckgoSearchResults(args.search.buscador, args.search.busqueda, args.search.busquedas)
          break;
      }
      SearchResultsInstance.allResults().then(
      (response) =>{
        console.log('caca',response)
          this.resultados = response
          resolve(response)
        }
      )
      
    });

  }

}

class SearchResult {

  constructor(buscador, busqueda, resultados) {

    this.buscador = buscador;
    this.busqueda = busqueda;
    this.busquedas = resultados;
  }

  allResults(){}

  consulta(url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.setRequestHeader("Access-Control-Allow-Origin", "*");
    request.send();

    if (request.status === 200 && request.readyState === 4) {
      var parser = new DOMParser()
      var doc = parser.parseFromString(request.response, "text/html");
      return doc
    }
  }

  duckduckgoResults(busqueda) {
    return new Promise(resolve =>{
    var url = 'https://duckduckgo.com/html/' + '?q=' + busqueda
    var doc = this.consulta(url)
    var busquedas = []
    var anchors = doc.getElementsByClassName('result__a')
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
    var ducksearch = new duckduckgoSearchResults('duckduckgo', busqueda, final);
    console.log('resultados', ducksearch)
    resolve(ducksearch)
    })
  }


  googleResults(busqueda) {
    return new Promise(resolve =>{
    var url = 'http://www.google.com/' + 'search?q=' + busqueda + '&oq=' + busqueda
    var doc = this.consulta(url)
    var busquedas = []
    var divs = doc.getElementsByClassName("yuRUbf")
    Array.from(divs).forEach(div => {
      busquedas.push((div.querySelector('a')['href']))
    });
    busquedas = Array.from(new Set(busquedas))
    var search = new googleSearchResult('google', busqueda, busquedas);
    console.log('resultados', search)
    resolve(search )
    })
  }

  bingResults(busqueda) {
    return new Promise(resolve =>{
    var url = 'http://www.bing.com/' + 'search?q=' + busqueda + '&oq=' + busqueda
    var doc = this.consulta(url)
    var busquedas = []
    doc.querySelectorAll("div cite").forEach(H3 => {
      if ((H3.innerText).includes('http')) {
        busquedas.push(H3.innerText)
      }
    })
    busquedas = Array.from(new Set(busquedas))
    var search = new bingSearchResults('bing', busqueda, busquedas);
    console.log('bing',search)
    resolve(search )
    })
  }

}

class bingSearchResults extends SearchResult{
  allResults(){
   
    return new Promise(resolve =>{
      var results = []
      results.push(this)
      this.duckduckgoResults(this.busqueda).then(
        response =>{
          results.push(response)
        }).then( r =>{
          this.googleResults(this.busqueda).then( resp =>{
          results.push(resp)
        }).then(
          resolve(results)
          )      
        })
    })

  }


}
class googleSearchResults extends SearchResult{
  allResults(){
    return new Promise(resolve =>{
      var results = []
      results.push(this)
      this.bingResults(this.busqueda).then(
        response =>{
          console.log('ddg', response)
          results.push(response)
        }).then( r =>{
          this.duckduckgoResults(this.busqueda).then( resp =>{
          results.push(resp)
        }).then(
          resolve(results)
          )      
        })
    })
    
  }

}

class duckduckgoSearchResults extends SearchResult{
  allResults(){
      return new Promise(resolve =>{
        var results = []
        results.push(this)
        this.googleResults(this.busqueda).then(
          response =>{
            results.push(response)
          }).then( r =>{
            this.bingResults(this.busqueda).then( resp =>{
            results.push(resp)
          }).then(
            resolve(results)
            )      
          })
      })
  }

}

var extension = new BackgroundExtension()

browser.runtime.onMessage.addListener((request, sender) => {
  console.log("[background-side] calling the message: " + request.call);
  if (extension[request.call]) {
    return extension[request.call](request.args);
  }
})






