// Function to fetch prayer times from the API and schedule alarms
async function fetchAndSchedule() {
    console.log("Fetching prayer times and scheduling alarms...");

    // 1. Get user's saved settings from chrome.storage.sync
    const settings = await chrome.storage.sync.get({
        city: 'London',
        country: 'UK',
        notifications: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true }
    });

    const { city, country, notifications } = settings;

    try {
        // 2. Fetch data from the API
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        const timings = data.data.timings;

        // 3. Store today's timings for the popup to use
        await chrome.storage.local.set({ timings });
        console.log("Timings stored:", timings);

        // 4. Clear all previous alarms and set new ones for today
        await chrome.alarms.clearAll();

        for (const prayer in timings) {
            // Only set alarms for prayers the user has enabled
            if (notifications[prayer]) {
                const timeStr = timings[prayer]; // e.g., "04:30"
                const [hour, minute] = timeStr.split(':');

                const now = new Date();
                const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

                // If the prayer time has already passed for today, don't set an alarm
                if (prayerTime > now) {
                    chrome.alarms.create(prayer, { when: prayerTime.getTime() });
                    console.log(`Alarm set for ${prayer} at ${prayerTime.toLocaleTimeString()}`);
                }
            }
        }

        // 5. Set a daily alarm to refetch times for the next day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(1, 0, 0, 0); // Schedule for 1:00 AM tomorrow
        chrome.alarms.create('dailyUpdate', { when: tomorrow.getTime() });
        console.log(`Daily update alarm set for ${tomorrow.toLocaleDateString()}`);

    } catch (error) {
        console.error("Error fetching or scheduling prayer times:", error);
        // Optionally, show a notification to the user about the error
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Prayer Reminder Error',
            message: 'Could not fetch prayer times. Please check your location settings and internet connection.'
        });
    }
}

// Listener for when an alarm goes off
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyUpdate') {
        fetchAndSchedule();
    } else {
        // This is a prayer time alarm
        chrome.notifications.create(alarm.name, {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Prayer Reminder',
            message: `It's time for ${alarm.name} prayer.`,
            priority: 2
        });
    }
});

// Listen for messages from the options page
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'settingsUpdated') {
        fetchAndSchedule();
    }
});

// Run the scheduling function when the extension is first installed or updated
chrome.runtime.onInstalled.addListener(() => {
    fetchAndSchedule();
});