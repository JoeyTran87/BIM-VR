import * as THREE from './libs/three/three.module.js';
import { VRButton } from './libs/three/jsm/VRButton.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';
import { BoxLineGeometry } from './libs/three/jsm/BoxLineGeometry.js';
import { Stats } from './libs/stats.module.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from './libs/three/loaders/ColladaLoader.js';

class App{
    constructor(folder_,prefix_){
        //CONTAINER
        this.container = document.createElement('div_vr')
        document.body.appendChild(this.container )

        // THIẾT LẬP BIẾN CHUNG CHO BROWER
        localStorage.setItem('current_img', '')
        this.debug = document.getElementById('debug')
        
        this.folder = folder_
        this.prefix = prefix_ 
        this.imgNum = 0
        this.maxImgNum = 21        
        this.walkspeed = 5
        this.clock = new THREE.Clock()     

        //CAMERA
        var posX = 0
        var posY = 0
        var posZ = 1.6
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);		
        this.camera.position.set( posX, posY, posZ )

		this.scene = new THREE.Scene()

		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio( window.devicePixelRatio )
		this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.renderer.outputEncoding = THREE.sRGBEncoding  
		this.container.appendChild( this.renderer.domElement )

        this.controls = new OrbitControls( this.camera, this.renderer.domElement )
        this.controls.target.set(0, 4, 0)
        this.controls.update()

        this.stats = new Stats()

        this.raycaster = new THREE.Raycaster()
        this.workingMatrix = new THREE.Matrix4()
        this.workingVector = new THREE.Vector3()
        this.origin = new THREE.Vector3()
        // this.initScene(imgNum,mesh);        
        this.path = "./"+this.folder+"/"
        this.name =  this.path + this.prefix+"_ ("+this.imgNum+").jpg"                
        //LƯU GIÁ TRỊ MỚI VÀO BIẾN CHUNG BROWSER
        localStorage.setItem('current_img',  this.name)
        this.imgName = document.getElementById('imgNameVr');
		this.imgName.textContent = this.name;
        // var imgName = document.getElementById('imgName')
        // imgName.textContent = name

        this.init_objects()

        this.bNext = document.getElementById('bnxt_vr')
        this.bPrev = document.getElementById('bprv_vr')
        // this.bNext.onclick = this.nextImage()
        this.bNext.addEventListener( 'onclick', this.nextImage())
        // this.bPrev.onclick = this.prevImage()      

        this.setupVR()
        window.addEventListener('resize', this.resize.bind(this))        
        this.renderer.setAnimationLoop(this.render.bind(this));
	}
    init_objects(){        
        // BUTTON 3D
        this.button3d = new THREE.BoxGeometry(1,1,1)
        console.log(this.button3d.position)

        this.geometry = new THREE.SphereBufferGeometry( 100, 24, 24 )
        this.geometry.scale( - 1, 1, 1 )
        this.texture = new THREE.TextureLoader().load(this.name)
        this.material = new THREE.MeshBasicMaterial( { map: this.texture } )
        this.mesh = new THREE.Mesh( this.geometry, this.material )
        this.scene.add(this.mesh)        
    }
    init_VR(){
        
        // animate();
    }
    nextImage(){
        if (this.imgNum <= this.maxImgNum){
            this.imgNum += 1
        }
        else if(this.imgNum > this.maxImgNum){
            this.imgNum = 0
            this.imgName.textContent = 'this.name;'
        }
        this.name  = "./pano/CS1_ ("+this.imgNum+").jpg"
        this.imgName.textContent = this.name
        localStorage.setItem('current_img', this.name)
        // this.debug.textContent =  localStorage.getItem('current_img')

        this.texture = new THREE.TextureLoader().load(this.name)
        this.material = new THREE.MeshBasicMaterial( { map: this.texture } )
        this.mesh = new THREE.Mesh( this.geometry, this.material )
        // scene.remove(this.mesh)
        // scene.add(newmesh)
        // curMesh = newmesh
    }
    prevImage(){				
        if (this.imgNum <= this.maxImgNum){
            this.imgNum -= 1
        }
        else if(this.imgNum > this.maxImgNum){
            this.imgNum = 0
        }
        this.name  = "./pano/CS1_ ("+this.imgNum+").jpg"
        this.imgName.textContent = this.name;
        localStorage.setItem('current_img', this.name)

        this.texture = new THREE.TextureLoader().load(this.name)
        this.material = new THREE.MeshBasicMaterial( { map: this.texture } )
        this.mesh = new THREE.Mesh( this.geometry, this.material )
    }
    random( min, max ){
        return Math.random() * (max-min) + min;
    }
    initScene(imgNum,mesh,curMesh){
        var maxImgNum = 21;
        var path = "./pano/"
        var name = path+"CS1_ ("+imgNum+").jpg";
        var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
        geometry.scale( - 1, 1, 1 );
        var texture = new THREE.TextureLoader().load(name);
        var material = new THREE.MeshBasicMaterial( { map: texture } );
        mesh = new THREE.Mesh( geometry, material );
        curMesh = mesh;
        this.scene.add(mesh);
    }
    setupVR(){
        this.renderer.xr.enabled = true
        this.button_vr = VRButton.createButton(this.renderer)
        this.button_vr.addEventListener( 'selectstart', onSelectStart )
        document.body.appendChild(this.button_vr)
        // this.button_vr = document.getElementById('VRButton')
        this.button_vr.title = 'Click me -> Tới Trình Thực tế ảo VR'
        //EVENT
        function onSelectStart() {            
            this.userData.selectPressed = true        
        }
        function onSelectEnd() {            
            this.userData.selectPressed = false        
        }        
        //COLTROLLER
        const controllerModelFactory = new XRControllerModelFactory()
        // LEFT CONTROLER
        this.controller = this.renderer.xr.getController(0)
        this.controller.addEventListener('selectstart', onSelectStart)
        this.controller.addEventListener('selectend', onSelectEnd)
        this.controller.addEventListener('touchstart', onSelectStart)
        this.controller.addEventListener('touchend', onSelectEnd)   
        // this.scene.add(this.controller)
        this.controllerGrip = this.renderer.xr.getControllerGrip(0)
        this.controllerGrip.add(controllerModelFactory.createControllerModel(this.controllerGrip))
        this.scene.add(this.controllerGrip)
        // RIGHT CONTROLER
        this.controller1 = this.renderer.xr.getController(1)
        this.controller1.addEventListener('selectstart', onSelectStart)
        this.controller1.addEventListener('selectend', onSelectEnd)
        this.controller1.addEventListener('touchstart', onSelectStart)
        this.controller1.addEventListener('touchend', onSelectEnd)
        // this.scene.add(this.controller1)
        this.controllerGrip1 = this.renderer.xr.getControllerGrip(1)
        this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1))
        this.scene.add(this.controllerGrip1)     
    }
    handleController( controller, dt ){
        if (controller.userData.selectPressed ){     
            const wallLimit = 1.3 
            const speed = this.walkspeed
        }
    }    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    render() { 
        const dt = this.clock.getDelta();
        this.stats.update();
        // // this.dolly.position.set( 500, 1.6, 500 );
        //TRIG HANDLE CONTROLLER
        if (this.controller) this.handleController(this.controller, dt)
        if (this.controller1) this.handleController(this.controller1, dt)

        this.renderer.render( this.scene, this.camera );
    }
}

export { App };