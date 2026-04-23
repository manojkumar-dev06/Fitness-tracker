import React from "react";
import { Navbar, Nav } from "react-bootstrap";
// cant use <a> in react, instead, use <link> from react router dom
import { Link, useLocation } from "react-router-dom";
import Auth from "../utils/auth"
import heart from "../assets/images/heart.png"

export default function Header() {

  const loggedIn = Auth.loggedIn();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';


  return (

    <Navbar collapseOnSelect expand="sm" variant="dark" bg={loggedIn && !isHomePage ? "dark" : null}>
      {loggedIn ? (
        <>
          <Navbar.Brand as={Link} to="/" className="brand brand-logged d-flex align-items-center">
            <img alt="heart" style={{ display: "inline" }} src={heart} className="heart-icon" />
            FitTrack
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
            <Nav>
              {/* use eventKey to show navbar style from react bootstrap */}
              <Nav.Link as={Link} to="/dashboard" eventKey="1">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/exercise" eventKey="2">
                <i className="bi bi-plus-circle me-1"></i> Exercise
              </Nav.Link>
              <Nav.Link as={Link} to="/history" eventKey="3">
                <i className="bi bi-clock-history me-1"></i> History
              </Nav.Link>
              <Nav.Link onClick={Auth.logout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </>) :
        (<Navbar.Brand as={Link} to="/" className={`brand brand-new mx-auto d-flex align-items-center
          ${isLoginPage || isSignupPage ? "brand-text" : null}`}>
          <img alt="heart" style={{ display: "inline" }} src={heart} className="heart-icon" />
          FitTrack
        </Navbar.Brand>)}
    </Navbar >
  );
}
