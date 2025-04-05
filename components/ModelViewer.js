'use client';

import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function ModelMetadata({ metadata }) {
    return (
        <div className="absolute top-4 left-4 bg-gradient-to-br from-gray-800 to-black text-white p-6 rounded-lg shadow-2xl max-w-sm transform  ">
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Model Info
            </h3>
            <div className="space-y-2">
                <p className="flex items-center">
                    <span className="w-20 font-semibold text-gray-300">Name:</span>
                    <span className="text-gray-100">{metadata.name}</span>
                </p>
                <p className="flex items-center">
                    <span className="w-20 font-semibold text-gray-300">Format:</span>
                    <span className="text-gray-100">{metadata.format}</span>
                </p>
                <p className="flex items-center">
                    <span className="w-20 font-semibold text-gray-300">Texture:</span>
                    <span className="text-gray-100">{metadata.texture}</span>
                </p>
                <p className="flex items-start">
                    <span className="w-20 font-semibold text-gray-300 pt-1">Description:</span>
                    <span className="pl-3 pt-1 text-gray-100">{metadata.description}</span>
                </p>
            </div>
        </div>
    );
}

function Model({ url, textureUrl }) {
    const [model, setModel] = useState(null);
    const [error, setError] = useState(null);
    const { scene } = useThree();
    const modelRef = useRef(null);

    useEffect(() => {

        const textureLoader = new TextureLoader();
        const texture = textureLoader.load(textureUrl);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.5,
            metalness: 0.2,
        });

        // Load OBJ model
        const objLoader = new OBJLoader();
        objLoader.load(
            url,
            (object) => {
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });

                // Center the model
                const bbox = new THREE.Box3().setFromObject(object);
                const center = new THREE.Vector3();
                bbox.getCenter(center);
                object.position.sub(center);

                const size = new THREE.Vector3();
                bbox.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 5 / maxDim;
                object.scale.set(scale, scale, scale);

                modelRef.current = object;
                setModel(object);
            },
            undefined,
            (error) => {
                setError('Failed to load OBJ file.');
            }
        );


        return () => {
            if (modelRef.current) {
                scene.remove(modelRef.current);
            }
        };
    }, [url, textureUrl]);

    if (error) {
        return <div style={{ color: 'red', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{error}</div>;
    }

    return model ? <primitive object={model} /> : null;
}

export default function ModelViewer({ metadata }) {
    return (
        <div className="relative w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <spotLight position={[-10, -10, -10]} intensity={1} />

                <Environment preset="sunset" />

                {/* used basis format in image in-order to Compress Textures and load fastly */}

                <Model url="/assets/model.obj" textureUrl="/assets/capsule0.jpg" />

                <OrbitControls
                    enableDamping
                    dampingFactor={0.1}
                    minDistance={1}
                    maxDistance={20}
                />
            </Canvas>

            <ModelMetadata metadata={metadata} />
        </div>
    );
}