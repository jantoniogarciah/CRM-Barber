import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale } from '../types';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
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
    marginVertical: 5,
    marginHorizontal: 10,
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 20,
  },
  tableRowHeader: {
    backgroundColor: '#E4E4E4',
    borderTopColor: '#000',
    borderTopWidth: 1,
  },
  tableCellBase: {
    fontSize: 8,
    padding: 3,
  },
  // Celdas para el resumen por servicio
  tableCellServiceName: {
    width: '50%',
    textAlign: 'left',
  },
  tableCellServiceCount: {
    width: '25%',
    textAlign: 'center',
  },
  tableCellServiceTotal: {
    width: '25%',
    textAlign: 'right',
  },
  // Celdas para el detalle de ventas
  tableCellTime: {
    width: '10%',
    textAlign: 'center',
  },
  tableCellClient: {
    width: '20%',
    textAlign: 'left',
  },
  tableCellService: {
    width: '20%',
    textAlign: 'left',
  },
  tableCellBarber: {
    width: '20%',
    textAlign: 'left',
  },
  tableCellAmount: {
    width: '15%',
    textAlign: 'right',
  },
  tableCellMethod: {
    width: '15%',
    textAlign: 'center',
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 9,
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
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCellBase, styles.tableCellServiceName]}>Servicio</Text>
                <Text style={[styles.tableCellBase, styles.tableCellServiceCount]}>Cantidad</Text>
                <Text style={[styles.tableCellBase, styles.tableCellServiceTotal]}>Total</Text>
              </View>
              {Object.values(serviceSummary).map((service) => (
                <View key={service.name} style={styles.tableRow}>
                  <Text style={[styles.tableCellBase, styles.tableCellServiceName]}>{service.name}</Text>
                  <Text style={[styles.tableCellBase, styles.tableCellServiceCount]}>{service.count}</Text>
                  <Text style={[styles.tableCellBase, styles.tableCellServiceTotal]}>${service.total.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Detalle de Ventas */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Detalle de Ventas</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCellBase, styles.tableCellTime]}>Hora</Text>
                <Text style={[styles.tableCellBase, styles.tableCellClient]}>Cliente</Text>
                <Text style={[styles.tableCellBase, styles.tableCellService]}>Servicio</Text>
                <Text style={[styles.tableCellBase, styles.tableCellBarber]}>Barbero</Text>
                <Text style={[styles.tableCellBase, styles.tableCellAmount]}>Monto</Text>
                <Text style={[styles.tableCellBase, styles.tableCellMethod]}>Método</Text>
              </View>
              {sales.map((sale) => (
                <View key={sale.id} style={styles.tableRow}>
                  <Text style={[styles.tableCellBase, styles.tableCellTime]}>
                    {formatTime(sale.saleDate || sale.createdAt)}
                  </Text>
                  <Text style={[styles.tableCellBase, styles.tableCellClient]}>
                    {`${sale.client?.firstName} ${sale.client?.lastName}`}
                  </Text>
                  <Text style={[styles.tableCellBase, styles.tableCellService]}>
                    {sale.service?.name}
                  </Text>
                  <Text style={[styles.tableCellBase, styles.tableCellBarber]}>
                    {`${sale.barber?.firstName} ${sale.barber?.lastName}`}
                  </Text>
                  <Text style={[styles.tableCellBase, styles.tableCellAmount]}>
                    ${sale.amount.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCellBase, styles.tableCellMethod]}>
                    {sale.paymentMethod}
                  </Text>
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