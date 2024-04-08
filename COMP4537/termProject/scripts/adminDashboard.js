// const BASEURL = "http://localhost:3000";
const BASEURL = "https://term-project4537.vercel.app";



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
    users.forEach(user => {
        const row = document.createElement('tr');
        const role = user.role_id === 2 ? 'admin' : 'user'; // Convert role_id to role string
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${role}</td> 
            <td>${user.api_call_count}</td>
            <td><button onclick="deleteUser('${user._id}')">Delete</button></td>
        `;
        userListDiv.appendChild(row);
    });
}


async function deleteUser(userId) {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${BASEURL}/delete-user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 200) {
            // Refresh user list after successful deletion
            fetchUsers();
        } else {
            displayErrorAlert('Failed to delete user');
        }
    } catch (error) {
        console.error('Error:', error);
        displayErrorAlert('An error occurred while deleting user.');
    }
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
