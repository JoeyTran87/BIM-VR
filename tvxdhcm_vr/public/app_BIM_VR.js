import * as THREE from './libs/three/three.module.js';
import { VRButton } from './libs/three/jsm/VRButton.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';
import { BoxLineGeometry } from './libs/three/jsm/BoxLineGeometry.js';
import { Stats } from './libs/stats.module.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js';
import { ColladaLoader } from './libs/three/loaders/ColladaLoader.js';
import{GUI} from 'https://threejsfundamentals.org/3rdparty/dat.gui.module.js';

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min;  // this will call the min setter
    }
  }

   
class App {
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    update_cam_pos(){
        localStorage.setItem('cam_pos_x',this.camera.position.x)
        localStorage.setItem('cam_pos_y',this.camera.position.y)
        localStorage.setItem('cam_pos_z',this.camera.position.z)
    }
    update_dolly(){
        this.polly.position.set(localStorage.getItem('cam_pos_x'),localStorage.getItem('cam_pos_y'),localStorage.getItem('cam_pos_z'))
    }
    update_cam() {
        this.camera.updateProjectionMatrix();
      }
    constructor() {
        //SCENE        
        this.scene_manager()        
        
        this.walkspeed = 3
        
        //container
        this.container = document.createElement('vrdiv')
        document.body.appendChild(this.container)
        
        this.clock = new THREE.Clock()
        //camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000)
        var posX = 30
        var posY = 1
        var posZ = 90        
        this.camera.position.set(posX, posY, posZ)
        this.update_cam_pos()  
        console.log(this.camera.position)  
        {//GUI
            this.gui = new GUI();
            this.gui.add(this.camera, 'fov', 1, 180).onChange(this.camera)
        }

        {//LIGHT
            const light0 = new THREE.HemisphereLight(0xffffff, 0x404040)
            light0.intensity = 0.5
            this.scene.add(light0)
            const light = new THREE.DirectionalLight(0xffffff)
            light.position.set(1, 1, 1).normalize()
            light.intensity = 0.5
            this.scene.add(light)
        }

        //renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.container.appendChild(this.renderer.domElement)
        //controller
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.target.set(0, 5, 0)
        this.controls.update()
        this.stats = new Stats()
        //raycaster
        this.raycaster = new THREE.Raycaster()
        this.workingMatrix = new THREE.Matrix4()
        this.workingVector = new THREE.Vector3()
        this.origin = new THREE.Vector3()
        //execute
        this.setupVR()
        //event
        window.addEventListener('resize', this.resize.bind(this))
        // this.dolly.position.set(posX, posY, posZ)
        //animation
        this.renderer.setAnimationLoop(this.render.bind(this))
    }
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    scene_manager(){
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xffffff);
        //fog
        this.scene.fog = new THREE.Fog(0xa0a0a0, 50, 2000);
                
        // ground
        // const ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        // ground.rotation.x = - Math.PI / 2;
        // this.scene.add( ground );
        // var grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
        // grid.material.opacity = 0.2;
        // grid.material.transparent = true;
        // this.scene.add( grid );        
        // const geometry = new THREE.BoxGeometry(5, 5, 5);
        // const material = new THREE.MeshPhongMaterial({ color:0xAAAA22 });
        // const edges = new THREE.EdgesGeometry( geometry );
        // const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } ) );
        this.colliders = [];
        // for (let x=-100; x<100; x+=10){
        //     for (let z=-100; z<100; z+=10){
        //         if (x==0 && z==0) continue;
        //         const box = new THREE.Mesh(geometry, material);
        //         box.position.set(x, 2.5, z);
        //         const edge = line.clone();
        //         edge.position.copy( box.position );
        //         this.scene.add(box);
        //         this.scene.add(edge);
        //         this.colliders.push(box);
        //     }
        // }        
        //LOAD GLTF REVIT MODEL
        this.loadGltf();
    }
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    loadGltf() {
        const gltfLoader = new GLTFLoader();
        var link100 = [
            './glTF/KHOI NHA CHINH/FLOOR/TCXD-DD-ARC-KHOI NHA CHINH-MAIN MODEL.gltf',
            './glTF/KHOI NHA CHINH/DW/TCXD-DD-ARC-KHOI NHA CHINH-MAIN MODEL.gltf',
            './glTF/KHOI NHA CHINH/CEILING/TCXD-DD-ARC-KHOI NHA CHINH-MAIN MODEL.gltf',
            './glTF/KHOI NHA CHINH/ENT FINISH/TCXD-DD-ARC-KHOI NHA CHINH-MAIN MODEL.gltf',
            './glTF/KHOI NHA CHINH/STAIR RAMP RAILING/TCXD-DD-ARC-KHOI NHA CHINH-MAIN MODEL.gltf',
            './glTF/KHOI NHA CHINH/WALL/TCXD-DD-ARC-KHOI NHA CHINH-MAIN MODEL.gltf',
            './glTF/KHOI NHA CHINH/GEN HOA GIO/TCXD-DD-ARC-KHOI NHA CHINH-MAIN MODEL.gltf',
            './glTF/KHOI NHA KTX/TCXD-DD-ARC-KHOI KY TUC XA-MAIN MODEL.gltf',
            './glTF/KHOI NHA KTX/GEN/TCXD-DD-ARC-KHOI KY TUC XA-MAIN MODEL.gltf'
        ];
        var link200 = [
            './glTF/KHOI NHA CHINH KET CAU/FOUNDATION/TCXD-DD-STR-KHOI NHA CHINH-CONCRETE MODEL.gltf',
            './glTF/KHOI NHA CHINH KET CAU/COLUMN/TCXD-DD-STR-KHOI NHA CHINH-CONCRETE MODEL.gltf',
            './glTF/KHOI NHA CHINH KET CAU/FRAMING/TCXD-DD-STR-KHOI NHA CHINH-CONCRETE MODEL.gltf',
            './glTF/KHOI NHA CHINH KET CAU/FLOOR/TCXD-DD-STR-KHOI NHA CHINH-CONCRETE MODEL.gltf',
            './glTF/KHOI NHA KTX/KET CAU/TCXD-DD-STR-KHOI KY TUC XA-CONCRETE MODEL.gltf'
        ];
        var link300 = [
            './glTF/CANH QUAN/WALL/TCXD-DD-ARC-LANDSCAPE&CIVIL.gltf',
            './glTF/CANH QUAN/FLOOR/TCXD-DD-ARC-LANDSCAPE&CIVIL.gltf',
            './glTF/CANH QUAN/GEN/TCXD-DD-ARC-LANDSCAPE&CIVIL.gltf',
            './glTF/CANH QUAN/COLUMN FRAMING/TCXD-DD-ARC-LANDSCAPE&CIVIL.gltf',
        ];
        for (var lk in link100) {
            try {
                gltfLoader.load(link100[lk], (gltf) => {
                    const root = gltf.scene;
                    this.scene.add(root);
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        for (var lk in link200) {
            try {
                gltfLoader.load(link200[lk], (gltf) => {
                    const root = gltf.scene;
                    this.scene.add(root);
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        for (var lk3 in link300) {
            try {
                gltfLoader.load(link300[lk3], (gltf) => {
                    const root = gltf.scene;
                    this.scene.add(root);
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        // const DAELoader = new ColladaLoader();
        // var linkdae = [
        //     './glTF/CANH QUAN/GATE/TCXD-DD-ARC-LANDSCAPE&CIVIL.dae'
        // ];
        // for (var lk in linkdae){
        //     try
        //     {
        //         DAELoader.load(linkdae[lk], (dae) => {
        //             const daeroot = dae.scene;
        //             this.scene.add(daeroot);  
        //             });
        //     }
        //     catch(err){
        //         console.log(err);
        //     }            
        // }
        // gltfLoader.load(link102, (gltf) => {
        // const root = gltf.scene;
        // this.scene.add(root);    
        // });
        // compute the box that contains all the stuff
        // from root and below
        //   const box = new THREE.Box3().setFromObject(root);    
        //   const boxSize = box.getSize(new THREE.Vector3()).length();
        //   const boxCenter = box.getCenter(new THREE.Vector3());    
        // set the camera to frame the box
        //   frameArea(boxSize * 0.5, boxSize, boxCenter, camera);    
        // update the Trackball controls to handle the new size
        //   controls.maxDistance = boxSize * 10;
        //   controls.target.copy(boxCenter);
        //   controls.update();        
    }
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    setupVR() {
        this.renderer.xr.enabled = true
        this.vrbutton = VRButton.createButton(this.renderer)
        this.vrbutton.addEventListener('selectstart', onSelectStart_button)
        this.vrbutton.title = 'Click me -> Tới Trình Thực tế ảo VR'
        document.body.appendChild(this.vrbutton)        
        // FUNCTION EVENT
        function onSelectStart_button() {
            this.userData.selectPressed = true             
        }
        function onSelectStart() {
            this.userData.selectPressed = true
        }
        function onSelectEnd() {
            this.userData.selectPressed = false;
        }

        //COLTROLLER
        const controllerModelFactory = new XRControllerModelFactory()
        // LEFT CONTROLER
        this.controller = this.renderer.xr.getController(0)
        this.controller.addEventListener('selectstart', onSelectStart)
        this.controller.addEventListener('selectend', onSelectEnd)
        this.controller.addEventListener('touchstart', onSelectStart)
        this.controller.addEventListener('touchend', onSelectEnd)   
        this.scene.add(this.controller)
        this.controllerGrip = this.renderer.xr.getControllerGrip(0)
        this.controllerGrip.add(controllerModelFactory.createControllerModel(this.controllerGrip))
        this.scene.add(this.controllerGrip)

        // this.controller.addEventListener('connected', function (event) {
        //     const mesh = self.buildController.call(self, event.data)
        //     mesh.scale.z = 0
        //     this.add(mesh)
        // })
        // this.controller.addEventListener('disconnected', function () {
        //     this.remove(this.children[0])
        //     self.controller = null
        //     self.controllerGrip = null
        // }) 

        // RIGHT CONTROLER
        this.controller1 = this.renderer.xr.getController(1)
        this.controller1.addEventListener('selectstart', onSelectStart)
        this.controller1.addEventListener('selectend', onSelectEnd)
        this.controller1.addEventListener('touchstart', onSelectStart)
        this.controller1.addEventListener('touchend', onSelectEnd)
        this.scene.add(this.controller1)
        this.controllerGrip1 = this.renderer.xr.getControllerGrip(1)
        this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1))
        this.scene.add(this.controllerGrip1)              
        
        
        console.log(this.camera.position)
        // this.cameravr = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000)
        this.dolly = new THREE.Object3D()   
        this.dummyCam = new THREE.Object3D()
        // this.update_dolly()
        this.dolly.add(this.camera)
        console.log(this.camera.position)
        this.scene.add(this.dolly)
        console.log(this.camera.position)
        this.camera.add(this.dummyCam)
        // this.dolly.position.set( 0, 0, 0 )
        // this.dolly.position.set( 500, 1.6, 500 )        
        this.scene.fog = new THREE.Fog(0xa0a0a0, 50, 2000)
    }
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    buildController(data) {
        let geometry, material
        switch (data.targetRayMode) {
            case 'tracked-pointer':
                geometry = new THREE.BufferGeometry()
                geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3))
                geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))
                material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending })
                return new THREE.Line(geometry, material)
            case 'gaze':
                geometry = new THREE.RingBufferGeometry(0.02, 0.04, 32).translate(0, 0, - 1)
                material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true })
                return new THREE.Mesh(geometry, material)
        }
    }
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    /*
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------------------------------//
    */
    render() {
        const dt = this.clock.getDelta()
        this.stats.update()
        this.camera.updateProjectionMatrix()
        this.update_cam_pos()
        
        if (this.controller) this.handleController_L(this.controller, dt)
        if (this.controller1) this.handleController_R(this.controller1, dt)
        this.renderer.render(this.scene, this.camera)

        // console.log(this.camera.type)
        // console.log(this.camera.position)
        // console.log(this.controls.target)
        // console.log(this.dolly.position)
        // console.log(this.camera.position)
    }


    //-------------------------------------------------------------------------//
    //-------------------------------------------------------------------------//
    //-------------------------------------------------------------------------//

    handleController_L(controller, dt) {
        if (controller.userData.selectPressed) {
            console.log(this.camera.position)
            const wallLimit = 1.3            
            //walk speed
            const speed = this.walkspeed
            let pos = this.dolly.position.clone()
            pos.y += 1
            let dir = new THREE.Vector3();
            //Store original dolly rotation
            const quaternion = this.dolly.quaternion.clone()
            //Get rotation for movement from the headset pose
            this.dolly.quaternion.copy(this.dummyCam.getWorldQuaternion())
            this.dolly.getWorldDirection(dir)
            dir.negate()
            this.raycaster.set(pos, dir)
            let blocked = false
            let intersect = this.raycaster.intersectObjects(this.colliders)
            if (intersect.length > 0) {
                if (intersect[0].distance < wallLimit) blocked = true
            }
            if (!blocked) {
                this.dolly.translateZ(-dt * speed);
                pos = this.dolly.getWorldPosition(this.origin)
            }
            //cast left
            dir.set(-1, 0, 0)
            dir.applyMatrix4(this.dolly.matrix)
            dir.normalize()
            this.raycaster.set(pos, dir)
            intersect = this.raycaster.intersectObjects(this.colliders)
            if (intersect.length > 0) {
                if (intersect[0].distance < wallLimit) this.dolly.translateX(wallLimit - intersect[0].distance)
            }
            //cast right
            dir.set(1, 0, 0);
            dir.applyMatrix4(this.dolly.matrix);
            dir.normalize();
            this.raycaster.set(pos, dir)
            intersect = this.raycaster.intersectObjects(this.colliders)
            if (intersect.length > 0) {
                if (intersect[0].distance < wallLimit) this.dolly.translateX(intersect[0].distance - wallLimit)
            }
            this.dolly.position.y = 0
            //Restore the original rotation
            this.dolly.quaternion.copy(quaternion)
        }
        // if (controller.userData.selectPressed){
        //     pass
        // }
    }
//-------------------------------------------------------------------------//
    handleController_R(controller, dt) {
        if (controller.userData.selectPressed) {
            const wallLimit = 1.3
            //walk speed
            const speed = this.walkspeed
            let pos = this.dolly.position.clone()
            pos.y += 1
            let dir = new THREE.Vector3();
            //Store original dolly rotation
            const quaternion = this.dolly.quaternion.clone()
            //Get rotation for movement from the headset pose
            this.dolly.quaternion.copy(this.dummyCam.getWorldQuaternion())
            this.dolly.getWorldDirection(dir)
            dir.negate()
            this.raycaster.set(pos, dir)
            let blocked = false
            let intersect = this.raycaster.intersectObjects(this.colliders)
            if (intersect.length > 0) {
                if (intersect[0].distance < wallLimit) blocked = true
            }
            if (!blocked) {
                this.dolly.translateZ(-dt * speed);
                pos = this.dolly.getWorldPosition(this.origin)
            }
            //cast left
            dir.set(-1, 0, 0)
            dir.applyMatrix4(this.dolly.matrix)
            dir.normalize()
            this.raycaster.set(pos, dir)
            intersect = this.raycaster.intersectObjects(this.colliders)
            if (intersect.length > 0) {
                if (intersect[0].distance < wallLimit) this.dolly.translateX(wallLimit - intersect[0].distance)
            }
            //cast right
            dir.set(1, 0, 0);
            dir.applyMatrix4(this.dolly.matrix);
            dir.normalize();
            this.raycaster.set(pos, dir)
            intersect = this.raycaster.intersectObjects(this.colliders)
            if (intersect.length > 0) {
                if (intersect[0].distance < wallLimit) this.dolly.translateX(intersect[0].distance - wallLimit)
            }
            this.dolly.position.y = 0
            //Restore the original rotation
            this.dolly.quaternion.copy(quaternion)
        }
        // if (controller.userData.selectPressed){
        //     pass
        // }
    }
}

export { App };