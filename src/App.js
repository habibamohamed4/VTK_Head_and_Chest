import React from 'react';
import ReactDOM from 'react-dom';
import Apps from './App1';
//import { useState, useRef, useEffect } from 'react';
import { vec3, quat, mat4 } from 'gl-matrix';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageCroppingWidget from '@kitware/vtk.js/Widgets/Widgets3D/ImageCroppingWidget';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
// import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
// import vtkImageMarchingCubes from '@kitware//vtk.js/Filters/General/ImageMarchingCubes';
// import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';

function head(){
  ReactDOM.render(
    <React.StrictMode>
      <Apps />
    </React.StrictMode>,
    document.getElementById('root')
  );
  }
function App() {

    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0.218, 0.3, 0.375],
    });

    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();
    const apiRenderWindow = fullScreenRenderer.getApiSpecificRenderWindow();
    
    // global.renderer = renderer;
    // global.renderWindow = renderWindow;

    // ----------------------------------------------------------------------------
    // 2D overlay rendering
    // ----------------------------------------------------------------------------

    const overlaySize = 15;
    const overlayBorder = 2;
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.width = `${overlaySize}px`;
    overlay.style.height = `${overlaySize}px`;
    overlay.style.border = `solid ${overlayBorder}px red`;
    overlay.style.borderRadius = '50%';
    overlay.style.left = '-100px';
    overlay.style.pointerEvents = 'none';
    document.querySelector('body').appendChild(overlay);

    // ----------------------------------------------------------------------------
    // Widget manager
    // ----------------------------------------------------------------------------

    const widgetManager = vtkWidgetManager.newInstance();
    widgetManager.setRenderer(renderer);

    const widget = vtkImageCroppingWidget.newInstance();

    function widgetRegistration(e) {
        const action = e ? e.currentTarget.dataset.action : 'addWidget';
        const viewWidget = widgetManager[action](widget);
        if (viewWidget) {

            viewWidget.setDisplayCallback((coords) => {
                
                overlay.style.left = '-100px';
                
                if (coords) {
                    const [w, h] = apiRenderWindow.getSize();
                    overlay.style.left = `${Math.round(
                    (coords[0][0] / w) * window.innerWidth -
                        overlaySize * 0.5 -
                        overlayBorder
                    )}px`;
                    overlay.style.top = `${Math.round(
                    ((h - coords[0][1]) / h) * window.innerHeight -
                        overlaySize * 0.5 -
                        overlayBorder
                    )}px`;
                }

            });

            renderer.resetCamera();
            renderer.resetCameraClippingRange();
        }
        widgetManager.enablePicking();
        renderWindow.render();
    }

    // Initial widget register
    widgetRegistration();

    // ----------------------------------------------------------------------------
    // Volume rendering
    // ----------------------------------------------------------------------------

    const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });

    const actor = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();
    mapper.setSampleDistance(1.1);
    actor.setMapper(mapper);

    // create color and opacity transfer functions
    const ctfun = vtkColorTransferFunction.newInstance();
    ctfun.addRGBPoint(100, 1, 1, 1);
    ctfun.addRGBPoint(0, 0, 0, 0);
    ctfun.addRGBPoint(150, 1, 0, 0);
    ctfun.addRGBPoint(255, 0, 0, 1);
    const ofun = vtkPiecewiseFunction.newInstance();
    ofun.addPoint(0.0, 0.0);
    ofun.addPoint(255.0, 1.0);
    actor.getProperty().setRGBTransferFunction(0, ctfun);
    actor.getProperty().setScalarOpacity(0, ofun);
    actor.getProperty().setScalarOpacityUnitDistance(0, 3.0);
    actor.getProperty().setInterpolationTypeToLinear();
    actor.getProperty().setUseGradientOpacity(0, true);
    actor.getProperty().setGradientOpacityMinimumValue(0, 2);
    actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
    actor.getProperty().setGradientOpacityMaximumValue(0, 20);
    actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
    actor.getProperty().setShade(true);
    actor.getProperty().setAmbient(0.2);
    actor.getProperty().setDiffuse(0.7);
    actor.getProperty().setSpecular(0.3);
    actor.getProperty().setSpecularPower(8.0);

    mapper.setInputConnection(reader.getOutputPort());

    // -----------------------------------------------------------
    // Get data
    // -----------------------------------------------------------

    function getCroppingPlanes(imageData, ijkPlanes) {
        
        const rotation = quat.create();
        mat4.getRotation(rotation, imageData.getIndexToWorld());

        const rotateVec = (vec) => {
            const out = [0, 0, 0];
            vec3.transformQuat(out, vec, rotation);
            return out;
        };

        const [iMin, iMax, jMin, jMax, kMin, kMax] = ijkPlanes;
        const origin = imageData.indexToWorld([iMin, jMin, kMin]);
        // opposite corner from origin
        const corner = imageData.indexToWorld([iMax, jMax, kMax]);

        return [
            // X min/max
            vtkPlane.newInstance({ normal: rotateVec([1, 0, 0]), origin }),
            vtkPlane.newInstance({ normal: rotateVec([-1, 0, 0]), origin: corner }),
            // Y min/max
            vtkPlane.newInstance({ normal: rotateVec([0, 1, 0]), origin }),
            vtkPlane.newInstance({ normal: rotateVec([0, -1, 0]), origin: corner }),
            // X min/max
            vtkPlane.newInstance({ normal: rotateVec([0, 0, 1]), origin }),
            vtkPlane.newInstance({ normal: rotateVec([0, 0, -1]), origin: corner }),
        ];
    }

    reader.setUrl(`https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`).then(() => {
    reader.loadData().then(() => {
        const image = reader.getOutputData();

        // update crop widget
        widget.copyImageDataDescription(image);
        const cropState = widget.getWidgetState().getCroppingPlanes();
        cropState.onModified(() => {
        const planes = getCroppingPlanes(image, cropState.getPlanes());
        mapper.removeAllClippingPlanes();
        planes.forEach((plane) => {
            mapper.addClippingPlane(plane);
        });
        mapper.modified();
        });

        // add volume to renderer
        renderer.addVolume(actor);
        renderer.resetCamera();
        renderer.resetCameraClippingRange();
        renderWindow.render();
    });
    });

    const handleChange = (e) => {
        const value = e.target.checked;
         //console.log(value);
        const name = e.currentTarget.dataset.name;
       // console.log(name);
        widget.set({ [name]: value }); 
        widgetManager.enablePicking();
        renderWindow.render();
    };
         
        


    return (
      
        <div style={{
        zIndex:"2", 
        position: "absolute"
        
        }}>
            <button onClick={head}style = {{
                    
                    margin:10
                }}>HEAD</button>
            <table style = {{
                    background: "white"
                }}>
                <tbody>
                    <span>pickable</span>
                    <input data-name="pickable" type="checkbox" defaultChecked = {true} onChange = {handleChange}/>
                </tbody>
                <tbody>
                    <span>visibility</span>
                    <input data-name="visibility" type="checkbox" defaultChecked = {true} onChange = {handleChange}/>
                </tbody>
                <tbody>
                    <span>contextVisibility</span>
                    <input data-name="contextVisibility" type="checkbox" defaultChecked = {true} onChange = {handleChange}/>
                </tbody>
                <tbody>
                    <span>handleVisibility</span>
                    <input data-name="handleVisibility" type="checkbox" defaultChecked = {true} onChange = {handleChange}/>
                </tbody>
                <tbody>
                    <span>faceHandlesEnabled</span>
                    <input data-name="faceHandlesEnabled" type="checkbox" defaultChecked = {true} onChange = {handleChange}/>
                </tbody>
                <tbody>
                    <span>edgeHandlesEnabled</span>
                    <input data-name="edgeHandlesEnabled" type="checkbox" defaultChecked = {true} onChange = {handleChange}/>
                </tbody>
                <tbody>
                    <span>cornerHandlesEnabled</span>
                    <input data-name="cornerHandlesEnabled" type="checkbox" defaultChecked = {true} onChange = {handleChange}/>
                </tbody>
            
                
            </table>

            <tr>
             <td>
                <button id="toggler"data-action="addWidget" onClick={widgetRegistration}style = {{
                    
                    margin:20
                }}>Add</button>
            </td>
             <td>
               <button data-action="removeWidget" onClick={widgetRegistration}>Remove</button>
             </td>
             </tr>
      </div>
    

    
    );
}

export default App;