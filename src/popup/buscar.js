
function agregarTitulo(results, i) {
    var capa = document.getElementById("cuerpo");
    var h1 = document.createElement("p");
    h1.innerHTML = results.buscador + ':' + (results.busquedas[i]).link((results.busquedas[i]));
    capa.appendChild(h1);
}


function requestResults() {

    browser.runtime.sendMessage({
        "call": 'prueba'
    }).then(results => {
        console.log(results)
        for (var i = 0; i < 5; i++) {
            this.agregarTitulo(results[0], i)
            this.agregarTitulo(results[1], i)
            this.agregarTitulo(results[2], i)
        }
    })

}

this.requestResults()
