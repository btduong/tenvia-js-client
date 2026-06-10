import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

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
    <form className="flex flex-col items-center gap-4" onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel>
            Enter a name to play
          </FieldLabel>
          <Input
            id="set-username"
            type="text"
            placeholder="Name"
            value={userName}
            onChange={(e) => setTypedUsername(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={!userName.trim()}>
          Play
        </Button>
      </FieldGroup>

    </form>
  );
};
