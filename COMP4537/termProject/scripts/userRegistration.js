// const BASEURL = "http://localhost:3000";
const BASEURL = "https://term-project4537.vercel.app";

async function handleRegistration(event) {


    event.preventDefault();
    const formData = new FormData(document.getElementById('registrationForm'));
    const username = formData.get('username');
    const email = formData.get('email');

    const response = await fetch(`${BASEURL}/checkuser?username=${username}&email=${email}`);
    const data = await response.json();

    if (!data.usernameUnique) {
        document.getElementById('usernameError').innerText = 'Username already exists';
        return;
    } else {
        document.getElementById('usernameError').innerText = '';
    }
    if (!data.emailUnique) {
        document.getElementById('emailError').innerText = 'Email already exists';
        return;
    } else {
        document.getElementById('emailError').innerText = '';
    }

    await registerUser(formData);
}

async function registerUser(formData) {
    try {
        const response = await fetch(`${BASEURL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        if (response.ok) {
            alert('Registration successful');
            window.location.href = './login.html';
        } else {
            alert('Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}
document.addEventListener('DOMContentLoaded', function () {
    // const xhr = new XMLHttpRequest()
    // xhr.withCredentials = true;
    // xhr.open('GET', `${BASEURL}/check-session`, true);
    // xhr.send()
    // xhr.onreadystatechange = function () {
    //     if (xhr.readyState === 4) {
    //         if (xhr.status === 200) {
    //             const response = JSON.parse(xhr.responseText)
    //             if (response.session = true) {
    //                 window.location.href = "./user.html"
    //             }
    //         }
    //     }
    // }
});
// Event listener for registration form submission
document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
