import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Spinner } from '@librechat/client';
import type t from 'librechat-data-provider';
import { PermissionBits } from 'librechat-data-provider';
import { useDocumentTitle, useLocalize } from '~/hooks';
import { useMarketplaceAgentsInfiniteQuery } from '~/data-provider/Agents';
import AgentCarousel from './AgentCarousel';
import type { ContextType } from '~/common';
import store from '~/store';

const AgentMarketplace: React.FC = () => {
  const localize = useLocalize();
  useDocumentTitle(`${localize('com_agents_marketplace')} | LibreChat`);
  const navigate = useNavigate();
  const { setNavVisible } = useOutletContext<ContextType>();
  const [, setHideSidePanel] = useRecoilState(store.hideSidePanel);

  useEffect(() => {
    setHideSidePanel(false);
    setNavVisible(false);
    localStorage.setItem('hideSidePanel', 'false');
    localStorage.setItem('fullPanelCollapse', 'true');
    localStorage.setItem('react-resizable-panels:collapsed', 'true');
    localStorage.setItem('navVisible', JSON.stringify(false));
  }, [setHideSidePanel, setNavVisible]);

  const { data, isLoading } = useMarketplaceAgentsInfiniteQuery({
    requiredPermission: PermissionBits.VIEW,
    limit: 20,
  });

  const agents = useMemo(
    () => data?.pages?.flatMap((page) => page.data || []) ?? [],
    [data?.pages],
  );

  const handleAgentSelect = (agent: t.Agent) => {
    navigate(`/c/new?agent_id=${agent.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Canvas style={{ width: '100%', height: '100%' }}>
        <AgentCarousel agents={agents} onSelect={handleAgentSelect} />
      </Canvas>
    </div>
  );
};

export default AgentMarketplace;

