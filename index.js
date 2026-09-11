    document.addEventListener("DOMContentLoaded", () => {

        // Percorso al file di configurazione
        const configPath = "config.json";

        // Legge il file di configurazione
        fetch(configPath)
            .then(response => response.json())
            .then(config => {
                const sessions = config.sessions;

                // Aggiorna i link in base alla configurazione
                Object.keys(sessions).forEach(session => {
                    const link = document.getElementById(`session${session}`);
                    const sessionData = sessions[session];

                    // Aggiorna il nome della sessione
                    link.textContent = sessionData.name;
                    link.addEventListener("click", () => window.location.replace(`streams.html?session=${session}&port=${sessionData.port}&name=${sessionData.name}`));
                    // Disabilita il link se la sessione è disabilitata
                    if (!sessionData.enabled) {
                        link.classList.add("disabled");
                    }
                });
            })
            .catch(error => {
                console.error("Errore nella lettura della configurazione:", error);
            });

    const datePlace = document.getElementById("data");
    const date1 = new Date();
    datePlace.innerHTML = date1;

    });
