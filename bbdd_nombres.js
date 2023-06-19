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
  'Europa': [39, 41, 47, 48, 49, 50, 54, 55, 56, 57, 68], 
  'Asia': [69, 80, 81, 82, 83, 84]
};

function get_switch_valor(name, frequencyHex){
  switch (frequencyHex) {
    case 'A':
      return 10;
    case 'B':
      return 11;
    case 'C':
      return 12;
    case 'D':
      return 13;
    case 'E':
      return 14;
    case 'F':
      return 15;
    default:
      return Number(frequencyHex);
  };
}

// Lee el archivo y obtén su contenido como una cadena de texto
const fileContent = fs.readFileSync('nam_dict.txt', 'latin1');

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
  //if (/^[MF?]\s+\w+\s+\d/.test(line)) {
  const parts = line.split(/\s+/);
  const gender = parts[0];
  const name = parts[1];
  
  // Obtén las frecuencias para los países de interés
  const frequencies = {};
  for (const country in countries) {
    const column = countries[country];
    const frequencyHex = line.substring(column-1, column);     
    let frequency;

    if (country === 'Asia') {
      const asiaColumns = countries.Asia;
      let maxFrequency = 0;
      for (const asiaColumn of asiaColumns) {
        let asiaFrequencyHex = line.substring(asiaColumn - 1, asiaColumn);        
        if(asiaFrequencyHex == ' ' || asiaFrequencyHex == ''){
          asiaFrequencyHex = 0;
        }
        const asiaFrequency = get_switch_valor(name, asiaFrequencyHex);
        if (asiaFrequency > maxFrequency) {
        maxFrequency = asiaFrequency;
        }
      }
      frequency = maxFrequency;
    }
    else if (country === 'Europa') {
      const europaColumns = countries.Europa;
      let maxFrequency = 0;
      for (const europaColumn of europaColumns) {
        let europaFrequencyHex = line.substring(europaColumn - 1, europaColumn);
        if(europaFrequencyHex == ' ' || europaFrequencyHex == ''){
          europaFrequencyHex = 0;
        }
        const europaFrequency = get_switch_valor(name, europaFrequencyHex);
        if (europaFrequency > maxFrequency) {
          maxFrequency = europaFrequency;
        }
      }
      frequency = maxFrequency;
    } else {
      frequency = get_switch_valor(name, frequencyHex);  
    }

    if (namesData[name]) {
      const existingFrequencies = namesData[name].frequencies;
      const existingFrequency = existingFrequencies[country];

      // Compara la frecuencia existente con la nueva frecuencia y guarda la más alta
      if (frequency > existingFrequency) {
        existingFrequencies[country] = frequency;
      }
    } else {
      // El nombre no existe en namesData, crea una nueva entrada
      frequencies[country] = frequency;
    }
    // if(name==""){
    //   console.log(name);
    //   console.log(country);
    //   console.log(frequency);
    // }
}

// Almacena los datos del nombre
if (!namesData[name]) {
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
