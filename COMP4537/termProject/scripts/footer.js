// Define the custom footer element
// const BASEURL = "http://localhost:3000";
const BASEURL = "https://term-project4537.vercel.app";


class myFooter extends HTMLElement {
  connectedCallback() {
    this.contentCallback(); // Call contentCallback when the element is connected to the DOM
  }

  contentCallback() {
    this.innerHTML = `
        <footer class="footer mt-auto py-3">
            <div class="container">
                <button type="button" id="logoutbtn" class="btn btn-danger">Logout</button>
            </div>
        </footer>
     `;
    document.getElementById('logoutbtn').addEventListener('click', logout); // Add event listener here
  }
}

customElements.define('my-footer', myFooter);

function logout() {
    // Send a POST request to the logout endpoint
    fetch(`${BASEURL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {          
            // Redirect the user to the login page
            window.location.href = './login.html';
        } else {
            console.error('Error logging out:', response.statusText);
            // Handle the error condition if necessary
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle any network or other errors if necessary
    });
}

