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
let imgAdicionaes = [];//Lista de imagenes
let totalPages = 0;//Total de paginas
const tooltip = document.getElementById('tooltip');//tooltip


//Funciones que llena el select de departamentos
function llenarSelect() {
    fetch(API_URL + "departments") //Obtiene todos los objetos
        .then((Response) => Response.json()) //Transforma la respuesta en un objeto JSON
        .then((data) => {//Llena el select
            const departamentos = document.getElementById("Departamentos");
            const todoOps = document.createElement("option");
            todoOps.value = 0;
            todoOps.textContent = "Departamentos";
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

async function traducir(text, targetLang) {
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, targetLang: targetLang })
        });
        const result = await response.json();
        return result.translatedText;
    } catch (error) {
        console.error('Error al traducir el texto:', error);
        return text;
    }
}

async function fetchObjetos(objectIDs, page = 1) {
    let objetosHTML = '';
    lista_objetos = objectIDs;//Lista de objetos
    const startIndex = (page - 1) * objectsPerPage;
    const endIndex = startIndex + objectsPerPage;
    const pageItems = objectIDs.slice(startIndex, endIndex)

    for (const objectId of pageItems) {
        try {
            const response = await fetch(`${URL_OBJETOS}/${objectId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('404');
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data.primaryImageSmall && data.title) {
                const img = data.primaryImageSmall || 'Sin imagen.png';
                const cultura = await traducir(data.culture || 'Sin cultura', 'es');
                const dinastía = await traducir(data.dynasty || 'Sin dinastía', 'es');
                const titulo = await traducir(data.title || 'Sin título', 'es');
                const id = data.objectID;
                const fecha = data.objectDate;
                objetosHTML += `
                <div class="objeto" > 
                    <img onmouseover="mostrarFecha(event, '${fecha}')" onmouseout="ocultarFecha()" src="${img}" alt="${titulo}"/> 
                    <p id="Fecha">${fecha}</p>
                    <h4 class="Titulo">${titulo}</h4>
                    <h4 class="Cultura">Cultura: ${cultura}</h4>
                    <h4 class="Dinastia">Dinastía: ${dinastía}</h4>
                    ${data.additionalImages && data.additionalImages.length > 0 ?
                        `<button id="openModalBtn" onclick="abrirModal(${id})">Ver más imágenes</button>` :
                        ''}
                </div>`;
            }
        } catch (error) {
            console.error("No se pudo encotrar el objeto",error);
        }
    }


    console.log("page items", pageItems.length)

    console.log("cantidad de objetos", objectIDs.length)

    totalPages = Math.ceil(objectIDs.length / objectsPerPage);


    //Total de paginas
    console.log("total de paginas", totalPages)

    console.log(`Obteniendo objetos para la página ${page} de ${totalPages}`);

    if (page > totalPages) {
        console.log("No hay más objetos");
        return;
    }

    document.getElementById("grilla").innerHTML = objetosHTML;//Muestra los objetos en la grilla
    document.getElementById("Cargando").style.display = "none";
    updatePagina();
}



function mostrarFecha(event, fecha) {
    tooltip.innerHTML = `Fecha: ${fecha}`;
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = event.pageY + 'px';

}
function ocultarFecha() {
    tooltip.style.display = 'none';
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


function cambiarPagina(newPage) {
    if (newPage !== currentPage) {
        currentPage = newPage;
        // Mostrar mensaje de "Cargando..."
        document.getElementById("grilla").innerHTML = "";
        document.getElementById("Cargando").style.display = "block";
        fetchObjetos(lista_objetos, currentPage);
    }
}

async function cargarObjetosInicialmente() {
    // Mostrar mensaje de "Cargando..."
    document.getElementById("Cargando").style.display = "block";

    // Llamar a la función para obtener todos los objetos
}
cargarObjetosInicialmente();

//Funcion que obtiene los objetos
function obtenerObjetosConimgenes() {
    fetch(URL_HAS_IMAGES)//Obtiene todos los objetos
        .then(Response => Response.json())
        .then((data) => {
            fetchObjetos(data.objectIDs.slice(10, 70));//Llama a la funcion que obtiene los objetos
        })
}

obtenerObjetosConimgenes();

form.addEventListener("reset", (e) => {
    console.log("Reiniciando los filtros");
    e.preventDefault();
    DEPARTAMENTOS.value = 0;
    LOCALIZACIONES.value = "";
    PALABRACLAVE.value = "";
    document.getElementById("grilla").innerHTML = "";
    document.getElementById("paginacion").innerHTML = "";
     document.getElementById("numeroPag").innerHTML = "";
     document.getElementById("objetos").innerHTML = "";
     document.getElementById("Cargando").style.display = "block";
    obtenerObjetosConimgenes();
})

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

    console.log(URL_SEARCH + "?hasImages=true" + "&q=" + palabraclave + departamento + localizacion)

    fetch(URL_SEARCH + "?hasImages=true&q=" + palabraclave + departamento + localizacion)

        .then(Response => Response.json())
        .then((data) => {
            if (!data.objectIDs) {
                console.log("no se encontraron objetos");
                document.getElementById("objetos").innerHTML = "No se encontraron objetos";
                document.getElementById("Cargando").style.display = "none";
                return
            } else {
                document.getElementById("paginacion").innerHTML = "";
                document.getElementById("numeroPag").innerHTML = "";
                console.log("se encontraron " + data.objectIDs.length + " objetos");
                document.getElementById("grilla").innerHTML = "";
                document.getElementById("objetos").innerHTML = "";
                document.getElementById("Cargando").style.display = "block";
                fetchObjetos(data.objectIDs.slice(0, 200), currentPage);

            }

        })
        .catch((error) => {
            return "Error en la respuesta de la API";
        });
}

function abrirModal(idObjeto) {
    fetch(`${URL_OBJETOS}/${idObjeto}`)
        .then(response => response.json())
        .then(data => {
            const imageContainer = document.getElementById('imageContainer');
            imageContainer.innerHTML = ''; // Limpiar contenido previo

            for (let i = 0; i < data.additionalImages.length; i++) {
                const img = document.createElement('img');
                img.src = data.additionalImages[i]; // Asignar la fuente de la imagen
                imageContainer.appendChild(img); // Añadir la imagen al contenedor
            }

            // Mostrar el modal
            const modal = document.getElementById('myModal');
            modal.style.display = "block";
        });
}


// Cerrar el modal cuando se hace clic en (x)
document.querySelector('.close').onclick = function () {
    document.getElementById('myModal').style.display = "none";
}

// Cerrar el modal si se hace clic fuera del contenido
window.onclick = function (event) {
    const modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

window.onkeydown = function (event) {
    if (event.key === "Escape") {
        document.getElementById('myModal').style.display = "none";
    }
};




