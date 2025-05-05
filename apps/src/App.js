import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import EventsPage from "./pages/EventsPage";
import FeedbackPage from "./pages/FeedbackPage";
import NavBar from "./components/NavBar";
import EventList from "./components/Eventlist";
import FeedbackBoard from "./components/FeedbackBoard";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>React is working!</h1>{" "}
      {/* Add this line to test if React is rendering */}
      <Header />
      <NavBar />
      <div id="events">
        <EventList />
      </div>
      <div id="feedback">
        <FeedbackBoard />
      </div>
      <Routes>
        <Route path="/" element={<EventsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
