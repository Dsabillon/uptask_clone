import Swal from "sweetalert2";
import axios from "axios";

const btnEliminar = document.querySelector("#eliminar-proyecto");
//Con el if evitamos que se ejecute cuando no existe el boton de eliminar
if (btnEliminar) {
  btnEliminar.addEventListener("click", (e) => {
    const urlProyecto = e.target.dataset.proyectoUrl;
    //console.log(urlProyecto);
    Swal.fire({
      title: "Deseas borrar este proyecto?",
      text: "Un proyecto eliminado no se puede recuperar",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, borrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.value) {
        //Aqui se envia petición a axios
        const url = `${location.origin}/proyectos/${urlProyecto}`;
        axios
          .delete(url, { params: { urlProyecto } })
          .then(function (respuesta) {
            Swal.fire("Eliminado!", respuesta.data, "success");
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          })
          .catch(() => {
            Swal.fire({
              icon: "error",
              title: "Hubo un error",
              text: "No se pudo eliminar el proyecto",
            });
          });
      }
    });
  });
}

export default btnEliminar;
