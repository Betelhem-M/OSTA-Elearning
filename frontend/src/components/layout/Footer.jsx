import { useLocation } from "react-router-dom";
import CertificateShowcase from "@components/public/CertificateShowcase";

export default function Footer() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/" && <CertificateShowcase />}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Oromia Science and Technology Authority · All rights reserved</p>
      </footer>
    </>
  );
}
