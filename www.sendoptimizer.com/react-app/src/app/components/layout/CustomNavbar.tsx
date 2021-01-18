import React, { useContext } from "react";
import { Navbar, Nav } from "react-bootstrap";
import AppSettingsContext from "../_context/app-settings/AppSettingsContext";

// -------- INTERFACE -------- //
interface ICustomNavbar {}
// -------- COMPONENT -------- //
export const CustomNavbar: React.FC<ICustomNavbar> = () => {
  // -------- CONTEXT -------- //
  const acCtx = useContext(AppSettingsContext);
  const { logout } = acCtx;

  // -------- RENDER -------- //
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand>Send Optimizer</Navbar.Brand>
      {/* <Navbar.Collapse id="basic-navbar-nav"> */}
      {/* <Nav className="mr-auto"> */}
      <Nav className="ml-auto">
        {/* <Nav.Link href="/logout" onClick={ */}
        <Nav.Link as="div" onClick={logout}>
          Log Out
        </Nav.Link>
      </Nav>
      {/* </Navbar.Collapse> */}
    </Navbar>
  );
};
