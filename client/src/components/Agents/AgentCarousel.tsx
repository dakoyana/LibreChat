import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, useCursor } from '@react-three/drei';
import { Group, Mesh, SpotLight, Object3D, Vector3, MathUtils } from 'three';
import type t from 'librechat-data-provider';
import { getAgentAvatarUrl } from '~/utils/agents';

interface AgentCardProps {
  agent: t.Agent;
  position: [number, number, number];
  onClick: () => void;
}

function AgentCard({ agent, position, onClick }: AgentCardProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const avatarUrl = getAgentAvatarUrl(agent);
  const texture = useTexture(avatarUrl || '/assets/icon-192x192.png', (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  useCursor(hovered);

  useFrame(({ camera }) => {
    if (!meshRef.current) return;

    meshRef.current.lookAt(camera.position);

    const target = hovered ? 1.2 : 1;
    const s = MathUtils.lerp(meshRef.current.scale.x, target, 0.12);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <circleGeometry args={[0.5, 48]} />
      <meshStandardMaterial map={texture} transparent metalness={0.1} roughness={0.85} />
    </mesh>
  );
}

interface AgentCarouselProps {
  agents: t.Agent[];
  onSelect?: (agent: t.Agent) => void;
}

const AgentCarousel: React.FC<AgentCarouselProps> = ({ agents, onSelect }) => {
  const groupRef = useRef<Group>(null);
  const spotRef = useRef<SpotLight>(null);
  const spotTargetRef = useRef<Object3D>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const radius = 2.5;
  const count = agents.length;
  const ROTATION_SPEED = 0.02;
  const SWITCH_DEADBAND = 0.035;

  useEffect(() => {
    if (spotRef.current && spotTargetRef.current) {
      spotRef.current.target = spotTargetRef.current;
    }
  }, []);

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    const spot = spotRef.current;
    const spotTarget = spotTargetRef.current;
    if (!group) return;

    if (!isPaused) {
      group.rotation.y += delta * ROTATION_SPEED;
    }
    group.updateMatrixWorld();

    let candidateIdx = currentIndex;
    let candidateZ = -Infinity;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + group.rotation.y;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 0.1;
      const world = new Vector3(x, y, z).applyMatrix4(group.matrixWorld);
      const cam = world.clone().applyMatrix4(camera.matrixWorldInverse);
      if (cam.z < 0 && cam.z > candidateZ) {
        candidateZ = cam.z;
        candidateIdx = i;
      }
    }

    let currentZ = -Infinity;
    {
      const angle = (currentIndex / count) * Math.PI * 2 + group.rotation.y;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 0.1;
      const world = new Vector3(x, y, z).applyMatrix4(group.matrixWorld);
      const cam = world.clone().applyMatrix4(camera.matrixWorldInverse);
      if (cam.z < 0) {
        currentZ = cam.z;
      }
    }

    if (candidateIdx !== currentIndex && candidateZ - currentZ > SWITCH_DEADBAND) {
      setCurrentIndex(candidateIdx);
    }

    if (spot && spotTarget) {
      const i = currentIndex;
      const angle = (i / count) * Math.PI * 2 + group.rotation.y;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 0.1;
      const targetWorld = new Vector3(x, y, z).applyMatrix4(group.matrixWorld);

      spotTarget.position.lerp(targetWorld, 0.22);

      const toCam = camera.position.clone().sub(targetWorld).normalize();
      const desiredPos = targetWorld
        .clone()
        .add(toCam.multiplyScalar(1.6))
        .add(new Vector3(0, 0.3, 0));
      spot.position.lerp(desiredPos, 0.2);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <object3D ref={spotTargetRef} />
      <spotLight
        ref={spotRef}
        intensity={1.8}
        angle={1.3}
        penumbra={0.6}
        distance={10}
        decay={2}
        castShadow={false}
      />
      <group
        ref={groupRef}
        onPointerOver={() => setIsPaused(true)}
        onPointerOut={() => setIsPaused(false)}
      >
        {agents.map((agent, i) => {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.sin(angle * 2) * 0.1;

          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              position={[x, y, z]}
              onClick={() => onSelect?.(agent)}
            />
          );
        })}
      </group>
    </>
  );
};

export default AgentCarousel;

