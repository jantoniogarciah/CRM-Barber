import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.sale.deleteMany();
  await prisma.serviceLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.client.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@clippercut.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create barber user
  const barberPassword = await bcrypt.hash('Barberos123', 10);
  const barberUser = await prisma.user.create({
    data: {
      email: 'barberos@clippercut.com.mx',
      password: barberPassword,
      firstName: 'Barbero',
      lastName: 'Principal',
      role: 'BARBER',
    },
  });

  console.log('Created barber user:', barberUser.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Cortes',
        description: 'Cortes de cabello',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Barba',
        description: 'Servicios de barba',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tratamientos',
        description: 'Tratamientos capilares',
      },
    }),
  ]);

  console.log('Created categories');

  // Create services
  const servicesPromises = categories.flatMap((category) => {
    if (category.name === 'Cortes') {
      return [
        prisma.service.create({
          data: {
            name: 'Corte Básico',
            description: 'Corte de cabello básico',
            price: 150,
            duration: 30,
            categoryId: category.id,
          },
        }),
        prisma.service.create({
          data: {
            name: 'Corte + Barba',
            description: 'Corte de cabello y arreglo de barba',
            price: 250,
            duration: 45,
            categoryId: category.id,
          },
        }),
      ];
    } else if (category.name === 'Barba') {
      return [
        prisma.service.create({
          data: {
            name: 'Afeitado Tradicional',
            description: 'Afeitado con navaja y toalla caliente',
            price: 120,
            duration: 30,
            categoryId: category.id,
          },
        }),
        prisma.service.create({
          data: {
            name: 'Perfilado de Barba',
            description: 'Perfilado y arreglo de barba',
            price: 100,
            duration: 20,
            categoryId: category.id,
          },
        }),
      ];
    } else if (category.name === 'Tratamientos') {
      return [
        prisma.service.create({
          data: {
            name: 'Tratamiento Hidratante',
            description: 'Tratamiento hidratante para cabello',
            price: 200,
            duration: 40,
            categoryId: category.id,
          },
        }),
        prisma.service.create({
          data: {
            name: 'Tratamiento Anti-caída',
            description: 'Tratamiento especializado anti-caída',
            price: 300,
            duration: 45,
            categoryId: category.id,
          },
        }),
      ];
    }
    return [];
  });

  const services = await Promise.all(servicesPromises);
  // Flatten the array of services since each category returns an array
  const flattenedServices = services.flat();

  console.log('Created services');

  // Create barbers
  const barbers = await Promise.all([
    prisma.barber.create({
      data: {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
        email: 'juan@clippercut.com',
        instagram: '@juanperez',
      },
    }),
    prisma.barber.create({
      data: {
        firstName: 'Miguel',
        lastName: 'González',
        phone: '5567891234',
        email: 'miguel@clippercut.com',
        instagram: '@miguelgonzalez',
      },
    }),
  ]);

  console.log('Created barbers');

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        phone: '5512345678',
        email: 'carlos@email.com',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Ana',
        lastName: 'Martínez',
        phone: '5587654321',
        email: 'ana@email.com',
      },
    }),
  ]);

  console.log('Created clients');

  // Create some appointments
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Promise.all([
    prisma.appointment.create({
      data: {
        clientId: clients[0].id,
        serviceId: flattenedServices[0].id,
        barberId: barbers[0].id,
        date: today.toISOString(),
        time: '10:00',
        status: 'confirmed',
      },
    }),
    prisma.appointment.create({
      data: {
        clientId: clients[1].id,
        serviceId: flattenedServices[1].id,
        barberId: barbers[1].id,
        date: tomorrow.toISOString(),
        time: '15:00',
        status: 'pending',
      },
    }),
  ]);

  console.log('Created appointments');

  // Create some sales
  await Promise.all([
    prisma.sale.create({
      data: {
        clientId: clients[0].id,
        serviceId: flattenedServices[0].id,
        barberId: barbers[0].id,
        amount: 150,
        status: 'completed',
        notes: 'Venta inicial',
      },
    }),
    prisma.sale.create({
      data: {
        clientId: clients[1].id,
        serviceId: flattenedServices[1].id,
        barberId: barbers[1].id,
        amount: 250,
        status: 'completed',
        notes: 'Venta inicial',
      },
    }),
  ]);

  console.log('Created sales');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 