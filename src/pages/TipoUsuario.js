import React from "react";
import { Link } from "react-router-dom";
import { Page, Row } from "../components/ui";

export default function TipoUsuario(){
  return (
    <Page title="¿Eres usuario sordo o intérprete?">
      <Row>
        <Link className="btn" to="/registro-usuario">Usuario Sordo</Link>
        <Link className="btn secondary" to="/registro-interprete">Intérprete</Link>
      </Row>
    </Page>
  );
}
