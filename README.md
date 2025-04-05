# 3D Model Viewer

A web application built with Next.js and Three.js that displays a 3D model in OBJ format with applied textures. Users can rotate and zoom the model using orbit controls.

## Features

- Loads and renders 3D models in OBJ format
- Applies textures to the loaded model
- Implements orbit controls for model interaction (rotation, zoom)
- Displays model metadata
- Responsive design that works on various screen sizes
- can improve the texture loading speed if jpg format change to basis format

## Technologies Used

- Next.js
- Three.js
- React Three Fiber
- React Three Drei

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/3d-model-viewer.git
   cd 3d-model-viewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Place your 3D model files in the public directory:
   - Place your OBJ file at `public/assets/model.obj`
   - Place your texture file at `public/assets/capsule0.jpg`

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

### Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
3d-model-viewer/
├── components/
│   └── ModelViewer.jsx     # Main component for 3D rendering
├── pages/
│   └── index.js            # Home page that includes the ModelViewer
├── public/
│   └── assets/
│       ├── model.obj       # 3D model file
│       └── capsule0.jpg    # Texture file
├── styles/
│   └── globals.css         # Global styles
└── package.json            # Project dependencies
```

## How It Works

1. The application loads a 3D model from the OBJ file located in the public directory
2. A texture is loaded and applied to the model
3. The model is rendered in a Three.js scene
4. Orbit controls allow the user to interact with the model
5. Model metadata is displayed as an overlay

## Customization

To use your own 3D model:
1. Replace `public/assets/model.obj` with your OBJ file
2. Replace `public/assets/capsule0.jpg` with your texture file
3. Update the metadata in `app/page.tsx` to match your model

## License

MIT

## Contact

For any questions or feedback, please email: prajwalmadikai@example.com