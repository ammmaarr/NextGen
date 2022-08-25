import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GltfLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { InteractionManager } from "three.interactive";
import * as dat from 'lil-gui'

// https://github.com/markuslerner/THREE.Interactive

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xffffff );

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, .5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(0, 1, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
// camera.rotation.z = 30
// camera.rotation.x = 60

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 10000)
camera.position.set(0, 30, 25)
camera.rotation.x = -Math.PI / 6;
scene.add(camera)


// importing blender model

let button = null;
const tempV = new THREE.Vector3();

// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 0.75, 0)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

let loading = true;

// renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const interactionManager = new InteractionManager(
    renderer,
    camera,
    renderer.domElement
  );

const loadingManager = new THREE.LoadingManager(() => {
    loading = false;

}) 

const zoomCamera = {
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    steps: 24,
}

let preZoomCamera = {
    x: 0,
    y: 0,
    z: 0,
    rotationX: 0
}

let zoomedOnObject = false;
let zoomingOut = false;

const zoomOut = (target) => {
    // camera.position.set(0, 30, 25)
    // camera.rotation.x = -Math.PI / 6;
    zoomedOnObject = false;
    zoomingOut = true;

    preZoomCamera.x = zoomCamera.positionX
    preZoomCamera.y = zoomCamera.positionY
    preZoomCamera.z = zoomCamera.positionZ
    preZoomCamera.rotationX = zoomCamera.rotationX

    zoomCamera.positionX = 0
    zoomCamera.positionY = 30
    zoomCamera.positionZ = 25
    zoomCamera.rotationX = -Math.PI / 6
}

document.querySelector(".zoom-out-button").addEventListener("click", (event) => {
    event.target.classList.remove("zoom-out-button-visible");
    zoomOut()
})

let clickedElement = null;

const GLTFloader = new GLTFLoader(loadingManager);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
GLTFloader.setDRACOLoader(dracoLoader);
GLTFloader.load('/models/NEX_V_Prototype1_Map.glb', (gltf) => {
    
    gltf.scene.children.forEach((child) => {
        interactionManager.add(child);
        child.addEventListener("mouseover", () => {
            document.querySelector("body").style.cursor = "pointer";
        });

        child.addEventListener("mouseout", () => {
            document.querySelector("body").style.cursor = "default";
        });

        child.addEventListener("click", (event) => {
            event.stopPropagation();    
            child.material = child.material.clone();
            child.material.wireframe = !child.material.wireframe;
            let tmp = camera.clone()
            var bb = new THREE.Box3()
            bb.setFromObject(child);
            let position = bb.getCenter(tmp.position)

            const tmpCam = camera.clone()
            preZoomCamera = tmpCam.position
            preZoomCamera.rotationX = tmpCam.rotation.x
            
            zoomCamera.positionX = position.x 
            zoomCamera.positionY = position.y + 10
            zoomCamera.positionZ = position.z + 25
            zoomCamera.rotationX = -Math.PI / 12

            zoomedOnObject = true;
            clickedElement = child;
            showModal = true;
            document.querySelector(".zoom-out-button").classList.add("zoom-out-button-visible");
        })
    });


    gltf.scene.scale.set(.5, .5, .5)
    renderer.outputEncoding = THREE.sRGBEncoding;
    scene.add(gltf.scene)

}, (xhr) => {
    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, (error) => {
    console.log('An error happened');
});

const sanityClient = require('@sanity/client')
const client = sanityClient({
  projectId: 'me2o9y1g',
  dataset: 'production',
  apiVersion: '2022-08-25', // use current UTC date - see "specifying API version"!
  token: 'sk8UH7T2Vl22iPd7YdFRealuVigaFYlYIpZFELPOO6kHb5BbzuuptPnUWAJRnWBfGTWFzmVemfvKJWW88nXTx8l3AJtgGWDzCEC7XH5SGMkIN7jELDjHZ0YSWSH5NIVGlbiUSboZWni07H3R6ZNkQ2E5c82hH7J5AAaBtMwLw5CZSSWKsdSB',
  useCdn: false, // `false` if you want to ensure fresh data
})



let showModal = false;
const modal = document.querySelector(".modal-container");

const createTopic = (topic, topicsContainer) => {
    const newTopic = document.createElement("div")
    newTopic.className = 'topic'

    const topicImage = document.createElement("img")
    topicImage.src = topic.img.url
    topicImage.className = "topic-image"
    
    const topicTitle = document.createElement("label");
    topicTitle.className = "topic-title"
    topicTitle.innerHTML = topic.title

    const topicBody = document.createElement("p")
    topicBody.className = "topic-text"
    topicBody.innerHTML = topic.body

    newTopic.appendChild(topicImage)
    newTopic.appendChild(topicTitle)
    newTopic.appendChild(topicBody)
    topicsContainer.appendChild(newTopic)

}

const createModule = (module, modulesContainer) => {
    const newModule = document.createElement("div")
    newModule.className = "module"

    const moduleImage = document.createElement("img")
    moduleImage.src = module.img.url
    moduleImage.className = "module-image"

    const moduleTitle = document.createElement("label")
    moduleTitle.className = "module-title"
    moduleTitle.innerHTML = module.title

    const moduleBody = document.createElement("p")
    moduleBody.className = "module-text"
    moduleBody.innerHTML = module.body

    newModule.appendChild(moduleImage)
    newModule.appendChild(moduleTitle)
    newModule.appendChild(moduleBody)

    modulesContainer.appendChild(newModule)
}

const createArticle = (article, articlesContainer) => {
    const newArticle = document.createElement("div")
    newArticle.className = "article"

    const articleImage = document.createElement("img")
    articleImage.src = article.img.url
    articleImage.className = "article-image"

    const articleTitle = document.createElement("label")
    articleTitle.className = "article-title"
    articleTitle.innerHTML = article.title

    const articleBody = document.createElement("p")
    articleBody.className = "article-text"
    articleBody.innerHTML = article.body

    newArticle.appendChild(articleImage)
    newArticle.appendChild(articleTitle)
    newArticle.appendChild(articleBody)

    articlesContainer.appendChild(newArticle)
}

const modalTitle = modal.querySelector(".modal-title h1");

const modalSubTitle = modal.querySelector(".modal-title h2");

const modalBody = modal.querySelector(".modal-title p");

const topicsContainer = modal.querySelector('.topics');

const modulesContainer = modal.querySelector('.modules');

const articlesContainer = modal.querySelector('.articles')


const displayModal = (child) => {
    const query = '*[_type == "mapElement" && elementName == $elementName] { title, subtitle, body, topics[]->{"img": cover.asset->, title, body}, articles[]->{"img": cover.asset->, title, body}, modules[]->{"img": cover.asset->, title, body} }'
    const params = {elementName: child.name}

    client.fetch(query, params).then((elements) => {
        if (elements.length < 1) {
            return;
        }
        
        elements.forEach((element) => {
            modalTitle.innerHTML = element.title
            modalSubTitle.innerHTML = element.subtitle
            modalBody.innerHTML = element.body
            element.topics.forEach((topic) => {
                createTopic(topic, topicsContainer)
            })
            element.modules.forEach((module) => {
                createModule(module, modulesContainer)
            })
            element.articles.forEach((article) => {
                createArticle(article, articlesContainer)
            })
        })
        modal.classList.add("visible");
    })
}

const removeModalContent = () => {
    while (topicsContainer.lastElementChild) {
        topicsContainer.removeChild(topicsContainer.lastElementChild);
    }
    while (modulesContainer.lastElementChild) {
        modulesContainer.removeChild(modulesContainer.lastElementChild);
    }
    while (articlesContainer.lastElementChild) {
        articlesContainer.removeChild(articlesContainer.lastElementChild);
    }
    
    modalTitle.innerHTML = ''
    modalSubTitle.innerHTML = ''
    modalBody.innerHTML = ''
}

modal.addEventListener("click", (event) => {
    if (event.target.className.includes("modal-container")) {
        modal.classList.remove("visible");
        removeModalContent()
    }
})

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

document.addEventListener( 'mousemove', onDocumentMouseMove, false ); 

const cursor = {
    x: 0,
    y: 0
}

const cameraRotation = {
    x: 0,
    y: 0,
    z: 0
}

const cameraSettings = {
    cameraMoveFactor: 0.5,
    cameraRotationFactor: 0.01,
    xBound: 40,
    yBoundUp: -40,
    yBoundDown: 80,
    startToScrollAt: 0.4,
} 

function onDocumentMouseMove( event ) {
    if (event.target.className !== "webgl") {
        cursor.x = 0;
        cursor.y = 0;
        return;
    }

    // console.log(event.clientX - 500);
    const x = event.clientX / sizes.width - 0.5
    const y = event.clientY / sizes.height - 0.5

    if (x < -cameraSettings.startToScrollAt && camera.position.x >= -cameraSettings.xBound) {
        cursor.x = x;
    }
    else if (x > cameraSettings.startToScrollAt && camera.position.x <= cameraSettings.xBound) {
        cursor.x = x;
    }
    else {
        cursor.x = 0;
    }

    if (y < -cameraSettings.startToScrollAt && camera.position.z <= cameraSettings.yBoundDown) {
        cursor.y = y;
    }
    else if (y > cameraSettings.startToScrollAt && camera.position.z >= cameraSettings.yBoundUp) {
        cursor.y = y;
    }
    else {
        cursor.y = 0;
    }
    // camera.rotation.x = event.clientX;
}

// gui.hide()

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.rotation, 'x', -Math.PI, Math.PI).name("rotation x").step(Math.PI / 24).listen()
cameraFolder.add(camera.rotation, 'y', -Math.PI, Math.PI).name("rotation y").step(Math.PI / 24).listen()
cameraFolder.add(camera.rotation, 'z', -Math.PI, Math.PI).name("rotation z").step(Math.PI / 24).listen()
cameraFolder.add(camera.position, 'x', -100, 100).name("position x").listen()
cameraFolder.add(camera.position, 'y', 0, 100).name("position y").listen()
cameraFolder.add(camera.position, 'z', 0, 100).name("position z").listen()
cameraFolder.add(cameraSettings, 'cameraMoveFactor', 0, 10).name("Move Factor").step(0.1);
cameraFolder.add(cameraSettings, 'cameraRotationFactor', 0, 0.1).name("Rotation Factor").step(0.001);
cameraFolder.add(cameraSettings, 'xBound', 0, 100).name("X Axis Bounds").step(10);
cameraFolder.add(cameraSettings, 'yBoundUp', -100, 0).name("Upwwards Bound").step(10);
cameraFolder.add(cameraSettings, 'yBoundDown', 0, 100).name("Downwards Bound").step(10);
cameraFolder.add(cameraSettings, 'startToScrollAt', 0, 0.55).name("Start To Scroll At").step(.05);
cameraFolder.add(zoomCamera, 'steps', 0, 500).name("Steps to zoom").step(5);


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    // controls.update()
    interactionManager.update();


    // Update camera
    if (!zoomedOnObject && !zoomingOut){
        if (camera.position.x <= cameraSettings.xBound && camera.position.x >= -cameraSettings.xBound) {
            let adjustedRotation = false
            let tmpCameraX = camera.position.x + (cameraSettings.cameraMoveFactor * cursor.x);
            if (tmpCameraX > cameraSettings.xBound) {
                tmpCameraX = cameraSettings.xBound;
                cameraRotation.y = Math.PI / 6
                cameraRotation.z = Math.PI / 12
                adjustedRotation = true
            }
            else if (tmpCameraX < -cameraSettings.xBound) {
                tmpCameraX = -cameraSettings.xBound
                cameraRotation.y = -Math.PI / 6
                cameraRotation.z = -Math.PI / 12
                adjustedRotation = true
            }
            camera.position.x = tmpCameraX
            if (!adjustedRotation) {
                cameraRotation.y = 0
                cameraRotation.z = 0
            } 
        }

        if (cameraRotation.y !== 0) {
            if (camera.rotation.y > cameraRotation.y - cameraSettings.cameraRotationFactor && camera.rotation.y < cameraRotation.y + cameraSettings.cameraRotationFactor) {
                camera.rotation.y = cameraRotation.y
            }
            else if (camera.rotation.y < cameraRotation.y) {
                camera.rotation.y += cameraSettings.cameraRotationFactor
            }
            else {
                camera.rotation.y -= cameraSettings.cameraRotationFactor
            }
        }
        else {
            if (camera.rotation.y > -cameraSettings.cameraRotationFactor && camera.rotation.y < cameraSettings.cameraRotationFactor) {
                camera.rotation.y = 0
            }
            else if (camera.rotation.y > 0) {
                camera.rotation.y -= cameraSettings.cameraRotationFactor
            }
            else {
                camera.rotation.y += cameraSettings.cameraRotationFactor
            }
        }
        
        if (cameraRotation.z !== 0) {
            if (camera.rotation.z > cameraRotation.z - cameraSettings.cameraRotationFactor && camera.rotation.z < cameraRotation.z + cameraSettings.cameraRotationFactor) {
                camera.rotation.z = cameraRotation.z
            }
            else if (camera.rotation.z < cameraRotation.z) {
                camera.rotation.z += cameraSettings.cameraRotationFactor / 2
            }
            else {
                camera.rotation.z -= cameraSettings.cameraRotationFactor / 2
            }
        }
        else {
            if (camera.rotation.z > -cameraSettings.cameraRotationFactor && camera.rotation.z < cameraSettings.cameraRotationFactor) {
                camera.rotation.z = 0
            }
            else if (camera.rotation.z > 0) {
                camera.rotation.z -= cameraSettings.cameraRotationFactor / 2
            }
            else {
                camera.rotation.z += cameraSettings.cameraRotationFactor / 2
            }
        }

        if (camera.position.z >= cameraSettings.yBoundUp && camera.position.z <= cameraSettings.yBoundDown) {
            // console.log("1camera " + camera.position.z + ", yboundup " + cameraSettings.yBoundUp + ", ybounddown " + cameraSettings.yBoundDown);

            let tmpCameraZ = camera.position.z + (cameraSettings.cameraMoveFactor * cursor.y);
            if (tmpCameraZ < cameraSettings.yBoundUp) {
                tmpCameraZ = cameraSettings.yBoundUp;
            }
            else if (tmpCameraZ > cameraSettings.yBoundDown) {
                tmpCameraZ = cameraSettings.yBoundDown
            }
            camera.position.z = tmpCameraZ 
        }
    }
    // If zoomed in
    else {
        const xStep = Math.abs((zoomCamera.positionX - preZoomCamera.x) / zoomCamera.steps)
        const yStep = Math.abs((zoomCamera.positionY - preZoomCamera.y) / zoomCamera.steps)
        const zStep = Math.abs((zoomCamera.positionZ - preZoomCamera.z) / zoomCamera.steps)
        const rotationStep = Math.abs((zoomCamera.rotationX - preZoomCamera.rotationX) / zoomCamera.steps)

        if (zoomCamera.positionX > camera.position.x) {
            
            let newPositionX = camera.position.x + xStep
            if (newPositionX > zoomCamera.positionX) {
                newPositionX = zoomCamera.positionX
            }
            camera.position.x = newPositionX
        }
        else if (zoomCamera.positionX < camera.position.x) {
            let newPositionX = camera.position.x - xStep
            if (newPositionX < zoomCamera.positionX) {
                newPositionX = zoomCamera.positionX
            }
            camera.position.x = newPositionX
        }

        if (zoomCamera.positionZ > camera.position.z) {
            let newPositionZ = camera.position.z + zStep
            if (newPositionZ > zoomCamera.positionZ) {
                newPositionZ = zoomCamera.positionZ
            }
            camera.position.z = newPositionZ
        }
        else if (zoomCamera.positionZ < camera.position.z) {
            let newPositionZ = camera.position.z - zStep
            if (newPositionZ < zoomCamera.positionZ) {
                newPositionZ = zoomCamera.positionZ
            }
            camera.position.z = newPositionZ
        }

        if (zoomCamera.positionY > camera.position.y) {
            let newPositionY = camera.position.y + yStep
            if (newPositionY > zoomCamera.positionY) {
                newPositionY = zoomCamera.positionY
            }
            camera.position.y = newPositionY
        }
        else if (zoomCamera.positionY < camera.position.y) {
            let newPositionY = camera.position.y - yStep
            if (newPositionY < zoomCamera.positionY) {
                newPositionY = zoomCamera.positionY
            }
            camera.position.y = newPositionY
        }

        if (zoomCamera.rotationX > camera.rotation.x) {
            let newRotationX = camera.rotation.x + rotationStep
            if (newRotationX > zoomCamera.rotationX) {
                newRotationX = zoomCamera.rotationX
            }
            camera.rotation.x = newRotationX
        }
        else if (zoomCamera.rotationX < camera.rotation.x) {
            let newRotationX = camera.rotation.x - rotationStep
            if (newRotationX < zoomCamera.rotationX) {
                newRotationX = zoomCamera.rotationX
            }
            camera.rotation.x = newRotationX
        }

        if (
            zoomCamera.positionX === camera.position.x &&
            zoomCamera.positionY === camera.position.y &&
            zoomCamera.positionZ === camera.position.z &&
            zoomCamera.rotationX === camera.rotation.x) {
                if (clickedElement !== null && showModal) {
                    displayModal(clickedElement);
                    showModal = false;
                }
                zoomingOut = false;
            }
    }

    if (loading === true) {
        // console.log(document.querySelector(".loading-container"));
        setTimeout(() => {
            document.querySelector(".loading-container").classList.remove("visible-loading");
        }, 500);
        loading = false;
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()