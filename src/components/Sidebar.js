import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import {
  AlignLeft,
  Map,
  Activity,
  Shield,
  AlertTriangle,
  BookOpen,
  BarChart2,
  CircleUserRound,
  BrainCircuit,
  Boxes,
} from "lucide-react";
import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Sidebar.css";
import RobofyChat from "../chatbot";
// Import the ReportForm component
import ReportForm from "./Reportform";
function SidebarComponent() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [language, setLanguage] = useState("en");

  const languages = [
    { code: "en", label: "English" },
    { code: "ta", label: "Tamil" },
  ];

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!document.querySelector("#google-translate-script")) {
        const script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.id = "google-translate-script";
        script.async = true;
        script.onload = () => {
          if (window.googleTranslateElementInit) {
            window.googleTranslateElementInit();
          }
        };
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "en,ta" },
        "google_translate_element"
      );
    };

    addGoogleTranslateScript();
  }, []);

  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    const selectElement = document.querySelector(".goog-te-combo");
    if (selectElement) {
      selectElement.value = selectedLanguage;
      selectElement.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div className="sidebar-container">
      <button className="toggle-button" onClick={() => setCollapsed(!collapsed)}>
        <AlignLeft size={24} />
      </button>

      <Sidebar className="app-sidebar" collapsed={collapsed}>
        <Menu>
          <MenuItem icon={<Map size={20} />} component={<Link to="/hotspot" />} active={currentPath === "/hotspot"}>
            Hotspot Mapping
          </MenuItem>
          <MenuItem icon={<Shield size={20} />} component={<Link to="/patrol" />} active={currentPath === "/patrol"}>
            Patrol Planning
          </MenuItem>
          <MenuItem icon={<AlertTriangle size={20} />} component={<Link to="/accident" />} active={currentPath === "/accident"}>
            Accident-prone Area Identification
          </MenuItem>
          <MenuItem icon={<Activity size={20} />} component={<Link to="/behaviour" />} active={currentPath === "/behaviour"}>
            Seasonal Crime Analysis
          </MenuItem>
          <MenuItem icon={<BrainCircuit size={20} />} component={<Link to="/trends" />} active={currentPath === "/trends"}>
            Future Crime Trends
          </MenuItem>
          <MenuItem icon={<BookOpen size={20} />} component={<Link to="/legall" />} active={currentPath === "/legall"}>
            Legal Classification
          </MenuItem>
          <MenuItem icon={<BarChart2 size={20} />} component={<Link to="/report" />} active={currentPath === "/report"}>
            Report & Insights
          </MenuItem>
          <MenuItem icon={<Boxes size={20} />} component={<Link to="/resource" />} active={currentPath === "/resource"}>
            Resource allocation
          </MenuItem>
        </Menu>

        {/* Language Dropdown */}
        <div className="language-selector">
          <Dropdown>
            <Dropdown.Toggle id="languageDropdown">
              🌍 {languages.find((lang) => lang.code === language)?.label || "Language"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {languages.map((lang) => (
                <Dropdown.Item key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
                  {lang.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Sidebar>

      {/* Add ReportForm below the sidebar */}
      <ReportForm />

      {/* Debugging: Check if RobofyChat is rendering */}
      {RobofyChat ? <RobofyChat style={{ color: "red" }} /> : <p>Chatbot failed to load</p>}

      <div id="google_translate_element"></div>
    </div>
  );
}

export default SidebarComponent;
