export default function authHeader() {
  const accessToken = localStorage.getItem("access_token");
  
  if (accessToken) {
    return { Authorization: `Bearer ${localStorage.getItem("access_token")}` };
  } else {
    return {};
  }
}
