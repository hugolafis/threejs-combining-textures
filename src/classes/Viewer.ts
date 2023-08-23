import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const totalWidth = 512;
const totalHeight = 512;

export class Viewer {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private readonly scene = new THREE.Scene();

  private texture: THREE.DataTexture;
  private cubeTexture: THREE.CubeTexture;

  constructor(private readonly renderer: THREE.WebGLRenderer, private readonly canvas: HTMLCanvasElement) {
    this.initCamera();
    this.initControls();
    this.initLights();

    // Initialise the data texture
    // Assuming the final tex is a pow of 2
    const size = totalWidth * totalHeight;
    const data = new Uint8Array(4 * size); // RGBA
    data.fill(255); // white and full alpha

    this.texture = new THREE.DataTexture(data, totalWidth, totalHeight);
    this.texture.needsUpdate = true;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.flipY = true;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.BackSide })
    );

    this.scene.add(cube);

    this.loadTextures();
  }

  readonly update = (dt: number) => {
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  };

  readonly resize = () => {
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  };

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight);

    this.camera.position.set(0, 0, 1);

    this.scene.add(this.camera);
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.dampingFactor = 0.05;
    this.controls.enableDamping = true;

    this.controls.target.set(0, 0, 0);
  }

  private initLights() {
    const light = new THREE.DirectionalLight(undefined, 1.0);

    const lightPos = new THREE.Vector3(1, 0, 0).multiplyScalar(25);
    light.position.copy(lightPos);

    const helper = new THREE.DirectionalLightHelper(light);
    this.scene.add(light);
    //this.scene.add(helper);
  }

  private loadTextures() {
    const textureLoader = new THREE.TextureLoader();

    const requests = [
      {
        startPosition: { x: 0, y: 0 },
        url: './assets/0_0.png',
      },
      {
        startPosition: { x: 200, y: 0 },
        url: './assets/1_0.png',
      },
      {
        startPosition: { x: 400, y: 0 },
        url: './assets/2_0.png',
      },
      {
        startPosition: { x: 0, y: 200 },
        url: './assets/0_1.png',
      },
      {
        startPosition: { x: 200, y: 200 },
        url: './assets/1_1.png',
      },
      {
        startPosition: { x: 400, y: 200 },
        url: './assets/2_1.png',
      },
      {
        startPosition: { x: 0, y: 400 },
        url: './assets/0_2.png',
      },
      {
        startPosition: { x: 200, y: 400 },
        url: './assets/1_2.png',
      },
      {
        startPosition: { x: 400, y: 400 },
        url: './assets/2_2.png',
      },
    ];

    const position = new THREE.Vector2();

    // Load the tiles async
    requests.forEach(item => {
      textureLoader
        .loadAsync(item.url)
        .then(texture => {
          const height = texture.image.height;

          position.set(item.startPosition.x, convertYCoordinate(item.startPosition.y, height));
          this.renderer.copyTextureToTexture(position, texture, this.texture);
        })
        .catch(() => {
          console.error('failed to load chunk: ', item.url);
        });
    });
  }
}

function convertYCoordinate(y: number, height: number) {
  return totalHeight - (y + height);
}
