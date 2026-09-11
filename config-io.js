// Leggo i parametri passati attraverso l'url 
const params = new URLSearchParams(window.location.search);

let serviceFilePath = params.get("service");
let configFilePath = params.get("config");
let isInputPluginDisabled = true;
let isOutputPluginDisabled = true;
let isMonitorPluginDisabled = false;
let debug = true;
let SESSION_NUMBER = params.get("sessione");
let myInputPluginOptions = ["file", "hls", "http", "ip", "rist", "srt", "dvb"];
let myOutputPluginOptions = ["file", "ip", "rist", "srt"];
//let myInputPluginOptions = ["file", "ip", "srt"];
//let myOutputPluginOptions = ["file", "ip", "srt"];

if (params.get("input") === "true") {
   isInputPluginDisabled = true;
} else {
   isInputPluginDisabled = false;
};
if (params.get("output") === "true") {
   isOutputPluginDisabled = true;
} else {
   isOutputPluginDisabled = false;
};
if (params.get("monitor") === "true") {
   isMonitorPluginDisabled = true;
} else {
   isMonitorPluginDisabled = false;
};
if (params.get("debug") === "true") {
   debug = true;
} else {
   debug = false;
};


// Importa il template di configurazione dei campi del form
const pluginFields = {
    input: {
        file: `
            <label for="filePath">Percorso del File</label>
            <input type="text" id="filePath" name="filePath" placeholder="Es. /path/to/file.ts">
        `,
        ip: `
            <label for="localIpAddress">Indirizzo IP Interfaccia Locale</label>
            <input type="text" id="localIpAddress" name="local-address" placeholder="Es. 127.0.0.1">
            <label for="ipAddress">Indirizzo IP</label>
            <input type="text" id="ipAddress" name="ipAddress" placeholder="Es. 192.168.1.1">
            <label for="port">Porta</label>
            <input type="number" id="port" name="port" min="1" max="65535" placeholder="Es. 1234">
        `,
        srt: `
            <label for="password">Password</label>
            <input type="text" id="password" name="passphrase" placeholder="Es. secure">
            <label for="inputSrtCallaerMode">Srt caller mode</label>
            <select id="inputSrtCallerMode" name="caller">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="inputSrtListenerMode">Srt listenenr mode</label>
            <select id="inputSrtListenerMode" name="listener">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="ipAddress">Indirizzo IP</label>
            <input type="text" id="ipAddress" name="ipAddress" placeholder="Es. 192.168.1.1">
            <label for="port">Porta</label>
            <input type="number" id="port" name="port" min="1" max="65535" placeholder="Es. 1234">
        `,
        dvb: `
            <label for="adapterN">Interfaccia</label>
            <input type="number" id="adapterN" name="adapter" placeholder="Es. 0">
            <label for="delivery">Standard di trasmissione</label>
            <select id="deliverySystem" name="delivery-system">
                <option value="DVB-T">DVB-T</option>
                <option value="DVB-T2">DVB-T2</option>
                <option value="DVB-S">DVB-S</option>
                <option value="DVB-S2">DVB-S2</option>
            </select>
            <label for="frequencyN">Frequenza Hz</label>
            <input type="number" id="frequencyN" name="frequency" min="120000000" max="860000000" placeholder="Es. 642000000">
            <label for="filter">Filtra servizi</label>
            <select id="inputFilter" name="P zap">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="serviceN">Numero servizio</label>
            <input type="text" id="serviceN" name="service" placeholder="Es. 48 49">
        `,
        hls: `
            <label for="inputLive">Live Input</label>
            <select id="inputLive" name="live">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="hlsUrl">URL</label>
            <input type="text" id="hlsUrl" name="hlsUrl" placeholder="Es. http://www.telepadova.tv/live.m3u8">
        `,
        http: `
            <label for="httpUrl">URL</label>
            <input type="text" id="httpUrl" name="httpUrl" placeholder="Es. http://www.telepadova.tv/live.mp4">
        `,
        rist: `
            <label for="ristUrl">URL</label>
            <input type="text" id="ristUrl" name="ristUrl" placeholder="Es. rist://192.168.1.1:5000">
        `,
        null: `<p>Questo plugin non richiede parametri aggiuntivi.</p>`
    },
    output: {
        file: `
            <label for="outputFilePath">Percorso del File</label>
            <input type="text" id="outputFilePath" name="outputFilePath" placeholder="Es. /path/to/output.ts">
        `,
        ip: `
            <label for="ttl">TTL</label>
            <input type="number" id="outputTtl" name="ttl" min="1" max="255" placeholder="Es. 32">
            <label for="outputRtpMode">RTP mode</label>
            <select id="outputRtpMode" name="rtp">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="outputPkt">Packet Burst</label>
            <input type="number" id="outputPkt" name="packet-burst" min="1" max="7" placeholder="Es. 7">
            <label for="outputEnforceBurst">Enforce Burst</label>
            <select id="outputEnforceBurst" name="enforce-burst">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="localIpAddress">Indirizzo IP Interfaccia Locale</label>
            <input type="text" id="localIpAddress" name="local-address" placeholder="Es. 127.0.0.1">
            <label for="outputIpAddress">Indirizzo IP</label>
            <input type="text" id="outputIpAddress" name="outputIpAddress" placeholder="Es. 239.0.0.1">
            <label for="outputPort">Porta</label>
            <input type="number" id="outputPort" name="outputPort" min="1" max="65535" placeholder="Es. 20000">
        `,
        srt: `
            <label for="outputPassword">Password</label>
            <input type="text" id="outputPassword" name="passphrase" placeholder="Es. secure">
            <label for="outputPkt">Packet Burst</label>
            <input type="number" id="outputPkt" name="packet-burst" min="1" max="7" placeholder="Es. 7">
            <label for="outputEnforceBurst">Enforce Burst</label>
            <select id="outputEnforceBurst" name="enforce-burst">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="ttl">TTL</label>
            <input type="number" id="outputTtl" name="ipttl" min="1" max="255" placeholder="Es. 32">
            <label for="outputSrtMode">Srt caller mode</label>
            <select id="outputSrtMode" name="caller">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
            <label for="outputIpAddress">Indirizzo IP</label>
            <input type="text" id="outputIpAddress" name="outputIpAddress" placeholder="Es. 192.168.1.2">
            <label for="outputPort">Porta</label>
            <input type="number" id="outputPort" name="outputPort" min="1" max="65535" placeholder="Es. 5678">
        `,
        rist: `
            <label for="ristUrl">URL</label>
            <input type="text" id="ristUrl" name="ristUrl" placeholder="Es. rist://192.168.1.1:5000">
        `,
        drop: `<p>Questo plugin non richiede parametri aggiuntivi.</p>`
    },
    monitor: {
        bitrate_monitor: `
            <label for="minBitrate">Bitrate Minimo</label>
            <input type="number" id="minBitrate" name="min" min="0" max="100000000" placeholder="Es. 3,000,000">
            <label for="maxBitrate">Bitrate Massimo</label>
            <input type="number" id="maxBitrate" name="max" min="0" max="100000000" placeholder="Es. 3,000,000">
            <label for="atStartup">Avvia automaticamente</label>
            <select id="atStartup" name="atStartup">
                <option value="true">ON</option>
                <option value="">OFF</option>
            </select>
        `,
    }
};

document.addEventListener('DOMContentLoaded', () => {

   // Cambia il titolo della pagina
   document.getElementById("titolo").innerHTML = params.get("titolo");

   // Collega gli eventi ai pulsanti
   document.getElementById('generateConfigBtn').addEventListener('click', () => {
       saveConfigToFile();
   });
   //document.getElementById('savePreferencesBtn').addEventListener('click', saveConfigToFile);
   document.getElementById('backBtn').addEventListener('click', goBack);
   // Aggiungi il listener per il cambio del plugin di ingresso
   document.getElementById('inputPlugin').addEventListener('change', () => {
       updatePluginFields('input');
   });
   // Aggiungi il listener per il cambio del plugin di uscita
   document.getElementById('outputPlugin').addEventListener('change', () => {
       updatePluginFields('output');
   });

   // Carica le preferenze salvate
   addSelectOptions(myInputPluginOptions, "input");
   addSelectOptions(myOutputPluginOptions, "output");
   updatePluginFields('input');
   updatePluginFields('output');
   updatePluginFields('monitor');
   loadSavedConfig();
});

// Funzione indietro di una pagina
function goBack() {
   //window.history.back()
     self.close();
}

function addSelectOptions(myOptions, type) {
    const plugin = document.getElementById(`${type}Plugin`);
    myOptions.forEach(value => {
        const c = document.createElement("option");
        c.text = value.toUpperCase();
        c.value = value;
        plugin.options.add(c);
    });
}

function controlService(action) {
    if (action === "daemon-reload") {
        cockpit.spawn(["systemctl", action])
            .then(() => {
                console.log(`Servizio ${action} completato.`);
            })
            .catch((error) => {
                console.error(`Errore durante ${action} del servizio:`, error);
            });
    } else {
        cockpit.spawn(["systemctl", action, serviceFilePath])
            .then(() => {
                console.log(`Servizio ${action} ${serviceFilePath} completato.`);
            })
            .catch((error) => {
                console.error(`Errore durante ${action} del servizio: ${serviceFilePath}`, error);
            });
    }
}

// Funzione per aggiornare i campi del plugin selezionato
function updatePluginFields(type) {
    const plugin = document.getElementById(`${type}Plugin`).value;
    const container = document.getElementById(`${type}PluginFields`);
    container.innerHTML = pluginFields[type][plugin] || '<p>Nessun parametro richiesto.</p>';
}

function collectFormData() {
    const config = {
        inputPlugin: {
            type: document.getElementById('inputPlugin').value,
            parameters: {},
            isDisabled: isInputPluginDisabled
        },
        outputPlugin: {
            type: document.getElementById('outputPlugin').value,
            parameters: {},
            isDisabled: isOutputPluginDisabled
        },
        monitorPlugin: {
            type: "bitrate_monitor",
            parameters: {},
            isDisabled: isMonitorPluginDisabled
        }
    };

    // Raccogli parametri dinamici per il plugin di ingresso
    const inputFields = document.querySelectorAll('#inputPluginFields input, #inputPluginFields select');
    inputFields.forEach(field => {
        config.inputPlugin.parameters[field.name] = field.value;
    });

    // Raccogli parametri dinamici per il plugin di uscita
    const outputFields = document.querySelectorAll('#outputPluginFields input, #outputPluginFields select');
    outputFields.forEach(field => {
        config.outputPlugin.parameters[field.name] = field.value;
    });

    // Raccogli parametri dinamici per il plugin di monitoraggio
    const monitorFields = document.querySelectorAll('#monitorPluginFields input, #monitorPluginFields select');
    monitorFields.forEach(field => {
        config.monitorPlugin.parameters[field.name] = field.value;
    });

    return config;
}

function saveConfigToFile() {
    const config = collectFormData();
    const jsonConfig = JSON.stringify(config, null, 4);

    cockpit.file(configFilePath, { superuser: "try" })
        .replace(jsonConfig)
        .then(() => {
            //alert("Configurazione salvata con successo!");
            generateSystemdUnit();
        })
        .catch((error) => {
            alert(`Errore durante il salvataggio della configurazione: ${error}`);
        });
}

function loadSavedConfig() {
    cockpit.file(configFilePath, { superuser: "try" })
        .read()
        .then((content) => {
            const config = JSON.parse(content);

            // Popola i campi principali
            document.getElementById('inputPlugin').value = config.inputPlugin.type;
            // gestisce la pssibilità visualizzare o meno verso l'utente questa parte di configurazione
            document.getElementById('inputPlugin').disabled = config.inputPlugin.isDisabled;
            if (config.inputPlugin.isDisabled) {
                document.getElementById('inputDiv').style.display = "none";
            } else {
                document.getElementById('inputDiv').style.display = "block";
            }

            document.getElementById('outputPlugin').value = config.outputPlugin.type;
            // gestisce la pssibilità visualizzare o meno verso l'utente questa parte di configurazione
            document.getElementById('outputPlugin').disabled = config.outputPlugin.isDisabled;
            if (config.outputPlugin.isDisabled) {
                document.getElementById('outputDiv').style.display = "none";
            } else {
                document.getElementById('outputDiv').style.display = "block";
            }

            document.getElementById('monitorPlugin').value = config.monitorPlugin.type;
            // gestisce la pssibilità visualizzare o meno verso l'utente questa parte di configurazione
            document.getElementById('monitorPlugin').disabled = config.monitorPlugin.isDisabled;
            if (config.monitorPlugin.isDisabled) {
                document.getElementById('monitorDiv').style.display = "none";
            } else {
                document.getElementById('monitorDiv').style.display = "block";
            }

            // Aggiorna i campi dinamici
            updatePluginFields('input');
            updatePluginFields('output');
            updatePluginFields('monitor');

            // Popola i campi dinamici per inputPlugin
            const inputFields = document.querySelectorAll('#inputPluginFields input, #inputPluginFields select');
            inputFields.forEach((field) => {
                if (config.inputPlugin.parameters[field.name] !== undefined) {
                    field.value = config.inputPlugin.parameters[field.name];
                    // disabilita eventualmente i campi
                    field.disabled = config.inputPlugin.isDisabled;
                }
            });

            // Popola i campi dinamici per outputPlugin
            const outputFields = document.querySelectorAll('#outputPluginFields input, #outputPluginFields select');
            outputFields.forEach((field) => {
                if (config.outputPlugin.parameters[field.name] !== undefined) {
                    field.value = config.outputPlugin.parameters[field.name];
                    // disabilita eventualmente i campi
                    field.disabled = config.outputPlugin.isDisabled;
                }
            });

            // Popola i campi dinamici per monitorPlugin
            const monitorFields = document.querySelectorAll('#monitorPluginFields input, #monitorPluginFields select');
            monitorFields.forEach((field) => {
                if (config.monitorPlugin.parameters[field.name] !== undefined) {
                    field.value = config.monitorPlugin.parameters[field.name];
                    // disabilita eventualmente i campi
                    field.disabled = config.monitorPlugin.isDisabled;
                }
            });

        })
        .catch((error) => {
            console.log("Nessun file di configurazione trovato o errore nel caricamento:", error);
        });
}

function generateSystemdUnit() {
    cockpit.file(configFilePath, { superuser: "try" })
        .read()
        .then((content) => {
            const config = JSON.parse(content);

            // Estrai i dati dal file JSON
            const inputPlugin = config.inputPlugin.type;
            const outputPlugin = config.outputPlugin.type;


    function generatePluginParameters(parameters) {
        return Object.entries(parameters || {})
            .map(([key, value]) => {
                // Gestione speciale per l'opzione di startup
                if (key === 'atStartup') {
                    return '';
                }
                // Gestione speciale per inputFilter
                if (key === 'P zap' && value === 'true') {
                    return `-${key} ${parameters.service} -P pcrbitrate -P pcradjust`; // Nel caso sia P zap ritorna -P al posto di --P
                }

                // Ignora il campo service perché già gestito con inputFilter
                if (key === 'service') {
                    return '';
                }

                // se il campo chiave e hlsUrl restituisce solo il valore senza chiave e aggiunge il plugin regulate
                if (key === 'hlsUrl') {
                    return `${value} -P regulate --pcr-synchronous`;
                }

                // se il campo chiave e httpUrl restituisce solo il valore senza chiave e aggiunge il plugin regulate
                if (key === 'httpUrl') {
                    return `${value} -P regulate --pcr-synchronous`;
                }

                // se il campo chiave e ristUrl restituisce solo il valore senza chiave e aggiunge il plugin r>
                if (key === 'ristUrl') {
                    return `${value}`;
                }

                // Se il valore è booleano e true, aggiungi solo lo switch
                if (typeof value === 'boolean' && value === true) {
                    return `--${key}`;
                }
                // se da json arriva un stringa la funzione sopra non funziona allora faccio controllo sul valore stringa
                if (value === 'true') {
                   return `--${key}`;
                }

                // Gestione speciale per IpAddress e Port
                if (key === 'ipAddress' && parameters.port) {
                    return `${value}:${parameters.port}`; // Combina IP e porta
                }

                // Gestione speciale per outputIpAddress e outputPort
                if (key === 'outputIpAddress' && parameters.outputPort) {
                    return `${value}:${parameters.outputPort}`; // Combina IP e porta
                }

                // Ignora il campo port perché già gestito con ipAddress
                if (key === 'port') {
                    return '';
                }

                // Ignora il campo outputPort perché già gestito con outputIpAddress
                if (key === 'outputPort') {
                    return '';
                }

                //
                if (key === 'filePath') {
                    return `-i ${value} -P regulate`;
                }

                //
                if (key === 'outputFilePath') {
                    return `${value}`;
                }

                // Se il valore è stringa o numero, aggiungi chiave e valore
                if (value !== null && value !== undefined && value !== '') {
                    return `--${key} ${value}`;
                }

                // Ignora i parametri nulli, undefined o vuoti
                return '';
            })
            .filter((param) => param !== '') // Rimuovi eventuali parametri vuoti
            .join(' ');
    }

            // Crea stringhe di parametri per input e output plugin
            const inputParameters = generatePluginParameters(config.inputPlugin.parameters);
            const outputParameters = generatePluginParameters(config.outputPlugin.parameters);
            const monitorParameters = generatePluginParameters(config.monitorPlugin.parameters);
            const filterPlugin = `-P analyze --json -i 5 -o /usr/share/cockpit/DVB-Streams/tmp-fs/analisys${SESSION_NUMBER}.json`;
            const monitorPluginPath = `-P fork "tsp -r -P bitrate_monitor --time-interval 10 --alarm-command /usr/share/cockpit/DVB-Streams/bin/stream_alarm.sh --tag ${SESSION_NUMBER} --periodic-command 10 ${monitorParameters} -O drop"`;
            const forkOutput = `-P fork "tsp -O ip -l 127.0.0.1 239.0.1.1:400${SESSION_NUMBER}"`;

// Genera il contenuto del file di unit
            const systemdConfig = `
[Unit]
Description=TSP Service
After=network-online.target

[Service]
ExecStart=nice -10 tsp -d -I ${inputPlugin} ${inputParameters} ${filterPlugin} ${monitorPluginPath} ${forkOutput} -O ${outputPlugin} ${outputParameters}
#ExecStart=nice -10 tsp -d -I ${inputPlugin} ${inputParameters} ${filterPlugin} -O ${outputPlugin} ${outputParameters}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
            `.trim();

            // Salva il file systemd
            cockpit.file(serviceFilePath, { superuser: "try" })
                .replace(systemdConfig)
                .then(() => {
                    alert("Configurazione salvata con successo!");
                    //visuakizza il file systemd
                    if (debug) {
                        document.getElementById('systemdOutput').textContent = systemdConfig;
                    }
                    // ricarico systemd
                    controlService("daemon-reload");
                    if (config.monitorPlugin.parameters.atStartup === "true") {
                       console.log("AVVIO AUTOMATICO ATTIVATO");
                       controlService("enable");
                    } else {
                       console.log("AVVIO AUTOMATICO DISATTIVATO");
                       controlService("disable");
                    }
                })
                .catch((error) => {
                    alert(`Errore durante il salvataggio del file systemd: ${error}`);
                });
        })
        .catch((error) => {
            alert(`Errore durante la lettura della configurazione JSON: ${error}`);
        });
}
