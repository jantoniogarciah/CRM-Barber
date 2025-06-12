import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

async function main() {
  console.log('Starting database migration...');

  try {
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    console.log('Using schema path:', schemaPath);
    
    console.log('Running Prisma migrations...');
    execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      }
    });
    
    // Execute the migration
    const prisma = new PrismaClient();
    
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
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

main(); 