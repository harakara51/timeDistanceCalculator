
$(document).ready(function () {
    $('#distance_form').submit(function(e){
        event.preventDefault();
        var origin = $('#origin').val();
        var destination = $('#destination').val();
        var distance_text = findDistanceFromGoogleAPI(origin, destination);
    });
   
 
});

if (isAPIAvailable()) {
    $('#files').bind('change', handleFileSelect);
}

function findDistanceFromGoogleAPI(origin, destinationaddress, data) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
    {
        origins: [origin],
        destinations: [destinationaddress],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
    }, callback.bind(data));
};

function callback(response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
        $('#result').html(err);
    } else {
        let origin = response.originAddresses[0];
        let destination = response.destinationAddresses[0];
        let row;
 
            if (response.rows[0].elements[0].status == "OK") {
                let time = response.rows[0].elements[0].duration.value / 60
                let distance = response.rows[0].elements[0].distance.value * 1000 * 0.621371;
                $('#result').html("It is " + response.rows[0].elements[0].distance.text + " from " + origin + " to " +
                    destination + 'total time is ' + response.rows[0].elements[0].duration.text);
                row = {
                    "origin": this[0], "Destination": this[1], "Station": this[2], "TotalMile": this[3], "TotalTime": this[4],
                    "GMAPDistance": distance, "GMAPTime": time
                };
            }
            else {

                $('#result').html("NO result found "
                              + origin + " and " + destination);
                row = {
                    "origin": this[0], "Destination": this[1], "Station": this[2], "TotalMile": this[3], "TotalTime": this[4],
                    "GMAPDistance": 0, "GMAPTime": 0
                }
               
            }
            $.post("http://localhost:59809/Api/Tables", row);
        }
    }


    function isAPIAvailable() {
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
            return true;
        } else {
            // source: File API availability - http://caniuse.com/#feat=fileapi
            // source: <output> availability - http://html5doctor.com/the-output-element/
            document.writeln('The HTML5 APIs used in this form are only available in the following browsers:<br />');
            // 6.0 File API & 13.0 <output>
            document.writeln(' - Google Chrome: 13.0 or later<br />');
            // 3.6 File API & 6.0 <output>
            document.writeln(' - Mozilla Firefox: 6.0 or later<br />');
            // 10.0 File API & 10.0 <output>
            document.writeln(' - Internet Explorer: Not supported (partial support expected in 10.0)<br />');
            // ? File API & 5.1 <output>
            document.writeln(' - Safari: Not supported<br />');
            // ? File API & 9.2 <output>
            document.writeln(' - Opera: Not supported');
            return false;
        }
    }
    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object
        var file = files[0];
        // read the file metadata
        var output = ''
        output += '<span style="font-weight:bold;">' + escape(file.name) + '</span><br />\n';
        output += ' - FileType: ' + (file.type || 'n/a') + '<br />\n';
        output += ' - FileSize: ' + file.size + ' bytes<br />\n';
        output += ' - LastModified: ' + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a') + '<br />\n';
        // read the file contents
        printTable(file);
        // post the results
        // $('#list').append(output);
    }
    function printTable(file) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function (event) {
            var csv = event.target.result;
            var data = $.csv.toArrays(csv);
            var html = '';
            let time = 0;
            for (let i = 0; i < 1000; i++) {
                if (i > 0) {
                    console.debug(i);
                    time += 100;
                    if (data[i][1].length == 3) {
                        let destination = "00" + data[i][1];
                        setTimeout(() => findDistanceFromGoogleAPI(data[i][0], destination, data[i]), time);
                    }
                    else if (data[i][1].length == 4) {
                        let destination = ", 0" + data[i][1];
                        setTimeout(() => findDistanceFromGoogleAPI(data[i][0], destination, data[i]), time);
                    }
                    else {
                        setTimeout(() => findDistanceFromGoogleAPI(data[i][0], data[i][1], data[i]), time);
                    }
                }
            }
        };
        reader.onerror = function () { alert('Unable to read ' + file.fileName); };
    }
