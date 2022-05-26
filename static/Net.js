class Net {
    login = (username) => {
        const body = JSON.stringify({ username: username })
        const headers = { "Content-Type": "application/json" }
        fetch("/login", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    if (data.success == true) {
                        this.username = username;
                        ui.successLogin(username);

                        if (data.message == 'waiting') {
                            ui.waitingForSecondPlayer();
                            this.color = "white"
                            this.waitingForPlayerInterval = setInterval(this.waitingForSecondPlayer, 100);
                        } else {
                            this.getUsernamesList();
                            this.color = "black";
                            game.setColor(this.color)
                        }
                    } else {
                        ui.setloginError(data.message)
                    }
                }
            )
    }

    waitingForSecondPlayer = () => {
        fetch("/waitingForSecondPlayer", { method: "post" })
            .then(response => response.json())
            .then(
                data => {
                    if (data.startGame == true) {
                        clearInterval(this.waitingForPlayerInterval);
                        this.getUsernamesList();
                        game.setColor(this.color)
                    }
                }
            )
    }

    getUsernamesList = () => {
        const body = JSON.stringify({ username: this.username })
        const headers = { "Content-Type": "application/json" }

        fetch("/getUsernamesList", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    this.secondUsername = data.username;
                    ui.startGame();
                }
            )
    }

    startWaitingForMove = () => {
        this.waitingForMoveInterval = setInterval(this.waitingForMove, 100);
    }

    waitingForMove = () => {
        console.log("WAIT for move")
        const body = JSON.stringify({
            color: this.color
        })

        const headers = { "Content-Type": "application/json" }

        fetch("/waitForMove", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    if (data.moved == 'true') {
                        clearInterval(this.waitingForMoveInterval);
                        game.moveOponentPawn(data.move.move)
                    }
                }
            )
    }
    
    moveDone = (move) => {
        const body = JSON.stringify({
            move: move,
            colorMoved: this.color
        })

        const headers = { "Content-Type": "application/json" }

        fetch("/moveDone", { method: "post", body, headers })
            .then(response => response.text())
            .then(
                data => {
                    if (data == 'success') {
                        setTimeout(this.startWaitingForMove, 1500)
                    } 
                }
            )
    }

    resetUsers = () => {
        fetch("/resetUsers", { method: "post" })
    }
}