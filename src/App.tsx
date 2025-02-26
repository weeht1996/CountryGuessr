import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import ChallengePage from "./pages/ChallengePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PracticePage from "./pages/PracticePage";

function App() {
  return (
    <div className="App flex flex-col min-h-screen max-w-screen">
      <header>
        <Header />
      </header>
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<ChallengePage />} />
          <Route path="/practice" element={<PracticePage />} />
          {/* 404 reroutes */}
          <Route path="*" element={<ChallengePage />} />
        </Routes>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
