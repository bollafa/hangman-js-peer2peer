function findCharIndex(str,chr) {
	let result = [];
	for(let i = 0; i < str.length; i++) {
		if(str.charAt(i) === chr) {
			result.push(i);
		}
	}
		return result;
}


function guess(passcode,chr,current) {
	current = current || "";
	current = Array.from(current) ;
	current = current.length == 0 ?
		 Array(passcode.length).fill(' ') : 
		current;
	console.log(current);
	let pos = findCharIndex(passcode,chr);

	if(pos.length == 0) {
		return  current.join('');
	}

	pos.forEach(function(value) {
		current[value] = chr;
	});
	return current.join('');
}
function resizeInput(e) {
	e.target.style.width = 
		(e.target.value.length||1)*(1.5)+"ch";
}

var password = "disconnected";
let used_values = [];
document.addEventListener("DOMContentLoaded", function(event) { 
	let underlined = document.querySelectorAll('.underlined');
	underlined.forEach(function(value) {
		value.oninput = resizeInput;
		resizeInput({target:value});
	});

	let send_guess_button = 
		document.querySelector('#send_guess');
	if(send_guess_button) {
		send_guess_button.onclick = send_guess;
	}

	function send_guess(){
		let guesse = document.querySelector('#guess');
		let input = document.querySelector('#secret_input');
		if(!guesse.checkValidity()){
			return;
		}
		let old_val = input.value;
		input.value =  guess(password,guesse.value,input.value);
		if(old_val === input.value) {
			if(!used_values.includes(guesse.value)) {
				let node = document.createElement("li");
				let text = document
					.createTextNode(guesse.value);
				node.appendChild(text);
				document.querySelector('ul')
					.appendChild(node);
			}
		}

		used_values.push(guesse.value);

		resizeInput({target:input});

		if(input.value === password) {
			console.log("You have won it!");
		}
	}
});

function start_game() {
	if(window.say) {
		say('$'+document.querySelector('input')
			.value	);
	}
}

// JameshFisher code below https://jameshfisher.github.io/serverless-webrtc/index.html


      var RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;
      var peerConn = new RTCPeerConnection({'iceServers': [{'urls': ['stun:stun.l.google.com:19302']}]});
      console.log('Call create(), or join("some offer")');
      function create() {
        console.log("Creating ...");
        var dataChannel = peerConn.createDataChannel('test');
        dataChannel.onopen = (e) => {
          window.say = (msg) => { dataChannel.send(msg); };
          console.log('Say things with say("hi")');
        };
        dataChannel.onmessage = (e) => { console.log('Got message:', e.data); };
        peerConn.createOffer({})
          .then((desc) => peerConn.setLocalDescription(desc))
          .then(() => {})
          .catch((err) => console.error(err));
        peerConn.onicecandidate = (e) => {
          if (e.candidate == null) {
            console.log("Get joiners to call: ", "join(", JSON.stringify(peerConn.localDescription), ")");
          }
        };
        window.gotAnswer = (answer) => {
          console.log("Initializing ...");
          peerConn.setRemoteDescription(new RTCSessionDescription(answer));
        };
      }

      function join(offer) {
        console.log("Joining ...");

        peerConn.ondatachannel = (e) => {
          var dataChannel = e.channel;
          dataChannel.onopen = (e) => {
            window.say = (msg) => { dataChannel.send(msg); };
            console.log('Say things with say("hi")');
          };
          dataChannel.onmessage = (e) => { 
		  if(e.data[0] === '$') {
			  used_values = [];
			  password = e.data.slice(1);
			  document.querySelector('#secret_input').value = Array(password.length).fill(' ').join('');
			  resizeInput({
				target: document.querySelector('#secret_input'),});

		  }
	//	  console.log('Got message:', e.data); 
	  }
        };

        peerConn.onicecandidate = (e) => {
          if (e.candidate == null) {
            console.log("Get the creator to call: gotAnswer(", JSON.stringify(peerConn.localDescription), ")");
          }
        };

        var offerDesc = new RTCSessionDescription(offer);
        peerConn.setRemoteDescription(offerDesc);
        peerConn.createAnswer({})
          .then((answerDesc) => peerConn.setLocalDescription(answerDesc))
          .catch((err) => console.warn("Couldn't create answer"));
      }
