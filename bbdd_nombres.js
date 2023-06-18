const fs = require('fs');
const path = require('path');

// Ruta completa para almacenar estadisticas
const filePath = path.join(__dirname, 'frontend/front_api/src/assets/common_names.txt');

// Define los países y columnas de interés
const countries = {
  'USA': 33,
  'Italia': 34,
  'España': 37,
  'Francia': 38,
  'Alemania': 43, 
  'China': 80,
  'India': 81,
  'Rusia': 69  
};

// Lee el archivo y obtén su contenido como una cadena de texto
const fileContent = fs.readFileSync('nam_dict.txt', 'utf8');

// Encuentra el índice de inicio de la lista de nombres
const startIndex = fileContent.indexOf('M  Aad');

// Extrae la sección de la lista de nombres
const nameList = fileContent.substring(startIndex);

// Divide el contenido en líneas
const lines = nameList.split('\n');

// Crea un objeto para almacenar los nombres y frecuencias por país
const namesData = {};

// Itera por cada línea de la lista de nombres
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Verifica si la línea contiene un nombre y su frecuencia
  if (/^[MF?]\s+\w+\s+\d/.test(line)) {
    const parts = line.split(/\s+/);
    const gender = parts[0];
    const name = parts[1];
    
    // Obtén las frecuencias para los países de interés
    const frequencies = {};
    for (const country in countries) {
      const column = countries[country];
      const frequencyHex = line.substring(column-1, column);     
      let frequency;
      switch (frequencyHex) {
        case 'A':
          frequency = 10;
          break;
        case 'B':
          frequency = 11;
          break;
        case 'C':
          frequency = 12;
          break;
        case 'D':
          frequency = 13;
          break;
        case 'E':
          frequency = 14;
          break;
        case 'F':
          frequency = 15;
          break;
        default:
          if(frequencyHex == ""){
            frequency = 0;
          }else{
            frequency = Number(frequencyHex);
          }
      }
      frequencies[country] = frequency;
    }
    
    // Almacena los datos del nombre
    namesData[name] = {
      gender,
      frequencies
    };
  }
}

// Crea el contenido para el archivo common_names.txt
let content = '';
for (const name in namesData) {
  const { gender, frequencies } = namesData[name];

  // Verifica si todas las frecuencias son cero
  const allZeroFrequencies = Object.values(frequencies).every(freq => freq === 0);

  // Si todas las frecuencias son cero, omite el objeto
  if (allZeroFrequencies) {
    continue;
  }
  
  content += `nombre: ${name}\n`;
  content += `frec_paises: ${JSON.stringify(frequencies)}\n`;
  content += `genero: ${gender}\n\n`;
}

// Escribe el contenido en el archivo common_names.txt
fs.writeFileSync(filePath, content, 'utf8');

console.log('Archivo common_names.txt generado exitosamente.');
