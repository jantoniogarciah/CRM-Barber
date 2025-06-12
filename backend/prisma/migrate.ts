import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('Starting database migration...');

  try {
    // Create migrations directory if it doesn't exist
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir);
    }

    // Write migration SQL to file
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'migrations/migration.sql'), 'utf8');
    
    // Execute the migration
    const prisma = new PrismaClient();
    
    console.log('Executing migration...');
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('Creating admin user...');
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@clippercut.com.mx' }
    });

    if (!adminExists) {
      // Create admin user with hashed password (password: admin123)
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@clippercut.com.mx',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    await prisma.$disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 