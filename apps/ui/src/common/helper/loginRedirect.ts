const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const loginWithGoogle = () => {
  window.location.href = `${BACKEND_URL}/auth/google`;
};

export const loginWithFacebook = () => {
  window.location.href = `${BACKEND_URL}/auth/facebook`;
};
