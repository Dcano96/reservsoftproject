"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography } from "@material-ui/core";
import clienteService from "./cliente.service";

const ClienteProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await clienteService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error al obtener el perfil del cliente", error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <Typography>Cargando perfil...</Typography>;

  return (
    <Container className="clientes-container">
      <Typography variant="h4" className="clientes-title">
        Mi Perfil
      </Typography>
      <Typography variant="body1"><strong>Nombre:</strong> {profile.nombre}</Typography>
      <Typography variant="body1"><strong>Documento:</strong> {profile.documento}</Typography>
      <Typography variant="body1"><strong>Email:</strong> {profile.email}</Typography>
      <Typography variant="body1"><strong>Teléfono:</strong> {profile.telefono}</Typography>
    </Container>
  );
};

export default ClienteProfile;
