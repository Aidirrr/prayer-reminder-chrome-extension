document.addEventListener('DOMContentLoaded', () => {
    const prayerTimesList = document.getElementById('prayer-times-list');
    const optionsLink = document.getElementById('options-link');

    // Fetch the stored prayer times and display them
    chrome.storage.local.get('timings', (data) => {
        if (chrome.runtime.lastError) {
            prayerTimesList.innerHTML = '<p>Could not load prayer times.</p>';
            return;
        }

        if (data.timings) {
            const timings = data.timings;
            const relevantPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

            let content = '<ul>';
            relevantPrayers.forEach(prayer => {
                content += `<li><strong>${prayer}:</strong> ${timings[prayer]}</li>`;
            });
            content += '</ul>';
            prayerTimesList.innerHTML = content;
        } else {
            prayerTimesList.innerHTML = '<p>Prayer times not set. Please go to the settings page to set your location.</p>';
        }
    });

    // Make the settings link open the options page
    optionsLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
});