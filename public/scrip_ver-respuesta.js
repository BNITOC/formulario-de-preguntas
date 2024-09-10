document.getElementById('buscarBtn').addEventListener('click', function() {
    const nombreUsuario = document.getElementById('nombreUsuario').value;

    if (!nombreUsuario) {
        alert('Por favor, ingresa un nombre para buscar.');
        return;
    }

    // Llama al servidor para obtener las respuestas del usuario
    fetch(`/obtener_respuestas/${nombreUsuario}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener las respuestas.');
            }
            return response.json();
        })
        .then(data => {
            // Limpiar la tabla antes de mostrar nuevas respuestas
            const tbody = document.querySelector('#tablaRespuestas tbody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                alert('No se encontraron respuestas para este usuario.');
                return;
            }

            // Insertar las respuestas en la tabla
            data.forEach(respuesta => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${respuesta.nombre}</td>
                    <td>${respuesta.telefono}</td>
                    <td>${respuesta.email}</td>
                    <td>${respuesta.pregunta}</td>
                    <td>${respuesta.respuesta}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al obtener las respuestas.');
        });
});
