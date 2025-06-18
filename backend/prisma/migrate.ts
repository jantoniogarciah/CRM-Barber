import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@clippercut.com.mx' }
    });

    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash('AdminClipper123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@clippercut.com.mx',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'ClipperCut',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

async function createInitialBarber() {
  try {
    // Verificar si el barbero ya existe
    const barberExists = await prisma.user.findUnique({
      where: { email: 'barberos@clippercut.com.mx' }
    });

    if (!barberExists) {
      // Crear usuario barbero
      const hashedPassword = await bcryptjs.hash('BarberiaClipper123', 10);
      const barberUser = await prisma.user.create({
        data: {
          email: 'barberos@clippercut.com.mx',
          password: hashedPassword,
          firstName: 'Barbero',
          lastName: 'ClipperCut',
          role: 'BARBER',
          status: 'ACTIVE'
        }
      });

      // Crear registro en la tabla barbers
      await prisma.barber.create({
        data: {
          firstName: barberUser.firstName,
          lastName: barberUser.lastName,
          email: barberUser.email,
          phone: '5555555555',
          instagram: 'clippercut_barberia',
          isActive: true
        }
      });

      console.log('Initial barber created successfully');
    } else {
      console.log('Barber user already exists');
    }
  } catch (error) {
    console.error('Error creating initial barber:', error);
  }
}

async function main() {
  console.log('Starting database migration...');
  
  console.log('Using schema path:', process.env.PRISMA_SCHEMA_PATH || 'prisma/schema.prisma');
  
  console.log('Running Prisma migrations...');
  
  console.log('Creating admin user...');
  await createAdminUser();
  
  console.log('Creating initial barber...');
  await createInitialBarber();
  
  console.log('Migration completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 