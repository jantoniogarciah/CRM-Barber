import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@clippercut.com.mx' },
    update: {},
    create: {
      email: 'admin@clippercut.com.mx',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: '1234567890',
    },
  });

  // Create initial categories
  const categories = [
    {
      name: 'Cortes de Cabello',
      description: 'Servicios de corte de cabello para hombres',
    },
    {
      name: 'Afeitado',
      description: 'Servicios de afeitado y arreglo de barba',
    },
    {
      name: 'Tratamientos',
      description: 'Tratamientos capilares y faciales',
    },
    {
      name: 'Paquetes',
      description: 'Combinaciones de servicios con descuento',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 