import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken) {
          // Supabase will automatically handle the session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error getting session:', error);
            toast.error('Fehler bei der Authentifizierung');
            navigate('/auth/login');
            return;
          }

          if (session) {
            if (type === 'recovery') {
              // Password reset flow
              toast.success('Bitte setze dein neues Passwort');
              navigate('/auth/reset-password');
            } else {
              // Email verification or login
              toast.success('Email erfolgreich bestätigt!');
              navigate('/game');
            }
          } else {
            navigate('/auth/login');
          }
        } else {
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Ein Fehler ist aufgetreten');
        navigate('/auth/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Authentifizierung läuft...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
