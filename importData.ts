import { DataExchangeService } from "./src/services/dataExchange.service.js";
import path from "path";
import fs from "fs-extra";

const exchangeService = new DataExchangeService();

async function runExample() {
    console.log("--- Iniciando Ejemplo de Intercambio de Datos ---");

    // 1. Crear carpetas necesarias
    const dataDir = path.join(process.cwd(), "data_temp");
    await fs.ensureDir(dataDir);

    // 2. Generar un archivo JSON de ejemplo para importar (Usuarios)
    const sampleUsers = [
        { email: "import1@test.com", password: "password123", role: "USER" },
        { email: "import2@test.com", password: "password123", role: "ADMIN" },
        { email: "invalid-email", password: "123", role: "USER" }, // Este debería fallar validación
    ];
    const jsonPath = path.join(dataDir, "users_to_import.json");
    await fs.writeJson(jsonPath, sampleUsers);

    // 3. Generar un archivo CSV de ejemplo para importar (Productos)
    const csvContent = "name_es,name_en,name_fr,name_de,description_es\n" +
        "Producto Importado ES,Product Imported EN,Produit Importé FR,Importiertes Produkt DE,Descripción larga\n" +
        "Prod2,P2,P2,P2,\n" +
        ",Incorrecto,,,"; // Este debería fallar (nombre vacío)

    const csvPath = path.join(dataDir, "products_to_import.csv");
    await fs.writeFile(csvPath, csvContent);

    // 4. Ejecutar Importaciones
    console.log("Importando Usuarios desde JSON...");
    const userReport = await exchangeService.importData(jsonPath, "user");
    console.log(`Reporte Usuarios: ${userReport.successCount} éxitos, ${userReport.failureCount} fallos.`);

    console.log("Importando Productos desde CSV...");
    const productReport = await exchangeService.importData(csvPath, "product");
    console.log(`Reporte Productos: ${productReport.successCount} éxitos, ${productReport.failureCount} fallos.`);

    // 5. Ejecutar Exportaciones
    console.log("Exportando base de datos a XML...");
    const xmlFile = await exchangeService.exportData("user", "xml");
    console.log(`Exportación XML completada: ${xmlFile}`);

    console.log("Exportando base de datos a CSV...");
    const csvExportFile = await exchangeService.exportData("product", "csv");
    console.log(`Exportación CSV completada: ${csvExportFile}`);

    console.log("\n--- Proceso finalizado. Revisa la carpeta /reports para ver los resultados ---");
}

runExample().catch(console.error);
