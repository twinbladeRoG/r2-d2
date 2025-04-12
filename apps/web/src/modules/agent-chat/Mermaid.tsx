import React, { useEffect } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  children?: React.ReactNode;
}

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  themeCSS: ``,
  fontFamily: "Fira Code"
});

const Mermaid: React.FC<MermaidProps> = ({ children }) => {
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);
  return <div className="mermaid">{children}</div>;
};

export default Mermaid;
