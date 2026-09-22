import React, { createContext, useContext, useState, useEffect } from "react";

interface AccountContextType {
  isAccountOpen: boolean;
  openAccount: () => void;
  closeAccount: () => void;
  setIsAccountOpen: (open: boolean) => void;
  
  isLoggedIn: boolean;
  profileName: string;
  profileEmoji: string;
  profileEmail: string;
  profilePhone: string;
  
  loginWithPhone: (phone: string) => boolean;
  saveProfile: (name: string, emoji: string, email: string, phone: string) => void;
  logout: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmoji, setProfileEmoji] = useState("🌸");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const [profiles, setProfiles] = useState<any[]>([]);

  // Load database and active session on mount safely
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem("hapyezta-profiles");
      if (storedProfiles) {
        setProfiles(JSON.parse(storedProfiles));
      } else {
        // Initial default mock profile
        const mockProfiles = [
          { name: "Alwin Jose George", emoji: "🌸", email: "alwinjosegeorge2028@cs.sjcetpalai.ac.in", phone: "8281251299" }
        ];
        setProfiles(mockProfiles);
        localStorage.setItem("hapyezta-profiles", JSON.stringify(mockProfiles));
      }

      const activeSession = localStorage.getItem("hapyezta-active-session");
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        setProfileName(parsed.name || "");
        setProfileEmoji(parsed.emoji || "🌸");
        setProfileEmail(parsed.email || "");
        setProfilePhone(parsed.phone || "");
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Failed to initialize account profiles:", error);
    }
  }, []);

  const openAccount = () => setIsAccountOpen(true);
  const closeAccount = () => setIsAccountOpen(false);

  const loginWithPhone = (phoneNum: string): boolean => {
    const cleanPhone = phoneNum.replace(/\D/g, "");
    if (!cleanPhone) return false;
    
    // Also update dynamic memory state from localStorage to ensure latest checkout profiles are readable
    let latestProfiles = profiles;
    try {
      const stored = localStorage.getItem("hapyezta-profiles");
      if (stored) latestProfiles = JSON.parse(stored);
    } catch (e) {}

    const matched = latestProfiles.find((p) => p.phone.replace(/\D/g, "") === cleanPhone);
    if (matched) {
      setProfileName(matched.name);
      setProfileEmoji(matched.emoji || "🌸");
      setProfileEmail(matched.email);
      setProfilePhone(matched.phone);
      setIsLoggedIn(true);
      
      localStorage.setItem("hapyezta-active-session", JSON.stringify(matched));
      return true;
    }
    return false;
  };

  const saveProfile = (name: string, emoji: string, email: string, phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) return;

    const activeProfile = { name, emoji, email, phone };
    
    // Update active profile state
    setProfileName(name);
    setProfileEmoji(emoji);
    setProfileEmail(email);
    setProfilePhone(phone);
    setIsLoggedIn(true);

    localStorage.setItem("hapyezta-active-session", JSON.stringify(activeProfile));

    // Update database profiles list
    try {
      const stored = localStorage.getItem("hapyezta-profiles");
      const list = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex((p: any) => p.phone.replace(/\D/g, "") === cleanPhone);
      if (idx !== -1) {
        list[idx] = activeProfile;
      } else {
        list.push(activeProfile);
      }
      localStorage.setItem("hapyezta-profiles", JSON.stringify(list));
      setProfiles(list);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setProfileName("");
    setProfileEmoji("🌸");
    setProfileEmail("");
    setProfilePhone("");
    setIsLoggedIn(false);
    localStorage.removeItem("hapyezta-active-session");
  };

  return (
    <AccountContext.Provider
      value={{
        isAccountOpen,
        openAccount,
        closeAccount,
        setIsAccountOpen,
        isLoggedIn,
        profileName,
        profileEmoji,
        profileEmail,
        profilePhone,
        loginWithPhone,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    if (typeof window === "undefined") {
      return {
        isAccountOpen: false,
        openAccount: () => {},
        closeAccount: () => {},
        setIsAccountOpen: () => {},
        isLoggedIn: false,
        profileName: "",
        profileEmoji: "🌸",
        profileEmail: "",
        profilePhone: "",
        loginWithPhone: () => false,
        saveProfile: () => {},
        logout: () => {},
      };
    }
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};
