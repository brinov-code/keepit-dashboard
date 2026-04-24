import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AdminPanel from "./pages/AdminPanel";

function Router() {
  return (
    <Switch>
      <Route path={"/404"} component={NotFound} />
      <Route
        path={"/"}
        component={() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      />
      <Route
        path={"/customers"}
        component={() => (
          <DashboardLayout>
            <Customers />
          </DashboardLayout>
        )}
      />
      <Route
        path={"/admin"}
        component={() => (
          <DashboardLayout>
            <AdminPanel />
          </DashboardLayout>
        )}
      />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
