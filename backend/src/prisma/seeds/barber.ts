import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear usuario con rol BARBER
    const hashedPassword = await bcryptjs.hash('BarberiaClipper123', 10);
    const user = await prisma.user.create({
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
    const barber = await prisma.barber.create({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: '5555555555',
        instagram: 'clippercut_barberia',
        isActive: true
      }
    });

    console.log('Usuario barbero creado exitosamente:', {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });
    
    console.log('Registro de barbero creado exitosamente:', {
      id: barber.id,
      firstName: barber.firstName,
      lastName: barber.lastName,
      email: barber.email
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creando el barbero:', error.message);
      
      // Si el usuario ya existe, intentar actualizar la contraseña
      if (error.message.includes('Unique constraint')) {
        try {
          const hashedPassword = await bcryptjs.hash('BarberiaClipper123', 10);
          const updatedUser = await prisma.user.update({
            where: { email: 'barberos@clippercut.com.mx' },
            data: { 
              password: hashedPassword,
              role: 'BARBER'
            }
          });
          console.log('Contraseña de usuario actualizada exitosamente');
        } catch (updateError) {
          console.error('Error actualizando el usuario:', updateError);
        }
      }
    } else {
      console.error('Error desconocido:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main(); 