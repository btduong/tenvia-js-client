import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface LoginPageProps {
  handleLogin: (username: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
  const [userName, setTypedUsername] = useState<string>('');

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      handleLogin(userName);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-black p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Tenvia</CardTitle>
          <CardDescription>Enter a name to play</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col items-center gap-4" onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <Input
                  id="set-username"
                  type="text"
                  placeholder="Name"
                  value={userName}
                  onChange={(e) => setTypedUsername(e.target.value)}
                />
              </Field>
              <Button size="lg" className="w-full font-bold text-md" type="submit" disabled={!userName.trim()}>
                Play
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
