const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error("Erro ao acessar a câmera:", err));
}

video.addEventListener('play', async () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  const labeledDescriptors = await loadLabeledImages();
  console.log("Descritores carregados:", labeledDescriptors.length);

  const faceMatcher = labeledDescriptors.length > 0
    ? new faceapi.FaceMatcher(labeledDescriptors, 0.6)
    : null;

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    for (const detection of resizedDetections) {
      const box = detection.detection.box;
      let label = "Acesso Negado";
      let boxColor = "red";

      if (faceMatcher) {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        if (bestMatch.label !== 'unknown') {
          label = bestMatch.label;
          boxColor = "green";
        }
      }

      const drawBox = new faceapi.draw.DrawBox(box, {
        label: label,
        boxColor: boxColor
      });

      drawBox.draw(canvas);
    }
  }, 100);
});

function loadLabeledImages() {
  return fetch('/faces')
    .then(res => res.json())
    .then(data => {
      console.log("Dados recebidos de /faces:", data);
      return data.map(person => {
        const descriptors = person.descriptors.map(d => new Float32Array(d));
        return new faceapi.LabeledFaceDescriptors('Acesso Permitido Para: ' + person.nome, descriptors);
      });
    });
}
