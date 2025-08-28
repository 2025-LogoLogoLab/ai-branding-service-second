// src/pages/NotFound.tsx
import { useEffect } from "react";
import {Link, useLocation} from "react-router-dom";
function NotFound() {
  const pathname = useLocation();

  useEffect(()=>{
    console.log("pathname in app: ", pathname);

  },[]);

  
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link to={'/'}>
        Go back Home
      </Link>
    </div>
  ) 
}

export default NotFound
