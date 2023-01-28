# Final Project: Volume Rendering (VTK)
###### simple volume rendring website with Node.js and React
   
  
Name | Sec | BN |   
--- | --- | --- | 
salma Hussien  | 1 | 38
Sandra essa | 1 | 35 
Habiba mohamed | 1 | 25


# Main Idea 
we display CT for Chest and Head applying widget on both of them but ray casting only on Chest and Marching cubes on Head.

# Implmentation Details
 ## Table of contents
* [rendring window setup ](#rendring window setup)
* [Switching between head and chest](#Switching between head and chest)
* [marching cubes on head ](#marching cubes iin head )
* [ray casting on chest  ](#ray casting on chest  )
* [widget cropping on Head and Chest ](#widget cropping on Head and Chest)

## rendring window setup 
first we creat instance of vtkFullScreenRenderWindow class setting background to whatever color you want 

```

    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0, 0, 0],
    });
```
then we get its render and render window objects 
```

  const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();
    const apiRenderWindow = fullScreenRenderer.getApiSpecificRenderWindow();
```
## Switching between head and chest
there are two buttons to choose go to head or chest 
when we display head there are button to go to chest and the same for chest 

![main](https://user-images.githubusercontent.com/61379163/215264198-f1ee5eff-a877-4bbc-8af4-397c7e88f064.png)

![head](https://user-images.githubusercontent.com/61379163/215264207-a7f7184a-cf19-4837-a379-7b314a13477d.png)

![chest](https://user-images.githubusercontent.com/61379163/215264216-4d4eb845-897c-4bed-9355-7ed58d14dbd5.jpg)

## marching cubes on head
it apply iso value on head go into/out head and show its details 

![Image](./image/iso%202.PNG)
![Image](./image/iso.PNG)

## ray casting on chest
we change color of chest and its details

```
ctfun.addRGBPoint(100, 1, 1, 1);
    ctfun.addRGBPoint(0, 0, 0, 0);
    ctfun.addRGBPoint(150, 1, 0, 0);
    ctfun.addRGBPoint(255, 0, 0, 1);
```

![ray casting](https://user-images.githubusercontent.com/61379163/215264289-a149d3d6-6eed-4c7f-b3b8-6bd3bcab8014.jpg)

## widget cropping on Head and Chest 
```
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
```
![ray casting](https://user-images.githubusercontent.com/61379163/215264381-f81b1e6b-3c5b-4d30-aa59-f2140e93b322.jpg)


![widget head 2](https://user-images.githubusercontent.com/61379163/215264390-323a3b03-43ce-45a0-8fa6-494d722db2cc.png)

# Issues
-It was little difficult to work with react for the first time

-Merging examples wasn't easy as we imagine and for running examples it take some time cause of old version of examples and the new change happened in vtk.js since this   examples published

 
        
























