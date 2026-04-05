import React from "react";

const TitanFooter: React.FC = () => (
  <footer className="border-t border-border py-8 px-4">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>© WIINUP MAX 2026 — VLM Consulting</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-foreground transition-colors">CGV</a>
        <a href="#" className="hover:text-foreground transition-colors">Politique de confidentialité</a>
        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

export default TitanFooter;
