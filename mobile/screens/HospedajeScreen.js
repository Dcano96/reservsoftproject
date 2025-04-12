import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const HospedajeScreen = () => {
  const [hospedajes, setHospedajes] = useState([]);

  useEffect(() => {
    const fetchHospedajes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/hospedajes');
        setHospedajes(res.data);
      } catch (error) {
        console.error('Error fetching hospedajes', error);
      }
    };

    fetchHospedajes();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>Reserva: {item.reserva ? item.reserva._id : 'N/A'}</Text>
      <Text>Check-In: {new Date(item.checkIn).toLocaleString()}</Text>
      <Text>Check-Out: {item.checkOut ? new Date(item.checkOut).toLocaleString() : 'Pendiente'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hospedajes</Text>
      <FlatList
        data={hospedajes}
        keyExtractor={item => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  item: { marginBottom: 15, padding: 10, borderWidth: 1, borderRadius: 5 }
});

export default HospedajeScreen;
