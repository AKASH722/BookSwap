import React from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button.jsx";

function Home() {
  const { logout } = useAuth();
  return (
    <>
      <Button onClick={logout}>Logout</Button>
    </>
  );
}

export default Home;
