import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale } from '../types';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'flex' as const,
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontSize: 8,
  },
  tableCell: {
    fontSize: 7,
    padding: 5,
    textAlign: 'center',
  },
  tableCellTime: {
    width: '10%',
    fontSize: 7,
    padding: 5,
    textAlign: 'center',
  },
  tableCellClient: {
    width: '25%',
    fontSize: 7,
    padding: 5,
    textAlign: 'left',
  },
  tableCellService: {
    width: '25%',
    fontSize: 7,
    padding: 5,
    textAlign: 'left',
  },
  tableCellBarber: {
    width: '20%',
    fontSize: 7,
    padding: 5,
    textAlign: 'left',
  },
  tableCellAmount: {
    width: '10%',
    fontSize: 7,
    padding: 5,
    textAlign: 'right',
  },
  tableCellMethod: {
    width: '10%',
    fontSize: 7,
    padding: 5,
    textAlign: 'center',
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
    fontSize: 8,
  },
  summaryLabel: {
    flex: 2,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
  },
});

interface DailyClosingReportProps {
  sales: Sale[];
  date: Date;
}

interface ServiceSummary {
  name: string;
  count: number;
  total: number;
}

const DailyClosingReport: React.FC<DailyClosingReportProps> = ({ sales, date }) => {
  // Calcular resumen por servicio
  const serviceSummary = sales.reduce((acc: { [key: string]: ServiceSummary }, sale) => {
    const serviceName = sale.service?.name || 'Sin servicio';
    if (!acc[serviceName]) {
      acc[serviceName] = {
        name: serviceName,
        count: 0,
        total: 0,
      };
    }
    acc[serviceName].count += 1;
    acc[serviceName].total += sale.amount;
    return acc;
  }, {});

  // Calcular totales
  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);

  // Calcular totales por método de pago
  const paymentSummary = sales.reduce((acc: { [key: string]: number }, sale) => {
    const method = sale.paymentMethod || 'EFECTIVO';
    acc[method] = (acc[method] || 0) + sale.amount;
    return acc;
  }, {});

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm');
  };

  return (
    <PDFViewer style={{ width: '100%', height: '80vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Encabezado */}
          <View style={styles.header}>
            <Text style={styles.title}>Clipper Cut - Reporte de Cierre Diario</Text>
            <Text style={styles.subtitle}>
              {formatDate(date)}
            </Text>
          </View>

          {/* Resumen General */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Resumen General</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de Ventas:</Text>
              <Text style={styles.summaryValue}>{totalSales}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto Total:</Text>
              <Text style={styles.summaryValue}>${totalAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Resumen por Método de Pago */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Por Método de Pago</Text>
            {Object.entries(paymentSummary).map(([method, amount]) => (
              <View key={method} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{method}:</Text>
                <Text style={styles.summaryValue}>${amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          {/* Resumen por Servicio */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Resumen por Servicio</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: '50%', textAlign: 'left' }]}>Servicio</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>Cantidad</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>Total</Text>
              </View>
              {Object.values(serviceSummary).map((service) => (
                <View key={service.name} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '50%', textAlign: 'left' }]}>{service.name}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{service.count}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>${service.total.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Detalle de Ventas */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Detalle de Ventas</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellTime}>Hora</Text>
                <Text style={styles.tableCellClient}>Cliente</Text>
                <Text style={styles.tableCellService}>Servicio</Text>
                <Text style={styles.tableCellBarber}>Barbero</Text>
                <Text style={styles.tableCellAmount}>Monto</Text>
                <Text style={styles.tableCellMethod}>Método</Text>
              </View>
              {sales.map((sale) => (
                <View key={sale.id} style={styles.tableRow}>
                  <Text style={styles.tableCellTime}>
                    {formatTime(sale.saleDate || sale.createdAt)}
                  </Text>
                  <Text style={styles.tableCellClient}>
                    {`${sale.client?.firstName} ${sale.client?.lastName}`}
                  </Text>
                  <Text style={styles.tableCellService}>{sale.service?.name}</Text>
                  <Text style={styles.tableCellBarber}>
                    {`${sale.barber?.firstName} ${sale.barber?.lastName}`}
                  </Text>
                  <Text style={styles.tableCellAmount}>${sale.amount.toLocaleString()}</Text>
                  <Text style={styles.tableCellMethod}>{sale.paymentMethod}</Text>
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default DailyClosingReport; 