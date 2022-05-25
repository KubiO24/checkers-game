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

    resetUsers = () => {
        fetch("/resetUsers", { method: "post" })
    }
}