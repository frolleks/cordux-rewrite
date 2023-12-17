import type { RouteObject } from "react-router-dom";
import App from "./App";
import SignIn from "./pages/auth/sign-in";

const authRoutes: RouteObject = {
  path: "/sign-in",
  element: <SignIn />,
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
  },
  authRoutes,
];

export default routes;
