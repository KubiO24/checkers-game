class Game {
    constructor() {
        this.color = 'none';
        this.selectedPawn = 'none';
        this.clickedField = "none";
        this.fieldSize = 22;
        this.pawnRadius = 8;
        // white - 0 | black - 2
        this.checkboard = [
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1]
        ];

        // white - 1 | black - 2 | empty field - 0
        this.pawns = [
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2]
        ];
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor("#66bfff");  
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);
        
        this.scene = new THREE.Scene();

        const loader = new THREE.TextureLoader();
        const bgTexture = loader.load('./materials/skybox.jpg');
        this.scene.background = bgTexture;

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 200, 0)
        this.camera.lookAt(this.scene.position);

        this.axes = new THREE.AxesHelper(1000)
        window.addEventListener('resize', this.onWindowResize, false);
        this.scene.add(this.axes);
        
        this.generateTable(450, 30, 10); // length, width, height
        this.render()
    }

    generateTable = (length, width, height) => {
        this.table = new THREE.Object3D();

        const insideGeometry = new THREE.BoxGeometry( length-width, height-1, length-width );
        const insideMaterial = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('materials/table.jpg', function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = length / 50;
                texture.repeat.y = length / 50;
            })
        } );

        const tableInside = new THREE.Mesh( insideGeometry, insideMaterial );
        tableInside.position.set(0, 0, 0);
        
        this.table.add(tableInside)

        const tableOutside = new THREE.Object3D();

        const outsideGeometry = new THREE.BoxGeometry( length, height, width );
        const outsideMaterial = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('materials/tableBorder.jpg', function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = length / 40;
                texture.repeat.y = width / 40;
            }),
        } );

        let firstSide = new THREE.Mesh( outsideGeometry, outsideMaterial );
        firstSide.position.set(0, 0, (-length/2) + (width/2));
        tableOutside.add( firstSide );

        let secondSide = new THREE.Mesh( outsideGeometry, outsideMaterial );
        secondSide.position.set((-length/2) + (width/2), 0, 0)
        secondSide.rotation.y = Math.PI / 2;
        tableOutside.add( secondSide );

        let thirdSide = new THREE.Mesh( outsideGeometry, outsideMaterial );
        thirdSide.position.set(0, 0, (length/2) - (width/2))
        tableOutside.add( thirdSide );

        let fourthSide = new THREE.Mesh( outsideGeometry, outsideMaterial );
        fourthSide.position.set((length/2) - (width/2), 0, 0)
        fourthSide.rotation.y = Math.PI / 2;
        tableOutside.add( fourthSide );

        this.table.add(tableOutside)

        this.scene.add(this.table)
    }

    setColor = (color) => {
        this.color = color;

        if (this.color == "white") {
            this.moveCamera(-350, 200, 0);
        } else if (this.color == "black") {
            this.moveCamera(350, 200, 0);
        } else {
            this.moveCamera(0, 300, 0);
        }
    }

    moveCamera = (x, y, z) => {
        new TWEEN.Tween(this.camera.position) // co
            .to({ x: x, y: y, z: z }, 1500) // do jakiej pozycji, w jakim czasie
            .easing(TWEEN.Easing.Cubic.In) // typ easingu (zmiana w czasie)
            .onUpdate(() => { this.camera.lookAt(this.scene.position); })
            .onComplete(() => { console.log("koniec animacji") }) // funkcja po zakończeniu animacji
            .start()
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render = () => {
        TWEEN.update();
        this.camera.updateProjectionMatrix();


        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
    }

}
