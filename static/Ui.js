class Ui {
    login = () => {
        let username = document.querySelector('.loginInput').value;
        
        if(username == '') {
            this.setloginError("Username field can't be empty");
            return;
        }

        let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if(format.test(username)) {
            this.setloginError("Username can't containt special characters");
            return;
        }

        net.login(username);
    }

    setloginError = (message) => {
        document.querySelector('#loginError').innerText = message
    }

    successLogin = () => {
        document.querySelector('#login').style.display = 'none';   
    }

    waitingForSecondPlayer = () => {
        document.querySelector('#waitingScreen').style.display = 'flex';
        document.querySelector('#waitingText').innerHTML = `Hello ${net.username}, waiting for second player to join.`
    }

    startGame = () => {
        document.querySelector('#waitingScreen').style.display = 'none';
    }
}