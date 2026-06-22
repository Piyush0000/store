const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = "postgresql://zack:zack_secure_pass_123@localhost:5432/evoc_storefront";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Fetching local orders...');
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: true }
  });

  console.log(`Found ${orders.length} local orders:`);
  for (const order of orders) {
    console.log('\n--- Local Order ---');
    console.log({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      paymentMethod: order.paymentMethod,
      payuTxnId: order.payuTxnId,
      createdAt: order.createdAt
    });
    console.log('Items:', order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
