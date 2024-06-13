const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "front/front_api/src/assets/common_names.txt"
);

const countries = {
  USA: 33,
  Italia: 34,
  España: 37,
  Francia: 38,
  Alemania: 43,
  Europa: [39, 41, 47, 48, 49, 50, 54, 55, 56, 57, 68],
  Asia: [69, 80, 81, 82, 83, 84],
};

function get_switch_valor(name, frequencyHex) {
  switch (frequencyHex) {
    case "A":
      return 10;
    case "B":
      return 11;
    case "C":
      return 12;
    case "D":
      return 13;
    case "E":
      return 14;
    case "F":
      return 15;
    default:
      return Number(frequencyHex);
  }
}

const fileContent = fs.readFileSync("nam_dict.txt", "latin1");
const startIndex = fileContent.indexOf("M  Aad");
const nameList = fileContent.substring(startIndex);
const lines = nameList.split("\n");
const namesData = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  const parts = line.split(/\s+/);
  const gender = parts[0];
  const name = parts[1];

  const frequencies = {};
  for (const country in countries) {
    const column = countries[country];
    const frequencyHex = line.substring(column - 1, column);
    let frequency;

    if (country === "Asia") {
      const asiaColumns = countries.Asia;
      let maxFrequency = 0;
      for (const asiaColumn of asiaColumns) {
        let asiaFrequencyHex = line.substring(asiaColumn - 1, asiaColumn);
        if (asiaFrequencyHex == " " || asiaFrequencyHex == "") {
          asiaFrequencyHex = 0;
        }
        const asiaFrequency = get_switch_valor(name, asiaFrequencyHex);
        if (asiaFrequency > maxFrequency) {
          maxFrequency = asiaFrequency;
        }
      }
      frequency = maxFrequency;
    } else if (country === "Europa") {
      const europaColumns = countries.Europa;
      let maxFrequency = 0;
      for (const europaColumn of europaColumns) {
        let europaFrequencyHex = line.substring(europaColumn - 1, europaColumn);
        if (europaFrequencyHex == " " || europaFrequencyHex == "") {
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

      if (frequency > existingFrequency) {
        existingFrequencies[country] = frequency;
      }
    } else {
      frequencies[country] = frequency;
    }
  }

  if (!namesData[name]) {
    namesData[name] = {
      gender,
      frequencies,
    };
  }
}

let content = "";
for (const name in namesData) {
  const { gender, frequencies } = namesData[name];

  const allZeroFrequencies = Object.values(frequencies).every(
    (freq) => freq === 0
  );

  if (allZeroFrequencies) {
    continue;
  }

  content += `nombre: ${name}\n`;
  content += `frec_paises: ${JSON.stringify(frequencies)}\n`;
  content += `genero: ${gender}\n\n`;
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Archivo common_names.txt generado exitosamente.");
