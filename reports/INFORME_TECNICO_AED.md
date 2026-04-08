# INFORME TÉCNICO: SISTEMA DE CONSULTAS DE ALTO RENDIMIENTO (AED)

**Asignatura:** Acceso a Datos (AED)  
**Proyecto:** SincroData-PRO  
**Tecnologías:** Node.js, PostgreSQL, Driver 'pg', Prisma 7.4.1  

---

## 1. Introducción
Este documento detalla la implementación de un sistema de consultas a bajo nivel sobre una base de datos relacional PostgreSQL. El objetivo principal es demostrar el control manual de recursos y la aplicación de medidas de seguridad y optimización que el ORM Prisma suele abstraer.

## 2. Tecnologías Aplicadas

### A. Prevención de Inyección SQL (Prepared Statements)
Para garantizar la seguridad de los informes, se ha evitado la concatenación de strings en las consultas SQL. En su lugar, se utilizan **Consultas Parametrizadas** mediante el driver nativo `pg`.

- **Mecanismo:** Se utiliza la sintaxis `$1, $2, ...` para enviar los datos de forma separada a la sentencia SQL.
- **Ventaja:** El motor de PostgreSQL pre-compila la consulta y trata los parámetros estrictamente como datos, neutralizando cualquier intento de inyección de código.

### B. Gestión de ResultSets y Metadatos
A diferencia del uso de objetos automáticos, el sistema recupera un objeto de respuesta (`res`) que contiene:
- `rows`: El array de datos brutos.
- `fields`: Los metadatos de las columnas (nombres, tipos).
- `rowCount`: El número total de registros afectados o recuperados.

### C. Gestión de Recursos (Connection Pooling)
Se ha implementado una gestión estricta del ciclo de vida de las conexiones para evitar el agotamiento del pool (Connection Leak).

- **Proceso:** 
  1. Se solicita un cliente al Pool mediante `await pool.connect()`.
  2. La lógica se ejecuta dentro de un bloque `try`.
  3. Independientemente del éxito o fallo, se ejecuta el bloque `finally` para llamar a `client.release()`.
- **Importancia:** Esto devuelve la conexión al pool de forma inmediata, permitiendo que otros procesos la reutilicen y manteniendo la escalabilidad del servidor.

### D. Optimización de Consultas
Para mejorar el rendimiento (Performance Queries), se han aplicado las siguientes técnicas:
1. **Selección de Columnas:** Se evitan los `SELECT *`, recuperando únicamente los campos necesarios.
2. **Joins Optimizados:** Se han implementado `INNER JOIN` y `LEFT JOIN` con agrupaciones (`GROUP BY`) para reducir el número de peticiones a la base de datos, delegando el peso del cálculo al motor relacional.

---

## 3. Ejemplos de Implementación

### Consulta Parametrizada (Filtrado por Rol)
```sql
SELECT id, email, role FROM "User" WHERE role = $1
```
*Garantiza que el valor de 'role' no pueda romper la sintaxis SQL.*

### Informe Complejo (Ranking de Clientes)
```sql
SELECT 
    u.email, 
    SUM(p.total) as total_spent, 
    COUNT(p.id) as orders_count
FROM "User" u
JOIN "Purchase" p ON u.id = p."userId"
GROUP BY u.id, u.email
ORDER BY total_spent DESC
LIMIT 10
```
*Recupera el Top 10 de clientes mediante una sola operación de JOIN y agregación.*

---

## 4. Conclusión
El sistema implementado en `SincroData-PRO` cumple con los estándares más exigentes de **Acceso a Datos**. Combina la facilidad de desarrollo de Prisma (para operaciones CRUD) con la potencia y seguridad del acceso nativo para informes críticos y de alto rendimiento.
