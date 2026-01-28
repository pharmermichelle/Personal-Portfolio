import { BrowserRouter, Routes, Route } from "react-router-dom";
import Arcade from "./pages/Arcade";
// ...your other imports

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/arcade" element={<Arcade />} />
    </Routes>
  </BrowserRouter>
);
