var backgroundPage_1 = browser.extension.getBackgroundPage();
var usuarios = document.getElementById("listusers");
var listItems = document.getElementById("listitems");
var tab = backgroundPage_1.tabActive;
const codeInput = document.querySelector("#code");
var uuid = '';
var p2pExtension = backgroundPage_1.sample;
/* ---------------------------------------------- */
function getCurrentTab(callback) {
  return browser.tabs.query({
    active: true,
    currentWindow: true
  });
}

/* ---------------------------------------------- */

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

function sendData() {
  getCurrentTab().then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      call: "captarBusqueda",
    }).then(Response => {
      console.log("hola")
    })

    try {

      let usuarioSelected = usuarios.selectedIndex;

      let usuario = usuarios.options[usuarioSelected].value;

      p2pExtension.sendRequest({
        type: 'RequestResult',
        automatic: false
      }, usuario);

    } catch (e) {
      console.log("Error al utilizar sendData.");
      console.log(e);
    }
  })
}


document.addEventListener('DOMContentLoaded', function () {

  document.querySelector('#senddata').addEventListener('click', sendData);
  p2pExtension.getQueryP2P(loadUsersCustom, 'peers', {});


});
