import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useOutletContext, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PermissionTypes, Permissions, PermissionBits } from 'librechat-data-provider';
import type t from 'librechat-data-provider';
import { Canvas } from '@react-three/fiber';
import { useMarketplaceAgentsInfiniteQuery } from '~/data-provider/Agents';
import { MarketplaceProvider } from './MarketplaceContext';
import { SidePanelProvider } from '~/Providers';
import { useDocumentTitle, useHasAccess, useLocalize } from '~/hooks';
import type { ContextType } from '~/common';
import { cn } from '~/utils';
import store from '~/store';
import { AgentCarousel3D, type Agent } from '~/components/Agents/AgentCarousel';

interface AgentMarketplaceProps {
  className?: string;
}

const AgentMarketplace: React.FC<AgentMarketplaceProps> = ({ className = '' }) => {
  const localize = useLocalize();
  const navigate = useNavigate();
  const { setNavVisible } = useOutletContext<ContextType>();
  const [, setHideSidePanel] = useRecoilState(store.hideSidePanel);
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);

  useDocumentTitle(`${localize('com_agents_marketplace')} | LibreChat`);

  useEffect(() => {
    setHideSidePanel(false);
    setNavVisible(false);
    localStorage.setItem('hideSidePanel', 'false');
    localStorage.setItem('fullPanelCollapse', 'true');
    localStorage.setItem('react-resizable-panels:collapsed', 'true');
    localStorage.setItem('navVisible', JSON.stringify(false));
  }, [setHideSidePanel, setNavVisible]);

  const queryParams = useMemo(() => {
    const params: {
      requiredPermission: number;
      category?: string;
      search?: string;
      limit: number;
      promoted?: 0 | 1;
    } = { requiredPermission: PermissionBits.VIEW, limit: 20 };

    if (searchQuery) {
      params.search = searchQuery;
      if (category && category !== 'all' && category !== 'promoted') {
        params.category = category;
      }
    } else {
      if (category === 'promoted') {
        params.promoted = 1;
      } else if (category && category !== 'all') {
        params.category = category;
      }
    }
    return params;
  }, [category, searchQuery]);

  const { data } = useMarketplaceAgentsInfiniteQuery(queryParams);
  const agents: Agent[] = useMemo(
    () =>
      (data?.pages ?? []).flatMap((p) => (p.data || [])).map((a: t.Agent) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        avatarUrl: a.avatar,
      })),
    [data]
  );

  const hasAccessToMarketplace = useHasAccess({
    permissionType: PermissionTypes.MARKETPLACE,
    permission: Permissions.USE,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (!hasAccessToMarketplace) {
      timeoutId = setTimeout(() => {
        navigate('/c/new');
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [hasAccessToMarketplace, navigate]);

  if (!hasAccessToMarketplace) {
    return null;
  }

  return (
    <div className={cn('relative flex w-full grow overflow-hidden bg-presentation', className)}>
      <MarketplaceProvider>
        <SidePanelProvider>
          <main className="flex h-full flex-col overflow-hidden" role="main">
            <div className="relative h-full w-full">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <AgentCarousel3D agents={agents} onActiveChange={(a) => setActiveAgent(a)} />
              </Canvas>
              <div className="pointer-events-none absolute bottom-6 inset-x-0 text-center text-sm text-text-primary">
                {activeAgent ? `${activeAgent.name} — ${activeAgent.description ?? ''}` : ''}
              </div>
            </div>
          </main>
        </SidePanelProvider>
      </MarketplaceProvider>
    </div>
  );
};

export default AgentMarketplace;

