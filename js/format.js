/* SondeHub Tracker Format Incoming Data
 *
 * Author: Luke Prior
 */


// SondeHub V1 types

var v1types = { // Professional
    "RS41": "RS41",
    "RS41-Ozone": "RS41",
    "RS41-SGP-Ozone": "RS41-SGP",
    "RS41-SG": "RS41-SG",
    "RS41-SG-Ozone": "RS41-SG",
    "RS41-SGP": "RS41-SGP",
    "RS41-SGM": "RS41-SGM",
    "RS41-NG": "RS41-NG",
    "RS92": "RS92",
    "RS92-Ozone": "RS92",
    "IMET": "iMet-4",
    "iMet": "iMet-4",
    "DFM": "DFM",
    "DFM06": "DFM06",
    "DFM09": "DFM09",
    "DFMxB": "DFM",
    "DFMxC": "DFM",
    "DFMx7": "DFMx7",
    "DFMx9": "DFMx9",
    "DFM17": "DFM17",
    "DFM09P": "DFM09P",
    "MK2LMS": "LMS6-1680",
    "LMS6": "LMS6-400",
    "M10": "M10",
    ",M10": "M10",
    "M10-Ptu": "M10",
    "M20": "M20",
    "MEISEI": "IMS100",
    "IMS100": "IMS100",
    "IMET5": "iMet-5x"
}

var v1manufacturers = { // Professional
    "RS92": "Vaisala", 
    "RS41": "Vaisala",
    "RS41-SG": "Vaisala",
    "RS41-SGP": "Vaisala",
    "RS41-SGM": "Vaisala",
    "RS41-NG": "Vaisala",
    "iMet-4": "Intermet Systems",
    "iMet-5x": "Intermet Systems",
    "DFM": "Graw",
    "DFM06": "Graw",
    "DFM09": "Graw",
    "DFMx7": "Graw",
    "DFMx9": "Graw",
    "DFM17": "Graw",
    "DFM09P": "Graw",
    "LMS6-400": "Lockheed Martin",
    "LMS6-1680": "Lockheed Martin",
    "M10": "Meteomodem",
    "M20": "Meteomodem",
    "PS20": "Meteomodem"
}

var excludedFields = [ // Amateur Only
    "payload_callsign", 
    "uploader_callsign", 
    "software_version", 
    "position", 
    "user-agent", 
    "uploaders", 
    "snr", 
    "rssi", 
    "software_name", 
    "alt", 
    "lat", 
    "lon", 
    "heading", 
    "datetime", 
    "serial", 
    "path", 
    "time_received",
    "frame",
    "uploader_alt",
    "uploader_position",
    "uploader_radio",
    "uploader_antenna",
    "raw",
    "aprs_tocall",
    "telemetry_hidden",
    "upload_time",
    "raw_payload",
    "tone_spacing"
];

var uniqueKeys = { // Amateur
    "batt": {"precision": 2},
    "frequency": {"precision": 4},
    "tx_frequency": {"precision": 4}
}

function professionalFrame(frame){
    frame.serial = encodeURIComponent(frame.serial); // hack for xss prevention

    var dataTempEntry = {};
    var station = frame.uploader_callsign;
    dataTempEntry.callsign = {};
    dataTempEntry.callsign[station] = {};
    if (frame.snr) {
        dataTempEntry.callsign[station].snr = frame.snr;
    }
    if (frame.rssi) {
        dataTempEntry.callsign[station].rssi = frame.rssi;
    }
    if (frame.frequency) {
        dataTempEntry.callsign[station].frequency = frame.frequency;
    }
    dataTempEntry.gps_alt = frame.alt;
    dataTempEntry.gps_lat = frame.lat;
    dataTempEntry.gps_lon = frame.lon;

    // Discard positions with null values.
    if (dataTempEntry.gps_lat == 0 && dataTempEntry.gps_lon == 0) {
        return;
    }

    if (frame.heading) {
        dataTempEntry.gps_heading = frame.heading;
    }
    dataTempEntry.gps_time = frame.datetime;
    dataTempEntry.server_time = frame.datetime;
    dataTempEntry.vehicle = frame.serial;
    dataTempEntry.position_id = frame.serial + "-" + frame.datetime;
    dataTempEntry.data = {};
    if (frame.batt) {
        dataTempEntry.data.batt = frame.batt;
    }
    if (frame.burst_timer) {
        dataTempEntry.data.burst_timer = frame.burst_timer;
    }
    if (frame.frequency) {
        dataTempEntry.data.frequency = frame.frequency;
    }
    if (frame.tx_frequency) {
        dataTempEntry.data.frequency_tx = frame.tx_frequency;
    }
    if (frame.hasOwnProperty("humidity")) {
        dataTempEntry.data.humidity = frame.humidity;
    }
    if (frame.manufacturer) {
        dataTempEntry.data.manufacturer = frame.manufacturer;
    }
    if (frame.hasOwnProperty("pressure")) {
        dataTempEntry.data.pressure = frame.pressure;
    }
    if (frame.sats) {
        dataTempEntry.data.sats = frame.sats;
        
        // Drop frames where sats = 0! We do not want to be handling invalid positions.
        if (dataTempEntry.data.sats == 0){
            return;
        }
    }
    if (frame.hasOwnProperty("temp")) {
        dataTempEntry.data.temperature_external = frame.temp;
    }
    if (frame.type && frame.type == "payload_telemetry") { // SondeHub V1.5 data?
        var comment = frame.comment.split(" ");
        if (v1types.hasOwnProperty(comment[0])) {
            dataTempEntry.data.type = v1types[comment[0]];
            dataTempEntry.type = v1types[comment[0]];
            if (v1manufacturers.hasOwnProperty(dataTempEntry.type)) {
                // dataTempEntry.data.manufacturer = v1manufacturers[dataTempEntry.type];
                dataTempEntry.data.type = v1manufacturers[dataTempEntry.type] + " " + dataTempEntry.data.type;
            }
        }
        dataTempEntry.data.frequency = comment[2];
    } else if (frame.type) {
        dataTempEntry.data.type = frame.type;
        dataTempEntry.type = frame.type;
    }
    if (frame.subtype) {
        dataTempEntry.data.type = frame.subtype;
        dataTempEntry.type = frame.subtype;
    }

    if (frame.manufacturer) {
        // Instead of adding a separate manufacturer field, prefix the type with it.
        if (dataTempEntry.data.type) {
            dataTempEntry.data.type = frame.manufacturer + " " + dataTempEntry.data.type;
        }
    }

    // RS41 specific stuff
    if (frame.hasOwnProperty("rs41_mainboard")) {
        dataTempEntry.data.rs41_mainboard = frame.rs41_mainboard;
    }
    // Removed showing mainboard firmware, not really valuable

    // XDATA Handling
    if (frame.xdata) {
        dataTempEntry.data.xdata = frame.xdata;
        if (frame.hasOwnProperty("pressure")) {
            xdata_pressure = frame.pressure;
        } else {
            xdata_pressure = 1100.0;
        }
        var tempXDATA = parseXDATA(frame.xdata, xdata_pressure);
        for (let field in tempXDATA) {
            if (tempXDATA.hasOwnProperty(field)) {
                if (field == "xdata_instrument") {
                    dataTempEntry.data.xdata_instrument = tempXDATA.xdata_instrument.join(', ');
                } else {
                    dataTempEntry.data[field] = tempXDATA[field];
                }
            }
        }
    }
    return dataTempEntry
}

function formatData(data, live) { // Amateur didn't have live
    var showAprs = offline.get('opt_show_aprs');
    var showTesting = offline.get("opt_show_testing");
    var response = {};
    response.positions = {};
    var dataTemp = [];
    if (isProfessional()) {
        if (live) { // Websockets
            if (!data.length) { // handle single sonde
                data = {"entry": data};
            }
            for (let entry in data) {
                 var dataTempEntry = professionalFrame(data[entry]);
                if (dataTempEntry){
                    dataTemp.push(dataTempEntry);
                }   
            }
        } else if (data.length == null) { // Elasticsearch
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    if (typeof data[key] === 'object') {
                        for (let i in data[key]) {
                            var dataTempEntry = professionalFrame(data[key][i]);
                            if (dataTempEntry){
                                dataTemp.push(dataTempEntry);
                            }   
                        }
                    }
                }
            }
        } else { // AWS
            for (var i = data.length - 1; i >= 0; i--) {
                var dataTempEntry = professionalFrame(data[i]);
                if (dataTempEntry){
                    dataTemp.push(dataTempEntry);
                }  
            }
        }
    }
    else if (isAmateur()) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                if (typeof data[key] === 'object') {
                    for (let i in data[key]) {
                        var payload_callsign = encodeURIComponent(data[key][i].payload_callsign);
                        var dataTempEntry = {};
                        var aprsflag = false;
                        dataTempEntry.callsign = {};
                        maximumAltitude = 0;
                        if (vehicles.hasOwnProperty(payload_callsign)) {
                            maximumAltitude = vehicles[payload_callsign].max_alt;
                            if (data[key][i].datetime == vehicles[payload_callsign].curr_position.gps_time) {
                                dataTempEntry = vehicles[payload_callsign].curr_position;
                            }
                        }
                        if (!data[key][i].hasOwnProperty("uploaders")) {
                            data[key][i].uploaders = [];
                            data[key][i].uploaders[0] = {}
                            data[key][i].uploaders[0].uploader_callsign = data[key][i].uploader_callsign;
                            if (data[key][i].snr && typeof data[key][i].snr === "number") {
                                data[key][i].uploaders[0].snr = + data[key][i].snr.toFixed(1);
                            }
                            if (data[key][i].rssi && typeof data[key][i].rssi === "number") {
                                data[key][i].uploaders[0].rssi = + data[key][i].rssi.toFixed(1);
                            }
                            if (data[key][i].frequency && typeof data[key][i].frequency === "number") {
                                data[key][i].uploaders[0].frequency = + data[key][i].frequency.toFixed(4);
                            } 
                            if (data[key][i].tone_spacing && typeof data[key][i].tone_spacing === "number") {
                                data[key][i].uploaders[0].tone_spacing = + data[key][i].tone_spacing.toFixed(1);
                            } 
                        }
                        for (let entry in data[key][i].uploaders) {
                            // This check should probably be done using a modulation field, but this still works I guess..
                            if ("software_name" in data[key][i] && data[key][i].software_name.includes("APRS")) {
                                aprsflag = true;
                                var stations = data[key][i].uploaders[entry].uploader_callsign.split(",");
                                for (let uploader in stations) {
                                    dataTempEntry.callsign[stations[uploader]] = {};
                                }
                            } else {
                                uploader_callsign = data[key][i].uploaders[entry].uploader_callsign
                                dataTempEntry.callsign[uploader_callsign] = {};
        
                                if (data[key][i].uploaders[entry].snr && typeof data[key][i].uploaders[entry].snr === "number") {
                                    dataTempEntry.callsign[uploader_callsign].snr = + data[key][i].uploaders[entry].snr.toFixed(1);
                                }
                                if (data[key][i].uploaders[entry].rssi && typeof data[key][i].uploaders[entry].rssi === "number") {
                                    dataTempEntry.callsign[uploader_callsign].rssi = + data[key][i].uploaders[entry].rssi.toFixed(1);
                                }
                                if (data[key][i].uploaders[entry].frequency && typeof data[key][i].uploaders[entry].frequency === "number") {
                                    dataTempEntry.callsign[uploader_callsign].frequency = + data[key][i].uploaders[entry].frequency.toFixed(4);
                                }  
                                if (data[key][i].uploaders[entry].tone_spacing && typeof data[key][i].uploaders[entry].tone_spacing === "number") {
                                    dataTempEntry.callsign[uploader_callsign].tone_spacing = + data[key][i].uploaders[entry].tone_spacing.toFixed(1);
                                }  
        
                            }
                        }
                        dataTempEntry.gps_alt = parseFloat((data[key][i].alt).toPrecision(8));
                        if (dataTempEntry.gps_alt > maximumAltitude) {
                            maximumAltitude = dataTempEntry.gps_alt;
                        }
                        // APRS Altitude filter.
                        if (maximumAltitude < 1500 && aprsflag && !showAprs) {
                            continue;
                        }
                        // Testing payload filter.
                        if (data[key][i].telemetry_hidden && !showTesting){
                            continue;
                        }
                        // No GPS lock filter. Filter out positions with sats = 0, if sats is provided.
                        // The historical data API will do this already, but we need this to filter out data
                        // coming in via websockets.
                        if (data[key][i].hasOwnProperty("sats")){
                            if (data[key][i].sats == 0){
                                continue;
                            }
                        }
                        //
                        dataTempEntry.gps_lat = parseFloat((data[key][i].lat).toPrecision(8));
                        dataTempEntry.gps_lon = parseFloat((data[key][i].lon).toPrecision(8));
                        if (dataTempEntry.gps_lat == 0 && dataTempEntry.gps_lon == 0) {
                            continue;
                        }
                        if (data[key][i].heading) {
                            dataTempEntry.gps_heading = data[key][i].heading;
                        }
                        dataTempEntry.gps_time = data[key][i].datetime;
                        dataTempEntry.server_time = data[key][i].datetime;
                        dataTempEntry.vehicle = payload_callsign;
                        dataTempEntry.position_id = payload_callsign + "-" + data[key][i].datetime;
                        if (!dataTempEntry.hasOwnProperty("data")) {
                            dataTempEntry.data = {};
                        }

                        // Automatically add all remaining fields as data excluding excluded fields

                        for (let field in data[key][i]) {
                            if (excludedFields.includes(field)) {
                                continue;
                            }
                            if (uniqueKeys.hasOwnProperty(field)) {
                                dataTempEntry.data[field] = parseFloat(data[key][i][field]).toFixed(uniqueKeys[field].precision);
                            } else {
                                dataTempEntry.data[field] = data[key][i][field];
                            }
                        }

                        // Payload data post-processing, where we can modify / add data elements if needed.

                        // Determine if this payload is a WSPR payload
                        // We determine this through either the modulation field, or comment field.
                        var wspr_payload = false;
                        if (data[key][i].hasOwnProperty("modulation")){
                            if(data[key][i].modulation.includes("WSPR")){
                                wspr_payload = true;
                            }
                        }
                        if (data[key][i].hasOwnProperty("comment")){
                            if(data[key][i].comment.includes("WSPR")){
                                wspr_payload = true;
                            }
                        }

                        // For WSPR payloads, calculate solar elevation.
                        if(wspr_payload){
                            dataTempEntry.data['solar_elevation'] = (SunCalc.getPosition(stringToDateUTC(dataTempEntry.gps_time), dataTempEntry.gps_lat, dataTempEntry.gps_lon, dataTempEntry.gps_alt).altitude/rad).toFixed(1);
                        }


                        dataTemp.push(dataTempEntry);
                    }
                }
            }
        }
    }
    response.positions.position = dataTemp;
    return response;
}