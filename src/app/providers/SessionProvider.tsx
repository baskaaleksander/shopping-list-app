import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

import { getSupabaseClient } from '../../services/supabase/client';

type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionContextValue = {
  configErrorKey: string | null;
  session: Session | null;
  signOut: () => Promise<void>;
  status: SessionStatus;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [configErrorKey, setConfigErrorKey] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SessionStatus>('loading');

  const queryClient = useQueryClient();

  useEffect(() => {
    const { client, error } = getSupabaseClient();

    if (!client) {
      setConfigErrorKey(error);
      setSession(null);
      setStatus('signedOut');
      return;
    }

    let isMounted = true;

    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) {
        return;
      }

      setConfigErrorKey(sessionError ? 'common.errors.sessionLoad' : null);
      setSession(data.session ?? null);
      setStatus(data.session ? 'signedIn' : 'signedOut');
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      if (!nextSession) {
        queryClient.clear();
      }

      setSession(nextSession);
      setStatus(nextSession ? 'signedIn' : 'signedOut');
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<SessionContextValue>(
    () => ({
      configErrorKey,
      session,
      signOut: async () => {
        const { client } = getSupabaseClient();

        if (!client) {
          return;
        }

        await client.auth.signOut();
      },
      status,
    }),
    [configErrorKey, session, status],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return context;
}
