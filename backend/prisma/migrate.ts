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

async function createInitialCategories() {
  try {
    const categories = [
      {
        name: 'Corte Hombre',
        description: 'Servicios de corte y estilizado para caballeros',
        isActive: true,
      },
      {
        name: 'Corte Mujer',
        description: 'Servicios de corte y estilizado para damas',
        isActive: true,
      },
      {
        name: 'Corte Niño',
        description: 'Servicios de corte especializados para niños',
        isActive: true,
      },
      {
        name: 'Barba',
        description: 'Servicios de arreglo y mantenimiento de barba',
        isActive: true,
      },
      {
        name: 'Barba y Corte',
        description: 'Servicio completo de corte de cabello y arreglo de barba',
        isActive: true,
      },
      {
        name: 'Productos',
        description: 'Productos para el cuidado del cabello y la barba',
        isActive: true,
      },
    ];

    console.log('Creating initial categories...');

    for (const category of categories) {
      const existingCategory = await prisma.category.findFirst({
        where: { name: category.name },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: category,
        });
        console.log(`Category created: ${category.name}`);
      } else {
        console.log(`Category ${category.name} already exists`);
      }
    }

    console.log('Initial categories created successfully');
  } catch (error) {
    console.error('Error creating initial categories:', error);
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
  
  console.log('Creating initial categories...');
  await createInitialCategories();
  
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