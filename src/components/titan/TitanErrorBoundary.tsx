import React from "react";
import TitanButton from "./TitanButton";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class TitanErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("TitanErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Oups, une erreur est survenue</h1>
            <p className="text-muted-foreground mb-6">
              Une erreur inattendue s'est produite. Veuillez réessayer.
            </p>
            <TitanButton onClick={() => (window.location.href = "/dashboard")}>
              Retour au dashboard
            </TitanButton>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default TitanErrorBoundary;
