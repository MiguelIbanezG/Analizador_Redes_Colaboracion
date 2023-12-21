
const estadisticasController = {
    
    generarconf: (req, res) => {
        // Obtenemos los objetos seleccionados desde la solicitud (pueden estar en el cuerpo de la solicitud o en los parámetros de la URL)
        const { titulosSeleccionados } = req.query;
    
        // Realizar la lógica de generación de estadísticas utilizando los objetos seleccionados
        // ...
    
        // Devuelve los resultados de las estadísticas en formato JSON
        const config = {
        // ...
        };
        res.json(config);
    }
};

module.exports = estadisticasController;