// const BASEURL = "http://localhost:3000";
const BASEURL = "https://term-project4537.vercel.app";
const maxAPIcalls = 20;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${BASEURL}/api-count`, {
            credentials: 'include'
        });
        const { apiCount } = await response.json();
        updateApiCount(apiCount);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching the API count. Please try again later.');
    }
});

async function handleTextInput(event) {
    event.preventDefault();
    const textInputValue = document.getElementById('textInput').value;
    const scrollable = document.getElementById('conversation');
    const newInputMessage = document.createElement('p')
    newInputMessage.textContent = "You: " + textInputValue
    scrollable.appendChild(newInputMessage)
    showLoadingSpinner(); // Show spinner
    await makeAPICall(textInputValue);
    hideLoadingSpinner(); // Hide spinner
}

function showLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
    document.getElementById('submitButton').classList.add('d-none');
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.add('d-none');
    document.getElementById('submitButton').classList.remove('d-none');
}

async function makeAPICall(textInputValue) {
    
    const data = { text: textInputValue };
    try {
        const response = await fetch(`${BASEURL}/api-call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include' // Include credentials
        });
        const result = await response.json();
        
       
        let remainingCalls = updateApiCount(Number(result.apiCount));
        if (remainingCalls === 0) {
            document.getElementById('submitButton').disabled = true;
            alert('You have reached the maximum number of API calls.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}

function updateApiCount(currentCalls) {
    const remainingCalls = maxAPIcalls - currentCalls; 
    document.getElementById('apiCountContainer').textContent = 'Remaining API calls: ' + remainingCalls;
    return remainingCalls;
}


// Event listener for text input form submission
document.getElementById('textInputForm').addEventListener('submit', handleTextInput);
