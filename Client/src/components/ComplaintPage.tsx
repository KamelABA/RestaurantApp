import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Send, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplaintPageProps {
  onBack: () => void;
  tableNumber: number;
}

const ComplaintPage = ({ onBack, tableNumber }: ComplaintPageProps) => {
  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const currentDateTime = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre réclamation",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Réclamation envoyée",
        description: "Votre réclamation a été transmise à notre équipe. Nous vous répondrons rapidement.",
      });
      setComplaint("");
      setIsSubmitting(false);
      onBack();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-restaurant-cream to-background">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Faire une Réclamation</h1>
            <p className="text-primary-foreground/80">Nous sommes à votre écoute</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Formulaire de Réclamation
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Table N°</p>
                  <p className="text-lg font-bold text-primary">{tableNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date & Heure</p>
                  <p className="text-sm text-muted-foreground">{currentDateTime}</p>
                </div>
              </div>
            </div>

            {/* Complaint Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Détails de votre réclamation <span className="text-destructive">*</span>
              </label>
              <Textarea 
                placeholder="Décrivez votre problème ou suggestion en détail. Notre équipe examinera votre demande dans les plus brefs délais..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 caractères • {complaint.length}/500
              </p>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Information:</strong> Votre réclamation sera automatiquement associée à votre table et à l'heure actuelle. 
                Un membre de notre équipe vous contactera rapidement pour résoudre votre problème.
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || complaint.trim().length < 10}
              className="w-full bg-gradient-to-r from-primary to-restaurant-warm hover:from-primary/90 hover:to-restaurant-warm/90 text-white font-medium h-12"
            >
              {isSubmitting ? (
                "Envoi en cours..."
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer la réclamation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintPage;