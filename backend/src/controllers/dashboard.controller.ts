import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/appError";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns";

const prisma = new PrismaClient();

// Obtener ventas por día y método de pago
export const getSalesByDay = async (req: Request, res: Response) => {
  try {
    // Obtener el primer y último día del mes actual
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());

    const sales = await prisma.sale.groupBy({
      by: ['saleDate', 'paymentMethod'],
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

    const formattedSales = sales.reduce((acc: any, curr) => {
      const date = curr.saleDate.toISOString().split('T')[0];
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
    const daysThreshold = parseInt(req.query.days as string) || 12;
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