// Define the custom footer element
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
    // Clear session storage
    sessionStorage.clear();
    // Redirect to the login page
    window.location.href = '../login.html'; // Change 'login.html' to your actual login page URL
}
