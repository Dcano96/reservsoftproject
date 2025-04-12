import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('recepcion'); // Ajusta el rol según convenga

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { nombre, email, password, rol });
      console.log('Registro exitoso', res.data);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error en el registro', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        placeholder="Nombre"
        style={styles.input}
        onChangeText={setNombre}
        value={nombre}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        placeholder="Rol"
        style={styles.input}
        onChangeText={setRol}
        value={rol}
      />
      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginVertical: 10, padding: 10 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' }
});

export default RegisterScreen;
