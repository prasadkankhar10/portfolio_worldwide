import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { globalPlayerState } from './Character';

interface DistanceNameTagProps {
  name: string;
  position?: [number, number, number];
}

export function DistanceNameTag(_props: DistanceNameTagProps) {
  // Debug name tags removed for clean production immersion
  return null;
}
