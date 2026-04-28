"use client";

import React, { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    // Add Google Translate Script
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Initialize function
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Google Translate uses a specific cookie format: /en/hi
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/`;
    
    // Reload to apply translation
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }}></div>
      <div className="fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden"
            >
              <div className="p-3 bg-slate-900">
                <p className="text-xs font-bold text-white uppercase tracking-widest text-center">
                  Select Language
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full px-4 py-2 text-sm text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <span className="group-hover:text-primary transition-colors">{lang.name}</span>
                    {currentLang === lang.code && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-primary hover:scale-110 transition-all cursor-pointer"
        >
          <Globe className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
