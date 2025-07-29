import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Sale } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DailyClosingReportProps {
  sales: Sale[];
  date: Date;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  title: {
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  table: {
    display: 'flex' as const,
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row' as const,
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontSize: 8,
    fontWeight: 'bold',
    padding: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    fontSize: 7,
    padding: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: 3,
    fontSize: 8,
  },
  totalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    fontSize: 9,
    fontWeight: 'bold',
  },
  col20: { width: '20%' },
  col25: { width: '25%' },
  col15: { width: '15%' },
  col10: { width: '10%' },
});

const DailyClosingReport: React.FC<DailyClosingReportProps> = ({ sales, date }) => {
  // Calcular resumen por servicio
  const servicesSummary = sales.reduce((acc, sale) => {
    const serviceName = sale.service?.name || 'Sin servicio';
    if (!acc[serviceName]) {
      acc[serviceName] = {
        count: 0,
        total: 0,
      };
    }
    acc[serviceName].count += 1;
    acc[serviceName].total += sale.amount;
    return acc;
  }, {} as { [key: string]: { count: number; total: number } });

  // Calcular resumen por método de pago
  const paymentSummary = sales.reduce((acc, sale) => {
    const method = sale.paymentMethod || 'EFECTIVO';
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += sale.amount;
    return acc;
  }, {} as { [key: string]: number });

  // Calcular total general
  const totalAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Clipper Cut Barber Sports</Text>
          <Text style={{ fontSize: 10, marginTop: 5 }}>
            Reporte de Cierre del {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </Text>
        </View>

        <Text style={styles.title}>Resumen por Servicio</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableHeader, styles.col25]}><Text>Servicio</Text></View>
            <View style={[styles.tableHeader, styles.col10]}><Text>Cant.</Text></View>
            <View style={[styles.tableHeader, styles.col15]}><Text>Total</Text></View>
          </View>
          {Object.entries(servicesSummary)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([service, { count, total }]) => (
              <View key={service} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.col25]}><Text>{service}</Text></View>
                <View style={[styles.tableCell, styles.col10]}><Text>{count}</Text></View>
                <View style={[styles.tableCell, styles.col15]}>
                  <Text>${total.toLocaleString()}</Text>
                </View>
              </View>
            ))}
        </View>

        <Text style={styles.title}>Resumen por Método de Pago</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableHeader, styles.col20]}><Text>Método</Text></View>
            <View style={[styles.tableHeader, styles.col15]}><Text>Total</Text></View>
          </View>
          {Object.entries(paymentSummary).map(([method, total]) => (
            <View key={method} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.col20]}><Text>{method}</Text></View>
              <View style={[styles.tableCell, styles.col15]}>
                <Text>${total.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.title}>Detalle de Ventas</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableHeader, styles.col20]}><Text>Cliente</Text></View>
            <View style={[styles.tableHeader, styles.col25]}><Text>Servicio</Text></View>
            <View style={[styles.tableHeader, styles.col15]}><Text>Barbero</Text></View>
            <View style={[styles.tableHeader, styles.col10]}><Text>Método</Text></View>
            <View style={[styles.tableHeader, styles.col10]}><Text>Total</Text></View>
          </View>
          {sales.map((sale) => (
            <View key={sale.id} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.col20]}>
                <Text>{`${sale.client?.firstName} ${sale.client?.lastName}`}</Text>
              </View>
              <View style={[styles.tableCell, styles.col25]}>
                <Text>{sale.service?.name}</Text>
              </View>
              <View style={[styles.tableCell, styles.col15]}>
                <Text>{`${sale.barber?.firstName} ${sale.barber?.lastName}`}</Text>
              </View>
              <View style={[styles.tableCell, styles.col10]}>
                <Text>{sale.paymentMethod}</Text>
              </View>
              <View style={[styles.tableCell, styles.col10]}>
                <Text>${sale.amount.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text>Total del Día:</Text>
          <Text>${totalAmount.toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default DailyClosingReport; 