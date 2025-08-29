import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Mesh } from 'three';
import { useNavigate } from 'react-router-dom';

export type Agent = {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
};

type Props = {
  agents: Agent[];
  onActiveChange?: (agent: Agent) => void;
  onSelect?: (agent: Agent) => void;
};

function useAvatarTexture(url?: string) {
  const fallback = '/assets/icon-192x192.png';
  const [src, setSrc] = useState(url || fallback);
  const tex = useTexture(src);

  useEffect(() => {
    setSrc(url || fallback);
  }, [url]);

  useEffect(() => {
    const img = (tex as any).image as HTMLImageElement | undefined;
    if (!img) return;
    const handleError = () => {
      if (src !== fallback) {
        setSrc(fallback);
      }
    };
    img.addEventListener('error', handleError);
    return () => img.removeEventListener('error', handleError);
  }, [tex, src]);

  return tex;
}

function Card({ agent, position, onClick }: { agent: Agent; position: [number, number, number]; onClick: () => void }) {
  const mesh = useRef<Mesh>(null);
  const [hover, setHover] = useState(false);
  const tex = useAvatarTexture(agent.avatarUrl);

  useFrame(({ camera }) => {
    if (!mesh.current) return;
    mesh.current.lookAt(camera.position);
    const target = hover ? 1.18 : 1;
    const s = THREE.MathUtils.lerp(mesh.current.scale.x, target, 0.12);
    mesh.current.scale.setScalar(s);
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <circleGeometry args={[0.5, 48]} />
      <meshStandardMaterial map={tex} transparent metalness={0.1} roughness={0.85} />
    </mesh>
  );
}

export function AgentCarousel3D({ agents, onActiveChange, onSelect }: Props) {
  const group = useRef<Group>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useRef<THREE.Object3D>(null);
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  const radius = 2.5;
  const positions = useMemo(
    () =>
      agents.map((_, i) => {
        const a = (i / Math.max(1, agents.length)) * Math.PI * 2;
        return [Math.cos(a) * radius, Math.sin(a * 2) * 0.1, Math.sin(a) * radius] as [number, number, number];
      }),
    [agents.length],
  );

  useEffect(() => {
    if (spot.current && target.current) {
      spot.current.target = target.current;
    }
  }, []);

  useFrame(({ camera }, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += Math.min(delta, 1 / 30) * 0.02;
    g.updateMatrixWorld();

    let best = idx;
    let bestZ = -Infinity;
    for (let i = 0; i < agents.length; i++) {
      const p = new THREE.Vector3(...positions[i]).applyMatrix4(g.matrixWorld);
      const cam = p.clone().applyMatrix4(camera.matrixWorldInverse);
      if (cam.z < 0 && cam.z > bestZ) {
        best = i;
        bestZ = cam.z;
      }
    }
    if (best !== idx && bestZ > -Infinity + 0.035) {
      setIdx(best);
      onActiveChange?.(agents[best]);
    }

    if (spot.current && target.current) {
      const p = new THREE.Vector3(...positions[best]).applyMatrix4(g.matrixWorld);
      target.current.position.lerp(p, 0.22);
      const toCam = camera.position.clone().sub(p).normalize();
      const desired = p.clone().add(toCam.multiplyScalar(1.6)).add(new THREE.Vector3(0, 0.3, 0));
      spot.current.position.lerp(desired, 0.2);
    }
  });

  const handleSelect = (a: Agent) => {
    onSelect?.(a);
    navigate('/c/new?agent_id=' + encodeURIComponent(a.id));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const g = group.current;
      if (!g) return;
      const step = (2 * Math.PI) / Math.max(1, agents.length);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        g.rotation.y -= step;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        g.rotation.y += step;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(agents[idx]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [agents, idx]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight ref={spot} intensity={1.6} angle={1.2} penumbra={0.6} distance={10} decay={2} castShadow={false} />
      <object3D ref={target} />
      <group ref={group}>
        {agents.map((a, i) => (
          <Card key={a.id} agent={a} position={positions[i]} onClick={() => handleSelect(a)} />
        ))}
      </group>
    </>
  );
}

