import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { connectSleeper, clearError } from '../store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  console.log('LoginPage component rendering');
  
  const [username, setUsername] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('LoginPage handleSubmit called');
    e.preventDefault();
    if (!username.trim()) return;

    try {
      await dispatch(connectSleeper(username)).unwrap();
      navigate('/drafts');
    } catch (err) {
      // Error is handled in the slice
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold text-primary">
            AI Fantasy Draft Assistant
          </CardTitle>
          <CardDescription>
            Connect your Sleeper account to get started
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Sleeper Username
              </label>
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Sleeper username"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                <p className="font-semibold mb-1">Connection Error</p>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => dispatch(clearError())}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Connecting...
                </>
              ) : (
                'Connect with Sleeper'
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Don't have a Sleeper account?</p>
            <a
              href="https://sleeper.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Sign up at sleeper.app
            </a>
          </div>

          <div className="w-full bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Enter your Sleeper username</li>
              <li>Select an active draft</li>
              <li>Get AI-powered recommendations in real-time</li>
              <li>Dominate your draft!</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}