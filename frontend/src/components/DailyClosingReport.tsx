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
    fontSize: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'flex' as const,
    width: '100%',
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
  },
  tableCell: {
    flex: 1,
    padding: 5,
    textAlign: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
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

  return (
    <PDFViewer style={{ width: '100%', height: '80vh' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Encabezado */}
          <View style={styles.header}>
            <Text style={styles.title}>Clipper Cut - Reporte de Cierre Diario</Text>
            <Text style={styles.subtitle}>
              {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
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
              <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Resumen por Método de Pago */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Por Método de Pago</Text>
            {Object.entries(paymentSummary).map(([method, amount]) => (
              <View key={method} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{method}:</Text>
                <Text style={styles.summaryValue}>${amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Resumen por Servicio */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Resumen por Servicio</Text>
            <View style={[styles.table]}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Servicio</Text>
                <Text style={styles.tableCell}>Cantidad</Text>
                <Text style={styles.tableCell}>Total</Text>
              </View>
              {Object.values(serviceSummary).map((summary) => (
                <View key={summary.name} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{summary.name}</Text>
                  <Text style={styles.tableCell}>{summary.count}</Text>
                  <Text style={styles.tableCell}>${summary.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Detalle de Ventas */}
          <View style={styles.section}>
            <Text style={styles.summaryTitle}>Detalle de Ventas</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Hora</Text>
                <Text style={styles.tableCell}>Cliente</Text>
                <Text style={styles.tableCell}>Servicio</Text>
                <Text style={styles.tableCell}>Monto</Text>
                <Text style={styles.tableCell}>Método</Text>
              </View>
              {sales.map((sale) => (
                <View key={sale.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {format(new Date(sale.saleDate || sale.createdAt), 'HH:mm')}
                  </Text>
                  <Text style={styles.tableCell}>
                    {`${sale.client?.firstName} ${sale.client?.lastName}`}
                  </Text>
                  <Text style={styles.tableCell}>{sale.service?.name}</Text>
                  <Text style={styles.tableCell}>${sale.amount.toFixed(2)}</Text>
                  <Text style={styles.tableCell}>{sale.paymentMethod}</Text>
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