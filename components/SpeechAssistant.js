"use client";
import { useEffect, useState } from "react";
import { speak, listen } from "@/lib/speech";
import { useRouter } from "next/navigation";
import { FaMicrophone } from "react-icons/fa";

export default function SpeechAssistant() {
  const [listening, setListening] = useState(false);
  const router = useRouter();

  const handleVoiceCommand = (command) => {
    speak(`You said: ${command}`);

    if (command.includes("go to dashboard")) {
      router.push("/dashboard");
    } else if (command.includes("go to user page")) {
      router.push("/user-dashboard");
    } else if (command.includes("log out")) {
      speak("Logging you out.");
      router.push("/auth/login");
    } else {
      speak("Sorry, I didn't understand that.");
    }
  };

  const startListening = () => {
    setListening(true);
    listen((command) => {
      setListening(false);
      handleVoiceCommand(command);
    });
  };

  return (
    <button
      onClick={startListening}
      className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg"
    >
      <FaMicrophone size={24} />
    </button>
  );
}
