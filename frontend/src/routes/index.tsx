import type { ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { appStore } from "@/stores/appStore";

export const ProtectedRoute = observer(function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  if (!appStore.token) return <Navigate to="/login" replace />;
  return <>{children}</>;
});
