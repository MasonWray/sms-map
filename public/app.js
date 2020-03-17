var messages = new Array();

var init_InboundOutboundChart = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [
                0, 0,
            ],
            backgroundColor: [
                '#28a745',
                '#dc3545'
            ],
            label: 'Dataset 1'
        }],
        labels: [
            'Inbound',
            'Outbound',
        ]
    },
    options: {
        responsive: true,
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Total Messages'
        },
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 0
        },
        circumference: Math.PI,
        rotation: -Math.PI
    }
};

var init_VolumeByContactChart = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [],
            backgroundColor: [],
            label: 'Dataset 1'
        }],
        labels: []
    },
    options: {
        responsive: true,
        legend: {
            position: 'left',
        },
        title: {
            display: true,
            text: 'Messasge Volume by Contact'
        },
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 0
        }
    }
};

function getRandomColor() {
    // return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    return `hsl(${Math.floor(Math.random() * 357)}, 62%, 55%)`;
}

$(document).ready(function () {
    // init charts
    var InboundOutboundChart = new Chart($("#InboundOutboundChart"), init_InboundOutboundChart);
    var VolumeByContactChart = new Chart($("#VolumeByContactChart"), init_VolumeByContactChart);

    $("#start").prop('disabled', true)

    $("#srcfile").change(function () {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
            return;
        }

        var input = document.getElementById('srcfile');
        if (!input) {
            alert("Um, couldn't find the fileinput element.");
            $("#start").prop('disabled', true)
        }
        else if (!input.files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.");
            $("#start").prop('disabled', false)
        }
        else if (!input.files[0]) {
            alert("Please select a file before starting analysis!");
            $("#start").prop('disabled', true)
        }
        else {
            $("#start").prop('disabled', false)
        }
    });

    // Process XML File
    $("#start").click(function () {
        $("#status").text("Loading file...");
        var fr = new FileReader();
        fr.onload = function () {
            $("#status").text("Parsing XML...");
            var xmldoc = $.parseXML(fr.result);
            $("#status").text("Getting SMS records...");
            var sms = $(xmldoc).find("sms");

            // Extract data from XML into memory
            $("#status").text("Generating data structure...");
            // console.log(sms[0])
            // console.log(sms[12])
            for (var i = 0; i < sms.length; i++) {
                var message = {
                    type: 'sms',
                    direction: ($(sms[i]).attr("type") == '2') ? 'out' : 'in',
                    date: $(sms[i]).attr("date"),
                    name: $(sms[i]).attr("contact_name"),
                };

                messages.push(message);
            }

            // Process message data into charts
            $("#status").text("Processing messages...");
            var count = 0;

            iteration(0);

            function iteration(i) {
                InboundOutboundChart.update();
                VolumeByContactChart.update();
                var message = messages[i];

                // Add message to I/O chart
                InboundOutboundChart.options.title.text = `Total Messages: ${i}`;
                if (message.direction == 'out') {
                    InboundOutboundChart.data.datasets[0].data[1]++
                }
                else {
                    InboundOutboundChart.data.datasets[0].data[0]++
                }

                // Add message to VolumeByContactChart
                if (VolumeByContactChart.data.labels.includes(message.name)) {
                    VolumeByContactChart.data.datasets[0].data[
                        VolumeByContactChart.data.labels.findIndex(name => {
                            return name == message.name;
                        })
                    ]++;
                }
                else {
                    VolumeByContactChart.data.labels.push(message.name);
                    VolumeByContactChart.data.datasets[0].data.push(1);
                    VolumeByContactChart.data.datasets[0].backgroundColor.push(getRandomColor());
                }
                var contacts = new Array();
                for (var j = 0; j < VolumeByContactChart.data.labels.length; j++) {
                    contacts.push({
                        data: VolumeByContactChart.data.datasets[0].data[j],
                        color: VolumeByContactChart.data.datasets[0].backgroundColor[j],
                        name: VolumeByContactChart.data.labels[j]
                    });
                }
                contacts.sort((a, b) => { return b.data - a.data });
                VolumeByContactChart.data.datasets[0].data = contacts.map((contact) => { return contact.data })
                VolumeByContactChart.data.datasets[0].backgroundColor = contacts.map((contact) => { return contact.color })
                VolumeByContactChart.data.labels = contacts.map((contact) => { return contact.name });

                // Update progress bar
                $("#progress").css("width", `${i / messages.length * 100}%`);
                $("#progress").text(`${Math.floor(i / messages.length * 100)}%`)

                // Call the next iteration
                if (i + 1 < messages.length) {
                    requestAnimationFrame(function () {
                        window.setTimeout(iteration, 10, i +1);
                    });
                }
            };
        };
        fr.readAsText(document.getElementById('srcfile').files[0]);
    });
});
