// src/pages/MyPage.tsx
import { useNavigate } from "react-router-dom";

function MyPage() {
  const navigate = useNavigate();
  return (
    <div>
      <h1> My Page</h1>
      <p onClick={() => navigate('/myPage/userInfo')}> User Info </p>
      <p onClick={() => navigate('/myProducts')}> My Products </p>
      <p onClick={() => navigate('/myProject')}> My Project </p>
    </div>

  );
}

export default MyPage
