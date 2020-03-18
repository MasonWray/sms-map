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
            text: 'Inbound/Outbound Messages'
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

var init_InboudOutboundByTimeChart = {
    type: 'line',
    data: {
        labels: [
            "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
            "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
        datasets: [{
            label: "Inbound",
            backgroundColor: "#28a745",
            borderColor: "#28a745",
            fill: false,
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            label: "Outbound",
            backgroundColor: "#dc3545",
            borderColor: "#dc3545",
            fill: false,
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            label: "Total",
            backgroundColor: "#474747",
            borderColor: "#474747",
            fill: false,
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }]
    },
    options: {
        responsive: true,
        legend: {
            position: 'bottom'
        },
        title: {
            display: true,
            text: "Inboud/Outbound by Time"
        }
    }
};

var init_VolumeByDateChart = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    }
};

function getRandomColor(string) {
    var hash = 0, i, chr;
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return `hsl(${hash % 360}, 62%, 55%)`;
}

function initCharts() {
    InboundOutboundChart = new Chart($("#InboundOutboundChart"), init_InboundOutboundChart);
    VolumeByContactChart = new Chart($("#VolumeByContactChart"), init_VolumeByContactChart);
    InboudOutboundByTimeChart = new Chart($("#InboudOutboundByTimeChart"), init_InboudOutboundByTimeChart);
    // VolumeByDateChart = new Chart($("#VolumeByDateChart"), init_VolumeByDateChart);
}

var InboundOutboundChart
var VolumeByContactChart
var InboudOutboundByTimeChart
var VolumeByDateChart

$(document).ready(function () {
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
        initCharts();
        var fr = new FileReader();
        fr.onload = function () {
            var xmldoc = $.parseXML(fr.result);
            var sms = $(xmldoc).find("sms");

            // Extract data from XML into memory
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
            iteration(0);

            function iteration(i) {
                //Re-render all charts
                InboundOutboundChart.update();
                VolumeByContactChart.update();
                InboudOutboundByTimeChart.update();
                // VolumeByDateChart.update();

                var message = messages[i];

                // Add message to I/O chart
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
                    VolumeByContactChart.data.datasets[0].backgroundColor.push(getRandomColor(message.name));
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

                // Add message to InboudOutboundByTimeChart
                var d = new Date(message.date * 1);
                // console.log(`${d} | ${d.getHours()}`)
                if (message.direction == 'out') {
                    InboudOutboundByTimeChart.data.datasets[1].data[d.getHours()]++;
                }
                else {
                    InboudOutboundByTimeChart.data.datasets[0].data[d.getHours()]++;
                }
                InboudOutboundByTimeChart.data.datasets[2].data[d.getHours()]++;

                // Add message to VolumeByDateChart

                // Update progress bar
                $("#progress").css("width", `${i / messages.length * 100}%`);
                $("#progress").text(`${Math.ceil(i / messages.length * 100)}%`)

                //Update counter and date
                $("#counter").text(`(${i + 1}/${messages.length})`);
                var d = new Date(message.date * 1);
                $("#date").text(d);

                // Call the next iteration
                if (i + 1 < messages.length) {
                    requestAnimationFrame(function () {
                        window.setTimeout(iteration, 20, i + 1);
                    });
                }
            };
        };
        fr.readAsText(document.getElementById('srcfile').files[0]);
    });
});
