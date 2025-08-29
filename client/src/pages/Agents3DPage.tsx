import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Agents3DPage() {
  const navigate = useNavigate();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (evt: MessageEvent) => {
      const data = evt?.data;
      if (data && typeof data === 'object' && data.type === 'SCL_SELECT_AGENT' && typeof data.agentId === 'string') {
        navigate('/c/new?agent_id=' + encodeURIComponent(data.agentId));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <iframe
        ref={frameRef}
        title="Agents Marketplace — 3D"
        src="/agents-3d/index.html"
        style={{ border: 0, width: '100%', height: '100%' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
