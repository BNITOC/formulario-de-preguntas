document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formularioGeneral');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que el formulario recargue la página

        // Captura los datos del formulario
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Guarda los datos en localStorage
        localStorage.setItem('formData', JSON.stringify(data));

        // Redirige al usuario a la página de registro
        window.location.href = 'registro.html'; // Cambia la URL según sea necesario
    });
});
