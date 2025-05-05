import React from "react";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <h1>Community Toolkit</h1>
      <ul>
        <li>
          <a href="#events">Events</a>
        </li>
        <li>
          <a href="#feedback">Feedback</a>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
