const uploadImageBtn = document.getElementById("upload-image-btn");
const removeImageBtn = document.getElementById("remove-image-btn");
const imageInput = document.getElementById("image-input");
const currentImage = document.getElementById("current-image");
const addMarkerBtn = document.getElementById("add-marker-btn");
const removeMarketBtn = document.getElementById("remove-marker-btn");
const saveMapBtn = document.getElementById("save-map-btn");
const imageContainer = document.getElementById("image-container");

const editor = document.getElementById("marker-editor");
const editorDescription = document.getElementById("editor-description");
const editorImageInput = document.getElementById("editor-image-input");
const editorAddImage = document.getElementById("editor-add-image");
const editorImagePreview = document.getElementById("editor-image-preview");
const editorSave = document.getElementById("editor-save");
const editorClear = document.getElementById("editor-clear");
const addQuestionAnswerBtn = document.getElementById("add-question-answer");
const questionInput = document.getElementById("question-input");
const answerInput = document.getElementById("answer-input");
const questionAnswerList = document.getElementById("question-answer-list");

let markers = [];
let activeMarker = null;
let savedMapData = JSON.parse(localStorage.getItem("savedMapData")) || [];

// Resim yükleme
uploadImageBtn.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    currentImage.src = reader.result;
    currentImage.classList.remove("d-none");
    addMarkerBtn.disabled = false;
    removeMarketBtn.disabled = false;
    saveMapBtn.disabled = false;
    removeImageBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

// Harita kaydetme
saveMapBtn.addEventListener("click", () => {
    const mapNameInput = document.getElementById("map-name");
    const mapName = mapNameInput.value.trim();
  
    if (!mapName) {
      alert("Harita adı girilmelidir!");
      return;
    }
  
    if (!currentImage.src) {
      alert("Harita resmi yüklenmedi!");
      return;
    }
  
    // Harita verilerini oluştur
    const mapData = {
      name: mapName,
      image: currentImage.src, // Harita resmi
      markers: markers.map(marker => ({
        left: marker.style.left,
        top: marker.style.top,
        description: marker.dataset.description || "",
        images: JSON.parse(marker.dataset.images || "[]"),
        qa: JSON.parse(marker.dataset.qa || "[]"),
      })),
    };
  
    // Harita verilerini kaydet
    savedMapData.push(mapData);
    localStorage.setItem("savedMapData", JSON.stringify(savedMapData));
  
    // Yeni kaydedilen haritayı listele
    displaySavedMap(mapData, savedMapData.length - 1);
  
    alert("Harita başarıyla kaydedildi!");
  });
  
  

// Resmi kaldırma
removeImageBtn.addEventListener("click", () => {
  currentImage.src = "";
  currentImage.classList.add("d-none");
  addMarkerBtn.disabled = true;
  removeMarketBtn.disabled = true;
  saveMapBtn.disabled = true;
  removeImageBtn.disabled = true;
  clearMarkers();
});

// Marker ekleme
addMarkerBtn.addEventListener("click", () => {
  const marker = createMarker("50%", "50%");
  imageContainer.appendChild(marker);
  enableDragging(marker);
});

// Marker silme
removeMarketBtn.addEventListener("click", () => {
  const lastMarker = imageContainer.querySelector(".gps-marker");
  if (lastMarker) {
    lastMarker.remove();
  }
});

// Marker sürükleme
function enableDragging(marker) {
    marker.addEventListener("mousedown", startDrag);
    marker.addEventListener("touchstart", startDrag, { passive: false });
  
    function startDrag(e) {
      e.preventDefault();
  
      const rect = imageContainer.getBoundingClientRect();
  
      function move(e) {
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
        const x = Math.min(Math.max(0, ((clientX - rect.left) / rect.width) * 100), 100);
        const y = Math.min(Math.max(0, ((clientY - rect.top) / rect.height) * 100), 100);
  
        marker.style.left = `${x}%`;
        marker.style.top = `${y}%`;
      }
  
      function stopDrag() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", stopDrag);
      }
  
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchmove", move, { passive: false });
      document.addEventListener("touchend", stopDrag);
    }
  }

// Marker oluşturma
function createMarker(left, top) {
  const marker = document.createElement("div");
  marker.classList.add("gps-marker");
  marker.style.left = left;
  marker.style.top = top;
  marker.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
    </svg>`;
  marker.dataset.images = JSON.stringify([]);
  marker.dataset.qa = JSON.stringify([]);
  marker.addEventListener("click", () => showEditor(marker));
  markers.push(marker);
  return marker;
}

// Düzenleme alanını gösterme
function showEditor(marker) {
  activeMarker = marker;
  editorDescription.value = marker.dataset.description || "";
  renderEditorImages(JSON.parse(marker.dataset.images || "[]"));
  renderQuestionsAnswers(JSON.parse(marker.dataset.qa || "[]"));
  editor.style.display = "block";
}

// Resim önizleme
function renderEditorImages(images) {
  editorImagePreview.innerHTML = "";
  images.forEach(({ src, description }) => {
    const div = document.createElement("div");
    div.classList.add("image-item", "d-flex", "align-items-start", "mb-2");

    div.innerHTML = `
      <img src="${src}" alt="Resim" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
      <textarea class="form-control" placeholder="Resim açıklaması ekle" style="flex: 1; margin-right: 10px;">${description}</textarea>
      <button class="btn btn-sm btn-danger remove-image">Sil</button>
    `;

    div.querySelector(".remove-image").addEventListener("click", () => div.remove());
    editorImagePreview.appendChild(div);
  });
}

// Soru-Cevapları gösterme
function renderQuestionsAnswers(qaList) {
  questionAnswerList.innerHTML = "";
  qaList.forEach(({ question, answer }) => {
    const qaItem = document.createElement("div");
    qaItem.classList.add("mb-2", "p-2", "border", "rounded");

    qaItem.innerHTML = `
      <strong>Soru:</strong> ${question}<br>
      <strong>Cevap:</strong> ${answer}
      <button class="btn btn-sm btn-danger float-right remove-qa">Sil</button>
    `;
    qaItem.querySelector(".remove-qa").addEventListener("click", () => qaItem.remove());
    questionAnswerList.appendChild(qaItem);
  });
}

// Resim ekleme
editorAddImage.addEventListener("click", () => {
  if (editorImagePreview.children.length >= 5) return alert("En fazla 5 resim eklenebilir.");
  const file = editorImageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const div = document.createElement("div");
      div.classList.add("image-item", "d-flex", "align-items-start", "mb-2");

      div.innerHTML = `
        <img src="${reader.result}" alt="Resim" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
        <textarea class="form-control" placeholder="Resim açıklaması ekle" style="flex: 1; margin-right: 10px;"></textarea>
        <button class="btn btn-sm btn-danger remove-image">Sil</button>
      `;

      div.querySelector(".remove-image").addEventListener("click", () => div.remove());
      editorImagePreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  }
});

// Soru-Cevap ekleme
addQuestionAnswerBtn.addEventListener("click", () => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!question || !answer) {
    alert("Hem soru hem de cevap alanlarını doldurmalısınız!");
    return;
  }

  const qaItem = document.createElement("div");
  qaItem.classList.add("mb-2", "p-2", "border", "rounded");

  qaItem.innerHTML = `
    <strong>Soru:</strong> ${question}<br>
    <strong>Cevap:</strong> ${answer}
    <button class="btn btn-sm btn-danger float-right remove-qa">Sil</button>
  `;
  qaItem.querySelector(".remove-qa").addEventListener("click", () => qaItem.remove());
  questionAnswerList.appendChild(qaItem);

  questionInput.value = "";
  answerInput.value = "";
});

// Marker bilgilerini kaydet
editorSave.addEventListener("click", () => {
    if (!activeMarker) {
      alert("Kaydedilecek bir marker seçilmedi!");
      return;
    }
  
    // Resim ve açıklama bilgilerini al
    const images = Array.from(editorImagePreview.querySelectorAll(".image-item")).map(item => ({
      src: item.querySelector("img").src,
      description: item.querySelector("textarea").value.trim(),
    }));
  
    const qaList = Array.from(questionAnswerList.querySelectorAll(".p-2")).map(item => {
        const questionElement = item.querySelector("strong:nth-child(1)");
        const answerElement = item.querySelector("strong:nth-child(2)");
        return {
            question: questionElement ? questionElement.innerText.replace("Soru: ", "") : "",
            answer: answerElement ? answerElement.innerText.replace("Cevap: ", "") : "",
        };
    });
  
    // Marker bilgilerini güncelle
    activeMarker.dataset.description = editorDescription.value;
    activeMarker.dataset.images = JSON.stringify(images);
    activeMarker.dataset.qa = JSON.stringify(qaList);
  
    // Kaydetme işlemi başarılı mesajı
    alert("Konum bilgileri başarıyla kaydedildi!");
  
    // Düzenleme alanını temizle ve gizle
    editorClear.click();
  });

// Düzenleme alanını temizleme
editorClear.addEventListener("click", () => {
  activeMarker = null;
  editorDescription.value = "";
  editorImagePreview.innerHTML = "";
  questionAnswerList.innerHTML = "";
  editor.style.display = "none";
});

function displaySavedMap(mapData, index) {
    const savedMapsContainer = document.getElementById("saved-maps-container");
    if (!savedMapsContainer) {
        console.error("Harita konteyneri bulunamadı!");
        return;
    }

    // Card oluştur
    const mapElement = document.createElement("div");
    mapElement.classList.add("card", "mb-3");
    mapElement.style.maxWidth = "540px";

    mapElement.innerHTML = `
        <div class="row g-0">
            <div class="col-md-4">
                <img src="${mapData.image}" alt="${mapData.name}" class="img-fluid rounded-start">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">${mapData.name}</h5>
                    <p class="card-text">Kaydedilen harita verileri bu alanda görünebilir.</p>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-primary btn-sm me-2 load-map" data-index="${index}">Yükle</button>
                        <button class="btn btn-secondary btn-sm me-2 edit-map" data-index="${index}">Düzenle</button>
                        <button class="btn btn-danger btn-sm delete-map" data-index="${index}">Sil</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    savedMapsContainer.appendChild(mapElement);

    // Harita yükleme butonuna tıklama
    mapElement.querySelector(".load-map").addEventListener("click", () => loadMap(index));

    // Harita düzenleme butonuna tıklama
    mapElement.querySelector(".edit-map").addEventListener("click", () => editMap(index));

    // Harita silme butonuna tıklama
    mapElement.querySelector(".delete-map").addEventListener("click", () => deleteMap(index));
}

// Harita silme
function deleteMap(index) {
    if (confirm("Bu haritayı silmek istediğinize emin misiniz?")) {
        savedMapData.splice(index, 1);
        localStorage.setItem("savedMapData", JSON.stringify(savedMapData));
        document.getElementById("saved-maps-container").innerHTML = "";
        savedMapData.forEach((mapData, idx) => displaySavedMap(mapData, idx));
        alert("Harita başarıyla silindi!");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    savedMapData = JSON.parse(localStorage.getItem("savedMapData")) || [];
    savedMapData.forEach((mapData, index) => displaySavedMap(mapData, index));
});
// Harita yükleme
function loadMap(index) {
    const mapData = savedMapData[index];

    if (!mapData) {
        alert("Harita verisi bulunamadı!");
        return;
    }

    // Harita bilgilerini yükle
    currentImage.src = mapData.image;
    currentImage.classList.remove("d-none");
    addMarkerBtn.disabled = false;
    removeMarketBtn.disabled = false;
    saveMapBtn.disabled = false;
    removeImageBtn.disabled = false;

    // Önceki markerları temizle
    clearMarkers();

    // Markerları yükle
    mapData.markers.forEach(markerData => {
        const marker = createMarker(markerData.left, markerData.top);
        marker.dataset.description = markerData.description || "";
        marker.dataset.images = JSON.stringify(markerData.images || []);
        marker.dataset.qa = JSON.stringify(markerData.qa || []);
        imageContainer.appendChild(marker);
        enableDragging(marker);
    });

    alert(`"${mapData.name}" adlı harita yüklendi!`);
}

// Harita düzenleme
function editMap(index) {
    const mapData = savedMapData[index];
    if (!mapData) {
        alert("Düzenlenecek harita bulunamadı!");
        return;
    }

    // Düzenleme için harita bilgilerini form alanlarına yükle
    const mapNameInput = document.getElementById("map-name");
    mapNameInput.value = mapData.name;

    currentImage.src = mapData.image;
    currentImage.classList.remove("d-none");

    clearMarkers();
    mapData.markers.forEach(markerData => {
        const marker = createMarker(markerData.left, markerData.top);
        marker.dataset.description = markerData.description || "";
        marker.dataset.images = JSON.stringify(markerData.images || []);
        marker.dataset.qa = JSON.stringify(markerData.qa || []);
        imageContainer.appendChild(marker);
        enableDragging(marker);
    });

    alert("Harita düzenlemek için yüklendi. Değişiklikleri kaydedebilirsiniz.");
}

// Markerları temizleme
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}