import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/language-context";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Languages className="w-4 h-4" />
      <span className="font-semibold">
        {language === 'fr' ? 'العربية' : 'Français'}
      </span>
    </Button>
  );
}