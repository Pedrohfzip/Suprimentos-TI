import db from './src/Database/models/index.js';

async function test() {
  try {
    const printers = await db.Printer.findAll();
    console.log("Success:", printers);
  } catch (error) {
    console.error("Error fetching printers:", error);
  }
}

test();
