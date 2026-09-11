
// ******************** Parametri di configurazione *****************
// Leggo i parametri passati attraverso l'url
const params = new URLSearchParams(window.location.search);

let SESSION_NUMBER = params.get("session");
let TSSWITCH_UDP_TX_PORT = params.get("port");
let SESSION_NAME = params.get("name");
let DEBUG = true;
let maxBirate = 3000000;
let minBtrate = 300000;

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let SERVICE1_NAME = `tsp-stream${SESSION_NUMBER}.service`;						// nome del servizio che riceve il primo flusso
let baseFilePath = "/usr/share/cockpit/DVB-Streams/";                                                    // percorso base
let temporaryFilePath = "/usr/share/cockpit/DVB-Streams/tmp-fs/";                                        // percorso del RAM-DISK
// File di stato di TSSWITCH
let tspAnalisysName = `${temporaryFilePath}analisys${SESSION_NUMBER}.json`;                             // nome completo del file di analisi del ts generato da TSP
// File di monitor del TS
let tspMonitorName = `${temporaryFilePath}stream${SESSION_NUMBER}_monitor.json`;                               // nome completo del file di monitoraggio del ts generato dal plugin bitrate_monitor
// File screenshot
let screenshotFileName = `tmp-fs/screenshot${SESSION_NUMBER}.jpg`;                                      // percorso dove ci si aspetta  di trovare il file di screenshot generato dal servizio di cui sotto (p.s. per non scassare il disco rigido è bene che la destinazione sia un ram-disk)
// Servizio Generatore di screenshot
let screenshotServiceName = `ffmpeg-screenshot${SESSION_NUMBER}.service`;                               // nome completo del servizio che verrà avviato tramite la funzione cockpit.spawn()
// file di configurazione ingressi e uscite
let configFilePath1 = `${baseFilePath}stream${SESSION_NUMBER}-config.json`;

// Controllo dei servizi tramite systemd
document.addEventListener("DOMContentLoaded", function () {
    const startServiceButtonIn1 = document.getElementById("start-service-button-in1");
    const stopServiceButtonIn1 = document.getElementById("stop-service-button-in1");
    const configButtonIn1 = document.getElementById("input1Cfg");
    const backButton = document.getElementById("backBtn");
    const imageSense = document.getElementById("previewImage");

    startServiceButtonIn1.addEventListener("click", () => controlService("start", SERVICE1_NAME));
    stopServiceButtonIn1.addEventListener("click", () => controlService("stop", SERVICE1_NAME));
    configButtonIn1.addEventListener("click", () => openPage("config-io.html", `/etc/systemd/system/${SERVICE1_NAME}`, configFilePath1,`TSP - Stream${SESSION_NUMBER}`, false, false, DEBUG, SESSION_NUMBER));

    backButton.addEventListener("click", () => goBack());
    imageSense.addEventListener("click", () => setImageDimensions());

   // Cambia il titolo della pagina
   document.getElementById("titolo").innerHTML = `Stream ${SESSION_NUMBER} - ${SESSION_NAME}`;
});

function openPage(url, serviceFilePath, configFilePath, titoloPagina, isInputPluginDisabled, isOutputPluginDisabled, isDebugDisabled, numeroSessione) {
    const newUrl=`${url}?service=${serviceFilePath}&config=${configFilePath}&input=${isInputPluginDisabled}&output=${isOutputPluginDisabled}&debug=${isDebugDisabled}&titolo=${titoloPagina}&sessione=${numeroSessione}`;
    console.log(newUrl);
    newwindow=window.open(newUrl,"","width=840,height=900");
}

function updateServiceButtons(state, group) {
    const startButtonIn1 = document.getElementById("start-service-button-in1");
    const stopButtonIn1 = document.getElementById("stop-service-button-in1");

    if (state === "active" & group === SERVICE1_NAME) {
        startButtonIn1.classList.add("active");
        startButtonIn1.classList.remove("inactive");

        stopButtonIn1.classList.add("inactive");
        stopButtonIn1.classList.remove("stop-active");
    } else if (state === "inactive" & group === SERVICE1_NAME) {
        stopButtonIn1.classList.add("stop-active");
        stopButtonIn1.classList.remove("inactive");

        startButtonIn1.classList.add("inactive");
        startButtonIn1.classList.remove("active");
        eraseData();
    }
}

function goBack() {
    //window.history.back()
    window.location.replace("index.html");
}

function setImageDimensions() {
    const previewImage = document.getElementById("previewImage");
    const actualHeight = previewImage.height;
    if (actualHeight == "190") {
        previewImage.width = "800";
        previewImage.height = "470";
    } else {
        previewImage.width = "340";
        previewImage.height = "190";
    }
}

function getServiceStatus(serviceName) {
    cockpit.spawn(["systemctl", "is-active", serviceName])
        .then((output) => {
            console.log("Stato del servizio:", serviceName, output.trim());
            updateServiceButtons(output.trim(), serviceName);
        })
        .catch((error) => {
            // Se il codice di uscita è 3, significa che il servizio è inattivo
            if (error.exit_status === 3) {
                console.warn(`Servizio ${serviceName} inattivo.`);
                updateServiceButtons("inactive", serviceName);
            } else {
                // Per altri errori, gestisci come uno stato sconosciuto
                console.error("Errore nel recupero dello stato del servizio:", error);
                updateServiceButtons("inactive", serviceName); // Stato sconosciuto
            }
        });
}

function generateScreenshot(sessionNumber) {
    cockpit.spawn(["/usr/share/cockpit/DVB-Streams/bin/ffmpeg-screenshot.sh", sessionNumber])
        .then((output) => {
            console.log("Ffmpeg avviato");
        })
        .catch((error) => {
            console.warn("Impossibile avviare Ffmpeg");
        });
}

function eraseData() {
    cockpit.file(tspAnalisysName).replace("")
            .then((data) => {
                try {
                    console.log("File Cancellato");
                } catch (error) {
                    console.error("Errore nella cancellazione del file JSON:", error);
                }
            })
            .catch((error) => {
                console.error("Errore nella scrittura del file JSON:", error);
            });
}

function controlService(action, serviceName) {
    cockpit.spawn(["systemctl", action, serviceName])
        .then(() => {
            console.log(`Servizio ${action} completato.`);
            getServiceStatus(serviceName); // Aggiorna lo stato dopo il comando
        })
        .catch((error) => {
            console.error(`Errore durante ${action} del servizio:`, error);
        });
}

function loadSavedConfig() {
    cockpit.file(configFilePath1, { superuser: "try" })
        .read()
        .then((content) => {
            const config = JSON.parse(content);
            // Popola il campo
            document.getElementById('inp1Plug').textContent = config.inputPlugin.type;
            document.getElementById('out1Plug').textContent = config.outputPlugin.type;
        })
        .catch((error) => {
            console.log("Nessun file di configurazione trovato o errore nel caricamento:", error);
        });
}

window.onload = function () {
    loadSavedConfig();
    //controlService("restart", screenshotServiceName);
    getServiceStatus(SERVICE1_NAME);
};

// ************* Stampa dati TS ************************
document.addEventListener("DOMContentLoaded", () => {
    const analisysFilePath = `${tspAnalisysName}`; // Percorso assoluto del file di analisi
    const monitorFilePath = `${tspMonitorName}`; // Percorso assoluto del file di monitoraggio

    function loadSavedConfig() {
        cockpit.file(configFilePath1, { superuser: "try" })
            .read()
            .then((content) => {
                const config = JSON.parse(content);
                minBitrate = parseInt(config.monitorPlugin.parameters.min);
                maxBitrate = parseInt(config.monitorPlugin.parameters.max);
                //console.log(maxBitrate, minBitrate);
        })
        .catch((error) => {
            console.log("Nessun file di configurazione trovato o errore nel caricamento:", error);
        });
    }

    function updateData() {
        cockpit.file(analisysFilePath).read()
            .then((data) => {
                try {
                    const jsonData = JSON.parse(data);
                    displayServiceInfo(jsonData.services || []);
                    displayTsInfo(jsonData.ts || {});
                    displayPidInfo(jsonData.pids || []);
                    updateMonitorData(jsonData.ts.bitrate || []);
                } catch (error) {
                    //console.error("Errore nel parsing del JSON:", error);
                    updateMonitorData(0);
                }
            })
            .catch((error) => {
                console.error("Errore nella lettura del file JSON:", error);
            });
    }

    function updateMonitorData(bitrate) {
            const inputDiv = document.getElementById("inputOne");
            const cpation = document.getElementById("caption");

            //const bitrt = bitrate.toFixed(2);
            const bitrt = parseInt(bitrate);
            if (bitrt == 0) {
                inputDiv.classList.remove("alarm");
                inputDiv.classList.remove("normal");
                console.log("bitrate off", bitrt);
                caption.innerHTML = "OFF";
                caption.classList.remove("alarm");
                caption.classList.remove("normal");
            } else if (bitrt > minBitrate & bitrt < maxBitrate) {
                //cambiando l'attributo del div inputOne cambierà in blu il contorno
                inputDiv.classList.add("normal");
                inputDiv.classList.remove("alarm");
                console.log("bitrate in range", bitrt);
                caption.innerHTML = `Bitrate in range: ${bitrt} Bit/S`;
                caption.classList.add("normal");
                caption.classList.remove("alarm");
            } else if (bitrt < minBitrate || bitrt > maxBitrate) {
                //cambiando l'attributo del div inputOne cambierà in rosso il contorno
                inputDiv.classList.add("alarm");
                inputDiv.classList.remove("normal");
                console.log("bitrate out of range", bitrt);
                caption.innerHTML = `Bitrate out of range: ${bitrt} Bit/S`;
                caption.classList.add("alarm");
                caption.classList.remove("normal");
            }    }

    function displayPidInfo(pids) {
        const pidList = document.querySelector("#pidInfo ul");
        pidList.innerHTML = "";
        pids.forEach(pid => {
            const li = document.createElement("li");
            li.textContent = `ID: ${pid.id}, Descrizione: ${pid.description}, Bitrate: ${pid.bitrate}`;
            pidList.appendChild(li);
        });
    }

    function displayServiceInfo(services) {
        const serviceList = document.querySelector("#serviceInfo ul");
        serviceList.innerHTML = "";
        services.forEach(service => {
            const li = document.createElement("li");
            li.textContent = `Nome: ${service.name}, Provider: ${service.provider}, Tipo: ${service["type-name"]}`;
            serviceList.appendChild(li);
        });
    }

    function displayTsInfo(ts) {
        const tsList = document.querySelector("#tsInfo ul");
        tsList.innerHTML = `
            <li>Bitrate: ${ts.bitrate}</li>
            <li>Durata: ${ts.duration} secondi</li>
            <li>Pacchetti totali: ${ts.packets.total}</li>
        `;
    }

    function displayDate() {
        const timeStamp = document.getElementById("timestamp");
        const parsedDate = new Date();
        // Formatta la data in modo leggibile (es. 16/01/2025 18:21)
        const formattedDate = parsedDate.toLocaleString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Formato 24 ore
        });
        timeStamp.innerHTML = formattedDate;
    }

    function updateScreenshot() {
        generateScreenshot(SESSION_NUMBER);
    }

    // Esegui un aggiornamento iniziale
    updateData();
    loadSavedConfig()
    //updateMonitorData();
    //generateScreenshot(SESSION_NUMBER);

    // Aggiorna i dati ogni secondo
    setInterval(updateData, 1000);
    setInterval(displayDate, 1000);
    //setInterval(updateMonitorData, 5000);
    //setInterval(updateScreenshot, 10000);

});

document.addEventListener("DOMContentLoaded", () => {
    const previewImage = document.getElementById("previewImage");
    const updateInterval = 10000; // Aggiorna ogni 5 secondi

    function updateScreenshot() {
        const timestamp = new Date().getTime(); // Aggiungi timestamp per evitare il caching
        generateScreenshot(SESSION_NUMBER);
        previewImage.src = `${screenshotFileName}?t=${timestamp}`;
    }

    // Aggiorna l'immagine periodicamente
    setInterval(updateScreenshot, updateInterval);
});

