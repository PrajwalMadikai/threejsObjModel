'use client';
import Head from 'next/head';
import ModelViewer from '../components/ModelViewer';

const modelMetadata = {
  name: 'Sample Model',
  format: 'OBJ',
  texture: 'JPG',
  description: 'A sample 3D model with applied textures.',
  vertices: '1,024',
  polygons: '532',
  author: 'prajwal',
  creationDate: '2025-04-01'
};

export default function Home() {
  return (
    <>
      <Head>
        <title>3D Model Viewer</title>
        <meta name="description" content="A 3D model viewer built with Next.js and Three.js" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/assets/model.obj" as="fetch" crossOrigin="anonymous" fetchPriority='high' />
        <link rel="preload" href="/assets/capsule0.jpg" as="fetch" crossOrigin="anonymous" fetchPriority='high' />
      </Head>

      <main style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <ModelViewer metadata={modelMetadata} />
      </main>
    </>
  );
}