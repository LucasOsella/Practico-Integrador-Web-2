//Variales URL
const API_URL = "https://collectionapi.metmuseum.org/public/collection/v1/";
const URL_OBJETOS = "https://collectionapi.metmuseum.org/public/collection/v1/objects";
const URL_HAS_IMAGES = "https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true"
const URL_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search"

//Variables
const form = document.getElementById("form");
const DEPARTAMENTOS = document.getElementById("Departamentos");
const LOCALIZACIONES = document.getElementById("Localizaciones");
const PALABRACLAVE = document.getElementById("plabraclave");
const ENVIAR = document.getElementById("buscar");
let currentPage = 1; // Página actual
const objectsPerPage = 20; // Objetos por página
let lista_objetos = []; // Lista de objetos
let imgAdicionaes = [];



//Funciones que llena el select de departamentos
function llenarSelect() {
    fetch(API_URL + "departments") //Obtiene todos los objetos
        .then((Response) => Response.json()) //Transforma la respuesta en un objeto JSON
        .then((data) => {//Llena el select
            const departamentos = document.getElementById("Departamentos");
            const todoOps = document.createElement("option");
            todoOps.value = 0;
            todoOps.textContent = "Todos";
            departamentos.appendChild(todoOps);

            data.departments.forEach(departamento => {

                const option = document.createElement("option");
                option.value = departamento.departmentId;
                option.textContent = departamento.displayName;
                departamentos.appendChild(option);
            });
            console.log(data.departments)
        })

}
llenarSelect();

 function translateText(text, targetLang) {
  fetch('/traducir', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text, targetLang: targetLang })
  })

 }

//funcion que obtiene los objestos y arma la pagina
 function fetchObjetos(objectIDs, page = 1) {//Funcion que obtiene los objetos
    let objetosHTML = '';
    let objectId = 0;
    lista_objetos = objectIDs;


    const startIndex = (page - 1) * objectsPerPage;
    const endIndex = startIndex + objectsPerPage;
    const pageItems = objectIDs.slice(startIndex, endIndex);

    console.log(pageItems);
    console.log(lista_objetos.length);
    totalPages = Math.ceil(lista_objetos.length / objectsPerPage);

    console.log(`Obteniendo objetos para la página ${page} de ${totalPages}`);

    console.log("obteniendo objetos");

    if (page > totalPages) {
        console.log("No hay mas objetos");
        return;
    }

    for (objectId of pageItems) {//Recorre todos los objetos

        fetch(URL_OBJETOS + '/' + objectId)
            .then((Response) => {
                if (!Response.ok) {//Verifica si la respuesta es correcta
                    if (Response.status == 404) {
                        console.log('404');
                        throw new Error(`HTTP error! status: ${Response.status}`);
                    }
                } return Response.json()
            })
            .then((data) => {//Obtiene los datos
                // console.log(data.title);

                if (data.primaryImageSmall && data.title) {//Verifica si el objeto tiene imagen
                    const img = data.primaryImageSmall || 'Sin imagen.png';
                    const cultura =  data.culture || 'Sin cultura' 
                    const dinastía = data.dynasty || 'Sin dinastía'
                    const titulo = data.title || 'Sin titulo'
                    if (data.additionalImages.length > 0) {     
                        imgAdicionaes = data.additionalImages[0].url;                   
                        objetosHTML += `
                        <div class="objeto"> 
                            <img src="${img}" alt="${titulo}"/> 
                            <h4 class="Titulo">${titulo}</h4>
                            <h4 class="Cultura">Cultura :${cultura}</h4>
                            <h4 class="Dinastia">Dinastía :${dinastía}</h4>
                          <button type="button" onclick="abrirModal(imgAdicionaes)" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#miModal">
                            Ver Imagens Adicionales
                            </button> 
                        </div>`;
                    } else {
                        objetosHTML += `
                        <div class="objeto"> 
                            <img src="${img}" alt="${titulo}"/> 
                            <h4 class="Titulo">${titulo}</h4>
                            <h4 class="Cultura">Cultura :${cultura}</h4>
                            <h4 class="Dinastia">Dinastía :${dinastía}</h4>
                        </div>`;
                    }

                    document.getElementById("grilla").innerHTML = objetosHTML;//Muestra los objetos
                }

            })
            .catch(error => { // Maneja los errores             
                console.log("Hubo un problema al acceder al objeto:", error.message);
            })
    }

    updatePagina();
}

//funcion actualizar pagina
function updatePagina() {
    const paginacionControls = document.getElementById("paginacion");
    const numeroPaginas = document.getElementById("numeroPag");
    paginacionControls.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        paginacionControls.innerHTML += `<button id="botonPagina" onclick="cambiarPagina(${i})">${i}</button>`;
    }
    if (totalPages == 1) {
        numeroPaginas.innerHTML = `Pagina ${currentPage} de ${totalPages}`
    } else {
        numeroPaginas.innerHTML = `Pagina ${currentPage} de ${totalPages}`
    }

}

//funcione cambiar pagina
function cambiarPagina(newPage) {
    currentPage = newPage;
    fetchObjetos(lista_objetos, currentPage)

}

//Funcion que obtiene los objetos
function obtenerObjetosConimgenes() {
    fetch(URL_HAS_IMAGES)//Obtiene todos los objetos
        .then(Response => Response.json())
        .then((data) => {
            fetchObjetos(data.objectIDs.slice(10, 200));//Llama a la funcion que obtiene los objetos
        })
}
obtenerObjetosConimgenes();


//Funcion que obtiene los filtros
form.addEventListener("submit", (e) => {
    e.preventDefault();
    let depa = DEPARTAMENTOS.value;
    let loca = LOCALIZACIONES.value;
    let palabraclave = PALABRACLAVE.value;
    console.log(depa, loca, palabraclave);
    if (depa == 0 && loca == 0 && palabraclave == "") {
        console.log("no hay filtro")
        depa = "";
        loca = "";
        palabraclave = "";
        obtenerObjetosConimgenes();
        return;
    }
    currentPage = 1;
    buscarObjetosFiltrados(depa, loca, palabraclave)

    console.log("formulario enviado")
})

//Funcion que filtra los objetos
function buscarObjetosFiltrados(departamento, localizacion, palabraclave) {


    if (localizacion == 0) {
        localizacion = "";
    } else if (localizacion !== 0) {
        localizacion = "&geoLocation=" + localizacion
    }
    if (departamento == 0) {
        departamento = "";
    } else if (departamento !== 0) {
        departamento = "&departmentId=" + departamento
    }

    console.log(URL_SEARCH + "?&q=" + palabraclave + departamento + localizacion)

    fetch(URL_SEARCH + "?q=" + palabraclave + departamento + localizacion)
        .then(Response => Response.json())
        .then((data) => {
            if (!data.objectIDs) {
                console.log("no se encontraron objetos");
                document.getElementById("objetos").innerHTML = "No se encontraron objetos";
                return
            } else {
                console.log("se encontraron " + data.objectIDs.length + " objetos");
                document.getElementById("objetos").innerHTML = "";
                fetchObjetos(data.objectIDs.slice(0, 200));
            }

        })
        .catch((error) => {
            return "Error en la respuesta de la API";
        });
}

function abrirModal(imagenAdicional) {
    console.log(imagenAdicional)
    document.getElementById('miModal').style.display = 'block';
    imagenAdicional=document.getElementById("modalImage");  
    title=document.getElementById("miModalLabel");  
    title.textContent="Adicionales";
    imagenAdicional.src=imagenAdicional;

    console.log(imagenAdicional)
} 

