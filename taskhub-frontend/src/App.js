import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("login");

  if (token) return <Dashboard />;

  return page === "login" ? (
    <LoginPage setToken={setToken} switchPage={() => setPage("register")} />
  ) : (
    <RegisterPage setToken={setToken} switchPage={() => setPage("login")} />
  );
}

export default App;
