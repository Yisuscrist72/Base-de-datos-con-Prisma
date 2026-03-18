import "dotenv/config";
import PrismaPkg from "@prisma/client";
const { PrismaClient, Role } = PrismaPkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { faker } from "@faker-js/faker";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("--- Iniciando Seeding Masivo ---");

    // 1. Limpieza de tablas (Orden invertido por FKs)
    console.log("Limpiando base de datos...");
    await prisma.reservation.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.token.deleteMany();
    await prisma.product.deleteMany();
    await prisma.priceInterval.deleteMany();
    await prisma.user.deleteMany();

    // 2. Crear Usuarios (50)
    console.log("Creando 50 usuarios...");
    const users = [];
    const roles = [Role.USER, Role.MANAGER, Role.ADMIN];

    // Siempre crear un admin conocido
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@empresa.com",
            password: "password123",
            role: Role.ADMIN,
        }
    });
    users.push(adminUser);

    for (let i = 0; i < 49; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email().toLowerCase(),
                password: faker.internet.password(),
                role: faker.helpers.arrayElement(roles),
            },
        });
        users.push(user);
    }

    // 3. Crear Intervalos de Precios (10)
    console.log("Creando 10 intervalos de precios...");
    const intervals = [];
    const seasonalNames = ["Primavera", "Verano", "Otoño", "Invierno", "Oferta Flash", "Black Friday", "Navidad", "Escapada", "Fin de Semana", "Liquidación"];

    for (let i = 0; i < 10; i++) {
        const startDate = faker.date.between({ from: '2025-01-01', to: '2025-06-30' });
        const endDate = faker.date.between({ from: startDate, to: '2025-12-31' });

        const interval = await prisma.priceInterval.create({
            data: {
                name: seasonalNames[i],
                startDate,
                endDate,
                price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
            },
        });
        intervals.push(interval);
    }

    // 4. Crear Productos (40)
    console.log("Creando 40 productos...");
    const products = [];
    for (let i = 0; i < 40; i++) {
        const productName = faker.commerce.productName();
        const product = await prisma.product.create({
            data: {
                name_es: productName + " (ES)",
                name_en: productName + " (EN)",
                name_fr: productName + " (FR)",
                name_de: productName + " (DE)",
                description_es: faker.commerce.productDescription(),
                description_en: faker.commerce.productDescription(),
                description_fr: faker.commerce.productDescription(),
                description_de: faker.commerce.productDescription(),
                priceIntervals: {
                    connect: { id: faker.helpers.arrayElement(intervals).id }
                }
            },
        });
        products.push(product);
    }

    // 5. Crear Compras (60)
    console.log("Creando 60 compras...");
    const statuses = ["PENDING", "COMPLETED", "CANCELLED"];
    const purchases = [];

    for (let i = 0; i < 60; i++) {
        const randomUser = faker.helpers.arrayElement(users.filter(u => u.role === Role.USER));
        const purchase = await prisma.purchase.create({
            data: {
                userId: randomUser ? randomUser.id : users[0].id,
                total: 0, // Se calculará después si fuera necesario, o simplemente aleatorio
                status: faker.helpers.arrayElement(statuses),
            },
        });
        purchases.push(purchase);
    }

    // 6. Crear Reservas (100)
    console.log("Creando 100 reservas...");
    for (let i = 0; i < 100; i++) {
        const product = faker.helpers.arrayElement(products);
        const purchase = faker.helpers.arrayElement(purchases);

        await prisma.reservation.create({
            data: {
                purchaseId: purchase.id,
                productId: product.id,
                reserveDate: faker.date.future(),
                quantity: faker.number.int({ min: 1, max: 5 }),
            },
        });
    }

    // Actualizar totales de compras basados en reservas (opcional, para coherencia)
    console.log("Ajustando totales de compra...");
    // Esto es un extra para que los datos tengan sentido
    for (const p of purchases) {
        const reservations = await prisma.reservation.findMany({
            where: { purchaseId: p.id },
            include: { product: { include: { priceIntervals: true } } }
        });

        let total = 0;
        for (const res of reservations) {
            const price = res.product.priceIntervals[0]?.price || 10;
            total += Number(price) * res.quantity;
        }

        await prisma.purchase.update({
            where: { id: p.id },
            data: { total }
        });
    }

    console.log("--- Seeding completado con éxito ---");
    console.log(`Resumen: 
    - Usuarios: ${users.length}
    - Intervalos: ${intervals.length}
    - Productos: ${products.length}
    - Compras: ${purchases.length}
    - Reservas: 100
    Total registros: ${users.length + intervals.length + products.length + purchases.length + 100}
    `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

