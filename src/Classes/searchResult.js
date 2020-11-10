
export default class SearchResult {

  constructor(buscador, busqueda, resultados) {

    this.buscador = buscador;
    this.busqueda = busqueda;
    this.busquedas = resultados;
  }

  getBuscador() {
    return this.buscador
  }

}

