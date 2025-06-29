import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/appError";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from "date-fns";
import { getTimezoneOffset } from 'date-fns-tz';

const prisma = new PrismaClient();
const timeZone = 'America/Mexico_City';

// Obtener ventas por día y método de pago
export const getSalesByDay = async (req: Request, res: Response) => {
  try {
    // Obtener el primer y último día del mes actual en la zona horaria local
    const now = new Date();
    const offset = getTimezoneOffset(timeZone, now) / (60 * 1000); // convertir a minutos
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    // Ajustar las fechas con el offset de la zona horaria
    const startDateUTC = new Date(startOfDay(startDate).getTime() - (offset * 60 * 1000));
    const endDateUTC = new Date(endOfDay(endDate).getTime() - (offset * 60 * 1000));

    const sales = await prisma.sale.groupBy({
      by: ['saleDate', 'paymentMethod'],
      where: {
        saleDate: {
          gte: startDateUTC,
          lte: endDateUTC,
        },
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    });

    const formattedSales = sales.reduce((acc: any, curr) => {
      // Ajustar la fecha con el offset de la zona horaria
      const localDate = new Date(curr.saleDate.getTime() + (offset * 60 * 1000));
      const date = format(localDate, 'yyyy-MM-dd');
      
      if (!acc[date]) {
        acc[date] = {
          EFECTIVO: 0,
          DEBITO: 0,
          CREDITO: 0,
        };
      }
      acc[date][curr.paymentMethod] = curr._sum.amount || 0;
      return acc;
    }, {});

    res.json(formattedSales);
  } catch (error) {
    console.error("Error getting sales by day:", error);
    throw new AppError("Error al obtener las ventas por día", 500);
  }
};

// Obtener distribución de ventas por barbero
export const getSalesByBarber = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    const sales = await prisma.sale.groupBy({
      by: ['barberId'],
      where: {
        saleDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    });

    const barbers = await prisma.barber.findMany({
      where: {
        id: {
          in: sales.map(s => s.barberId)
        }
      }
    });

    const formattedSales = sales.map(sale => ({
      barber: barbers.find(b => b.id === sale.barberId)?.firstName + ' ' + 
              barbers.find(b => b.id === sale.barberId)?.lastName,
      total: sale._sum.amount || 0
    }));

    res.json(formattedSales);
  } catch (error) {
    console.error("Error getting sales by barber:", error);
    throw new AppError("Error al obtener las ventas por barbero", 500);
  }
};

// Obtener clientes sin visitas recientes
export const getInactiveClients = async (req: Request, res: Response) => {
  try {
    const daysThreshold = parseInt(req.query.days as string) || 15;
    const thresholdDate = subDays(new Date(), daysThreshold);

    // Obtener todos los clientes activos
    const clients = await prisma.client.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        appointments: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
          where: {
            status: 'completed'
          }
        },
        sales: {
          orderBy: {
            saleDate: 'desc'
          },
          take: 1,
          where: {
            status: 'completed'
          }
        }
      }
    });

    // Filtrar clientes inactivos
    const inactiveClients = clients.filter(client => {
      const lastAppointment = client.appointments[0]?.date;
      const lastSale = client.sales[0]?.saleDate;

      let lastVisit = null;
      if (lastAppointment && lastSale) {
        lastVisit = new Date(lastAppointment) > new Date(lastSale) ? lastAppointment : lastSale;
      } else if (lastAppointment) {
        lastVisit = lastAppointment;
      } else if (lastSale) {
        lastVisit = lastSale;
      }

      return !lastVisit || new Date(lastVisit) < thresholdDate;
    }).map(client => ({
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      phone: client.phone,
      lastVisit: client.appointments[0]?.date || client.sales[0]?.saleDate || null,
      daysSinceLastVisit: client.appointments[0]?.date || client.sales[0]?.saleDate
        ? Math.floor((new Date().getTime() - new Date(client.appointments[0]?.date || client.sales[0]?.saleDate).getTime()) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json(inactiveClients);
  } catch (error) {
    console.error("Error getting inactive clients:", error);
    throw new AppError("Error al obtener los clientes inactivos", 500);
  }
};

// Obtener servicios por fecha
export const getServicesByDate = async (req: Request, res: Response) => {
  try {
    // Obtener el primer y último día del mes actual en la zona horaria local
    const now = new Date();
    const offset = getTimezoneOffset(timeZone, now) / (60 * 1000); // convertir a minutos
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    // Ajustar las fechas con el offset de la zona horaria
    const startDateUTC = new Date(startOfDay(startDate).getTime() - (offset * 60 * 1000));
    const endDateUTC = new Date(endOfDay(endDate).getTime() - (offset * 60 * 1000));

    console.log('Fechas de búsqueda:', {
      startDateUTC: startDateUTC.toISOString(),
      endDateUTC: endDateUTC.toISOString()
    });

    // Obtener las citas con sus servicios
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDateUTC,
          lte: endDateUTC,
        },
        status: 'completed'
      },
      include: {
        service: true
      }
    });

    console.log('Citas encontradas:', appointments.length);

    // Agrupar servicios por fecha
    const servicesByDate = appointments.reduce((acc: { [key: string]: { [key: string]: number } }, appointment) => {
      const localDate = new Date(appointment.date.getTime() + (offset * 60 * 1000));
      const date = format(localDate, 'yyyy-MM-dd');
      
      if (!acc[date]) {
        acc[date] = {};
      }
      
      const serviceName = appointment.service.name;
      acc[date][serviceName] = (acc[date][serviceName] || 0) + 1;
      
      return acc;
    }, {});

    console.log('Servicios agrupados por fecha:', servicesByDate);

    // Obtener todos los servicios únicos para asegurar que cada fecha tenga todos los servicios
    const allServices = await prisma.service.findMany({
      where: {
        isActive: true
      },
      select: {
        name: true
      }
    });

    console.log('Servicios activos:', allServices.map(s => s.name));

    // Asegurar que cada fecha tenga todos los servicios (incluso con valor 0)
    const dates = Object.keys(servicesByDate);
    dates.forEach(date => {
      allServices.forEach(service => {
        if (!servicesByDate[date][service.name]) {
          servicesByDate[date][service.name] = 0;
        }
      });
    });

    console.log('Respuesta final:', servicesByDate);

    res.json(servicesByDate);
  } catch (error) {
    console.error("Error getting services by date:", error);
    throw new AppError("Error al obtener los servicios por fecha", 500);
  }
}; 