import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { serviceApi } from '@/api/serviceApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const MultiplayerPage: React.FC = () => {
  const { user } = useUser();
  const [joinCode, setJoinCode] = useState('');
  const [questionLimit, setQuestionLimit] = useState<number>(10);
  
  const {
    connected,
    lobby,
    lastAnswerCorrect,
    selectedOptionId,
    connect,
    disconnect,
    leaveCurrentLobby,
    joinLobby,
    startGame,
    submitAnswer
  } = useMultiplayerStore();

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      connect(token);
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const handleCreateLobby = async () => {
    try {
      const response = await serviceApi.createMultiplayerLobby(questionLimit);
      if (response && response.lobbyId) {
        joinLobby(response.lobbyId, user?.username || 'Host');
      }
    } catch (e) {
      console.error('Failed to create lobby', e);
    }
  };

  const handleJoinLobby = () => {
    if (joinCode.trim() !== '') {
      joinLobby(joinCode.toUpperCase(), user?.username || 'Player');
    }
  };

  if (!connected) {
    return <div className="flex min-h-screen items-center justify-center text-xl font-bold animate-pulse">Connecting to Multiplayer Server...</div>;
  }

  // View: Not in a Lobby
  if (!lobby) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-extrabold tracking-tight">Multiplayer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest px-1">Questions</label>
              <Input 
                type="number"
                min={1}
                max={50}
                value={questionLimit}
                onChange={(e) => setQuestionLimit(parseInt(e.target.value) || 10)}
                className="h-14 text-center text-xl font-bold rounded-xl"
              />
            </div>
            <Button onClick={handleCreateLobby} className="w-full h-16 text-xl font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
              Create New Room
            </Button>
            
            <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted-foreground/30"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground font-semibold text-sm uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-muted-foreground/30"></div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Input 
                placeholder="ENTER JOIN CODE" 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value)} 
                className="h-14 text-center uppercase font-black tracking-[0.3em] text-xl rounded-xl"
                maxLength={6}
              />
              <Button 
                onClick={handleJoinLobby} 
                variant="secondary" 
                className="w-full h-14 font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform" 
                disabled={joinCode.length < 3}
              >
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // View: Waiting Room
  if (lobby.gameState === 'WAITING') {
    const isHost = lobby.hostId === user?.id;
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Room Code</p>
            <CardTitle className="text-5xl font-black tracking-widest">{lobby.lobbyId}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 mt-4">
            <div className="bg-secondary/40 rounded-xl p-5 flex flex-col gap-3">
              <h3 className="font-bold text-lg border-b border-border/50 pb-2">Players Joined ({lobby.players.length})</h3>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {lobby.players.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2 bg-background rounded-lg shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-lg">{p.username}</span>
                    {p.id === lobby.hostId && <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-bold">HOST</span>}
                  </div>
                ))}
              </div>
            </div>
            
            {isHost ? (
              <Button onClick={startGame} className="w-full h-16 text-xl font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg bg-green-600 hover:bg-green-700 text-white">
                Start Game
              </Button>
            ) : (
              <div className="text-center p-4 bg-muted/50 border border-border rounded-xl font-bold text-muted-foreground animate-pulse">
                Waiting for Host to start...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // View: Active Game
  if (lobby.gameState === 'ACTIVE') {
    const me = lobby.players.find(p => p.id === user?.id);
    const hasAnswered = me?.answeredCurrentQuestion;
    const question = lobby.currentQuestion;
    const isHost = lobby.hostId === user?.id;

    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
         <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
             <CardTitle className="text-center text-3xl font-black">Question {lobby.currentQuestionIndex + 1} / {lobby.totalQuestions}</CardTitle>
             {question && (
                <p className="text-center text-2xl font-bold mt-4 mb-2">{question.questionText}</p>
             )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center mt-4 w-full">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
                {question?.options.map((opt) => {
                    const isSelected = opt.id === selectedOptionId;
                    
                    let btnColor = "bg-secondary/40 text-gray-500 border-2 border-transparent";
                    if (hasAnswered && isSelected) {
                        // User has answered, highlight their choice distinctly
                        btnColor = "bg-blue-500 text-white border-2 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]";
                    } else if (!hasAnswered) {
                        btnColor = "bg-secondary text-secondary-foreground hover:scale-[1.02] active:scale-[0.95] cursor-pointer shadow-md";
                    }

                    return (
                        <Button 
                            key={opt.id} 
                            disabled={hasAnswered}
                            onClick={() => submitAnswer(opt.id === question.correctOptionId, opt.id)} 
                            className={`h-24 w-full text-xl font-bold rounded-2xl transition-all whitespace-normal ${btnColor}`}
                            variant="secondary"
                        >
                            {opt.content}
                        </Button>
                    );
                })}
            </div>
            
            {hasAnswered && (
                <div className="text-center bg-secondary/30 rounded-xl w-full flex items-center justify-center gap-3 py-3 border border-border">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <p className="text-sm font-semibold text-muted-foreground">Waiting for other players ({lobby.players.filter(p => p.answeredCurrentQuestion).length} / {lobby.players.length})</p>
                </div>
            )}

            {isHost ? (
                <Button disabled={true} className="mt-2 w-full h-14 text-xl font-black rounded-xl opacity-50">
                    Next Question
                </Button>
            ) : (
                <div className="text-center mt-2 p-4 bg-muted/20 border border-border rounded-xl font-bold text-muted-foreground opacity-50">
                  Waiting for Host to continue...
                </div>
            )}

          </CardContent>
         </Card>
      </div>
    );
  }

  // View: Results
  if (lobby.gameState === 'RESULTS') {
    const sorted = [...lobby.players].sort((a, b) => b.score - a.score);
    const question = lobby.currentQuestion;
    const isHost = lobby.hostId === user?.id;
    
    return (
       <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
             <CardTitle className="text-center text-3xl font-black">Question {lobby.currentQuestionIndex + 1} / {lobby.totalQuestions}</CardTitle>
             {question && (
                <p className="text-center text-2xl font-bold mt-4 mb-2">{question.questionText}</p>
             )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center mt-4 w-full">
            
            {question && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
                    {question.options.map((opt) => {
                        const isCorrectAnswer = opt.id === question.correctOptionId;
                        const isSelected = opt.id === selectedOptionId;
                        
                        let btnColor = "bg-secondary/40 text-gray-500 border-2 border-transparent";
                        if (isCorrectAnswer) {
                            btnColor = "bg-green-500 text-white border-2 border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                        } else if (isSelected && !isCorrectAnswer) {
                            btnColor = "bg-red-500 text-white border-2 border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
                        }

                        return (
                            <div 
                                key={opt.id} 
                                className={`flex items-center justify-center h-24 w-full text-xl font-bold rounded-2xl shadow-sm transition-all whitespace-normal ${btnColor}`}
                            >
                                {opt.content}
                            </div>
                        );
                    })}
                </div>
            )}

            {isHost ? (
                <Button onClick={startGame} className="mt-2 w-full h-14 text-xl font-black rounded-xl">
                    Next Question
                </Button>
            ) : (
                <div className="text-center mt-2 p-4 bg-muted/50 border border-border rounded-xl font-bold text-muted-foreground animate-pulse">
                  Waiting for Host to continue...
                </div>
            )}


            
          </CardContent>
        </Card>
       </div>
    );
  }

  // View: Finished Game
  if (lobby.gameState === 'FINISHED') {
    const sorted = [...lobby.players].sort((a, b) => b.score - a.score);
    
    return (
       <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
             <CardTitle className="text-center text-5xl font-black text-primary uppercase tracking-widest">Game Over</CardTitle>
             <p className="text-center text-xl font-semibold text-muted-foreground mt-2">Final Leaderboard</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 items-center mt-4 w-full">
            
            <div className="bg-secondary/20 rounded-2xl p-6 flex flex-col gap-4 w-full max-h-96 overflow-y-auto">
              {sorted.map((p, index) => (
                <div key={p.id} className="flex items-center gap-4 p-4 bg-background rounded-xl shadow-sm border border-border/50">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner
                    ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      index === 1 ? 'bg-gray-300 text-gray-800' : 
                      index === 2 ? 'bg-amber-600 text-amber-100' : 
                      'bg-primary/10 text-primary'}`}>
                    #{index + 1}
                  </div>
                  <div className="flex flex-col flex-grow">
                     <span className="font-bold text-xl">{p.username}</span>
                  </div>
                  <span className="font-black text-2xl text-primary">{p.score} pts</span>
                </div>
              ))}
            </div>

            <Button onClick={leaveCurrentLobby} className="mt-4 w-full h-16 text-xl font-bold rounded-xl variant-secondary hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Leave Room
            </Button>
            
          </CardContent>
        </Card>
       </div>
    );
  }

  return null;
};

export default MultiplayerPage;
