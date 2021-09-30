import * as THREE from './libs/three/three.module.js';
import { VRButton } from './libs/three/jsm/VRButton.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';
import { BoxLineGeometry } from './libs/three/jsm/BoxLineGeometry.js';
import { Stats } from './libs/stats.module.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from './libs/three/loaders/ColladaLoader.js';

class App{
    constructor(){
        //CONTAINER
        this.container = document.createElement('div_vr')
        document.body.appendChild(this.container )
        //SCENE
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('grey')
        //RENDERER
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio( window.devicePixelRatio )
		this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.renderer.outputEncoding = THREE.sRGBEncoding 
        this.container.appendChild( this.renderer.domElement )        
        //CANVAS
        this.canvas = document.getElementsByTagName('canvas')
        this.canvas.id='#c'
        // console.log( this.canvas)
        //CAMERA
        var posX = 0
        var posY = 0
        var posZ = 0
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);		
        this.camera.position.set( posX, posY, posZ )
        //LIGHT
        this.add_light()
        //CONTROLLER
        this.controls = new OrbitControls( this.camera, this.renderer.domElement )
        this.controls.target.set(0, 0, -0.0001)
        this.controls.update()

        //MATERIAL
        this.texture_name = './pano/CS1_ (1).jpg'
        this.texture = new THREE.TextureLoader().load(this.texture_name)
        this.material = new THREE.MeshBasicMaterial( { map: this.texture } )

        //GEOMETRY
        //BUTTON 3D
        this.button3d = new THREE.BoxGeometry(0.25,0.0001,0.125)
        this.button_material = new THREE.MeshBasicMaterial({color: 'black'})
        this.button3dmesh = new THREE.Mesh(this.button3d,this.button_material)
        this.button3dmesh.position.set(0,-0.5,0)
        this.button3dmesh.name = 'BUTTON'        
        this.scene.add(this.button3dmesh)
        
        // PICKER
        this.pickPosition = {x: 0, y: 0};
        this.picker = new PickHelper()
        
        function getCanvasRelativePosition(event) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: (event.clientX - rect.left) * this.canvas.width  / rect.width,
                y: (event.clientY - rect.top ) * this.canvas.height / rect.height,
            };
        }
        
        function setPickPosition(event) {
            const pos = getCanvasRelativePosition(event);
            this.pickPosition.x = (pos.x / this.canvas.width ) *  2 - 1;
            this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1;  // note we flip Y
        }
        
        function clearPickPosition() {
            // unlike the mouse which always has a position
            // if the user stops touching the screen we want
            // to stop picking. For now we just pick a value
            // unlikely to pick something
            this.pickPosition.x = -100000;
            this.pickPosition.y = -100000;
        }

        window.addEventListener('mouseclick', setPickPosition);
        // window.addEventListener('mouseout', clearPickPosition);
        // window.addEventListener('mouseleave', clearPickPosition);
        
        //BUTTON TEXT
        this.set_font()
        let data_json
        const loader = new THREE.FontLoader()
        var font_ = loader.parse(this.font_json_data)
        console.log(font_) 
        const text_geometry = new THREE.TextGeometry('Home',{
            font: font_,
            size: 0.05,
            height: 0.0001
        })
        console.log(text_geometry)        
        this.mesh_text = new THREE.Mesh(text_geometry,new THREE.MeshBasicMaterial({color: 'white'}))
        this.mesh_text.name = 'TEXT'
        this.mesh_text.position.set(-0.08,-0.499999,0.02)
        this.mesh_text.rotation.set(-1.5708,0,0)
        this.scene.add( this.mesh_text)

        //TEST BOX
        // var box = new THREE.BoxGeometry(2,1,0.5)
        // var boxmesh = new THREE.Mesh(box)
        // boxmesh.position.set(3,0,-5)
        // boxmesh.name = 'BOX2'
        // this.scene.add(boxmesh)

        //SPHERE 360
        this.sphere = new THREE.SphereGeometry(5,24,24)
        this.sphere.scale( - 1, 1, 1 )
        this.spheremesh = new THREE.Mesh(this.sphere,this.material)
        this.spheremesh.position.set(0,0,0)
        this.spheremesh.name = 'SPHERE'
        this.scene.add(this.spheremesh)

        window.addEventListener('resize', this.resize.bind(this))        
        this.renderer.setAnimationLoop(this.render.bind(this));

	}
    add_light(){
        this.light0 = new THREE.HemisphereLight(0xffffff, 0x404040)
        this.light0.intensity = 0.5
        this.scene.add(this.light0)
        this.light = new THREE.DirectionalLight(0xffffff)
        this.light.position.set(1, 1, 1).normalize()
        this.light.intensity = 0.5
        this.scene.add(this.light)
    }
    // resizeRendererToDisplaySize() {
    //     const canvas = this.renderer.domElement;
    //     const width = canvas.clientWidth;
    //     const height = canvas.clientHeight;
    //     const needResize = canvas.width !== width || canvas.height !== height;
    //     if (needResize) {
    //       this.renderer.setSize(width, height, false);
    //     }
    //     return needResize;
    // }
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    render(time) { 
        time *= 0.001
        this.canvas = this.renderer.domElement
        this.picker.pick(this.pickPosition, this.scene, this.camera, time)
        this.renderer.render( this.scene, this.camera);
        // requestAnimationFrame(render)
    }
    set_font(){
    }
}

class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
      // restore the color if there is a picked object
      if (this.pickedObject) {
        this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        this.pickedObject = undefined;
      }
   
      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
        // save its color
        this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        // set its emissive color to flashing red/yellow
        this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      }
    }
  }
export { App };