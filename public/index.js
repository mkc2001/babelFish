var socket = io();





var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
let mediaRecorder;

let $recordButton = $('#recordButton')
let $swap = $('#swapButton')
let timeoutId
let result;
let recordedText;
let sourceLang = 'en'
let srcTag = 'en-US'
let targetLang = 'es'
let targetTag = 'es-US'

const synth = window.speechSynthesis;
synth.lang = targetTag
const recognition = new window.SpeechRecognition;
recognition.lang = srcTag;
recognition.interimResults = true;
recognition.maxAlternatives = 1;



socket.on('message', async function (msg) {
    console.log(msg)
    let header;
    if (targetLang == 'en') {
        header = 'Inglés'
    } else {
        header = 'Spanish'
    }
    let translatedText = await translate(sourceLang, targetLang, msg)
    $('#list').prepend(`<div class="card my-2 " style="width: 18rem;">
    <div class="card-body">
        <div class="d-flex flex-row">
            <h5 class="card-title cardHeader" id="card${msg}">${header}</h5><button class="btn btn-primary mr-2 h-100 mx-2" id="swapButt"><i
            class="bi bi-arrow-left-right"></i></button>
        </div>
        <p class="card-text">${translatedText}</p>
        <button href="#" class="btn btn-primary readButt" id="read" >Read</button>
        <button href="#" class="btn btn-primary recButt">Play Recording</button>
    </div>
</div>`)
    $(`#read`).on('click', (ev) => {
        console.log(ev)
        const utterThis = new SpeechSynthesisUtterance(translatedText);
        utterThis.lang = targetTag;
        synth.speak(utterThis)
    })
    $(`#swapButt`).on('click', () => {
        console.log('in')
        $(`#card${msg}`).html('x')
    })
    // if (sourceLang == 'en') {
    //     $('#targetHeader').html('Spanish')
    // } else {
    //     $('#targetHeader').html('English')
    // }
    // $('#translatedText').html(translatedText)

});

recognition.onresult = event => {
    if (event.results[event.resultIndex][0].transcript != undefined) {
        if (sourceLang == 'en') {
            $('#sourceHeader').html('English')
            $('#recordLabel').html('Stop Recording')
        } else {
            $('#sourceHeader').html('Español')
            $('#recordLabel').html('Empezar de grabar')
        }
        result = event.results[event.resultIndex][0].transcript;
        $('#spokenText').html(result)
    }

};

recognition.onerror = event => {
    console.error(event.error);
};

recognition.onend = async () => {
    console.log('Recording ended');

    if (result != undefined) {
        socket.emit('message', result);
    }
};

$recordButton.on('click', () => {
    if ($recordButton.css('background-color') == 'rgb(255, 0, 0)') {
        clearTimeout(timeoutId)
        stopRec()
    }
    else {
        recordSpeech()
    }
})

$swap.on('click', () => {
    $('#sourceHeader').html('')
    $('#targetHeader').html('')
    $('#spokenText').html('')
    $('#translatedText').html('')

    if (sourceLang == 'en') {
        sourceLang = 'es'
        srcTag = 'es-US'
        targetLang = 'en'
        targetTag = 'en-US'
        $('#transLabel').html('Grabando en Español')
        $('#title').html('Traducir')
        $('#recordLabel').html('Empezar a grabar')
        $('.readButt').html('Leer')
        $('.recButt').html('Reproducir grabación')
        $('.cardHeader').each(function (i, obj) {
            console.log(sourceLang)
            console.log($(this).html())
            if ($(this).html() == 'English') {
                $(this).html('Inglés')
            } else {
                $(this).html('Español')
            }
        })
    } else {
        sourceLang = 'en'
        srcTag = 'en-US'
        targetLang = 'es'
        targetTag = 'es-US'
        $('#transLabel').html('Recording in English')
        // $swap.html('Swap')
        $('#title').html('Translator')
        $('#recordLabel').html('Start Recording')
        $('.readButt').html('Read')

        $('.recButt').html('Play Recording')
        $('.cardHeader').each(function (i, obj) {

            if ($(this).html() == 'Español') {
                $(this).html('Spanish')
            } else {
                $(this).html('English')
            }
        })


    }
    recognition.lang = srcTag;
    synth.lang = targetTag


})

function recordSpeech() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.start();

            const audioChunks = [];
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
            });


        });
    recognition.start();

    $recordButton.css('background-color', 'red')

    timeoutId = setTimeout(() => {
        stopRec()
        mediaRecorder.stop();

    }, 5000); // Record for 5 seconds, then stop
}

function stopRec() {
    recognition.stop();
    mediaRecorder.stop();
    $recordButton.css('background-color', '#2196f3')
    if (sourceLang == 'en') {
        $('#recordLabel').html('Start Recording')
    } else {
        $('#recordLabel').html('Para de grabar')
    }
}


async function translate(source, target, translateString) {


    const options = {
        method: 'POST',
        url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${translateString}`,
    };

    let response = await axios.request(options)
    return response.data[0][0][0]

}