class Field extends THREE.Mesh {
    constructor(color, fieldSize) {
        super() // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha

        this.typeOf = "field";
        this.geometry = new THREE.BoxGeometry(fieldSize, 10, fieldSize);
        this.color = color
        this.material = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('materials/field.jpg'),
        } );

        if (this.color == "white") {
            this.material.color.set("#ffffcc")
            
        } else if (color == "black") {
            this.material.color.set("#361b01")
        } else {
            console.log("WRONG FIELD COLOR")
        }
    }
}
