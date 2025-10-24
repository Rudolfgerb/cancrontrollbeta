import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  User,
  Users,
  Volume2,
  VolumeX,
  Gift,
  Copy,
  Check,
  UserPlus,
  DollarSign,
  Star,
  Crown,
  Zap,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useHaptics } from '@/lib/haptics';

interface ReferralReward {
  type: 'friend_joins' | 'friend_paints' | 'friend_levels';
  description: string;
  cashReward: number;
  fameReward: number;
  icon: React.ReactNode;
}

const REFERRAL_REWARDS: ReferralReward[] = [
  {
    type: 'friend_joins',
    description: 'Freund registriert sich',
    cashReward: 500,
    fameReward: 50,
    icon: <UserPlus className="w-5 h-5 text-neon-cyan" />,
  },
  {
    type: 'friend_paints',
    description: 'Freund malt sein erstes Piece',
    cashReward: 200,
    fameReward: 20,
    icon: <Star className="w-5 h-5 text-neon-orange" />,
  },
  {
    type: 'friend_levels',
    description: 'Freund erreicht Level 5',
    cashReward: 1000,
    fameReward: 100,
    icon: <Crown className="w-5 h-5 text-primary" />,
  },
];

const Settings: React.FC = () => {
  const [writerName, setWriterName] = useState('UnknownWriter');
  const [email, setEmail] = useState('user@example.com');
  const [crewName, setCrewName] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [referralCode, setReferralCode] = useState('GRAFFITI-' + Math.random().toString(36).substring(7).toUpperCase());
  const [copiedCode, setCopiedCode] = useState(false);
  const [referredFriends, setReferredFriends] = useState(3);
  const [totalEarnedCash, setTotalEarnedCash] = useState(1700);
  const [totalEarnedFame, setTotalEarnedFame] = useState(170);

  const { light, success, setEnabled } = useHaptics();

  const handleSaveProfile = () => {
    light();
    // TODO: Save to backend
    toast.success('Profil gespeichert!');
  };

  const handleSaveGameSettings = () => {
    light();
    setEnabled(hapticsEnabled);
    // TODO: Save to backend
    toast.success('Spieleinstellungen gespeichert!');
  };

  const handleCreateCrew = () => {
    light();
    if (!crewName.trim()) {
      toast.error('Bitte gib einen Crew-Namen ein');
      return;
    }
    // TODO: Create crew in backend
    toast.success(`Crew "${crewName}" erstellt!`);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(`https://cancontroll.com/ref/${referralCode}`);
    setCopiedCode(true);
    success();
    toast.success('Einladungslink kopiert!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Debug/Admin Functions
  const handleClearPrison = () => {
    localStorage.removeItem('prisonUntil');
    success();
    toast.success('🔓 Aus dem Gefängnis befreit!', {
      description: 'Du kannst jetzt wieder malen.',
    });
  };

  const handleClearWork = () => {
    localStorage.removeItem('workStartTime');
    localStorage.removeItem('workEndTime');
    success();
    toast.success('⚡ Arbeit beendet!', {
      description: 'Du kannst jetzt wieder malen.',
    });
  };

  const handleResetToolbarPulse = () => {
    localStorage.removeItem('toolbarOpened');
    success();
    toast.success('♻️ Toolbar-Animation zurückgesetzt!');
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-primary to-primary/50 rounded-lg shadow-neon">
          <SettingsIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-lime">
            Einstellungen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verwalte dein Profil, Spiel-Einstellungen und Crew
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 h-auto p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="game" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Spiel</span>
          </TabsTrigger>
          <TabsTrigger value="crew" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Crew</span>
          </TabsTrigger>
          <TabsTrigger value="referral" className="gap-2">
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">Einladen</span>
          </TabsTrigger>
          <TabsTrigger value="debug" className="gap-2 bg-destructive/10">
            <Zap className="w-4 h-4 text-destructive" />
            <span className="hidden sm:inline text-destructive">Debug</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black uppercase">Profil-Einstellungen</h2>
            </div>

            <div className="space-y-6">
              {/* Writer Name */}
              <div className="space-y-2">
                <Label htmlFor="writerName" className="text-sm font-bold uppercase">
                  Writer Name (Dein Tag)
                </Label>
                <Input
                  id="writerName"
                  value={writerName}
                  onChange={(e) => setWriterName(e.target.value)}
                  placeholder="z.B. BANSKY, TAKI183"
                  className="font-mono text-lg"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Dein einzigartiger Name in der Graffiti-Szene (max. 15 Zeichen)
                </p>
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold uppercase">
                  E-Mail Adresse
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.com"
                />
              </div>

              <Separator />

              {/* Avatar/Style */}
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase">Graffiti Style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {['Wildstyle', 'Bubble', 'Throwie', 'Tag', 'Piece'].map((style) => (
                    <Button
                      key={style}
                      variant="outline"
                      className="min-h-[60px] h-auto py-3 flex flex-col gap-2"
                    >
                      <span className="text-2xl">🎨</span>
                      <span className="text-xs font-bold">{style}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="gap-2">
                  <Check className="w-4 h-4" />
                  Profil speichern
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Game Settings */}
        <TabsContent value="game" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-neon-cyan" />
              <h2 className="text-2xl font-black uppercase">Spiel-Einstellungen</h2>
            </div>

            <div className="space-y-6">
              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-bold uppercase flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    Sound Effekte
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Spiele Soundeffekte für Aktionen ab
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <Separator />

              {/* Haptics */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-bold uppercase">Haptisches Feedback</Label>
                  <p className="text-xs text-muted-foreground">
                    Vibrationen für Berührungen (nur Mobile)
                  </p>
                </div>
                <Switch
                  checked={hapticsEnabled}
                  onCheckedChange={setHapticsEnabled}
                />
              </div>

              <Separator />

              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase">Schwierigkeitsgrad</Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['Easy', 'Medium', 'Hard', 'Extreme'].map((diff, idx) => (
                    <Button
                      key={diff}
                      variant={idx === 1 ? 'default' : 'outline'}
                      className="min-h-[48px] h-auto py-3"
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Language */}
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase">Sprache</Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['🇩🇪 Deutsch', '🇬🇧 English', '🇪🇸 Español', '🇫🇷 Français'].map((lang) => (
                    <Button
                      key={lang}
                      variant={lang.includes('Deutsch') ? 'default' : 'outline'}
                      className="min-h-[48px] h-auto py-3"
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGameSettings} className="gap-2">
                  <Check className="w-4 h-4" />
                  Einstellungen speichern
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Crew Management */}
        <TabsContent value="crew" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-neon-lime" />
              <h2 className="text-2xl font-black uppercase">Crew Verwaltung</h2>
            </div>

            <div className="space-y-6">
              {/* Create or Join Crew */}
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase">Crew Name</Label>
                <div className="flex gap-3">
                  <Input
                    value={crewName}
                    onChange={(e) => setCrewName(e.target.value)}
                    placeholder="z.B. Urban Legends, Street Kings..."
                    className="flex-1"
                  />
                  <Button onClick={handleCreateCrew} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Erstellen
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Erstelle deine eigene Crew oder trete einer existierenden bei
                </p>
              </div>

              <Separator />

              {/* Crew Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 min-h-[80px] bg-primary/10 border-primary">
                  <div className="text-sm text-muted-foreground mb-1">Mitglieder</div>
                  <div className="text-3xl font-black text-primary">12</div>
                </Card>
                <Card className="p-4 min-h-[80px] bg-neon-cyan/10 border-neon-cyan">
                  <div className="text-sm text-muted-foreground mb-1">Pieces</div>
                  <div className="text-3xl font-black text-neon-cyan">847</div>
                </Card>
                <Card className="p-4 min-h-[80px] bg-neon-orange/10 border-neon-orange">
                  <div className="text-sm text-muted-foreground mb-1">Fame</div>
                  <div className="text-3xl font-black text-neon-orange">12,543</div>
                </Card>
              </div>

              <Separator />

              {/* Crew Members */}
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase">Crew Mitglieder</Label>
                <div className="space-y-2">
                  {[
                    { name: 'BANSKY', role: 'Leader', level: 25, pieces: 234 },
                    { name: 'TAKI183', role: 'Member', level: 18, pieces: 156 },
                    { name: 'CORNBREAD', role: 'Member', level: 22, pieces: 198 },
                  ].map((member) => (
                    <Card key={member.name} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-neon-cyan rounded-full flex items-center justify-center">
                            <span className="text-lg font-black">{member.name[0]}</span>
                          </div>
                          <div>
                            <div className="font-black">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Level</div>
                            <div className="font-bold">{member.level}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Pieces</div>
                            <div className="font-bold">{member.pieces}</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Referral System */}
        <TabsContent value="referral" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-neon-orange" />
              <h2 className="text-2xl font-black uppercase">Freunde einladen</h2>
            </div>

            <div className="space-y-6">
              {/* Referral Code */}
              <div className="bg-gradient-to-r from-primary/10 via-neon-cyan/10 to-neon-lime/10 p-6 rounded-lg border-2 border-primary/30">
                <Label className="text-sm font-bold uppercase mb-3 block">Dein Einladungs-Link</Label>
                <div className="flex gap-3">
                  <Input
                    value={`https://cancontroll.com/ref/${referralCode}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopyReferralCode} className="gap-2 min-w-[120px]">
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Kopieren
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Teile diesen Link mit Freunden und verdiene Belohnungen!
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 min-h-[100px] bg-neon-cyan/10 border-neon-cyan">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-5 h-5 text-neon-cyan" />
                    <div className="text-sm text-muted-foreground">Eingeladene Freunde</div>
                  </div>
                  <div className="text-3xl font-black text-neon-cyan">{referredFriends}</div>
                </Card>
                <Card className="p-4 min-h-[100px] bg-neon-lime/10 border-neon-lime">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-neon-lime" />
                    <div className="text-sm text-muted-foreground">Verdientes Cash</div>
                  </div>
                  <div className="text-3xl font-black text-neon-lime">${totalEarnedCash}</div>
                </Card>
                <Card className="p-4 min-h-[100px] bg-neon-orange/10 border-neon-orange">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-neon-orange" />
                    <div className="text-sm text-muted-foreground">Verdiente Fame</div>
                  </div>
                  <div className="text-3xl font-black text-neon-orange">{totalEarnedFame}</div>
                </Card>
              </div>

              <Separator />

              {/* Rewards */}
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase">Belohnungen pro Freund</Label>
                <div className="space-y-2">
                  {REFERRAL_REWARDS.map((reward) => (
                    <Card key={reward.type} className="p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {reward.icon}
                          <div>
                            <div className="font-bold">{reward.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Automatisch gutgeschrieben
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Badge className="bg-neon-lime/20 text-neon-lime border-neon-lime">
                            +${reward.cashReward}
                          </Badge>
                          <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange">
                            +{reward.fameReward} Fame
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Referred Friends List */}
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase">Deine eingeladenen Freunde</Label>
                <div className="space-y-2">
                  {[
                    { name: 'User123', joined: '2 Tage', status: 'Level 3', earned: 700 },
                    { name: 'GraffitiKing', joined: '1 Woche', status: 'Level 8', earned: 1700 },
                    { name: 'StreetArtist', joined: '3 Tage', status: 'Level 2', earned: 500 },
                  ].map((friend) => (
                    <Card key={friend.name} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">{friend.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Beigetreten vor {friend.joined} • {friend.status}
                          </div>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary">
                          +${friend.earned} verdient
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Debug/Admin Tab */}
        <TabsContent value="debug" className="space-y-6">
          <Card className="p-6 border-2 border-destructive/50 bg-destructive/5">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-destructive" />
                  Debug / Admin Tools
                </h2>
                <p className="text-sm text-muted-foreground">
                  ⚠️ Diese Tools sind nur für Entwicklung und Testing. Vorsichtig verwenden!
                </p>
              </div>

              <Separator />

              {/* Clear Prison */}
              <div className="space-y-3">
                <Label className="text-base font-bold uppercase">Gefängnis</Label>
                <Card className="p-4 bg-red-950/20 border-red-500/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-lg">Aus Gefängnis befreien</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Entfernt die Gefängnisstrafe und ermöglicht sofort wieder zu malen.
                      </p>
                    </div>
                    <Button
                      onClick={handleClearPrison}
                      variant="destructive"
                      className="gap-2 min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                      Befreien
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Clear Work */}
              <div className="space-y-3">
                <Label className="text-base font-bold uppercase">Arbeit</Label>
                <Card className="p-4 bg-orange-950/20 border-orange-500/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-lg">Arbeit beenden</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Beendet die laufende Arbeit sofort (ohne Geld zu verdienen).
                      </p>
                    </div>
                    <Button
                      onClick={handleClearWork}
                      variant="destructive"
                      className="gap-2 min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                      Beenden
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Reset Toolbar Pulse */}
              <div className="space-y-3">
                <Label className="text-base font-bold uppercase">UI Reset</Label>
                <Card className="p-4 bg-blue-950/20 border-blue-500/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-lg">Toolbar-Animation zurücksetzen</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Setzt die pulsierende Animation des Toolbar-Buttons zurück.
                      </p>
                    </div>
                    <Button
                      onClick={handleResetToolbarPulse}
                      variant="outline"
                      className="gap-2 min-h-[44px]"
                    >
                      <Zap className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </Card>
              </div>

              <Separator />

              {/* Info */}
              <div className="bg-yellow-950/20 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-sm text-yellow-200">
                  💡 <strong>Hinweis:</strong> Diese Tools bearbeiten nur den lokalen Browser-Speicher (localStorage).
                  Bei Backend-Integration müssen die Daten auch auf dem Server aktualisiert werden.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
