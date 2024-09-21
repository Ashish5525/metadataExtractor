document
  .getElementById("file-input")
  .addEventListener("change", function (event) {
    const files = event.target.files;
    const imagePreview = document.getElementById("image-preview");
    const metadataOutput = document.getElementById("metadata-output");
    imagePreview.innerHTML = "";
    metadataOutput.value = "";

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        imagePreview.appendChild(img);

        const fileType = file.type;

        if (fileType.startsWith("image/") || fileType === "image/png") {
          // Handle images including PNG
          EXIF.getData(file, function () {
            const metadata = EXIF.getAllTags(this);
                    displayMetadata(file.name, metadata, metadataOutput);
                });
            } else if (fileType.startsWith('audio/')) {
                // Handle audio files
                mm.parseBlob(file).then(metadata => {
                    displayMetadata(file.name, metadata, metadataOutput);
                }).catch(err => {
                    metadataOutput.value += `Metadata for ${file.name}: Error parsing audio - ${err}\n\n`;
                });
            } else if (fileType.startsWith('video/')) {
                // Handle video files
                metadataOutput.value += `Metadata for ${file.name}: Video metadata extraction not implemented\n\n`;
            } else if (fileType === 'application/pdf') {
                // Handle PDF files
                extractPdfMetadata(file).then(metadata => {
                    displayMetadata(file.name, metadata, metadataOutput);
                }).catch(err => {
                    metadataOutput.value += `Metadata for ${file.name}: Error parsing PDF - ${err}\n\n`;
                });
            } else {
                metadataOutput.value += `Metadata for ${file.name}: Unsupported format\n\n`;
            }

            // Add a space between metadata for different files
            if (index < files.length - 1) {
                metadataOutput.value += `\n`; // Space between entries
            }
        };
        reader.readAsDataURL(file);
    });
});

async function extractPdfMetadata(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    
    // Accessing the document's metadata
    const { title, author, subject, keywords, creator, producer, created, modified } = pdfDoc.getInformation();
    
    return {
        Title: title || "N/A",
        Author: author || "N/A",
        Subject: subject || "N/A",
        Keywords: keywords || "N/A",
        Creator: creator || "N/A",
        Producer: producer || "N/A",
        CreationDate: created ? new Date(created).toLocaleString() : "N/A",
        ModificationDate: modified ? new Date(modified).toLocaleString() : "N/A",
    };
}

function displayMetadata(fileName, metadata, output) {
    output.value += `Metadata for ${fileName}:\n`;
    if (Object.keys(metadata).length === 0) {
        output.value += "No metadata found\n";
    } else {
        const excludeTags = ["MakerNote", "UserComment"]; // Customize based on format
        for (const [tag, value] of Object.entries(metadata)) {
            if (!excludeTags.includes(tag)) {
                output.value += `${tag}: ${value}\n`;
            }
        }
    }
    output.value += '\n'; // Extra space for better readability
}
