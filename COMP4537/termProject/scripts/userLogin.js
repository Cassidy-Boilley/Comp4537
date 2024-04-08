// const BASEURL = "http://localhost:3000";
const BASEURL = "https://term-project4537.vercel.app";


function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('loginForm'));
    const username = formData.get('username');
    const password = formData.get('password');
    sendLoginRequest(username, password);
}

function sendLoginRequest(username, password) {
    sessionStorage.clear();
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('POST', `${BASEURL}/login`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ username, password }));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const role = response.role;
                alert(response.message);
                if (role === 'user') {
                    window.location.href = './user.html';
                } else if (role === 'admin') {
                    window.location.href = './admin.html';
                }
            } else {
                console.error('Error logging in:', xhr.responseText);
            }
        }
    };
}
document.addEventListener('DOMContentLoaded', function () {
    const xhr = new XMLHttpRequest()
    xhr.withCredentials = true;
    xhr.open('GET', `${BASEURL}/check-session`, true);
    xhr.send()
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText)
                if (response.session = true) {
                    window.location.href = "./user.html"
                }
            }
        }
    }
});
// Event listener for login form submission
document.getElementById('loginForm').addEventListener('submit', handleLogin);
