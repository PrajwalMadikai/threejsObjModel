'use client';

import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function ModelMetadata({ metadata, measurementData }) {

    return (
        <div className="absolute top-4 left-4 bg-gradient-to-br from-gray-800 to-black text-white p-6 rounded-lg shadow-2xl max-w-sm">
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
                
                {measurementData && measurementData.distance && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                            Measurement
                        </h4>
                        <p className="flex items-center">
                            <span className="w-20 font-semibold text-gray-300">Distance:</span>
                            <span className="text-gray-100">{measurementData.distance.toFixed(4)} units</span>
                        </p>
                        <p className="flex items-start mt-2">
                            <span className="w-20 font-semibold text-gray-300">Point 1:</span>
                            <span className="text-gray-100">
                                ({measurementData.points[0].x.toFixed(2)}, 
                                {measurementData.points[0].y.toFixed(2)}, 
                                {measurementData.points[0].z.toFixed(2)})
                            </span>
                        </p>
                        <p className="flex items-start">
                            <span className="w-20 font-semibold text-gray-300">Point 2:</span>
                            <span className="text-gray-100">
                                ({measurementData.points[1].x.toFixed(2)}, 
                                {measurementData.points[1].y.toFixed(2)}, 
                                {measurementData.points[1].z.toFixed(2)})
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PointMarker({ position, color }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
    );
}

// the measurement line
function MeasurementLine({ points }) {
    if (!points || points.length !== 2) return null;
    
    return (
        <group>
            {/* Main line */}
            <line>
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([
                            points[0].x, points[0].y, points[0].z,
                            points[1].x, points[1].y, points[1].z
                        ])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial attach="material" color="#00ff00" linewidth={5} />
            </line>
            
            {/* Thicker line */}
            <mesh>
                <tubeGeometry 
                    args={[
                        new THREE.CatmullRomCurve3([
                            new THREE.Vector3(points[0].x, points[0].y, points[0].z),
                            new THREE.Vector3(points[1].x, points[1].y, points[1].z)
                        ]),
                        64,  
                        0.02,  
                        8,  
                        false 
                    ]} 
                />
                <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

function Model({ url, textureUrl, onMeasurementUpdate }) {
    const [model, setModel] = useState(null);
    const [pointMarkers, setPointMarkers] = useState([]);
    const [linePoints, setLinePoints] = useState(null);
    const {  camera, gl } = useThree();
    const modelRef = useRef(null);
    const raycaster = useRef(new THREE.Raycaster());
    const clickedPoints = useRef([]);

    // Function to handle model clicks for points
    const handleModelClick = (event) => {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

        raycaster.current.setFromCamera(mouse, camera);

        if (modelRef.current) {
            const intersects = raycaster.current.intersectObject(modelRef.current, true);
            
            if (intersects.length > 0) {
                const point = intersects[0].point.clone();
                
                if (clickedPoints.current.length < 2) {
                    clickedPoints.current.push(point);
                } else {
                    clickedPoints.current = [point];
                }
                
                updatePointMarkers();
                
                // If we have 2 points, update line and calculate distance
                if (clickedPoints.current.length === 2) {
                
                    setLinePoints([...clickedPoints.current]);
                    
                    const distance = clickedPoints.current[0].distanceTo(clickedPoints.current[1]);
                    
                    // Update parent component with measurement data
                    if (onMeasurementUpdate) {
                        onMeasurementUpdate({ 
                            points: clickedPoints.current,
                            distance: distance
                        });
                    }
                } else {
                    setLinePoints(null);
                    if (onMeasurementUpdate) {
                        onMeasurementUpdate(null);
                    }
                }
            }
        }
    };
    
    // Function to update the point 
    const updatePointMarkers = () => {
        const colors = ['#ff0000', '#00ffff']; 
        
        setPointMarkers(
            clickedPoints.current.map((point, index) => ({
                position: point,
                color: colors[index],
                key: `point-${index}`
            }))
        );
    };

    useEffect(() => {
        const textureLoader = new TextureLoader();
        const texture = textureLoader.load(textureUrl);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.5,
            metalness: 0.2,
        });

        const objLoader = new OBJLoader();
        objLoader.load(
            url,
            (object) => {
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });

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
                
                // Add click event listener to the canvas
                gl.domElement.addEventListener('click', handleModelClick);
            },
            undefined,
            (error) => {
                setError('Failed to load OBJ file.');
            }
        );

        return () => {
            if (gl.domElement) {
                gl.domElement.removeEventListener('click', handleModelClick);
            }
        };
    }, [url, textureUrl]);

    if (error) {
        return <div style={{ color: 'red', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{error}</div>;
    }

    return (
        <>
            {model && <primitive object={model} />}
            
            {pointMarkers.map((marker) => (
                <PointMarker 
                    key={marker.key}
                    position={marker.position}
                    color={marker.color}
                />
            ))}
            
            {linePoints && linePoints.length === 2 && (
                <MeasurementLine points={linePoints} />
            )}
        </>
    );
}

export default function ModelViewer({ metadata }) {
    const [measurementData, setMeasurementData] = useState(null);
    
    const handleMeasurementUpdate = (data) => {
        setMeasurementData(data);
    };

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

                <Model 
                    url="/assets/model.obj" 
                    textureUrl="/assets/capsule0.jpg" 
                    onMeasurementUpdate={handleMeasurementUpdate}
                />

                <OrbitControls
                    enableDamping
                    dampingFactor={0.1}
                    minDistance={1}
                    maxDistance={20}
                />
            </Canvas>

            <ModelMetadata metadata={metadata} measurementData={measurementData} />
            
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                <p>Try to point the points on the flat section inorder to see the line betweem two points in green color</p>
                <p className="mt-2 text-sm">
                    <span className="inline-block w-3 h-3 bg-red-500 mr-2 rounded-full"></span>First point
                    <span className="inline-block w-3 h-3 bg-cyan-500 ml-6 mr-2 rounded-full"></span>Second point
                    <span className="inline-block w-3 h-3 bg-green-500 ml-6 mr-2 rounded-full"></span>Measurement line
                </p>
            </div>
        </div>
    );
}