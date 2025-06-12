import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Creando categorías iniciales...');

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: category.name },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Categoría creada: ${category.name}`);
    } else {
      console.log(`La categoría ${category.name} ya existe`);
    }
  }

  console.log('Categorías creadas exitosamente');
}

main()
  .catch((e) => {
    console.error('Error al crear las categorías:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 