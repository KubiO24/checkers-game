class Game {
    constructor() {
        this.color = 'none';
        this.selectedPawn = 'none';
        this.clickedField = "none";
        this.fieldSize = 32;
        this.pawnRadius = this.fieldSize / 3;
        this.tableSize = {length: 450, width: 30, height: 10}

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
        this.pawnsTab = [
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
        
        this.generateTable(this.tableSize.length, this.tableSize.width, this.tableSize.height); // length, width, height
        this.render()
    }

    generateTable = (length, width, height) => {
        this.table = new THREE.Object3D();

        const insideGeometry = new THREE.BoxGeometry( length-(2*width), height, length-(2*width) );
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
        tableInside.position.set(0, 1, 0);
        
        this.table.add(tableInside)

        const outsideGeometry = new THREE.BoxGeometry( length, 10, length );
        const outsideMaterial = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('materials/tableBorder.jpg', function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = length / 40;
                texture.repeat.y = length / 40;
            }),
        } );

        const tableOutside = new THREE.Mesh( outsideGeometry, outsideMaterial );

        this.table.add(tableOutside)

        this.scene.add(this.table)
    }

    setColor = (color) => {
        this.color = color;

        if (this.color == "white") {
            this.moveCamera(-350, 250, 0);
        } else if (this.color == "black") {
            this.moveCamera(350, 250, 0);
        } else {
            this.moveCamera(0, 300, 0);
        }
    }

    moveCamera = (x, y, z) => {
        new TWEEN.Tween(this.camera.position) // co
            .to({ x: x, y: y, z: z }, 1500) // do jakiej pozycji, w jakim czasie
            .easing(TWEEN.Easing.Cubic.In) // typ easingu (zmiana w czasie)
            .onUpdate(() => { this.camera.lookAt(this.scene.position); })
            .onComplete(() => { this.generateBoard() }) // funkcja po zakończeniu animacji
            .start()
    }

    generateBoard = () => {
        this.board = new THREE.Object3D();
        this.boardInside = new THREE.Object3D();

        let field;
        const boardInsideWidth = (this.checkboard.length - 1) * this.fieldSize;
        this.boardWidth = boardInsideWidth + 2 * this.fieldSize;

        for (let i = 0; i < this.checkboard.length; i++) {
            for (let j = 0; j < this.checkboard[0].length; j++) {

                if (this.checkboard[i][j] == 0) {
                    field = new Field("white", this.fieldSize);
                    field.info = { 'x': i, 'z': j }
                } else {
                    field = new Field("black", this.fieldSize);
                    field.info = { 'x': i, 'z': j }
                }

                this.boardInside.add(field)
                field.position.set((i * this.fieldSize) - 1 / 2 * boardInsideWidth, 0, (j * this.fieldSize) - 1 / 2 * boardInsideWidth);
            }
        }
        this.board.add(this.boardInside);

        const geometry = new THREE.BoxGeometry( this.boardWidth, 9, this.boardWidth );
        const material = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('materials/field.jpg', function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = boardInsideWidth / 40;
                texture.repeat.y = boardInsideWidth / 40;
            }),
            color:"#4d2600"
        } );

        const boardOutside = new THREE.Mesh( geometry, material );
        this.board.add(boardOutside)

        this.scene.add(this.board);
        this.board.position.set(0, 300 ,0)

        new TWEEN.Tween(this.board.position) // co
            .to({ x: 0, y: 10, z: 0 }, 1500) // do jakiej pozycji, w jakim czasie
            .easing(TWEEN.Easing.Bounce.Out) // typ easingu (zmiana w czasie)
            .onComplete(() => { this.generatePawns() }) // funkcja po zakończeniu animacji
            .start()
    }

    generatePawns = async() => {
        this.pawns = new THREE.Object3D();
        this.scene.add(this.pawns);
        let pawn;
        for (let i = 0; i < this.pawnsTab.length; i++) {
            for (let j = 0; j < this.pawnsTab[0].length; j++) {

                if (this.pawnsTab[i][j] == 1) {
                    pawn = new Pawn("white", this.pawnRadius);
                    pawn.info = { 'x': i, 'z': j }
                } else if (this.pawnsTab[i][j] == 2) {
                    pawn = new Pawn("black", this.pawnRadius);
                    pawn.info = { 'x': i, 'z': j }
                    pawn.rotation.x = Math.PI;
                } else {
                    continue;
                }
                const field = this.boardInside.children.find(field => field.info.x == pawn.info.x && field.info.z == pawn.info.z);
                pawn.position.set(field.position.x, 300, field.position.z);
                this.pawns.add(pawn)
                new TWEEN.Tween(pawn.position) // co
                    .to({ y: 20 }, 1500) // do jakiej pozycji, w jakim czasie
                    .easing(TWEEN.Easing.Bounce.Out) // typ easingu (zmiana w czasie)
                    // .onComplete(() => { }) // funkcja po zakończeniu animacji
                    .start()
                await this.sleep(100);
            }
        }

        if (this.color == 'black') {
            // ui.darkOverlay.style.display = "block";
            // net.startWaitingForMove();
            // this.currentTurn = false;
        } else {
            // this.currentTurn = true;
        }
    }

    sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
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
