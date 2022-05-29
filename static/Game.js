class Game {
    constructor() {
        this.color = 'none';
        this.selectedPawn = 'none';
        this.clickedField = "none";
        this.fieldSize = 32;
        this.pawnRadius = this.fieldSize / 3;
        this.tableSize = {length: 450, width: 30, height: 10}
        this.boardAndPawns = new THREE.Object3D();
        this.gameEnded = false;

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

        this.scene.add(this.boardAndPawns);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 200, 0)
        this.camera.lookAt(this.scene.position);

        window.addEventListener('resize', this.onWindowResize, false);
        
        this.generateTable(this.tableSize.length, this.tableSize.width, this.tableSize.height); // length, width, height
        this.render()

        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();

        window.addEventListener("mousedown", (event) => {
            if(this.gameEnded) return;
            if (!this.currentTurn) return
            this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouseVector, this.camera);

            let intersects = this.raycaster.intersectObjects(this.pawns.children);
            if (intersects.length > 0) {
                const clickedPawn = intersects[0].object;
                
                if (clickedPawn.color == this.color) {   
                    this.resetSelctedPawn();    
                    this.selectedPawn = clickedPawn;
                    this.selectedPawn.material.color.set('#ffff00');
                    this.clearPossibleMoves();
                    this.generatePossibleMoves();

                    new TWEEN.Tween(this.selectedPawn.position) // co
                        .to({ y: 10}, 200) // do jakiej pozycji, w jakim czasie
                        .easing(TWEEN.Easing.Cubic.In) // typ easingu (zmiana w czasie)
                        .start()
                } 
                return;
            }

            if(this.selectedPawn == 'none') return;

            intersects = this.raycaster.intersectObjects(this.boardInside.children);
            if (intersects.length > 0) {
                const clickedField = intersects[0].object;
                if (clickedField.possibleMove) {
                    this.clickedField = clickedField;
                    this.clearPossibleMoves();
                    this.movePlayerPawn();
                }
            }
        });
    }

    resetSelctedPawn = () => {
        if (this.selectedPawn == 'none') return

        if (this.color == "white") {
            this.selectedPawn.material.color.set("#ffffff");
        } else {
            this.selectedPawn.material.color.set("#444444");
        }

        new TWEEN.Tween(this.selectedPawn.position) // co
            .to({ y: 0}, 200) // do jakiej pozycji, w jakim czasie
            .easing(TWEEN.Easing.Cubic.In) // typ easingu (zmiana w czasie)
            .start()

        this.selectedPawn = 'none'
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

        this.boardAndPawns.add(this.board);
        this.board.position.set(0, 300 ,0)

        new TWEEN.Tween(this.board.position) // co
            .to({ x: 0, y: 10, z: 0 }, 1500) // do jakiej pozycji, w jakim czasie
            .easing(TWEEN.Easing.Bounce.Out) // typ easingu (zmiana w czasie)
            .onComplete(() => { this.generatePawns() }) // funkcja po zakończeniu animacji
            .start()
    }

    generatePawns = async() => {
        this.pawns = new THREE.Object3D();
        this.pawns.position.set(0, 20, 0)
        this.boardAndPawns.add(this.pawns);
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
                    .to({ y: 0 }, 1500) // do jakiej pozycji, w jakim czasie
                    .easing(TWEEN.Easing.Bounce.Out) // typ easingu (zmiana w czasie)
                    // .onComplete(() => { }) // funkcja po zakończeniu animacji
                    .start()
                await this.sleep(100);
            }
        }

        await this.sleep(1500);

        new TWEEN.Tween(this.boardAndPawns.position)
            .to({ x: -50 }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
                if (this.color == 'black') {
                    net.startWaitingForMove();
                    this.currentTurn = false;
                } else {
                    this.currentTurn = true;
                    net.startTimer();
                }
             })
            .start()
    }

    clearPossibleMoves = () => {
        for(const field of this.boardInside.children) {
            if(field.color == 'black') {
                field.material.color.set('#361b01')
                field.possibleMove = false;
            }
        }
    }

    generatePossibleMoves = () => {
        let maxMove = 1;

        let allowedXMove = [1];
        if (this.color == 'black') allowedXMove = [-1];
        if(this.selectedPawn.isQueen) {
            maxMove = 7;
            allowedXMove = [-1, 1];
        }

        let allowedZMove = [-1, 1];

        for(const x of allowedXMove) {
            for(const z of allowedZMove) {
                let pawnsCaptured = 0;
                let capturedPawn = 'none';
                for(let move=1; move<=maxMove+pawnsCaptured; move++) {
                    let xMove = x * move;
                    let zMove = z * move;

                    let field = this.boardInside.children.find(field => field.info.x == this.selectedPawn.info.x + xMove && field.info.z == this.selectedPawn.info.z + zMove);
                    if(field == undefined) continue;
                    let pawnOnField = this.pawns.children.find(pawn => pawn.info.x == field.info.x && pawn.info.z == field.info.z);

                    if (pawnOnField == undefined) {
                        field.material.color.set('#00ff00');
                        field.possibleMove = true;
                        field.capturedPawn = capturedPawn;
                        continue;
                    }            

                    if(pawnOnField.color == this.color) {
                        move = 8;
                        continue;
                    }

                    capturedPawn = pawnOnField;
                    pawnsCaptured += 1;
                    if(pawnsCaptured > 1) {
                        pawnsCaptured = 0;
                        move = 8;
                    }; 
                }    
            }
        }
    }

    movePlayerPawn = () => {
        this.currentTurn = false;
        let captured = false;
        const capturedPawn = this.clickedField.capturedPawn

        let color;
        if (this.color == 'white') color = 1;
        if (this.color == 'black') color = 2;

        let pawnX = this.selectedPawn.info.x;
        let pawnZ = this.selectedPawn.info.z;

        this.pawnsTab[this.selectedPawn.info.x, this.selectedPawn.info.z] = 0;
        this.pawnsTab[this.clickedField.position.x, this.clickedField.position.z] = color;

        this.selectedPawn.info.x = this.clickedField.info.x;
        this.selectedPawn.info.z = this.clickedField.info.z;

        new TWEEN.Tween(this.selectedPawn.position)
            .to({ x: this.clickedField.position.x, z: this.clickedField.position.z }, 500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => { this.resetSelctedPawn(); setTimeout(this.moveBoard, 200); this.checkForQueen(); setTimeout(this.checkForWin, 500) })
            .start()
      
        if(capturedPawn != 'none') {
            captured = true;
            setTimeout(() => {
                this.pawns.remove(capturedPawn);
            }, 250);
        }

        net.moveDone({
            'last': [pawnX, pawnZ],
            'new': [ this.selectedPawn.info.x, this.selectedPawn.info.z],
            'captured': captured,
            'capturedPawn': capturedPawn.info
        })
    }

    moveOponentPawn = (move) => {    
        let color;
        if (this.color == 'white') color = 2;
        if (this.color == 'black') color = 1;
        
        this.pawnsTab[move.last[0], move.last[1]] = 0;
        this.pawnsTab[move.new[0], move.new[1]] = color;

        const oponentPawn = this.pawns.children.find(pawn => pawn.info.x == move.last[0] && pawn.info.z == move.last[1]);
        const destinationField = this.boardInside.children.find(field => field.info.x == move.new[0] && field.info.z == move.new[1]);
        
        oponentPawn.info.x = move.new[0];
        oponentPawn.info.z = move.new[1];

        new TWEEN.Tween(oponentPawn.position)
            .to({ x: destinationField.position.x, z: destinationField.position.z }, 500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => { setTimeout(this.moveBoard, 200); this.checkForQueen(); setTimeout(this.checkForWin, 500) })
            .start()

        if(move.captured) {          
            setTimeout(() => {
                let pawnToCapture = this.pawns.children.find(pawn => pawn.info.x == move.capturedPawn.x && pawn.info.z == move.capturedPawn.z);
                this.pawnsTab[move.capturedPawn.x, move.capturedPawn.z] = 0; 
                this.pawns.remove(pawnToCapture);
            }, 250);
        }
        

        setTimeout(() => {
            this.currentTurn = true;
        }, 1500);
    }

    checkForWin = () => {
        let oponentPawn;

        if(this.color == 'white') {
            oponentPawn = 'black'
        }else {
            oponentPawn = 'white';
        }

        let pawn = this.pawns.children.find(pawn => pawn.color == this.color )
        if(pawn == undefined) {
            ui.endGame('lose')
            return
        }

        pawn = this.pawns.children.find(pawn => pawn.color == oponentPawn );
        if(pawn == undefined) {
            ui.endGame('win')
            return
        }
    }

    checkForQueen = () => {
        let queen = this.pawns.children.find(pawn => pawn.info.x == 7 && pawn.color == 'white' && pawn.isQueen == false );

        if(queen != undefined) {
            queen.intoQueen();
        }else {
            queen = this.pawns.children.find(pawn => pawn.info.x == 0 && pawn.color == 'black' && pawn.isQueen == false );

            if(queen != undefined) {
                queen.intoQueen();
            }
        }      
    }
    
    moveBoard = () => { 
        let x = -this.boardAndPawns.position.x;

        new TWEEN.Tween(this.boardAndPawns.position)
            .to({ x: x }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
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

        if(this.selectedPawn != 'none') this.selectedPawn.rotation.y += Math.PI/180;

        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
    }
}