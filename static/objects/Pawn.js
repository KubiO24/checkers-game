class Pawn extends THREE.Mesh {
    constructor(color, pawnRadius) {
        super() // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha

        this.typeOf = "pawn"
        this.color = color;
        this.isQueen = false;

        this.geometry = new THREE.CylinderGeometry(pawnRadius, pawnRadius, 4, 32);
        this.material = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('materials/pawn.png'),
        } );

        this.setColor();
    }

    setColor = () => {
        if (this.color == "white") {
            this.material.color.set("#ffffff");
        } else if (this.color == "black") {
            this.material.color.set("#444444");
        } else {
            console.log("WRONG PAWN COLOR")
        }
    }

    intoQueen = () => {
        this.isQueen = true;
    
        this.material = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('materials/queen.png'),
        } );  
        this.setColor();
        this.material.needsUpdate = true;
    }
}