// InvoicePDF.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  poweredBy: {
    textAlign: 'center',
    marginBottom: 10,
    color: 'gray',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'extraBold',
  },
});

const InvoicePDF = ({ invoice }) => {
  // If invoice is not yet loaded, return a minimal Document
  if (!invoice) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>Loading invoice...</Text>
        </Page>
      </Document>
    );
  }

  // Destructure the data from "invoice"
  const {
    id,
    status,
    amount,
    tax,
    description,
    studentDisplayName,
    student_proxies,
    invoiceDisplayDate,
    classes,
  } = invoice;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.title}>Class Access</Text>
          <Text style={styles.poweredBy}>Powered by Class Access</Text>
        </View>

        {/* Divider */}
        <View style={{ marginVertical: 10, borderBottom: 1 }} />

        {/* Invoice Details */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: 14 }]}>Invoice Details</Text>
          <Text>
            <Text style={styles.label}>Invoice ID: </Text>
            {id || 'N/A'}
          </Text>
          <Text>
            <Text style={styles.label}>Date: </Text>
            {invoiceDisplayDate || 'N/A'}
          </Text>
          <Text>
            <Text style={styles.label}>Status: </Text>
            {status || 'N/A'}
          </Text>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={[styles.label, { fontSize: 14 }]}>Bill To</Text>
          <Text>
            <Text style={styles.label}>Name: </Text>
            {studentDisplayName || 'N/A'}
          </Text>
          <Text>
            <Text style={styles.label}>Email: </Text>
            {student_proxies?.email || 'N/A'}
          </Text>
        </View>

        {/* Divider */}
        <View style={{ marginVertical: 10, borderBottom: 1 }} />

        {/* Table Header Row */}
        <View style={{ flexDirection: 'row', backgroundColor: '#E6E6E6', padding: 5 }}>
          <Text style={{ width: '40%' }}>Description</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Quantity</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Unit Price</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Amount</Text>
        </View>

        {/* Table Item Row */}
        <View style={{ flexDirection: 'row', padding: 5 }}>
          <Text style={{ width: '40%' }}>{description || 'N/A'}</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>{classes || 1}</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>
            Rs. {((amount || 0) / (classes || 1)).toFixed(2)}
          </Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>
            Rs. {amount || 0}
          </Text>
        </View>

        {/* Divider */}
        <View style={{ marginVertical: 10, borderBottom: 1 }} />

        {/* Totals */}
        <View style={{ alignItems: 'flex-end', paddingRight: 5 }}>
          <Text>Subtotal: Rs. {amount || 0}</Text>
          <Text>Tax: Rs. {tax || 0}</Text>
          <Text style={{ marginTop: 5, fontSize: 13 }}>
            Total: Rs. {amount || 0}
          </Text>
        </View>

        {/* Footer */}
        <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0 }}>
          <Text style={{ textAlign: 'center', fontSize: 10 }}>
            Thank you for using Class Access!
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 10 }}>
            All rights reserved © Class Access, 2025
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
