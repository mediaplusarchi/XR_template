// basic VR mode
// declear import
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { Lensflare, LensflareElement } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/objects/Lensflare.js';
import { Reflector } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/objects/Reflector.js';
import { VRButton } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/webxr/VRButton.js';
// declear variables
let background, scene, camera, renderer ; // environment
let reflector;

init();
animate();

//  init = scene > camera > subjects > light > post-processing > renderer + VR 
function init() {
  // surrounds background   
  background = new THREE.CubeTextureLoader().setPath( 'https://threejs.org/examples/textures/cube/MilkyWay/' ).load( [ 'dark-s_px.jpg', 'dark-s_nx.jpg', 'dark-s_py.jpg', 'dark-s_ny.jpg', 'dark-s_pz.jpg', 'dark-s_nz.jpg' ] );

  // step1 = scene
  scene = new THREE.Scene();
  scene.background = background;
  // step2 = camera
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.set( 0, 1.6, 2 );
  
  // step3 = Subjects
  addSubjects();
  function addSubjects(){
    //   geometrys
    // geo1
    const torusGeometry = new THREE.TorusKnotBufferGeometry( 0.4, 0.15, 150, 20 );
    const torusMaterial = new THREE.MeshStandardMaterial( { roughness: 0.01, metalness: 0.2, envMap: background } );
    const torus = new THREE.Mesh( torusGeometry, torusMaterial );
    torus.position.y = 0.75;
    torus.position.z = - 2;
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add( torus );
    // geo2
    const boxGeometry = new THREE.BoxBufferGeometry( 1.5, 0.1, 1.5 );
    const boxMaterial = new THREE.MeshPhongMaterial();
    const box = new THREE.Mesh( boxGeometry, boxMaterial );
    box.position.y = - 0.2;
    box.position.z = - 2;
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add( box );  
    // mirror
    const reflector = new Reflector( 
      new THREE.PlaneBufferGeometry( 1.4, 1.4 ),
        { textureWidth: window.innerWidth * window.devicePixelRatio,
          textureHeight: window.innerHeight * window.devicePixelRatio
        });
    reflector.position.x = 1;
    reflector.position.y = 0.5;
    reflector.position.z = - 3;
    reflector.rotation.y = - Math.PI / 4;
    scene.add( reflector );
    //   frame of mirror 
    const frameGeometry = new THREE.BoxBufferGeometry( 1.5, 1.5, 0.1 );
    const frameMaterial = new THREE.MeshPhongMaterial();
    const frame = new THREE.Mesh( frameGeometry, frameMaterial );
    frame.position.z = - 0.07;
    frame.castShadow = true;
    frame.receiveShadow = true;
    reflector.add( frame );
    }
  
  // step4 = lights
  //   light 1
  const light1 = new THREE.DirectionalLight( 0x8800ff );
  light1.position.set( - 1, 1.5, - 1.5 );
  light1.castShadow = true;
  light1.shadow.camera.zoom = 4;
  scene.add( light1 );
  light1.target.position.set( 0, 0, - 2 );
  scene.add( light1.target );
  //   light 2
  const light2 = new THREE.DirectionalLight( 0xff0000 );
  light2.position.set( 1, 1.5, - 2.5 );
  light2.castShadow = true;
  light2.shadow.camera.zoom = 4;
  scene.add( light2 );
  light2.target.position.set( 0, 0, - 2 );
  scene.add( light2.target );
  
  // step5 = post processing lensflare, textures
  const loader = new THREE.TextureLoader();
  const texture0 = loader.load( "textures/lensflare/lensflare0.png" );
  const texture3 = loader.load( "textures/lensflare/lensflare3.png" );
  const lensflare = new Lensflare();
  lensflare.position.set( 0, 5, - 5 );
  lensflare.addElement( new LensflareElement( texture0, 700, 0 ) );
  lensflare.addElement( new LensflareElement( texture3, 60, 0.6 ) );
  lensflare.addElement( new LensflareElement( texture3, 70, 0.7 ) );
  lensflare.addElement( new LensflareElement( texture3, 120, 0.9 ) );
  lensflare.addElement( new LensflareElement( texture3, 70, 1 ) );
  scene.add( lensflare );
  
  // step6 = renender   
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.autoClear = false;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.xr.enabled = true;
  document.body.appendChild( renderer.domElement );
  // VR 
  document.body.appendChild( VRButton.createButton( renderer ) );
  window.addEventListener( 'resize', onWindowResize, false );
}

//  automatic resize
function onWindowResize() {
  // relative camera    
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  // relative renderer
  renderer.setSize( window.innerWidth, window.innerHeight );
}
//  update change loop in XR
function animate() {
  renderer.setAnimationLoop( render );
}
// render with performace.now()
function render() {
  const time = performance.now()*0.001;
  const torus = scene.children[ 0 ];
  torus.rotation.x = time * 2;
  torus.rotation.y = time * 5;
  renderer.render( scene, camera );
}