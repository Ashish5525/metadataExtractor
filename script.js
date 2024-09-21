function handleFiles(files) {
    const preview = document.getElementById("image-preview");
    const metadataOutput = document.getElementById("metadata-output");
    preview.innerHTML = ""; 
    metadataOutput.value = "";

    Array.from(files).forEach(file => {
        const reader = new FileReader();

        // Display the image preview
        reader.onload = function(event) {
            const imgElement = document.createElement("img");
            imgElement.src = event.target.result;
            imgElement.alt = file.name;
            imgElement.style.maxWidth = "150px";
            imgElement.style.margin = "10px";
            preview.appendChild(imgElement);

            // Extract EXIF metadata using EXIF.js
            EXIF.getData(file, function() {
                const allMetaData = EXIF.getAllTags(this);
                metadataOutput.value += `Metadata for ${file.name}:\n`;

                if (Object.keys(allMetaData).length > 0) {
                    for (let tag in allMetaData) { 
                        if (tag !== 'UserComment' && tag !== 'MakerNote') {
                            metadataOutput.value += `${tag}: ${allMetaData[tag]}\n`;
                        }
                    }
                } else {
                    metadataOutput.value += "No EXIF metadata found. Extracting basic metadata:\n";
                    extractBasicMetadata(file, event.target.result);
                }
                metadataOutput.value += "\n"; 
            });
        };

        reader.readAsDataURL(file);
    });
}

// Function to extract basic metadata for PNGs and screenshots
function extractBasicMetadata(file, fileDataUrl) {
    const metadataOutput = document.getElementById("metadata-output");

    const fileSizeKB = (file.size / 1024).toFixed(2);

    const image = new Image();
    image.src = fileDataUrl;
    image.onload = function() {
        const width = image.naturalWidth;
        const height = image.naturalHeight;t
        metadataOutput.value += `File Name: ${file.name}\n`;
        metadataOutput.value += `File Size: ${fileSizeKB} KB\n`;
        metadataOutput.value += `Image Dimensions: ${width} x ${height} pixels\n`;
    };

    // MIME type (image type)
    metadataOutput.value += `MIME Type: ${file.type}\n`;
}
