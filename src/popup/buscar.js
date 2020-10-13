
function agregarTitulo(results) {
    var capa = document.getElementById("cuerpo");
    var h1 = document.createElement("p");
    h1.innerHTML = results.buscador + ':'+ results.busqueda;
    capa.appendChild(h1);
}



function getCurrentTab(callback) {
    return browser.tabs.query({
        active: true,
        currentWindow: true
    });
}

function requestResults(){

browser.runtime.sendMessage({
    "call": 'prueba'
}).then(results => {
        console.log(results)
        this.agregarTitulo(results[0])
        this.agregarTitulo(results[1])
        this.agregarTitulo(results[2])
    })

}

this.requestResults()
