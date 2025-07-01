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

    // Crear un objeto con todas las fechas del mes
    const allDates: { [key: string]: any } = {};
    let currentDate = startOfDay(startDate);
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      allDates[dateStr] = {
        EFECTIVO: 0,
        DEBITO: 0,
        CREDITO: 0
      };
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Llenar con los datos reales
    sales.forEach(sale => {
      const localDate = new Date(sale.saleDate.getTime() + (offset * 60 * 1000));
      const dateStr = format(localDate, 'yyyy-MM-dd');
      if (allDates[dateStr]) {
        allDates[dateStr][sale.paymentMethod] = sale._sum.amount || 0;
      }
    });

    res.json(allDates);
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

    const formattedSales = sales.map(sale => {
      const barber = barbers.find(b => b.id === sale.barberId);
      return {
        name: `${barber?.firstName} ${barber?.lastName}`.trim(),
        value: sale._sum.amount || 0
      };
    });

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
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 5;
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

    // Ordenar por días desde última visita (los que nunca han visitado al final)
    const sortedClients = inactiveClients.sort((a, b) => {
      if (a.daysSinceLastVisit === null) return 1;
      if (b.daysSinceLastVisit === null) return -1;
      return a.daysSinceLastVisit - b.daysSinceLastVisit;
    });

    // Calcular el total de páginas
    const totalClients = sortedClients.length;
    const totalPages = Math.ceil(totalClients / pageSize);

    // Obtener los clientes de la página actual
    const startIndex = (page - 1) * pageSize;
    const paginatedClients = sortedClients.slice(startIndex, startIndex + pageSize);

    res.json({
      clients: paginatedClients,
      pagination: {
        currentPage: page,
        totalPages,
        totalClients,
        pageSize
      }
    });
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

    // Obtener todos los servicios activos primero
    const allServices = await prisma.service.findMany({
      where: {
        isActive: true
      },
      select: {
        name: true
      }
    });

    // Crear un objeto con todas las fechas del mes y todos los servicios inicializados en 0
    const allDates: { [key: string]: { [key: string]: number } } = {};
    let currentDate = startOfDay(startDate);
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      allDates[dateStr] = {};
      // Inicializar todos los servicios en 0 para esta fecha
      allServices.forEach(service => {
        allDates[dateStr][service.name] = 0;
      });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Obtener las ventas completadas con sus servicios
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: startDateUTC,
          lte: endDateUTC,
        },
        status: 'completed'
      },
      include: {
        service: true
      }
    });

    // Actualizar los conteos de servicios por fecha
    sales.forEach(sale => {
      const localDate = new Date(sale.saleDate.getTime() + (offset * 60 * 1000));
      const dateStr = format(localDate, 'yyyy-MM-dd');
      if (allDates[dateStr] && sale.service.name) {
        allDates[dateStr][sale.service.name]++;
      }
    });

    res.json(allDates);
  } catch (error) {
    console.error("Error getting services by date:", error);
    throw new AppError("Error al obtener los servicios por fecha", 500);
  }
}; 