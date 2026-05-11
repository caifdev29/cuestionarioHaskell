// Función para cargar el cuestionario
async function cargarCuestionario() {
  const contenedor = document.getElementById('quiz-container');

  try {
    const response = await fetch('preguntas.html');
    const html = await response.text();
    contenedor.innerHTML = html;

    // Programar el evento del botón "Enviar" que ahora está en el DOM
    const btnEnviar = document.getElementById('btn-enviar');
    btnEnviar.addEventListener('click', procesarYEnviar);
  } catch (error) {
    console.error("Error cargando el formulario:", error);
  }
}

// Función para recolectar datos y enviarlos al Backend Haskell
async function procesarYEnviar() {
  const formulario = document.getElementById('quiz-form');

  // El backend espera un Map: { "Fantasía": 20, "Misterio": 10... }
  let puntajes = {
    "Fantasía": 0,
    "Ciencia ficción": 0,
    "Acción aventura": 0,
    "Misterio": 0,
    "Suspenso": 0,
    "Histórico": 0,
    "Romance": 0
  };

  // 1. CORRECCIÓN: Buscamos todos los radios marcados
  const seleccionados = formulario.querySelectorAll('input[type="radio"]:checked');

  if (seleccionados.length === 0) {
    alert("Por favor, responde al menos una pregunta.");
    return;
  }

  // 2. Agrupamos por el atributo 'data-genero' para evitar el error de deselección
  seleccionados.forEach(input => {
    const genero = input.getAttribute('data-genero');
    const puntos = parseInt(input.value);

    if (puntajes.hasOwnProperty(genero)) {
      puntajes[genero] += puntos;
    }
  });

  try {
    const response = await fetch('http://localhost:3000/top-genres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(puntajes)
    });

    const resultado = await response.json();
    mostrarResultados(resultado);
  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor Haskell.");
  }
}

// Función para mostrar únicamente el TOP 3
function mostrarResultados(lista) {
  const contenedor = document.getElementById('quiz-container');

  // Tomamos solo los primeros 3 (asumiendo que el backend ya los ordena)
  const topTres = lista.slice(0, 3);

  let html = '<div class="resultados-finales">';
  html += '<h2>Tu Top 3 de Géneros Literarios</h2><ul>';

  topTres.forEach((item, index) => {
    // Asignamos clase según el puesto para el CSS (puesto-1, puesto-2, puesto-3)
    const clasePuesto = `puesto-${index + 1}`;
    const medalla = index === 0 ? 'Top 1' : index === 1 ? 'Top 2' : 'Top 3';

    html += `
      <li class="${clasePuesto}">
        <span class="medalla">${medalla}</span>
        <strong>${item.genero}</strong>
      </li>`;
  });

  html += '</ul>';
  html += '<button class="btn-reiniciar" onclick="location.reload()">Rehacer Test?</button>';
  html += '</div>';

  contenedor.innerHTML = html;
}