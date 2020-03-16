$(document).ready(function () {
    var stats = {
        msg_total: 0,
        msg_sent: 0,
        msg_rcvd: 0,
        contacts: {

        }
    };

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

    $("#start").click(function () {
        $("#status").text("Loading file...");
        var fr = new FileReader();
        fr.onload = function(){
            $("#status").text("Parsing XML...");
            var xmldoc = $.parseXML(fr.result);
            $("#status").text("Getting SMS records...");
            var sms = $(xmldoc).find("sms");
            $("#status").text("Scanning SMS records...");

            console.log(sms[0])
            for(var i = 0; i < sms.length; i++){
                $("#status").text(`Scanning SMS records (${i}/${sms.length})`);
                //update total messages count
                stats.msg_total += 1;

                //update sent/recieved messages count
                if($(sms[i]).attr('type') === '2'){
                    stats.msg_sent += 1;
                }
                else if($(sms[i]).attr('type') === '1'){
                    stats.msg_rcvd += 1;
                }
                else{
                    console.log(`${$(sms[i]).attr('type')} does not equal ${'1'} or ${'2'}`)
                }

                //make sure contact exists in stats object
                var exists = false;

                if(!exists){
                    
                }

            }
            $("#status").text("Finished!");
            console.log(stats)
        };
        // fr.readAsDataURL(document.getElementById('srcfile').files[0]);
        fr.readAsText(document.getElementById('srcfile').files[0]);
    });
});
