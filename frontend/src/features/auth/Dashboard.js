// frontend/src/features/auth/Dashboard.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  navButton: {
    marginRight: theme.spacing(2),
    textDecoration: 'none',
    color: '#fff'
  },
  content: {
    marginTop: theme.spacing(4),
    textAlign: 'center'
  },
  signOutButton: {
    marginLeft: theme.spacing(2),
    color: '#fff'
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const history = useHistory();

  // Cada módulo tiene su URL de API
  const modules = [
    { name: 'Apartamentos', url: 'http://localhost:5000/api/apartamentos' },
    { name: 'Clientes', url: 'http://localhost:5000/api/clientes' },
    { name: 'Usuarios', url: 'http://localhost:5000/api/usuarios' },
    { name: 'Reservas', url: 'http://localhost:5000/api/reservas' },
    { name: 'Pagos', url: 'http://localhost:5000/api/pagos' },
    { name: 'Descuentos', url: 'http://localhost:5000/api/descuentos' },
    { name: 'Hospedajes', url: 'http://localhost:5000/api/hospedajes' }
  ];

  const handleSignOut = () => {
    // Elimina el token y redirige al login
    localStorage.removeItem('token');
    history.replace('/');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Reservsoft - API Endpoints
          </Typography>
          {modules.map((mod) => (
            <Button
              key={mod.name}
              color="inherit"
              href={mod.url}
              target="_blank"
              className={classes.navButton}
            >
              {mod.name}
            </Button>
          ))}
          <Button color="inherit" onClick={handleSignOut} className={classes.signOutButton}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Container className={classes.content}>
        <Typography variant="h3" gutterBottom>
          Bienvenido a Reservsoft API
        </Typography>
        <Typography variant="body1">
          Haz clic en alguno de los botones del menú para ver la respuesta de la API en una nueva pestaña.
        </Typography>
      </Container>
    </>
  );
};

export default Dashboard;
