document.getElementById('buscarBtn').addEventListener('click', function() {
    // Muestra un mensaje en la consola cuando se presiona el botón
    console.log('Botón buscar clickeado');

    // Llama al servidor para obtener todas las respuestas
    fetch('/obtener_todas_respuestas')
        .then(response => {
            // Verifica la respuesta del servidor
            if (!response.ok) {
                throw new Error('Error al obtener las respuestas.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos del servidor:', data); // Muestra los datos en la consola

            // Limpiar la tabla antes de mostrar nuevas respuestas
            const tbody = document.querySelector('#tablaRespuestas tbody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                alert('No se encontraron respuestas.');
                return;
            }

            // Insertar las respuestas en la tabla
            data.forEach(respuesta => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <p>${respuesta.pregunta}<p>
                    <p>${respuesta.respuesta}<p>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            // Muestra cualquier error en la consola
            console.error('Error:', error);
            alert('Hubo un problema al obtener las respuestas.');
        });

        
});
