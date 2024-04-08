const BASEURL = "http://localhost:3000";

async function fetchUsers() {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${BASEURL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 200) {
            const data = await response.json();
            displayUsers(data.users);
        } else {
            displayErrorAlert('Forbidden: Invalid token');
        }
    } catch (error) {
        console.error('Error:', error);
        displayErrorAlert('An error occurred while fetching users.');
    }
}

function displayUsers(users) {
    const userListDiv = document.getElementById('userList');
    userListDiv.innerHTML = '';
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    const headers = ['Username', 'Email', 'Role ID', 'API Calls'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    users.forEach(user => {
        const row = table.insertRow();
        const userData = [user.username, user.email, user.role_id, user.api_call_count];
        userData.forEach(text => {
            const cell = row.insertCell();
            cell.textContent = text;
        });
    });
    userListDiv.appendChild(table);
}

function displayErrorAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
}

function redirectToUserPage() {
    window.location.href = './user.html';
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});
