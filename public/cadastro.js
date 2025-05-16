const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => video.srcObject = stream);
}

window.capturar = async function() {
  const nome = document.getElementById("nome").value.trim();
  if (!nome) {
    alert("Digite o nome!");
    return;
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert("Nenhum rosto detectado!");
    return;
  }

  const descritor = Array.from(detection.descriptor);

  const res = await fetch('/cadastrar-rosto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descritor })
  });

  const msg = await res.text();
  alert(msg);
};


