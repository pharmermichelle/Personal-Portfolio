import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <h1>Community Hub</h1>
      <nav>
        <Link to="/">Events</Link> | <Link to="/feedback">Feedback</Link>
      </nav>
    </header>
  );
}

export default Header;
