import { useEffect } from "react";
import axios from "axios";

const RobofyChat = () => {
    useEffect(() => {
        console.log("Attempting to load Robofy script...");
        if (!document.getElementById("chatbotscript")) {
          const script = document.createElement("script");
          script.id = "chatbotscript";
          script.dataset.accountid = "6vLY6YTFxA5BIAOseXRkSg==";
          script.dataset.websiteid = "qIcqhkAaHYmLkMQuFlcJDA==";
          script.src = `https://app.robofy.ai/bot/js/common.js?v=${new Date().getTime()}`;
          script.async = true;
          script.onerror = () => console.error("Failed to load Robofy script");
          
          document.head.appendChild(script);
          console.log("Robofy script appended to head.");
        }
      
        return () => {
          const existingScript = document.getElementById("chatbotscript");
          if (existingScript) {
            document.head.removeChild(existingScript);
            console.log("Robofy script removed.");
          }
        };
      }, []);
      
  return null;
};

export default RobofyChat;
