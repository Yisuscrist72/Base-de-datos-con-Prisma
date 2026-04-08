import { pool } from "../db.js";

/**
 * Servicio de Informes Nativos (AED)
 * 
 * Este servicio demuestra el acceso a datos a bajo nivel utilizando el driver 'pg'
 * de forma directa, sin pasar por el ORM Prisma. Cumple con los requisitos de:
 * 1. PreparedStatements (Consultas parametrizadas)
 * 2. Gestión de ResultSets (Manejo de filas y metadatos)
 * 3. Gestión de Recursos (Cierre de conexiones/release)
 * 4. Optimización (JOINs y selección de columnas)
 */
export class NativeReportService {

    /**
     * Obtiene usuarios filtrados por rol.
     * Demuestra el uso de PreparedStatements ($1) para prevenir Inyección SQL.
     */
    async getUsersByRole(role: string) {
        // En JDBC sería: Connection conn = pool.getConnection();
        const client = await pool.connect();
        
        try {
            console.log(`[AED] Ejecutando consulta parametrizada para rol: ${role}`);
            
            // Prepared Statement: El motor de DB ya conoce la estructura, solo inyectamos el dato.
            const query = {
                name: 'fetch-users-by-role',
                text: 'SELECT id, email, role, "createdAt" FROM "User" WHERE role = $1 ORDER BY "createdAt" DESC',
                values: [role],
            };

            // Ejecución y obtención del ResultSet (res.rows)
            const res = await client.query(query);
            
            return {
                rowCount: res.rowCount,
                rows: res.rows,
                fields: res.fields.map(f => f.name) // Metadatos
            };
        } catch (error) {
            console.error("Error en informe nativo:", error);
            throw error;
        } finally {
            // CRÍTICO: Cierre de recursos. Equivalente a conn.close() en Java.
            // Si no se hace, se agota el Pool de conexiones y el servidor se bloquea.
            client.release();
        }
    }

    /**
     * Genera un ranking de clientes por volumen de compras.
     * Demuestra optimización mediante JOINs complejos y selección de campos específicos.
     */
    async getCustomerRanking() {
        const client = await pool.connect();
        
        try {
            console.log("[AED] Generando ranking de clientes mediante JOIN optimizado...");
            
            // Consulta de rendimiento:
            // - Solo traemos los campos necesarios (email, total_spent, orders_count)
            // - Usamos agregación en la DB, no en el código (más rápido)
            const sql = `
                SELECT 
                    u.email, 
                    SUM(p.total) as total_spent, 
                    COUNT(p.id) as orders_count,
                    MAX(p."createdAt") as last_purchase
                FROM "User" u
                JOIN "Purchase" p ON u.id = p."userId"
                WHERE p.status = 'COMPLETED' OR p.status = 'PENDING'
                GROUP BY u.id, u.email
                ORDER BY total_spent DESC
                LIMIT 10
            `;

            const res = await client.query(sql);
            return res.rows;
        } catch (error) {
            console.error("Error en ranking nativo:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Informe de inventario y precios (INNER JOIN)
     */
    async getProductPriceReport() {
        const client = await pool.connect();
        try {
            const sql = `
                SELECT 
                    p.name_es as producto,
                    pi.name as intervalo,
                    pi.price as precio,
                    pi."startDate",
                    pi."endDate"
                FROM "Product" p
                INNER JOIN "_PriceIntervalToProduct" pip ON p.id = pip."B"
                INNER JOIN "PriceInterval" pi ON pip."A" = pi.id
                ORDER BY p.name_es ASC
            `;
            const res = await client.query(sql);
            return res.rows;
        } finally {
            client.release();
        }
    }
}
