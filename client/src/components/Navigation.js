import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Auth from '../utils/auth';

const Navigation = () => {
  const location = useLocation();
  const logout = (event) => {
    event.preventDefault();
    Auth.logout();
  };

  if (!Auth.loggedIn()) {
    return null;
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          Fitness Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/history" active={location.pathname === '/history'}>
              History
            </Nav.Link>
            <Nav.Link as={Link} to="/exercise" active={location.pathname === '/exercise'}>
              Add Exercise
            </Nav.Link>
            <Nav.Link as={Link} to="/nutrition" active={location.pathname === '/nutrition'}>
              Nutrition
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/profile" active={location.pathname === '/profile'} className="me-2">
              <i className="bi bi-person-circle me-1"></i> Profile
            </Nav.Link>
            <Button variant="outline-light" onClick={logout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
