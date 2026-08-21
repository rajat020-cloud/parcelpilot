import { getDB } from '../lib/data/db';

function runSeed() {
  console.log('Seeding ParcelPilot memory database and generating PDF data pack files...');
  const db = getDB();
  console.log(`Seed complete! Database populated with ${db.getAllAccounts().length} accounts, ${db.getAllOrders().length} orders, and ${db.getAllTickets().length} tickets.`);
}

runSeed();
