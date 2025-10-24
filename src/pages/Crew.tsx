import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Star, TrendingUp, Plus, Search, Shield, Trophy, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface CrewMember {
  id: string;
  username: string;
  reputation: number;
  totalPieces: number;
  rank: 'Member' | 'Elite' | 'Legend';
  joinedDate: string;
}

interface Crew {
  id: string;
  name: string;
  tag: string;
  members: CrewMember[];
  totalFame: number;
  totalSpots: number;
  rank: number;
  founded: string;
  description: string;
}

const Crew: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewTag, setCrewTag] = useState('');
  const [crewDescription, setCrewDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - würde später von Backend kommen
  const [playerCrew, setPlayerCrew] = useState<Crew | null>({
    id: '1',
    name: 'Urban Legends',
    tag: 'UL',
    totalFame: 12500,
    totalSpots: 89,
    rank: 3,
    founded: '2025-01-15',
    description: 'Die besten Writer der Stadt. Qualität über Quantität!',
    members: [
      { id: '1', username: 'SprayMaster', reputation: 5000, totalPieces: 45, rank: 'Legend', joinedDate: '2025-01-15' },
      { id: '2', username: 'CanKing', reputation: 4200, totalPieces: 38, rank: 'Elite', joinedDate: '2025-01-20' },
      { id: '3', username: 'StyleWriter', reputation: 3300, totalPieces: 32, rank: 'Member', joinedDate: '2025-02-01' },
    ]
  });

  const topCrews: Crew[] = [
    { id: '1', name: 'Urban Legends', tag: 'UL', members: [], totalFame: 12500, totalSpots: 89, rank: 1, founded: '2025-01-15', description: '' },
    { id: '2', name: 'Street Kings', tag: 'SK', members: [], totalFame: 11200, totalSpots: 76, rank: 2, founded: '2025-01-10', description: '' },
    { id: '3', name: 'Paint Warriors', tag: 'PW', members: [], totalFame: 9800, totalSpots: 65, rank: 3, founded: '2025-01-25', description: '' },
    { id: '4', name: 'Neon Crew', tag: 'NC', members: [], totalFame: 8500, totalSpots: 58, rank: 4, founded: '2025-02-01', description: '' },
    { id: '5', name: 'Style Masters', tag: 'SM', members: [], totalFame: 7300, totalSpots: 52, rank: 5, founded: '2025-02-05', description: '' },
  ];

  const handleCreateCrew = () => {
    if (!crewName || !crewTag || !crewDescription) {
      toast.error('Bitte fülle alle Felder aus!');
      return;
    }

    if (crewTag.length > 4) {
      toast.error('Crew-Tag darf maximal 4 Zeichen haben!');
      return;
    }

    // Hier würde API-Call kommen
    toast.success(`Crew "${crewName}" [${crewTag}] erfolgreich gegründet!`);
    setShowCreateDialog(false);
    setCrewName('');
    setCrewTag('');
    setCrewDescription('');
  };

  const handleJoinCrew = (crewId: string) => {
    toast.success('Beitrittsanfrage gesendet!');
    setShowJoinDialog(false);
  };

  const handleLeaveCrew = () => {
    if (window.confirm('Bist du sicher, dass du die Crew verlassen möchtest?')) {
      setPlayerCrew(null);
      toast.success('Du hast die Crew verlassen.');
    }
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Legend': return 'bg-primary/20 text-primary border-primary';
      case 'Elite': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan';
      case 'Member': return 'bg-neon-lime/20 text-neon-lime border-neon-lime';
      default: return 'bg-muted/20 text-muted-foreground border-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
              <Users className="w-10 h-10 text-primary" />
              Crew System
            </h1>
            <p className="text-muted-foreground mt-2">
              Gründe deine Crew oder tritt einer bei - gemeinsam zur Legende
            </p>
          </div>
          {!playerCrew && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
                <Search className="w-4 h-4 mr-2" />
                Crew beitreten
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crew gründen
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue={playerCrew ? "mycrew" : "leaderboard"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {playerCrew && <TabsTrigger value="mycrew">Meine Crew</TabsTrigger>}
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Meine Crew Tab */}
          {playerCrew && (
            <TabsContent value="mycrew" className="space-y-6">
              {/* Crew Info Card */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-primary/20 rounded-lg flex items-center justify-center border-2 border-primary">
                      <span className="text-3xl font-black text-primary">{playerCrew.tag}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black">{playerCrew.name}</h2>
                      <p className="text-muted-foreground mt-1">{playerCrew.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange">
                          <Trophy className="w-3 h-3 mr-1" />
                          Rang #{playerCrew.rank}
                        </Badge>
                        <Badge className="bg-neon-lime/20 text-neon-lime border-neon-lime">
                          <Users className="w-3 h-3 mr-1" />
                          {playerCrew.members.length} Members
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleLeaveCrew}>
                    Crew verlassen
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="p-4 min-h-[100px] bg-neon-orange/10 border-neon-orange">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-neon-orange" />
                      <span className="text-sm text-muted-foreground">Total Fame</span>
                    </div>
                    <div className="text-3xl font-black text-neon-orange">{playerCrew.totalFame.toLocaleString()}</div>
                  </Card>
                  <Card className="p-4 min-h-[100px] bg-neon-cyan/10 border-neon-cyan">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-neon-cyan" />
                      <span className="text-sm text-muted-foreground">Spots Bemalt</span>
                    </div>
                    <div className="text-3xl font-black text-neon-cyan">{playerCrew.totalSpots}</div>
                  </Card>
                  <Card className="p-4 min-h-[100px] bg-primary/10 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Gegründet</span>
                    </div>
                    <div className="text-lg font-black text-primary">
                      {new Date(playerCrew.founded).toLocaleDateString('de-DE')}
                    </div>
                  </Card>
                </div>
              </Card>

              {/* Members List */}
              <Card className="p-6">
                <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Crew Members
                </h3>
                <div className="space-y-3">
                  {playerCrew.members.map((member, index) => (
                    <Card key={member.id} className="p-4 min-h-[80px] bg-card/50 backdrop-blur hover:bg-card/70 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-black text-muted-foreground">#{index + 1}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{member.username}</span>
                              {index === 0 && <Crown className="w-5 h-5 text-neon-orange" />}
                              <Badge className={getRankBadgeColor(member.rank)}>
                                {member.rank}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Beigetreten: {new Date(member.joinedDate).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div className="text-sm text-muted-foreground">Reputation</div>
                            <div className="text-xl font-black text-neon-orange">{member.reputation.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Pieces</div>
                            <div className="text-xl font-black text-neon-cyan">{member.totalPieces}</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>
          )}

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-neon-orange" />
                Top Crews
              </h3>
              <div className="space-y-3">
                {topCrews.map((crew) => (
                  <Card key={crew.id} className="p-4 min-h-[80px] bg-card/50 backdrop-blur hover:bg-card/70 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-3xl font-black ${
                          crew.rank === 1 ? 'text-neon-orange' :
                          crew.rank === 2 ? 'text-neon-cyan' :
                          crew.rank === 3 ? 'text-neon-lime' :
                          'text-muted-foreground'
                        }`}>
                          #{crew.rank}
                        </div>
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center border-2 border-primary">
                          <span className="text-lg font-black text-primary">{crew.tag}</span>
                        </div>
                        <div>
                          <div className="font-bold text-xl">{crew.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Gegründet: {new Date(crew.founded).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Fame</div>
                          <div className="text-xl font-black text-neon-orange">{crew.totalFame.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Spots</div>
                          <div className="text-xl font-black text-neon-cyan">{crew.totalSpots}</div>
                        </div>
                        {!playerCrew && (
                          <Button size="sm" onClick={() => handleJoinCrew(crew.id)}>
                            Beitreten
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Crew Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-full sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase">Crew Gründen</DialogTitle>
            <DialogDescription>
              Erstelle deine eigene Crew und werde zur Legende der Streets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4 sm:p-6">
            <div>
              <Label htmlFor="crewName">Crew Name</Label>
              <Input
                id="crewName"
                placeholder="z.B. Urban Legends"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                maxLength={30}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="crewTag">Crew Tag (max. 4 Zeichen)</Label>
              <Input
                id="crewTag"
                placeholder="z.B. UL"
                value={crewTag}
                onChange={(e) => setCrewTag(e.target.value.toUpperCase())}
                maxLength={4}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="crewDescription">Beschreibung</Label>
              <Input
                id="crewDescription"
                placeholder="Was macht eure Crew besonders?"
                value={crewDescription}
                onChange={(e) => setCrewDescription(e.target.value)}
                maxLength={100}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto min-h-[48px]" onClick={() => setShowCreateDialog(false)}>
              Abbrechen
            </Button>
            <Button className="w-full sm:w-auto min-h-[48px]" onClick={handleCreateCrew}>
              Crew gründen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Crew Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="max-w-full sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase">Crew Beitreten</DialogTitle>
            <DialogDescription>
              Suche nach einer Crew und tritt ihr bei
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4 sm:p-6">
            <div>
              <Label htmlFor="search">Crew suchen</Label>
              <Input
                id="search"
                placeholder="Nach Name oder Tag suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {topCrews.filter(crew =>
                crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                crew.tag.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((crew) => (
                <Card key={crew.id} className="p-3 min-h-[60px] cursor-pointer hover:bg-accent" onClick={() => handleJoinCrew(crew.id)}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="font-black text-primary">{crew.tag}</span>
                      </div>
                      <div>
                        <div className="font-bold">{crew.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Fame: {crew.totalFame.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="w-full sm:w-auto min-h-[44px]">Beitreten</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Crew;
