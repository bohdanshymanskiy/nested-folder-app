import { QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp } from "antd";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { FilesPage } from "@/pages/FilesPage";
import { ProtectedRoute } from "@/routes";
import { queryClient } from "@/api/query-client";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <FilesPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </QueryClientProvider>
  );
}
