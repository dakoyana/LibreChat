import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PermissionBits } from 'librechat-data-provider';
import { useMarketplaceAgentsInfiniteQuery } from '~/data-provider/Agents';
import { useGetEndpointsQuery } from '~/data-provider';
import { useDocumentTitle } from '~/hooks';
import { AgentCarousel3D } from './AgentCarousel3D';

export default function AgentMarketplace() {
  useDocumentTitle('Agents Marketplace | LibreChat');
  useGetEndpointsQuery();

  const { data } = useMarketplaceAgentsInfiniteQuery({
    requiredPermission: PermissionBits.VIEW,
    limit: 12,
  });

  const agents = useMemo(() => data?.pages.flatMap((p) => p.data ?? []) ?? [], [data]);

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <AgentCarousel3D agents={agents} />
      </Canvas>
    </div>
  );
}

