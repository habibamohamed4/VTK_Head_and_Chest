import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

//import { useState} from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageMarchingCubes from '@kitware//vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import App2 from './cut';

function cropp(){
  ReactDOM.render(
    <React.StrictMode>
      <App2 />
    </React.StrictMode>,
    document.getElementById('root')
  );
  }
function chest(){
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
  }
  
function Apps() {
    
    //const [ opacity, setOpacity ] = useState(2);
    
  
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0.218, 0.3, 0.375],
    });

    // const URLs = [
    //     `https://kitware.github.io/vtk-js/data/volume/headsq.vti`,
    //     `https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`
    // ]
   
    

    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const marchingCube = vtkImageMarchingCubes.newInstance({
        contourValue: 0.0,
        computeNormals: true,
        mergePoints: true,
    });

    const mapper = vtkMapper.newInstance();
    const actor = vtkActor.newInstance();
   
    actor.setMapper(mapper);
    mapper.setInputConnection(marchingCube.getOutputPort());


    
  let dataRange;

    const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
    marchingCube.setInputConnection(reader.getOutputPort());
    reader
        .setUrl(`https://kitware.github.io/vtk-js/data/volume/headsq.vti`, { loadData: true })
        .then(() => reader.loadData)
        .then(() => {
          const data = reader.getOutputData();
             dataRange = data.getPointData().getScalars().getRange();
            const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;
            //console.log(opacity)
            marchingCube.setContourValue(firstIsoValue);
            renderer.addActor(actor);
            renderer.getActiveCamera().set({ position: [0, 1, 0], viewUp: [0, 0, -1] });
            renderer.resetCamera();
            renderWindow.render();

            
        });
        function updateIsoValue(e) {
          const isoValue = Number(e.target.value);
          console.log(isoValue);
          const fisrtIsoValue =(dataRange[0]+dataRange[1]/isoValue);
          marchingCube.setContourValue(fisrtIsoValue);
          renderWindow.render();
        }
        
    return (
      
        <div style={{
            zIndex:"2", 
            position: "absolute"
        }}>
            <button onClick={chest} style = {{
                    
                    margin:10
                }}>CHEST</button>
            <button onClick={cropp}>CROPPING</button>
            <p style = {{
                    
                    background: "white"
                }}>Iso value:</p>
                <input
                type="range"
                min="0"
                max="6"
                step="0.05"
                defaultValue={3}
                onChange={updateIsoValue}
              />
              
      </div>
    );
  }

  export default Apps;