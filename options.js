const cityInput = document.getElementById('city');
const countryInput = document.getElementById('country');
const statusDiv = document.getElementById('status');
const notificationCheckboxes = {
    Fajr: document.getElementById('Fajr'),
    Dhuhr: document.getElementById('Dhuhr'),
    Asr: document.getElementById('Asr'),
    Maghrib: document.getElementById('Maghrib'),
    Isha: document.getElementById('Isha'),
};

// Saves options to chrome.storage
function saveOptions() {
    const city = cityInput.value;
    const country = countryInput.value;
    const notifications = {};
    for (const prayer in notificationCheckboxes) {
        notifications[prayer] = notificationCheckboxes[prayer].checked;
    }

    chrome.storage.sync.set({ city, country, notifications }, () => {
        statusDiv.textContent = 'Options saved.';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 1500);
        // Notify background script that settings have changed
        chrome.runtime.sendMessage({ action: 'settingsUpdated' });
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get({ city: 'London', country: 'UK', notifications: {} }, (items) => {
        cityInput.value = items.city;
        countryInput.value = items.country;
        for (const prayer in notificationCheckboxes) {
            notificationCheckboxes[prayer].checked = items.notifications[prayer] !== false; // default to true
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);