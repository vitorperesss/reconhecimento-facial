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

video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

const labeledDescriptors = await loadLabeledImages();

if (!labeledDescriptors.length) {
  console.warn("Nenhum rosto cadastrado ainda.");
  return; // Ou você pode criar o faceMatcher com array vazio, mas ele não vai reconhecer nada.
}

const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);


  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    for (const detection of resizedDetections) {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: bestMatch.label,
        boxColor: bestMatch.label === "Acesso Negado" ? "red" : "green"
      });
      drawBox.draw(canvas);
    }
  }, 100);
});

function loadLabeledImages() {
  return fetch('/faces')
    .then(res => res.json())
    .then(data => {
      return data.map(person => {
        const descriptors = person.descriptors.map(d => new Float32Array(d));
        return new faceapi.LabeledFaceDescriptors('Acesso Permitido Para:'+person.nome, descriptors);
      });
    });
}


